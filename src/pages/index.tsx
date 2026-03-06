import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { 
  Video, Users, Lock, Share2, Award, MessageSquare, 
  Mic, MonitorPlay, Shield, Sparkles, ArrowRight, 
  Zap, TrendingUp, DollarSign, Clock, CheckCircle,
  Star, PlayCircle, Rocket, Brain, Target, Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [stats, setStats] = useState({
    creators: 1234,
    courses: 5678,
    learners: 12340
  });

  // Debug toggle with Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Auth check:", { session: !!session, error });
        
        if (session && !error) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || "");
          console.log("User logged in:", session.user.email);
        } else {
          setIsLoggedIn(false);
          setUserEmail("");
          console.log("User not logged in");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUserEmail("");
      }
    };
    checkAuth();
  }, []);

  // Simulate real-time stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        creators: prev.creators + Math.floor(Math.random() * 3),
        courses: prev.courses + Math.floor(Math.random() * 5),
        learners: prev.learners + Math.floor(Math.random() * 10)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      // Just redirect to meeting page - validation will happen there
      router.push(`/meeting/${meetingCode.trim()}`);
    } else {
      toast({
        title: "Kode Meeting Diperlukan",
        description: "Silakan masukkan kode meeting untuk bergabung",
        variant: "destructive"
      });
    }
  };

  const handleStartMeeting = () => {
    const newMeetingId = Math.random().toString(36).substring(2, 15);
    router.push(`/meeting/${newMeetingId}`);
  };

  return (
    <>
      <SEO
        title="Chaesa Live - Ubah Meeting Jadi Kursus Micro-Learning yang Menghasilkan"
        description="Satu-satunya platform yang menggabungkan video conference, AI course generator, dan live commerce. Hemat 59% vs platform premium sambil cuan dari konten Anda."
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 overflow-x-hidden">
        {/* Header Navigation */}
        <header className="bg-white/80 dark:bg-black/20 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Chaesa Live</span>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Harga
                </Link>
                <Link href="/ai-studio" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  AI Studio
                </Link>
                <Link href="/micro-learning" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Micro-Learning
                </Link>
                <Link href="/schedule" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Jadwal Live
                </Link>
                <div className="relative group">
                  <button className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-1">
                    Creator Tools <Sparkles className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                    <Link href="/creator-dashboard" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Dashboard Kreator
                    </Link>
                    <Link href="/broadcast" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Broadcast & Marketing
                    </Link>
                    <Link href="/content-calendar" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Kalender Konten
                    </Link>
                  </div>
                </div>
              </nav>

              {/* Theme Toggle & Auth Buttons */}
              <div className="flex items-center gap-3">
                <ThemeSwitch />
                {!isLoggedIn ? (
                  <>
                    <Link href="/auth?mode=login">
                      <Button variant="ghost" className="text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-white/10">
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/auth?mode=register">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Daftar Gratis
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{userEmail || "User"}</span>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-white/10"
                      onClick={async () => {
                        try {
                          console.log("Logging out...");
                          await supabase.auth.signOut();
                          setIsLoggedIn(false);
                          setUserEmail("");
                          toast({
                            title: "Logout Berhasil",
                            description: "Anda telah keluar dari akun",
                          });
                          router.reload();
                        } catch (error) {
                          console.error("Logout error:", error);
                          toast({
                            title: "Error",
                            description: "Gagal logout, silakan coba lagi",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Limited Time Offer Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 text-center sticky top-0 z-50">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base font-semibold">
            <Gift className="w-5 h-5 animate-bounce" />
            <span>🎉 PROMO TERBATAS: Paket 1 Tahun Rp 999.000 (Hemat 16%!) - Khusus Kreator Serius</span>
            <Link href="/pricing">
              <Button size="sm" variant="secondary" className="ml-4">
                Ambil Sekarang →
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            {/* Trust Badge */}
            <Badge className="mb-6 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50 px-4 py-2">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Dipercaya oleh 1.000+ Kreator & Educator
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Ubah Meeting Anda<br />
              Jadi <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Kursus Micro-Learning</span><br />
              yang Menghasilkan dalam 15 Menit
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Berhenti buang waktu berjam-jam editing rekaman. AI kami otomatis memotong meeting 2 jam Anda jadi 20 modul siap jual lengkap dengan slides, quiz, dan podcast. <span className="text-purple-400 font-semibold">Plus live commerce untuk konversi 3-5x lebih tinggi.</span>
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                onClick={handleStartMeeting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Mulai Meeting Gratis Sekarang
              </Button>
              <Link href="#demo">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg rounded-xl"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Tonton Demo 2 Menit
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap gap-8 justify-center text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.creators.toLocaleString()}+</div>
                <div className="text-gray-500 dark:text-gray-400">Kreator Aktif</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.courses.toLocaleString()}+</div>
                <div className="text-gray-500 dark:text-gray-400">Kursus Dihasilkan</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.learners.toLocaleString()}+</div>
                <div className="text-gray-500 dark:text-gray-400">Pelajar Puas</div>
              </div>
            </div>
          </div>

          {/* Join Meeting Form */}
          <Card className="max-w-2xl mx-auto p-8 bg-white/80 dark:bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/10">
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-6">
                Gabung Meeting yang Sudah Ada
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Masukkan kode meeting (contoh: abc123xyz)"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg rounded-xl"
                >
                  Gabung Meeting
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Problem-Agitate-Solution Section */}
        <div className="bg-gray-50 dark:bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/50">
                Masalah dengan Platform Saat Ini
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Platform Meeting Konvensional <span className="text-red-400">Bunuh Produktivitas</span> Anda
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Clock,
                  problem: "Buang 10+ Jam",
                  description: "Download → Transcribe → Edit → Bikin slides → Bikin quiz = 10-20 jam per kursus",
                  color: "red"
                },
                {
                  icon: DollarSign,
                  problem: "Biaya Mahal",
                  description: "Platform meeting premium biaya Rp 200-300K/bulan. Plus gak bisa jual kursus langsung dari meeting.",
                  color: "orange"
                },
                {
                  icon: TrendingUp,
                  problem: "Kehilangan Konversi",
                  description: "Gak ada cara push CTA saat webinar. Viewer lupa beli setelah meeting selesai.",
                  color: "yellow"
                }
              ].map((item, idx) => (
                <Card key={idx} className={`p-6 bg-${item.color}-900/20 border-${item.color}-500/30 backdrop-blur-sm`}>
                  <item.icon className={`w-12 h-12 text-${item.color}-400 mb-4`} />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.problem}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Chaesa Live Selesaikan Semua Ini 👇
              </h3>
            </div>
          </div>
        </div>

        {/* 3 Killer Features */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50">
              Fitur Revolusioner
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              3 Fitur yang <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Gak Ada</span> di Kompetitor
            </h2>
          </div>

          <div className="space-y-16">
            {/* Feature 1: AI Course Factory */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/50">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Course Factory
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Bikin Kursus 1 Klik dengan AI Otomatis
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  Rekam 1 meeting → AI potong jadi 20 modul micro (5-7 menit tiap modul) → Otomatis bikin slides, quiz, podcast, ebook → Publish & jual dalam 15 menit.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "📊 Bikin slides PowerPoint otomatis",
                    "📖 Bikin ebook PDF & study guide",
                    "✅ Bikin quiz lengkap dengan penjelasan",
                    "🎙️ Podcast AI dengan 2 host berbincang",
                    "📱 Optimize untuk platform social media"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-purple-600 dark:text-purple-300 font-semibold mb-1">HEMAT WAKTU</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    90% (20 jam → 2 jam)
                  </div>
                </div>
                <Link href="/ai-studio">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Coba AI Studio <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8 flex items-center justify-center">
                  <Brain className="w-32 h-32 text-purple-400" />
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Hemat 90% Waktu
                </div>
              </div>
            </div>

            {/* Feature 2: Live Sales CTA */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="aspect-video bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900 dark:to-orange-900 rounded-2xl p-8 flex items-center justify-center">
                  <Zap className="w-32 h-32 text-orange-400" />
                </div>
                <div className="absolute -top-4 -left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Konversi 3-5x
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/50">
                  <Zap className="w-4 h-4 mr-2" />
                  Live Sales CTA
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Live Commerce Interaktif (Push CTA ke Semua Viewer)
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  Saat webinar/demo, push tombol "Beli Sekarang" langsung ke layar semua viewer dengan countdown timer. Impulse buying = konversi 3-5x lebih tinggi dari "link di chat".
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "💰 Push penawaran produk saat demo live",
                    "⏱️ Countdown timer untuk urgency",
                    "📊 Tracking klik real-time",
                    "🎯 CTA warna & copy bisa di-custom",
                    "💳 Checkout langsung via payment gateway"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-orange-600 dark:text-orange-300 font-semibold mb-1">BOOST KONVERSI</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    3-5x vs Webinar Tradisional
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-orange-600 to-pink-600">
                  Lihat Demo Live <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Feature 3: Studio Mode */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/50">
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Studio Mode
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Mode Studio untuk Content Creator & Streamer Profesional
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                  Platform meeting konvensional bunuh kualitas audio saat streaming? Kami fix itu. Toggle "Studio Mode" → Feed bersih (tanpa UI) + "Original Sound" (tanpa processing) = Sempurna untuk live streaming.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "🎥 Feed bersih (sembunyikan semua UI untuk capture)",
                    "🎵 Mode Original Sound (tanpa audio processing)",
                    "🎙️ Kompatibel dengan software streaming populer",
                    "🎬 Sempurna untuk live streaming profesional",
                    "⌨️ Keyboard shortcut (Ctrl+Shift+U)"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-green-600 dark:text-green-300 font-semibold mb-1">KUALITAS AUDIO</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Kualitas Studio (Tanpa Suara Robot)
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600">
                  Coba Studio Mode <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900 rounded-2xl p-8 flex items-center justify-center">
                  <MonitorPlay className="w-32 h-32 text-green-400" />
                </div>
                <div className="absolute -top-4 -right-4 bg-teal-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Zero Masalah Audio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="bg-gray-50 dark:bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50">
                Harga Transparan
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Hemat <span className="text-green-500 dark:text-green-400">Hingga 60%</span>, Dapat <span className="text-purple-600 dark:text-purple-400">10x Lebih Banyak Fitur</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-white/20">
                    <th className="p-4 text-gray-900 dark:text-white font-semibold">Fitur</th>
                    <th className="p-4 text-gray-900 dark:text-white font-semibold text-center">Platform A</th>
                    <th className="p-4 text-gray-900 dark:text-white font-semibold text-center">Platform B</th>
                    <th className="p-4 text-gray-900 dark:text-white font-semibold text-center bg-purple-100 dark:bg-purple-900/30">
                      <Badge className="mb-2">Rekomendasi</Badge>
                      <div>Chaesa Live Pro</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300">
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4 font-semibold">Harga/Bulan</td>
                    <td className="p-4 text-center">Rp 240.000</td>
                    <td className="p-4 text-center">Rp 130.000</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 font-bold text-green-600 dark:text-green-400">Rp 99.000</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Hemat vs Platform Premium</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center bg-purple-900/20 font-bold text-green-400">Hemat 59%</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Durasi Meeting</td>
                    <td className="p-4 text-center">Unlimited</td>
                    <td className="p-4 text-center">Unlimited</td>
                    <td className="p-4 text-center bg-purple-900/20">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">AI Course Generator</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Live Sales CTA</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Studio Mode (Streaming-Friendly)</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Original Sound (Fix Audio)</td>
                    <td className="p-4 text-center text-yellow-400">⚠️ Rumit</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅ Toggle 1x</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Podcast AI Otomatis</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td className="p-4">Micro-Learning Chunking</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-12">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg">
                  Lihat Harga Lengkap <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Use Cases by Persona */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50">
              Sempurna Untuk
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Siapa yang Paling Untung Pakai Chaesa Live?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                persona: "Kreator E-Course & Coach",
                pain: "Buang 10-20 jam bikin kursus dari rekaman meeting",
                solution: "Rekam 1 webinar → AI bikin 20 modul → Jual dalam 15 menit",
                roi: "Hemat 90% waktu, Cuan 5x lebih banyak kursus",
                cta: "Bikin Kursus Pertama",
                color: "blue"
              },
              {
                icon: DollarSign,
                persona: "Live Seller & E-Commerce",
                pain: "Konversi webinar rendah, susah closing",
                solution: "Push CTA saat demo live → Impulse buying → Konversi 3-5x",
                roi: "Tingkat konversi 3-5x lebih tinggi",
                cta: "Boost Penjualan",
                color: "orange"
              },
              {
                icon: Video,
                persona: "Content Creator & Streamer",
                pain: "Masalah audio saat streaming, gak bisa pakai platform meeting untuk broadcast",
                solution: "Studio Mode + Original Sound → Zero konflik audio",
                roi: "Kualitas streaming profesional",
                cta: "Fix Masalah Audio",
                color: "green"
              },
              {
                icon: Users,
                persona: "Corporate Trainer & HR",
                pain: "Platform training mahal, susah tracking progress",
                solution: "Rekam training sekali → Auto-chunk → Gamified learning",
                roi: "Hemat 80% biaya training",
                cta: "Mulai Corporate Training",
                color: "purple"
              }
            ].map((useCase, idx) => (
              <Card key={idx} className={`p-8 bg-${useCase.color}-900/20 border-${useCase.color}-500/30 backdrop-blur-sm hover:bg-${useCase.color}-900/30 transition-all`}>
                <useCase.icon className={`w-12 h-12 text-${useCase.color}-400 mb-4`} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{useCase.persona}</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-red-500 dark:text-red-400 font-semibold mb-1">❌ Masalah:</div>
                    <div className="text-gray-600 dark:text-gray-300">{useCase.pain}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-500 dark:text-green-400 font-semibold mb-1">✅ Solusi Chaesa:</div>
                    <div className="text-gray-600 dark:text-gray-300">{useCase.solution}</div>
                  </div>
                  <div className={`bg-${useCase.color}-500/10 border border-${useCase.color}-500/30 rounded-lg p-3`}>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ROI</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{useCase.roi}</div>
                  </div>
                </div>
                <Button className={`w-full bg-gradient-to-r from-${useCase.color}-600 to-${useCase.color}-700`}>
                  {useCase.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 dark:bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50">
                Kisah Sukses
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Apa Kata Early Adopter
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Kreator E-Course",
                  avatar: "SC",
                  quote: "Dulu bikin kursus 2 minggu. Sekarang 1 hari pakai AI Chaesa Live. Udah cuan Rp 50 juta dari 5 kursus!",
                  metric: "Revenue Rp 50 juta"
                },
                {
                  name: "Budi Santoso",
                  role: "Live Seller",
                  avatar: "BS",
                  quote: "Fitur Live CTA game changer banget. Konversi webinar gue naik dari 2% jadi 8%. Itu 4x lipat!",
                  metric: "Konversi naik 4x"
                },
                {
                  name: "Amanda Wijaya",
                  role: "YouTuber (150K subs)",
                  avatar: "AW",
                  quote: "Akhirnya gak ada masalah audio OBS lagi! Studio Mode bikin live stream gue jauh lebih bersih. Highly recommend buat content creator.",
                  metric: "Zero masalah audio"
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/50">
                    {testimonial.metric}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="p-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-300 dark:border-purple-500/30 backdrop-blur-sm text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/50">
              <Gift className="w-4 h-4 mr-2" />
              Khusus Kreator Serius
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Siap 10x Revenue Konten Anda?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Gabung 1.000+ kreator yang sudah cuan lebih dengan usaha lebih sedikit. Paket 1 Tahun <span className="font-bold text-yellow-400">Rp 999.000</span> - Semua fitur Pro, zero penyesalan. Ini investasi, bukan pengeluaran.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Ambil Pro Sekarang - Rp 99K/bulan
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleStartMeeting}
                className="border-2 border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 px-12 py-6 text-lg"
              >
                Coba Meeting Gratis Dulu
              </Button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tanpa kartu kredit • Batal kapan saja • Garansi uang kembali 7 hari
            </p>
          </Card>
        </div>

        {/* Trust Signals */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: "Keamanan Enterprise-Grade" },
              { icon: Award, label: "99,9% Uptime SLA" },
              { icon: Users, label: "Support 24/7" },
              { icon: Lock, label: "GDPR Compliant" }
            ].map((trust, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <trust.icon className="w-10 h-10 text-purple-400" />
                <div className="text-gray-600 dark:text-gray-300 font-semibold">{trust.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Panel (Ctrl+D to toggle) */}
        {showDebug && (
          <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-2xl border border-purple-500 max-w-sm z-50">
            <div className="text-xs font-mono space-y-2">
              <div className="font-bold text-purple-400 mb-2">DEBUG INFO (Ctrl+D to hide)</div>
              <div>isLoggedIn: <span className={isLoggedIn ? "text-green-400" : "text-red-400"}>{String(isLoggedIn)}</span></div>
              <div>userEmail: <span className="text-yellow-400">{userEmail || "(empty)"}</span></div>
              <div>meetingCode: <span className="text-yellow-400">{meetingCode || "(empty)"}</span></div>
              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={async () => {
                    const { data } = await supabase.auth.getSession();
                    console.log("Session data:", data);
                    alert(JSON.stringify(data, null, 2));
                  }}
                  className="text-xs bg-purple-600 px-2 py-1 rounded hover:bg-purple-700"
                >
                  Check Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-black/40 border-t border-gray-200 dark:border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                © 2026 Chaesa Live. Hak cipta dilindungi.
              </div>
              <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Harga</Link>
                <Link href="/ai-studio" className="hover:text-gray-900 dark:hover:text-white transition-colors">AI Studio</Link>
                <Link href="/micro-learning" className="hover:text-gray-900 dark:hover:text-white transition-colors">Micro-Learning</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}