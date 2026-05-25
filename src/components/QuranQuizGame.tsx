import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Sparkles, 
  ChevronLeft, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  HelpCircle, 
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Play,
  RotateCcw
} from "lucide-react";
import { getSurahs, getSurahDetail, cn } from "@/src/lib/api";

interface Question {
  type: "sambung_ayat" | "susun_kata";
  promptVerse: any; // The verse given as prompt
  correctAnswer: string; // Correct text or ordered words
  options: string[] | string[][]; // Multi-choice or scrambled words
  answerExplanation?: string;
  ayatNumber: number;
}

export default function QuranQuizGame({ onBack }: { onBack: () => void }) {
  const [surahList, setSurahList] = useState<any[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState<number>(30); // Default to An-Naba / popular Juz 30 or Al-Ikhlas (112)
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingGame, setLoadingGame] = useState(false);
  const [gameState, setGameState] = useState<"lobby" | "playing" | "results">("lobby");
  
  // Game Play States
  const [gameMode, setGameMode] = useState<"sambung_ayat" | "susun_kata">("sambung_ayat");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);

  // Word puzzle specific state
  const [userSelectedWords, setUserSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

  // Confetti particles for correct answers
  const [localParticles, setLocalParticles] = useState<{
    id: number;
    angle: number;
    distance: number;
    color: string;
    size: number;
  }[]>([]);

  // Soundless success triggers
  const triggerSuccessBurst = () => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: Math.random() + i,
      angle: (i / 25) * 2 * Math.PI + (Math.random() - 0.5) * 0.25,
      distance: 40 + Math.random() * 60,
      color: i % 3 === 0 ? '#fbbf24' : (i % 3 === 1 ? '#10b981' : '#60a5fa'), // Gold, Emerald, Ocean Blue
      size: 6 + Math.random() * 5
    }));
    setLocalParticles(newParticles);
    setTimeout(() => setLocalParticles([]), 1500);
  };

  useEffect(() => {
    setLoadingSurahs(true);
    getSurahs()
      .then(data => {
        // filter popular surahs to place at top list, but keep full list
        const popularIds = [1, 108, 112, 113, 114, 95, 96, 97, 103];
        const popular = data.filter(s => popularIds.includes(s.nomor));
        const others = data.filter(s => !popularIds.includes(s.nomor));
        setSurahList([...popular, ...others]);
        // Set first popular as default
        setSelectedSurahId(112); // Al-Ikhlas (Ideal for short testing)
      })
      .finally(() => {
        setLoadingSurahs(false);
      });
  }, []);

  const startNewGame = async (mode: "sambung_ayat" | "susun_kata", surahId: number) => {
    setLoadingGame(true);
    setGameMode(mode);
    try {
      const detail = await getSurahDetail(surahId);
      const ayats = detail.ayat;

      if (!ayats || ayats.length < 2) {
        // Fallback to Al-Kautsar if Surah has too few verses for sambung_ayat
        alert("Pilih surah yang memiliki minimal 2 ayat untuk bermain kuis.");
        setLoadingGame(false);
        return;
      }

      // Generate 5 questions based on selected mode
      const generated: Question[] = [];
      const totalToGenerate = Math.min(5, ayats.length);
      const usedIndexes = new Set<number>();

      for (let k = 0; k < totalToGenerate; k++) {
        let attempts = 0;
        let pIdx = 0;
        
        // Find a random verse that hasn't been used yet
        do {
          // For Sambung Ayat, must not be the very last verse since we need a successor
          const maxIdx = mode === "sambung_ayat" ? ayats.length - 2 : ayats.length - 1;
          pIdx = Math.floor(Math.random() * (maxIdx + 1));
          attempts++;
        } while (usedIndexes.has(pIdx) && attempts < 30);

        usedIndexes.add(pIdx);
        const currentAyat = ayats[pIdx];

        if (mode === "sambung_ayat") {
          const correctAyat = ayats[pIdx + 1];
          // Get three other random verses as incorrect suggestions
          const distractors: string[] = [];
          const distractorIndexes = new Set<number>([pIdx, pIdx + 1]);
          
          while (distractors.length < 3 && distractorIndexes.size < ayats.length) {
            const randIdx = Math.floor(Math.random() * ayats.length);
            if (!distractorIndexes.has(randIdx)) {
              distractorIndexes.add(randIdx);
              distractors.push(ayats[randIdx].teksArab);
            }
          }

          // If not enough in same Surah, add from general short verses
          while (distractors.length < 3) {
            distractors.push("قُلْ هُوَ اللَّهُ أَحَدٌ");
          }

          const optionsList = [correctAyat.teksArab, ...distractors];
          // Shuffle options
          for (let i = optionsList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
          }

          generated.push({
            type: "sambung_ayat",
            promptVerse: currentAyat,
            correctAnswer: correctAyat.teksArab,
            options: optionsList,
            ayatNumber: currentAyat.nomorAyat,
            answerExplanation: `Lanjutan QS. ${detail.namaLatin} ayat ${currentAyat.nomorAyat} adalah ayat ${correctAyat.nomorAyat}: "${correctAyat.teksIndonesia}"`
          });
        } else {
          // Susun Kata (scramble words of the verse)
          // Cleans up punctuation slightly for a fun game
          const cleanText = currentAyat.teksArab.trim();
          const words = cleanText.split(/\s+/).filter(Boolean);

          // We handle verses up to 10 words, or slice if they are too long to fit beautifully on mobile
          const maxWords = words.slice(0, 8);
          const originalReorder = [...maxWords];
          
          // Shuffle words
          const scrambled = [...maxWords];
          for (let i = scrambled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
          }

          generated.push({
            type: "susun_kata",
            promptVerse: currentAyat,
            correctAnswer: originalReorder.join(" "),
            options: scrambled,
            ayatNumber: currentAyat.nomorAyat,
            answerExplanation: `Ejaan asli QS. ${detail.namaLatin} ayat ${currentAyat.nomorAyat}: "${currentAyat.teksIndonesia}"`
          });
        }
      }

      setQuestions(generated);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setScore(0);
      setStreak(0);
      setHighestStreak(0);
      setUserSelectedWords([]);
      setShuffledWords(generated[0]?.options as string[] || []);
      setXpGained(0);
      setGameState("playing");
    } catch (e) {
      console.error(e);
      alert("Gagal memuat kuis surat ini. Silakan coba surat lain.");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleSambungAyatSubmit = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double taps

    const currentQuestion = questions[currentIdx];
    setSelectedAnswer(option);
    
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const addedXp = 10 + (streak * 2);
      setXpGained(prev => prev + addedXp);
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
      triggerSuccessBurst();
    } else {
      setStreak(0);
    }
  };

  const handleWordTap = (word: string, index: number) => {
    // toggle active word Selection
    setUserSelectedWords(prev => {
      const next = [...prev, word];
      return next;
    });
    // remove from options
    setShuffledWords(prev => prev.filter((_, i) => i !== index));
  };

  const resetWordPuzzle = () => {
    setUserSelectedWords([]);
    setShuffledWords([...(questions[currentIdx]?.options as string[])]);
  };

  const checkWordPuzzleAnswer = () => {
    const currentQuestion = questions[currentIdx];
    const answerStr = userSelectedWords.join(" ");
    
    // Arabic order checked
    const isCorrectOrder = answerStr === currentQuestion.correctAnswer;
    setSelectedAnswer(answerStr);
    setIsCorrect(isCorrectOrder);

    if (isCorrectOrder) {
      const addedXp = 15 + (streak * 3);
      setXpGained(prev => prev + addedXp);
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
      triggerSuccessBurst();
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setUserSelectedWords([]);
      setShuffledWords(questions[nextIdx]?.options as string[] || []);
    } else {
      // Save stats locally
      const savedStats = localStorage.getItem("quran_quiz_stats");
      const currentStats = savedStats ? JSON.parse(savedStats) : { totalXp: 0, gamesPlayed: 0, highStreak: 0 };
      
      const newStats = {
        totalXp: (currentStats.totalXp || 0) + xpGained,
        gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
        highStreak: Math.max(currentStats.highStreak || 0, highestStreak)
      };
      
      localStorage.setItem("quran_quiz_stats", JSON.stringify(newStats));
      setGameState("results");
    }
  };

  const getEncouragement = (correctAnswers: number) => {
    if (correctAnswers === 5) return "Maa Shaa Allah! Hafalanmu Sempurna! ⭐⭐⭐⭐⭐";
    if (correctAnswers >= 3) return "Mumtaz! Hafalanmu sangat baik, teruskan murojaah! 🌟";
    return "Tetap Semangat! Al-Quran membawa berkah di setiap proses belajarmu. Boos semangatmu lagi! 💪";
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Absolute floating particles for success bursts */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-50 overflow-hidden">
        {localParticles.map(p => (
          <motion.span
            key={p.id}
            initial={{ x: "50vw", y: "45vh", opacity: 1, scale: 0.8 }}
            animate={{
              x: `calc(50vw + ${Math.cos(p.angle) * p.distance}px)`,
              y: `calc(45vh + ${Math.sin(p.angle) * p.distance}px)`,
              opacity: [1, 1, 0],
              scale: [0.8, 1.2, 0.3]
            }}
            transition={{
              duration: 1.0,
              ease: "easeOut"
            }}
            className="absolute rounded-full"
            style={{
              backgroundColor: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-emerald-50 hover:text-primary transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Kuis Hafalan Al-Quran</h2>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Metode Gamifikasi Seru Pelancar Hafalan</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Mascot Greeting */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-[28px] shadow-md border-b-4 border-emerald-950 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10 bg-white w-32 h-32 rounded-full" />
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase">
                  <Flame size={10} className="text-amber-300 animate-bounce" /> Gamifikasi Digital
                </div>
                <h3 className="font-extrabold text-base leading-relaxed">Asah & Uji Kemampuan Hafalanmu Secara Menyenangkan!</h3>
                <p className="text-xs text-white/80 leading-relaxed text-emerald-50">
                  Ucapkan selamat tinggal pada kejenuhan. Bermain "Sambung Ayat" dan "Susun Kata" membantu meretensi ingatan visual & auditori Al-Quran dengan sangat efektif.
                </p>
              </div>
            </div>

            {/* Select Surah for Quiz */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">Tahap 1: Pilih Surah yang Mau Ditest</h4>
              </div>
              
              {loadingSurahs ? (
                <div className="h-10 w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-400">
                  Memuat daftar surah...
                </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedSurahId}
                    onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                    className="w-full text-sm font-semibold bg-gray-50 border border-gray-100 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none text-gray-900"
                  >
                    {surahList.map((surah) => (
                      <option key={surah.nomor} value={surah.nomor}>
                        QS. {surah.nomor}. {surah.namaLatin} ({surah.jumlahAyat} Ayat) - {surah.arti}
                      </option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                    ▼
                  </div>
                </div>
              )}
            </div>

            {/* Selection Game Modes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Award size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">Tahap 2: Pilih Mode Permainan</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* Mode 1: Sambung Ayat */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startNewGame("sambung_ayat", selectedSurahId)}
                  disabled={loadingGame}
                  className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-xs hover:border-amber-300 transition-all text-left flex items-start gap-4 relative overflow-hidden group cursor-pointer"
                >
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-900 text-sm">Mode 1: Sambung Ayat</h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Sempurnakan ingatan dengan menebak ayat kelanjutan dari penggalan ayat yang diberikan.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 ml-auto self-center group-hover:text-amber-500 transition-colors" />
                </motion.button>

                {/* Mode 2: Susun Kata */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startNewGame("susun_kata", selectedSurahId)}
                  disabled={loadingGame}
                  className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-xs hover:border-emerald-300 transition-all text-left flex items-start gap-4 relative overflow-hidden group cursor-pointer"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-900 text-sm">Mode 2: Susun Kata (Puzzle)</h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Menyusun kata Al-Quran dalam bahasa Arab yang diacak untuk melatih kefasihan tulisan ayat.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 ml-auto self-center group-hover:text-emerald-500 transition-colors" />
                </motion.button>
              </div>

              {loadingGame && (
                <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-800 rounded-2xl font-bold text-xs animate-pulse">
                  <RefreshCw className="animate-spin text-emerald-600" size={14} />
                  Menyiapkan ayat Al-Quran pilihanmu...
                </div>
              )}
            </div>
            
            {/* Local Stats Box */}
            <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900">Total XP Hafalanmu</h4>
                  <p className="text-[11px] text-gray-500">Kumpulkan XP dari game untuk bukti rajin murojaah!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-amber-700">
                  {localStorage.getItem("quran_quiz_stats") 
                    ? JSON.parse(localStorage.getItem("quran_quiz_stats")!).totalXp
                    : 0} XP
                </span>
              </div>
            </div>

          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Pertanyaan {currentIdx + 1} dari {questions.length}
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1 text-amber-600">
                  <Flame size={14} className="text-amber-500 animate-pulse" /> Streak: {streak}
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">XP: +{xpGained}</span>
              </div>
            </div>

            {/* Micro progress line */}
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Screen */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">
                  {gameMode === "sambung_ayat" ? "SAMBUNG AYAT BERIKUT:" : "SUSUN KEMBALI AYAT INI:"}
                </span>
                
                {/* Prompt Verse */}
                {gameMode === "sambung_ayat" ? (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4 text-center">
                    <p className="text-2xl text-right leading-[1.8] font-arabic my-2" style={{ direction: "rtl" }}>
                      {questions[currentIdx]?.promptVerse.teksArab}
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold italic text-left">
                      QS. Surat ke-{selectedSurahId} ayat {questions[currentIdx]?.ayatNumber}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2 text-left">
                    <p className="text-xs text-gray-500">Terjemahan Indonesia:</p>
                    <p className="text-xs font-bold leading-relaxed text-gray-700">
                      "{questions[currentIdx]?.promptVerse.teksIndonesia}"
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      (QS. ke-{selectedSurahId} ayat {questions[currentIdx]?.ayatNumber})
                    </p>
                  </div>
                )}
              </div>

              {/* GAME mode 1: Sambung Ayat (Multi-choices) */}
              {gameMode === "sambung_ayat" && (
                <div className="space-y-3">
                  {questions[currentIdx]?.options.map((option: any, index) => {
                    const isSelected = selectedAnswer === option;
                    const isThisCorrect = option === questions[currentIdx].correctAnswer;
                    
                    let btnStyle = "bg-gray-50 hover:bg-emerald-50/50 border-gray-100 text-gray-800";
                    if (selectedAnswer !== null) {
                      if (isThisCorrect) {
                        btnStyle = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                      } else if (isSelected) {
                        btnStyle = "bg-red-500 text-white border-red-500 shadow-sm";
                      } else {
                        btnStyle = "opacity-40 bg-gray-50 text-gray-400 border-gray-100";
                      }
                    }

                    return (
                      <motion.button
                        key={index}
                        whileHover={selectedAnswer === null ? { scale: 1.01 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                        onClick={() => handleSambungAyatSubmit(option)}
                        disabled={selectedAnswer !== null}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-right font-arabic text-xl leading-relaxed transition-all cursor-pointer flex justify-between items-center gap-4",
                          btnStyle
                        )}
                        style={{ direction: "rtl" }}
                      >
                        <span className="flex-1 text-right">{option}</span>
                        {selectedAnswer !== null && isThisCorrect && (
                          <CheckCircle2 size={16} className="text-white shrink-0 ml-2" />
                        )}
                        {selectedAnswer !== null && isSelected && !isThisCorrect && (
                          <XCircle size={16} className="text-white shrink-0 ml-2" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* GAME mode 2: Susun Kata (Puzzle builder) */}
              {gameMode === "susun_kata" && (
                <div className="space-y-4">
                  
                  {/* Selected Words Area (Arabic sentences flow from right to left) */}
                  <div 
                    className="min-h-[80px] p-4 bg-emerald-50/30 rounded-2xl border-2 border-dashed border-emerald-100 flex flex-wrap justify-center gap-2 items-center"
                    style={{ direction: "rtl" }}
                  >
                    {userSelectedWords.length === 0 ? (
                      <p className="text-[11px] text-gray-400 font-medium italic">
                        Tap kata-kata Arab di bawah ini sesuai urutan ayat yang benar...
                      </p>
                    ) : (
                      userSelectedWords.map((word, idx) => (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={idx}
                          className="bg-emerald-600 text-white rounded-xl py-1.5 px-3 font-semibold font-arabic text-lg shadow-xs"
                        >
                          {word}
                        </motion.span>
                      ))
                    )}
                  </div>

                  {/* Scrambled Word options pool */}
                  {selectedAnswer === null && (
                    <div 
                      className="flex flex-wrap gap-2 justify-center"
                      style={{ direction: "rtl" }}
                    >
                      {shuffledWords.map((word, index) => (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          key={index}
                          onClick={() => handleWordTap(word, index)}
                          className="bg-white hover:bg-emerald-50 border border-gray-200 shadow-xs px-3.5 py-1.5 rounded-xl font-arabic text-lg text-gray-800"
                        >
                          {word}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Play Buttons for Puzzle */}
                  {selectedAnswer === null && (
                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={resetWordPuzzle}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={13} /> Reset Kepingan
                      </button>
                      <button
                        onClick={checkWordPuzzleAnswer}
                        disabled={userSelectedWords.length === 0}
                        className="flex-1 bg-primary text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 size={13} /> Periksa Jawaban
                      </button>
                    </div>
                  )}

                  {/* Custom Word puzzle check styles */}
                  {selectedAnswer !== null && (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-center">
                      <p className="text-xs font-bold text-gray-500">Susunanmu:</p>
                      <p className="font-arabic text-xl leading-relaxed text-primary" style={{ direction: "rtl" }}>
                        {selectedAnswer}
                      </p>
                      <div className="flex items-center justify-center gap-2 font-black text-xs uppercase mt-1">
                        {isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1">✔ Susunan Benar!</span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">❌ Susunan Keliru!</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pt-2">
                        Benar: <strong className="font-arabic font-semibold">{questions[currentIdx].correctAnswer}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Answer Explanatory / Next trigger feedback */}
            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-3xl border space-y-3",
                    isCorrect 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-950" 
                      : "bg-red-50 border-red-100 text-red-950"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                    ) : (
                      <XCircle className="text-red-500 shrink-0" size={18} />
                    )}
                    <h5 className="font-extrabold text-xs uppercase tracking-wider">
                      {isCorrect ? `Jawaban Benar! (+${10 + streak * 2} XP)` : "Jawaban Kurang Tepat"}
                    </h5>
                  </div>
                  
                  <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                    {questions[currentIdx]?.answerExplanation}
                  </p>

                  <button
                    onClick={handleNext}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-1 shadow-sm mt-2 cursor-pointer"
                  >
                    <span>{currentIdx + 1 === questions.length ? "Lihat Skor Akhir" : "Lanjut Ayat Berikut"}</span>
                    <ArrowRight size={13} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {gameState === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            {/* Trophy Badge Layout */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-md space-y-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 opacity-5 bg-primary w-32 h-32 rounded-full" />
              <div className="absolute -bottom-12 -left-12 opacity-5 bg-primary w-32 h-32 rounded-full" />
              
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-xs mx-auto animate-bounce border-2 border-amber-300">
                <Trophy size={40} className="stroke-[1.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight text-gray-900">Sesi Kuis Selesai!</h3>
                <p className="text-xs font-bold text-amber-600 max-w-xs mx-auto leading-relaxed">
                  {getEncouragement(score)}
                </p>
              </div>

              {/* Score Metric board */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-[9px]">Skor Benar</p>
                  <p className="text-2xl font-black text-primary mt-1">{score} / 5</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-[9px]">XP Diperoleh</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">+{xpGained} XP</p>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => startNewGame(gameMode, selectedSurahId)}
                className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold text-xs py-4 rounded-2xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin-once" /> Main Lagi di Surah Ini
              </button>
              <button
                onClick={() => setGameState("lobby")}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-extrabold text-xs py-4 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={14} /> Ganti Surah / Mode Lain
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
