import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Star, Download, ArrowRight, Rocket, ExternalLink,
  TrendingUp, Zap, Filter, Grid3x3, List
} from "lucide-react";
import Link from "next/link";
import { ChaesaLogo } from "@/components/ChaesaLogo";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Footer } from "@/components/Footer";

const CATEGORIES = [
  { id: "all", label: "Semua", icon: "🔥" },
  { id: "bimtek", label: "BIMTEK & K3", icon: "🏗️" },
  { id: "sertifikasi", label: "Sertifikasi BNSP", icon: "🛡️" },
  { id: "ai-expert", label: "AI Expert Skills", icon: "🤖" },
  { id: "creator", label: "Creator Tools", icon: "🎬" },
  { id: "akademik", label: "Akademik", icon: "🎓" },
  { id: "competency", label: "Competency Templates", icon: "🎯" },
  { id: "corporate", label: "Corporate & HRD", icon: "🏢" },
  { id: "quiz", label: "Quiz & Asesmen", icon: "✍️" },
  { id: "analytics", label: "Analytics & Laporan", icon: "📊" },
  { id: "integrasi", label: "Integrasi & Tools", icon: "🔗" },
  { id: "personal", label: "Personal Learning", icon: "👤" },
];

const SORT_OPTIONS = ["Terpopuler", "Terbaru", "Top Rating", "Unggulan"];

