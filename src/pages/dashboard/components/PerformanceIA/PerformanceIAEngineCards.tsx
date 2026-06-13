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
      <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
          <Cpu className="w-16 h-16 text-blue-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
              Motor Neural v4.2
            </span>
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">Processamento Ativo</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Analisando pontos de dados em tempo real para identificação de gargalos de conversão.
          </p>
        </div>
      </Card>

      <Card className="p-8 bg-[#111827]/80 border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score de Saúde IA</h4>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="py-6 flex items-end gap-3 text-white">
          <span className="text-5xl font-black font-mono tracking-tighter">
            {simulationData.length > 0 ? "94" : "--"}
          </span>
          <span className="text-sm font-bold text-slate-500 mb-2">/100</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: simulationData.length > 0 ? "94%" : "0%" }}
            className="h-full bg-emerald-500"
          />
        </div>
      </Card>

      <Card className="p-8 bg-amber-500/10 border-amber-500/20 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Anomalias Detectadas</h4>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="py-6 flex items-end gap-3 text-white">
          <span className="text-5xl font-black font-mono tracking-tighter">
            {simulationData.length > 0 ? "02" : "00"}
          </span>
          <ArrowUpRight className="w-6 h-6 text-rose-500 mb-2" />
        </div>
        <p className="text-[10px] text-slate-400 font-bold italic tracking-tight">
          {simulationData.length > 0
            ? "Queda inesperada na velocidade de prospecção."
            : "Sem dados para análise de anomalias."}
        </p>
      </Card>
    </div>
  );
}

