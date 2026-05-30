import React from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ResponsiveContainer, BarChart, XAxis, Tooltip, Bar, Cell } from 'recharts';
import { Activity, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface PipelineAnalyticsProps {
  showAnalytics: boolean;
  analyticsData: any[];
  exportPDF: () => void;
}

export function PipelineAnalytics({
  showAnalytics,
  analyticsData,
  exportPDF
}: PipelineAnalyticsProps) {
  if (!showAnalytics) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden text-left"
    >
      <Card className="p-6 bg-[#111827]/80 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-6 mb-2">
        <div className="flex-1 min-h-[200px]">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Distribuição Financeira por Fase
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analyticsData}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {analyticsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-64 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Relatórios</h4>
          <Button onClick={exportPDF} className="w-full bg-white/5 border border-white/10 text-xs font-bold h-10 rounded-xl hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 bg-transparent text-slate-300">
            <Download className="w-4 h-4" /> Exportar PDF Completo
          </Button>
          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
             <p className="text-[9px] text-blue-400 font-bold uppercase mb-1">Previsão IA</p>
             <p className="text-xs text-slate-300 font-medium">Alta probabilidade de fechamento nas próximas 48h para 3 leads.</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
