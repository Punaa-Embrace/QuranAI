import { BookOpen, Github } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-950/10 border border-amber-400">
          <BookOpen size={18} className="text-amber-350" />
        </div>
        <span className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">QuranAI</span>
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-1.5 rounded-xl border border-emerald-100/50 select-none">
          BY PUTSYA
        </span>
        <a 
          href="https://github.com/Punaa-Embrace/QuranAI" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-gray-100"
          title="GitHub Repo"
        >
          <Github size={16} />
        </a>
      </div>
    </header>
  );
}
