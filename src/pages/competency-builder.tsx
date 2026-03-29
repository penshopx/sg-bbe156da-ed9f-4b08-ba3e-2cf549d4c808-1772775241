import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth, getUserStorageKey } from "@/hooks/useAuth";
import {
  Target, BookOpen, Video, Wrench, ClipboardCheck, Lightbulb,
  ChevronRight, ChevronLeft, Plus, Trash2, Sparkles, Brain,
  Award, Star, GraduationCap, BarChart3, CheckCircle, Circle,
  FileText, Users, Zap, TrendingUp, Save, Eye, Download, Lock,
  Map, Shield, Layers, ArrowRight, RefreshCw
} from "lucide-react";
import Link from "next/link";

const COMPETENCY_LEVELS = [
  { id: "L1", label: "L1 - Awareness", desc: "Mengetahui dan memahami konsep dasar", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  { id: "L2", label: "L2 - Application", desc: "Mampu menerapkan dengan bimbingan", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", border: "border-green-300 dark:border-green-700" },
  { id: "L3", label: "L3 - Mastery", desc: "Menguasai dan mandiri dalam penerapan", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
  { id: "L4", label: "L4 - Strategic", desc: "Mampu mengajarkan dan mengembangkan", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
];

const SKKNI_SECTORS = [
  "Teknologi Informasi & Komunikasi",
  "Manajemen & Bisnis",
  "Keuangan & Perbankan",
  "Pemasaran & Penjualan",
  "Sumber Daya Manusia",
  "Produksi & Manufaktur",
  "Pendidikan & Pelatihan",
  "Kesehatan & Keselamatan Kerja",
  "Logistik & Supply Chain",
  "Pariwisata & Perhotelan",
];

const ASSESSMENT_METHODS = [
  { id: "apl", label: "APL (Asesmen Portofolio Lampiran)", icon: FileText },
  { id: "observasi", label: "Observasi Langsung", icon: Eye },
  { id: "wawancara", label: "Wawancara Kompetensi", icon: Users },
  { id: "tes_tertulis", label: "Tes Tertulis", icon: ClipboardCheck },
  { id: "portfolio", label: "Portfolio & Karya", icon: BookOpen },
  { id: "simulasi", label: "Simulasi / Role-Play", icon: Layers },
];

const STEPS = [
  { id: 0, label: "Orientasi", icon: Target, desc: "Standar & indikator kompetensi", color: "from-blue-500 to-blue-600" },
  { id: 1, label: "Konteks", icon: Map, desc: "Studi kasus & situasi nyata", color: "from-teal-500 to-teal-600" },
  { id: 2, label: "Microlearning", icon: Video, desc: "Video, artikel & konten AI", color: "from-purple-500 to-purple-600" },
  { id: 3, label: "Praktik", icon: Wrench, desc: "Tugas berbasis pekerjaan nyata", color: "from-orange-500 to-orange-600" },
  { id: 4, label: "Asesmen", icon: ClipboardCheck, desc: "Project, observasi & evaluasi", color: "from-red-500 to-red-600" },
  { id: 5, label: "Refleksi", icon: Lightbulb, desc: "Evidensi & portofolio kompetensi", color: "from-green-500 to-green-600" },
];

interface CourseData {
  title: string;
  competencyUnit: string;
  skkniCode: string;
  sector: string;
  level: string;
  orientasi: { standards: string[]; indicators: string[]; objective: string };
  konteks: { caseStudy: string; realScenario: string; relevance: string };
  microlearning: { videoTopics: string[]; articles: string[]; aiSummary: string };
  praktik: { tasks: string[]; workBased: string; duration: string };
  asesmen: { methods: string[]; projectDesc: string; passingScore: string };
  refleksi: { evidenceTypes: string[]; portfolioItems: string[]; selfAssessment: string };
}

const defaultCourse = (): CourseData => ({
  title: "",
  competencyUnit: "",
  skkniCode: "",
  sector: SKKNI_SECTORS[0],
  level: "L2",
  orientasi: { standards: [""], indicators: ["", ""], objective: "" },
  konteks: { caseStudy: "", realScenario: "", relevance: "" },
  microlearning: { videoTopics: [""], articles: [""], aiSummary: "" },
  praktik: { tasks: [""], workBased: "", duration: "2 minggu" },
  asesmen: { methods: ["observasi", "tes_tertulis"], projectDesc: "", passingScore: "70" },
  refleksi: { evidenceTypes: [""], portfolioItems: [""], selfAssessment: "" },
});

const SAMPLE_COURSES = [
  { title: "Pemasaran Digital Berbasis Data", unit: "M.702090.001.01", sector: "Pemasaran & Penjualan", level: "L2" },
  { title: "Manajemen Tim Lintas Fungsi", unit: "M.701001.036.01", sector: "Sumber Daya Manusia", level: "L3" },
  { title: "Pengembangan Aplikasi Web", unit: "J.620100.001.02", sector: "Teknologi Informasi & Komunikasi", level: "L3" },
  { title: "Keselamatan & Kesehatan Kerja", unit: "P.854900.001.01", sector: "Kesehatan & Keselamatan Kerja", level: "L1" },
];

export default function CompetencyBuilder() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [course, setCourse] = useState<CourseData>(defaultCourse());
  const [savedCourses, setSavedCourses] = useState<(CourseData & { id: string; createdAt: string; completedSteps: number })[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "library">("builder");
  const [generating, setGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const storageKey = getUserStorageKey(user, "competency_courses");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setSavedCourses(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const save = (courses: typeof savedCourses) => {
    setSavedCourses(courses);
    localStorage.setItem(storageKey, JSON.stringify(courses));
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const updateCourse = (field: keyof CourseData, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (section: keyof CourseData, field: string, value: any) => {
    setCourse(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), [field]: value }
    }));
  };

  const addItem = (section: keyof CourseData, field: string) => {
    const arr = ((course[section] as any)[field] as string[]);
    updateNested(section, field, [...arr, ""]);
  };

  const removeItem = (section: keyof CourseData, field: string, idx: number) => {
    const arr = ((course[section] as any)[field] as string[]);
    updateNested(section, field, arr.filter((_: any, i: number) => i !== idx));
  };

  const updateItem = (section: keyof CourseData, field: string, idx: number, value: string) => {
    const arr = [...((course[section] as any)[field] as string[])];
    arr[idx] = value;
    updateNested(section, field, arr);
  };

  const saveCourse = () => {
    if (!course.title || !course.competencyUnit) {
      toast({ title: "Lengkapi data dasar", description: "Judul e-course dan unit kompetensi wajib diisi.", variant: "destructive" });
      return;
    }
    const existing = savedCourses.findIndex(c => c.id === (course as any).id);
    const entry = { ...course, id: (course as any).id || Date.now().toString(), createdAt: new Date().toISOString(), completedSteps: completedSteps.size };
    const updated = existing >= 0 ? savedCourses.map((c, i) => i === existing ? entry : c) : [entry, ...savedCourses];
    save(updated);
    toast({ title: "E-Course tersimpan!", description: `"${course.title}" berhasil disimpan ke perpustakaan Anda.` });
  };

  const loadCourse = (c: any) => {
    setCourse(c);
    setActiveTab("builder");
    setCurrentStep(0);
    setCompletedSteps(new Set(Array.from({ length: c.completedSteps }, (_, i) => i)));
    toast({ title: "E-Course dimuat", description: `Melanjutkan "${c.title}"` });
  };

  const deleteCourse = (id: string) => {
    save(savedCourses.filter(c => c.id !== id));
    toast({ title: "Dihapus" });
  };

  const newCourse = () => {
    setCourse(defaultCourse());
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  const generateAI = async (type: string) => {
    if (!course.competencyUnit) {
      toast({ title: "Isi unit kompetensi dulu", variant: "destructive" });
      return;
    }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    setGenerating(false);

    if (type === "indicators") {
      updateNested("orientasi", "indicators", [
        `Mampu mengidentifikasi konsep utama ${course.competencyUnit}`,
        `Mampu menerapkan prosedur standar sesuai ${course.level}`,
        `Mampu mengevaluasi hasil kerja dengan kriteria yang terukur`,
        `Mampu mendokumentasikan proses dan evidensi kompetensi`,
      ]);
      markStepComplete(0);
    } else if (type === "caseStudy") {
      updateNested("konteks", "caseStudy", `Sebuah perusahaan menengah menghadapi tantangan dalam ${course.competencyUnit}. Tim perlu menganalisis kondisi saat ini dan merancang solusi berbasis kompetensi yang terukur dengan standar SKKNI.`);
      updateNested("konteks", "realScenario", `Skenario: Anda ditugaskan sebagai konsultan internal untuk meningkatkan kapabilitas tim di bidang ${course.competencyUnit} dengan target pencapaian ${course.level}.`);
      markStepComplete(1);
    } else if (type === "microlearning") {
      updateNested("microlearning", "videoTopics", [
        `Pengantar: Mengapa ${course.competencyUnit} Penting`,
        `Konsep Dasar dan Kerangka Kerja`,
        `Studi Kasus: Implementasi Terbaik`,
        `Tools dan Teknik Praktis`,
        `Evaluasi dan Peningkatan Berkelanjutan`,
      ]);
      updateNested("microlearning", "aiSummary", `Modul microlearning ini dirancang untuk level ${course.level}, mencakup 5 video berdurasi 5-7 menit yang membangun pemahaman secara bertahap dari konsep dasar hingga penerapan strategis.`);
      markStepComplete(2);
    } else if (type === "tasks") {
      updateNested("praktik", "tasks", [
        `Buat peta kompetensi untuk tim Anda menggunakan template SKKNI`,
        `Lakukan self-assessment terhadap ${course.competencyUnit}`,
        `Implementasikan satu prosedur standar dan dokumentasikan hasilnya`,
        `Presentasikan hasil praktik kepada mentor atau supervisor`,
      ]);
      updateNested("praktik", "workBased", `Tugas berbasis pekerjaan nyata: Peserta menerapkan ${course.competencyUnit} dalam konteks pekerjaan mereka sehari-hari selama 2 minggu, dengan bimbingan supervisor.`);
      markStepComplete(3);
    } else if (type === "selfAssessment") {
      updateNested("refleksi", "selfAssessment", `Refleksikan perjalanan belajar Anda: Apa yang telah Anda kuasai dari ${course.competencyUnit}? Bagaimana Anda akan menerapkan kompetensi ini dalam 30 hari ke depan? Evidensi apa yang dapat Anda kumpulkan untuk membuktikan pencapaian level ${course.level}?`);
      updateNested("refleksi", "evidenceTypes", [
        "Foto/video dokumentasi praktik kerja",
        "Laporan tertulis hasil implementasi",
        "Testimoni supervisor atau rekan kerja",
        "Karya/output nyata dari proyek praktik",
      ]);
      markStepComplete(5);
    }

    toast({ title: "AI menghasilkan konten!", description: "Konten telah diisi secara otomatis. Silakan review dan sesuaikan." });
  };

  const progress = Math.round((completedSteps.size / STEPS.length) * 100);
  const selectedLevel = COMPETENCY_LEVELS.find(l => l.id === course.level) || COMPETENCY_LEVELS[1];

  const toggleAssessmentMethod = (id: string) => {
    const methods = course.asesmen.methods.includes(id)
      ? course.asesmen.methods.filter(m => m !== id)
      : [...course.asesmen.methods, id];
    updateNested("asesmen", "methods", methods);
  };

  return (
    <>
      <SEO
        title="Competency E-Course Builder - Chaesa Live"
        description="Bangun e-course berbasis kompetensi dengan struktur 6 langkah, level L1-L4, dan pemetaan SKKNI. Didukung AI Chaesa Live."
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        <PageHeader title="Competency E-Course Builder" icon={Target} backHref="/" backLabel="Beranda" />

        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Header Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">Powered by Chaesa Live AI</Badge>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">SKKNI Standard</Badge>
                </div>
                <h1 className="text-2xl font-bold mb-1">Competency E-Course Builder</h1>
                <p className="text-blue-100 text-sm">Bangun e-course terstruktur dari unit kompetensi — bukan sekadar materi. 1 unit kompetensi = 1 e-course yang terukur.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button onClick={() => setActiveTab("library")} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20 bg-white/10">
                  <BookOpen className="w-4 h-4 mr-1.5" /> Perpustakaan ({savedCourses.length})
                </Button>
                <Button onClick={newCourse} size="sm" className="bg-white text-purple-700 hover:bg-white/90 font-semibold">
                  <Plus className="w-4 h-4 mr-1.5" /> Buat Baru
                </Button>
              </div>
            </div>
          </div>

          {activeTab === "library" ? (
            <LibraryView savedCourses={savedCourses} onLoad={loadCourse} onDelete={deleteCourse} onNew={() => { newCourse(); setActiveTab("builder"); }} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Sidebar: Steps & Info */}
              <div className="lg:col-span-1 space-y-4">
                {/* Progress */}
                <Card className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress E-Course</span>
                    <span className="text-sm font-bold text-purple-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-3" />
                  <div className="space-y-1">
                    {STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isDone = completedSteps.has(idx);
                      const isCurrent = currentStep === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                            isCurrent ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700" :
                            "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-green-500" : isCurrent ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                            {isDone ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <span className="text-xs text-white font-bold">{idx + 1}</span>}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-medium truncate ${isCurrent ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>{step.label}</div>
                            <div className="text-xs text-gray-400 truncate">{step.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Level Badge */}
                <Card className={`p-4 border ${selectedLevel.border} bg-white dark:bg-gray-900`}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Level Kompetensi</div>
                  <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold mb-2 ${selectedLevel.color}`}>
                    {selectedLevel.label}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedLevel.desc}</p>
                </Card>

                {/* Quick Link to Passport */}
                <Link href="/competency-passport">
                  <Card className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">Competency Passport</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">Lihat semua kompetensi yang telah Anda kuasai →</p>
                  </Card>
                </Link>
              </div>

              {/* Main Content: Step Forms */}
              <div className="lg:col-span-3 space-y-4">
                {/* Basic Info (always visible) */}
                <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-500" /> Informasi Dasar E-Course
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Judul E-Course *</Label>
                      <Input value={course.title} onChange={e => updateCourse("title", e.target.value)} placeholder="cth: Manajemen Proyek Digital Tingkat Menengah" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Unit Kompetensi (SKKNI) *</Label>
                      <Input value={course.competencyUnit} onChange={e => updateCourse("competencyUnit", e.target.value)} placeholder="cth: M.702090.001.01" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kode SKKNI</Label>
                      <Input value={course.skkniCode} onChange={e => updateCourse("skkniCode", e.target.value)} placeholder="cth: SKKNI 2023-xxx" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Sektor / Bidang</Label>
                      <select
                        value={course.sector}
                        onChange={e => updateCourse("sector", e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {SKKNI_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Level Kompetensi</Label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {COMPETENCY_LEVELS.map(l => (
                          <button
                            key={l.id}
                            onClick={() => updateCourse("level", l.id)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${
                              course.level === l.id ? `${l.color} ${l.border} border-2` : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="font-bold">{l.id}</div>
                            <div className="text-xs opacity-75 truncate">{l.label.split(" - ")[1]}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sample templates */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Muat dari template contoh:</div>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_COURSES.map((s, idx) => (
                        <button key={idx} onClick={() => {
                          setCourse(prev => ({ ...prev, title: s.title, competencyUnit: s.unit, sector: s.sector, level: s.level }));
                          toast({ title: "Template dimuat", description: s.title });
                        }} className="text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Step Content */}
                <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STEPS[currentStep].color} flex items-center justify-center shadow`}>
                        {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="w-5 h-5 text-white" />; })()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          Langkah {currentStep + 1}: {STEPS[currentStep].label}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{STEPS[currentStep].desc}</p>
                      </div>
                    </div>
                    {completedSteps.has(currentStep) && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                      </Badge>
                    )}
                  </div>

                  {currentStep === 0 && (
                    <Step0Orientasi course={course} updateNested={updateNested} addItem={addItem} removeItem={removeItem} updateItem={updateItem} generating={generating} onGenerate={() => generateAI("indicators")} />
                  )}
                  {currentStep === 1 && (
                    <Step1Konteks course={course} updateNested={updateNested} generating={generating} onGenerate={() => generateAI("caseStudy")} />
                  )}
                  {currentStep === 2 && (
                    <Step2Microlearning course={course} updateNested={updateNested} addItem={addItem} removeItem={removeItem} updateItem={updateItem} generating={generating} onGenerate={() => generateAI("microlearning")} />
                  )}
                  {currentStep === 3 && (
                    <Step3Praktik course={course} updateNested={updateNested} addItem={addItem} removeItem={removeItem} updateItem={updateItem} generating={generating} onGenerate={() => generateAI("tasks")} />
                  )}
                  {currentStep === 4 && (
                    <Step4Asesmen course={course} updateNested={updateNested} toggleMethod={toggleAssessmentMethod} />
                  )}
                  {currentStep === 5 && (
                    <Step5Refleksi course={course} updateNested={updateNested} addItem={addItem} removeItem={removeItem} updateItem={updateItem} generating={generating} onGenerate={() => generateAI("selfAssessment")} />
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                      disabled={currentStep === 0}
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={() => { markStepComplete(currentStep); toast({ title: `Langkah ${currentStep + 1} selesai!` }); }} size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20">
                        <CheckCircle className="w-4 h-4 mr-1" /> Tandai Selesai
                      </Button>
                      <Button onClick={saveCourse} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Save className="w-4 h-4 mr-1" /> Simpan
                      </Button>
                    </div>
                    <Button
                      onClick={() => setCurrentStep(s => Math.min(STEPS.length - 1, s + 1))}
                      disabled={currentStep === STEPS.length - 1}
                      size="sm"
                    >
                      Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>

                {/* Bottom quick links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link href="/micro-learning">
                    <Card className="p-4 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Studio</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Generate konten microlearning dari rekaman meeting Anda</p>
                    </Card>
                  </Link>
                  <Link href="/skills-matrix">
                    <Card className="p-4 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Skills Matrix</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Petakan gap kompetensi tim Anda dengan visualisasi radar</p>
                    </Card>
                  </Link>
                  <Link href="/sertifikasi">
                    <Card className="p-4 border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Exam Center</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Buat ujian asesmen kompetensi untuk e-course ini</p>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Step0Orientasi({ course, updateNested, addItem, removeItem, updateItem, generating, onGenerate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Tujuan Pembelajaran</Label>
        <Textarea value={course.orientasi.objective} onChange={e => updateNested("orientasi", "objective", e.target.value)} placeholder="Setelah menyelesaikan e-course ini, peserta mampu..." rows={3} className="mt-1" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Standar Kompetensi</Label>
          <Button size="sm" variant="ghost" onClick={() => addItem("orientasi", "standards")} className="h-7 text-xs text-purple-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
        </div>
        {course.orientasi.standards.map((s: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={s} onChange={e => updateItem("orientasi", "standards", i, e.target.value)} placeholder={`Standar ${i + 1}: cth. Mampu menganalisis data pasar...`} />
            {course.orientasi.standards.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("orientasi", "standards", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Indikator Kompetensi</Label>
          <div className="flex gap-2">
            <Button size="sm" onClick={onGenerate} disabled={generating} className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white">
              {generating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Generate AI
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addItem("orientasi", "indicators")} className="h-7 text-xs text-purple-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
          </div>
        </div>
        {course.orientasi.indicators.map((ind: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={ind} onChange={e => updateItem("orientasi", "indicators", i, e.target.value)} placeholder={`Indikator ${i + 1}: cth. Peserta dapat menyusun laporan...`} />
            {course.orientasi.indicators.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("orientasi", "indicators", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1Konteks({ course, updateNested, generating, onGenerate }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Studi Kasus Nyata</Label>
        <Button size="sm" onClick={onGenerate} disabled={generating} className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
          {generating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Generate AI
        </Button>
      </div>
      <Textarea value={course.konteks.caseStudy} onChange={e => updateNested("konteks", "caseStudy", e.target.value)} placeholder="Describe a real-world case study that contextualizes this competency..." rows={4} />
      <div>
        <Label className="text-sm font-medium">Skenario Situasi Nyata</Label>
        <Textarea value={course.konteks.realScenario} onChange={e => updateNested("konteks", "realScenario", e.target.value)} placeholder="Gambarkan situasi kerja nyata dimana kompetensi ini diperlukan..." rows={3} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-medium">Relevansi untuk Peserta</Label>
        <Textarea value={course.konteks.relevance} onChange={e => updateNested("konteks", "relevance", e.target.value)} placeholder="Jelaskan mengapa kompetensi ini penting bagi peserta dalam pekerjaan mereka..." rows={3} className="mt-1" />
      </div>
    </div>
  );
}

function Step2Microlearning({ course, updateNested, addItem, removeItem, updateItem, generating, onGenerate }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm font-medium mb-1">
          <Sparkles className="w-4 h-4" /> Integrasi dengan AI Studio Chaesa Live
        </div>
        <p className="text-xs text-purple-600 dark:text-purple-400">Upload rekaman meeting Anda ke <Link href="/micro-learning" className="underline font-medium">AI Studio</Link> untuk menghasilkan video microlearning secara otomatis, lalu tambahkan topiknya di sini.</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Topik Video (5-7 menit per video)</Label>
          <div className="flex gap-2">
            <Button size="sm" onClick={onGenerate} disabled={generating} className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white">
              {generating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Generate AI
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addItem("microlearning", "videoTopics")} className="h-7 text-xs text-purple-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
          </div>
        </div>
        {course.microlearning.videoTopics.map((t: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs text-purple-600 font-bold shrink-0">{i + 1}</div>
              <Input value={t} onChange={e => updateItem("microlearning", "videoTopics", i, e.target.value)} placeholder={`Video ${i + 1}: cth. Pengantar konsep dasar...`} />
            </div>
            {course.microlearning.videoTopics.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("microlearning", "videoTopics", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Artikel & Bahan Bacaan</Label>
          <Button size="sm" variant="ghost" onClick={() => addItem("microlearning", "articles")} className="h-7 text-xs text-purple-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
        </div>
        {course.microlearning.articles.map((a: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={a} onChange={e => updateItem("microlearning", "articles", i, e.target.value)} placeholder={`Artikel ${i + 1}: judul atau link...`} />
            {course.microlearning.articles.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("microlearning", "articles", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div>
        <Label className="text-sm font-medium">Ringkasan Modul</Label>
        <Textarea value={course.microlearning.aiSummary} onChange={e => updateNested("microlearning", "aiSummary", e.target.value)} placeholder="Ringkasan keseluruhan modul microlearning ini..." rows={3} className="mt-1" />
      </div>
    </div>
  );
}

function Step3Praktik({ course, updateNested, addItem, removeItem, updateItem, generating, onGenerate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Tugas Berbasis Pekerjaan Nyata</Label>
          <div className="flex gap-2">
            <Button size="sm" onClick={onGenerate} disabled={generating} className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white">
              {generating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Generate AI
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addItem("praktik", "tasks")} className="h-7 text-xs text-orange-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
          </div>
        </div>
        {course.praktik.tasks.map((t: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Wrench className="w-4 h-4 text-orange-400 shrink-0" />
              <Input value={t} onChange={e => updateItem("praktik", "tasks", i, e.target.value)} placeholder={`Tugas ${i + 1}: cth. Buat laporan analisis...`} />
            </div>
            {course.praktik.tasks.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("praktik", "tasks", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div>
        <Label className="text-sm font-medium">Deskripsi Praktik Kerja</Label>
        <Textarea value={course.praktik.workBased} onChange={e => updateNested("praktik", "workBased", e.target.value)} placeholder="Jelaskan konteks pekerjaan nyata dimana tugas ini diterapkan..." rows={3} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-medium">Durasi Praktik</Label>
        <Input value={course.praktik.duration} onChange={e => updateNested("praktik", "duration", e.target.value)} placeholder="cth: 2 minggu, 10 jam kerja" className="mt-1 max-w-xs" />
      </div>
    </div>
  );
}

function Step4Asesmen({ course, updateNested, toggleMethod }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Metode Asesmen (pilih yang relevan)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSESSMENT_METHODS.map(m => {
            const Icon = m.icon;
            const selected = course.asesmen.methods.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleMethod(m.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  selected ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-700" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-red-500" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <Icon className={`w-4 h-4 ${selected ? "text-white" : "text-gray-400"}`} />
                </div>
                <span className={`text-sm font-medium ${selected ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>{m.label}</span>
                {selected && <CheckCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium">Deskripsi Project Asesmen</Label>
        <Textarea value={course.asesmen.projectDesc} onChange={e => updateNested("asesmen", "projectDesc", e.target.value)} placeholder="Jelaskan project atau tugas akhir yang digunakan untuk menilai kompetensi peserta..." rows={4} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-medium">Nilai Kelulusan Minimum (%)</Label>
        <Input value={course.asesmen.passingScore} onChange={e => updateNested("asesmen", "passingScore", e.target.value)} placeholder="70" type="number" min="0" max="100" className="mt-1 max-w-xs" />
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-medium mb-1">
          <Award className="w-4 h-4" /> Integrasi Exam Center
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">Buat ujian formal untuk kompetensi ini di <Link href="/sertifikasi" className="underline font-medium">Exam Center</Link> Chaesa Live. Hasil ujian akan secara otomatis direkam di Competency Passport Anda.</p>
      </div>
    </div>
  );
}

function Step5Refleksi({ course, updateNested, addItem, removeItem, updateItem, generating, onGenerate }: any) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Self-Assessment & Refleksi</Label>
          <Button size="sm" onClick={onGenerate} disabled={generating} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
            {generating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Generate AI
          </Button>
        </div>
        <Textarea value={course.refleksi.selfAssessment} onChange={e => updateNested("refleksi", "selfAssessment", e.target.value)} placeholder="Pertanyaan refleksi untuk peserta setelah menyelesaikan e-course..." rows={4} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Jenis Evidensi yang Dikumpulkan</Label>
          <Button size="sm" variant="ghost" onClick={() => addItem("refleksi", "evidenceTypes")} className="h-7 text-xs text-green-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
        </div>
        {course.refleksi.evidenceTypes.map((e: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={e} onChange={ev => updateItem("refleksi", "evidenceTypes", i, ev.target.value)} placeholder={`Evidensi ${i + 1}: cth. Foto dokumentasi praktik...`} />
            {course.refleksi.evidenceTypes.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("refleksi", "evidenceTypes", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Item Portfolio</Label>
          <Button size="sm" variant="ghost" onClick={() => addItem("refleksi", "portfolioItems")} className="h-7 text-xs text-green-600"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
        </div>
        {course.refleksi.portfolioItems.map((p: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={p} onChange={e => updateItem("refleksi", "portfolioItems", i, e.target.value)} placeholder={`Portfolio ${i + 1}: cth. Laporan proyek final...`} />
            {course.refleksi.portfolioItems.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem("refleksi", "portfolioItems", i)} className="text-red-500 px-2"><Trash2 className="w-4 h-4" /></Button>}
          </div>
        ))}
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm font-medium mb-1">
          <Shield className="w-4 h-4" /> Simpan ke Competency Passport
        </div>
        <p className="text-xs text-green-600 dark:text-green-400">Setelah menyelesaikan semua langkah, kompetensi ini akan tercatat di <Link href="/competency-passport" className="underline font-medium">Competency Passport</Link> Anda sebagai bukti penguasaan yang terverifikasi.</p>
      </div>
    </div>
  );
}

function LibraryView({ savedCourses, onLoad, onDelete, onNew }: any) {
  const levelColors: Record<string, string> = {
    L1: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    L2: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    L3: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    L4: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };
  if (savedCourses.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Perpustakaan Kosong</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Belum ada e-course yang tersimpan. Mulai bangun e-course pertama Anda!</p>
        <Button onClick={onNew} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Buat E-Course Pertama
        </Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {savedCourses.map((c: any) => (
        <Card key={c.id} className="p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <Badge className={`text-xs ${levelColors[c.level] || levelColors.L2}`}>{c.level}</Badge>
            <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)} className="text-red-400 hover:text-red-600 p-1 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{c.title || "Tanpa Judul"}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.competencyUnit}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{c.sector}</p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span><span>{c.completedSteps}/{STEPS.length} langkah</span>
            </div>
            <Progress value={Math.round((c.completedSteps / STEPS.length) * 100)} className="h-1.5" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString("id-ID")}</span>
            <Button size="sm" onClick={() => onLoad(c)} className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white">
              <ArrowRight className="w-3 h-3 mr-1" /> Lanjutkan
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
