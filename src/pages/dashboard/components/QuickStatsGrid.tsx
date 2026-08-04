import React from 'react';
import { Card } from '../../../components/ui/card';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuickStatsGridProps {
  stats: any[];
}

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
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <span className={`text-xs flex items-center gap-0.5 ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <span className="text-xs text-slate-500">Proj: {stat.forecast}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
