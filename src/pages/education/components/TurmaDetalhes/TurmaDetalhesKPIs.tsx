import { Card } from "../../../../components/ui/card";

interface TurmaDetalhesStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface TurmaDetalhesKPIsProps {
  stats: TurmaDetalhesStat[];
}

export function TurmaDetalhesKPIs({ stats }: TurmaDetalhesKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 bg-[var(--color-surface-elevated)]/50 border-white/5 backdrop-blur-md">
          <stat.icon className={`w-4 h-4 ${stat.color} mb-3`} />
          <div className="text-xl font-display font-black text-white italic">{stat.value}</div>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
