import { motion } from "motion/react";
import { Book, Home as HomeIcon, LineChart, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/src/lib/api";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ currentTab, onTabChange }: NavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white border-t border-gray-100 px-6 md:px-12 py-4 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
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
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative cursor-pointer",
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
