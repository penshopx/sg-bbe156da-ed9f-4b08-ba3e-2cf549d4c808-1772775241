import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * AI Chatbot API - Process user questions
 * Uses OpenAI GPT-4 with Chaesa Live knowledge base
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, message, userId } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get conversation history for context
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10); // Last 10 messages for context

    // Build conversation history
    const conversationHistory = messages
      ?.map((msg) => ({
        role: msg.sender_type === "user" ? "user" : "assistant",
        content: msg.message_text,
      })) || [];

    let botReply: string;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // Check if OpenAI API key is available
    if (openaiApiKey && openaiApiKey !== "your_openai_api_key_here") {
      // Use real OpenAI API
      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: CHAESA_LIVE_SYSTEM_PROMPT,
              },
              ...conversationHistory,
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error("OpenAI API error");
        }

        const openaiData = await openaiResponse.json();
        botReply = openaiData.choices[0].message.content;
      } catch (error) {
        console.error("OpenAI API error, falling back to mock:", error);
        botReply = generateMockResponse(message);
      }
    } else {
      // Use mock intelligent responses (for testing without API key)
      botReply = generateMockResponse(message);
    }

    // Detect if question needs human support
    const needsHumanSupport = detectEscalation(message, botReply);

    // Suggest related articles
    const relatedArticles = await searchRelevantArticles(message);

    // Save bot response to database
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "bot",
      message_text: botReply,
      message_metadata: {
        needs_escalation: needsHumanSupport,
        related_articles: relatedArticles,
      },
    });

    return res.status(200).json({
      reply: botReply,
      needs_escalation: needsHumanSupport,
      related_articles: relatedArticles,
      quick_replies: generateQuickReplies(message),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Failed to process message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Chaesa Live AI Assistant System Prompt
 */
const CHAESA_LIVE_SYSTEM_PROMPT = `You are Chaesa AI Assistant, a helpful and friendly support bot for Chaesa Live - an AI-powered meeting platform for creators.

**About Chaesa Live:**
Chaesa Live is a revolutionary video conferencing platform that combines:
1. **AI Course Factory** - Transform 2-hour meetings into 20 micro-learning modules (5-7 min each) with auto-generated slides, quizzes, podcasts, and ebooks
2. **Live Sales CTA** - TikTok Shop-style live commerce (push "Buy Now" buttons to viewers during webinars)
3. **Studio Mode** - OBS-friendly mode (hide all UI for clean streaming)
4. **Original Sound** - Fix audio issues when using OBS/external audio mixers
5. **Micro-Learning Marketplace** - Sell courses with 30% commission (vs 50% on Udemy)

**Pricing:**
- Free: 40-minute limit, 100 participants, basic features
- Pro: Rp 69,000/month - Unlimited time, AI features, Live Sales CTA, Studio Mode
- Business: Rp 99,000/month - 300 participants, advanced analytics, custom branding
- Lifetime: Rp 499,000 one-time - All Pro features forever

**Key Differentiators:**
- 71% cheaper than Zoom (Zoom Pro = Rp 240,000/month)
- Only platform with AI auto-chunking (like NotebookLM for video)
- Only platform with in-meeting live commerce
- OBS-friendly (zero audio conflicts)

**Your Role:**
- Answer questions about features, pricing, how-to
- Provide step-by-step guidance
- Troubleshoot common issues
- Be friendly, concise, and helpful
- Use emojis sparingly (1-2 per message)
- If you don't know something, say so and offer to connect them with support
- Detect when users need human support (complex issues, billing disputes, bugs)

**Tone:**
Professional yet friendly, like talking to a helpful colleague. Keep responses under 150 words unless detailed explanation is needed.`;

/**
 * Detect if conversation needs escalation to human support
 */
function detectEscalation(userMessage: string, botReply: string): boolean {
  const escalationKeywords = [
    "speak to human",
    "talk to support",
    "real person",
    "not working",
    "bug",
    "broken",
    "refund",
    "cancel subscription",
    "billing issue",
    "charge me",
    "lawsuit",
    "legal",
  ];

  const userLower = userMessage.toLowerCase();
  const botLower = botReply.toLowerCase();

  // Check if user explicitly asks for human
  if (escalationKeywords.some((keyword) => userLower.includes(keyword))) {
    return true;
  }

  // Check if bot indicates uncertainty
  if (
    botLower.includes("i don't know") ||
    botLower.includes("i'm not sure") ||
    botLower.includes("contact support")
  ) {
    return true;
  }

  return false;
}

/**
 * Search for relevant knowledge base articles
 */
async function searchRelevantArticles(query: string): Promise<any[]> {
  // Extract keywords from query
  const keywords = query
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 3);

  if (keywords.length === 0) return [];

  const { data } = await supabase
    .from("helpdesk_articles")
    .select("id, title, category")
    .eq("is_published", true)
    .or(keywords.map((k) => `title.ilike.%${k}%`).join(","))
    .limit(3);

  return data || [];
}

/**
 * Generate contextual quick reply suggestions
 */
function generateQuickReplies(userMessage: string): string[] {
  const lower = userMessage.toLowerCase();

  // Context-based suggestions
  if (lower.includes("price") || lower.includes("cost") || lower.includes("plan")) {
    return [
      "What's included in Pro plan?",
      "How does Lifetime deal work?",
      "Compare with Zoom pricing",
    ];
  }

  if (lower.includes("ai") || lower.includes("course") || lower.includes("generate")) {
    return [
      "How does AI Course Factory work?",
      "How long does AI generation take?",
      "What formats can I export?",
    ];
  }

  if (lower.includes("obs") || lower.includes("audio") || lower.includes("studio")) {
    return [
      "How to enable Studio Mode?",
      "Fix audio issues with OBS",
      "What is Original Sound mode?",
    ];
  }

  if (lower.includes("sell") || lower.includes("cta") || lower.includes("money")) {
    return [
      "How does Live Sales CTA work?",
      "How to push CTA to viewers?",
      "What's the marketplace commission?",
    ];
  }

  // Default suggestions
  return [
    "How to start my first meeting?",
    "What are the main features?",
    "How does pricing work?",
  ];
}

/**
 * Generate intelligent mock responses based on common questions
 * (Used when OpenAI API key is not available)
 */
function generateMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Greeting patterns
  if (
    lowerMessage.match(/^(hi|hello|hey|halo|hai)\b/) ||
    lowerMessage === "hi" ||
    lowerMessage === "hello"
  ) {
    return "Hi there! 👋 I'm Chaesa AI Assistant. I'm here to help you with:\n\n• Understanding what Chaesa Live is\n• Learning how to use our features\n• Troubleshooting issues\n• Pricing & billing questions\n\nWhat would you like to know?";
  }

  // What is Chaesa Live?
  if (
    lowerMessage.includes("what is chaesa") ||
    lowerMessage.includes("apa itu chaesa") ||
    lowerMessage.includes("about chaesa")
  ) {
    return "Chaesa Live is an AI-powered video conferencing platform designed for creators & educators. 🚀\n\n**Key Features:**\n• 📹 Video meetings (100+ participants)\n• 🤖 AI Course Generator (turn meetings into courses)\n• 💰 Live Sales CTA (monetize webinars)\n• 🎬 Studio Mode (OBS-friendly)\n\nWe're 71% cheaper than Zoom while offering 10x more features!\n\nWould you like to learn more about any specific feature?";
  }

  // Pricing questions
  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("harga") ||
    lowerMessage.includes("plan") ||
    lowerMessage.includes("subscription")
  ) {
    return "Great question! Chaesa Live has 4 pricing tiers:\n\n**🆓 FREE:** Rp 0/month\n• 40 min meeting limit\n• 100 participants\n• Basic features\n\n**⭐ PRO:** Rp 69.000/month\n• Unlimited meetings\n• AI Course Generator\n• Live Sales CTA\n• Studio Mode\n\n**🚀 BUSINESS:** Rp 99.000/month\n• Everything in Pro\n• 300 participants\n• Advanced analytics\n• Custom branding\n\n**💎 LIFETIME:** Rp 499.000 (one-time)\n• All Pro features forever\n• Limited availability\n\nWe're 71% cheaper than Zoom! 💰\n\nWhich plan interests you most?";
  }

  // AI Features
  if (
    lowerMessage.includes("ai") ||
    lowerMessage.includes("course") ||
    lowerMessage.includes("generate") ||
    lowerMessage.includes("automation")
  ) {
    return "Our AI Course Factory is like NotebookLM for video! 🤖✨\n\n**Here's how it works:**\n1. Record your meeting (any length)\n2. AI automatically chunks into 5-7 min modules\n3. Generates:\n   • PowerPoint slides 📊\n   • PDF ebooks & study guides 📖\n   • Quizzes with explanations ✅\n   • AI podcast (2-host conversation) 🎙️\n   • Social media clips (TikTok/Reels) 📱\n\n**Time Saved:** 90% (20 hours → 2 hours)\n\nWant to see a demo?";
  }

  // Studio Mode / OBS
  if (
    lowerMessage.includes("studio") ||
    lowerMessage.includes("obs") ||
    lowerMessage.includes("stream") ||
    lowerMessage.includes("audio issue") ||
    lowerMessage.includes("audio problem")
  ) {
    return "Studio Mode is perfect for content creators! 🎬\n\n**How to use:**\n1. Join your meeting\n2. Press **Ctrl+Shift+U** (or click Studio Mode button)\n3. All UI elements disappear (clean feed for OBS)\n4. Enable 'Original Sound' in Audio Settings\n5. Zero audio conflicts! 🎵\n\n**Perfect for:**\n• YouTubers & streamers\n• Podcast recordings\n• Professional broadcasts\n\nThis fixes the common \"robotic audio\" issue with Zoom + OBS!\n\nNeed help setting it up?";
  }

  // Live Sales CTA
  if (
    lowerMessage.includes("cta") ||
    lowerMessage.includes("sell") ||
    lowerMessage.includes("sales") ||
    lowerMessage.includes("monetize") ||
    lowerMessage.includes("conversion")
  ) {
    return "Live Sales CTA works like TikTok Shop for webinars! 💰\n\n**How it works:**\n1. During your live webinar/demo\n2. Push \"Buy Now\" button to ALL viewers' screens\n3. Add FOMO countdown timer ⏱️\n4. Direct to checkout page\n5. Real-time click tracking 📊\n\n**Result:** 3-5x higher conversion vs traditional \"link in chat\"\n\nThis is PERFECT for:\n• Live product demos\n• Course launches\n• Webinar sales\n• E-commerce broadcasts\n\nWant to see how to set it up?";
  }

  // Getting started
  if (
    lowerMessage.includes("how to start") ||
    lowerMessage.includes("getting started") ||
    lowerMessage.includes("first meeting") ||
    lowerMessage.includes("create meeting") ||
    lowerMessage.includes("cara mulai")
  ) {
    return "Getting started is super easy! 🚀\n\n**Option 1: Start New Meeting**\n1. Click \"Start New Meeting\" on homepage\n2. Meeting room opens instantly\n3. Share meeting code with participants\n\n**Option 2: Join Existing Meeting**\n1. Get meeting code from host\n2. Enter code on homepage\n3. Click \"Join Meeting\"\n\n**Pro Tips:**\n• Test your camera/mic before joining\n• Use Chrome/Edge for best experience\n• Enable Studio Mode if streaming to OBS\n\nReady to create your first meeting?";
  }

  // Troubleshooting
  if (
    lowerMessage.includes("not working") ||
    lowerMessage.includes("error") ||
    lowerMessage.includes("problem") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("fix") ||
    lowerMessage.includes("help")
  ) {
    return "I'm here to help troubleshoot! 🔧\n\n**Common issues & fixes:**\n\n**Camera not working:**\n• Check browser permissions (allow camera access)\n• Try different browser (Chrome recommended)\n• Restart your device\n\n**Audio issues:**\n• Enable 'Original Sound' mode\n• Check microphone permissions\n• Disable other apps using mic\n\n**Connection problems:**\n• Check internet speed (minimum 5 Mbps)\n• Disable VPN temporarily\n• Try different network\n\n**Can't generate course:**\n• Ensure meeting was recorded\n• Wait 2-3 minutes for processing\n• Check subscription plan (Pro required)\n\nWhat specific issue are you facing?";
  }

  // Features comparison
  if (
    lowerMessage.includes("vs zoom") ||
    lowerMessage.includes("compare") ||
    lowerMessage.includes("difference") ||
    lowerMessage.includes("better than")
  ) {
    return "Great question! Here's how we compare to Zoom:\n\n**Chaesa Live vs Zoom:**\n\n✅ **Price:** 71% cheaper (Rp 69K vs Rp 240K/month)\n✅ **AI Course Generator:** We have it, Zoom doesn't\n✅ **Live Sales CTA:** We have it, Zoom doesn't\n✅ **Studio Mode:** We have it, Zoom makes it complex\n✅ **Original Sound:** One toggle vs complex setup\n✅ **Marketplace:** Built-in course sales (30% commission vs Udemy's 50%)\n\n**What Zoom has:**\n• Larger enterprise features\n• More integrations\n• Bigger brand recognition\n\n**Best for:** Creators, educators, live sellers, content creators\n\nMakes sense?";
  }

  // Payment/billing
  if (
    lowerMessage.includes("payment") ||
    lowerMessage.includes("billing") ||
    lowerMessage.includes("pay") ||
    lowerMessage.includes("card") ||
    lowerMessage.includes("transfer")
  ) {
    return "We accept multiple payment methods! 💳\n\n**Available options:**\n• Credit/Debit Cards (Visa, Mastercard)\n• Bank Transfer (All major banks)\n• E-Wallets (GoPay, OVO, Dana)\n• QRIS Payment\n\n**How to subscribe:**\n1. Choose your plan (Free, Pro, Business, Lifetime)\n2. Click \"Subscribe Now\"\n3. Select payment method\n4. Complete payment\n5. Account upgraded instantly!\n\n**Secure Payment:**\n• Processed by Midtrans (certified secure)\n• No card details stored on our servers\n• 7-day money-back guarantee\n\nReady to upgrade?";
  }

  // Contact/support
  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("human") ||
    lowerMessage.includes("talk to") ||
    lowerMessage.includes("speak to")
  ) {
    return "I'd be happy to connect you with our support team! 👨‍💼\n\n**Support Options:**\n\n📧 **Email:** support@chaesa.live\n⏰ **Response time:** Within 24 hours\n\n💬 **Live Chat:** Available Mon-Fri, 9 AM - 5 PM WIB\n\n📱 **Community:** Join our Discord for peer support\n\nWould you like me to escalate your question to a human agent now?";
  }

  // Default response with suggestions
  return `I'd be happy to help! While I search for the best answer, here are some topics I can assist with:\n\n• **About Chaesa Live** - What we do & how we're different\n• **Features** - AI Course Factory, Live Sales CTA, Studio Mode\n• **Pricing** - Plans & billing\n• **Getting Started** - How to create/join meetings\n• **Troubleshooting** - Common issues & fixes\n• **Technical Support** - OBS setup, audio/video issues\n\nCould you tell me more about what you're looking for? Or feel free to ask any specific question! 😊`;
}