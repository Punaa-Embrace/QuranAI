import { motion } from "motion/react";
import { AlertCircle, Clock, Key, Sparkles, RefreshCw, ChevronRight } from "lucide-react";

interface AIErrorCardProps {
  errorText: string;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "expanded" | "chat";
}

export default function AIErrorCard({ errorText, onRetry, className = "", variant = "expanded" }: AIErrorCardProps) {
  const isKeyError = 
    errorText.toLowerCase().includes("belum aktif") || 
    errorText.toLowerCase().includes("tidak ditemukan") ||
    errorText.toLowerCase().includes("settings") ||
    errorText.toLowerCase().includes("api_key") ||
    errorText.toLowerCase().includes("expired") ||
    errorText.toLowerCase().includes("expired") ||
    errorText.toLowerCase().includes("kedaluwarsa") ||
    errorText.toLowerCase().includes("api key");

  const isQuotaError = 
    errorText.toLowerCase().includes("quota") ||
    errorText.toLowerCase().includes("kuota") ||
    errorText.toLowerCase().includes("terbatas") ||
    errorText.toLowerCase().includes("429") ||
    errorText.toLowerCase().includes("limit") ||
    errorText.toLowerCase().includes("exhausted");

  // Custom styling for Chat inside bubbles
  if (variant === "chat") {
    return (
      <div className={`p-4 bg-amber-50/90 border border-amber-100 rounded-2xl flex flex-col gap-3 text-left ${className}`}>
        <div className="flex gap-2">
          {isKeyError ? (
            <Key className="text-amber-600 shrink-0 mt-0.5" size={18} />
          ) : (
            <Clock className="text-amber-600 shrink-0 mt-0.5" size={18} />
          )}
          <div>
            <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">
              {isKeyError ? "Asisten AI Belum Aktif 📖" : "Kuota AI Sedang Istirahat ⏰"}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed mt-1">
              {isKeyError ? (
                "Kunci API belum diatur untuk asisten ini atau telah kedaluwarsa. Anda dapat memasang API Key sendiri agar asisten aktif tanpa batas!"
              ) : (
                "Layanan AI gratis QuranMemo saat ini terlampaui karena banyaknya pengguna belajar hari ini."
              )}
            </p>
          </div>
        </div>

        {isQuotaError && (
          <div className="bg-white/80 rounded-xl p-3 border border-amber-100/50 space-y-1.5 text-[11px] text-amber-900">
            <span className="font-bold uppercase tracking-wider text-[9px] text-amber-700 block">Jadwal Pengisian Otomatis:</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span><strong>Tunggu 60 Detik:</strong> Limit menit diperbarui cepat secara konstan.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span><strong>Setiap Hari (24 Jam):</strong> Pengisian kuota penuh harian gratis.</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-200/40 justify-between items-center">
          <span className="text-[9px] text-amber-600 font-bold uppercase">Panduan Belajar QuranMemo AI</span>
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="flex items-center gap-1 text-[9px] font-black uppercase bg-amber-500 hover:bg-amber-400 text-white px-2.5 py-1.5 rounded-lg active:scale-95 transition-all outline-none"
            >
              <RefreshCw size={10} /> Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline / Minimalist Card (good for headers or small sections)
  if (variant === "inline") {
    return (
      <div className={`p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3 text-left ${className}`}>
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-orange-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-orange-950">Limit AI Tercapai (Resets in 60s)</span>
            <span className="text-orange-800 ml-1 block sm:inline">Silakan klik kembali beberapa saat lagi untuk inspirasi baru!</span>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1 px-2.5 bg-white hover:bg-orange-100/50 border border-orange-200 text-[10px] font-black uppercase text-orange-900 rounded-lg active:scale-95 transition-all shrink-0"
          >
            Segarkan
          </button>
        )}
      </div>
    );
  }

  // Expanded Beautiful Card
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 shadow-md text-left space-y-4 max-w-md mx-auto ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
          {isKeyError ? <Key size={24} /> : <Clock size={24} className="animate-pulse" />}
        </div>
        <div className="space-y-1">
          <div className="bg-amber-200/60 text-amber-800 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase inline-block">
            {isKeyError ? "Status: Menunggu Kunci API" : "Status: Menjaga Keseimbangan Server"}
          </div>
          <h3 className="text-base font-extrabold text-amber-955 tracking-tight">
            {isKeyError ? "Asisten Belajar Belum Siap" : "Kuota Layanan AI Terbatas"}
          </h3>
          <p className="text-xs text-amber-900/85 leading-relaxed">
            {isKeyError ? (
              "Penghematan AI aktif. Untuk bimbingan asisten tafsir otomatis Tanpa Batas, silakan daftarkan API Key pribadi Anda di bagian menu Secrets."
            ) : (
              "Layanan kecerdasan gratis kami sedang sibuk melayani santri lain. Kami membatasi frekuensi akses agar semua berkesempatan mencoba merata."
            )}
          </p>
        </div>
      </div>

      {/* Info Box about reset frequency */}
      <div className="bg-white/80 rounded-2xl p-4 border border-amber-200/50 space-y-2.5">
        <div className="flex items-center gap-1.5 text-amber-950 font-extrabold text-xs uppercase tracking-wider">
          <AlertCircle size={14} className="text-amber-500" />
          <span>Berapa Lama Kuota Mereset Kembali?</span>
        </div>
        <div className="space-y-2 text-xs text-amber-900">
          <div className="flex items-start gap-2.5 leading-relaxed">
            <span className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-amber-700">1</span>
            <div>
              <strong className="text-amber-950">Setiap 60 Detik (Menit):</strong>
              <p className="text-[11px] text-amber-800/90">Sistem membatasi ketukan berlebihan. Cukup tunggu satu menit, AI siap menulis lagi!</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 leading-relaxed">
            <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-emerald-700">2</span>
            <div>
              <strong className="text-emerald-950">Setiap 24 Jam (Harian):</strong>
              <p className="text-[11px] text-emerald-800/90">Kuota harian gratis dari Google diperbarui setiap tengah malam seluruh dunia (pukul 00:00 UTC).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-200/40 flex flex-col sm:flex-row gap-2 justify-between items-center">
        <a 
          href="https://aistudio.google.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase text-amber-700 hover:text-amber-900 flex items-center gap-0.5 transition-colors"
        >
          Dapatkan API Key Gratis <ChevronRight size={12} />
        </a>

        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer border-b-2 border-amber-700"
            >
              <RefreshCw size={12} /> Coba Lagi
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
