import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send, Zap, ChevronRight, RotateCcw, Copy, Check,
  Bot, User, ArrowLeft, Menu, X, Info, Sparkles, Brain,
  Download, AtSign, AlertCircle, Hash, Lightbulb, Users2
} from "lucide-react";
import Link from "next/link";
import { ChaesaLogo } from "@/components/ChaesaLogo";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { AGENTS } from "@/lib/agents-data";
import type { AgentId } from "@/lib/agents-data";

/* ── Types ─────────────────────────────────────────────── */
interface HistoryItem { role: "user" | "assistant"; content: string; }
interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: typeof AGENTS[AgentId];
  followups?: string[];
  routing?: { reason: string; confidence: number; manual: boolean };
  collab?: Array<{ agent: typeof AGENTS[AgentId]; response: string }>;
  timestamp: Date;
}

/* ── Sample prompts ─────────────────────────────────────── */
const SAMPLE_PROMPTS: Record<AgentId, string[]> = {
  struktur:  ["Hitung kapasitas balok beton 30x60 cm, tulangan 4D19, fc'=25 MPa", "Berapa kebutuhan tulangan kolom 50x50 cm untuk beban aksial 800 kN?", "Jelaskan perbedaan metode ASD dan LRFD dalam desain struktur baja"],
  k3:        ["Buat JSA untuk pekerjaan pemasangan bekisting di ketinggian 10 m", "APD apa saja yang wajib untuk pekerjaan di ruang terbatas?", "Bagaimana prosedur lockout/tagout yang benar untuk pekerjaan elektrikal?"],
  mep:       ["Hitung kapasitas AC untuk ruang kantor 10x15 m dengan 20 orang", "Berapa ukuran kabel untuk beban 50 kW, tegangan 380V tiga fase?", "Jelaskan sistem grounding yang benar untuk gedung 10 lantai"],
  geoteknik: ["Interpretasikan SPT N-value rata-rata 15 untuk fondasi gedung 5 lantai", "Apa jenis fondasi yang tepat untuk tanah lempung daya dukung rendah?", "Bagaimana menghitung penurunan (settlement) fondasi tiang pancang?"],
  kontrak:   ["Cara mengajukan klaim keterlambatan akibat force majeure di FIDIC?", "Apa itu Liquidated Damages dan bagaimana menghitungnya di SPK?", "Buat draft surat teguran kepada subkontraktor yang terlambat"],
  pm:        ["Buat template WBS untuk proyek gedung perkantoran 5 lantai", "Proyek saya terlambat 3 minggu dari baseline, bagaimana recovery plan-nya?", "Jelaskan cara membaca dan menganalisa S-Curve proyek konstruksi"],
  rab:       ["Hitung volume beton lantai 10x15 m tebal 12 cm beserta wiremesh", "Berapa anggaran kasar untuk ruko 3 lantai di Jakarta tahun 2025?", "Komponen analisa harga satuan pasangan bata merah per m²?"],
  bim:       ["Cara clash detection antara struktur dan MEP di Navisworks?", "Apa level LOD yang tepat untuk model BIM pada tahap DD?", "Jelaskan workflow model 3D Revit ke 4D scheduling Navisworks"],
};

const QUICK_STARTS = [
  { agentId: "struktur" as AgentId, prompt: "Hitung kapasitas balok beton 30x60 cm, tulangan 4D19" },
  { agentId: "k3"       as AgentId, prompt: "Buat JSA untuk pekerjaan bekisting di ketinggian 10 m" },
  { agentId: "mep"      as AgentId, prompt: "Hitung kapasitas AC ruang kantor 10x15 m, 20 orang" },
  { agentId: "geoteknik"as AgentId, prompt: "Interpretasikan SPT N-value 15 untuk fondasi gedung 5 lantai" },
  { agentId: "kontrak"  as AgentId, prompt: "Cara klaim keterlambatan force majeure di kontrak FIDIC?" },
  { agentId: "pm"       as AgentId, prompt: "Template WBS proyek gedung perkantoran 5 lantai" },
  { agentId: "rab"      as AgentId, prompt: "Anggaran kasar ruko 3 lantai di Jakarta 2025?" },
  { agentId: "bim"      as AgentId, prompt: "Clash detection struktur vs MEP di Navisworks?" },
];

