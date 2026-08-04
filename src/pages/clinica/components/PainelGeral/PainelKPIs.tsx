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
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            {stat.trend && (
              <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.trend}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
