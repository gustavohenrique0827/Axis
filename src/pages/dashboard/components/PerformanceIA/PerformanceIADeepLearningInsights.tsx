import { motion } from "motion/react";
import { Network } from "lucide-react";

import { Card } from "@/src/components/ui/card";

type SimulationRow = {
  name: string;
  mrr: number;
  cac: number;
  ltv: number;
};

type Props = {
  simulationData: SimulationRow[];
};

// Mostra o quanto cada cenário do simulador projeta de MRR acima do atual —
// dado real (deriva de simulationData, calculado a partir de MRR/CAC reais),
// em vez de métricas de "uso de app"/"SLA de suporte" que o sistema não mede.
export function PerformanceIADeepLearningInsights({
  simulationData,
}: Props) {
  const atual = simulationData.find(r => r.name === "Atual");
  const cenarios = simulationData.filter(r => r.name !== "Atual");
  const maxUplift = atual && atual.mrr > 0
    ? Math.max(...cenarios.map(c => ((c.mrr - atual.mrr) / atual.mrr) * 100), 0)
    : 0;

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <Card className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6">
          <Network className="w-5 h-5 text-indigo-400" />
          <h4 className="text-[11px] font-black text-white uppercase tracking-widest">
            Potencial de Crescimento por Cenário
          </h4>
        </div>

        {!atual || cenarios.length === 0 ? (
          <p className="text-[10px] text-slate-500">Sem dados de MRR/CAC suficientes para simular cenários ainda.</p>
        ) : (
          <div className="space-y-4">
            {cenarios.map((c, i) => {
              const uplift = atual.mrr > 0 ? ((c.mrr - atual.mrr) / atual.mrr) * 100 : 0;
              const barWidth = maxUplift > 0 ? (uplift / maxUplift) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 px-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      {c.name}
                    </span>
                    <span className="text-[9px] font-black text-white">
                      +{uplift.toFixed(0)}% MRR
                    </span>
                  </div>

                  <div className="w-full h-1 bg-white/5 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
