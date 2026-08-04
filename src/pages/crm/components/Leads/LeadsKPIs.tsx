import { Card } from "../../../../components/ui/card";
import { Users, Flame, CheckCircle2 } from "lucide-react";

export function LeadsKpis(props: {
  stats: { total: number; hot: number; closed: number };
}) {
  const { stats } = props;
  const items = [
    { label: "Total", value: stats.total, icon: Users },
    { label: "Alta Prior.", value: stats.hot, icon: Flame },
    { label: "Ganhos", value: stats.closed, icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-4 border border-[#06B6D4]/20 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{label}</span>
            <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">{value}</h3>
        </Card>
      ))}
    </div>
  );
}
