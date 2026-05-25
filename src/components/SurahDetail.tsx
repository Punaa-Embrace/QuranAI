import { useEffect, useState } from "react";
import { ChevronLeft, Sparkles, X, Loader2, CheckCircle2, Info, Bookmark } from "lucide-react";
import { getSurahDetail, getAIExplanation, cn, getSurahSummary } from "@/src/lib/api";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

export default function SurahDetailView({ nomor, onBack }: { nomor: number; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAyat, setSelectedAyat] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [memorizedAyats, setMemorizedAyats] = useState<number[]>([]);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    getSurahDetail(nomor).then(res => {
      setData(res);
      setLoading(false);
      // Load memorized ayats for this surah
      const saved = localStorage.getItem("quran_progress");
      if (saved) {
        const progress = JSON.parse(saved);
        const current = progress.find((p: any) => p.surahId === nomor);
        if (current && current.memorizedList) {
          setMemorizedAyats(current.memorizedList);
        }
      }
    });

    // Check if bookmarked
    const bookmarksStr = localStorage.getItem("quran_bookmarks");
    if (bookmarksStr) {
      try {
        const bookmarksList = JSON.parse(bookmarksStr) as number[];
        setIsBookmarked(bookmarksList.includes(nomor));
      } catch (err) {
        setIsBookmarked(false);
      }
    }
  }, [nomor]);

  const toggleBookmark = () => {
    const bookmarksStr = localStorage.getItem("quran_bookmarks");
    let bookmarksList: number[] = [];
    if (bookmarksStr) {
      try {
        bookmarksList = JSON.parse(bookmarksStr);
      } catch (err) {
        bookmarksList = [];
      }
    }
    
    let updated: number[];
    if (bookmarksList.includes(nomor)) {
      updated = bookmarksList.filter(id => id !== nomor);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarksList, nomor];
      setIsBookmarked(true);
    }
    localStorage.setItem("quran_bookmarks", JSON.stringify(updated));
  };

  const handleFetchSummary = async () => {
    if (summary) {
      setShowSummary(true);
      return;
    }
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const res = await getSurahSummary(data.namaLatin, data.deskripsi);
      setSummary(res.result);
    } catch (err: any) {
      setSummary(`Gagal memuat ringkasan AI: ${err.message || "Gagal menghubungi AI."}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplain = async (ayat: any) => {
    setSelectedAyat(ayat);
    setAiLoading(true);
    setExplanation("");
    try {
      const res = await getAIExplanation(data.namaLatin, ayat.nomorAyat, ayat.teksArab, ayat.teksIndonesia);
      setExplanation(res.result);
    } catch (err: any) {
      setExplanation(`Gagal memproses penjelasan AI: ${err.message || "Silakan coba lagi."}`);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleMemorized = (ayatNomor: number) => {
    const newList = memorizedAyats.includes(ayatNomor)
      ? memorizedAyats.filter(n => n !== ayatNomor)
      : [...memorizedAyats, ayatNomor];
    
    setMemorizedAyats(newList);

    // Save to localStorage
    const saved = localStorage.getItem("quran_progress");
    let progress = saved ? JSON.parse(saved) : [];
    const index = progress.findIndex((p: any) => p.surahId === nomor);

    const newItem = {
      surahId: nomor,
      surahName: data.namaLatin,
      ayatCount: data.jumlahAyat,
      completedAyats: newList.length,
      memorizedList: newList,
      updatedAt: new Date().toISOString()
    };

    if (index > -1) {
      progress[index] = newItem;
    } else {
      progress.push(newItem);
    }

    localStorage.setItem("quran_progress", JSON.stringify(progress));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-gray-400 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p>Memuat ayat...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-lg leading-none">{data.namaLatin}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{data.arti} • {data.jumlahAyat} Ayat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark}
            className={cn(
              "p-2 rounded-xl transition-all border cursor-pointer",
              isBookmarked 
                ? "bg-amber-50 border-amber-200 text-amber-550 hover:bg-amber-100" 
                : "bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-200"
            )}
            title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
          >
            <Bookmark size={20} className={isBookmarked ? "fill-amber-500 text-amber-500" : ""} />
          </button>
          <button 
            onClick={handleFetchSummary}
            className="p-2 bg-emerald-50 border border-emerald-100 text-primary rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
            title="Surah AI Summary"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-12 pb-32">
        {data.ayat.map((ayat: any) => (
          <div key={ayat.nomorAyat} className="space-y-6 pb-6 border-b border-gray-50 last:border-0 relative">
            <div className="flex justify-between items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-primary flex items-center justify-center text-xs font-bold">
                {ayat.nomorAyat}
              </span>
              <p className="text-3xl text-right leading-[1.8] font-arabic flex-1" style={{ direction: 'rtl' }}>
                {ayat.teksArab}
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-secondary italic font-light leading-relaxed">{ayat.teksLatin}</p>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">{ayat.teksIndonesia}</p>
            </div>

            <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-2xl">
              <button 
                onClick={() => toggleMemorized(ayat.nomorAyat)}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm",
                  memorizedAyats.includes(ayat.nomorAyat) 
                    ? "bg-primary text-white" 
                    : "bg-white text-gray-400 hover:text-primary"
                )}
              >
                <CheckCircle2 size={14} /> 
                {memorizedAyats.includes(ayat.nomorAyat) ? "Hafal" : "Belum Hafal"}
              </button>
              
              <button 
                onClick={() => handleExplain(ayat)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent bg-amber-50 px-4 py-2 rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm"
              >
                <Sparkles size={14} /> Explain AI
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Surah AI Summary</span>
                </div>
                <button onClick={() => setShowSummary(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto bg-surface">
                {summaryLoading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs font-bold text-primary animate-pulse uppercase tracking-widest">AI sedang merangkum...</p>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-sm prose-emerald">
                    <Markdown>{summary}</Markdown>
                  </div>
                )}
              </div>
              <div className="p-4 bg-emerald-50 border-t border-gray-100 italic text-[10px] text-center text-emerald-800">
                Pahami inti sari agar hafalan lebih berkesan.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Backdrop Overlay Modal for Ayat Explanation */}
      <AnimatePresence>
        {selectedAyat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAyat(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-white">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">AI Explanation</p>
                    <p className="text-sm text-gray-600 font-medium">Surah {data.namaLatin}: {selectedAyat.nomorAyat}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAyat(null)}
                  className="p-2 hover:bg-white/50 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto bg-surface">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-emerald-600 gap-4">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm font-medium animate-pulse">Menghubungkan ke Gemini AI...</p>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-sm text-gray-800 leading-relaxed">
                    <Markdown>{explanation}</Markdown>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-emerald-50 border-t border-gray-100 text-[10px] text-center text-emerald-800 font-bold uppercase tracking-widest">
                Powered by Google Gemini AI
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
