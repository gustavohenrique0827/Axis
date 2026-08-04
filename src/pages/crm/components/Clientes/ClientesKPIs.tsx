import { Card } from "../../../../components/ui/card";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ClientesKPIsProps {
  total: number;
  ativos: number;
  implantacao: number;
  inativos: number;
}

export function ClientesKPIs({ total, ativos, implantacao, inativos }: ClientesKPIsProps) {
  const items = [
    { label: "Total", value: total, icon: Users, color: "text-indigo-500" },
    { label: "Ativos", value: ativos, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Em Implantação", value: implantacao, icon: Clock, color: "text-blue-500" },
    { label: "Inativos", value: inativos, icon: AlertCircle, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
          <Icon className={`w-5 h-5 ${color} mb-4`} />
          <div className="text-2xl font-display font-black text-white mb-1 italic">{value}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
        </Card>
      ))}
    </div>
  );
}
