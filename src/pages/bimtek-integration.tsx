import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, Award, Target, ExternalLink, Zap, CheckCircle,
  GraduationCap, BarChart3, Shield, Users, Clock, Star,
  ArrowRight, Building2, Wrench, Layers, TrendingUp, FileText,
  ChevronDown, ChevronUp, Play, Brain, Map, Trophy, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useAuth, getUserStorageKey } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BIMTEK_BASE = "https://bimtek.replit.app";

const BIMTEK_MODULES = [
  { id: "bg01", category: "Sipil Gedung", title: "Teknik Fondasi Gedung", duration: "4 jam", level: "Ahli", pkb: 10, icon: Building2 },
  { id: "bg02", category: "Sipil Gedung", title: "Struktur Beton Bertulang", duration: "6 jam", level: "Ahli", pkb: 12, icon: Building2 },
  { id: "bg03", category: "Sipil Gedung", title: "Struktur Baja Gedung", duration: "6 jam", level: "Ahli", pkb: 12, icon: Building2 },
  { id: "bg04", category: "Sipil Gedung", title: "Beton Pracetak", duration: "4 jam", level: "Ahli", pkb: 8, icon: Building2 },
  { id: "bg05", category: "Sipil Gedung", title: "Metode Pelaksanaan Konstruksi", duration: "5 jam", level: "Ahli", pkb: 10, icon: Building2 },
  { id: "k3_01", category: "K3", title: "K3 Konstruksi Gedung", duration: "8 jam", level: "Wajib", pkb: 15, icon: Shield },
  { id: "k3_02", category: "K3", title: "Pencegahan Kecelakaan Kerja", duration: "4 jam", level: "Ahli", pkb: 10, icon: Shield },
  { id: "k3_03", category: "K3", title: "APD dan Penanganannya", duration: "3 jam", level: "Teknisi", pkb: 6, icon: Shield },
  { id: "k3_04", category: "K3", title: "P3K di Tempat Kerja", duration: "4 jam", level: "Wajib", pkb: 8, icon: Shield },
  { id: "k3_05", category: "K3", title: "Keselamatan Kerja Tinggi", duration: "4 jam", level: "Ahli", pkb: 10, icon: Shield },
  { id: "jl01", category: "Jalan", title: "Desain Jalan Raya", duration: "6 jam", level: "Ahli", pkb: 12, icon: Map },
  { id: "jl02", category: "Jalan", title: "Perkerasan Jalan", duration: "5 jam", level: "Ahli", pkb: 10, icon: Map },
  { id: "jl03", category: "Jalan", title: "Jembatan Beton", duration: "6 jam", level: "Ahli", pkb: 12, icon: Map },
  { id: "jl04", category: "Jalan", title: "Jembatan Baja", duration: "6 jam", level: "Ahli", pkb: 12, icon: Map },
  { id: "jl05", category: "Jalan", title: "Drainase Jalan", duration: "4 jam", level: "Ahli", pkb: 8, icon: Map },
  { id: "el01", category: "Elektrikal", title: "Instalasi Listrik Gedung", duration: "6 jam", level: "Ahli", pkb: 12, icon: Zap },
  { id: "el02", category: "Elektrikal", title: "Sistem Proteksi Listrik", duration: "5 jam", level: "Ahli", pkb: 10, icon: Zap },
  { id: "el03", category: "Elektrikal", title: "PLTS Gedung", duration: "5 jam", level: "Ahli", pkb: 10, icon: Zap },
  { id: "el04", category: "Elektrikal", title: "Sistem HVAC", duration: "4 jam", level: "Ahli", pkb: 8, icon: Zap },
  { id: "el05", category: "Elektrikal", title: "Trafo dan Distribusi", duration: "4 jam", level: "Ahli", pkb: 8, icon: Zap },
  { id: "mk01", category: "Mekanikal", title: "Plumbing Gedung", duration: "5 jam", level: "Ahli", pkb: 10, icon: Wrench },
  { id: "mk02", category: "Mekanikal", title: "Sistem Sprinkler", duration: "4 jam", level: "Ahli", pkb: 8, icon: Wrench },
  { id: "mj01", category: "Manajemen", title: "Manajemen Proyek Konstruksi", duration: "8 jam", level: "Ahli", pkb: 15, icon: BarChart3 },
  { id: "mj02", category: "Manajemen", title: "RAB dan Estimasi Biaya", duration: "6 jam", level: "Ahli", pkb: 12, icon: BarChart3 },
  { id: "mj03", category: "Manajemen", title: "Schedule & Timeline Proyek", duration: "5 jam", level: "Ahli", pkb: 10, icon: BarChart3 },
  { id: "mj04", category: "Manajemen", title: "Manajemen Risiko Proyek", duration: "4 jam", level: "Ahli", pkb: 10, icon: BarChart3 },
  { id: "sr01", category: "Sertifikasi", title: "Proses SKK & Sertifikasi BNSP", duration: "3 jam", level: "Wajib", pkb: 6, icon: Award },
  { id: "sr02", category: "Sertifikasi", title: "Regulasi Jasa Konstruksi", duration: "4 jam", level: "Wajib", pkb: 8, icon: Award },
  { id: "iso01", category: "ISO Management", title: "ISO 9001:2015 Manajemen Mutu", duration: "6 jam", level: "Ahli", pkb: 12, icon: Star },
  { id: "iso02", category: "ISO Management", title: "ISO 45001:2018 K3", duration: "6 jam", level: "Ahli", pkb: 12, icon: Star },
];

