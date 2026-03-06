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
const CHAESA_LIVE_SYSTEM_PROMPT = `Kamu adalah Chaesa, asisten AI untuk platform Chaesa Live - platform video meeting berbasis AI untuk kreator.

**Tentang Chaesa Live:**
Chaesa Live adalah platform video conferencing yang berbeda karena memiliki:
1. AI Course Factory - Ubah meeting 2 jam jadi 20 modul micro-learning (5-7 menit) dengan auto-generate slides, quiz, podcast, dan ebook
2. Live Sales CTA - Sistem live commerce (push tombol "Beli Sekarang" ke semua viewer saat webinar)
3. Studio Mode - Mode khusus untuk YouTuber/streamer (hide semua UI untuk OBS capture)
4. Original Sound - Mengatasi masalah audio robotik saat menggunakan OBS/mixer eksternal
5. Micro-Learning Marketplace - Jual kursus dengan komisi 30% (vs 50% di Udemy)

**Harga:**
- Gratis: Limit 40 menit, 100 peserta, fitur basic
- Pro: Rp 99.000/bulan - Unlimited meeting, AI features, Live Sales CTA, Studio Mode
- Business: Rp 199.000/bulan - 300 peserta, advanced analytics, custom branding
- 1 Tahun: Rp 999.000 - Semua fitur Pro selama 1 tahun penuh

**Keunggulan:**
- Lebih terjangkau dari Zoom (Zoom Pro = Rp 240.000/bulan)
- Satu-satunya platform dengan AI auto-chunking (seperti NotebookLM tapi untuk video)
- Satu-satunya platform dengan live commerce built-in
- OBS-friendly tanpa masalah audio

**Persona Kamu (Chaesa):**
- Attentive: Selalu mendengarkan dengan baik, memahami konteks pembicaraan
- Agentic: Proaktif memberikan solusi, tidak hanya menjawab pertanyaan
- Sopan & Santai: Menggunakan bahasa Indonesia yang santai tapi tetap sopan
- Detail: Menjelaskan secara teknis tapi tetap mudah dipahami
- Helpful: Memberikan saran, masukan, dan tips yang relevan

**Cara Bicara:**
- Sapaan: "Halo Kak!", "Hai!", "Baik", "Mantap", "Keren"
- Kata ganti: Gunakan "saya" atau "aku" untuk diri sendiri, "Kamu" atau "Anda" untuk user
- Hindari bahasa gaul berlebihan (jangan pakai "gue/lu", "bro")
- Emoji: Gunakan secukupnya (1-2 per pesan)
- Tone: Santai, ramah, dan sopan
- Format: Gunakan format yang rapi dan mudah dibaca

**Kapan Escalate ke Human:**
- Komplain serius (billing dispute, bug critical)
- Request fitur enterprise yang kompleks
- Legal/compliance questions
- User bilang "mau bicara dengan CS/manusia"

**Jangan:**
- Menggunakan bahasa gaul berlebihan
- Berlebihan menggunakan emoji
- Memberikan info yang tidak yakin (lebih baik bilang "saya cek dulu ya")
- Mengabaikan konteks percakapan sebelumnya

Kamu adalah partner yang membantu user sukses menggunakan Chaesa Live!`;

/**
 * Detect if conversation needs escalation to human support
 */
