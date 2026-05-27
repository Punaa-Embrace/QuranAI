import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Sparkles, X, Loader2, CheckCircle2, Info, Bookmark, Play, Pause, Volume2 } from "lucide-react";
import { getSurahDetail, getAIExplanation, cn, getSurahSummary } from "@/src/lib/api";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import AIErrorCard from "./AIErrorCard";

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

  const [particles, setParticles] = useState<{
    id: number;
    ayatNomor: number;
    angle: number;
    distance: number;
    color: string;
    size: number;
    delay: number;
  }[]>([]);

  const [selectedReciter, setSelectedReciter] = useState<string>("05");
  const [playingAyatNo, setPlayingAyatNo] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [repeatSingle, setRepeatSingle] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeatSingle;
    }
  }, [repeatSingle]);

  useEffect(() => {
    if (playingAyatNo !== null && isPlaying) {
      const element = document.getElementById(`ayat-card-${playingAyatNo}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [playingAyatNo, isPlaying]);

  const playNextAyat = (currentNomor: number) => {
    if (!data || !data.ayat) return;
    const nextIndex = data.ayat.findIndex((a: any) => a.nomorAyat === currentNomor) + 1;
    if (nextIndex >= 0 && nextIndex < data.ayat.length) {
      const nextAyat = data.ayat[nextIndex];
      setTimeout(() => {
        handlePlayAyat(nextAyat);
      }, 500);
    } else {
      setIsPlaying(false);
      setPlayingAyatNo(null);
    }
  };

  const handlePlayAyat = (ayat: any) => {
    const audioUrl = ayat.audio?.[selectedReciter];
    if (!audioUrl) return;

    if (playingAyatNo === ayat.nomorAyat) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(err => console.log("Audio play failed:", err));
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioObj = new Audio(audioUrl);
      audioRef.current = audioObj;
      setPlayingAyatNo(ayat.nomorAyat);
      setIsPlaying(true);
      audioObj.loop = repeatSingle;

      audioObj.onended = () => {
        if (!repeatSingle) {
          if (autoPlayNext) {
            playNextAyat(ayat.nomorAyat);
          } else {
            setIsPlaying(false);
            setPlayingAyatNo(null);
          }
        }
      };

      audioObj.play().catch(err => {
        console.log("Audio play failed:", err);
        setIsPlaying(false);
        setPlayingAyatNo(null);
      });
    }
  };

  const handleReciterChange = (newReciter: string) => {
    if (isPlaying && playingAyatNo !== null && data && data.ayat) {
      const currentAyat = data.ayat.find((a: any) => a.nomorAyat === playingAyatNo);
      if (currentAyat) {
        const audioUrl = currentAyat.audio?.[newReciter];
        if (audioUrl) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          const audioObj = new Audio(audioUrl);
          audioRef.current = audioObj;
          audioObj.loop = repeatSingle;
          audioObj.onended = () => {
            if (!repeatSingle) {
              if (autoPlayNext) {
                playNextAyat(currentAyat.nomorAyat);
              } else {
                setIsPlaying(false);
                setPlayingAyatNo(null);
              }
            }
          };
          audioObj.play().catch(err => {
            console.log("Audio play failed on reciter change:", err);
            setIsPlaying(false);
            setPlayingAyatNo(null);
          });
        }
      }
    }
  };

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
    const isAdding = !memorizedAyats.includes(ayatNomor);
    const newList = memorizedAyats.includes(ayatNomor)
      ? memorizedAyats.filter(n => n !== ayatNomor)
      : [...memorizedAyats, ayatNomor];
    
    setMemorizedAyats(newList);

    if (isAdding) {
      // Spawn delightful upward scaling particles
      const newParticles = Array.from({ length: 15 }).map((_, i) => ({
        id: Math.random() + i,
        ayatNomor,
        angle: (i / 15) * 2 * Math.PI + (Math.random() - 0.5) * 0.3,
        distance: 35 + Math.random() * 45,
        color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#10b981' : '#34d399'), // Amber, Emerald, Mint Green
        size: 5 + Math.random() * 4,
        delay: Math.random() * 0.08
      }));
      setParticles(prev => [...prev, ...newParticles]);

      // Dynamically remove particles after animation ends to protect performance
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.ayatNomor !== ayatNomor));
      }, 1200);
    }

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

      {/* Audio Playback Settings Bar */}
      <div className="sticky top-[61px] bg-emerald-900 text-white/95 px-5 py-2.5 flex items-center justify-between border-b border-emerald-800 z-20 text-[11px] shadow-sm">
        <div className="flex items-center gap-1.5 font-medium">
          <Volume2 size={13} className="text-amber-400 shrink-0 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[9px] text-emerald-300 shrink-0">Qori:</span>
          <select 
            value={selectedReciter} 
            onChange={(e) => {
              const val = e.target.value;
              setSelectedReciter(val);
              handleReciterChange(val);
            }}
            className="bg-emerald-800/80 border-0 hover:bg-emerald-800 transition-colors text-white font-bold rounded-lg px-2 py-1 text-[11px] outline-none cursor-pointer"
          >
            <option value="05">Misyari Al-Afasi</option>
            <option value="03">As-Sudais</option>
            <option value="01">Al-Juhany</option>
            <option value="02">Al-Qasim</option>
            <option value="04">Al-Dossari</option>
            <option value="06">Yasser Al-Dosari</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setRepeatSingle(prev => !prev)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer select-none",
              repeatSingle ? "bg-amber-500 text-white shadow-xs" : "text-emerald-200 hover:text-white hover:bg-emerald-800"
            )}
          >
            {repeatSingle && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            <span>Ulangi</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setAutoPlayNext(prev => !prev)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer select-none",
              autoPlayNext ? "bg-emerald-700 text-emerald-100 shadow-xs" : "text-emerald-300/60 hover:text-white hover:bg-emerald-800"
            )}
          >
            {autoPlayNext && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            <span>Lanjut</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-32">
        {data.ayat.map((ayat: any) => {
          const isCurrentPlaying = playingAyatNo === ayat.nomorAyat && isPlaying;
          return (
            <div 
              key={ayat.nomorAyat} 
              id={`ayat-card-${ayat.nomorAyat}`}
              className={cn(
                "space-y-6 p-5 rounded-[24px] transition-all duration-300 border relative",
                isCurrentPlaying 
                  ? "bg-emerald-50/70 border-emerald-300 shadow-md scale-[1.01]" 
                  : "bg-transparent border-gray-100/60 hover:bg-emerald-50/10"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isCurrentPlaying ? "bg-emerald-600 text-white animate-pulse" : "bg-emerald-50 text-primary"
                  )}>
                    {ayat.nomorAyat}
                  </span>
                  
                  {/* Compact beautiful audio player button - doesn't eat space! */}
                  <button 
                    onClick={() => handlePlayAyat(ayat)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border",
                      isCurrentPlaying 
                        ? "bg-amber-500 text-white border-amber-400 hover:bg-amber-600 animate-pulse" 
                        : "bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200"
                    )}
                    title={isCurrentPlaying ? "Pause" : "Putar Murottal"}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={11} fill="currentColor" />
                    ) : (
                      <Play size={11} fill="currentColor" className="ml-[1px]" />
                    )}
                  </button>
                </div>
                <p className="text-3xl text-right leading-[1.9] font-arabic flex-1" style={{ direction: 'rtl' }}>
                  {ayat.teksArab}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-secondary italic font-light leading-relaxed">{ayat.teksLatin}</p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{ayat.teksIndonesia}</p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100">
                <div className="relative inline-block">
                  <button 
                    onClick={() => toggleMemorized(ayat.nomorAyat)}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer border",
                      memorizedAyats.includes(ayat.nomorAyat) 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white text-gray-400 hover:text-primary border-gray-150"
                    )}
                  >
                    <motion.div
                      animate={memorizedAyats.includes(ayat.nomorAyat) ? {
                        scale: [1, 1.4, 1],
                        rotate: [0, 360],
                      } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="shrink-0 flex items-center justify-center"
                    >
                      <CheckCircle2 size={12} className={cn(memorizedAyats.includes(ayat.nomorAyat) && "text-amber-400")} />
                    </motion.div>
                    <span>{memorizedAyats.includes(ayat.nomorAyat) ? "Hafal" : "Belum Hafal"}</span>
                  </button>

                  {/* Confetti particles burst */}
                  {particles
                    .filter(p => p.ayatNomor === ayat.nomorAyat)
                    .map(p => (
                      <motion.span
                        key={p.id}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                        animate={{
                          x: Math.cos(p.angle) * p.distance,
                          y: Math.sin(p.angle) * p.distance - 20, // Float up slightly
                          opacity: [1, 1, 0],
                          scale: [0.5, 1, 0.2]
                        }}
                        transition={{
                          duration: 0.9,
                          delay: p.delay,
                          ease: "easeOut"
                        }}
                        className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-30"
                        style={{
                          backgroundColor: p.color,
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: `${p.size}px`,
                          height: `${p.size}px`
                        }}
                      />
                    ))}
                </div>
                
                <button 
                  onClick={() => handleExplain(ayat)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent bg-amber-50 px-3.5 py-2.5 rounded-xl hover:bg-accent hover:text-white transition-all shadow-xs cursor-pointer border border-amber-100/20"
                >
                  <Sparkles size={12} /> Explain AI
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div 
            key="summary-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSummary(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              key="summary-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl cursor-default"
            >
              <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Surah AI Summary</span>
                </div>
                <button onClick={() => setShowSummary(false)} className="cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto bg-surface">
                {summaryLoading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs font-bold text-primary animate-pulse uppercase tracking-widest">AI sedang merangkum...</p>
                  </div>
                ) : (summary.includes("Gagal") || summary.includes("Kuota") || summary.includes("Belum") || summary.includes("429") || summary.includes("limit")) ? (
                  <AIErrorCard errorText={summary} onRetry={() => {
                    setSummary("");
                    handleFetchSummary();
                  }} />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Backdrop Overlay Modal for Ayat Explanation */}
      <AnimatePresence>
        {selectedAyat && (
          <motion.div 
            key="explain-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAyat(null)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer"
          >
            <motion.div 
              key="explain-modal-content"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] cursor-default"
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
                  className="p-2 hover:bg-white/50 rounded-full cursor-pointer"
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
                ) : (explanation.includes("Gagal") || explanation.includes("Kuota") || explanation.includes("Belum") || explanation.includes("429") || explanation.includes("limit")) ? (
                  <AIErrorCard errorText={explanation} onRetry={() => {
                    setExplanation("");
                    handleExplain(selectedAyat);
                  }} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