/* ── Markdown renderer ──────────────────────────────────── */
function inlineFormat(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-purple-600 dark:text-purple-400 mx-0.5">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(
        <pre key={`code-${i}`} className="bg-gray-900 dark:bg-black text-green-300 rounded-xl p-4 my-3 overflow-x-auto text-xs font-mono leading-relaxed border border-gray-700">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++; continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${i}`} className="font-bold text-sm mt-4 mb-1.5 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1">{inlineFormat(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${i}`} className="font-bold text-base mt-5 mb-2 text-gray-900 dark:text-white">{inlineFormat(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${i}`} className="font-extrabold text-lg mt-5 mb-2 text-gray-900 dark:text-white">{inlineFormat(line.slice(2))}</h1>);
      i++; continue;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <div key={`bq-${i}`} className="border-l-4 border-purple-400 pl-3 my-2 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-r-lg">
          <p className="text-sm text-purple-700 dark:text-purple-300 italic">{inlineFormat(line.slice(2))}</p>
        </div>
      );
      i++; continue;
    }

    if (line.match(/^[-•*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-•*] /)) { items.push(lines[i].slice(2)); i++; }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm">
              <span className="text-purple-400 mt-1.5 shrink-0 text-xs">▸</span>
              <span className="leading-relaxed">{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm">
              <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
              <span className="leading-relaxed flex-1">{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.match(/^[-]{3,}$/)) {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-gray-200 dark:border-gray-700" />);
      i++; continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="h-1.5" />);
      i++; continue;
    }

    elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{inlineFormat(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5 text-gray-700 dark:text-gray-300">{elements}</div>;
}

/* ── Utility ────────────────────────────────────────────── */
function formatTime(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function genId() { return Math.random().toString(36).slice(2, 10); }

function parseAtMention(text: string): { agentId: AgentId | null; cleanText: string } {
  const match = text.match(/^@(\w+)\s?(.*)/s);
  if (!match) return { agentId: null, cleanText: text };
  const id = match[1].toLowerCase();
  if (id in AGENTS) return { agentId: id as AgentId, cleanText: match[2].trim() || text };
  return { agentId: null, cleanText: text };
}

/* ── Main page ──────────────────────────────────────────── */
export default function AIAgentsPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | "auto">("auto");
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[AgentId] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId] = useState(() => genId());
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [sessionAgents, setSessionAgents] = useState<Map<AgentId, number>>(new Map());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const historyForApi: HistoryItem[] = useMemo(() =>
    messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    [messages]
  );

  const mentionMatches = useMemo(() => {
    if (!mentionQuery) return Object.values(AGENTS);
    const q = mentionQuery.toLowerCase();
    return Object.values(AGENTS).filter(a =>
      a.id.includes(q) || a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)
    );
  }, [mentionQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const atMatch = val.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
    }
  };

  const applyMention = (agentId: AgentId) => {
    const clean = input.replace(/@\w*$/, `@${agentId} `);
    setInput(clean);
    setShowMentionDropdown(false);
    inputRef.current?.focus();
  };

  const sendMessage = useCallback(async (text?: string) => {
    const raw = (text || input).trim();
    if (!raw || loading) return;

    const { agentId: mentionedAgent, cleanText } = parseAtMention(raw);
    const effectiveAgent = mentionedAgent || (selectedAgent === "auto" ? undefined : selectedAgent);
    const content = cleanText || raw;

    setInput("");
    setLoading(true);
    setShowMentionDropdown(false);
    setSidebarOpen(false);

    const userMsg: AgentMessage = { id: genId(), role: "user", content: raw, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: historyForApi, preferredAgent: effectiveAgent, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapat respons");

      setActiveAgent(data.agent);
      setSessionAgents(prev => {
        const next = new Map(prev);
        next.set(data.agent.id as AgentId, (next.get(data.agent.id as AgentId) || 0) + 1);
        return next;
      });

      const assistantMsg: AgentMessage = {
        id: genId(), role: "assistant",
        content: data.response, agent: data.agent,
        followups: data.followups, routing: data.routing,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: genId(), role: "assistant",
        content: `⚠️ **Terjadi Kesalahan**\n\n${err instanceof Error ? err.message : "Unknown error"}\n\nSilakan coba lagi atau refresh halaman.`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, selectedAgent, historyForApi, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown && e.key === "Escape") { setShowMentionDropdown(false); return; }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setActiveAgent(null);
    setSessionAgents(new Map());
  };

  const exportChat = () => {
    const lines = ["# Chaesa Multi-Agent AI — Riwayat Percakapan", `Waktu: ${new Date().toLocaleString("id-ID")}`, "---", ""];
    messages.forEach(m => {
      if (m.role === "user") lines.push(`**Pengguna:** ${m.content}`, "");
      if (m.role === "assistant" && m.agent) {
        lines.push(`**${m.agent.name} (${m.agent.title}):**`, m.content, "");
      }
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `chaesa-ai-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const agentList = Object.values(AGENTS);
  const hasConversation = messages.some(m => m.role === "user");
  const userMessageCount = messages.filter(m => m.role === "user").length;

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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
              <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] hidden sm:flex border-0">8 Experts</Badge>
            </div>

            {/* Active agent pill */}
            {activeAgent && (
              <div className="hidden md:flex items-center gap-2 ml-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>{activeAgent.icon} {activeAgent.name}</span>
                <span className="text-gray-400 hidden lg:block">· {activeAgent.title}</span>
              </div>
            )}

            {/* Session stats */}
            {userMessageCount > 0 && (
              <div className="hidden md:flex items-center gap-3 ml-auto mr-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{userMessageCount} pesan</span>
                <span className="flex items-center gap-1"><Users2 className="w-3 h-3" />{sessionAgents.size} ahli digunakan</span>
              </div>
            )}

            <div className={`flex items-center gap-1 ${userMessageCount > 0 ? "" : "ml-auto"}`}>
              {messages.length > 0 && (
                <button onClick={exportChat} title="Unduh percakapan" className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                  <Download className="w-4 h-4" />
                </button>
              )}
              <button onClick={clearChat} title="Mulai baru" className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <ThemeSwitch />
              <Link href="/"><Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1 ml-1"><ArrowLeft className="w-3 h-3" /> Beranda</Button></Link>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">

          {/* Sidebar overlay (mobile) */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Sidebar ── */}
          <aside className={`
            w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col shrink-0 overflow-hidden
            lg:flex
            ${sidebarOpen ? "flex fixed inset-y-0 left-0 z-30 pt-14" : "hidden"}
          `}>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* Mode toggle */}
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Routing Mode</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button
                    onClick={() => setSelectedAgent("auto")}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${selectedAgent === "auto" ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"}`}
                  >
                    <Zap className={`w-4 h-4 ${selectedAgent === "auto" ? "text-purple-500" : "text-gray-400"}`} />
                    Auto-Route
                    <span className="text-[9px] font-normal opacity-70">AI pilihkan ahli</span>
                  </button>
                  <button
                    onClick={() => selectedAgent === "auto" && setSelectedAgent("struktur")}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${selectedAgent !== "auto" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"}`}
                  >
                    <Bot className={`w-4 h-4 ${selectedAgent !== "auto" ? "text-blue-500" : "text-gray-400"}`} />
                    Manual
                    <span className="text-[9px] font-normal opacity-70">pilih sendiri</span>
                  </button>
                </div>

                {/* @mention tip */}
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-2.5 mb-5">
                  <AtSign className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                    Ketik <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">@struktur</code> atau <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">@k3</code> di pesan untuk langsung ke ahli tertentu
                  </p>
                </div>

                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">8 AI Experts</p>
              </div>

              {/* Agent list */}
              <div className="px-3 pb-2 space-y-1">
                {agentList.map(agent => {
                  const isSelected = selectedAgent === agent.id;
                  const useCount = sessionAgents.get(agent.id as AgentId) || 0;
                  const isActiveNow = activeAgent?.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => { setSelectedAgent(agent.id as AgentId); setSidebarOpen(false); }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all group ${
                        isSelected
                          ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                          : "border-transparent bg-gray-50 dark:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 ${isSelected ? "bg-white/20 dark:bg-black/20" : "bg-white dark:bg-gray-700"}`}>
                          {agent.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate">{agent.name}</p>
                            {isActiveNow && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />}
                          </div>
                          <p className={`text-[10px] truncate ${isSelected ? "opacity-60" : "text-gray-400"}`}>{agent.title}</p>
                        </div>
                        {useCount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold ${isSelected ? "bg-white/20 dark:bg-black/20" : "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"}`}>
                            {useCount}×
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Session activity */}
              {sessionAgents.size > 0 && (
                <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Sesi Ini</p>
                  <div className="space-y-1.5">
                    {Array.from(sessionAgents.entries()).sort((a, b) => b[1] - a[1]).map(([id, count]) => {
                      const ag = AGENTS[id];
                      const pct = Math.round((count / userMessageCount) * 100);
                      return (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-sm shrink-0">{ag.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">{ag.name}</span>
                              <span className="text-[10px] text-gray-400 ml-1">{count}×</span>
                            </div>
                            <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sample prompts */}
              {selectedAgent !== "auto" && AGENTS[selectedAgent as AgentId] && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Contoh Pertanyaan</p>
                  <div className="space-y-1.5">
                    {SAMPLE_PROMPTS[selectedAgent as AgentId].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(p); inputRef.current?.focus(); setSidebarOpen(false); }}
                        className="w-full text-left text-[11px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-start gap-1.5 group"
                      >
                        <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-gray-300 group-hover:text-purple-400 transition-colors" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgent === "auto" && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800/40">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-1">Cara kerja Auto-Route</p>
                      <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 leading-relaxed">
                        AI membaca pertanyaan Anda, mencocokkan kata kunci, dan memilih satu dari 8 ahli yang paling relevan secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Chat area ── */}
          <main className="flex-1 flex flex-col overflow-hidden">

            {/* Empty state */}
            {!hasConversation && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-10">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">🤖</div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">8 Ahli Konstruksi Siap Membantu</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                      Tanyakan apa saja — perhitungan struktur, K3, estimasi biaya, kontrak, BIM, atau manajemen proyek. Sistem akan otomatis memilih ahli yang paling tepat.
                    </p>
                  </div>

                  {/* Quick-start grid */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {QUICK_STARTS.map((qs, i) => {
                      const ag = AGENTS[qs.agentId];
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage(qs.prompt)}
                          className="text-left p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">{ag.icon}</div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{ag.name}</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug font-medium">{qs.prompt}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tips */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Tips</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        Ketik <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">@struktur</code>, <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">@k3</code>, <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">@pm</code>, dll. di awal pesan untuk langsung terhubung ke ahli pilihan Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {hasConversation && (
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
                {messages.map(msg => {
                  if (msg.role === "user") {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[78%]">
                          <div className="flex items-end gap-2 flex-row-reverse">
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />
                            </div>
                            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 text-right mt-1 mr-9">{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    );
                  }

                  const ag = msg.agent;
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[88%] w-full">
                        {ag && (
                          <div className="flex items-center gap-2 mb-2 ml-9">
                            <div className={`text-[10px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${ag.bg} ${ag.accent}`}>
                              <span>{ag.icon}</span>
                              <span className="font-bold">{ag.name}</span>
                              <span className="opacity-50">·</span>
                              <span className="opacity-70 hidden sm:block">{ag.title}</span>
                            </div>
                            {msg.routing && !msg.routing.manual && (
                              <span title={msg.routing.reason} className="flex items-center gap-1 text-[10px] text-gray-400 cursor-help">
                                <Zap className="w-2.5 h-2.5 text-purple-400" />
                                {Math.round(msg.routing.confidence * 100)}% match
                              </span>
                            )}
                            {msg.routing?.manual && (
                              <span className="text-[10px] text-blue-500 flex items-center gap-1">
                                <Bot className="w-2.5 h-2.5" /> Manual
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {ag?.icon || "🤖"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
                              <MarkdownContent text={msg.content} />
                            </div>

                            {msg.followups && msg.followups.length > 0 && (
                              <div className="mt-2.5">
                                <p className="text-[10px] text-gray-400 mb-1.5 ml-0.5">Pertanyaan lanjutan:</p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.followups.map((fq, i) => (
                                    <button
                                      key={i}
                                      onClick={() => sendMessage(fq)}
                                      className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-1"
                                    >
                                      <ChevronRight className="w-2.5 h-2.5" /> {fq}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {msg.routing && !msg.routing.manual && msg.routing.reason && (
                              <div className="flex items-center gap-1.5 mt-1.5 ml-0.5">
                                <Info className="w-3 h-3 text-gray-300" />
                                <p className="text-[10px] text-gray-400 italic">{msg.routing.reason}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-1.5 ml-0.5">
                              <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                              <button
                                onClick={() => copyText(msg.id, msg.content)}
                                className="text-[10px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                              >
                                {copiedId === msg.id
                                  ? <><Check className="w-3 h-3 text-green-500" /> Disalin</>
                                  : <><Copy className="w-3 h-3" /> Salin</>}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                      </div>
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="flex gap-1">
                            {[0, 150, 300].map(d => (
                              <span key={d} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {selectedAgent === "auto"
                              ? "Memilih ahli & menyusun jawaban..."
                              : `${AGENTS[selectedAgent as AgentId]?.name || "AI"} sedang menjawab...`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* ── Input ── */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-4 shrink-0">
              {/* Mode indicator */}
              <div className="flex items-center gap-2 mb-2">
                {selectedAgent === "auto" ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    <Zap className="w-3.5 h-3.5" /> Auto-Route aktif
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="text-sm">{AGENTS[selectedAgent as AgentId]?.icon}</span>
                    <span className="font-medium">{AGENTS[selectedAgent as AgentId]?.name}</span>
                    <button onClick={() => setSelectedAgent("auto")} className="text-purple-500 hover:underline ml-0.5">→ Auto</button>
                  </div>
                )}
                <div className="ml-auto text-[10px] text-gray-400 hidden sm:block">
                  Enter = kirim · Shift+Enter = baris baru · @agent = pilih ahli
                </div>
              </div>

              {/* @mention dropdown */}
              {showMentionDropdown && mentionMatches.length > 0 && (
                <div className="mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <p className="text-[10px] text-gray-400 px-3 pt-2 pb-1 font-semibold uppercase tracking-wider">Pilih Ahli</p>
                  {mentionMatches.map(ag => (
                    <button
                      key={ag.id}
                      onClick={() => applyMention(ag.id as AgentId)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-base">{ag.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white">@{ag.id}</p>
                        <p className="text-[10px] text-gray-400">{ag.name} · {ag.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedAgent === "auto"
                      ? "Tanya apa saja... atau ketik @k3, @struktur, @pm untuk pilih ahli"
                      : `Tanya ${AGENTS[selectedAgent as AgentId]?.name || ""}...`
                  }
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors leading-relaxed"
                  disabled={loading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="h-12 w-12 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shrink-0 p-0 flex items-center justify-center disabled:opacity-40"
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
