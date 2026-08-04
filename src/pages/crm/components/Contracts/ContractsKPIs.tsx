import { Card } from "../../../../components/ui/card";
import { FileText, DollarSign, AlertCircle, TrendingUp } from "lucide-react";

interface ContractsKPIsProps {
  totalMRR: number;
  ativos: number;
  inadimplentes: number;
}

export function ContractsKPIs({ totalMRR, ativos, inadimplentes }: ContractsKPIsProps) {
  const items = [
    { label: "MRR Total", value: `R$ ${totalMRR.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-blue-500" },
    { label: "Contratos Ativos", value: ativos, icon: FileText, color: "text-indigo-500" },
    { label: "Inadimplência", value: inadimplentes, icon: AlertCircle, color: "text-rose-500" },
    { label: "Retenção Estimada", value: "96.8%", icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
