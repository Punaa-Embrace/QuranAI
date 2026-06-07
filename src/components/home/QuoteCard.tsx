import { motion } from "motion/react";
import { Quote, Sparkles, Loader2 } from "lucide-react";

interface QuoteCardProps {
  quote: string;
  loading: boolean;
  aiLoaded: boolean;
  aiFetching: boolean;
  onFetch: () => void;
}

export default function QuoteCard({ quote, loading, aiLoaded, aiFetching, onFetch }: QuoteCardProps) {
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

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary p-5 rounded-3xl text-white relative overflow-hidden shadow-md border-b-4 border-emerald-800"
      >
        <div className="absolute -top-6 -right-6 opacity-10 bg-white w-24 h-24 rounded-full" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-white/80">
            <Quote size={14} className="text-amber-300" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200">Mutiara Hikmah Hari Ini</span>
          </div>
          {loading ? (
            <div className="h-12 w-full bg-white/10 animate-pulse rounded-xl" />
          ) : (
            <p className="text-xs sm:text-sm font-semibold leading-relaxed italic text-white/95">
              "{getFirstParagraphOnly(quote)}"
            </p>
          )}

          <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-emerald-555/30">
            <span className="text-[8.5px] text-emerald-200 font-extrabold uppercase tracking-widest">
              {aiLoaded ? "✨ Dihasilkan oleh AI" : "📚 Kutipan Ramah Kuota"}
            </span>
            <button
              onClick={onFetch}
              disabled={aiFetching}
              className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-350 disabled:hover:bg-amber-400 text-emerald-950 px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs border border-transparent hover:border-amber-300"
            >
              {aiFetching ? (
                <>
                  <Loader2 size={10} className="animate-spin" />
                  <span>Menghubungkan AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={10} />
                  <span>Dapatkan Inspirasi AI ⚡</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
