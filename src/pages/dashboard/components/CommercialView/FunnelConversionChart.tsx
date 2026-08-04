import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Filter, TrendingUp } from 'lucide-react';

interface FunnelStep {
  label: string;
  value: number;
  drop: number;
  color: string;
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">{message}</p>
    </div>
  );
}

interface FunnelConversionChartProps {
  funnelData: FunnelStep[];
  topConversionRate: number;
}

export function FunnelConversionChart({ funnelData, topConversionRate }: FunnelConversionChartProps) {
  const hasFunnel = funnelData.some(s => s.value > 0);
  const maxFunnelValue = funnelData[0]?.value || 1;

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5 relative overflow-hidden rounded-3xl">
        <h3 className="text-sm font-black text-white mb-8 uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" /> Funil de Conversão
        </h3>
        {!hasFunnel ? (
          <EmptyState icon={Filter} message="Nenhum lead cadastrado ainda. Adicione leads para ver o funil." />
        ) : (
          <div className="space-y-4">
            {funnelData.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{step.label}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-white">{step.value}</span>
                    {step.drop > 0 && <span className="text-[9px] font-black text-rose-500">-{step.drop}%</span>}
                  </div>
                </div>
                <div className="w-full h-8 bg-white/5 rounded-lg overflow-hidden relative border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.value / maxFunnelValue) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className={`h-full ${step.color} opacity-40`}
                  />
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                    <div className="flex-1" />
                    <div className="w-[1px] h-4 bg-white/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12">
          <TrendingUp className="w-16 h-16 text-blue-400" />
        </div>
        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Performance do Pipeline</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
          {hasFunnel
            ? `${funnelData[0].value} leads na prospecção. Taxa de conversão atual: ${topConversionRate}%.`
            : 'Cadastre leads e contratos para ver insights de performance do seu pipeline.'}
        </p>
      </Card>
    </div>
  );
}
