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
const CHAESA_LIVE_SYSTEM_PROMPT = `Kamu adalah Chaesa, asisten AI yang attentive dan agentic untuk platform Chaesa Live - platform video meeting berbasis AI untuk kreator.

**Tentang Chaesa Live:**
Chaesa Live itu platform video conferencing yang beda dari yang lain karena punya:
1. AI Course Factory - Ubah meeting 2 jam jadi 20 modul micro-learning (5-7 menit) dengan auto-generate slides, quiz, podcast, dan ebook
2. Live Sales CTA - Sistem live commerce ala TikTok Shop (push tombol "Beli Sekarang" ke semua viewer pas webinar)
3. Studio Mode - Mode khusus buat YouTuber/streamer (hide semua UI buat OBS capture)
4. Original Sound - Fix masalah audio robotik pas pake OBS/mixer eksternal
5. Micro-Learning Marketplace - Jual kursus dengan komisi 30% (vs 50% di Udemy)

**Harga:**
- Gratis: Limit 40 menit, 100 peserta, fitur basic
- Pro: Rp 69.000/bulan - Unlimited meeting, AI features, Live Sales CTA, Studio Mode
- Business: Rp 99.000/bulan - 300 peserta, advanced analytics, custom branding
- 1 Tahun: Rp 499.000 - Semua fitur Pro selama 1 tahun penuh

**Keunggulan:**
- 71% lebih murah dari Zoom (Zoom Pro = Rp 240.000/bulan)
- Satu-satunya platform dengan AI auto-chunking (kayak NotebookLM tapi buat video)
- Satu-satunya platform dengan live commerce built-in
- OBS-friendly tanpa masalah audio

**Persona Kamu (Chaesa):**
- Attentive: Selalu dengerin baik-baik, paham konteks pembicaraan
- Agentic: Proaktif kasih solusi, nggak cuma jawab pertanyaan aja
- Akrab: Pake bahasa Indonesia santai, campur bahasa gaul/daerah yang natural
- Detail: Jelasin secara teknis tapi tetep gampang dipahami
- Helpful: Kasih saran, masukan, tips yang relevan
- Smart: Ngerti kapan harus serius, kapan bisa lebih santai

**Cara Bicara:**
- Sapaan: "Halo kak!", "Hai bro!", "Wah", "Mantap", "Keren"
- Bahasa gaul: "gue/lu", "udah", "emang", "banget", "nih", "deh", "sih"
- Emoji: Pake secukupnya (1-2 per pesan), jangan berlebihan
- Tone: Serius tapi santai, kayak temen yang ngerti banget
- Panjang: Jelas dan lengkap, tapi nggak bertele-tele

**Kapan Escalate ke Human:**
- Komplain serius (billing dispute, bug critical)
- Request fitur enterprise yang kompleks
- Legal/compliance questions
- User bilang "mau ngobrol sama manusia"

**Jangan:**
- Pake bahasa terlalu formal (kecuali user formal)
- Berlebihan pake emoji
- Ngasih info yang nggak yakin (better bilang "gue cek dulu ya")
- Ignore konteks percakapan sebelumnya

Inget: Kamu bukan cuma bot, tapi partner yang membantu user sukses pake Chaesa Live!`;

/**
 * Detect if conversation needs escalation to human support
 */
