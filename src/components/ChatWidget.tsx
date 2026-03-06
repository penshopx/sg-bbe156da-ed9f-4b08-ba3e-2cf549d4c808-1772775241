import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, User, Bot, Loader2, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { chatbotService } from "@/services/chatbotService";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "bot" | "support";
  text: string;
  isHelpful?: boolean;
  metadata?: any;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi there! 👋 I'm Chaesa AI. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get or create a persistent session ID for guest users
  const getSessionId = () => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    return sid;
  };

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open chat
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
      // 1. Ensure conversation exists
      let currentConvId = conversationId;
      if (!currentConvId) {
        const { data: { session } } = await supabase.auth.getSession();
        const sessionId = getSessionId();
        
        // Pass user ID if authenticated, null if anonymous
        // Also pass the persistent session ID
        const { data } = await chatbotService.createConversation(session?.user?.id, sessionId);
        if (data) {
          currentConvId = data.id;
          setConversationId(data.id);
        }
      }

      if (!currentConvId) throw new Error("Failed to create conversation");

      // 2. Send to API
      const response = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConvId,
          message: userMsg.text
        })
      });

      const data = await response.json();

      const botMsg: Message = {
        id: Date.now().toString() + "_bot",
        role: "bot",
        text: data.reply,
        metadata: {
          quickReplies: data.quick_replies,
          relatedArticles: data.related_articles
        }
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: "error",
        role: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    // Optional: auto-send
    // handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div className={cn(
        "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-[350px] md:w-[400px] h-[500px] md:h-[600px] mb-4 transition-all duration-300 transform origin-bottom-right pointer-events-auto flex flex-col overflow-hidden",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 hidden"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Chaesa Helpdesk</h3>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI Online
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

        {/* Messages */}
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
                  msg.role === "user" ? "bg-gray-200 dark:bg-gray-700" : "bg-purple-100 dark:bg-purple-900/50"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === "user" 
                      ? "bg-purple-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>

                  {/* Related Articles */}
                  {msg.metadata?.relatedArticles?.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Related Help Articles:
                      </p>
                      <div className="space-y-1">
                        {msg.metadata.relatedArticles.map((article: any) => (
                          <div key={article.id} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-gray-700 cursor-pointer hover:border-blue-400 transition-colors">
                            {article.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Replies */}
                  {msg.metadata?.quickReplies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.metadata.quickReplies.map((reply: string) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
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
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-[10px] text-center text-gray-400 mt-2">
            Powered by Chaesa AI • Answers may be generated automatically
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-xl pointer-events-auto transition-all duration-300 hover:scale-110",
          isOpen ? "bg-gray-800 hover:bg-gray-700 rotate-90" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </div>
  );
}