const SKK_POSITIONS = [
  { code: "B001", title: "Ahli Madya Teknik Bangunan Gedung", sub: "B", level: "Ahli Madya", req: "S1 + 5th + 120 jam" },
  { code: "B002", title: "Ahli Teknik Bangunan Gedung", sub: "B", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "B003", title: "Teknisi Teknik Bangunan Gedung", sub: "B", level: "Teknisi", req: "D3 + 2th + 40 jam" },
  { code: "B004", title: "Pelaksana Teknik Bangunan Gedung", sub: "B", level: "Pelaksana", req: "SMA + 1th + 24 jam" },
  { code: "B007", title: "Manager Proyek Gedung", sub: "B", level: "Manager", req: "S2 + 7th + 160 jam" },
  { code: "B008", title: "Supervisor Konstruksi Gedung", sub: "B", level: "Supervisor", req: "S1 + 3th + 40 jam" },
  { code: "C001", title: "Ahli Madya Teknik Sipil", sub: "C", level: "Ahli Madya", req: "S1 + 5th + 120 jam" },
  { code: "C002", title: "Ahli Teknik Sipil", sub: "C", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "C003", title: "Teknisi Teknik Sipil", sub: "C", level: "Teknisi", req: "D3 + 2th + 40 jam" },
  { code: "C005", title: "Ahli Geoteknik", sub: "C", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "C007", title: "Ahli Struktur", sub: "C", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "D001", title: "Ahli Madya Teknik Mekanikal", sub: "D", level: "Ahli Madya", req: "S1 + 5th + 120 jam" },
  { code: "D002", title: "Ahli Teknik Mekanikal", sub: "D", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "D004", title: "Ahli Plumbing", sub: "D", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "D005", title: "Ahli HVAC", sub: "D", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "E001", title: "Ahli Madya Teknik Elektrikal", sub: "E", level: "Ahli Madya", req: "S1 + 5th + 120 jam" },
  { code: "E002", title: "Ahli Teknik Elektrikal", sub: "E", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "E003", title: "Teknisi Teknik Elektrikal", sub: "E", level: "Teknisi", req: "D3 + 2th + 40 jam" },
  { code: "F001", title: "Ahli Madya Teknik Jalan", sub: "F", level: "Ahli Madya", req: "S1 + 5th + 120 jam" },
  { code: "F002", title: "Ahli Teknik Jalan", sub: "F", level: "Ahli", req: "S1 + 3th + 80 jam" },
  { code: "G001", title: "Ahli Teknik Jembatan", sub: "G", level: "Ahli", req: "S1 + 3th + 80 jam" },
];