const SKILLS = [
  {
    cat: "bimtek", icon: "⛑️", name: "K3 Umum Wajib Pack",
    desc: "Paket lengkap 12 modul K3 wajib: HIRARC, P3K, APD, bekerja di ketinggian, ruang terbatas, dan izin kerja berbahaya. Cocok untuk semua pekerja konstruksi.",
    author: "Tim BimtekKita", installs: 8420, rating: 4.9, badge: "Unggulan", href: "/bimtek-integration",
    tags: ["K3", "Wajib", "BNSP"], new: false,
  },
  {
    cat: "sertifikasi", icon: "🛡️", name: "SKK Simulator Pro",
    desc: "65+ soal latihan asesmen persis seperti ujian LSP BNSP. Analisa kelemahan per unit kompetensi, rencana intensif 3 minggu, dan prediksi kelulusan.",
    author: "Chaesa AI Team", installs: 6150, rating: 4.8, badge: "Top Rating", href: "/bimtek-integration",
    tags: ["SKK", "Quiz", "LSP"], new: false,
  },
  {
    cat: "ai-expert", icon: "🏛️", name: "AI Ahli Struktur Beton",
    desc: "Konsultasi perhitungan balok, kolom, pelat, dan fondasi. Berbasis SNI 2847 dan Eurocode. Jawab dalam detik lengkap dengan rumus dan tabel.",
    author: "Ir. Arif (AI)", installs: 5890, rating: 4.9, badge: "Unggulan", href: "/bimtek-integration",
    tags: ["Struktur", "SNI", "Beton"], new: false,
  },
  {
    cat: "creator", icon: "⚡", name: "Meeting → E-Course 15 Menit",
    desc: "Upload rekaman meeting/webinar → AI potong jadi 15–20 modul, buat quiz per modul, generate slide dan script podcast. Siap dijual via Mayar.id.",
    author: "Chaesa AI Team", installs: 12300, rating: 4.9, badge: "🔥 Terpopuler", href: "/ai-studio",
    tags: ["AI", "Creator", "Kursus"], new: false,
  },
  {
    cat: "akademik", icon: "🎙️", name: "Rekaman Kuliah → Ringkasan",
    desc: "Rekam perkuliahan atau les privat, AI auto-transkrip dan buat ringkasan + mind map + 10 soal latihan. Tersedia versi bahasa Indonesia.",
    author: "Chaesa AI Team", installs: 9870, rating: 4.8, badge: null, href: "/micro-learning",
    tags: ["Mahasiswa", "AI", "Ringkasan"], new: false,
  },
  {
    cat: "competency", icon: "🎯", name: "Template SKK Pelaksana Gedung",
    desc: "Template e-course 6-langkah SKKNI untuk Pelaksana Lapangan Pekerjaan Gedung (L2). Termasuk 15 unit kompetensi, referensi SNI, dan rubrik asesmen.",
    author: "BimtekKita", installs: 3240, rating: 4.7, badge: null, href: "/competency-builder",
    tags: ["SKKNI", "L2", "Gedung"], new: false,
  },
  {
    cat: "corporate", icon: "📊", name: "Skills Matrix Dashboard",
    desc: "Peta kompetensi seluruh tim vs standar jabatan. Alert SKK kedaluarsa, gap analysis per departemen, dan laporan PDF bulanan otomatis ke email.",
    author: "Chaesa Team", installs: 2780, rating: 4.8, badge: "Unggulan", href: "/skills-matrix",
    tags: ["HRD", "Matrix", "Dashboard"], new: false,
  },
  {
    cat: "bimtek", icon: "🛣️", name: "Modul Jalan & Jembatan Pack",
    desc: "18 modul BIMTEK khusus pekerjaan jalan dan jembatan: perkerasan lentur, rigid, drainase, jembatan beton, dan pengujian material. Standar Bina Marga.",
    author: "Tim BimtekKita", installs: 4120, rating: 4.7, badge: null, href: "/bimtek-integration",
    tags: ["Jalan", "Jembatan", "Bina Marga"], new: false,
  },
  {
    cat: "ai-expert", icon: "⚡", name: "AI Expert MEP Spesialis",
    desc: "Konsultasi mekanikal, elektrikal, dan plumbing. Hitung kapasitas AC, kabel listrik, pompa air, dan sistem pemadam kebakaran. Berbasis PUIL dan SNI.",
    author: "Eng. Sari (AI)", installs: 3650, rating: 4.8, badge: null, href: "/bimtek-integration",
    tags: ["MEP", "Listrik", "HVAC"], new: false,
  },
  {
    cat: "creator", icon: "🎙️", name: "AI Podcast Script Generator",
    desc: "Dari rekaman meeting atau teks, AI buat naskah podcast siap rekam: intro, 3 segmen, outro, dan show notes. Format 15–30 menit per episode.",
    author: "Chaesa AI Team", installs: 7230, rating: 4.7, badge: null, href: "/ai-studio",
    tags: ["Podcast", "Script", "Audio"], new: false,
  },
  {
    cat: "quiz", icon: "✍️", name: "Quiz Builder K3 Konstruksi",
    desc: "Buat quiz K3 kustom dari materi BIMTEK Anda. Pilih jumlah soal (10–50), level kesulitan, dan tipe soal. AI buat soal + kunci jawaban + pembahasan otomatis.",
    author: "Chaesa AI Team", installs: 5460, rating: 4.9, badge: "Top Rating", href: "/sertifikasi",
    tags: ["Quiz", "K3", "Custom"], new: true,
  },
  {
    cat: "analytics", icon: "📈", name: "PKB Progress Tracker",
    desc: "Lacak 150 jam PKB tahunan otomatis. Setiap modul selesai = jam PKB tercatat. Dashboard visual per kategori, notifikasi 80% target, dan laporan untuk LSP.",
    author: "BimtekKita", installs: 6780, rating: 4.8, badge: "Unggulan", href: "/bimtek-integration",
    tags: ["PKB", "Tracker", "BNSP"], new: false,
  },
  {
    cat: "competency", icon: "🕸️", name: "Radar Chart Kompetensi",
    desc: "Visualisasi spider chart interaktif seluruh kompetensi Anda vs standar jabatan target. Identifikasi gap, cetak PDF, dan bagikan ke HR atau klien.",
    author: "Chaesa Team", installs: 4320, rating: 4.7, badge: null, href: "/competency-passport",
    tags: ["Radar", "Visual", "Gap"], new: false,
  },
  {
    cat: "bimtek", icon: "⚙️", name: "Modul MEP Gedung Lengkap",
    desc: "22 modul BIMTEK mekanikal, elektrikal, dan plumbing untuk gedung bertingkat. Meliputi instalasi, commissioning, testing, dan maintenance. SNI & PUIL.",
    author: "Tim BimtekKita", installs: 3890, rating: 4.6, badge: null, href: "/bimtek-integration",
    tags: ["MEP", "Gedung", "Instalasi"], new: false,
  },
  {
    cat: "sertifikasi", icon: "📋", name: "Panduan Sertifikasi BNSP Step-by-Step",
    desc: "Alur lengkap sertifikasi: dokumen yang dibutuhkan, cara memilih LSP, biaya per skema, jadwal asesmen, dan tips lolos asesmen portofolio + wawancara.",
    author: "BimtekKita", installs: 8930, rating: 4.9, badge: "Top Rating", href: "/bimtek-integration",
    tags: ["BNSP", "LSP", "Panduan"], new: false,
  },
  {
    cat: "akademik", icon: "🎓", name: "Portfolio Kerja dari Skripsi/TA",
    desc: "Upload tugas akhir atau skripsi → AI ekstrak kompetensi, buat Competency Passport awal, dan sarankan jalur karir + SKK yang relevan untuk fresh graduate.",
    author: "Chaesa AI Team", installs: 2340, rating: 4.7, badge: null, href: "/competency-builder",
    tags: ["Fresh Graduate", "Portfolio", "Karir"], new: true,
  },
  {
    cat: "integrasi", icon: "📱", name: "Caption Multi-Platform AI",
    desc: "Dari satu rekaman, AI generate caption untuk Instagram (carousel), TikTok, LinkedIn, Twitter/X secara bersamaan. Tone, hashtag, dan panjang disesuaikan per platform.",
    author: "Chaesa AI Team", installs: 9120, rating: 4.8, badge: "🔥 Terpopuler", href: "/ai-studio",
    tags: ["Caption", "Social Media", "AI"], new: false,
  },
  {
    cat: "corporate", icon: "🎓", name: "Internal Training Builder",
    desc: "Upload SOP atau prosedur kerja perusahaan → AI buat modul pelatihan internal interaktif + quiz kompetensi awal + sertifikat internal untuk setiap karyawan.",
    author: "Chaesa Team", installs: 1980, rating: 4.8, badge: null, href: "/competency-builder",
    tags: ["Internal", "Onboarding", "SOP"], new: true,
  },
  {
    cat: "ai-expert", icon: "⛏️", name: "AI Expert Geoteknik & Fondasi",
    desc: "Konsultasi jenis fondasi, daya dukung tiang, penyelidikan tanah, dan perbaikan tanah lunak. Berbasis data SPT, CPT, dan SNI 8460.",
    author: "Dr. Rini (AI)", installs: 2870, rating: 4.8, badge: null, href: "/bimtek-integration",
    tags: ["Geoteknik", "Fondasi", "SPT"], new: false,
  },
  {
    cat: "personal", icon: "🗺️", name: "Jalur Karir Konstruksi Personalised",
    desc: "Masukkan posisi saat ini dan target jabatan → AI rancangkan jalur belajar + SKK yang diperlukan + timeline realistis dengan estimasi biaya dan waktu.",
    author: "Chaesa AI Team", installs: 5670, rating: 4.8, badge: "Unggulan", href: "/learning-path",
    tags: ["Karir", "Personalisasi", "Timeline"], new: false,
  },
  {
    cat: "quiz", icon: "🏆", name: "Simulasi Ujian SMK Teknik",
    desc: "Bank soal 200+ untuk SMK Teknik: Bangunan, Elektro, Mekatronika. Dikelompokkan per KD, ada mode latihan dan simulasi ujian nasional dengan timer.",
    author: "Chaesa Edu", installs: 7640, rating: 4.7, badge: null, href: "/sertifikasi",
    tags: ["SMK", "Ujian", "Teknik"], new: false,
  },
  {
    cat: "creator", icon: "🖥️", name: "AI Slide Generator",
    desc: "Generate presentasi profesional dari rekaman kuliah, meeting, atau teks. Output: PowerPoint + PDF, desain clean, cocok untuk webinar, pitch, dan kursus online.",
    author: "Chaesa AI Team", installs: 8340, rating: 4.7, badge: null, href: "/ai-studio",
    tags: ["Slide", "Presentasi", "PowerPoint"], new: false,
  },
  {
    cat: "bimtek", icon: "🏗️", name: "K3 Konstruksi Tingkat Lanjut",
    desc: "Modul K3 lanjutan untuk supervisor dan manajer: inspeksi keselamatan, investigasi kecelakaan, manajemen K3 proyek, dan audit OHSAS 18001/ISO 45001.",
    author: "Tim BimtekKita", installs: 3210, rating: 4.8, badge: null, href: "/bimtek-integration",
    tags: ["K3", "Supervisor", "ISO 45001"], new: false,
  },
  {
    cat: "analytics", icon: "📊", name: "Training ROI Calculator",
    desc: "Hitung return on investment pelatihan tim: bandingkan biaya training vs peningkatan produktivitas, pengurangan error, dan compliance rate SKK. Laporan Excel.",
    author: "Chaesa Team", installs: 1560, rating: 4.6, badge: null, href: "/skills-matrix",
    tags: ["ROI", "Analytics", "HRD"], new: true,
  },
  {
    cat: "sertifikasi", icon: "📝", name: "Portofolio Asesmen Builder",
    desc: "Bantu siapkan dokumen portofolio untuk asesmen LSP: format bukti kerja, foto dokumentasi, surat pengalaman kerja, dan log aktivitas sesuai unit kompetensi.",
    author: "BimtekKita", installs: 4230, rating: 4.8, badge: null, href: "/competency-builder",
    tags: ["Portofolio", "LSP", "Dokumen"], new: false,
  },
  {
    cat: "personal", icon: "⏰", name: "Morning Briefing Kompetensi",
    desc: "Setiap pagi: ringkasan modul hari ini, reminder quiz yang belum selesai, 1 tips dari AI Expert, dan update PKB. Dikirim via notifikasi atau email.",
    author: "Chaesa Team", installs: 3890, rating: 4.7, badge: null, href: "/dashboard",
    tags: ["Briefing", "Reminder", "PKB"], new: true,
  },
  {
    cat: "integrasi", icon: "🧮", name: "9 Kalkulasi Teknik Sipil",
    desc: "Kalkulator teknik sipil: beton, tulangan, baja, campuran aspal, kapasitas tiang, galian tanah, debit air, beban angin, dan pondasi. Output tabel dan formula.",
    author: "BimtekKita", installs: 6780, rating: 4.9, badge: "Top Rating", href: "/bimtek-integration",
    tags: ["Kalkulator", "Sipil", "Tools"], new: false,
  },
  {
    cat: "competency", icon: "💼", name: "Template SKK Project Manager",
    desc: "Template e-course 6-langkah untuk Manajer Proyek Konstruksi (L3). 18 unit kompetensi, tools WBS + S-Curve, simulasi proyek, dan latihan kontrak.",
    author: "BimtekKita", installs: 2150, rating: 4.7, badge: null, href: "/competency-builder",
    tags: ["PM", "SKKNI", "L3"], new: false,
  },
  {
    cat: "corporate", icon: "🔔", name: "Alert SKK Kedaluarsa",
    desc: "Monitoring otomatis masa berlaku SKK seluruh karyawan. Alert 3 bulan sebelum kedaluarsa, rekomendasi modul perpanjangan, dan laporan compliance ke manajemen.",
    author: "Chaesa Team", installs: 2430, rating: 4.8, badge: null, href: "/skills-matrix",
    tags: ["Alert", "SKK", "Compliance"], new: true,
  },
  {
    cat: "ai-expert", icon: "⚖️", name: "AI Konsultan Kontrak Konstruksi",
    desc: "Analisa klausul kontrak, interpretasi FIDIC/SPK, hitung klaim keterlambatan, dan draft surat teguran. Berbasis hukum konstruksi Indonesia.",
    author: "Pak Eko Legal (AI)", installs: 2680, rating: 4.7, badge: null, href: "/bimtek-integration",
    tags: ["Kontrak", "FIDIC", "Klaim"], new: false,
  },
  {
    cat: "akademik", icon: "📖", name: "Storybook Visual Learning",
    desc: "Materi belajar teknik dalam format cerita visual interaktif. Cocok untuk pelajar SMA/SMK: fisika bangunan, mekanika, dan dasar konstruksi dengan ilustrasi.",
    author: "Chaesa Edu", installs: 4870, rating: 4.7, badge: null, href: "/storybook",
    tags: ["Visual", "SMA/SMK", "Interaktif"], new: false,
  },
];

