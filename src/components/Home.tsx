import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Quote, 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  LineChart, 
  Search, 
  MessageSquare,
  Clock,
  Heart,
  Award
} from "lucide-react";
import { getDailyQuote, getAIMotivation } from "@/src/lib/api";
import Markdown from "react-markdown";

export default function Home({ onNavigate }: { onNavigate: (page: string, aiMode?: boolean, mode?: 'chat' | 'coach') => void }) {
  const [quote, setQuote] = useState("");
  const [motivation, setMotivation] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Assalamualaikum");

  const getFirstParagraphOnly = (text: string) => {
    if (!text) return "";
    // Remove title symbols or heading markdown structures like ### or -
    const cleaned = text
      .replace(/^#+\s+.+$/gm, "")
      .replace(/^-\s+\*\*.+?\*\*:\s*/g, "")
      .trim();
    const paragraphs = cleaned.split(/\n+/).map(p => p.trim()).filter(Boolean);
    return paragraphs[0] || text;
  };

  useEffect(() => {
    // Dynamic Greeting based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting("Selamat Pagi, Pejuang Quran");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang, Pejuang Quran");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore, Pejuang Quran");
    } else {
      setGreeting("Selamat Malam, Pejuang Quran");
    }

    async function loadData() {
      try {
        const [qRes, mRes] = await Promise.all([getDailyQuote(), getAIMotivation()]);
        setQuote(qRes.result || "Tetaplah bersama Al-Quran, maka Al-Quran akan bersamamu.");
        setMotivation(mRes.result || "Semangat menghafal hari ini!");
      } catch (err) {
        setQuote("Al-Quran adalah cahaya bagi hati yang beriman.");
        setMotivation("Jadikan hari ini langkah baru menuju hafalan yang lebih baik.");
      } finally {
        setLoading(false);
      }
    }

    // Load progress
    const saved = localStorage.getItem("quran_progress");
    if (saved) {
      const items = JSON.parse(saved);
      if (items.length > 0) {
        const avg = Math.round((items.reduce((acc: number, curr: any) => acc + (curr.completedAyats / curr.ayatCount), 0) / items.length) * 100);
        setProgress(avg);
      }
    }

    loadData();
  }, []);

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <section className="space-y-1.5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-950">{greeting} 👋</h2>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Mari perbarui niat & murajaah hari ini</p>
        </div>
        <div className="p-2 bg-emerald-50 text-primary rounded-xl flex items-center justify-center border border-emerald-100">
          <Clock size={18} />
        </div>
      </section>

      {/* Daily Spiritual Uplift Card (Quote) */}
      <div className="w-full">
        {/* Mutiara Hikmah Hari Ini */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary p-5 rounded-3xl text-white relative overflow-hidden shadow-md border-b-4 border-emerald-800"
        >
          <div className="absolute -top-6 -right-6 opacity-10 bg-white w-24 h-24 rounded-full" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Quote size={14} className="text-amber-300" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200">Mutiara Hikmah Hari Ini</span>
            </div>
            {loading ? (
              <div className="h-12 w-full bg-white/10 animate-pulse rounded-xl" />
            ) : (
              <p className="text-xs sm:text-sm font-semibold leading-relaxed italic text-white/95">
                {getFirstParagraphOnly(quote)}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Gamifikasi Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => onNavigate("game")}
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-[24px] shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:from-amber-600 hover:to-amber-700 transition-all border border-amber-400 group relative overflow-hidden"
      >
        <div className="absolute -right-6 -bottom-6 opacity-10 bg-white w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-300" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-3 bg-white/20 rounded-2xl text-white shrink-0 group-hover:rotate-12 transition-transform duration-300">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-xs sm:text-sm">Kuis Hafalan Al-Quran 🎮</h4>
              <span className="text-[7.5px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">Seru!</span>
            </div>
            <p className="text-[10px] text-amber-50 mt-1 leading-relaxed max-w-[200px] sm:max-w-[240px]">
              Tebak kelanjutan ayat & susun kata acak untuk asah daya ingat murojaahmu!
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-transform cursor-pointer">
          <ArrowRight size={14} />
        </div>
      </motion.div>

      {/* NEW grid menu requested by user! */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Pilihan Menu Utama</h3>
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1: Tadarus / Quran */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("quran", false)}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-emerald-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
              <BookOpen size={20} />
            </div>
            <div className="absolute top-4 right-4 text-emerald-100 group-hover:text-emerald-500/20 group-hover:scale-125 transition-transform duration-300">
              <BookOpen size={48} />
            </div>
            <div>
              <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">Al-Quran Digital</p>
              <p className="text-[10px] text-gray-500 mt-1">114 Surah lengkap dengan arti & penjelasan tafsir</p>
            </div>
          </motion.button>

          {/* Card 2: Progress & Grafik */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("progress")}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-violet-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer"
          >
            <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all">
              <Trophy size={20} />
            </div>
            <div className="absolute top-4 right-4 text-violet-100 group-hover:text-violet-500/20 group-hover:scale-125 transition-transform duration-300">
              <Trophy size={48} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors text-sm">Statistik Hafalan</p>
                {progress > 0 && (
                  <span className="text-[9px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full font-black">
                    {progress}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Pantau grafik, update harian, dan rata-rata hafalannya</p>
            </div>
          </motion.button>

          {/* Card 3: AI Murojaah Coach */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("motivation", false, "coach")}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-amber-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Award size={20} />
            </div>
            <div className="absolute top-4 right-4 text-amber-100 group-hover:text-amber-500/20 group-hover:scale-125 transition-transform duration-300">
              <Award size={48} />
            </div>
            <div>
              <p className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-sm">AI Murojaah Coach</p>
              <p className="text-[10px] text-gray-500 mt-1">Uji / setor hafalan interaktif & perbaiki ejaan secara cepat</p>
            </div>
          </motion.button>

          {/* Card 4: Tanya AI Assistant / Mentor */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("motivation", false, "chat")}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-teal-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer"
          >
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:bg-teal-500 group-hover:text-white transition-all">
              <MessageSquare size={20} />
            </div>
            <div className="absolute top-4 right-4 text-teal-100 group-hover:text-teal-500/20 group-hover:scale-125 transition-transform duration-300">
              <MessageSquare size={48} />
            </div>
            <div>
              <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors text-sm">Tanya AI Mentor</p>
              <p className="text-[10px] text-gray-500 mt-1">Konsultasikan kendala hafalan, makna surah, & tips rohani</p>
            </div>
          </motion.button>

        </div>
      </div>



      {/* Quick Tips Footer Card */}
      <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-xs">Tips Terbaik Hari ini</h4>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
            Gunakan metode <strong className="font-extrabold text-emerald-700">Murajaah Saku</strong>! Setorkan hafalan Anda bertahap minimal pada 1 teman terdekat atau tanyakan tips metode menghafal di fitur <strong className="font-extrabold text-emerald-700">Tanya AI Mentor</strong> di halaman utama ini.
          </p>
        </div>
      </div>
    </div>
  );
}
