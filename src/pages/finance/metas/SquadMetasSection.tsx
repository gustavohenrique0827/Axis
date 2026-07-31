import React, { useEffect } from "react";
import { 
  Sparkles, ShieldCheck, Play, RotateCcw, Flame
} from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { SquadMeta } from "./useFinanceiroMetas";

// CountUp component using motion/react
function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Math.round(latest).toLocaleString("pt-BR")
  );
  
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

interface SquadMetasSectionProps {
  period: "monthly" | "quarterly" | "annual";
  squads: SquadMeta[];
  calculateOTE: (squad: SquadMeta) => { base: number; bonus: number; total: number };
  handleSliderChange: (squadId: string, value: number) => void;
}

export function SquadMetasSection({
  period,
  squads,
  calculateOTE,
  handleSliderChange
}: SquadMetasSectionProps) {
  return (
    <div className="xl:col-span-2 p-6 border-white/5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl flex flex-col justify-between rounded-3xl">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Status & Alocação de Squads</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Definição, ajuste de progresso e comissão do time</p>
          </div>
          <span className="bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-xl">
            Ajuste os Sliders para simular faturamentos
          </span>
        </div>

        <div className="space-y-6">
          {squads.map((squad) => {
            const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
            const metaReal = squad.meta * mult;
            const faturamentoReal = squad.faturamento * mult;
            
            const pct = Math.min(100, Math.round((faturamentoReal / metaReal) * 100));
            const ote = calculateOTE(squad);

            return (
              <div key={squad.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                {/* Top title and team distribution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-tight">{squad.name}</span>
                      {faturamentoReal >= metaReal && (
                        <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider animate-bounce">
                          <Sparkles className="w-2.5 h-2.5" /> Meta Batida
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">Foco Comercial: {squad.focus}</span>
                  </div>
                  
                  {/* Technical team allocation */}
                  <div className="flex gap-2 text-[9px] text-slate-500 font-bold font-mono">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                      💼 Closers: {squad.closers}
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                      🎙️ SDRs: {squad.sdrs}
                    </span>
                  </div>
                </div>

                {/* Progress details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  
                  {/* Slide slider wrapper */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Progresso faturado</span>
                      <span>{pct}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max={metaReal * 1.5}
                      step={metaReal / 100}
                      value={faturamentoReal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const originalScale = val / mult;
                        handleSliderChange(squad.id, originalScale);
                      }}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#2563EB] focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold pt-1">
                      <span>R$ 0</span>
                      <span>Meta: R$ {metaReal.toLocaleString("pt-BR")}</span>
                      <span>Max: R$ {(metaReal * 1.5).toLocaleString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Financial info summary */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Realizado</span>
                    <span className="text-xs font-mono font-extrabold text-white block mt-0.5">
                      R$ <CountUp value={faturamentoReal} />
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Faltando R$ {Math.max(0, metaReal - faturamentoReal).toLocaleString()}
                    </span>
                  </div>

                  {/* Calculated OTE distribution */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                    <span className="text-[9px] text-[#2563EB] font-bold uppercase tracking-wider block">Comissão + Bônus</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400 block mt-0.5">
                      R$ {ote.total.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                      Base {squad.comissaoPercent}% • Ext {ote.bonus > 0 ? "R$ " + ote.bonus.toLocaleString() : "Bloqueado"}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          Garantia do Acordo de Nível de Serviço (SLA) SDR ➔ Closer estabelecido por comissões escaláveis por aceitabilidade.
        </span>
        <span className="text-blue-400 font-black font-mono">Axis SaaS OTE Engine v1.4</span>
      </div>
    </div>
  );
}
