import Header from "./layout/Header";
import Navbar from "./layout/Navbar";

export default function Layout({ children, currentTab, onTabChange }: { 
  children: React.ReactNode; 
  currentTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative shadow-2xl border-x border-gray-100">
      {/* Blade-like Header Partial include */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-28 overflow-y-auto">
        {children}
      </main>

      {/* Blade-like Bottom Nav Partial include */}
      <Navbar currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
}
