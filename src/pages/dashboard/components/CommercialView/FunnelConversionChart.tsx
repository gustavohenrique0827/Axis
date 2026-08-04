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
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-sm text-slate-500">{message}</p>
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
      <Card className="p-6">
        <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Funil de Conversão
        </h3>
        {!hasFunnel ? (
          <EmptyState icon={Filter} message="Nenhum lead cadastrado ainda. Adicione leads para ver o funil." />
        ) : (
          <div className="space-y-4">
            {funnelData.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <p className="text-xs text-slate-400">{step.label}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white">{step.value}</span>
                    {step.drop > 0 && <span className="text-xs text-rose-400">-{step.drop}%</span>}
                  </div>
                </div>
                <div className="w-full h-8 bg-white/5 rounded-lg overflow-hidden relative border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.value / maxFunnelValue) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="h-full bg-slate-400/40"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h4 className="text-xs text-slate-400 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Performance do Pipeline
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {hasFunnel
            ? `${funnelData[0].value} leads na prospecção. Taxa de conversão atual: ${topConversionRate}%.`
            : 'Cadastre leads e contratos para ver insights de performance do seu pipeline.'}
        </p>
      </Card>
    </div>
  );
}
