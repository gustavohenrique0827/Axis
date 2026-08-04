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
    { label: "Total", value: total, icon: Users, color: "text-indigo-500" },
    { label: "Alta Prior.", value: hot, icon: Flame, color: "text-amber-500" },
    { label: "Ganhos", value: closed, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "text-blue-500" },
    { label: "Valor Total", value: formattedTotalValue, icon: BarChart3, color: "text-cyan-500", wide: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
      {items.map(({ label, value, icon: Icon, color, wide }) => (
        <Card
          key={label}
          className={`p-4 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all ${wide ? "col-span-2 md:col-span-1" : ""}`}
        >
          <Icon className={`w-4 h-4 ${color} mb-2`} />
          <div className="text-xl font-display font-black text-white mb-1 italic">{value}</div>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
        </Card>
      ))}
    </div>
  );
}
