import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Video, Eye, Users, TrendingUp, DollarSign,
  ArrowLeft, ArrowUpRight, ArrowDownRight,
  Sparkles, Radio, Send, BarChart3, Clock,
  PlayCircle, FileText, Mic, BookOpen,
  Plus, ChevronRight
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: any;
  color: string;
  bgColor: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: "video" | "course" | "podcast" | "article";
  views: number;
  engagement: number;
  revenue: number;
  date: string;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || "");
      }
    };
    checkAuth();
  }, []);

  const stats: StatCard[] = [
    {
      title: "Total Views",
      value: "24,832",
      change: "+12.5%",
      changeType: "up",
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Subscribers",
      value: "1,284",
      change: "+8.3%",
      changeType: "up",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Engagement Rate",
      value: "4.7%",
      change: "+0.8%",
      changeType: "up",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Revenue",
      value: "Rp 3.250.000",
      change: "-2.1%",
      changeType: "down",
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const recentContent: ContentItem[] = [
    {
      id: "1",
      title: "Workshop AI Course Factory - Sesi 1",
      type: "video",
      views: 3420,
      engagement: 5.2,
      revenue: 850000,
      date: "2025-06-01",
    },
    {
      id: "2",
      title: "Panduan Micro-Learning untuk Pemula",
      type: "course",
      views: 2180,
      engagement: 6.1,
      revenue: 1200000,
      date: "2025-05-28",
    },
    {
      id: "3",
      title: "Tips Monetisasi Konten Digital",
      type: "podcast",
      views: 1560,
      engagement: 4.8,
      revenue: 450000,
      date: "2025-05-25",
    },
    {
      id: "4",
      title: "Strategi Live Commerce 2025",
      type: "article",
      views: 980,
      engagement: 3.9,
      revenue: 320000,
      date: "2025-05-22",
    },
    {
      id: "5",
      title: "Demo Fitur Studio Mode",
      type: "video",
      views: 2750,
      engagement: 5.5,
      revenue: 680000,
      date: "2025-05-20",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return PlayCircle;
      case "course": return BookOpen;
      case "podcast": return Mic;
      case "article": return FileText;
      default: return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";
      case "course": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "podcast": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "article": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const quickActions = [
    {
      title: "Mulai Live",
      description: "Mulai sesi live streaming sekarang",
      icon: Radio,
      color: "from-red-600 to-pink-600",
      hoverColor: "hover:from-red-700 hover:to-pink-700",
      href: null as string | null,
      onClick: () => {
        const newMeetingId = Math.random().toString(36).substring(2, 15);
        router.push(`/meeting/${newMeetingId}`);
      },
    },
    {
      title: "Buat Konten",
      description: "Generate kursus dengan AI Studio",
      icon: Sparkles,
      color: "from-purple-600 to-blue-600",
      hoverColor: "hover:from-purple-700 hover:to-blue-700",
      href: "/ai-studio",
      onClick: null as (() => void) | null,
    },
    {
      title: "Broadcast",
      description: "Kirim pesan ke semua channel",
      icon: Send,
      color: "from-green-600 to-emerald-600",
      hoverColor: "hover:from-green-700 hover:to-emerald-700",
      href: "/broadcast",
      onClick: null as (() => void) | null,
    },
  ];

  return (
    <>
      <SEO
        title="Creator Dashboard - Chaesa Live"
        description="Pantau performa konten, analytics, dan kelola channel kreator Anda"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">Chaesa Live</span>
              </Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Creator Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitch />
              {isLoggedIn && (
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{userEmail}</span>
              )}
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Beranda
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Kreator</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Pantau performa dan kelola konten Anda</p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {range === "7d" ? "7 Hari" : range === "30d" ? "30 Hari" : "90 Hari"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === "up" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}>
                    {stat.changeType === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, idx) => {
              const content = (
                <Card
                  key={idx}
                  className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </Card>
              );

              if (action.href) {
                return (
                  <Link key={idx} href={action.href}>
                    {content}
                  </Link>
                );
              }

              return (
                <div key={idx} onClick={action.onClick || undefined}>
                  {content}
                </div>
              );
            })}
          </div>

          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performa Konten Terbaru</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Performa konten yang baru dipublikasikan</p>
              </div>
              <Link href="/ai-studio">
                <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentContent.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(item.type)}`}>
                            {item.type === "video" ? "Video" : item.type === "course" ? "Kursus" : item.type === "podcast" ? "Podcast" : "Artikel"}
                          </Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.date)}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">{item.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">{item.engagement}%</div>
                          <div className="text-xs text-gray-400">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600 dark:text-green-400">Rp {(item.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-gray-400">Revenue</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Channel</h3>
              <div className="space-y-3">
                {[
                  { name: "YouTube", views: 12400, color: "bg-red-500" },
                  { name: "Instagram", views: 6200, color: "bg-pink-500" },
                  { name: "TikTok", views: 4100, color: "bg-gray-800 dark:bg-white" },
                  { name: "LinkedIn", views: 2132, color: "bg-blue-600" },
                ].map((channel, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${channel.color}`} />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{channel.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{channel.views.toLocaleString()} views</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${channel.color}`}
                        style={{ width: `${(channel.views / 12400) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Jadwal Mendatang</h3>
              <div className="space-y-3">
                {[
                  { title: "Workshop AI Studio", date: "Senin, 9 Jun 2025", time: "14:00 WIB", status: "upcoming" },
                  { title: "Live Q&A Monetisasi", date: "Rabu, 11 Jun 2025", time: "19:00 WIB", status: "upcoming" },
                  { title: "Demo Fitur Baru", date: "Jumat, 13 Jun 2025", time: "10:00 WIB", status: "upcoming" },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Video className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{event.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{event.date} - {event.time}</div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                      Akan Datang
                    </Badge>
                  </div>
                ))}
              </div>
              <Link href="/schedule">
                <Button variant="ghost" size="sm" className="w-full mt-3 text-purple-600 dark:text-purple-400">
                  Lihat Semua Jadwal <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
