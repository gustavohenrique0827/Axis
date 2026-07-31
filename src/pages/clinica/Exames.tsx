import React from 'react';
import {
  FileText, Search, FlaskConical,
  Clock, CheckCircle2, AlertCircle, Download,
  Eye, Plus, Share2
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useExames } from './hooks/useExames';

export default function Exames() {
  const { exames: examList } = useExames();

  return (
    <PageContainer 
      title="Exames & Laboratório" 
      description="Gerencie pedidos de exames, acompanhe resultados e integre com laboratórios parceiros."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
              <Download className="w-4 h-4" /> Exportar Lote
           </Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" /> Novo Pedido
           </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Status Hub */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Pedidos Hoje", value: "42", icon: FlaskConical, color: "text-blue-400" },
             { label: "Resultados Prontos", value: "18", icon: CheckCircle2, color: "text-emerald-400" },
             { label: "Em Análise", value: "12", icon: Clock, color: "text-amber-400" },
             { label: "Resultados Críticos", value: "05", icon: AlertCircle, color: "text-rose-400" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/80 border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-white/5">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white font-mono">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-2">{stat.label}</p>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Exams Table */}
           <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)]/80 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Histórico de Pedidos
                 </h3>
                 <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar exames..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none"
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Paciente</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exame</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {examList.map((exam) => (
                         <tr key={exam.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6">
                               <p className="text-sm font-black text-white">{exam.patient}</p>
                               <p className="text-[10px] text-slate-500 font-bold">{exam.lab}</p>
                            </td>
                            <td className="p-6 text-xs text-slate-300 font-medium">{exam.exam}</td>
                            <td className="p-6 text-xs text-slate-500 font-mono italic">{exam.date}</td>
                            <td className="p-6">
                               <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                 exam.status === 'Finalizado' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                                 exam.status === 'Em Análise' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                                 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                               }`}>
                                  {exam.status}
                               </span>
                            </td>
                            <td className="p-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Eye className="w-4 h-4" /></button>
                                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Share2 className="w-4 h-4" /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* AI Insight Section */}
           <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20 relative group">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" /> MIA Lab Insights
                 </h3>
                 <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] text-emerald-400 font-black uppercase mb-1">Análise de Tendência</p>
                       <p className="text-xs text-slate-300 italic leading-relaxed">
                          "Houve um aumento de 15% em pedidos de exames tireoidianos este mês. Sugerimos integrar com o laboratório parceiro Beta para otimizar prazos."
                       </p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] text-slate-500 font-black uppercase border-b border-white/5 pb-2">Pendências Urgentes</p>
                       {[
                         { item: "Hemoglobina Glicada", days: "2 dias atrasado" },
                         { item: "Colesterol Total", days: "Hoje" },
                       ].map((p, i) => (
                         <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400">{p.item}</span>
                            <span className="text-amber-500 font-black tracking-tighter">{p.days}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>

              <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Integrações API</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center group hover:border-emerald-500/30 transition-all">
                       <div className="w-8 h-8 rounded-full bg-blue-600/20 mb-3 flex items-center justify-center text-blue-400 font-black text-xs">HL7</div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Protocolo HL7/V2</span>
                    </button>
                    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center group hover:border-emerald-500/30 transition-all">
                       <div className="w-8 h-8 rounded-full bg-emerald-600/20 mb-3 flex items-center justify-center text-emerald-400 font-black text-xs">DICOM</div>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Visualizador DICOM</span>
                    </button>
                 </div>
              </Card>
           </div>
        </div>

      </div>
    </PageContainer>
  );
}
