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
        <Card key={label} className="p-5">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </div>
          <h3 className="text-2xl font-semibold text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
