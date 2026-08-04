import { Card } from "../../../../components/ui/card";

export function KpiCards(props: {
  stats: Array<{ label: string; value: string | number; icon: React.ComponentType<any> }>;
}) {
  const { stats } = props;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/80 border border-[#06B6D4]/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold leading-tight">{stat.label}</p>
              <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
          </Card>
        );
      })}
    </div>
  );
}

