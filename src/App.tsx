import { useState } from "react";
import { AnimatePresence } from "motion/react";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SurahList from "./components/SurahList";
import SurahDetailView from "./components/SurahDetail";
import Progress from "./components/Progress";
import AICompanion from "./components/AICompanion";
import QuranQuizGame from "./components/QuranQuizGame";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [initialAiMode, setInitialAiMode] = useState(false);
  const [companionMode, setCompanionMode] = useState<"chat" | "coach">("coach"); // default to coach!

  const renderContent = () => {
    if (selectedSurah) {
      return (
        <SurahDetailView 
          nomor={selectedSurah} 
          onBack={() => {
            setSelectedSurah(null);
            setInitialAiMode(false);
          }} 
        />
      );
    }

    switch (currentTab) {
      case "home":
        return (
          <Home 
            onNavigate={(target, aiMode, mode) => {
              setCurrentTab(target);
              setInitialAiMode(!!aiMode);
              if (mode) {
                setCompanionMode(mode);
              }
            }} 
          />
        );
      case "quran":
        return (
          <SurahList 
            onSelect={(id) => setSelectedSurah(id)} 
            initialAiMode={initialAiMode} 
          />
        );
      case "game":
        return (
          <QuranQuizGame 
            onBack={() => setCurrentTab("home")} 
          />
        );
      case "progress":
        return (
          <Progress 
            onSelectSurah={(id) => setSelectedSurah(id)} 
          />
        );
      case "motivation":
        return <AICompanion initialMode={companionMode} />;
      default:
        return (
          <Home 
            onNavigate={(target, aiMode, mode) => {
              setCurrentTab(target);
              setInitialAiMode(!!aiMode);
              if (mode) {
                setCompanionMode(mode);
              }
            }} 
          />
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <Layout currentTab={currentTab} onTabChange={(tab) => {
        setCurrentTab(tab);
        setSelectedSurah(null); // Reset when switching tabs
        setInitialAiMode(false);
      }}>
        {renderContent()}
      </Layout>
    </>
  );
}
