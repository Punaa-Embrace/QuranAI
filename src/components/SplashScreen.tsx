import { motion } from "motion/react";
import { BookOpen, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Quick, smooth and professional load simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onFinish();
          }, 350); // Fluid timing buffer before dismissing
          return 100;
        }
        return prev + 1.25; // Smooth incremental load
      });
    }, 16);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div 
      id="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.32, 0.94, 0.6, 1] }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#01140e] via-[#022c22] to-[#01140e] flex flex-col items-center justify-between py-16 px-6 overflow-hidden max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto border-x border-emerald-950 shadow-2xl"
    >
      {/* Absolute background decorative light flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none select-none" />

      {/* 1. Header Islamic Greeting Word */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center select-none"
      >
        <span className="text-sm font-serif tracking-widest text-amber-200/60 block mb-1">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
        <span className="text-[9px] font-mono tracking-[0.25em] text-emerald-300/40 uppercase block">
          In the Name of Allah, the Merciful, the Compassionate
        </span>
      </motion.div>

      {/* 2. Central Logo Box */}
      <div className="flex flex-col items-center justify-center flex-1">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 70, 
            damping: 15,
            delay: 0.1 
          }}
          className="relative"
        >
          {/* Subtle slow rotating backlighting ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-amber-400/20 via-transparent to-emerald-400/20 blur-xl pointer-events-none"
          />

          {/* Golden energy glow pulse aura */}
          <motion.div 
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-emerald-700/15 rounded-[2rem] blur-xl"
          />
          
          {/* Animated Squircle Logo Compartment */}
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center shadow-[0_12px_45px_rgba(2,44,34,0.6)] border-2 border-amber-400 relative">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <BookOpen className="text-amber-300 w-11 h-11 stroke-[1.5]" />
            </motion.div>

            {/* Micro stars / Sparkles popping inside */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-2.5 right-2.5 text-amber-200"
            >
              <Sparkles size={14} />
            </motion.div>
          </div>
        </motion.div>

        {/* Text App Title */}
        <div className="text-center mt-7">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-white select-none font-sans"
          >
            Quran<span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">AI</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-emerald-200/80 text-[13px] font-medium tracking-wide mt-2.5 font-sans"
          >
            Islamic AI Learning Companion
          </motion.p>
        </div>
      </div>

      {/* 3. Bottom Loading Progress indicator & signature */}
      <div className="w-full max-w-[250px] flex flex-col items-center gap-4 select-none">
        
        {/* Progress micro-bar */}
        <div className="w-full h-[3px] bg-emerald-950/80 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>

        {/* Informative text metrics */}
        <div className="flex items-center justify-between w-full text-[9px] font-mono tracking-widest text-emerald-300/50 uppercase">
          <span>MEMULAI MEMORI...</span>
          <span className="text-amber-300 font-extrabold font-mono">{Math.round(progress)}%</span>
        </div>

        {/* Credits */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 0.8 }}
          className="text-[8px] font-black tracking-widest text-[#94a3b8] mt-4 flex items-center gap-1.5"
        >
          <span>BY PUTSYA</span>
          <span className="text-emerald-500">•</span>
          <span>BISMILLAH</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
