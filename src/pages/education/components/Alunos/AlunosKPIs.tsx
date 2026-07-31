import { Card } from "../../../../components/ui/card";

interface AlunosKPIsStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface AlunosKPIsProps {
  stats: AlunosKPIsStat[];
}

export function AlunosKPIs({ stats }: AlunosKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-colors opacity-50">
          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
}