const BADGE_COLORS: Record<string, string> = {
  "Unggulan": "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  "Top Rating": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  "🔥 Terpopuler": "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export default function ChaesaHub() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("Terpopuler");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = [...SKILLS];
    if (activeCategory !== "all") result = result.filter(s => s.cat === activeCategory);
    if (search.trim()) result = result.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === "Terpopuler") result.sort((a, b) => b.installs - a.installs);
    else if (sortBy === "Top Rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Terbaru") result.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
    else if (sortBy === "Unggulan") result = result.filter(s => s.badge).concat(result.filter(s => !s.badge));
    return result;
  }, [activeCategory, search, sortBy]);

  return (
    <>
      <SEO
        title="ChaesaHub — Modul & Skill Library | Chaesa Live × BimtekKita"
        description="Temukan 30+ modul BIMTEK, template kompetensi, AI Expert skills, dan tools kreator. Aktifkan dalam satu klik dan tingkatkan kompetensi Anda."
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* Header */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <ChaesaLogo size={30} />
                <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Chaesa</span>
                <span className="text-gray-400 dark:text-gray-600">Hub</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Beranda</Link>
              <Link href="/platform" className="text-purple-600 dark:text-purple-400 font-semibold">Platform</Link>
              <Link href="/bimtek-integration" className="text-orange-600 dark:text-orange-400 font-semibold">BimtekKita</Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitch />
              <Link href="/"><Button variant="outline" size="sm" className="text-xs">← Beranda</Button></Link>
              <Link href="/auth"><Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">Mulai Gratis</Button></Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/40">
              30+ Modul & Skills Tersedia
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Perluas Kemampuan Anda dengan{" "}
              <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                Community Skills
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Otomasi alur belajar, tambah integrasi, dan buka kapabilitas baru. Semua dibangun oleh tim Chaesa dan komunitas Indonesia.
            </p>
            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari skill... (cth: K3, SKK, podcast, onboarding)"
                className="pl-11 pr-4 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-purple-400 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar categories */}
            <aside className="lg:w-56 shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-20">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kategori</p>
                <div className="space-y-0.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                        activeCategory === cat.id
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> skill
                  </span>
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">× hapus filter</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          sortBy === s ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {/* View toggle */}
                  <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                    <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                      <Grid3x3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid / List */}
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Skill tidak ditemukan</p>
                  <p className="text-sm">Coba kata kunci lain atau hapus filter</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((skill, i) => (
                    <SkillCard key={i} skill={skill} mode="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((skill, i) => (
                    <SkillCard key={i} skill={skill} mode="list" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-4 mt-12">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl font-extrabold mb-3">Ingin Skill Anda Masuk ChaesaHub?</h2>
            <p className="text-white/80 mb-8">Buat template kompetensi, modul BIMTEK kustom, atau integrasi tools — submit ke ChaesaHub dan bantu komunitas Indonesia naik kompetensi.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-8 py-3 text-base rounded-xl">
                  <Rocket className="w-5 h-5 mr-2" /> Mulai Buat Skill
                </Button>
              </Link>
              <Link href="/platform">
                <Button variant="outline" className="border-white/50 text-white hover:bg-white/20 px-8 py-3 text-base rounded-xl">
                  Lihat Platform Overview
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

function SkillCard({ skill, mode }: { skill: typeof SKILLS[0]; mode: "grid" | "list" }) {
  const catObj = CATEGORIES.find(c => c.id === skill.cat);
  if (mode === "list") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all p-4 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0">{skill.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{skill.name}</h3>
            {skill.badge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${BADGE_COLORS[skill.badge] || "bg-gray-100 text-gray-500"}`}>{skill.badge}</span>}
            {skill.new && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold">Baru</span>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{skill.desc}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{skill.rating}</div>
          <div className="flex items-center gap-1"><Download className="w-3 h-3" />{skill.installs.toLocaleString("id-ID")}</div>
          <Link href={skill.href}>
            <Button size="sm" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 text-xs h-8 px-4 rounded-lg">Aktifkan</Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all p-5 flex flex-col group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">{skill.icon}</div>
        <div className="flex flex-col items-end gap-1">
          {skill.badge && <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${BADGE_COLORS[skill.badge] || "bg-gray-100 text-gray-500"}`}>{skill.badge}</span>}
          {skill.new && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold">Baru</span>}
        </div>
      </div>
      <div className="mb-0.5">
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{catObj?.icon} {catObj?.label}</span>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 leading-snug">{skill.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">{skill.desc}</p>
      <div className="flex flex-wrap gap-1 mb-4">
        {skill.tags.map((t, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{skill.rating}</div>
          <div className="flex items-center gap-1"><Download className="w-3 h-3" />{skill.installs.toLocaleString("id-ID")}</div>
        </div>
        <Link href={skill.href}>
          <Button size="sm" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 text-xs h-7 px-3 rounded-lg">
            Aktifkan
          </Button>
        </Link>
      </div>
    </div>
  );
}
