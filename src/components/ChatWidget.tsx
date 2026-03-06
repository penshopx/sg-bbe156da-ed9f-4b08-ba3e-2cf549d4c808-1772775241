import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, User, Bot, Loader2, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "bot" | "support";
  text: string;
  isHelpful?: boolean;
  metadata?: any;
}

function BotMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5">{children}</h3>,
        p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        hr: () => <hr className="my-2 border-gray-200 dark:border-gray-700" />,
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg my-1.5 overflow-x-auto">
              <code className="text-xs font-mono text-gray-800 dark:text-gray-200">{children}</code>
            </pre>
          );
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-green-500 pl-2 my-1.5 italic text-gray-600 dark:text-gray-400">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 underline hover:text-green-700">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-green-50 dark:bg-green-900/30">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-gray-200 dark:border-gray-700 last:border-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1.5 text-left font-semibold text-green-700 dark:text-green-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Halo Kak! 👋 Saya Chaesa, asisten AI Kamu. Ada yang bisa saya bantu hari ini?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter(m => m.id !== "welcome" && (m.role === "user" || m.role === "bot"))
        .map(m => ({ role: m.role === "user" ? "user" : "bot", text: m.text }));

      const response = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: chatHistory,
        })
      });

      const data = await response.json();

      const botMsg: Message = {
        id: Date.now().toString() + "_bot",
        role: "bot",
        text: data.reply || "Maaf, ada gangguan. Coba lagi ya.",
        metadata: {
          quickReplies: data.quick_replies,
          relatedArticles: data.related_articles
        }
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: "error_" + Date.now(),
        role: "bot",
        text: "Maaf, saya sedang mengalami gangguan koneksi. Silakan coba lagi nanti ya."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end pointer-events-none md:bottom-6 md:right-6">
      <div className={cn(
        "bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 transform origin-bottom-right pointer-events-auto flex flex-col overflow-hidden",
        "fixed inset-0 w-full h-full rounded-none border-0",
        "md:relative md:inset-auto md:w-[400px] md:h-[600px] md:mb-4 md:rounded-2xl md:border md:border-gray-200 md:dark:border-gray-800",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 hidden"
      )}>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center justify-between text-white safe-area-top">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Chaesa Helpdesk</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI Aktif
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-950" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "user" ? "bg-gray-200 dark:bg-gray-700" : "bg-green-100 dark:bg-green-900/50"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />}
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === "user" 
                      ? "bg-green-600 text-white rounded-tr-none whitespace-pre-wrap" 
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  )}>
                    {msg.role === "user" ? msg.text : <BotMarkdown content={msg.text} />}
                  </div>

                  {msg.metadata?.relatedArticles?.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Artikel Terkait:
                      </p>
                      <div className="space-y-1">
                        {msg.metadata.relatedArticles.map((article: any) => (
                          <div key={article.id} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-green-100 dark:border-gray-700 cursor-pointer hover:border-green-400 transition-colors">
                            {article.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.metadata?.quickReplies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.metadata.quickReplies.map((reply: string) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  <span className="text-xs text-gray-400">Sedang mengetik...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 pb-safe bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Tulis pertanyaan Kamu..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-green-500"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-[10px] text-center text-gray-400 mt-2">
            Didukung oleh Chaesa AI • Jawaban dihasilkan secara otomatis
          </div>
        </div>
      </div>

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-xl pointer-events-auto transition-all duration-300 hover:scale-110 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mb-4 mr-4 md:mb-0 md:mr-0"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
