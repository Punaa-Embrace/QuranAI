import { motion } from "motion/react";
import { Book, Home as HomeIcon, LineChart, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/api";

export default function Layout({ children, currentTab, onTabChange }: { 
  children: React.ReactNode; 
  currentTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <div className="p-2 bg-primary rounded-xl text-white">
            <Book size={20} />
          </div>
          QuranMemo AI
        </h1>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavButton 
          active={currentTab === 'home'} 
          icon={<HomeIcon size={24} />} 
          label="Home" 
          onClick={() => onTabChange('home')} 
        />
        <NavButton 
          active={currentTab === 'quran'} 
          icon={<Book size={24} />} 
          label="Quran" 
          onClick={() => onTabChange('quran')} 
        />
        <NavButton 
          active={currentTab === 'progress'} 
          icon={<LineChart size={24} />} 
          label="Progress" 
          onClick={() => onTabChange('progress')} 
        />
        <NavButton 
          active={currentTab === 'motivation'} 
          icon={<Sparkles size={24} />} 
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
