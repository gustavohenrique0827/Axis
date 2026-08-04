import { Card } from "../../../../components/ui/card";
import { Users, Flame, CheckCircle2 } from "lucide-react";

export function LeadsKpis(props: {
  stats: { total: number; hot: number; closed: number };
}) {
  const { stats } = props;
  const items = [
    { label: "Total", value: stats.total, icon: Users, color: "text-indigo-500" },
    { label: "Alta Prior.", value: stats.hot, icon: Flame, color: "text-amber-500" },
    { label: "Ganhos", value: stats.closed, icon: CheckCircle2, color: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
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
