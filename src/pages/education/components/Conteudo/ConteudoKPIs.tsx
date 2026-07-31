import { Card } from "../../../../components/ui/card";
import { Layers, Globe, Star, Download } from "lucide-react";

interface ContentStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface ConteudoKPIsProps {
  stats: ContentStat[];
}

export function ConteudoKPIs({ stats }: ConteudoKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all">
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
