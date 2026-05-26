import { useEffect, useState } from "react";
import { LineChart, Trophy, Calendar, BookOpen, Trash2, Award, Flame, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/api";

interface ProgressItem {
  surahId: number;
  surahName: string;
  ayatCount: number;
  completedAyats: number;
  updatedAt: string;
}

const JUZ_MAPPING = [
  { id: 1, name: "Juz 1", surahs: "Al-Fatihah, Al-Baqarah (Ayat 1-141)" },
  { id: 2, name: "Juz 2", surahs: "Al-Baqarah (Ayat 142-252)" },
  { id: 3, name: "Juz 3", surahs: "Al-Baqarah (Ayat 253-286) s.d Ali 'Imran (Ayat 1-92)" },
  { id: 4, name: "Juz 4", surahs: "Ali 'Imran (Ayat 93-200) s.d An-Nisa (Ayat 1-23)" },
  { id: 5, name: "Juz 5", surahs: "An-Nisa (Ayat 24-147)" },
  { id: 6, name: "Juz 6", surahs: "An-Nisa (Ayat 148-176) s.d Al-Ma'idah (Ayat 1-81)" },
  { id: 7, name: "Juz 7", surahs: "Al-Ma'idah (Ayat 82-120) s.d Al-An'am (Ayat 1-110)" },
  { id: 8, name: "Juz 8", surahs: "Al-An'am (Ayat 111-165) s.d Al-A'raf (Ayat 1-87)" },
  { id: 9, name: "Juz 9", surahs: "Al-A'raf (Ayat 88-206) s.d Al-Anfal (Ayat 1-40)" },
  { id: 10, name: "Juz 10", surahs: "Al-Anfal (Ayat 41-75) s.d At-Tawbah (Ayat 1-92)" },
  { id: 11, name: "Juz 11", surahs: "At-Tawbah (Ayat 93-129) s.d Yunus, Hud (Ayat 1-5)" },
  { id: 12, name: "Juz 12", surahs: "Hud (Ayat 6-123) s.d Yusuf (Ayat 1-52)" },
  { id: 13, name: "Juz 13", surahs: "Yusuf (Ayat 53-111), Ar-Ra'd, Ibrahim" },
  { id: 14, name: "Juz 14", surahs: "Al-Hijr s.d An-Nahl (Ayat 1-128)" },
  { id: 15, name: "Juz 15", surahs: "Al-Isra s.d Al-Kahf (Ayat 1-74)" },
  { id: 16, name: "Juz 16", surahs: "Al-Kahf (Ayat 75-110), Maryam, Taha" },
  { id: 17, name: "Juz 17", surahs: "Al-Anbiya s.d Al-Hajj (Ayat 1-78)" },
  { id: 18, name: "Juz 18", surahs: "Al-Mu'minun, An-Nur, Al-Furqan (Ayat 1-20)" },
  { id: 19, name: "Juz 19", surahs: "Al-Furqan (Ayat 21-77), Ash-Shu'ara, An-Naml (Ayat 1-55)" },
  { id: 20, name: "Juz 20", surahs: "An-Naml (Ayat 56-93), Al-Qasas, Al-Ankabut (Ayat 1-45)" },
  { id: 21, name: "Juz 21", surahs: "Al-Ankabut (Ayat 46-69), Ar-Rum, Luqman, As-Sajdah, Al-Ahzab (Ayat 1-30)" },
  { id: 22, name: "Juz 22", surahs: "Al-Ahzab (Ayat 31-73), Saba, Fatir, Yasin (Ayat 1-27)" },
  { id: 23, name: "Juz 23", surahs: "Yasin (Ayat 28-83), As-Saffat, Sad, Az-Zumar (Ayat 1-31)" },
  { id: 24, name: "Juz 24", surahs: "Az-Zumar (Ayat 32-75), Ghafir, Fussilat (Ayat 1-46)" },
  { id: 25, name: "Juz 25", surahs: "Fussilat (Ayat 47-54), Ash-Shura, Az-Zukhruf, Ad-Dukhan, Al-Jathiyah" },
  { id: 26, name: "Juz 26", surahs: "Al-Ahqaf, Muhammad, Al-Fath, Al-Hujurat, Qaf, Adh-Dhariyat (Ayat 1-30)" },
  { id: 27, name: "Juz 27", surahs: "Adh-Dhariyat (Ayat 31-60) s.d Al-Hadid (Ayat 1-29)" },
  { id: 28, name: "Juz 28", surahs: "Al-Mujadilah s.d At-Tahrim" },
  { id: 29, name: "Juz 29", surahs: "Al-Mulk s.d Al-Mursalat" },
  { id: 30, name: "Juz 30", surahs: "An-Naba s.d An-Nas (37 Surah Pendek/Juz 'Amma)" }
];

const JUZ_SURAHS_MAP: { [key: number]: { id: number; name: string }[] } = {
  1: [{ id: 1, name: "Al-Fatihah" }, { id: 2, name: "Al-Baqarah" }],
  2: [{ id: 2, name: "Al-Baqarah" }],
  3: [{ id: 2, name: "Al-Baqarah" }, { id: 3, name: "Ali 'Imran" }],
  4: [{ id: 3, name: "Ali 'Imran" }, { id: 4, name: "An-Nisa" }],
  5: [{ id: 4, name: "An-Nisa" }],
  6: [{ id: 4, name: "An-Nisa" }, { id: 5, name: "Al-Ma'idah" }],
  7: [{ id: 5, name: "Al-Ma'idah" }, { id: 6, name: "Al-An'am" }],
  8: [{ id: 6, name: "Al-An'am" }, { id: 7, name: "Al-A'raf" }],
  9: [{ id: 7, name: "Al-A'raf" }, { id: 8, name: "Al-Anfal" }],
  10: [{ id: 8, name: "Al-Anfal" }, { id: 9, name: "At-Tawbah" }],
  11: [{ id: 9, name: "At-Tawbah" }, { id: 10, name: "Yunus" }, { id: 11, name: "Hud" }],
  12: [{ id: 11, name: "Hud" }, { id: 12, name: "Yusuf" }],
  13: [{ id: 12, name: "Yusuf" }, { id: 13, name: "Ar-Ra'd" }, { id: 14, name: "Ibrahim" }],
  14: [{ id: 15, name: "Al-Hijr" }, { id: 16, name: "An-Nahl" }],
  15: [{ id: 17, name: "Al-Isra" }, { id: 18, name: "Al-Kahf" }],
  16: [{ id: 18, name: "Al-Kahf" }, { id: 19, name: "Maryam" }, { id: 20, name: "Taha" }],
  17: [{ id: 21, name: "Al-Anbiya" }, { id: 22, name: "Al-Hajj" }],
  18: [{ id: 23, name: "Al-Mu'minun" }, { id: 24, name: "An-Nur" }, { id: 25, name: "Al-Furqan" }],
  19: [{ id: 25, name: "Al-Furqan" }, { id: 26, name: "Ash-Shu'ara" }, { id: 27, name: "An-Naml" }],
  20: [{ id: 27, name: "An-Naml" }, { id: 28, name: "Al-Qasas" }, { id: 29, name: "Al-Ankabut" }],
  21: [{ id: 29, name: "Al-Ankabut" }, { id: 30, name: "Ar-Rum" }, { id: 31, name: "Luqman" }, { id: 32, name: "As-Sajdah" }, { id: 33, name: "Al-Ahzab" }],
  22: [{ id: 33, name: "Al-Ahzab" }, { id: 34, name: "Saba" }, { id: 35, name: "Fatir" }, { id: 36, name: "Yasin" }],
  23: [{ id: 36, name: "Yasin" }, { id: 37, name: "As-Saffat" }, { id: 38, name: "Sad" }, { id: 39, name: "Az-Zumar" }],
  24: [{ id: 39, name: "Az-Zumar" }, { id: 40, name: "Ghafir" }, { id: 41, name: "Fussilat" }],
  25: [{ id: 41, name: "Fussilat" }, { id: 42, name: "Ash-Shura" }, { id: 43, name: "Az-Zukhruf" }, { id: 44, name: "Ad-Dukhan" }, { id: 45, name: "Al-Jathiyah" }],
  26: [{ id: 46, name: "Al-Ahqaf" }, { id: 47, name: "Muhammad" }, { id: 48, name: "Al-Fath" }, { id: 49, name: "Al-Hujurat" }, { id: 50, name: "Qaf" }, { id: 51, name: "Adh-Dhariyat" }],
  27: [{ id: 51, name: "Adh-Dhariyat" }, { id: 52, name: "At-Tur" }, { id: 53, name: "An-Najm" }, { id: 54, name: "Al-Qamar" }, { id: 55, name: "Ar-Rahman" }, { id: 56, name: "Al-Waqi'ah" }, { id: 57, name: "Al-Hadid" }],
  28: [{ id: 58, name: "Al-Mujadilah" }, { id: 59, name: "Al-Hashr" }, { id: 60, name: "Al-Mumtahanah" }, { id: 61, name: "As-Saff" }, { id: 62, name: "Al-Jumu'ah" }, { id: 63, name: "Al-Munafiqun" }, { id: 64, name: "At-Taghabun" }, { id: 65, name: "At-Talaq" }, { id: 66, name: "At-Tahrim" }],
  29: [{ id: 67, name: "Al-Mulk" }, { id: 68, name: "Al-Qalam" }, { id: 69, name: "Al-Haqqah" }, { id: 70, name: "Al-Ma'arij" }, { id: 71, name: "Nuh" }, { id: 72, name: "Al-Jinn" }, { id: 73, name: "Al-Muzzammil" }, { id: 74, name: "Al-Muddaththir" }, { id: 75, name: "Al-Qiyamah" }, { id: 76, name: "Al-Insan" }, { id: 77, name: "Al-Mursalat" }],
  30: [
    { id: 78, name: "An-Naba" }, { id: 79, name: "An-Nazi'at" }, { id: 80, name: "'Abasa" },
    { id: 81, name: "At-Takwir" }, { id: 82, name: "Al-Infitar" }, { id: 83, name: "Al-Mutaffifin" },
    { id: 84, name: "Al-Inshiqaq" }, { id: 85, name: "Al-Buruj" }, { id: 86, name: "At-Tariq" },
    { id: 87, name: "Al-A'la" }, { id: 88, name: "Al-Ghashiyah" }, { id: 89, name: "Al-Fajr" },
    { id: 90, name: "Al-Balad" }, { id: 91, name: "Ash-Shams" }, { id: 92, name: "Al-Layl" },
    { id: 93, name: "Ad-Duha" }, { id: 94, name: "Al-Inshirah" }, { id: 95, name: "At-Tin" },
    { id: 96, name: "Al-'Alaq" }, { id: 97, name: "Al-Qadr" }, { id: 98, name: "Al-Bayyinah" },
    { id: 99, name: "Az-Zalzalah" }, { id: 100, name: "Al-'Adiyat" }, { id: 101, name: "Al-Qari'ah" },
    { id: 102, name: "At-Takathur" }, { id: 103, name: "Al-'Asr" }, { id: 104, name: "Al-Humazah" },
    { id: 105, name: "Al-Fil" }, { id: 106, name: "Quraysh" }, { id: 107, name: "Al-Ma'un" },
    { id: 108, name: "Al-Kawthar" }, { id: 109, name: "Al-Kafirun" }, { id: 110, name: "An-Nasr" },
    { id: 111, name: "Al-Masad" }, { id: 112, name: "Al-Ikhlas" }, { id: 113, name: "Al-Falaq" },
    { id: 114, name: "An-Nas" }
  ]
};

export default function Progress({ onSelectSurah }: { onSelectSurah?: (id: number) => void }) {
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [quizStats, setQuizStats] = useState<{ totalXp: number; gamesPlayed: number; highStreak: number }>({
    totalXp: 0,
    gamesPlayed: 0,
    highStreak: 0
  });

  const [juzProgress, setJuzProgress] = useState<{ [key: number]: "belum" | "proses" | "hafal" }>({});
  const [selectedJuzId, setSelectedJuzId] = useState<number | null>(null);
  const [isJuzExpanded, setIsJuzExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quran_progress");
    if (saved) {
      setItems(JSON.parse(saved));
    }

    const savedQuiz = localStorage.getItem("quran_quiz_stats");
    if (savedQuiz) {
      try {
        setQuizStats(JSON.parse(savedQuiz));
      } catch (e) {
        // Fallback
      }
    }

    // Load Juz progress
    const savedJuz = localStorage.getItem("quran_juz_progress");
    if (savedJuz) {
      try {
        setJuzProgress(JSON.parse(savedJuz));
      } catch (e) {
        // Fallback
      }
    } else {
      // Default all to 'belum'
      const initial: { [key: number]: "belum" | "proses" | "hafal" } = {};
      for (let i = 1; i <= 30; i++) {
        initial[i] = "belum";
      }
      setJuzProgress(initial);
    }
  }, []);

  const totalAyatsCompleted = items.reduce((acc, curr) => acc + curr.completedAyats, 0);
  const averageProgress = items.length > 0 
    ? Math.round((items.reduce((acc, curr) => acc + (curr.completedAyats / curr.ayatCount), 0) / items.length) * 100)
    : 0;

  // Clear everything
  const clearProgress = () => {
    if (confirm("Hapus semua progress hafalan Anda?")) {
      localStorage.removeItem("quran_progress");
      localStorage.removeItem("quran_quiz_stats");
      localStorage.removeItem("quran_juz_progress");
      setItems([]);
      setQuizStats({ totalXp: 0, gamesPlayed: 0, highStreak: 0 });
      
      const resetJuz: { [key: number]: "belum" | "proses" | "hafal" } = {};
      for (let i = 1; i <= 30; i++) {
        resetJuz[i] = "belum";
      }
      setJuzProgress(resetJuz);
      setSelectedJuzId(null);
    }
  };

  const deleteSingleProgress = (surahId: number) => {
    const updated = items.filter(item => item.surahId !== surahId);
    localStorage.setItem("quran_progress", JSON.stringify(updated));
    setItems(updated);
  };

  const updateJuzStatus = (juzId: number, status: "belum" | "proses" | "hafal") => {
    const updated = { ...juzProgress, [juzId]: status };
    setJuzProgress(updated);
    localStorage.setItem("quran_juz_progress", JSON.stringify(updated));
  };

  // Helper method to dynamically combine custom manual status and surah-level memorization
  const getJuzCombinedStatus = (juzId: number) => {
    const manual = juzProgress[juzId] || "belum";
    const mappedSurahs = JUZ_SURAHS_MAP[juzId] || [];
    if (mappedSurahs.length === 0) return manual;

    const relevantItems = items.filter(it => mappedSurahs.some(ms => ms.id === it.surahId));

    if (manual === "hafal") return "hafal";
    if (relevantItems.length === 0) return manual;

    // Check if ALL mapped surahs are fully completed (100% memorized)
    const allCompleted = mappedSurahs.every(ms => {
      const item = items.find(it => it.surahId === ms.id);
      return item && item.completedAyats === item.ayatCount;
    });

    if (allCompleted) return "hafal";

    // If some progress exists, or is manually marked "proses"
    const someProgress = relevantItems.some(it => it.completedAyats > 0);
    if (someProgress || manual === "proses") return "proses";

    return manual;
  };

  const totalJuzCompleted = Array.from({ length: 30 }).filter((_, i) => getJuzCombinedStatus(i + 1) === "hafal").length;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Hafalan</h2>
        {(items.length > 0 || Object.values(juzProgress).some(status => status !== "belum")) && (
          <button 
            onClick={clearProgress} 
            className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title="Hapus Semua Progress"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary text-white p-5 rounded-3xl space-y-1 shadow-lg shadow-emerald-950/10">
          <Trophy size={24} className="text-emerald-300" />
          <p className="text-2xl font-bold">{averageProgress}%</p>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Rata-rata Hafalan</p>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-3xl space-y-1 shadow-xs">
          <BookOpen size={24} className="text-secondary" />
          <p className="text-2xl font-bold text-primary">{totalAyatsCompleted}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Ayat Selesai</p>
        </div>
      </div>

      {/* Quiz Game Achievements */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-3xl border border-amber-200/60 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-amber-800">
          <Award size={18} className="text-amber-600 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-wider">Pencapaian Kuis Murojaah</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/85 p-3 rounded-2xl border border-amber-200/40">
            <p className="text-sm font-black text-amber-700">{quizStats.totalXp} XP</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wide">Poin XP</p>
          </div>
          <div className="bg-white/85 p-3 rounded-2xl border border-amber-200/40">
            <p className="text-sm font-black text-amber-700 flex items-center justify-center gap-0.5">
              <Flame size={12} className="text-orange-500 fill-orange-500" /> {quizStats.highStreak}
            </p>
            <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wide">Streak</p>
          </div>
          <div className="bg-white/85 p-3 rounded-2xl border border-amber-200/40">
            <p className="text-sm font-black text-amber-700">{quizStats.gamesPlayed}</p>
            <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5 tracking-wide">Kuis Dimulai</p>
          </div>
        </div>
        <p className="text-[10px] text-amber-800 italic text-center font-semibold leading-relaxed">
          {quizStats.totalXp > 0 
            ? "Maa shaa Allah! Teruskan murojaah mingguan agar ingatanmu semakin kuat."
            : "Mainkan kuis tebak ayat pada tab menu pertengahan untuk menguji hafalanmu!"}
        </p>
      </div>

      {/* 30 Juz Al-Quran Progress Tracker */}
      <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-950">Pelacak 30 Juz Al-Quran</h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black">
            {totalJuzCompleted} / 30 Juz Hafal
          </span>
        </div>

        {/* Dynamic Juz Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-400">
            <span>Perkembangan Juz</span>
            <span className="text-emerald-700 font-extrabold">{Math.round((totalJuzCompleted / 30) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(totalJuzCompleted / 30) * 100}%` }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-full rounded-full"
            />
          </div>
        </div>

        {/* Toggle Button for Grid Expand/Collapse */}
        <button 
          onClick={() => {
            setIsJuzExpanded(!isJuzExpanded);
            if (isJuzExpanded) setSelectedJuzId(null);
          }}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-850 transition-colors py-2.5 bg-emerald-50/40 hover:bg-emerald-50/85 rounded-2xl cursor-pointer"
        >
          {isJuzExpanded ? (
            <>
              <span>Sembunyikan Grid 30 Juz</span>
              <ChevronUp size={14} className="animate-bounce" />
            </>
          ) : (
            <>
              <span>Tampilkan Detail Grid 30 Juz</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>

        {isJuzExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-2"
          >
            {/* 30 Juz Compact Grid Layout */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 pt-1 font-sans">
              {Array.from({ length: 30 }).map((_, i) => {
                const juzId = i + 1;
                const status = getJuzCombinedStatus(juzId);
                const isSelected = selectedJuzId === juzId;

                let badgeStyle = "bg-gray-50/50 text-gray-700 border border-gray-100 hover:bg-gray-100/50";
                if (status === "hafal") {
                  badgeStyle = "bg-emerald-600 text-white border-transparent shadow-xs";
                } else if (status === "proses") {
                  badgeStyle = "bg-amber-400 text-amber-950 border-transparent shadow-xs font-black";
                }

                return (
                  <motion.button
                    key={juzId}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedJuzId(isSelected ? null : juzId)}
                    className={cn(
                      "h-10 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center relative",
                      badgeStyle,
                      isSelected && "ring-2 ring-emerald-500 scale-105"
                    )}
                  >
                    <span>{juzId}</span>
                    {status === "hafal" && (
                      <div className="absolute top-1 right-1 text-[8px] text-white shrink-0">
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Juz Detail Card (Inline Control) */}
            <AnimatePresence mode="wait">
              {selectedJuzId !== null && (
                <motion.div
                  key={selectedJuzId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 overflow-hidden space-y-3 mt-1.5 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 leading-none flex items-center gap-2">
                        <span>Detail {JUZ_MAPPING[selectedJuzId - 1]?.name}</span>
                        {getJuzCombinedStatus(selectedJuzId) === "hafal" && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-black animate-pulse">
                            Hafal ✨
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1.5 leading-relaxed">
                        Cakupan surah: <span className="text-gray-700 font-bold">{JUZ_MAPPING[selectedJuzId - 1]?.surahs}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedJuzId(null)}
                      className="text-gray-400 hover:text-gray-600 font-black text-xs cursor-pointer bg-white border border-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>

                  {/* Reactive breakdown of containing surahs and verse tracking */}
                  <div className="space-y-1.5 mt-2 border-t border-gray-200/50 pt-2.5">
                    <p className="text-[9px] uppercase font-black tracking-wider text-gray-400">
                      Sinergi Surah Terkait (Auto-Sync):
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {JUZ_SURAHS_MAP[selectedJuzId]?.map(ms => {
                        const progressItem = items.find(it => it.surahId === ms.id);
                        const done = progressItem?.completedAyats || 0;
                        const total = progressItem?.ayatCount || null;
                        const isFin = progressItem && progressItem.completedAyats === progressItem.ayatCount;

                        return (
                          <div key={ms.id} className="flex justify-between items-center text-[10px] bg-white px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-3xs">
                            <div className="flex items-center gap-1.5">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isFin ? "bg-emerald-500" : done > 0 ? "bg-amber-400" : "bg-gray-200"
                              )} />
                              <span className="font-bold text-gray-700">{ms.name}</span>
                            </div>
                            <span className="font-mono text-gray-500 text-[9px] font-bold">
                              {progressItem ? `${done}/${progressItem.ayatCount} ayat` : "Belum mulai"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Toggle controls */}
                  <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-gray-200/50 pt-2.5">
                    <button
                      onClick={() => updateJuzStatus(selectedJuzId, "belum")}
                      className={cn(
                        "py-2 px-1 text-[9px] font-extrabold uppercase tracking-widest rounded-xl border transition-all cursor-pointer",
                        getJuzCombinedStatus(selectedJuzId) === "belum"
                          ? "bg-red-500 text-white border-red-500 font-black shadow-xs"
                          : "bg-white text-gray-400 border-gray-100 hover:text-gray-600"
                      )}
                    >
                      Belum
                    </button>
                    <button
                      onClick={() => updateJuzStatus(selectedJuzId, "proses")}
                      className={cn(
                        "py-2 px-1 text-[9px] font-extrabold uppercase tracking-widest rounded-xl border transition-all cursor-pointer",
                        getJuzCombinedStatus(selectedJuzId) === "proses"
                          ? "bg-amber-400 text-amber-950 border-amber-400 font-black shadow-xs"
                          : "bg-white text-gray-400 border-gray-100 hover:text-gray-600"
                      )}
                    >
                      Proses
                    </button>
                    <button
                      onClick={() => updateJuzStatus(selectedJuzId, "hafal")}
                      className={cn(
                        "py-2 px-1 text-[9px] font-extrabold uppercase tracking-widest rounded-xl border transition-all cursor-pointer",
                        getJuzCombinedStatus(selectedJuzId) === "hafal"
                          ? "bg-emerald-600 text-white border-emerald-600 font-black shadow-xs"
                          : "bg-white text-gray-400 border-gray-100 hover:text-gray-700"
                      )}
                    >
                      Hafal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* List Progress */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Detail Per Surah</h3>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Belum ada progress tercatat.</p>
            <p className="text-xs text-gray-400 mt-1">Mulai tandai ayat yang sudah dihafal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <motion.div 
                key={item.surahId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectSurah?.(item.surahId)}
                className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all flex flex-col group ${
                  onSelectSurah ? "cursor-pointer hover:border-emerald-200 hover:shadow-md" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.surahName}</h4>
                      {onSelectSurah && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Buka Detail
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar size={10} /> Terakhir update: {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-primary bg-emerald-50 px-2 py-1 rounded-lg">
                      {item.completedAyats}/{item.ayatCount} Ayat
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSingleProgress(item.surahId);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0 active:scale-90"
                      title="Hapus progress surah ini"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.completedAyats / item.ayatCount) * 100}%` }}
                    className="bg-primary h-full rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
        <p className="text-sm font-bold text-primary italic">
          "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
        </p>
        <p className="text-[10px] uppercase mt-2 text-emerald-700 opacity-60">(HR. Bukhari)</p>
      </div>
    </div>
  );
}
