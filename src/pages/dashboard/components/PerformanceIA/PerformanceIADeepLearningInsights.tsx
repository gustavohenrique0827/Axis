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

export function PerformanceIADeepLearningInsights({
  simulationData,
}: Props) {
  const insights = [
    {
      label: "Uso de App",
      val: simulationData.length > 0 ? 92 : 0,
      status: "Crítico" as const,
    },
    {
      label: "Suporte SLA",
      val: simulationData.length > 0 ? 12 : 0,
      status: "Normal" as const,
    },
    {
      label: "Ticket Médio",
      val: simulationData.length > 0 ? 45 : 0,
      status: "Medio" as const,
    },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Network className="w-4 h-4" />
          <h4 className="text-sm">
            Correlação de Churn
          </h4>
        </div>

        <div className="space-y-3">
          {insights.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5 px-0.5">
                <span className="text-xs text-slate-500">
                  {c.label}
                </span>
                <span className="text-xs text-white">
                  {c.val}%
                </span>
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.val}%` }}
                  className={`h-full rounded-full ${
                    c.status === "Crítico" ? "bg-rose-500" : "bg-slate-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
