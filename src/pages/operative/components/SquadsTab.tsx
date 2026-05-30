import { motion, AnimatePresence } from "motion/react";
import { Users2, Target, ChevronDown, Users, Settings2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { TeamMember, Squad } from "../hooks/useEquipe";

interface SquadsTabProps {
  squads: Squad[];
  team: TeamMember[];
  expandedSquads: string[];
  toggleSquad: (squadName: string) => void;
  moveMember: (name: string, newSquad: string) => void;
}

export function SquadsTab({ squads, team, expandedSquads, toggleSquad, moveMember }: SquadsTabProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tighter">Gestão de Squads</h2>
        <p className="text-sm text-slate-400 mt-2">Células dinâmicas de conversão e atendimento especializado.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {squads.map(squad => {
          const members = team.filter(m => m.squad === squad.name);
          const isExpanded = expandedSquads.includes(squad.name);
          return (
            <div key={squad.name} className={`bg-[#111827]/40 border rounded-3xl overflow-hidden transition-all duration-500 ${isExpanded ? 'border-blue-500/20 shadow-2xl shadow-blue-500/5' : 'border-white/5'}`}>
              <button 
                className={`w-full flex items-center justify-between p-6 transition-all ${isExpanded ? 'bg-blue-600/[0.03]' : 'hover:bg-white/[0.02]'}`}
                onClick={() => toggleSquad(squad.name)}
              >
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 rotate-0' : 'bg-slate-800 text-slate-600 border border-white/5 rotate-[-10deg]'}`}>
                      {squad.name[0]}
                   </div>
                   <div className="text-left">
                      <span className="text-xl font-black text-white block tracking-tight">{squad.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] flex items-center gap-1.5"><Users2 className="w-3 h-3"/> {members.length} membros</span>
                        <span className="text-slate-700">&bull;</span>
                        <span className="text-[10px] text-blue-500 opacity-80 uppercase font-black tracking-[0.15em] flex items-center gap-1.5"><Target className="w-3 h-3"/> {members.reduce((acc, curr) => acc + (typeof curr.deals === 'number' ? curr.deals : parseInt(curr.deals as string) || 0), 0)} conversões</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Squad Lead</span>
                      <span className="text-xs text-white font-bold">{squad.leader}</span>
                   </div>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-blue-600/10 text-blue-500' : ''}`}>
                     <ChevronDown className="w-5 h-5" />
                   </div>
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="border-t border-white/5"
                  >
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Composição Atual</h4>
                        <div className="space-y-2">
                          {members.map(m => (
                            <div key={m.name} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">
                                    {m.name.split(' ').map(n=>n[0]).join('')}
                                  </div>
                                  <div>
                                     <div className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">{m.name}</div>
                                     <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{m.role}</div>
                                  </div>
                               </div>
                               <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-white/10"><Settings2 className="w-4 h-4 text-slate-500" /></Button>
                            </div>
                          ))}
                          {members.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                               <Users className="w-8 h-8 text-slate-700 mb-2" />
                               <span className="text-xs text-slate-600 font-bold">Nenhum membro alocado</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                          Reorganização Operacional
                          <span className="text-[9px] lowercase font-medium text-slate-600">Mover membros de outras squads</span>
                        </h4>
                        <div className="p-6 bg-black/20 rounded-3xl border border-white/5 space-y-4">
                           <select 
                             className="w-full bg-[#0B1120] text-xs font-bold border border-white/10 p-3 rounded-2xl text-white outline-none focus:border-blue-500 transition-all appearance-none"
                             onChange={(e) => {
                               const name = e.target.value;
                               if (name && name !== 'Selecionar colaborador...') moveMember(name, squad.name);
                             }}
                           >
                             <option value="">Selecionar colaborador...</option>
                             {team.filter(m => m.squad !== squad.name).map(m => m.name).map(n => <option key={n} value={n}>{n}</option>)}
                           </select>
                           <p className="text-[10px] text-slate-500 leading-relaxed italic px-2">Ao mover um colaborador, a alteração será imediatamente refletida nos KPIs da squad e registrada no log de auditoria global.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
