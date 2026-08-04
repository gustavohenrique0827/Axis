import { Card } from "../../../../components/ui/card";

const DEFAULT_COLORS = ["text-indigo-500", "text-emerald-500", "text-blue-500", "text-amber-500"];

export function KpiCards(props: {
  stats: Array<{ label: string; value: string | number; icon: React.ComponentType<any>; color?: string }>;
}) {
  const { stats } = props;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const color = stat.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        return (
          <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <Icon className={`w-5 h-5 ${color} mb-4`} />
            <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </Card>
        );
      })}
    </div>
  );
}