const AI_EXPERTS = [
  { icon: "🏗️", name: "Ahli Teknik Sipil", desc: "Fondasi, struktur, beton, baja", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700" },
  { icon: "🏛️", name: "Arsitek & Interior", desc: "Desain, interior, landscape", color: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700" },
  { icon: "⚙️", name: "Teknik Mekanikal", desc: "HVAC, plumbing, fire protection", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700" },
  { icon: "⚡", name: "Teknik Elektrikal", desc: "Listrik, distribusi, generator", color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700" },
  { icon: "🦺", name: "K3 Konstruksi", desc: "Keselamatan, kesehatan kerja", color: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700" },
  { icon: "📊", name: "Manajemen Proyek", desc: "Schedule, cost, quality", color: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700" },
  { icon: "📜", name: "Sertifikasi & Regulasi", desc: "SKK, BNSP, perizinan", color: "bg-teal-100 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700" },
  { icon: "🌿", name: "Tata Lingkungan", desc: "AMDAL, waste management", color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700" },
];

const CATEGORIES = ["Semua", "Sipil Gedung", "K3", "Jalan", "Elektrikal", "Mekanikal", "Manajemen", "Sertifikasi", "ISO Management"];
const SKK_SUBS = ["Semua", "B - Gedung", "C - Sipil", "D - Mekanikal", "E - Elektrikal", "F - Jalan", "G - Jembatan"];

const LEVEL_COLOR: Record<string, string> = {
  "Wajib": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Ahli": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Teknisi": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Ahli Madya": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Manager": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Supervisor": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "Pelaksana": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function BimtekIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const storageKey = getUserStorageKey(user, "bimtek_pkb");

  const [activeTab, setActiveTab] = useState<"modules" | "skk" | "experts" | "certify">("modules");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [skkFilter, setSkkFilter] = useState("Semua");
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [expandedSkk, setExpandedSkk] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCompletedModules(new Set(JSON.parse(saved)));
    } catch {}
  }, [storageKey]);

  const toggleModule = (id: string) => {
    setCompletedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
    toast({ title: completedModules.has(id) ? "Modul ditandai belum selesai" : "✅ Modul ditandai selesai!", description: "PKB Points diperbarui." });
  };

  const filteredModules = BIMTEK_MODULES.filter(m =>
    categoryFilter === "Semua" || m.category === categoryFilter
  );
  const filteredSkk = SKK_POSITIONS.filter(p =>
    skkFilter === "Semua" || p.sub === skkFilter.split(" ")[0]
  );

  const totalPkb = BIMTEK_MODULES.filter(m => completedModules.has(m.id)).reduce((a, m) => a + m.pkb, 0);
  const completedCount = completedModules.size;
  const pkbTarget = 150;
  const pkbPercent = Math.min((totalPkb / pkbTarget) * 100, 100);

  return (
    <>
      <SEO
        title="BimtekKita Integration - Chaesa Live"
        description="Platform terintegrasi Chaesa Live × BimtekKita: BIMTEK konstruksi, SKK/BNSP tracking, PKB Points, dan AI Expert Konstruksi."
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-orange-950 dark:to-yellow-950">
        <PageHeader title="BimtekKita Integration" icon={Building2} backHref="/" backLabel="Beranda" />

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)" }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30">Chaesa Live × BimtekKita</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">Konstruksi Indonesia</Badge>
                </div>
                <h1 className="text-2xl font-bold mb-1">Platform Pelatihan Konstruksi Terintegrasi</h1>
                <p className="text-orange-100 text-sm max-w-xl">157 modul BIMTEK, 334 posisi SKK/BNSP, 8 AI Expert, dan tools kalkulasi konstruksi — langsung terhubung dengan Competency Passport Anda di Chaesa Live.</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <a href={BIMTEK_BASE} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-orange-700 hover:bg-orange-50 font-bold w-full">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Buka BimtekKita
                  </Button>
                </a>
                <Link href="/competency-passport">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/20 bg-white/10 w-full">
                    <Shield className="w-4 h-4 mr-1.5" /> Competency Passport
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* PKB Progress Panel */}
          <Card className="p-5 border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" /> PKB Points Tracker
                  <span className="text-xs font-normal text-gray-500">(Pengembangan Keprofesian Berkelanjutan)</span>
                </h2>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalPkb}</span>
                  <span className="text-gray-400">/ {pkbTarget} PKB</span>
                  <Badge className={`text-xs ${totalPkb >= pkbTarget ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"}`}>
                    {totalPkb >= pkbTarget ? "🏆 Target Tercapai!" : `Sisa ${pkbTarget - totalPkb} PKB`}
                  </Badge>
                </div>
                <Progress value={pkbPercent} className="h-3 mb-1" />
                <p className="text-xs text-gray-500">{completedCount} dari {BIMTEK_MODULES.length} modul selesai • {pkbPercent.toFixed(0)}% dari target tahunan</p>
              </div>
              <div className="grid grid-cols-3 gap-3 shrink-0">
                {[
                  { label: "Modul Selesai", value: completedCount, color: "text-green-600 dark:text-green-400" },
                  { label: "PKB Diraih", value: totalPkb, color: "text-orange-600 dark:text-orange-400" },
                  { label: "SKK Posisi", value: SKK_POSITIONS.length, color: "text-blue-600 dark:text-blue-400" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Modul BIMTEK", value: "157+", icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", href: `${BIMTEK_BASE}/bimtek` },
              { label: "Posisi SKK", value: "334", icon: Award, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", href: `${BIMTEK_BASE}/sertifikasi` },
              { label: "Soal Quiz", value: "65+", icon: Target, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", href: `${BIMTEK_BASE}/quiz` },
              { label: "AI Experts", value: "8", icon: Brain, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", href: `${BIMTEK_BASE}/chat` },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">
                <Card className={`p-4 border border-gray-200 dark:border-gray-700 ${s.bg} hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </Card>
              </a>
            ))}
          </div>

          {/* View Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "modules", label: "Modul BIMTEK", icon: BookOpen },
              { id: "skk", label: "Database SKK", icon: Award },
              { id: "experts", label: "AI Experts", icon: Brain },
              { id: "certify", label: "Alur Sertifikasi", icon: CheckCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  activeTab === id
                    ? "bg-orange-600 text-white border-orange-600 shadow"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* BIMTEK Modules Tab */}
          {activeTab === "modules" && (
            <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> Modul Pelatihan BIMTEK
                  <span className="text-sm font-normal text-gray-500">({filteredModules.length} modul ditampilkan)</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <a href={`${BIMTEK_BASE}/bimtek`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-300 hover:bg-orange-50">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Buka di BimtekKita
                    </Button>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModules.map(m => {
                  const Icon = m.icon;
                  const done = completedModules.has(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`group p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        done
                          ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-gray-800"
                      }`}
                      onClick={() => toggleModule(m.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-green-500" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                            {done ? <CheckCircle className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                          </div>
                          <Badge className={`text-[10px] px-1.5 py-0.5 ${LEVEL_COLOR[m.level] || LEVEL_COLOR["Ahli"]}`}>{m.level}</Badge>
                        </div>
                        <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">+{m.pkb} PKB</span>
                      </div>
                      <h3 className={`font-semibold text-sm mb-1 ${done ? "text-green-700 dark:text-green-300 line-through" : "text-gray-900 dark:text-white"}`}>{m.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.duration}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500`}>{m.category}</span>
                      </div>
                      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`${BIMTEK_BASE}/bimtek`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                          <span className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"><Play className="w-2.5 h-2.5" />Buka Modul</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">Klik modul untuk menandai selesai dan menambah PKB points Anda. Modul lengkap tersedia di BimtekKita.</p>
            </Card>
          )}

          {/* SKK Database Tab */}
          {activeTab === "skk" && (
            <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" /> Database Posisi SKK Konstruksi
                  <span className="text-sm font-normal text-gray-500">({filteredSkk.length} dari 334 posisi)</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  <select value={skkFilter} onChange={e => setSkkFilter(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {SKK_SUBS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <a href={`${BIMTEK_BASE}/sertifikasi`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-8 text-xs text-purple-600 border-purple-300 hover:bg-purple-50">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Cari Semua Posisi
                    </Button>
                  </a>
                </div>
              </div>

              {/* SKK Tingkat Table */}
              <div className="mb-5 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-purple-50 dark:bg-purple-900/20">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-purple-600 border border-gray-200 dark:border-gray-700">Tingkat SKK</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-purple-600 border border-gray-200 dark:border-gray-700">Pendidikan</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-purple-600 border border-gray-200 dark:border-gray-700">Pengalaman</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-purple-600 border border-gray-200 dark:border-gray-700">Pelatihan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { lvl: "Tingkat I – Pelaksana", edu: "SMA/SMK", exp: "1 tahun", training: "24 jam" },
                      { lvl: "Tingkat II – Teknisi", edu: "D3/D4", exp: "2 tahun", training: "40 jam" },
                      { lvl: "Tingkat III – Ahli", edu: "S1", exp: "3 tahun", training: "80 jam" },
                      { lvl: "Tingkat IV – Ahli Madya", edu: "S1", exp: "5 tahun", training: "120 jam" },
                      { lvl: "Tingkat V – Manager", edu: "S2", exp: "7 tahun", training: "160 jam" },
                    ].map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800/50"}>
                        <td className="px-3 py-2 font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-xs">{r.lvl}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs">{r.edu}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs">{r.exp}</td>
                        <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-gray-700 text-xs">{r.training}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                {filteredSkk.map(pos => {
                  const open = expandedSkk === pos.code;
                  return (
                    <div key={pos.code} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSkk(open ? null : pos.code)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{pos.code}</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{pos.title}</span>
                          <Badge className={`text-[10px] px-1.5 py-0.5 ${LEVEL_COLOR[pos.level] || LEVEL_COLOR["Ahli"]}`}>{pos.level}</Badge>
                        </div>
                        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                      </button>
                      {open && (
                        <div className="px-4 pb-4 pt-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <span className="text-xs text-gray-400 font-medium">Subklasifikasi</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{pos.sub} - {pos.sub === "B" ? "Gedung" : pos.sub === "C" ? "Sipil" : pos.sub === "D" ? "Mekanikal" : pos.sub === "E" ? "Elektrikal" : pos.sub === "F" ? "Jalan" : pos.sub === "G" ? "Jembatan" : pos.sub}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400 font-medium">Persyaratan Umum</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{pos.req}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <a href={`${BIMTEK_BASE}/sertifikasi`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                <ExternalLink className="w-3 h-3 mr-1" /> Detail di BimtekKita
                              </Button>
                            </a>
                            <Link href="/competency-passport">
                              <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                                <Shield className="w-3 h-3 mr-1" /> Tambah ke Passport
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* AI Experts Tab */}
          {activeTab === "experts" && (
            <div className="space-y-4">
              <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" /> 8 AI Expert Konstruksi BimtekKita
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Konsultasikan semua pertanyaan konstruksi Anda dengan 8 AI specialist yang berpengalaman. Tersedia langsung di BimtekKita.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {AI_EXPERTS.map((expert, i) => (
                    <a key={i} href={`${BIMTEK_BASE}/chat`} target="_blank" rel="noopener noreferrer">
                      <div className={`p-4 rounded-xl border-2 ${expert.color} hover:shadow-md transition-all cursor-pointer group`}>
                        <div className="text-3xl mb-2">{expert.icon}</div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{expert.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expert.desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-orange-600 dark:text-orange-400 font-medium group-hover:gap-2 transition-all">
                          Tanya Expert <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>

              {/* Cross-platform AI section */}
              <Card className="p-5 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Chaesa Live AI Studio</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Rekam meeting pelatihan konstruksi Anda, lalu gunakan AI Chaesa Live untuk mengubahnya menjadi e-course berstruktur dengan 6 langkah SKKNI.</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/ai-studio">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs">
                          <Zap className="w-3.5 h-3.5 mr-1" /> Buka AI Studio Chaesa
                        </Button>
                      </Link>
                      <Link href="/competency-builder">
                        <Button size="sm" variant="outline" className="h-8 text-xs text-purple-600 border-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                          <Target className="w-3.5 h-3.5 mr-1" /> Competency Builder
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Certify Tab */}
          {activeTab === "certify" && (
            <div className="space-y-4">
              <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> Alur Sertifikasi Konstruksi (BNSP)
                </h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-green-400 rounded-full" />
                  <div className="space-y-6">
                    {[
                      { step: "1", title: "Pilih Jenjang & Jabatan", desc: "Tentukan jenjang sertifikasi (Ahli/Teknisi/Pelaksana) dan jabatan kerja sesuai kompetensi Anda. Gunakan database SKK di tab sebelumnya untuk referensi.", color: "bg-blue-500", link: `${BIMTEK_BASE}/sertifikasi` },
                      { step: "2", title: "Persiapan Dokumen", desc: "Siapkan ijazah, transkrip, SK pengalaman kerja, sertifikat pelatihan, KTP, pas foto, dan bukti pengalaman kerja sesuai persyaratan tingkat SKK.", color: "bg-purple-500", link: `${BIMTEK_BASE}/certify` },
                      { step: "3", title: "Ajukan ke LSP Terakreditasi", desc: "Daftarkan diri ke Lembaga Sertifikasi Profesi (LSP) yang terakreditasi BNSP. Lengkapi APL 01 (Formulir Permohonan) dan APL 02 (Asesmen Mandiri).", color: "bg-orange-500", link: `${BIMTEK_BASE}/certify` },
                      { step: "4", title: "Asesmen Kompetensi", desc: "Ikuti proses uji kompetensi oleh asesor terakreditasi. Metode meliputi observasi, wawancara, tes tertulis, portfolio, dan simulasi kerja.", color: "bg-red-500", link: `${BIMTEK_BASE}/quiz` },
                      { step: "5", title: "Terima SKK & Sertifikat", desc: "Jika lulus, terima Sertifikat Kompetensi Kerja (SKK) dan catat di Competency Passport Anda sebagai bukti kompetensi terverifikasi.", color: "bg-green-500", link: "/competency-passport" },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-4 pl-2">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${s.color} text-white text-sm font-bold`}>
                          {s.step}
                        </div>
                        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{s.desc}</p>
                          {s.link.startsWith("http") ? (
                            <a href={s.link} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="h-7 text-xs text-orange-600 border-orange-300 hover:bg-orange-50">
                                <ExternalLink className="w-3 h-3 mr-1" /> Buka di BimtekKita
                              </Button>
                            </a>
                          ) : (
                            <Link href={s.link}>
                              <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                                <Shield className="w-3 h-3 mr-1" /> Catat di Passport
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Tools Section */}
              <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-500" /> Tools Kalkulasi BimtekKita
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { title: "Beam Calculator", desc: "Momen, shear, defleksi balok", href: `${BIMTEK_BASE}/solver`, icon: "📐" },
                    { title: "Column Calculator", desc: "Analisis kolom & beban kombinasi", href: `${BIMTEK_BASE}/solver`, icon: "🏛️" },
                    { title: "Foundation Calculator", desc: "Daya dukung & dimensi pondasi", href: `${BIMTEK_BASE}/solver`, icon: "🏗️" },
                    { title: "Concrete Mix", desc: "Perbandingan campuran beton", href: `${BIMTEK_BASE}/solver`, icon: "🧱" },
                    { title: "Earthwork Volume", desc: "Volume galian & timbunan", href: `${BIMTEK_BASE}/solver`, icon: "⛏️" },
                    { title: "RAB Calculator", desc: "Rencana Anggaran Biaya proyek", href: `${BIMTEK_BASE}/tools`, icon: "💰" },
                  ].map((t, i) => (
                    <a key={i} href={t.href} target="_blank" rel="noopener noreferrer">
                      <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all cursor-pointer">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.title}</div>
                        <div className="text-xs text-gray-400">{t.desc}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Integration Links */}
          <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" /> Ekosistem Terintegrasi: Chaesa Live × BimtekKita
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {[
                { label: "BIMTEK Modules", href: `${BIMTEK_BASE}/bimtek`, icon: "🎓", external: true },
                { label: "→", href: null },
                { label: "Competency Builder", href: "/competency-builder", icon: "🎯", external: false },
                { label: "→", href: null },
                { label: "Quiz Simulasi", href: `${BIMTEK_BASE}/quiz`, icon: "✍️", external: true },
                { label: "→", href: null },
                { label: "SKK/BNSP", href: `${BIMTEK_BASE}/sertifikasi`, icon: "📋", external: true },
                { label: "→", href: null },
                { label: "Competency Passport", href: "/competency-passport", icon: "🛡️", external: false },
              ].map((item, i) =>
                item.href === null ? (
                  <ArrowRight key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                ) : item.external ? (
                  <a key={i} href={item.href!} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-sm font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors cursor-pointer">
                      {item.icon} {item.label} <ExternalLink className="w-3 h-3 ml-0.5" />
                    </span>
                  </a>
                ) : (
                  <Link key={i} href={item.href!}>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors cursor-pointer">
                      {item.icon} {item.label}
                    </span>
                  </Link>
                )
              )}
            </div>
            <p className="text-xs text-center text-gray-400">Belajar dari BIMTEK → Bangun Kompetensi → Uji dengan Quiz → Dapatkan SKK → Rekam di Passport Digital</p>
          </Card>

        </div>
      </div>
    </>
  );
}
