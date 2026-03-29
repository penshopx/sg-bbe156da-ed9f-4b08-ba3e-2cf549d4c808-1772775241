import { useState, useRef, useEffect, useCallback } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Send, Zap, ChevronRight, RotateCcw, Copy, Check,
  Bot, User, ArrowLeft, Menu, X, Info, Sparkles, Brain
} from "lucide-react";
import Link from "next/link";
import { ChaesaLogo } from "@/components/ChaesaLogo";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { AGENTS } from "@/lib/agents-data";
import type { AgentId } from "@/lib/agents-data";

/* ── Types ───────────────────────────────────────────── */
interface HistoryItem { role: "user" | "assistant"; content: string; }
interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: typeof AGENTS[AgentId];
  followups?: string[];
  routing?: { reason: string; confidence: number; manual: boolean };
  timestamp: Date;
}

/* ── Sample prompts per agent ─────────────────────────── */
const SAMPLE_PROMPTS: Record<AgentId, string[]> = {
  struktur: [
    "Hitung kapasitas balok beton 30x60 cm dengan tulangan 4D19, mutu beton fc'=25 MPa",
    "Berapa kebutuhan tulangan kolom 50x50 cm untuk beban aksial 800 kN?",
    "Jelaskan perbedaan metode ASD dan LRFD dalam desain struktur baja",
  ],
  k3: [
    "Buat JSA (Job Safety Analysis) untuk pekerjaan pemasangan bekisting di ketinggian",
    "APD apa saja yang wajib untuk pekerjaan di ruang terbatas?",
    "Bagaimana prosedur lockout/tagout yang benar untuk pekerjaan elektrikal?",
  ],
  mep: [
    "Hitung kapasitas AC untuk ruang kantor 10x15 m dengan 20 orang",
    "Berapa ukuran kabel yang dibutuhkan untuk beban 50 kW, tegangan 380V?",
    "Jelaskan sistem grounding yang benar untuk gedung 10 lantai",
  ],
  geoteknik: [
    "Interpretasikan hasil SPT dengan N-value rata-rata 15 untuk fondasi gedung 5 lantai",
    "Apa jenis fondasi yang tepat untuk tanah lempung dengan daya dukung rendah?",
    "Bagaimana menghitung penurunan (settlement) fondasi tiang pancang?",
  ],
  kontrak: [
    "Bagaimana cara mengajukan klaim keterlambatan akibat force majeure di kontrak FIDIC?",
    "Apa yang dimaksud dengan Liquidated Damages dan bagaimana menghitungnya?",
    "Buat draft surat teguran kepada subkontraktor yang terlambat menyelesaikan pekerjaan",
  ],
  pm: [
    "Buat template WBS untuk proyek pembangunan gedung perkantoran 5 lantai",
    "Proyek saya terlambat 3 minggu dari baseline, bagaimana recovery plan-nya?",
    "Jelaskan cara membaca dan menganalisa S-Curve proyek konstruksi",
  ],
  rab: [
    "Hitung volume pekerjaan beton lantai 10x15 m tebal 12 cm beserta tulangan wiremesh",
    "Berapa anggaran kasar untuk membangun ruko 3 lantai di Jakarta tahun 2025?",
    "Apa komponen analisa harga satuan pekerjaan pasangan bata merah per m²?",
  ],
  bim: [
    "Bagaimana cara melakukan clash detection antara struktur dan MEP di Navisworks?",
    "Apa level LOD yang tepat untuk model BIM pada tahap perencanaan (DD)?",
    "Jelaskan workflow dari model 3D Revit ke 4D scheduling dengan Navisworks",
  ],
};

