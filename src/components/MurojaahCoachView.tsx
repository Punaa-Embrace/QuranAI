import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, Send, MessageCircle, RotateCcw, User, Trash2, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendMurojaahCoach } from "@/src/lib/api";
import Markdown from "react-markdown";
import AIErrorCard from "./AIErrorCard";

export default function MurojaahCoachView() {
  const [chat, setChat] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleRetryMurojaah = async () => {
    const userMsgs = chat.filter(m => m.role === 'user');
    if (userMsgs.length === 0 || isTyping) return;
    const lastUserMessage = userMsgs[userMsgs.length - 1].content;
    
    if (chat.length > 0 && chat[chat.length - 1].role === 'ai') {
      setChat(prev => prev.slice(0, prev.length - 1));
    }
    
    setIsTyping(true);
    try {
      const historyTruncated = chat.slice(0, chat.length - 1);
      const res = await sendMurojaahCoach(lastUserMessage, historyTruncated);
      setChat(prev => [...prev, { role: 'ai' as const, content: res.result }]);
    } catch (err: any) {
      setChat(prev => [...prev, { role: 'ai' as const, content: `Terjadi masalah koneksi Coach AI: ${err.message || "Gagal menghubungi Server."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isTyping) return;

    if (!messageText) {
      setInput("");
    }

    const newChat = [...chat, { role: 'user' as const, content: textToSend }];
    setChat(newChat);
    setIsTyping(true);

    try {
      const res = await sendMurojaahCoach(textToSend, chat);
      setChat(prev => [...prev, { role: 'ai' as const, content: res.result }]);
    } catch (err: any) {
      setChat(prev => [...prev, { role: 'ai' as const, content: `Terjadi masalah koneksi Coach AI: ${err.message || "Gagal menghubungi Server."}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startTopic = (text: string) => {
    handleSend(text);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const clearChat = () => {
    if (confirm("Reset ulang sesi bimbingan murojaah Anda?")) {
      setChat([]);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 p-5 rounded-3xl border border-amber-100 flex items-start gap-3.5 shadow-sm">
        <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 shadow-md shadow-amber-500/10">
          <Award size={20} />
        </div>
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">HEBAT & FUNGSIONAL</span>
          <h3 className="font-extrabold text-sm text-gray-900 mt-1">Uji Hafalan bersama Coach Tahfidz AI</h3>
          <p className="text-[11px] text-gray-500 leading-normal mt-0.5">
            Sebutkan surah & ayat yang Anda hafal, lalu Coach AI akan mengetes potongan ayatnya untuk Anda sambung secara interaktif dan super cepat!
          </p>
        </div>
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col h-[420px] md:h-[550px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header Chat */}
        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Coach Murojaah Aktif</span>
          </div>
          {chat.length > 0 && (
            <button
              onClick={clearChat}
              className="text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 py-1 px-2 hover:bg-red-50 rounded-lg"
              title="Mulai Ulang Tes"
            >
              <RotateCcw size={12} /> Reset Sesi
            </button>
          )}
        </div>

        {/* Messages Body */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Siap Menyetor Hafalan?</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
                  Ketuk salah satu tombol di bawah atau ketik target hafalan Anda untuk memulai tes instan!
                </p>
              </div>

              {/* Starter Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-lg lg:max-w-2xl pt-2 mx-auto">
                {[
                  { text: "Saya hafal Al-Mulk ayat 1-5", display: "Al-Mulk 1-5 📖" },
                  { text: "Saya hafal An-Naba ayat 1-10", display: "An-Naba 1-10 📖" },
                  { text: "Tes Al-Kahfi ayat 1-5", display: "Al-Kahfi 1-5 📖" },
                  { text: "Murojaah Surat Al-Ikhlas", display: "Al-Ikhlas 📖" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => startTopic(item.text)}
                    className="p-2.5 bg-gray-50 hover:bg-amber-50/50 border border-gray-100 hover:border-amber-200 rounded-xl text-left text-[11px] font-bold text-gray-800 active:scale-[0.97] transition-all cursor-pointer shadow-sm hover:shadow-xs group"
                  >
                    <span className="block text-gray-400 font-medium text-[9px] mb-0.5">Tes Instan :</span>
                    <span className="group-hover:text-amber-700">{item.display}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${item.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                item.role === 'user' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15' : 'bg-amber-500 text-white shadow-sm shadow-amber-500/15'
              }`}>
                {item.role === 'user' ? <User size={14} /> : <Award size={14} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${
                item.role === 'user' 
                  ? 'bg-emerald-50 text-emerald-900 rounded-tr-none border border-emerald-100' 
                  : (item.content.includes("Kuota AI") || item.content.includes("Belum Aktif") || item.content.includes("koneksi") || item.content.includes("limit") || item.content.includes("429") || item.content.includes("kedaluwarsa"))
                    ? 'p-0 bg-transparent border-0'
                    : 'bg-amber-50/40 border border-amber-100/50 text-gray-800 rounded-tl-none shadow-xs'
              }`}>
                {item.role === 'ai' && (item.content.includes("Kuota AI") || item.content.includes("Belum Aktif") || item.content.includes("koneksi") || item.content.includes("limit") || item.content.includes("429") || item.content.includes("kedaluwarsa")) ? (
                  <AIErrorCard errorText={item.content} variant="chat" onRetry={handleRetryMurojaah} />
                ) : (
                  <div className="prose prose-sm prose-emerald font-medium leading-relaxed">
                    <Markdown>{item.content}</Markdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <div className="bg-amber-50/30 border border-amber-100/45 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-700">Coach sedang mendengarkan...</span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-amber-600 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          {chat.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 self-center mr-1">Saran:</span>
              {[
                "Lanjut ayat selanjutnya",
                "Tes ayat acak lain",
                "Saya sudah selesai, terima kasih"
              ].map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleSend(text)}
                  disabled={isTyping}
                  className="text-[9px] font-extrabold px-2.5 py-1 bg-white border border-gray-200 hover:border-amber-400 rounded-full text-gray-500 hover:text-amber-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder={chat.length > 0 ? "Ketik setoran ayat Anda di sini..." : "E.g. Saya hafal Al-Mulk ayat 1-10..."}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:opacity-50 font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer flex items-center justify-center w-10 h-10"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
