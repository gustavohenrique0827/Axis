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
          <Card className="p-6 bg-gradient-to-br from-[#1E293B]/40 to-[#0F172A]/80 border-white/5 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-3 rounded-2xl ${stat.bg} shadow-inner`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-right">
                <span className={`text-[10px] ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-end gap-0.5 bg-white/5 px-2 py-1 rounded-full border border-white/5`}>

                  {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <h2 className="text-3xl text-white tracking-tighter">{stat.value}</h2>

              <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</p>

                  <span className="text-[9px] text-slate-400 font-medium">Proj: {stat.forecast}</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 rotate-12 group-hover:rotate-0">
                <stat.icon className="w-32 h-32 text-white" />
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
