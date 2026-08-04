import React from 'react';
import { Card } from '../../../components/ui/card';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuickStatsGridProps {
  stats: any[];
}

const ICON_COLORS = ["text-indigo-500", "text-emerald-500", "text-blue-500", "text-rose-500"];

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <motion.div
      key="stats-grid"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-5 h-5 ${ICON_COLORS[i % ICON_COLORS.length]}`} />
              <span className={`text-xs flex items-center gap-0.5 ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
            <div className="text-[10px] text-slate-600 mt-1">Proj: {stat.forecast}</div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
