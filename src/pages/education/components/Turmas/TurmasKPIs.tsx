import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

interface TurmasKPIsStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface TurmasKPIsProps {
  stats: TurmasKPIsStat[];
}

export function TurmasKPIs({ stats }: TurmasKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border-white/5 backdrop-blur-md group hover:border-white/10 transition-all cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <Badge className="bg-white/5 border-white/5 text-slate-500 text-[9px] font-black tracking-widest uppercase">Live</Badge>
          </div>
          <div className="text-2xl font-black text-white mb-1 italic font-mono tracking-tighter">{stat.value}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
