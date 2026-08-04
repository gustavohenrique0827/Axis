import { Card } from "../../../../components/ui/card";
import { Users, Flame, CheckCircle2, Target, BarChart3 } from "lucide-react";

interface PipelineKPIsProps {
  total: number;
  hot: number;
  closed: number;
  winRate: number;
  formattedTotalValue: string;
}

export function PipelineKPIs({ total, hot, closed, winRate, formattedTotalValue }: PipelineKPIsProps) {
  const items = [
    { label: "Total", value: total, icon: Users },
    { label: "Alta Prior.", value: hot, icon: Flame },
    { label: "Ganhos", value: closed, icon: CheckCircle2 },
    { label: "Win Rate", value: `${winRate}%`, icon: Target },
    { label: "Valor Total", value: formattedTotalValue, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </div>
          <h3 className="text-xl font-semibold text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
