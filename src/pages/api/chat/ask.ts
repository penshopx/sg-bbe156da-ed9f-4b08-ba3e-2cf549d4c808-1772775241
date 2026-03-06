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

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
    const botReply = openaiData.choices[0].message.content;

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