/* ── Utility ─────────────────────────────────────────── */
function formatTime(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function genId() { return Math.random().toString(36).slice(2, 10); }

/* ── Main page ───────────────────────────────────────── */
export default function AIAgentsPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: genId(), role: "system",
      content: "👋 Selamat datang di **Chaesa Multi-Agent AI** — 8 ahli konstruksi berpengalaman siap membantu. Pilih mode **Auto-Route** untuk biarkan sistem memilihkan ahli terbaik, atau pilih manual dari panel kiri.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | "auto">("auto");
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[AgentId] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId] = useState(() => genId());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const historyForApi: HistoryItem[] = messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");
    setLoading(true);
    setSidebarOpen(false);

    const userMsg: AgentMessage = {
      id: genId(), role: "user", content, timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: historyForApi,
          preferredAgent: selectedAgent === "auto" ? undefined : selectedAgent,
          sessionId,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mendapat respons");

      setActiveAgent(data.agent);
      const assistantMsg: AgentMessage = {
        id: genId(), role: "assistant",
        content: data.response,
        agent: data.agent,
        followups: data.followups,
        routing: data.routing,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: AgentMessage = {
        id: genId(), role: "assistant",
        content: `⚠️ Maaf, terjadi kesalahan: ${err instanceof Error ? err.message : "Unknown error"}. Silakan coba lagi.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, selectedAgent, historyForApi, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: genId(), role: "system",
      content: "💬 Percakapan baru dimulai. Pilih agent atau gunakan Auto-Route.",
      timestamp: new Date(),
    }]);
    setActiveAgent(null);
  };

  const agentList = Object.values(AGENTS);

  return (
    <>
      <SEO
        title="Chaesa Multi-Agent AI — 8 Ahli Konstruksi Indonesia"
        description="Konsultasikan proyek konstruksi Anda dengan 8 AI Expert: Struktur, K3, MEP, Geoteknik, Kontrak, PM, RAB, dan BIM. Auto-route ke ahli yang tepat."
      />
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 z-30">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <ChaesaLogo size={28} />
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hidden sm:block">Chaesa</span>
              </div>
            </Link>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Multi-Agent AI</span>
              <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] hidden sm:flex">8 Experts</Badge>
            </div>

            {/* Active agent pill */}
            {activeAgent && (
              <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>{activeAgent.icon}</span>
                <span className="hidden sm:block">{activeAgent.name}</span>
                <span className="hidden md:block text-gray-400">— {activeAgent.title}</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button onClick={clearChat} title="Mulai percakapan baru" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <ThemeSwitch />
              <Link href="/"><Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1"><ArrowLeft className="w-3 h-3" /> Beranda</Button></Link>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">

          {/* ── Sidebar overlay (mobile) ── */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Agent sidebar ── */}
          <aside className={`
            w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col shrink-0
            lg:flex overflow-y-auto
            ${sidebarOpen ? "flex fixed inset-y-0 left-0 z-30 pt-14" : "hidden"}
          `}>
            <div className="p-4 shrink-0">
              {/* Mode toggle */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode Routing</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedAgent("auto")}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${selectedAgent === "auto" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                  >
                    <Zap className={`w-4 h-4 ${selectedAgent === "auto" ? "text-purple-500" : "text-gray-400"}`} />
                    Auto-Route
                    <span className="text-[9px] font-normal text-gray-400">AI pilihkan</span>
                  </button>
                  <button
                    onClick={() => selectedAgent === "auto" && setSelectedAgent("struktur")}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${selectedAgent !== "auto" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                  >
                    <Bot className={`w-4 h-4 ${selectedAgent !== "auto" ? "text-blue-500" : "text-gray-400"}`} />
                    Manual
                    <span className="text-[9px] font-normal text-gray-400">pilih agent</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">8 AI Experts</p>
            </div>

            <div className="flex-1 px-3 pb-4 space-y-1.5 overflow-y-auto">
              {agentList.map(agent => {
                const isSelected = selectedAgent === agent.id;
                const isActive = activeAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent.id as AgentId); setSidebarOpen(false); }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "border-transparent bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isSelected ? "bg-white/20" : "bg-white dark:bg-gray-700"}`}>
                        {agent.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold truncate">{agent.name}</p>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />}
                        </div>
                        <p className={`text-[10px] truncate ${isSelected ? "text-white/70 dark:text-gray-600" : "text-gray-400"}`}>{agent.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sample prompts */}
            {selectedAgent !== "auto" && AGENTS[selectedAgent as AgentId] && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Contoh Pertanyaan</p>
                <div className="space-y-1.5">
                  {SAMPLE_PROMPTS[selectedAgent as AgentId].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(p); inputRef.current?.focus(); setSidebarOpen(false); }}
                      className="w-full text-left text-[11px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-start gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAgent === "auto" && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                    Mode Auto-Route: sistem akan menganalisis pertanyaan Anda dan memilih ahli yang paling tepat secara otomatis.
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* ── Chat area ── */}
          <main className="flex-1 flex flex-col overflow-hidden">

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {messages.map(msg => {
                if (msg.role === "system") {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 max-w-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                      </div>
                    </div>
                  );
                }

                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="flex items-end gap-2 flex-row-reverse">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                          </div>
                          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-right mt-1 mr-10">{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  );
                }

                // Assistant message
                const ag = msg.agent;
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[85%] w-full">
                      {/* Agent header */}
                      {ag && (
                        <div className="flex items-center gap-2 mb-2 ml-10">
                          <div className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${ag.bg} ${ag.accent} flex items-center gap-1.5`}>
                            <span>{ag.icon}</span>
                            <span>{ag.name}</span>
                            <span className="opacity-60">·</span>
                            <span className="opacity-75">{ag.title}</span>
                          </div>
                          {msg.routing && !msg.routing.manual && (
                            <div title={`Auto-routed: ${msg.routing.reason}`} className="flex items-center gap-1 text-[10px] text-gray-400 cursor-help">
                              <Zap className="w-3 h-3 text-purple-400" />
                              <span>{Math.round(msg.routing.confidence * 100)}% match</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          {ag?.icon || "🤖"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </div>

                          {/* Follow-up suggestions */}
                          {msg.followups && msg.followups.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {msg.followups.map((fq, i) => (
                                <button
                                  key={i}
                                  onClick={() => sendMessage(fq)}
                                  className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                >
                                  {fq}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-1.5">
                            <p className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</p>
                            {msg.routing && !msg.routing.manual && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Info className="w-3 h-3" /> {msg.routing.reason}
                              </p>
                            )}
                            <button
                              onClick={() => copyText(msg.id, msg.content)}
                              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                            >
                              {copiedId === msg.id ? <><Check className="w-3 h-3 text-green-500" /> Disalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-gray-400">
                          {selectedAgent === "auto" ? "Memilih ahli & menyusun jawaban..." : `${AGENTS[selectedAgent as AgentId]?.name || "AI"} sedang menjawab...`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input area ── */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 shrink-0">
              {/* Current mode pill */}
              <div className="flex items-center gap-2 mb-2.5">
                {selectedAgent === "auto" ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400">
                    <Zap className="w-3.5 h-3.5" /> Auto-Route aktif
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>{AGENTS[selectedAgent as AgentId]?.icon}</span>
                    Langsung ke {AGENTS[selectedAgent as AgentId]?.name}
                    <button onClick={() => setSelectedAgent("auto")} className="ml-1 text-[10px] text-purple-600 dark:text-purple-400 hover:underline">Ganti ke Auto</button>
                  </div>
                )}
                <div className="ml-auto text-[10px] text-gray-400">Enter untuk kirim · Shift+Enter baris baru</div>
              </div>
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedAgent === "auto"
                      ? "Tanya apa saja tentang konstruksi... sistem akan pilihkan ahli terbaik"
                      : `Tanya ${AGENTS[selectedAgent as AgentId]?.name || ""}...`
                  }
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors leading-relaxed"
                  disabled={loading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="h-12 w-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shrink-0 p-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Chaesa AI dapat membuat kesalahan. Verifikasi kalkulasi teknis dengan insinyur berlisensi.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
