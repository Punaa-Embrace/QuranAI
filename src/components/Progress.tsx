import { useEffect, useState } from "react";
import { LineChart, Trophy, Calendar, BookOpen, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface ProgressItem {
  surahId: number;
  surahName: string;
  ayatCount: number;
  completedAyats: number;
  updatedAt: string;
}

export default function Progress({ onSelectSurah }: { onSelectSurah?: (id: number) => void }) {
  const [items, setItems] = useState<ProgressItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("quran_progress");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const totalAyatsCompleted = items.reduce((acc, curr) => acc + curr.completedAyats, 0);
  const averageProgress = items.length > 0 
    ? Math.round((items.reduce((acc, curr) => acc + (curr.completedAyats / curr.ayatCount), 0) / items.length) * 100)
    : 0;

  const clearProgress = () => {
    if (confirm("Hapus semua progress hafalan Anda?")) {
      localStorage.removeItem("quran_progress");
      setItems([]);
    }
  };

  const deleteSingleProgress = (surahId: number) => {
    const updated = items.filter(item => item.surahId !== surahId);
    localStorage.setItem("quran_progress", JSON.stringify(updated));
    setItems(updated);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Hafalan</h2>
        {items.length > 0 && (
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
        <div className="bg-white border border-gray-100 p-5 rounded-3xl space-y-1 shadow-sm">
          <BookOpen size={24} className="text-secondary" />
          <p className="text-2xl font-bold text-primary">{totalAyatsCompleted}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Ayat Selesai</p>
        </div>
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
          <div className="space-y-3">
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
