import { motion } from "motion/react";
import { BookOpen, Trophy, Award, MessageSquare } from "lucide-react";

interface NavigationGridProps {
  progress: number;
  onNavigate: (page: string, aiMode?: boolean, mode?: 'chat' | 'coach') => void;
}

export default function NavigationGrid({ progress, onNavigate }: NavigationGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Pilihan Menu Utama</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tadarus / Quran */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("quran", false)}
          className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-emerald-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer w-full"
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
          className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-violet-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer w-full"
        >
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all">
            <Trophy size={20} />
          </div>
          <div className="absolute top-4 right-4 text-violet-100 group-hover:text-violet-500/20 group-hover:scale-125 transition-transform duration-300">
            <Trophy size={48} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
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
          className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-amber-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer w-full"
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
          className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between items-start text-left hover:border-teal-200 hover:shadow-md transition-all h-[150px] relative overflow-hidden group cursor-pointer w-full"
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
  );
}
