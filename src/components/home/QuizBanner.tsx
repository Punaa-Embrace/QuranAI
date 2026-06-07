import { motion } from "motion/react";
import { Trophy, ArrowRight } from "lucide-react";

interface QuizBannerProps {
  onNavigate: (page: string, aiMode?: boolean, mode?: 'chat' | 'coach') => void;
}

export default function QuizBanner({ onNavigate }: QuizBannerProps) {
  return (
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
          <p className="text-[10px] text-amber-550 mt-1 leading-relaxed max-w-[200px] sm:max-w-[240px] text-amber-50">
            Tebak kelanjutan ayat & susun kata acak untuk asah daya ingat murojaahmu!
          </p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-transform cursor-pointer">
        <ArrowRight size={14} />
      </div>
    </motion.div>
  );
}
