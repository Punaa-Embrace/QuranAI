import { useEffect, useState } from "react";
import { Search, Loader2, Sparkles, X, Bookmark } from "lucide-react";
import { getSurahs, smartSearch } from "@/src/lib/api";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

export default function SurahList({ onSelect, initialAiMode = false }: { onSelect: (id: number) => void; initialAiMode?: boolean }) {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(initialAiMode);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  useEffect(() => {
    setAiMode(initialAiMode);
  }, [initialAiMode]);

  useEffect(() => {
    getSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    });

    // Load bookmarks
    const saved = localStorage.getItem("quran_bookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        setBookmarks([]);
      }
    }
  }, []);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await smartSearch(search);
      setAiResult(res.result);
    } catch (err: any) {
      setAiResult(`Gagal mencari topik: ${err.message || "Silakan coba lagi."}`);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleBookmark = (e: React.MouseEvent, surahNomor: number) => {
    e.stopPropagation();
    const isBookmarked = bookmarks.includes(surahNomor);
    const updated = isBookmarked
      ? bookmarks.filter(id => id !== surahNomor)
      : [...bookmarks, surahNomor];
    
    setBookmarks(updated);
    localStorage.setItem("quran_bookmarks", JSON.stringify(updated));
  };

  const filtered = surahs.filter(s => {
    const searchMatch = s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
                        s.arti.toLowerCase().includes(search.toLowerCase());
    if (showOnlyBookmarks) {
      return searchMatch && bookmarks.includes(s.nomor);
    }
    return searchMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Daftar Surah</h2>
            <p className="text-xs text-gray-400">Pilih surah untuk mulai menghafal & murojaah</p>
          </div>
          <button 
            onClick={() => {
              setAiMode(!aiMode);
              setAiResult("");
            }}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              aiMode ? 'bg-accent text-white font-bold' : 'bg-amber-100 text-accent font-bold'
            }`}
          >
            <Sparkles size={12} /> {aiMode ? 'Normal Mode' : 'AI Smart Search'}
          </button>
        </div>

        <form onSubmit={aiMode ? handleAiSearch : undefined} className="relative">
          {aiMode ? (
            <>
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" size={20} />
              <input 
                type="text"
                placeholder="Tanya AI: 'Ayat tentang sabar'..."
                className="w-full bg-amber-50/50 border border-amber-100 rounded-2xl py-3 pl-11 pr-12 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all shadow-sm text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-white p-2 rounded-xl"
              >
                <Search size={16} />
              </button>
            </>
          ) : (
            <>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Cari nama surah atau arti..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </>
          )}
        </form>

        {/* Bookmarking Switch Tabs */}
        {!aiMode && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyBookmarks(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none cursor-pointer border ${
                !showOnlyBookmarks 
                  ? "bg-primary text-white border-primary shadow-sm" 
                  : "bg-white border-gray-150 text-gray-500 hover:bg-gray-55"
              }`}
            >
              Semua Surah
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyBookmarks(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 select-none cursor-pointer border ${
                showOnlyBookmarks 
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm" 
                  : "bg-white border-gray-150 text-gray-500 hover:bg-gray-55"
              }`}
            >
              <Bookmark size={12} className={showOnlyBookmarks ? "fill-white" : ""} />
              Bookmark ({bookmarks.length})
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {aiMode && (aiLoading || aiResult) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xl shadow-amber-900/5 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-amber-50 pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
                <Sparkles size={12} /> AI Discovery
              </span>
              <button onClick={() => setAiResult("")} className="text-gray-300 hover:text-gray-500">
                <X size={16} />
              </button>
            </div>
            
            {aiLoading ? (
              <div className="flex items-center gap-3 py-4 text-accent">
                <Loader2 className="animate-spin" size={20} />
                <p className="text-sm font-medium animate-pulse">Gemini sedang mencari ayat...</p>
              </div>
            ) : (
              <div className="markdown-body prose prose-sm max-w-none">
                <Markdown>{aiResult}</Markdown>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p>Memuat daftar surah...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">Tidak menemukan surah yang cocok.</p>
              {showOnlyBookmarks && (
                <p className="text-xs text-gray-400 mt-1">Belum ada surah yang di-bookmark.</p>
              )}
            </div>
          ) : (
            filtered.map((surah, idx) => {
              const isBookmarked = bookmarks.includes(surah.nomor);
              return (
                <motion.div
                  key={surah.nomor}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onSelect(surah.nomor)}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all active:scale-99 text-left group cursor-pointer relative"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                    {surah.nomor}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 group-hover:text-primary transition-all truncate">{surah.namaLatin}</p>
                      {isBookmarked && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-full scale-90">
                          Bookmark
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter truncate">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                  </div>
                  <div className="text-right flex items-center gap-3 shrink-0">
                    <p className="font-arabic text-xl text-primary">{surah.nama}</p>
                    <button
                      onClick={(e) => toggleBookmark(e, surah.nomor)}
                      className={`p-2 rounded-xl transition-all border shrink-0 cursor-pointer ${
                        isBookmarked 
                          ? "bg-amber-50 border-amber-100 text-amber-500 hover:bg-amber-100" 
                          : "bg-white border-gray-100 text-gray-300 hover:text-amber-400 hover:border-amber-200"
                      }`}
                      title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                    >
                      <Bookmark size={15} className={isBookmarked ? "fill-amber-500" : ""} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
