import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, Send, MessageCircle, Lightbulb, RefreshCw, User, Trash2, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAIMotivation, sendAIChat } from "@/src/lib/api";
import Markdown from "react-markdown";
import MurojaahCoachView from "./MurojaahCoachView";

export default function AICompanion({ initialMode = "coach" }: { initialMode?: "chat" | "coach" }) {
  const [mode, setMode] = useState<"chat" | "coach">(initialMode);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const res = await getAIMotivation();
      setMotivation(res.result);
    } catch (err) {
      setMotivation("Tetap semangat menghafal! Al-Quran akan menjadi syafaat bagimu di hari kiamat kelak.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await sendAIChat(userMessage, chat);
      setChat(prev => [...prev, { role: 'ai', content: res.result }]);
    } catch (err: any) {
      setChat(prev => [...prev, { role: 'ai', content: `Maaf, terjadi kesalahan: ${err.message || "Silakan coba beberapa saat lagi."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col min-h-full pb-32">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Asisten Pintar AI <Sparkles className="text-accent" size={24} />
        </h2>
        <p className="text-sm text-gray-500 italic">Konsultasi, motivasi, dan pendamping murojaah hafalan Al-Quran.</p>
      </header>

      {/* Modern Dual Sub-tabs Switcher */}
      <div className="bg-gray-100/70 p-1.5 rounded-2xl flex items-center gap-1.5 border border-gray-250/20 select-none">
        <button
          onClick={() => setMode("coach")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === "coach"
              ? "bg-white text-amber-700 shadow-sm border border-amber-100"
              : "text-gray-400 hover:text-gray-600 hover:bg-white/30"
          }`}
        >
          <Award size={14} className={mode === "coach" ? "text-amber-500 animate-pulse" : ""} />
          AI Murojaah Coach
        </button>
        <button
          onClick={() => setMode("chat")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === "chat"
              ? "bg-white text-emerald-800 shadow-sm border border-emerald-100"
              : "text-gray-400 hover:text-gray-600 hover:bg-white/30"
          }`}
        >
          <Sparkles size={14} className={mode === "chat" ? "text-primary" : ""} />
          Tanya AI Mentor
        </button>
      </div>

      {mode === "coach" ? (
        <MurojaahCoachView />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Main AI Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary to-secondary p-1 rounded-3xl shadow-xl shadow-emerald-900/10"
          >
            <div className="bg-white rounded-[calc(1.5rem-1px)] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
                    <MessageCircle size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Motivasi Hari Ini</span>
                </div>
                <button 
                  onClick={fetchMotivation}
                  disabled={loading}
                  className="p-2 hover:bg-emerald-50 rounded-full text-secondary transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="min-h-[60px] flex items-center justify-center text-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <Loader2 className="animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Merangkai Kata...</span>
                  </div>
                ) : (
                  <p className="text-base text-gray-800 font-medium leading-relaxed italic">
                    "{motivation}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col h-[420px] md:h-[550px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diskusi Hafalan</span>
              </div>
              {chat.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm("Hapus semua riwayat obrolan ini?")) {
                      setChat([]);
                    }
                  }} 
                  className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  title="Hapus Percakapan"
                >
                  <Trash2 size={12} /> Hapus Chat
                </button>
              )}
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {chat.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-50">
                  <MessageCircle size={32} className="text-primary mb-2" />
                  <p className="text-sm font-bold text-primary">Mulai Percakapan</p>
                  <p className="text-[10px] uppercase tracking-wider">Tanyakan tips menghafal atau makna ayat</p>
                </div>
              )}
              {chat.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    m.role === 'user' ? 'bg-secondary text-white' : 'bg-primary text-white'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-emerald-50 text-emerald-900 rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="markdown-body prose prose-emerald prose-sm">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-2 mb-3">
                {["Tips Hafalan Cepat", "Tanya Makna Surah", "Motivasi Hari Ini"].map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setInput(text)}
                    className="text-[10px] font-bold px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:border-accent hover:text-accent transition-all cursor-pointer shadow-sm"
                  >
                    {text}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                  placeholder="Tanya tips menghafal..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-primary text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-center text-gray-400 font-medium pb-4">
        AI didukung oleh Google Gemini. Selalu konsultasikan hafalan Anda dengan Ustadz/Ustadzah.
      </p>
    </div>
  );
}
