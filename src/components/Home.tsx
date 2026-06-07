import { useEffect, useState } from "react";
import { getDailyQuote } from "@/src/lib/api";

// Leaf-layout component imports (Blade-like rendering partials)
import GreetingSection from "./home/GreetingSection";
import QuoteCard from "./home/QuoteCard";
import QuizBanner from "./home/QuizBanner";
import NavigationGrid from "./home/NavigationGrid";
import TipsFooter from "./home/TipsFooter";

const LOCAL_QUOTES = [
  "Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya. (HR. Bukhari)",
  "Al-Quran adalah obat penawar bagi kegelisahan hati manusia yang beriman.",
  "Mempunyai satu kawan setia yang selalu mengajak mulia bersama Al-Quran adalah sebuah anugerah luar biasa.",
  "Membaca satu huruf dari Al-Quran dinilai sebagai sepuluh kebaikan di sisi Allah. (HR. Tirmidzi)",
  "Jadikanlah Al-Quran sebagai teman karibmu, ia akan memberi syafaat bagimu kelak di akhirat.",
  "Hafalan Al-Quran adalah investasi mahkota cahaya paling agung bagi orang tuamu di surga."
];

interface HomeProps {
  onNavigate: (page: string, aiMode?: boolean, mode?: 'chat' | 'coach') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [quote, setQuote] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Assalamualaikum");
  const [aiFetching, setAiFetching] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  useEffect(() => {
    // Dynamic Greeting based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting("Selamat Pagi, Pejuang Quran");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang, Pejuang Quran");
    } else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore, Pejuang Quran");
    } else {
      setGreeting("Selamat Malam, Pejuang Quran");
    }

    // Load offline default quote on mount
    const seed = Math.floor(Math.random() * LOCAL_QUOTES.length);
    setQuote(LOCAL_QUOTES[seed]);
    setLoading(false);

    // Load progress
    const saved = localStorage.getItem("quran_progress");
    if (saved) {
      const items = JSON.parse(saved);
      if (items.length > 0) {
        const avg = Math.round((items.reduce((acc: number, curr: any) => acc + (curr.completedAyats / curr.ayatCount), 0) / items.length) * 100);
        setProgress(avg);
      }
    }
  }, []);

  const handleGetAiInspiration = async () => {
    setAiFetching(true);
    try {
      const res = await getDailyQuote();
      if (res && res.result) {
        setQuote(res.result);
        setAiLoaded(true);
      }
    } catch (err) {
      // Gracefully fall back to another random quote
      const remainingQuotes = LOCAL_QUOTES.filter(q => q !== quote);
      const randomFallback = remainingQuotes[Math.floor(Math.random() * remainingQuotes.length)] || LOCAL_QUOTES[0];
      setQuote(randomFallback);
    } finally {
      setAiFetching(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* 1. Header Greeting Section */}
      <GreetingSection greeting={greeting} />

      {/* 2. Daily Spiritual Uplift Card */}
      <QuoteCard 
        quote={quote} 
        loading={loading} 
        aiLoaded={aiLoaded} 
        aiFetching={aiFetching} 
        onFetch={handleGetAiInspiration} 
      />

      {/* 3. Gamification Quiz Banner */}
      <QuizBanner onNavigate={onNavigate} />

      {/* 4. Modular Navigation Grid Menu */}
      <NavigationGrid progress={progress} onNavigate={onNavigate} />

      {/* 5. Quick Tips Footer Card */}
      <TipsFooter />
    </div>
  );
}
