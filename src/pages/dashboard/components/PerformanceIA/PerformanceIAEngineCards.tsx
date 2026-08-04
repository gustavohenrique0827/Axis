import { motion } from "motion/react";
import { Card } from "../../../../components/ui/card";
import { Cpu, ShieldCheck, AlertTriangle, ArrowUpRight } from "lucide-react";

export function PerformanceIAEngineCards(props: {
  simulationData: any[];
  isSimulating: boolean;
}) {
  const { simulationData } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-400">
            Motor Neural v4.2
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Cpu className="w-4 h-4" />
          <h3 className="text-sm text-white">Processamento Ativo</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Analisando pontos de dados em tempo real para identificação de gargalos de conversão.
        </p>
      </Card>

      <Card className="p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs">Score de Saúde IA</h4>
          </div>
        </div>
        <div className="py-4 flex items-end gap-2 text-white">
          <span className="text-2xl font-semibold">
            {simulationData.length > 0 ? "94" : "--"}
          </span>
          <span className="text-xs text-slate-500 mb-1">/100</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: simulationData.length > 0 ? "94%" : "0%" }}
            className="h-full bg-emerald-500"
          />
        </div>
      </Card>

      <Card className="p-6 flex flex-col justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <AlertTriangle className="w-4 h-4" />
          <h4 className="text-xs">Anomalias Detectadas</h4>
        </div>
        <div className="py-4 flex items-end gap-2 text-white">
          <span className="text-2xl font-semibold">
            {simulationData.length > 0 ? "02" : "00"}
          </span>
          <ArrowUpRight className="w-4 h-4 text-rose-400 mb-1" />
        </div>
        <p className="text-xs text-slate-500">
          {simulationData.length > 0
            ? "Queda inesperada na velocidade de prospecção."
            : "Sem dados para análise de anomalias."}
        </p>
      </Card>
    </div>
  );
}
