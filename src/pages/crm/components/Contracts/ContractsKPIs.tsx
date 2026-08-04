import { Card } from "../../../../components/ui/card";
import { FileText, DollarSign, AlertCircle, TrendingUp } from "lucide-react";

interface ContractsKPIsProps {
  totalMRR: number;
  ativos: number;
  inadimplentes: number;
}

export function ContractsKPIs({ totalMRR, ativos, inadimplentes }: ContractsKPIsProps) {
  const items = [
    { label: "MRR Total", value: `R$ ${totalMRR.toLocaleString("pt-BR")}`, icon: DollarSign },
    { label: "Contratos Ativos", value: ativos, icon: FileText },
    { label: "Inadimplência", value: inadimplentes, icon: AlertCircle },
    { label: "Retenção Estimada", value: "96.8%", icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-5 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface-elevated)]/80 border-[#06B6D4]/20 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg">
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
}
