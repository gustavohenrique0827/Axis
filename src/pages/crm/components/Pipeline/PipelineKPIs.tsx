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
    { label: "Valor Total", value: formattedTotalValue, icon: BarChart3, wide: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
      {items.map(({ label, value, icon: Icon, wide }) => (
        <Card
          key={label}
          className={`p-3 border border-[#06B6D4]/20 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl hover:scale-[1.02] transition-all ${wide ? "col-span-2 md:col-span-1" : ""}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{label}</span>
            <Icon className="w-3 h-3 text-[#06B6D4]" />
          </div>
          <h3 className="text-xl font-extrabold text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