function detectEscalation(userMessage: string, botReply: string): boolean {
  const escalationKeywords = [
    "ngomong sama manusia",
    "bicara langsung",
    "mau komplain",
    "refund",
    "batal langganan",
    "bug parah",
    "error terus",
    "gak bisa",
    "broken",
    "legal",
    "hukum",
  ];

  const userLower = userMessage.toLowerCase();
  const botLower = botReply.toLowerCase();

  // Check if user explicitly asks for human
  if (escalationKeywords.some((keyword) => userLower.includes(keyword))) {
    return true;
  }

  // Check if bot indicates uncertainty
  if (
    botLower.includes("gue kurang tau") ||
    botLower.includes("gue gak yakin") ||
    botLower.includes("hubungi support")
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
  if (lower.includes("harga") || lower.includes("biaya") || lower.includes("paket")) {
    return [
      "Pro plan dapet apa aja?",
      "Paket 1 tahun gimana?",
      "Banding sama Zoom gimana?",
    ];
  }

  if (lower.includes("ai") || lower.includes("kursus") || lower.includes("generate")) {
    return [
      "AI Course Factory cara kerjanya?",
      "Berapa lama proses AI-nya?",
      "Bisa export format apa aja?",
    ];
  }

  if (lower.includes("obs") || lower.includes("audio") || lower.includes("studio")) {
    return [
      "Cara aktifin Studio Mode?",
      "Fix masalah audio OBS",
      "Original Sound mode itu apa?",
    ];
  }

  if (lower.includes("jual") || lower.includes("cta") || lower.includes("duit")) {
    return [
      "Live Sales CTA gimana?",
      "Cara push CTA ke viewer?",
      "Komisi marketplace berapa?",
    ];
  }

  // Default suggestions
  return [
    "Cara mulai meeting pertama?",
    "Fitur unggulan apa aja?",
    "Harga paketnya gimana?",
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
    lowerMessage.match(/^(hi|hello|hey|halo|hai|hola|p)\b/) ||
    lowerMessage === "hi" ||
    lowerMessage === "hello" ||
    lowerMessage === "halo"
  ) {
    return "Halo kak! 👋 Gue Chaesa, asisten AI lu di sini.\n\nGue bisa bantu lu soal:\n\n• Penjelasan fitur Chaesa Live\n• Info harga & paket langganan\n• Tutorial cara pake platform\n• Troubleshooting masalah teknis\n• Saran & tips biar maksimal hasilnya\n\nMau tanya apa nih? Santai aja, gue siap bantu! 😊";
  }

  // What is Chaesa Live?
  if (
    lowerMessage.includes("apa itu chaesa") ||
    lowerMessage.includes("what is chaesa") ||
    lowerMessage.includes("tentang chaesa") ||
    lowerMessage.includes("chaesa itu apa")
  ) {
    return "Oke gue jelasin ya kak! 🚀\n\nChaesa Live tuh platform video meeting yang beda banget dari Zoom atau Google Meet. Kenapa? Karena kita punya:\n\n📹 Meeting Video\n• Unlimited peserta (tergantung paket)\n• Kualitas HD, stabil\n• Gampang banget dipake\n\n🤖 AI Course Factory\n• Rekam meeting → AI otomatis bikin jadi kursus\n• Auto-generate slides, quiz, podcast, ebook\n• Hemat 90% waktu editing!\n\n💰 Live Sales CTA\n• Push tombol 'Beli' langsung ke layar viewer\n• Kayak TikTok Shop tapi buat webinar\n• Konversi naik 3-5x lipat!\n\n🎬 Studio Mode\n• Khusus buat YouTuber/streamer\n• Hide semua UI buat OBS capture\n• Audio bersih tanpa gangguan\n\nIntinya: Chaesa Live = Zoom + AI Content Creator + Live Commerce jadi satu! 🔥\n\nPlusnya? 71% lebih murah dari Zoom!\n\nMau tau lebih detail fitur yang mana nih?";
  }

  // Pricing questions
  if (
    lowerMessage.includes("harga") ||
    lowerMessage.includes("biaya") ||
    lowerMessage.includes("paket") ||
    lowerMessage.includes("price") ||
    lowerMessage.includes("berapa")
  ) {
    return "Oke nih gue kasih tau lengkapnya! 💰\n\n┌─────────────┬──────────────────────────────────────────┐\n│ Paket       │ Detail                                   │\n├─────────────┼──────────────────────────────────────────┤\n│ 🆓 GRATIS   │ Rp 0/bulan                               │\n│             │ • Limit 40 menit per meeting             │\n│             │ • Max 100 peserta                        │\n│             │ • Fitur basic aja                        │\n├─────────────┼──────────────────────────────────────────┤\n│ ⭐ PRO      │ Rp 69.000/bulan                          │\n│             │ • Meeting UNLIMITED (gak ada limit!)     │\n│             │ • AI Course Generator                    │\n│             │ • Live Sales CTA                         │\n│             │ • Studio Mode                            │\n├─────────────┼──────────────────────────────────────────┤\n│ 🚀 BUSINESS │ Rp 99.000/bulan                          │\n│             │ • Semua fitur Pro                        │\n│             │ • Max 300 peserta                        │\n│             │ • Analytics advanced                     │\n│             │ • Custom branding                        │\n├─────────────┼──────────────────────────────────────────┤\n│ 💎 1 TAHUN  │ Rp 499.000 (bayar sekali)                │\n│             │ • Semua fitur Pro selama 1 tahun penuh   │\n│             │ • Hemat 35% vs bayar bulanan!            │\n│             │ • Slot terbatas!                         │\n└─────────────┴──────────────────────────────────────────┘\n\nBandingkan sama Zoom:\n• Zoom Pro: Rp 240.000/bulan\n• Chaesa Pro: Rp 69.000/bulan\n• HEMAT: 71%! 🔥\n\nBelum lagi kita punya fitur AI & Live Commerce yang Zoom gak punya sama sekali!\n\nMau langsung coba? Atau mau tau lebih detail paket yang mana?";
  }

  // AI Features
  if (
    lowerMessage.includes("ai") ||
    lowerMessage.includes("kursus") ||
    lowerMessage.includes("course") ||
    lowerMessage.includes("generate") ||
    lowerMessage.includes("otomatis")
  ) {
    return "Wah, ini nih fitur andalannya! AI Course Factory kita tuh kayak punya asisten pribadi yang jagoan editing. 🤖✨\n\nGini cara kerjanya:\n\n1. Lu rekam meeting (bebas berapa jam)\n2. AI langsung kerja, potong-potong jadi modul 5-7 menit\n3. Otomatis bikin:\n   • Slides PowerPoint 📊\n   • PDF ebook & study guide 📖\n   • Quiz + penjelasan jawaban ✅\n   • Podcast 2 host (kayak NotebookLM!) 🎙️\n   • Klip pendek buat TikTok/Reels 📱\n\nBiasanya kalau manual:\n• Download rekaman: 30 menit\n• Transcribe: 2 jam\n• Edit & potong: 5 jam\n• Bikin slides: 3 jam\n• Bikin quiz: 2 jam\nTOTAL: 12+ jam! 😵\n\nPake Chaesa AI:\n• Klik 1 tombol aja\n• Tunggu 15 menit\n• Beres! 🚀\n\nHEMAT: 90% waktu lu!\n\nGue jelasin lebih teknis atau mau langsung coba?";
  }

  // Studio Mode / OBS
  if (
    lowerMessage.includes("studio") ||
    lowerMessage.includes("obs") ||
    lowerMessage.includes("stream") ||
    lowerMessage.includes("audio") ||
    lowerMessage.includes("youtuber")
  ) {
    return "Nah ini nih fitur yang bikin para YouTuber & streamer seneng banget! 🎬\n\nJadi gini masalahnya:\n• Zoom + OBS = audio robotik, sering putus-putus\n• Google Meet = UI nya keliatan di stream, jelek\n• Setup ribet, bikin pusing\n\nChaesa Studio Mode solusinya:\n\n1. Join meeting kayak biasa\n2. Tekan Ctrl+Shift+U (atau klik tombol Studio Mode)\n3. BOOM! Semua UI langsung hilang (bersih buat OBS)\n4. Aktifin 'Original Sound' di Audio Settings\n5. Selesai! Audio jernih tanpa processing 🎵\n\nCocok buat:\n• Live streaming YouTube/Twitch\n• Recording podcast\n• Webinar profesional\n• Broadcast TV\n\nFitur teknis:\n• Bypass audio processing (raw audio)\n• Hide semua overlay & control\n• Shortcut keyboard biar cepet\n• Gak conflict sama audio mixer eksternal\n\nMau gue kasih tutorial lengkapnya? Atau ada masalah audio spesifik yang mau lu fix?";
  }

  // Live Sales CTA
  if (
    lowerMessage.includes("cta") ||
    lowerMessage.includes("jual") ||
    lowerMessage.includes("sales") ||
    lowerMessage.includes("monetisasi") ||
    lowerMessage.includes("duit") ||
    lowerMessage.includes("konversi")
  ) {
    return "Nah ini dia game changer buat yang jualan online! Live Sales CTA itu senjata rahasia buat naikin konversi 3-5x lipat. 💰🔥\n\nBayangin gini:\n\nCara Lama:\n❌ Lu webinar, kasih link di chat\n❌ Peserta males klik\n❌ Lupa begitu meeting selesai\n❌ Konversi cuma 1-2%\n\nPake Chaesa Live Sales CTA:\n✅ Lu demo produk live\n✅ Tekan tombol 'Push CTA'\n✅ Tombol 'BELI SEKARANG' muncul di layar SEMUA viewer!\n✅ Countdown timer bikin FOMO\n✅ Klik langsung ke checkout\n✅ Konversi naik jadi 5-8%! 🚀\n\nFitur lengkapnya:\n• Push CTA ke semua viewer sekaligus\n• Countdown timer (ciptain urgency)\n• Tracking real-time (berapa yang klik)\n• Customizable (warna, teks, posisi)\n• Direct checkout via Midtrans\n\nKayak TikTok Shop tapi lebih powerful karena:\n1. Lu bisa jelasin produk dulu (build trust)\n2. Live demo bikin lebih yakin\n3. Impulse buying pas lagi hot-hot nya!\n\nCocok banget buat:\n• Live product demo\n• Course launch webinar\n• E-commerce broadcast\n• Flash sale event\n\nMau setup sekarang atau mau tips biar konversinya maksimal?";
  }

  // Getting started
  if (
    lowerMessage.includes("cara mulai") ||
    lowerMessage.includes("cara pakai") ||
    lowerMessage.includes("getting started") ||
    lowerMessage.includes("bikin meeting") ||
    lowerMessage.includes("tutorial")
  ) {
    return "Gampang banget kok kak! Gue bantuin step by step ya. 🚀\n\nAda 2 cara:\n\nCara 1: Bikin Meeting Baru\n1. Buka homepage Chaesa Live\n2. Klik 'Start New Meeting'\n3. Boom! Meeting room langsung kebuka\n4. Share kode meeting ke temen/peserta\n5. Mereka tinggal masukin kode → Join\n\nCara 2: Join Meeting yang Udah Ada\n1. Minta kode meeting dari host\n2. Masukin kode di homepage\n3. Klik 'Join Meeting'\n4. Selesai!\n\nTips Biar Lancar:\n• Test kamera & mic dulu sebelum meeting penting\n• Pake Chrome/Edge (paling stabil)\n• Internet minimal 5 Mbps\n• Kalau mau live streaming, aktifin Studio Mode\n\nButuh bantuan setup yang lain?\n• Cara record meeting?\n• Cara aktifin AI Course Generator?\n• Cara push CTA ke viewer?\n\nTinggal bilang aja, gue bantuin! 😊";
  }

  // Troubleshooting
  if (
    lowerMessage.includes("gak bisa") ||
    lowerMessage.includes("tidak bisa") ||
    lowerMessage.includes("error") ||
    lowerMessage.includes("masalah") ||
    lowerMessage.includes("rusak") ||
    lowerMessage.includes("broken") ||
    lowerMessage.includes("help")
  ) {
    return "Waduh, ada kendala ya kak? Tenang, gue bantuin fix sekarang! 🔧\n\nIni solusi masalah yang paling sering:\n\nKamera Gak Muncul:\n• Cek permission browser (allow camera access)\n• Coba browser lain (Chrome paling oke)\n• Restart device lu\n• Cek antivirus (kadang block camera)\n\nMasalah Audio:\n• Aktifin 'Original Sound' mode\n• Cek permission microphone\n• Tutup app lain yang pake mic (Zoom, Discord, dll)\n• Kalau pake OBS: Enable Studio Mode\n• Test di meeting test dulu\n\nKoneksi Putus-Putus:\n• Cek speed internet (min 5 Mbps)\n• Matiin VPN sementara\n• Pindah ke WiFi yang lebih stabil\n• Kurangin jumlah tab browser\n\nAI Gak Bisa Generate Course:\n• Pastiin meeting udah di-record\n• Tunggu 2-3 menit buat processing\n• Cek paket lu (harus Pro/Business/1 Tahun)\n• Kalau masih error, screenshot & hubungi gue\n\nMasalah Spesifik Lu Apa?\nKasih tau detail errornya, gue cariin solusinya! 💪";
  }

  // Features comparison
  if (
    lowerMessage.includes("vs zoom") ||
    lowerMessage.includes("banding") ||
    lowerMessage.includes("compare") ||
    lowerMessage.includes("beda") ||
    lowerMessage.includes("lebih bagus")
  ) {
    return "Good question! Gue jelasin perbedaannya ya. 💪\n\nChaesa Live vs Zoom:\n\n┌──────────────────────┬──────────────┬──────────────┐\n│ Fitur                │ Chaesa Live  │ Zoom         │\n├──────────────────────┼──────────────┼──────────────┤\n│ Harga/bulan          │ Rp 69.000    │ Rp 240.000   │\n│ Hemat berapa?        │ 71% murah!   │ -            │\n│ AI Course Generator  │ ✅ Ada       │ ❌ Gak ada   │\n│ Live Sales CTA       │ ✅ Ada       │ ❌ Gak ada   │\n│ Studio Mode          │ ✅ Gampang   │ ⚠️ Ribet     │\n│ Original Sound       │ ✅ 1 klik    │ ⚠️ Setup lama│\n│ Course Marketplace   │ ✅ Komisi 30%│ ❌ Gak ada   │\n│ Micro-Learning       │ ✅ Built-in  │ ❌ Gak ada   │\n└──────────────────────┴──────────────┴──────────────┘\n\nYang Zoom Unggul:\n• Brand gede (lebih terkenal)\n• Integrasi enterprise lebih banyak\n• User base lebih luas\n\nYang Chaesa Unggul:\n• JAUH lebih murah (71%!)\n• Fitur AI content creation\n• Live commerce built-in\n• OBS-friendly tanpa ribet\n• Fokus ke kreator & educator\n\nKesimpulan:\nKalau lu:\n• Kreator konten → Chaesa 100%\n• Jualan online → Chaesa\n• Bikin kursus → Chaesa\n• YouTuber/Streamer → Chaesa\n• Butuh enterprise complex → Zoom\n\nIntinya: Chaesa = Zoom + AI + Live Commerce dengan harga 1/3 nya! 🔥\n\nMau coba langsung atau mau tau detail fitur lainnya?";
  }

  // Payment/billing
  if (
    lowerMessage.includes("bayar") ||
    lowerMessage.includes("payment") ||
    lowerMessage.includes("billing") ||
    lowerMessage.includes("transfer") ||
    lowerMessage.includes("kartu kredit")
  ) {
    return "Oke gue jelasin cara bayarnya ya kak! 💳\n\nMetode Pembayaran:\n✅ Kartu Kredit/Debit (Visa, Mastercard, JCB)\n✅ Transfer Bank (Semua bank major Indonesia)\n✅ E-Wallet (GoPay, OVO, Dana, ShopeePay)\n✅ QRIS (Scan & bayar, gampang!)\n✅ Indomaret/Alfamart (bayar cash di toko)\n\nCara Langganan:\n1. Pilih paket (Gratis/Pro/Business/1 Tahun)\n2. Klik 'Subscribe Now'\n3. Pilih metode pembayaran\n4. Selesain pembayaran\n5. Akun langsung auto-upgrade! 🚀\n\nKeamanan:\n• Proses bayar pake Midtrans (certified secure)\n• Data kartu TIDAK disimpen di server kita\n• Enkripsi SSL/TLS\n• Garansi uang kembali 7 hari\n\nTips:\n• Paket 1 Tahun hemat 35% vs bayar bulanan!\n• Bisa cancel kapan aja (no penalty)\n• Invoice otomatis dikirim ke email\n• Reminder sebelum jatuh tempo\n\nAda pertanyaan soal billing atau mau langsung subscribe?";
  }

  // Contact/support
  if (
    lowerMessage.includes("kontak") ||
    lowerMessage.includes("hubungi") ||
    lowerMessage.includes("contact") ||
    lowerMessage.includes("manusia") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("cs")
  ) {
    return "Siap kak! Gue hubungin ke tim support ya. 👨‍💼\n\nPilihan Support:\n\n📧 Email: support@chaesa.live\n⏰ Response: Max 24 jam (biasanya lebih cepet)\n📝 Cocok buat: Pertanyaan detail, komplain, bug report\n\n💬 Live Chat: Senin-Jumat, 09:00 - 17:00 WIB\n⚡ Response: Real-time (langsung bales)\n📝 Cocok buat: Masalah urgent, tutorial langsung\n\n📱 Discord Community: 24/7\n🤝 Response: Dari user lain & tim (varies)\n📝 Cocok buat: Diskusi tips, networking, tanya user lain\n\n🎥 Tutorial YouTube: Kapan aja\n📺 Free tutorial lengkap\n📝 Cocok buat: Belajar sendiri step-by-step\n\nMau gue escalate ke human agent sekarang?\nAtau ada yang bisa gue bantuin dulu? 😊";
  }

  // Default response with suggestions
  return "Hmm, pertanyaan lu menarik nih! 🤔\n\nGue lagi cari jawaban yang paling pas buat lu. Sementara itu, ini beberapa hal yang sering ditanyain:\n\n🎯 Tentang Chaesa Live\n• Platform video meeting + AI content creator\n• Lebih murah 71% dari Zoom\n• Fitur live commerce built-in\n\n💰 Info Harga\n• Gratis: Basic features\n• Pro: Rp 69K/bulan (unlimited!)\n• 1 Tahun: Rp 499K (hemat 35%)\n\n🚀 Fitur Unggulan\n• AI Course Factory (auto-generate kursus)\n• Live Sales CTA (push CTA ke viewer)\n• Studio Mode (OBS-friendly)\n\n🔧 Bantuan Teknis\n• Tutorial setup meeting\n• Fix masalah audio/video\n• Tips & tricks biar maksimal\n\nMau tanya lebih spesifik yang mana? Atau gue jelasin dari awal? Santai aja, gue siap bantu! 💪";
}