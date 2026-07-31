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
        <h2 className="text-3xl font-black text-white tracking-tighter">Logs de Auditoria</h2>
        <p className="text-sm text-slate-400 mt-1">Rastreabilidade completa de governança e movimentações de squad.</p>
      </div>

      <Card className="bg-[var(--color-surface-elevated)]/40 border-white/5 backdrop-blur-xl overflow-hidden rounded-3xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Histórico Governamental</h3>
            <p className="text-[10px] text-slate-500 mt-1">Visualização de mudanças globais de organização.</p>
          </div>
          <div className="relative">
            <input 
              placeholder="Pesquisar logs..." 
              className="bg-black/20 text-xs border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-blue-500 w-64 transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <History className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-slate-400">
            <thead className="text-slate-500 uppercase font-black tracking-[0.2em] bg-white/[0.02]">
              <tr>
                <th className="px-8 py-5">Data da Ocorrência</th>
                <th className="px-8 py-5">Participante</th>
                <th className="px-8 py-5">Origem (From)</th>
                <th className="px-8 py-5">Destino (To)</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {paginatedLogs.map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-slate-500 font-mono scale-95 group-hover:scale-100 transition-transform origin-left">{new Date(log.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                       <span className="text-white font-black">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-500 border border-white/5">{log.from}</span>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-2 text-blue-400 font-black">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 italic">{log.to}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10 tracking-widest">VALIDADO</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 flex justify-between items-center border-t border-white/5">
           <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Auditando {filteredLogs.length} incidentes encontrados</div>
           <div className="flex items-center gap-4">
             <Button 
               variant="outline" 
               size="sm" 
               className="border-white/5 bg-white/5 text-white disabled:opacity-20 rounded-xl h-10 px-6 font-black scale-95 hover:scale-100 transition-all"
               disabled={currentPage === 1} 
               onClick={() => setCurrentPage(p => p - 1)}
             >
               Anterior
             </Button>
             <span className="text-xs text-slate-500 font-mono tracking-tighter">
               <span className="text-white">{currentPage}</span> / {totalPages || 1}
             </span>
             <Button 
               variant="outline" 
               size="sm" 
               className="border-white/5 bg-white/5 text-white disabled:opacity-20 rounded-xl h-10 px-6 font-black scale-95 hover:scale-100 transition-all"
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
