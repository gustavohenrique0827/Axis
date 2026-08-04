import React from "react";
import { Card } from "../../../components/ui/card";
import { CheckCircle2, Clock, Inbox, AlertTriangle } from "lucide-react";

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
      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs">Taxa de Conclusão</span>
        </div>
        <p className="text-2xl font-semibold text-white">{completionRate}%</p>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">{completedCount} de {totalCount} concluídas</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Atrasadas / Pendentes</span>
        </div>
        <p className="text-2xl font-semibold text-white">{overdueCount}</p>
        <p className="text-xs text-slate-500 mt-2">Exige atenção imediata de follow-up.</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Inbox className="w-4 h-4" />
          <span className="text-xs">Em Aberto / Hoje</span>
        </div>
        <p className="text-2xl font-semibold text-white">{openCount}</p>
        <p className="text-xs text-slate-500 mt-2">Sincronizadas com agenda interna.</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">Alta Prioridade</span>
        </div>
        <p className="text-2xl font-semibold text-white">{highPriorityCount}</p>
        <p className="text-xs text-slate-500 mt-2">Prioridade comercial máxima.</p>
      </Card>
    </div>
  );
}
