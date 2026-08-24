import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    // Add user message to state
    const newMessages: Message[] = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghubungi server Bara AI.");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "model", text: data.text }]);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 font-sans selection:bg-purple-900 selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-none border border-purple-500 shadow-none">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            Bara AI
          </h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-black">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <div className="w-16 h-16 bg-purple-950 border border-purple-800 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Halo, saya Bara AI</h2>
              <p className="text-zinc-400 max-w-md">
                Asisten cerdas Anda. Tanyakan apa saja, saya siap membantu dengan jawaban yang tepat dan ringkas.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border ${
                    msg.role === "user"
                      ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                      : "bg-purple-600 border-purple-500 text-white"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm md:text-base border shadow-none ${
                    msg.role === "user"
                      ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                      : "bg-black border-purple-900 text-zinc-200"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  ) : (
                    <div className="prose prose-invert prose-purple max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border bg-purple-600 border-purple-500 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-black border border-purple-900 flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                <span className="ml-3 text-sm text-zinc-400">Bara sedang berpikir...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-900 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 border-t border-zinc-900 bg-black">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 p-2 border border-zinc-800 bg-zinc-950 focus-within:border-purple-600 transition-colors"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Tanya Bara AI..."
              className="flex-1 max-h-32 min-h-[44px] p-2 bg-transparent border-none outline-none resize-none text-white placeholder-zinc-500"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-purple-600 text-white border border-purple-500 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-zinc-600">
              Bara AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
