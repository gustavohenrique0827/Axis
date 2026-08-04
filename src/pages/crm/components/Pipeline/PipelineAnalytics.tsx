import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ResponsiveContainer, BarChart, XAxis, Tooltip, Bar, Cell } from 'recharts';
import { Activity, Download } from 'lucide-react';


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
    <div className="overflow-hidden text-left">
      <Card className="p-6 bg-[var(--color-surface-elevated)]/80 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-6 mb-2">
        <div className="flex-1 min-h-[200px]">
          <h4 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" /> Distribuição Financeira por Fase
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analyticsData}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
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
          <h4 className="text-sm text-slate-400 mb-4">Relatórios</h4>
          <Button onClick={exportPDF} variant="subtle" className="w-full gap-2">
            <Download className="w-4 h-4" /> Exportar PDF Completo
          </Button>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
             <p className="text-xs text-slate-400 mb-1">Previsão IA</p>
             <p className="text-xs text-slate-300">Alta probabilidade de fechamento nas próximas 48h para 3 leads.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
