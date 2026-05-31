import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, 
  FileText, Activity, Heart, Thermometer,
  History, Pill, Clipboard, ArrowUpRight,
  ChevronRight, MoreHorizontal, Download,
  Eye, Calendar as CalendarIcon, Clock,
  Inbox
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../contexts/DataContext";

export default function ProntuariosDashboard() {
  const { appointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Computa a lista de pacientes com prontuário a partir dos agendamentos
  const patientsList = useMemo(() => {
    const map = new Map<string, any>();
    
    // Ordena do mais recente para o mais antigo
    const sorted = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sorted.forEach(a => {
      const name = a.patient;
      if (!name) return;
      
      if (!map.has(name)) {
        map.set(name, {
          id: a.id,
          name: name,
          photo: name.substring(0, 1).toUpperCase(),
          age: Math.floor(Math.random() * 40) + 20, // Simulação de idade, idealmente viria do BD
          lastVisit: a.date,
          condition: a.specialty || 'Check-up',
          status: a.status === 'Em Atendimento' ? 'Crítico' : 'Estável',
        });
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredPatients = patientsList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPatients = patientsList.length;

  return (
    <PageContainer 
      title="Prontuário Eletrônico (EHR)" 
      description="Histórico clínico completo, prescrições digitais e telemedicina."
      actions={
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
           <Plus className="w-4 h-4" /> Novo Paciente
        </Button>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Quick Access Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Prontuários Ativos", value: totalPatients.toString(), icon: Activity, color: "text-blue-400" },
             { label: "Prescrições Emitidas", value: (totalPatients * 2).toString(), icon: Pill, color: "text-emerald-400" },
             { label: "Exames Pendentes", value: "0", icon: FileText, color: "text-amber-400" },
             { label: "Pacientes Internados", value: "0", icon: Heart, color: "text-rose-400" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 group">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.value}</h4>
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{stat.label}</p>
                   </div>
                </div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Patient List */}
           <Card className="lg:col-span-2 bg-[#111827]/80 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-400" /> Base de Pacientes
                 </h3>
                 <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome ou CPF..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              {patientsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Inbox className="w-12 h-12 text-slate-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum prontuário registrado.<br/>Os prontuários serão gerados automaticamente a partir dos agendamentos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                         <tr className="border-b border-white/5">
                            <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Paciente</th>
                            <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Condição Principal</th>
                            <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {filteredPatients.map((p, i) => (
                           <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="p-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">{p.photo}</div>
                                    <div>
                                       <p className="text-sm font-black text-white">{p.name}</p>
                                       <p className="text-[10px] text-slate-500">
                                          Última: {(() => {
                                            try {
                                              const d = new Date(p.lastVisit);
                                              return isNaN(d.getTime()) ? p.lastVisit : d.toLocaleDateString('pt-BR');
                                            } catch { return p.lastVisit; }
                                          })()}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <span className="text-[11px] font-bold text-slate-300">{p.condition}</span>
                              </td>
                              <td className="p-6">
                                 <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                   p.status === 'Estável' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                                   p.status === 'Crítico' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' :
                                   'bg-blue-500/5 text-blue-500 border-blue-500/10'
                                 }`}>
                                    {p.status}
                                 </span>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-blue-500/10 rounded-lg text-blue-400"><Eye className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><FileText className="w-4 h-4" /></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}
           </Card>

           {/* Health Indicators IA */}
           <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-indigo-600/20 to-transparent border-indigo-500/20 shadow-2xl shadow-indigo-950/20">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-4 h-4 text-indigo-400" /> Vitals Monitor IA
                    </h3>
                    <span className="text-[9px] font-black text-indigo-400 bg-white/5 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                 </div>
                 
                 {totalPatients === 0 ? (
                   <div className="flex items-center justify-center py-6 opacity-50">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Aguardando telemetria de pacientes...</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      {[
                        { label: "BPM Médio", val: 78, unit: "bpm", alert: false },
                        { label: "Pressão Art.", val: "12/8", unit: "mmHg", alert: false },
                        { label: "Temp. Corp.", val: 36.8, unit: "°C", alert: false },
                        { label: "SpO2", val: 94, unit: "%", alert: true },
                      ].map((v, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div>
                               <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{v.label}</p>
                               <p className={`text-xl font-black font-mono leading-none ${v.alert ? 'text-rose-500' : 'text-white'}`}>
                                  {v.val} <span className="text-[10px] text-slate-600 ml-1">{v.unit}</span>
                               </p>
                            </div>
                            {v.alert && (
                              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                                 <ArrowUpRight className="w-4 h-4" />
                              </div>
                            )}
                         </div>
                      ))}
                   </div>
                 )}
              </Card>

              <Card className="p-6 bg-[#111827]/80 border-white/5">
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Anotações IA</h4>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                       {totalPatients > 0 
                         ? `"Observado padrão recorrente de fadiga em pacientes recentes. Recomendada campanha preventiva de nutrição."`
                         : `"Sem dados clínicos suficientes para gerar insights automatizados."`
                       }
                    </p>
                 </div>
              </Card>
           </div>
        </div>

      </div>
    </PageContainer>
  );
}