function detectEscalation(userMessage: string, botReply: string): boolean {
  const escalationKeywords = [
    "ngomong sama manusia",
    "bicara langsung",
    "bicara dengan cs",
    "bicara sama cs",
    "mau bicara dengan manusia",
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

  if (
    botLower.includes("saya kurang tahu") ||
    botLower.includes("saya tidak yakin") ||
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

  if (lower.includes("harga") || lower.includes("biaya") || lower.includes("paket")) {
    return [
      "Apa saja fitur Pro Plan?",
      "Paket 1 tahun seperti apa?",
      "Perbandingan dengan Zoom?",
    ];
  }

  if (lower.includes("ai") || lower.includes("kursus") || lower.includes("generate")) {
    return [
      "Bagaimana cara kerja AI Course Factory?",
      "Berapa lama proses AI-nya?",
      "Bisa export format apa saja?",
    ];
  }

  if (lower.includes("obs") || lower.includes("audio") || lower.includes("studio")) {
    return [
      "Cara mengaktifkan Studio Mode?",
      "Cara mengatasi masalah audio OBS",
      "Apa itu Original Sound mode?",
    ];
  }

  if (lower.includes("jual") || lower.includes("cta") || lower.includes("duit")) {
    return [
      "Bagaimana cara kerja Live Sales CTA?",
      "Cara push CTA ke viewer?",
      "Berapa komisi marketplace?",
    ];
  }

  return [
    "Cara mulai meeting pertama?",
    "Apa saja fitur unggulannya?",
    "Berapa harga paketnya?",
  ];
}

/**
 * Generate intelligent mock responses based on common questions
 * (Used when OpenAI API key is not available)
 */
function generateMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.match(/^(hi|hello|hey|halo|hai|hola|p)\b/) ||
    lowerMessage === "hi" ||
    lowerMessage === "hello" ||
    lowerMessage === "halo"
  ) {
    return "Halo Kak! 👋 Saya Chaesa, asisten AI Kamu di sini.\n\nSaya bisa membantu Kamu untuk:\n\n• Penjelasan fitur Chaesa Live\n• Info harga & paket langganan\n• Tutorial cara menggunakan platform\n• Troubleshooting masalah teknis\n• Saran & tips agar hasilnya maksimal\n\nSilakan tanya apa saja, saya siap membantu! 😊";
  }

  if (
    lowerMessage.includes("apa itu chaesa") ||
    lowerMessage.includes("what is chaesa") ||
    lowerMessage.includes("tentang chaesa") ||
    lowerMessage.includes("chaesa itu apa")
  ) {
    return "Baik, saya jelaskan ya Kak! 🚀\n\nChaesa Live adalah platform video meeting yang berbeda dari platform konvensional. Kenapa? Karena kami punya:\n\n📹 Meeting Video\n• Unlimited peserta (tergantung paket)\n• Kualitas HD, stabil\n• Sangat mudah digunakan\n\n🤖 AI Course Factory\n• Rekam meeting → AI otomatis membuatnya jadi kursus\n• Auto-generate slides, quiz, podcast, ebook\n• Hemat 90% waktu editing!\n\n💰 Live Sales CTA\n• Push tombol 'Beli' langsung ke layar viewer\n• Live commerce interaktif\n• Konversi naik 3-5x lipat!\n\n🎬 Studio Mode\n• Khusus untuk content creator & streamer\n• Menyembunyikan semua UI untuk capture yang bersih\n• Audio jernih tanpa gangguan\n\nSingkatnya: Chaesa Live = Meeting + AI Content Creator + Live Commerce dalam satu platform!\n\nDitambah lagi, harganya sangat terjangkau dengan fitur paling lengkap.\n\nMau tahu lebih detail tentang fitur yang mana?";
  }

  // Pricing questions
  if (
    lowerMessage.includes("harga") ||
    lowerMessage.includes("biaya") ||
    lowerMessage.includes("paket") ||
    lowerMessage.includes("price") ||
    lowerMessage.includes("berapa")
  ) {
    return `Baik Kak, berikut informasi lengkap paket harga kami! 💰

Chaesa Live bukan sekadar platform meeting biasa — ini untuk kreator yang serius ingin mengembangkan bisnis.

Paket Harga Chaesa Live:

🆓 GRATIS — Rp 0/bulan
   • Limit 40 menit per meeting
   • Maks 100 peserta
   • Fitur basic
   • Cocok untuk mencoba terlebih dahulu

⭐ PRO — Rp 99.000/bulan
   • Meeting UNLIMITED (tanpa batas waktu)
   • AI Course Generator (hemat 90% waktu)
   • Live Sales CTA (konversi 3-5x lipat)
   • Studio Mode (streaming-friendly)
   • Original Sound (audio jernih)
   • Micro-Learning Marketplace

🚀 BUSINESS — Rp 199.000/bulan
   • Semua fitur Pro
   • Maks 300 peserta
   • Advanced analytics
   • Custom branding
   • Priority support

💎 1 TAHUN — Rp 999.000 (bayar sekali)
   • Semua fitur Pro selama 1 tahun penuh
   • Hemat dibanding bayar bulanan
   • Update fitur baru gratis
   • Investasi terbaik untuk jangka panjang

Perhitungan Keuntungan:
• Membuat 1 course manual: 20 jam editing
• Menggunakan Chaesa AI: 2 jam (hemat 18 jam!)
• Jual course Rp 500K, dapat 10 pembeli = Rp 5 juta
• Biaya Chaesa: Rp 99K/bulan
• Keuntungan bersih: Rp 4,9 juta

Perbandingan dengan platform lain:
• Platform meeting premium: Rp 200-300K/bulan (hanya video call, tanpa AI)
• Platform kursus online: Komisi 40-50% dari penjualan
• Platform all-in-one: Rp 2-3 juta/bulan

Cocok untuk:
• Content creator
• Course creator & coach
• Live seller & e-commerce
• Streamer & podcaster
• Corporate trainer

Mau langsung mencoba? Atau ingin tahu lebih detail tentang fitur tertentu? 😊`;
  }

  // AI Features
  if (
    lowerMessage.includes("ai") ||
    lowerMessage.includes("kursus") ||
    lowerMessage.includes("course") ||
    lowerMessage.includes("generate") ||
    lowerMessage.includes("otomatis")
  ) {
    return "Ini adalah fitur andalan kami! AI Course Factory bekerja seperti asisten pribadi yang ahli dalam editing. 🤖\n\nBegini cara kerjanya:\n\n1. Kamu rekam meeting (bebas berapa jam)\n2. AI langsung memproses, memotong jadi modul 5-7 menit\n3. Otomatis membuat:\n   • Slides PowerPoint\n   • PDF ebook & study guide\n   • Quiz + penjelasan jawaban\n   • Podcast dengan 2 AI host (sangat natural!)\n   • Klip pendek untuk TikTok/Reels\n\nPerbandingan waktu:\n\nCara Manual:\n• Download rekaman: 30 menit\n• Transcribe: 2 jam\n• Edit & potong: 5 jam\n• Membuat slides: 3 jam\n• Membuat quiz: 2 jam\n• Total: 12+ jam\n\nDengan Chaesa AI:\n• Klik 1 tombol\n• Tunggu 15 menit\n• Selesai! 🚀\n\nHemat hingga 90% waktu Kamu!\n\nMau saya jelaskan lebih teknis atau ingin langsung mencoba?";
  }

  // Studio Mode / OBS
  if (
    lowerMessage.includes("studio") ||
    lowerMessage.includes("obs") ||
    lowerMessage.includes("stream") ||
    lowerMessage.includes("audio") ||
    lowerMessage.includes("youtuber")
  ) {
    return "Ini fitur yang sangat disukai content creator & streamer! 🎬\n\nMasalah yang sering terjadi:\n• Platform meeting biasa + software streaming = audio robotik\n• UI meeting platform terlihat di stream\n• Setup yang rumit\n\nChaesa Studio Mode adalah solusinya:\n\n1. Join meeting seperti biasa\n2. Tekan Ctrl+Shift+U (atau klik tombol Studio Mode)\n3. Semua UI langsung tersembunyi (bersih untuk capture)\n4. Aktifkan 'Original Sound' di Audio Settings\n5. Selesai! Audio jernih tanpa processing 🎵\n\nCocok untuk:\n• Live streaming\n• Recording podcast\n• Webinar profesional\n• Content creation berkualitas tinggi\n\nFitur teknis:\n• Bypass audio processing (raw audio)\n• Menyembunyikan semua overlay & control\n• Shortcut keyboard untuk kemudahan\n• Tidak konflik dengan audio mixer eksternal\n• Kompatibel dengan software streaming populer\n\nMau saya berikan tutorial lengkapnya? Atau ada masalah audio spesifik yang ingin Kamu atasi?";
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
    return "Ini adalah fitur yang sangat membantu untuk penjualan online! Live Sales CTA dapat meningkatkan konversi hingga 3-5x lipat. 💰\n\nPerbandingan:\n\nCara Lama:\n❌ Webinar, lalu share link di chat\n❌ Peserta jarang mengklik\n❌ Lupa setelah meeting selesai\n❌ Konversi hanya 1-2%\n\nDengan Chaesa Live Sales CTA:\n✅ Kamu demo produk secara live\n✅ Tekan tombol 'Push CTA'\n✅ Tombol 'BELI SEKARANG' muncul di layar semua viewer!\n✅ Countdown timer menciptakan urgensi\n✅ Klik langsung ke checkout\n✅ Konversi naik jadi 5-8%! 🚀\n\nFitur lengkap:\n• Push CTA ke semua viewer sekaligus\n• Countdown timer untuk menciptakan urgensi\n• Tracking real-time (berapa banyak yang klik)\n• Bisa dikustomisasi (warna, teks, posisi)\n• Direct checkout via payment gateway\n\nKeunggulannya:\n1. Kamu bisa menjelaskan produk terlebih dahulu (membangun kepercayaan)\n2. Live demo membuat calon pembeli lebih yakin\n3. Pembelian impulsif saat momen yang tepat\n\nCocok untuk:\n• Live product demo\n• Course launch webinar\n• E-commerce broadcast\n• Flash sale event\n\nMau setup sekarang atau ingin tips agar konversinya maksimal?";
  }

  // Getting started
  if (
    lowerMessage.includes("cara mulai") ||
    lowerMessage.includes("cara pakai") ||
    lowerMessage.includes("getting started") ||
    lowerMessage.includes("bikin meeting") ||
    lowerMessage.includes("tutorial")
  ) {
    return "Sangat mudah, Kak! Saya bantu langkah demi langkah ya. 🚀\n\nAda 2 cara:\n\nCara 1: Membuat Meeting Baru\n1. Buka homepage Chaesa Live\n2. Klik 'Start New Meeting'\n3. Meeting room langsung terbuka\n4. Bagikan kode meeting ke peserta\n5. Mereka tinggal memasukkan kode → Join\n\nCara 2: Bergabung ke Meeting yang Sudah Ada\n1. Minta kode meeting dari host\n2. Masukkan kode di homepage\n3. Klik 'Join Meeting'\n4. Selesai!\n\nTips Agar Lancar:\n• Test kamera & mic sebelum meeting penting\n• Gunakan Chrome/Edge (paling stabil)\n• Internet minimal 5 Mbps\n• Jika ingin live streaming, aktifkan Studio Mode\n\nButuh bantuan lainnya?\n• Cara merekam meeting?\n• Cara mengaktifkan AI Course Generator?\n• Cara push CTA ke viewer?\n\nSilakan tanya saja, saya siap membantu! 😊";
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
    return "Ada kendala ya Kak? Tenang, saya bantu sekarang! 🔧\n\nBerikut solusi untuk masalah yang paling sering terjadi:\n\nKamera Tidak Muncul:\n• Cek permission browser (izinkan akses kamera)\n• Coba browser lain (Chrome paling stabil)\n• Restart perangkat Kamu\n• Cek antivirus (kadang memblokir kamera)\n\nMasalah Audio:\n• Aktifkan 'Original Sound' mode\n• Cek permission microphone\n• Tutup aplikasi lain yang menggunakan mic (Zoom, Discord, dll)\n• Jika menggunakan OBS: Aktifkan Studio Mode\n• Test di meeting percobaan dulu\n\nKoneksi Terputus-putus:\n• Cek kecepatan internet (minimal 5 Mbps)\n• Matikan VPN sementara\n• Pindah ke WiFi yang lebih stabil\n• Kurangi jumlah tab browser\n\nAI Tidak Bisa Generate Course:\n• Pastikan meeting sudah direkam\n• Tunggu 2-3 menit untuk processing\n• Cek paket Kamu (harus Pro/Business/1 Tahun)\n• Jika masih error, screenshot dan hubungi kami\n\nBisa ceritakan masalah spesifiknya apa? Saya akan carikan solusinya! 💪";
  }

  // Features comparison
  if (
    lowerMessage.includes("vs zoom") ||
    lowerMessage.includes("banding") ||
    lowerMessage.includes("compare") ||
    lowerMessage.includes("beda") ||
    lowerMessage.includes("lebih bagus")
  ) {
    return `Pertanyaan bagus! Berikut perbandingan Chaesa Live dengan platform lain. 💪

Fitur Unggulan Chaesa Live:
✅ Video Meeting Unlimited
✅ AI Course Generator (otomatis membuat kursus)
✅ Live Sales CTA (push tombol ke semua viewer)
✅ Studio Mode (streaming-friendly, tanpa UI)
✅ Original Sound (audio jernih tanpa processing)
✅ Micro-Learning Marketplace (jual kursus, komisi hanya 30%)
✅ AI Podcast Generator (2 host conversation)
✅ Auto Slides & Quiz Generator

Perbandingan:

Platform Meeting Biasa:
• Harga: Rp 200-300K/bulan
• Fitur: Video call saja
• AI: Tidak ada
• Monetisasi: Tidak ada

Platform Kursus Online:
• Harga: Gratis upload
• Komisi: 40-50% per penjualan
• Meeting: Tidak ada
• Live commerce: Tidak ada

Platform All-in-One Premium:
• Harga: Rp 2-3 juta/bulan
• Fitur: Lengkap tapi kompleks
• AI: Semua manual
• Untuk: Enterprise

Chaesa Live:
• Harga: Rp 99K/bulan (paling terjangkau!)
• Fitur: All-in-one (meeting + AI + marketplace)
• AI: Otomatis membuat konten
• Untuk: Kreator, educator, seller

Kenapa Chaesa Worth It:

1. Hemat Waktu
   • Manual: 20 jam membuat 1 course
   • Chaesa AI: 2 jam (hemat 90%!)

2. Hemat Biaya
   • Platform premium: Rp 200-300K/bulan
   • Chaesa: Rp 99K/bulan (hemat 60%!)

3. Pendapatan Lebih Besar
   • Platform kursus: Komisi 50%
   • Chaesa: Komisi 30% (Kamu mendapat 70%!)

4. Fitur Lebih Lengkap
   • Meeting + AI + Marketplace = 1 tempat
   • Tidak perlu berlangganan banyak tool

Kesimpulan:
• Butuh meeting + AI + course platform → Chaesa (best value!)
• Hanya butuh meeting → Platform meeting biasa
• Advanced marketing automation → Platform premium

Mau mencoba langsung atau ingin tahu detail fitur lainnya?`;
  }

  // Payment/billing
  if (
    lowerMessage.includes("bayar") ||
    lowerMessage.includes("payment") ||
    lowerMessage.includes("billing") ||
    lowerMessage.includes("transfer") ||
    lowerMessage.includes("kartu kredit")
  ) {
    return "Baik, saya jelaskan cara pembayarannya ya Kak! 💳\n\nMetode Pembayaran:\n✅ Kartu Kredit/Debit (Visa, Mastercard, JCB)\n✅ Transfer Bank (Semua bank utama Indonesia)\n✅ E-Wallet (GoPay, OVO, Dana, ShopeePay)\n✅ QRIS (Scan & bayar, sangat mudah!)\n✅ PayLater\n\nCara Berlangganan:\n1. Pilih paket (Gratis/Pro/Business/1 Tahun)\n2. Klik 'Subscribe Now'\n3. Pilih metode pembayaran\n4. Selesaikan pembayaran\n5. Akun langsung otomatis ter-upgrade! 🚀\n\nKeamanan:\n• Proses pembayaran menggunakan Mayar (certified secure)\n• Data kartu TIDAK disimpan di server kami\n• Enkripsi SSL/TLS\n• Garansi uang kembali 7 hari\n\nTips:\n• Paket 1 Tahun lebih hemat dibanding bayar bulanan\n• Bisa dibatalkan kapan saja (tanpa penalti)\n• Invoice otomatis dikirim ke email\n• Pengingat sebelum jatuh tempo\n\nAda pertanyaan tentang billing atau mau langsung berlangganan?";
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
    return "Baik Kak! Saya hubungkan ke tim support ya. 👨‍💼\n\nPilihan Support:\n\n📧 Email: support@chaesa.live\n⏰ Response: Maksimal 24 jam (biasanya lebih cepat)\n📝 Cocok untuk: Pertanyaan detail, komplain, bug report\n\n💬 Live Chat: Senin-Jumat, 09:00 - 17:00 WIB\n⚡ Response: Real-time (langsung dibalas)\n📝 Cocok untuk: Masalah urgent, tutorial langsung\n\n📱 Discord Community: 24/7\n🤝 Response: Dari pengguna lain & tim (bervariasi)\n📝 Cocok untuk: Diskusi tips, networking\n\n🎥 Tutorial YouTube: Kapan saja\n📺 Tutorial lengkap gratis\n📝 Cocok untuk: Belajar sendiri langkah demi langkah\n\nMau saya hubungkan ke tim support sekarang?\nAtau ada yang bisa saya bantu terlebih dahulu? 😊";
  }

  return "Pertanyaan yang menarik! 🤔\n\nSaya sedang mencari jawaban yang paling tepat untuk Kamu. Sementara itu, berikut beberapa topik yang sering ditanyakan:\n\n🎯 Tentang Chaesa Live\n• Platform video meeting + AI content creator\n• Lebih terjangkau dari Zoom\n• Fitur live commerce built-in\n\n💰 Info Harga\n• Gratis: Fitur basic\n• Pro: Rp 99K/bulan (unlimited!)\n• 1 Tahun: Rp 999K (lebih hemat!)\n\n🚀 Fitur Unggulan\n• AI Course Factory (otomatis generate kursus)\n• Live Sales CTA (push CTA ke viewer)\n• Studio Mode (OBS-friendly)\n\n🔧 Bantuan Teknis\n• Tutorial setup meeting\n• Mengatasi masalah audio/video\n• Tips & trik agar hasilnya maksimal\n\nMau bertanya lebih spesifik tentang topik yang mana? Saya siap membantu! 💪";
}