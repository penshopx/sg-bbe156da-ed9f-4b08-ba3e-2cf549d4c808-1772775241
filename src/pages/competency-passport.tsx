import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth, getUserStorageKey } from "@/hooks/useAuth";
import {
  Shield, Award, Star, CheckCircle, Target, BarChart3,
  Download, Share2, QrCode, Calendar, User, Building2,
  TrendingUp, GraduationCap, Layers, FileText, Eye,
  Plus, ArrowRight, Sparkles, BookOpen, Map, Trophy,
  ChevronRight, RefreshCw, Zap
} from "lucide-react";
import Link from "next/link";

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; ring: string; value: number }> = {
  L1: { label: "L1 - Awareness", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700", ring: "ring-blue-400", value: 25 },
  L2: { label: "L2 - Application", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700", ring: "ring-green-400", value: 50 },
  L3: { label: "L3 - Mastery", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", ring: "ring-purple-400", value: 75 },
  L4: { label: "L4 - Strategic", color: "text-orange-700 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", ring: "ring-orange-400", value: 100 },
};

const SAMPLE_COMPETENCIES = [
  { id: "s1", unit: "M.702090.001.01", title: "Pemasaran Digital Berbasis Data", sector: "Pemasaran & Penjualan", level: "L2", verifiedAt: "2025-11-15", method: "Observasi + Tes Tertulis", score: 82, status: "verified" },
  { id: "s2", unit: "J.620100.001.02", title: "Pengembangan Aplikasi Web", sector: "Teknologi Informasi & Komunikasi", level: "L3", verifiedAt: "2025-12-20", method: "Portfolio + Simulasi", score: 90, status: "verified" },
  { id: "s3", unit: "M.701001.036.01", title: "Manajemen Tim Lintas Fungsi", sector: "Sumber Daya Manusia", level: "L2", verifiedAt: "2026-01-08", method: "Wawancara + Observasi", score: 76, status: "verified" },
];

interface Competency {
  id: string;
  unit: string;
  title: string;
  sector: string;
  level: string;
  verifiedAt: string;
  method: string;
  score: number;
  status: "verified" | "in_progress" | "expired";
  notes?: string;
}

interface PassportData {
  ownerName: string;
  nip: string;
  organization: string;
  position: string;
  createdAt: string;
  competencies: Competency[];
}

const defaultPassport = (): PassportData => ({
  ownerName: "",
  nip: "",
  organization: "",
  position: "",
  createdAt: new Date().toISOString(),
  competencies: [],
});

export default function CompetencyPassport() {
  const { toast } = useToast();
  const { user, userName } = useAuth();
  const [passport, setPassport] = useState<PassportData>(defaultPassport());
  const [activeView, setActiveView] = useState<"overview" | "detail" | "add">("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [newComp, setNewComp] = useState<Partial<Competency>>({
    level: "L2", status: "verified", score: 75,
  });
  const [filterSector, setFilterSector] = useState("Semua");
  const [filterLevel, setFilterLevel] = useState("Semua");

  const storageKey = getUserStorageKey(user, "competency_passport");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPassport(JSON.parse(saved));
      } else {
        const initial = { ...defaultPassport(), ownerName: userName || "", competencies: SAMPLE_COMPETENCIES };
        setPassport(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch {}
  }, [storageKey, userName]);

  const save = (data: PassportData) => {
    setPassport(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const saveProfile = () => {
    save(passport);
    setEditingProfile(false);
    toast({ title: "Profil tersimpan!" });
  };

  const addCompetency = () => {
    if (!newComp.title || !newComp.unit) {
      toast({ title: "Lengkapi data kompetensi", variant: "destructive" });
      return;
    }
    const comp: Competency = {
      id: Date.now().toString(),
      unit: newComp.unit || "",
      title: newComp.title || "",
      sector: newComp.sector || "Umum",
      level: newComp.level || "L2",
      verifiedAt: newComp.verifiedAt || new Date().toISOString().split("T")[0],
      method: newComp.method || "Asesmen Internal",
      score: newComp.score || 75,
      status: newComp.status as "verified" | "in_progress" | "expired" || "verified",
      notes: newComp.notes,
    };
    const updated = { ...passport, competencies: [comp, ...passport.competencies] };
    save(updated);
    setNewComp({ level: "L2", status: "verified", score: 75 });
    setActiveView("overview");
    toast({ title: "Kompetensi ditambahkan!", description: `"${comp.title}" berhasil ditambahkan ke passport Anda.` });
  };

  const removeCompetency = (id: string) => {
    save({ ...passport, competencies: passport.competencies.filter(c => c.id !== id) });
    toast({ title: "Kompetensi dihapus" });
  };

  const sectors = ["Semua", ...Array.from(new Set(passport.competencies.map(c => c.sector)))];
  const levels = ["Semua", "L1", "L2", "L3", "L4"];
  const filtered = passport.competencies.filter(c =>
    (filterSector === "Semua" || c.sector === filterSector) &&
    (filterLevel === "Semua" || c.level === filterLevel)
  );

  const stats = {
    total: passport.competencies.length,
    verified: passport.competencies.filter(c => c.status === "verified").length,
    avgScore: passport.competencies.length > 0
      ? Math.round(passport.competencies.reduce((a, c) => a + c.score, 0) / passport.competencies.length)
      : 0,
    byLevel: {
      L1: passport.competencies.filter(c => c.level === "L1").length,
      L2: passport.competencies.filter(c => c.level === "L2").length,
      L3: passport.competencies.filter(c => c.level === "L3").length,
      L4: passport.competencies.filter(c => c.level === "L4").length,
    },
  };

  const passportId = `CP-${(user?.id || "GUEST").slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <>
      <SEO
        title="Competency Passport - Chaesa Live"
        description="Portfolio digital kompetensi terverifikasi Anda. Terintegrasi dengan SKKNI, LSP, dan Chaesa Live Learning Platform."
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-green-950 dark:to-blue-950">
        <PageHeader title="Competency Passport" icon={Shield} backHref="/" backLabel="Beranda" />

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* Passport Card */}
          <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-teal-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)" }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">Chaesa Live</Badge>
                    <Badge className="bg-green-400/30 text-green-100 border-green-400/30 text-xs">SKKNI Standard</Badge>
                  </div>
                  <h1 className="text-2xl font-bold">Competency Passport</h1>
                  {editingProfile ? (
                    <div className="mt-2 space-y-2">
                      <input value={passport.ownerName} onChange={e => setPassport(p => ({ ...p, ownerName: e.target.value }))} placeholder="Nama Lengkap" className="bg-white/20 border border-white/30 rounded px-3 py-1 text-white placeholder-white/60 text-sm w-full max-w-xs" />
                      <input value={passport.nip} onChange={e => setPassport(p => ({ ...p, nip: e.target.value }))} placeholder="NIP / NIK" className="bg-white/20 border border-white/30 rounded px-3 py-1 text-white placeholder-white/60 text-sm w-full max-w-xs" />
                      <input value={passport.organization} onChange={e => setPassport(p => ({ ...p, organization: e.target.value }))} placeholder="Organisasi / Instansi" className="bg-white/20 border border-white/30 rounded px-3 py-1 text-white placeholder-white/60 text-sm w-full max-w-xs" />
                      <input value={passport.position} onChange={e => setPassport(p => ({ ...p, position: e.target.value }))} placeholder="Jabatan / Posisi" className="bg-white/20 border border-white/30 rounded px-3 py-1 text-white placeholder-white/60 text-sm w-full max-w-xs" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveProfile} className="px-4 py-1.5 bg-white text-blue-700 rounded-lg text-sm font-semibold hover:bg-white/90">Simpan</button>
                        <button onClick={() => setEditingProfile(false)} className="px-4 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30">Batal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-white/90 font-semibold text-lg">{passport.ownerName || userName || "Nama Anda"}</p>
                      {passport.position && <p className="text-white/70 text-sm">{passport.position}{passport.organization ? ` · ${passport.organization}` : ""}</p>}
                      {passport.nip && <p className="text-white/60 text-xs">NIP: {passport.nip}</p>}
                      <button onClick={() => setEditingProfile(true)} className="mt-1 text-white/60 hover:text-white text-xs underline">Edit profil</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="bg-white/20 rounded-xl p-3 border border-white/30">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <QrCode className="w-5 h-5 text-white/80" />
                    <span className="text-xs text-white/60">ID Passport</span>
                  </div>
                  <div className="font-mono font-bold text-sm">{passportId}</div>
                  <div className="text-xs text-white/60 mt-1">Verifikasi: chaesalive.id/verify</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors border border-white/20">
                    <Share2 className="w-3.5 h-3.5" /> Bagikan
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors border border-white/20">
                    <Download className="w-3.5 h-3.5" /> Unduh PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Kompetensi", value: stats.total, icon: Target, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Terverifikasi", value: stats.verified, icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
              { label: "Rata-rata Skor", value: `${stats.avgScore}%`, icon: BarChart3, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
              { label: "Level Tertinggi", value: stats.byLevel.L4 > 0 ? "L4" : stats.byLevel.L3 > 0 ? "L3" : stats.byLevel.L2 > 0 ? "L2" : "L1", icon: Trophy, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
            ].map((s, i) => (
              <Card key={i} className={`p-4 border border-gray-200 dark:border-gray-700 ${s.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Level Distribution */}
          <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" /> Distribusi Level Kompetensi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => (
                <div key={lvl} className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                  <div className={`text-2xl font-bold ${cfg.color}`}>{stats.byLevel[lvl as keyof typeof stats.byLevel]}</div>
                  <div className={`text-sm font-semibold ${cfg.color}`}>{lvl}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{cfg.label.split(" - ")[1]}</div>
                  <Progress value={stats.total > 0 ? (stats.byLevel[lvl as keyof typeof stats.byLevel] / stats.total) * 100 : 0} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </Card>

          {/* Competency List */}
          <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-500" /> Daftar Kompetensi ({filtered.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <select value={filterSector} onChange={e => setFilterSector(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {sectors.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
                <Button onClick={() => setActiveView(activeView === "add" ? "overview" : "add")} size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                </Button>
              </div>
            </div>

            {/* Add Form */}
            {activeView === "add" && (
              <div className="mb-5 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 text-sm">Tambah Kompetensi Baru</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Judul Kompetensi *</label>
                    <input value={newComp.title || ""} onChange={e => setNewComp(p => ({ ...p, title: e.target.value }))} placeholder="cth: Manajemen Proyek Digital" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Kode Unit SKKNI *</label>
                    <input value={newComp.unit || ""} onChange={e => setNewComp(p => ({ ...p, unit: e.target.value }))} placeholder="cth: M.702090.001.01" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Sektor</label>
                    <input value={newComp.sector || ""} onChange={e => setNewComp(p => ({ ...p, sector: e.target.value }))} placeholder="cth: Teknologi Informasi" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Level Kompetensi</label>
                    <select value={newComp.level || "L2"} onChange={e => setNewComp(p => ({ ...p, level: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                      {Object.keys(LEVEL_CONFIG).map(l => <option key={l} value={l}>{LEVEL_CONFIG[l].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Metode Asesmen</label>
                    <input value={newComp.method || ""} onChange={e => setNewComp(p => ({ ...p, method: e.target.value }))} placeholder="cth: Observasi + Portfolio" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Skor Asesmen (%)</label>
                    <input type="number" value={newComp.score || 75} onChange={e => setNewComp(p => ({ ...p, score: parseInt(e.target.value) }))} min="0" max="100" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Tanggal Verifikasi</label>
                    <input type="date" value={newComp.verifiedAt || ""} onChange={e => setNewComp(p => ({ ...p, verifiedAt: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
                    <select value={newComp.status || "verified"} onChange={e => setNewComp(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                      <option value="verified">Terverifikasi</option>
                      <option value="in_progress">Dalam Proses</option>
                      <option value="expired">Kadaluarsa</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Catatan (opsional)</label>
                    <input value={newComp.notes || ""} onChange={e => setNewComp(p => ({ ...p, notes: e.target.value }))} placeholder="Catatan tambahan..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addCompetency} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Simpan Kompetensi
                  </Button>
                  <Button onClick={() => setActiveView("overview")} size="sm" variant="outline">Batal</Button>
                </div>
              </div>
            )}

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada kompetensi. Tambahkan kompetensi pertama Anda!</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveView("add")} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-1" /> Tambah Manual
                  </Button>
                  <Link href="/competency-builder">
                    <Button size="sm" variant="outline">
                      <Target className="w-4 h-4 mr-1" /> Buat via Builder
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(c => {
                  const lvl = LEVEL_CONFIG[c.level] || LEVEL_CONFIG.L2;
                  const statusConfig = {
                    verified: { label: "Terverifikasi", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
                    in_progress: { label: "Dalam Proses", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: RefreshCw },
                    expired: { label: "Kadaluarsa", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: Calendar },
                  }[c.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={c.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <div className={`w-12 h-12 rounded-xl ${lvl.bg} ${lvl.border} border flex flex-col items-center justify-center shrink-0`}>
                        <span className={`text-xs font-bold ${lvl.color}`}>{c.level}</span>
                        <span className={`text-[10px] ${lvl.color} opacity-70`}>{Math.round(c.score)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{c.title}</h3>
                          <Badge className={`text-[10px] px-2 py-0.5 ${statusConfig.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-0.5 inline" />{statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{c.unit}</span>
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.sector}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.method}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.verifiedAt ? new Date(c.verifiedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</span>
                        </div>
                        {c.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{c.notes}</p>}
                        <Progress value={c.score} className="h-1 mt-2 max-w-xs" />
                      </div>
                      <button onClick={() => removeCompetency(c.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity shrink-0 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/competency-builder">
              <Card className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Competency Builder</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bangun e-course 6 langkah untuk kompetensi baru</p>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">Mulai Membangun <ArrowRight className="w-3 h-3" /></div>
              </Card>
            </Link>
            <Link href="/sertifikasi">
              <Card className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Exam Center</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ikuti ujian sertifikasi untuk memverifikasi kompetensi</p>
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-medium">Mulai Ujian <ArrowRight className="w-3 h-3" /></div>
              </Card>
            </Link>
            <Link href="/skills-matrix">
              <Card className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Skills Matrix</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Petakan gap dan analisis perkembangan kompetensi tim</p>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-medium">Lihat Matrix <ArrowRight className="w-3 h-3" /></div>
              </Card>
            </Link>
          </div>

          {/* BNSP/LSP Info */}
          <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-500" /> Integrasi LSP & BNSP
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: FileText, title: "APL 01 & 02", desc: "Formulir permohonan asesmen kompetensi standar BNSP", color: "text-blue-500" },
                { icon: User, title: "Manajemen Asesor", desc: "Kelola asesor bersertifikat BNSP dengan NRA terverifikasi", color: "text-green-500" },
                { icon: Map, title: "Pemetaan SKKNI", desc: "Petakan setiap kompetensi ke unit SKKNI yang relevan", color: "text-purple-500" },
                { icon: Eye, title: "6 Metode Asesmen", desc: "APL, Observasi, Wawancara, Tes Tertulis, Portfolio, Simulasi", color: "text-orange-500" },
                { icon: QrCode, title: "Verifikasi QR Code", desc: "Verifikasi sertifikat kompetensi secara digital dan real-time", color: "text-teal-500" },
                { icon: TrendingUp, title: "Dashboard Analitik", desc: "Heatmap dan progress tracking kompetensi seluruh tim", color: "text-red-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <item.icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </>
  );
}
