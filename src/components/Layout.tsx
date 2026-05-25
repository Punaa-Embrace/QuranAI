import { motion } from "motion/react";
import { Book, Home as HomeIcon, LineChart, Sparkles, BookOpen, Trophy } from "lucide-react";
import { cn } from "@/src/lib/api";

export default function Layout({ children, currentTab, onTabChange }: { 
  children: React.ReactNode; 
  currentTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-950/10 border border-amber-400">
            <BookOpen size={18} className="text-amber-350" />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">QuranAI</span>
        </h1>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavButton 
          active={currentTab === 'home'} 
          icon={<HomeIcon size={22} />} 
          label="Home" 
          onClick={() => onTabChange('home')} 
        />
        <NavButton 
          active={currentTab === 'quran'} 
          icon={<Book size={22} />} 
          label="Quran" 
          onClick={() => onTabChange('quran')} 
        />
        <NavButton 
          active={currentTab === 'game'} 
          icon={<Trophy size={22} />} 
          label="Kuis" 
          onClick={() => onTabChange('game')} 
        />
        <NavButton 
          active={currentTab === 'progress'} 
          icon={<LineChart size={22} />} 
          label="Progress" 
          onClick={() => onTabChange('progress')} 
        />
        <NavButton 
          active={currentTab === 'motivation'} 
          icon={<Sparkles size={22} />} 
          label="AI" 
          onClick={() => onTabChange('motivation')} 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative",
        active ? "text-primary scale-110" : "text-gray-400 hover:text-secondary"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
        />
      )}
    </button>
  );
}
