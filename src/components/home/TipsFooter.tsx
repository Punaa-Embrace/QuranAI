import { Sparkles } from "lucide-react";

export default function TipsFooter() {
  return (
    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-start gap-4">
      <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
        <Sparkles size={16} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-xs">Tips Terbaik Hari ini</h4>
        <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
          Gunakan metode <strong className="font-extrabold text-emerald-700">Murajaah Saku</strong>! Setorkan hafalan Anda bertahap minimal pada 1 teman terdekat atau tanyakan tips metode menghafal di fitur <strong className="font-extrabold text-emerald-700">Tanya AI Mentor</strong> di halaman utama ini.
        </p>
      </div>
    </div>
  );
}
