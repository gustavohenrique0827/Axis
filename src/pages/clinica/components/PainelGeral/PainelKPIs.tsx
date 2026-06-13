import type { ComponentType } from 'react';
import { Card } from "../../../../components/ui/card";

interface Stat {
  label: string;
  value: string;
  trend: string | null;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

interface PainelKPIsProps { stats: Stat[]; }

export function PainelKPIs({ stats }: PainelKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl group overflow-hidden relative">
          <div className="flex items-center justify-between relative z-10">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            {stat.trend && (
              <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} bg-white/5 px-2 py-1 rounded-full`}>
                {stat.trend}
              </span>
            )}
          </div>
          <div className="mt-6 relative z-10">
            <h3 className="text-3xl font-black text-white font-mono tracking-tighter italic">{stat.value}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">{stat.label}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <stat.icon className="w-24 h-24 text-white" />
          </div>
        </Card>
      ))}
    </div>
  );
}
