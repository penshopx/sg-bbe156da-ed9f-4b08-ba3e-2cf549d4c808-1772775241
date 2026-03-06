import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    let botReply: string;

    try {
      const chatHistory = (history || []).slice(-10).map((m: any) => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: CHAESA_LIVE_SYSTEM_PROMPT },
          ...chatHistory,
          { role: "user", content: message },
        ],
        max_completion_tokens: 8192,
      });

      botReply = response.choices[0]?.message?.content || generateSmartResponse(message);
    } catch (error) {
      console.error("OpenAI API error, falling back to knowledge base:", error);
      botReply = generateSmartResponse(message);
    }

    const needsHumanSupport = detectEscalation(message, botReply);
    const quickReplies = generateQuickReplies(message);

    return res.status(200).json({
      reply: botReply,
      needs_escalation: needsHumanSupport,
      related_articles: [],
      quick_replies: quickReplies,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(200).json({
      reply: "Maaf, ada sedikit gangguan. Bisa Kamu ulangi pertanyaannya? 🙏",
      needs_escalation: false,
      related_articles: [],
      quick_replies: ["Apa itu Chaesa Live?", "Berapa harganya?", "Fitur apa saja?"],
    });
  }
}

const CHAESA_LIVE_SYSTEM_PROMPT = `Kamu adalah Chaesa, asisten AI untuk platform Chaesa Live - platform micro-learning berbasis AI untuk kreator dan educator.

**Tentang Chaesa Live:**
Chaesa Live adalah platform yang mengubah meeting/webinar menjadi kursus micro-learning siap jual dalam 15 menit menggunakan AI. Fitur utama:
1. AI Course Factory - Ubah rekaman meeting 2 jam jadi 20 modul micro-learning (5-7 menit) dengan auto-generate slides, quiz, podcast, dan ebook
2. Live Sales CTA - Push tombol "Beli Sekarang" ke semua viewer saat webinar (live commerce)
3. Studio Mode - Mode streaming untuk YouTuber/streamer (hide semua UI untuk OBS capture)
4. Original Sound - Audio jernih tanpa processing robotik saat menggunakan OBS/mixer
5. Micro-Learning Marketplace - Jual kursus dengan komisi 30% (vs 50% di Udemy)

**Harga:**
- Gratis: Limit 40 menit, 100 peserta, fitur basic
- Pro: Rp 99.000/bulan - Unlimited meeting, AI features, Live Sales CTA, Studio Mode
- Business: Rp 199.000/bulan - 300 peserta, advanced analytics, custom branding
- 1 Tahun: Rp 999.000 - Semua fitur Pro selama 1 tahun penuh (hemat 16%)

**Cara Bicara:**
- Sapaan: "Halo Kak!", "Hai!", "Baik Kak"
- Kata ganti: "saya" atau "aku" untuk diri sendiri, "Kamu" atau "Anda" untuk user
- Tone: Santai, ramah, dan sopan. Hindari "gue/lu"
- Emoji: Secukupnya (1-2 per pesan)
- Format: Rapi dan mudah dibaca

**Kapan Escalate ke Human:**
- Komplain serius / refund / bug critical
- User bilang "mau bicara dengan CS/manusia"`;

