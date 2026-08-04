import { Card } from "../../../../components/ui/card";
import { TrendingUp, AlertCircle, Wallet, Globe } from "lucide-react";

interface FinanceiroKPIsProps {
  receita: number;
  despesa: number;
  mrr: number;
  inadimplencia: number;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function FinanceiroKPIs({ receita, despesa, mrr, inadimplencia }: FinanceiroKPIsProps) {
  const kpis = [
    { label: "Receita (Real)", value: fmt(receita), icon: TrendingUp },
    { label: "Custo Operacional", value: fmt(despesa), icon: Wallet },
    { label: "MRR Global", value: fmt(mrr), icon: Globe },
    { label: "Índice de Churn", value: `${inadimplencia.toFixed(1)}%`, icon: AlertCircle },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <kpi.icon className="w-4 h-4" />
            <span className="text-xs">{kpi.label}</span>
          </div>
          <p className="text-2xl font-semibold text-white">{kpi.value}</p>
        </Card>
      ))}
    </div>
  );
}
