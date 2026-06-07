import { Clock } from "lucide-react";

interface GreetingSectionProps {
  greeting: string;
}

export default function GreetingSection({ greeting }: GreetingSectionProps) {
  return (
    <section className="space-y-1.5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-950">{greeting} 👋</h2>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Mari perbarui niat & murajaah hari ini</p>
      </div>
      <div className="p-2 bg-emerald-50 text-primary rounded-xl flex items-center justify-center border border-emerald-100">
        <Clock size={18} />
      </div>
    </section>
  );
}
