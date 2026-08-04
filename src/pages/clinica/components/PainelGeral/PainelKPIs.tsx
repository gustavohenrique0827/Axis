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

const ICON_COLORS = ["text-indigo-500", "text-emerald-500", "text-blue-500", "text-rose-500", "text-amber-500", "text-cyan-500", "text-purple-500"];

export function PainelKPIs({ stats }: PainelKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
          <stat.icon className={`w-5 h-5 ${ICON_COLORS[i % ICON_COLORS.length]} mb-4`} />
          <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          {stat.trend && (
            <div className={`text-xs mt-1 ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stat.trend}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
