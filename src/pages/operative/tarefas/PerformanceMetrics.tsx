import React from "react";
import { Card } from "../../../components/ui/card";
import { AlertTriangle } from "lucide-react";

interface PerformanceMetricsProps {
  completionRate: number;
  completedCount: number;
  totalCount: number;
  overdueCount: number;
  openCount: number;
  highPriorityCount: number;
}

export function PerformanceMetrics({
  completionRate,
  completedCount,
  totalCount,
  overdueCount,
  openCount,
  highPriorityCount
}: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-gradient-to-br from-[var(--color-surface-elevated)]/80 to-[var(--color-surface-elevated)]/50 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden group rounded-3xl">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#2563EB]/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Taxa de Conclusão</span>
          <div className="text-2xl md:text-3xl font-black text-white">{completionRate}%</div>
        </div>
        <div className="mt-4">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1.5 block font-medium">{completedCount} de {totalCount} concluídas</span>
        </div>
      </Card>

      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden rounded-3xl">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Atrasadas / Pendentes</span>
          <div className="text-2xl md:text-3xl font-black text-rose-400 flex items-center gap-2">
            {overdueCount}
            <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">Atrasadas</span>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-slate-500 font-medium">
          Exige atenção imediata de follow-up.
        </div>
      </Card>

      <Card className="p-4 bg-[var(--color-surface-elevated)]/80 border border-white/5 flex flex-col justify-between shadow-lg relative overflow-hidden rounded-3xl">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Em Aberto / Hoje</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 flex items-center gap-2">
            {openCount}
            <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-white/5 border border-white/5">Fluxo</span>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-slate-500 font-medium">
          Sincronizadas com agenda interna.
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-[var(--color-surface-elevated)]/80 to-[#991b1b]/10 border border-rose-500/10 flex flex-col justify-between shadow-lg relative overflow-hidden rounded-3xl">
        <div>
          <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest block mb-1">Urgente Alta Prioridade</span>
          <div className="text-2xl md:text-3xl font-black text-red-400 flex items-center gap-2">
            {highPriorityCount}
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
        </div>
        <div className="mt-4 text-[10px] text-red-400/80 font-semibold uppercase tracking-wider">
          Prioridade comercial máxima!
        </div>
      </Card>
    </div>
  );
}
