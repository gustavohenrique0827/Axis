import React from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { History } from "lucide-react";
import { AuditLog } from "../hooks/useEquipe";

interface LogsTabProps {
  paginatedLogs: AuditLog[];
  filteredLogs: AuditLog[];
  filter: string;
  setFilter: (filter: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function LogsTab({
  paginatedLogs,
  filteredLogs,
  filter,
  setFilter,
  currentPage,
  setCurrentPage,
  totalPages,
}: LogsTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Logs de Auditoria</h2>
        <p className="text-sm text-slate-400 mt-1">Rastreabilidade completa de governança e movimentações de squad.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white-text/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Histórico Governamental</h3>
            <p className="text-xs text-slate-500 mt-1">Visualização de mudanças globais de organização.</p>
          </div>
          <div className="relative">
            <input
              placeholder="Pesquisar logs..."
              className="bg-black/20 text-xs border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-white/30 w-64 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <History className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="text-slate-500 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-3">Data da Ocorrência</th>
                <th className="px-6 py-3">Participante</th>
                <th className="px-6 py-3">Origem (From)</th>
                <th className="px-6 py-3">Destino (To)</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedLogs.map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono">{new Date(log.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                       <span className="text-white">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400">{log.from}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300">{log.to}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="flex items-center gap-1.5 text-slate-300">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Validado
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex justify-between items-center border-t border-white-text/10">
           <div className="text-xs text-slate-500">Auditando {filteredLogs.length} incidentes encontrados</div>
           <div className="flex items-center gap-4">
             <Button
               variant="outline"
               size="sm"
               disabled={currentPage === 1}
               onClick={() => setCurrentPage(p => p - 1)}
             >
               Anterior
             </Button>
             <span className="text-xs text-slate-500 font-mono">
               <span className="text-white">{currentPage}</span> / {totalPages || 1}
             </span>
             <Button
               variant="outline"
               size="sm"
               disabled={currentPage === totalPages || totalPages === 0}
               onClick={() => setCurrentPage(p => p + 1)}
             >
               Próxima
             </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