interface KnowledgeEntry {
  keywords: string[];
  patterns: RegExp[];
  response: string;
  weight: number;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ["halo", "hai", "hello", "hi", "hey", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "apa kabar"],
    patterns: [/^(hi|hello|hey|halo|hai|hola)$/i, /^(hi|hello|hey|halo|hai)\b.{0,10}$/i, /^selamat (pagi|siang|sore|malam)/i, /apa kabar/i],
    weight: 10,
    response: `Halo Kak! 👋 Saya Chaesa, asisten AI Kamu di sini.

Saya bisa membantu Kamu tentang:
• Penjelasan fitur Chaesa Live
• Info harga & paket langganan
• Tutorial cara menggunakan platform
• Troubleshooting masalah teknis

Silakan tanya apa saja ya! 😊`
  },
  {
    keywords: ["apa itu chaesa", "tentang chaesa", "chaesa itu apa", "chaesa live apa", "apa chaesa", "platform apa"],
    patterns: [/apa (itu )?chaesa/i, /chaesa (itu |live )?apa/i, /tentang chaesa/i, /platform (apa|ini)/i],
    weight: 8,
    response: `Baik, saya jelaskan ya Kak! 🚀

Chaesa Live adalah platform micro-learning berbasis AI yang bisa mengubah meeting/webinar Kamu jadi kursus siap jual dalam 15 menit.

Fitur utama kami:

🤖 AI Course Factory
Rekam meeting → AI otomatis potong jadi modul 5-7 menit, lengkap dengan slides, quiz, podcast, dan ebook.

💰 Live Sales CTA
Push tombol "Beli Sekarang" langsung ke layar semua viewer saat webinar. Konversi naik 3-5x!

🎬 Studio Mode
Khusus untuk content creator & streamer. UI tersembunyi, audio jernih, OBS-friendly.

📚 Micro-Learning Marketplace
Jual kursus Kamu dengan komisi hanya 30% (di Udemy komisi 50%!).

Singkatnya: Meeting + AI Content Creator + Live Commerce, semua dalam satu platform.

Mau tahu lebih detail tentang fitur tertentu?`
  },
  {
    keywords: ["harga", "biaya", "paket", "price", "berapa", "langganan", "subscribe", "bayar berapa", "cost", "tarif"],
    patterns: [/harga/i, /berapa (biaya|harga|bulan)/i, /paket.*(harga|apa)/i, /(biaya|tarif)/i, /berapa.*bayar/i, /bayar.*berapa/i],
    weight: 8,
    response: `Baik Kak, berikut info harga lengkap kami! 💰

🆓 GRATIS — Rp 0/bulan
• Limit 40 menit per meeting
• Maks 100 peserta
• Fitur basic (cocok untuk coba-coba dulu)

⭐ PRO — Rp 99.000/bulan
• Meeting UNLIMITED (tanpa batas waktu)
• AI Course Generator
• Live Sales CTA
• Studio Mode & Original Sound
• Micro-Learning Marketplace

🚀 BUSINESS — Rp 199.000/bulan
• Semua fitur Pro
• Maks 300 peserta
• Advanced analytics & custom branding
• Priority support

💎 1 TAHUN — Rp 999.000 (bayar sekali)
• Semua fitur Pro selama 1 tahun penuh
• Hemat 16% dibanding bayar bulanan
• Update fitur baru gratis

Sebagai perbandingan, Zoom Pro saja Rp 240.000/bulan tanpa fitur AI.

Mau langsung berlangganan atau ada pertanyaan lain?`
  },
  {
    keywords: ["ai", "kursus", "course", "generate", "otomatis", "modul", "konten", "content", "buat kursus", "bikin kursus"],
    patterns: [/ai.*(course|kursus|factory|generate)/i, /(course|kursus).*(factory|ai|otomatis|generate)/i, /buat.*(kursus|course|konten|modul)/i, /bikin.*(kursus|course|konten)/i, /cara.*(generate|buat|bikin).*(kursus|course)/i, /otomatis/i],
    weight: 7,
    response: `Ini fitur andalan kami, Kak! AI Course Factory 🤖

Cara kerjanya sangat simpel:

1️⃣ Rekam meeting/webinar Kamu (bebas berapa jam)
2️⃣ AI memproses rekaman secara otomatis
3️⃣ Dalam 15 menit, Kamu dapat:
   • 20 modul micro-learning (5-7 menit per modul)
   • Slides PowerPoint otomatis
   • PDF ebook & study guide
   • Quiz + penjelasan jawaban
   • Podcast dengan 2 AI host
   • Klip pendek untuk TikTok/Reels

Perbandingan waktu:
❌ Manual: 12+ jam (download, transcribe, edit, buat slides, buat quiz)
✅ Chaesa AI: 15 menit saja!

Hemat hingga 90% waktu Kamu.

Fitur ini tersedia di paket Pro (Rp 99K/bulan) ke atas.

Mau tahu cara memulainya atau ada pertanyaan teknis?`
  },
  {
    keywords: ["studio", "obs", "stream", "streaming", "youtuber", "streamer", "live stream", "broadcast"],
    patterns: [/studio.*mode/i, /obs/i, /stream(ing|er)?/i, /youtuber/i, /live.*stream/i, /broadcast/i],
    weight: 7,
    response: `Studio Mode ini favorit content creator & streamer! 🎬

Masalah yang sering terjadi:
❌ Platform meeting + OBS = audio robotik
❌ UI meeting terlihat di stream
❌ Setup rumit dan ribet

Solusi dari Chaesa:

1. Join meeting seperti biasa
2. Tekan Ctrl+Shift+U (atau klik tombol Studio Mode)
3. Semua UI langsung tersembunyi
4. Aktifkan 'Original Sound' di Audio Settings
5. Audio jernih, tampilan bersih!

Fitur teknis:
• Bypass audio processing (raw audio)
• Sembunyikan semua overlay & control
• Shortcut keyboard untuk kemudahan
• Kompatibel dengan OBS, Streamlabs, dll
• Tidak konflik dengan audio mixer eksternal

Cocok untuk live streaming, podcast recording, dan webinar profesional.

Ada pertanyaan spesifik tentang setup OBS atau streaming?`
  },
  {
    keywords: ["audio", "suara", "original sound", "robotik", "robot", "mic", "mikrofon", "microphone"],
    patterns: [/audio.*(robotik|robot|jelek|masalah)/i, /suara.*(robot|jelek|aneh|masalah)/i, /original.*sound/i, /(mic|mikrofon|microphone)/i],
    weight: 7,
    response: `Masalah audio memang sering terjadi di platform meeting lain. Chaesa punya solusinya! 🎵

Original Sound Mode:
Platform meeting biasanya memproses audio (noise cancellation, compression) — ini bikin suara jadi robotik kalau pakai mixer/OBS.

Chaesa Live punya "Original Sound" yang melewati semua processing, jadi audio Kamu terdengar jernih dan natural.

Cara mengaktifkan:
1. Buka Audio Settings di meeting
2. Centang "Original Sound"
3. Selesai! Audio langsung jernih

Tips tambahan:
• Tutup aplikasi lain yang pakai mic (Zoom, Discord, dll)
• Gunakan headset/mic dedicated
• Kalau pakai OBS, aktifkan juga Studio Mode
• Test dulu di meeting percobaan sebelum acara penting

Masih ada masalah audio spesifik yang Kamu alami?`
  },
  {
    keywords: ["cta", "jual", "sales", "monetisasi", "duit", "konversi", "uang", "jualan", "live commerce", "beli sekarang"],
    patterns: [/live.*sales/i, /sales.*cta/i, /cta/i, /jual(an)?/i, /monetisasi/i, /live.*commerce/i, /beli.*sekarang/i, /konversi/i, /cara.*(jual|monetis)/i],
    weight: 7,
    response: `Live Sales CTA ini bisa meningkatkan konversi hingga 3-5x lipat! 💰

Cara lama vs Chaesa:
❌ Webinar → share link di chat → peserta jarang klik → konversi 1-2%
✅ Chaesa → demo produk live → push CTA → tombol "BELI" muncul di layar semua viewer → konversi 5-8%!

Cara kerjanya:
1. Kamu presentasi/demo produk secara live
2. Di momen yang tepat, tekan tombol "Push CTA"
3. Tombol "BELI SEKARANG" muncul di layar semua viewer
4. Countdown timer untuk urgensi
5. Viewer klik → langsung ke checkout

Fitur lengkap:
• Push CTA ke semua viewer sekaligus
• Countdown timer otomatis
• Tracking real-time (berapa yang klik)
• Kustomisasi warna, teks, posisi
• Direct checkout via payment gateway

Cocok untuk: Product launch, course launch, flash sale, demo produk.

Mau tips agar konversinya maksimal?`
  },
  {
    keywords: ["marketplace", "jual kursus", "komisi", "udemy", "pendapatan", "passive income"],
    patterns: [/marketplace/i, /jual.*kursus/i, /komisi/i, /udemy/i, /passive.*income/i, /pendapatan/i],
    weight: 7,
    response: `Micro-Learning Marketplace Chaesa Live! 📚

Kamu bisa menjual kursus micro-learning yang sudah di-generate oleh AI langsung di marketplace kami.

Keunggulan:
• Komisi hanya 30% (Kamu dapat 70%!)
• Di Udemy komisi 50% — di Chaesa jauh lebih hemat
• Kursus sudah jadi otomatis dari AI (tinggal publish)
• Format micro-learning (5-7 menit) lebih diminati learner
• Pembayaran langsung ke rekening Kamu

Potensi penghasilan:
• Buat 1 course dari 1 meeting → AI generate otomatis
• Jual Rp 100K-500K per course
• 10 pembeli = Rp 1-5 juta
• Bisa buat banyak course dari berbagai meeting
• Passive income setiap bulan!

Cara memulai:
1. Rekam meeting/webinar Kamu
2. AI generate jadi kursus micro-learning
3. Review & edit sesuai keinginan
4. Publish di marketplace
5. Promosikan & dapatkan pembeli!

Tertarik memulai? Atau ada pertanyaan lain?`
  },
  {
    keywords: ["cara mulai", "getting started", "bikin meeting", "tutorial", "mulai", "daftar", "register", "sign up", "buat akun"],
    patterns: [/cara (mulai|daftar|buat akun|register)/i, /getting started/i, /bikin.*meeting/i, /tutorial/i, /bagaimana.*(mulai|daftar)/i, /gimana.*(mulai|daftar)/i, /langkah.*(mulai|daftar)/i, /cara pakai(?!.*(?:obs|studio|audio|stream|cta|ai|course|kursus|marketplace))/i],
    weight: 7,
    response: `Sangat mudah, Kak! 🚀

Cara Daftar:
1. Buka website Chaesa Live
2. Klik "Daftar Gratis"
3. Masukkan email & password
4. Verifikasi email
5. Selesai! Akun langsung aktif

Cara Memulai Meeting:
1. Login ke dashboard
2. Klik "Start New Meeting"
3. Meeting room langsung terbuka
4. Bagikan kode meeting ke peserta
5. Peserta masukkan kode → Join

Cara Join Meeting Orang Lain:
1. Minta kode meeting dari host
2. Masukkan kode di homepage
3. Klik "Join Meeting"

Tips agar lancar:
• Test kamera & mic sebelum meeting penting
• Gunakan Chrome/Edge (paling stabil)
• Internet minimal 5 Mbps
• Kalau mau streaming, aktifkan Studio Mode

Butuh panduan lebih lanjut? Tanya saja! 😊`
  },
  {
    keywords: ["error", "masalah", "gak bisa", "tidak bisa", "rusak", "broken", "help", "bantuan", "kendala", "trouble", "gagal", "failed"],
    patterns: [/gak bisa/i, /tidak bisa/i, /error/i, /masalah/i, /rusak/i, /broken/i, /help/i, /kendala/i, /trouble/i, /gagal/i, /failed/i, /stuck/i, /hang/i],
    weight: 6,
    response: `Ada kendala ya Kak? Tenang, saya bantu! 🔧

Solusi untuk masalah yang paling sering terjadi:

📷 Kamera Tidak Muncul:
• Cek permission browser (izinkan akses kamera)
• Coba browser lain (Chrome paling stabil)
• Restart browser atau perangkat
• Cek apakah antivirus memblokir

🎤 Masalah Audio:
• Aktifkan 'Original Sound' mode
• Cek permission microphone di browser
• Tutup aplikasi lain yang pakai mic
• Kalau pakai OBS: aktifkan Studio Mode

🌐 Koneksi Terputus:
• Cek kecepatan internet (minimal 5 Mbps)
• Matikan VPN sementara
• Kurangi jumlah tab browser
• Pindah ke WiFi yang lebih stabil

🤖 AI Tidak Bisa Generate:
• Pastikan meeting sudah direkam
• Tunggu 2-3 menit untuk processing
• Cek paket Kamu (harus Pro/Business/1 Tahun)

Bisa ceritakan masalah spesifiknya? Saya carikan solusinya! 💪`
  },
  {
    keywords: ["vs zoom", "banding", "compare", "beda", "lebih bagus", "zoom", "google meet", "teams", "perbandingan"],
    patterns: [/vs.*(zoom|meet|teams)/i, /(zoom|meet|teams).*vs/i, /banding/i, /perbandingan/i, /beda.*(zoom|meet|platform)/i, /(lebih bagus|lebih baik)/i, /kenapa.*chaesa/i],
    weight: 7,
    response: `Pertanyaan bagus! Ini perbandingannya: 💪

Chaesa Live vs Platform Lain:

📹 Platform Meeting Biasa (Zoom, Meet):
• Harga: Rp 200-300K/bulan
• Fitur: Video call saja
• AI: Tidak ada
• Monetisasi: Tidak ada

📚 Platform Kursus Online (Udemy, dll):
• Harga: Gratis upload
• Komisi: 40-50% per penjualan!
• Meeting: Tidak ada
• Pembuatan konten: Manual (berjam-jam)

⭐ Chaesa Live:
• Harga: Rp 99K/bulan
• Fitur: Meeting + AI + Marketplace (all-in-one)
• AI: Otomatis generate kursus dari meeting
• Komisi marketplace: Hanya 30%

Kenapa Chaesa lebih worth it:
1. Hemat Waktu — Manual 20 jam, Chaesa AI 15 menit
2. Hemat Biaya — 60% lebih murah dari Zoom Pro
3. Pendapatan Lebih — Komisi 30% vs 50% di Udemy
4. All-in-One — Tidak perlu banyak tool terpisah

Mau coba langsung?`
  },
  {
    keywords: ["bayar", "payment", "billing", "transfer", "kartu kredit", "pembayaran", "metode bayar", "gopay", "ovo", "dana", "qris"],
    patterns: [/bayar/i, /payment/i, /billing/i, /transfer/i, /kartu.*(kredit|debit)/i, /pembayaran/i, /metode.*(bayar|pembayaran)/i, /(gopay|ovo|dana|qris|shopeepay)/i],
    weight: 7,
    response: `Saya jelaskan cara pembayarannya ya Kak! 💳

Metode Pembayaran yang Tersedia:
✅ Kartu Kredit/Debit (Visa, Mastercard, JCB)
✅ Transfer Bank (semua bank utama Indonesia)
✅ E-Wallet (GoPay, OVO, Dana, ShopeePay)
✅ QRIS (scan & bayar)

Cara Berlangganan:
1. Pilih paket di halaman Harga
2. Klik "Subscribe Now"
3. Pilih metode pembayaran
4. Selesaikan pembayaran
5. Akun langsung ter-upgrade otomatis! 🚀

Keamanan:
• Proses pembayaran via Mayar (certified secure)
• Data kartu TIDAK disimpan di server kami
• Enkripsi SSL/TLS

Info penting:
• Paket 1 Tahun lebih hemat (Rp 999K vs Rp 1,188K/tahun)
• Bisa dibatalkan kapan saja tanpa penalti
• Invoice otomatis dikirim ke email
• Garansi uang kembali 7 hari

Mau langsung berlangganan?`
  },
  {
    keywords: ["kontak", "hubungi", "contact", "manusia", "support", "cs", "customer service", "komplain", "keluhan"],
    patterns: [/kontak/i, /hubungi/i, /contact/i, /manusia/i, /support/i, /customer.*(service|support)/i, /\bcs\b/i, /komplain/i, /keluhan/i, /bicara.*(langsung|manusia|cs|orang)/i],
    weight: 8,
    response: `Baik Kak, saya hubungkan ke tim support! 👨‍💼

Pilihan Support:

📧 Email: support@chaesa.live
⏰ Response: Maksimal 24 jam
📝 Cocok untuk pertanyaan detail, komplain, bug report

💬 Live Chat: Senin-Jumat, 09:00 - 17:00 WIB
⚡ Response: Real-time
📝 Cocok untuk masalah urgent

📱 Discord Community: 24/7
🤝 Diskusi tips & networking dengan pengguna lain

🎥 Tutorial YouTube
📺 Tutorial lengkap gratis kapan saja

Mau saya hubungkan ke tim support sekarang? Atau ada yang bisa saya bantu terlebih dahulu? 😊`
  },
  {
    keywords: ["refund", "batal", "cancel", "uang kembali", "pengembalian"],
    patterns: [/refund/i, /batal.*(langganan|subscribe)/i, /cancel/i, /uang.*kembali/i, /pengembalian/i],
    weight: 9,
    response: `Untuk refund dan pembatalan, berikut informasinya Kak:

💰 Kebijakan Refund:
• Garansi uang kembali 7 hari setelah pembelian
• Proses refund 3-5 hari kerja
• Refund ke metode pembayaran yang sama

❌ Cara Membatalkan Langganan:
1. Login ke dashboard
2. Buka Settings → Billing
3. Klik "Batalkan Langganan"
4. Konfirmasi pembatalan
5. Akses tetap aktif sampai masa berlaku habis

Untuk proses refund atau masalah billing yang lebih kompleks, silakan hubungi tim support kami:
📧 Email: support@chaesa.live

Tim CS kami akan membantu Kamu langsung. 🙏`
  },
  {
    keywords: ["micro learning", "micro-learning", "microlearning", "modul micro", "modul belajar"],
    patterns: [/micro.?learning/i, /modul.*(belajar|learning|micro)/i, /apa itu micro/i],
    weight: 6,
    response: `Micro-learning adalah metode belajar dengan modul pendek (5-7 menit per modul). Riset menunjukkan ini 50% lebih efektif dari belajar panjang! 📚

Di Chaesa Live, AI otomatis memotong rekaman meeting Kamu jadi modul-modul micro-learning:

Contoh:
Meeting 2 jam tentang "Digital Marketing" → AI generate:
• Modul 1: Pengenalan Digital Marketing (5 min)
• Modul 2: SEO Basics (7 min)
• Modul 3: Social Media Strategy (6 min)
• ... dst hingga 20 modul

Setiap modul dilengkapi:
📊 Slides otomatis
📝 Quiz & assessment
🎙️ Podcast version
📖 PDF summary

Kenapa micro-learning lebih efektif?
• Fokus lebih baik (attention span manusia ~7 menit)
• Bisa belajar kapan saja, di mana saja
• Mudah diulang bagian yang sulit
• Completion rate lebih tinggi

Mau tahu cara membuat kursus micro-learning pertama Kamu?`
  },
  {
    keywords: ["gratis", "free", "trial", "coba", "gratisan"],
    patterns: [/gratis/i, /free/i, /trial/i, /coba.*dulu/i, /gratisan/i, /tanpa.*bayar/i],
    weight: 7,
    response: `Kabar baik, Kak! Kamu bisa mulai GRATIS! 🎉

Paket Gratis sudah termasuk:
• Meeting hingga 40 menit
• Maks 100 peserta
• Fitur basic video conferencing
• Akses ke AI Studio (sedang dalam masa trial!)

Cara daftar gratis:
1. Klik "Daftar Gratis" di website
2. Masukkan email & password
3. Verifikasi email
4. Langsung bisa digunakan!

Tidak perlu kartu kredit. Tidak ada biaya tersembunyi.

Kalau sudah cocok, Kamu bisa upgrade ke Pro (Rp 99K/bulan) kapan saja untuk fitur unlimited.

Mau langsung daftar? 😊`
  },
  {
    keywords: ["podcast", "audio content", "ai podcast"],
    patterns: [/podcast/i, /audio.*content/i, /ai.*podcast/i],
    weight: 7,
    response: `Fitur AI Podcast Generator kami sangat keren! 🎙️

AI otomatis mengubah rekaman meeting Kamu jadi podcast dengan 2 AI host yang berdiskusi secara natural (mirip NotebookLM dari Google).

Cara kerjanya:
1. Rekam meeting/webinar
2. AI memproses konten
3. Generate podcast dengan 2 host AI
4. Host AI mendiskusikan topik secara natural
5. Hasilnya bisa langsung di-publish!

Keunggulan:
• Suara natural (bukan text-to-speech biasa)
• 2 host yang saling berdiskusi
• Otomatis dari rekaman meeting
• Format yang populer dan diminati
• Bisa jadi konten tambahan untuk dijual

Podcast ini juga bisa Kamu jual di Micro-Learning Marketplace sebagai konten tambahan bersama kursus.

Tertarik mencobanya?`
  },
  {
    keywords: ["quiz", "assessment", "ujian", "test", "soal"],
    patterns: [/quiz/i, /assessment/i, /ujian/i, /test/i, /soal/i],
    weight: 6,
    response: `AI Quiz Generator Chaesa Live! 📝

AI otomatis membuat quiz dari konten meeting Kamu:

Jenis quiz yang di-generate:
• Pilihan ganda (multiple choice)
• Benar/Salah (true/false)
• Isian singkat

Setiap pertanyaan dilengkapi:
• Penjelasan jawaban yang benar
• Referensi ke bagian materi terkait
• Level kesulitan (mudah, sedang, sulit)

Cara kerjanya:
1. AI menganalisis konten meeting
2. Identifikasi poin-poin penting
3. Generate pertanyaan yang relevan
4. Buat penjelasan untuk setiap jawaban

Quiz ini menjadi bagian dari kursus micro-learning yang bisa Kamu jual di marketplace.

Ada pertanyaan lain tentang fitur ini?`
  },
  {
    keywords: ["slide", "slides", "presentasi", "powerpoint", "ppt"],
    patterns: [/slide/i, /presentasi/i, /powerpoint/i, /ppt/i],
    weight: 6,
    response: `AI Slides Generator! 📊

AI otomatis membuat slides presentasi dari rekaman meeting Kamu:

Yang di-generate:
• Slides PowerPoint profesional
• Design yang menarik & konsisten
• Poin-poin utama dari meeting
• Grafik & diagram pendukung
• Layout yang rapi

Cara kerjanya:
1. AI menganalisis rekaman meeting
2. Ekstrak poin-poin utama
3. Generate slides dengan design profesional
4. Export ke format PowerPoint

Slides ini menjadi bagian dari paket kursus micro-learning (bersama quiz, podcast, dan ebook).

Fitur ini tersedia di paket Pro (Rp 99K/bulan) ke atas.

Mau tahu lebih detail?`
  },
  {
    keywords: ["peserta", "participant", "kapasitas", "berapa orang", "limit orang"],
    patterns: [/peserta/i, /participant/i, /kapasitas/i, /berapa.*orang/i, /limit.*orang/i, /maksimal.*(orang|peserta)/i],
    weight: 7,
    response: `Berikut kapasitas peserta per paket, Kak:

🆓 Gratis: Maks 100 peserta
⭐ Pro: Maks 100 peserta + fitur unlimited lainnya
🚀 Business: Maks 300 peserta + custom branding
💎 1 Tahun: Sama seperti Pro (100 peserta)

Kalau Kamu butuh lebih dari 300 peserta, bisa hubungi tim kami untuk paket Enterprise/custom.

Tips:
• Untuk webinar besar (300+ orang), paket Business paling cocok
• Untuk meeting harian & content creation, paket Pro sudah cukup
• Paket 1 Tahun cocok kalau sudah yakin dan mau hemat

Ada pertanyaan lain?`
  },
  {
    keywords: ["aman", "keamanan", "security", "privasi", "privacy", "data"],
    patterns: [/aman/i, /keamanan/i, /security/i, /privasi/i, /privacy/i, /data.*(aman|protect)/i],
    weight: 6,
    response: `Keamanan data Kamu adalah prioritas kami! 🔒

Keamanan Platform:
• Enkripsi end-to-end untuk semua meeting
• SSL/TLS untuk semua koneksi
• Data disimpan di server yang aman
• Compliance dengan standar keamanan internasional

Keamanan Pembayaran:
• Proses via Mayar (certified secure)
• Data kartu TIDAK disimpan di server kami
• PCI DSS compliant
• Enkripsi SSL/TLS

Privasi Data:
• Data meeting Kamu milik Kamu sepenuhnya
• Kami tidak menjual data ke pihak ketiga
• Kamu bisa hapus data kapan saja
• Kebijakan privasi yang transparan

Ada pertanyaan lain tentang keamanan? 🙏`
  },
  {
    keywords: ["terima kasih", "makasih", "thanks", "thank you", "thx"],
    patterns: [/terima.*kasih/i, /makasih/i, /thanks/i, /thank.*you/i, /thx/i],
    weight: 10,
    response: `Sama-sama, Kak! 😊

Senang bisa membantu. Kalau nanti ada pertanyaan lagi, jangan ragu untuk tanya ya!

Semoga sukses dengan Chaesa Live! 🚀`
  },
];

function generateSmartResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  if (!lowerMessage || lowerMessage.length < 2) {
    return "Maaf, bisa Kamu ulangi pertanyaannya? Saya siap membantu! 😊";
  }

  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    for (const pattern of entry.patterns) {
      if (pattern.test(lowerMessage)) {
        score += entry.weight * 4;
      }
    }

    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      if (lowerMessage.includes(kw)) {
        const kwWordCount = kw.split(/\s+/).length;
        score += entry.weight * (1 + kwWordCount);
        if (lowerMessage === kw) {
          score += entry.weight * 3;
        }
      }
    }

    const words = lowerMessage.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      for (const keyword of entry.keywords) {
        const kwWords = keyword.toLowerCase().split(/\s+/);
        for (const kwWord of kwWords) {
          if (kwWord.length > 3 && word === kwWord) {
            score += 2;
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 6) {
    return bestMatch.response;
  }

  return `Terima kasih sudah bertanya, Kak! 🤔

Saya belum punya jawaban spesifik untuk pertanyaan "${message}".

Tapi saya bisa membantu Kamu tentang:

📌 Tentang Platform — Apa itu Chaesa Live dan cara kerjanya
💰 Harga & Paket — Info lengkap paket Gratis, Pro, Business, 1 Tahun
🤖 AI Course Factory — Cara otomatis buat kursus dari meeting
🎬 Studio Mode & Audio — Setup streaming dan audio jernih
💳 Pembayaran — Metode bayar dan cara berlangganan
🔧 Bantuan Teknis — Solusi masalah kamera, audio, koneksi
📚 Marketplace — Cara jual kursus dan dapat penghasilan

Coba tanya dengan topik di atas, atau ketik "harga", "fitur", "cara mulai", dll.

Atau kalau mau bicara langsung dengan tim kami, ketik "hubungi CS". 😊`;
}

function detectEscalation(userMessage: string, botReply: string): boolean {
  const escalationKeywords = [
    "ngomong sama manusia", "bicara langsung", "bicara dengan cs",
    "bicara sama cs", "mau bicara dengan manusia", "mau komplain",
    "refund", "batal langganan", "bug parah", "error terus",
    "broken", "legal", "hukum", "hubungi cs",
  ];

  const userLower = userMessage.toLowerCase();
  if (escalationKeywords.some((keyword) => userLower.includes(keyword))) {
    return true;
  }

  const botLower = botReply.toLowerCase();
  if (botLower.includes("hubungi tim support") || botLower.includes("hubungi cs")) {
    return true;
  }

  return false;
}

function generateQuickReplies(userMessage: string): string[] {
  const lower = userMessage.toLowerCase();

  if (lower.match(/^(hi|hello|hey|halo|hai|p)\b/i) || lower.includes("selamat")) {
    return ["Apa itu Chaesa Live?", "Berapa harganya?", "Cara mulai?"];
  }

  if (lower.includes("harga") || lower.includes("biaya") || lower.includes("paket") || lower.includes("berapa")) {
    return ["Fitur paket Pro?", "Paket 1 tahun?", "Bandingkan dengan Zoom?"];
  }

  if (lower.includes("ai") || lower.includes("kursus") || lower.includes("course") || lower.includes("generate")) {
    return ["Berapa lama prosesnya?", "Format apa saja?", "Cara mulai?"];
  }

  if (lower.includes("obs") || lower.includes("audio") || lower.includes("studio") || lower.includes("stream")) {
    return ["Cara aktifkan Studio Mode?", "Masalah audio OBS?", "Original Sound?"];
  }

  if (lower.includes("jual") || lower.includes("cta") || lower.includes("sales") || lower.includes("marketplace")) {
    return ["Cara kerja Live CTA?", "Berapa komisi?", "Tips konversi?"];
  }

  if (lower.includes("error") || lower.includes("masalah") || lower.includes("gak bisa") || lower.includes("tidak bisa")) {
    return ["Masalah kamera", "Masalah audio", "Hubungi CS"];
  }

  return ["Apa itu Chaesa Live?", "Berapa harganya?", "Fitur unggulan?"];
}
