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
    { label: "Total", value: total, icon: Users },
    { label: "Ativos", value: ativos, icon: CheckCircle2 },
    { label: "Em Implantação", value: implantacao, icon: Clock },
    { label: "Inativos", value: inativos, icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-4 bg-[var(--color-surface-elevated)]/80 border border-[#06B6D4]/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4]"><Icon className="w-3.5 h-3.5" /></div>
          </div>
          <h3 className="text-2xl font-black text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
