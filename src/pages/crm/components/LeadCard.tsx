import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import {
  Phone, Mail, Flame, MoreVertical, Calendar, FileText,
  History, ArrowRight, FileDown, Activity, Brain, Zap
} from 'lucide-react';
import { RevenueIntelligenceModal } from './RevenueIntelligenceModal';

interface LeadCardProps {
  item: any;
  tasks: any[];
  draggedLeadId: string | null;
  setDraggedLeadId: (id: string | null) => void;
  updateLead: (id: string, updates: Partial<any>) => void;
  tempDropdownId: string | null;
  setTempDropdownId: (id: string | null) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  setSelectedLead: (lead: any) => void;
  handleTransferToComercial: (e: any, lead: any) => void;
  handleExportIAResume: (e: any, lead: any) => void;
  setWebhookModalLead: (lead: any) => void;
  currentPipeline: 'comercial' | 'sdr';
  stageName?: string;
  pipelineName?: string;
}

export function LeadCard({
  item,
  tasks,
  draggedLeadId,
  setDraggedLeadId,
  updateLead,
  tempDropdownId,
  setTempDropdownId,
  openDropdownId,
  setOpenDropdownId,
  setSelectedLead,
  handleTransferToComercial,
  handleExportIAResume,
  setWebhookModalLead,
  currentPipeline,
  stageName = '',
  pipelineName = '',
}: LeadCardProps) {
  const [showRIModal, setShowRIModal] = useState(false);
  const hasDelayedTask = tasks.some(t => (t.related === item.name || t.related === item.company) && t.status === 'Atrasado');
  const isDragging = draggedLeadId === item.id;

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "Alta": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Média": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Baixa": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "LD";
  };

  return (
    <Card 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        setDraggedLeadId(item.id);
      }}
      className={`p-4 bg-[#111827]/80 border border-white/5 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group text-left ${
        isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
      } ${
        item.priority === 'Alta' ? 'border-rose-500/30' : ''
      }`}
      onClick={() => setSelectedLead(item)}
    >
      {hasDelayedTask && (
        <div className="absolute top-3 right-3 flex items-center justify-center pointer-events-none" title="Tarefa Atrasada">
          <span className="absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-rose-500 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-black text-blue-400 border border-blue-500/30 shrink-0" title={`Responsável: ${item.seller || "Não atribuído"}`}>
              {getInitials(item.seller)}
           </div>
           <div className="relative">
             <button 
               onClick={(e) => { e.stopPropagation(); setTempDropdownId(tempDropdownId === item.id ? null : item.id); }}
               className="flex items-center justify-center p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded border-none bg-transparent cursor-pointer"
               title={`Temperatura: ${item.temperature || 'frio'}`}
             >
               {item.temperature === 'quente' ? <Flame className="w-3.5 h-3.5 text-rose-500" /> : 
                item.temperature === 'morno' ? <Flame className="w-3.5 h-3.5 text-amber-500" /> :
                <Flame className="w-3.5 h-3.5 text-blue-500" />}
             </button>
             {tempDropdownId === item.id && (
               <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setTempDropdownId(null); }} />
                  <div className="absolute left-0 top-full mt-1 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex gap-1 cursor-default animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => { updateLead(item.id, { temperature: 'quente' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-rose-500 border-none bg-transparent cursor-pointer" title="Quente"><Flame className="w-4 h-4" /></button>
                     <button onClick={() => { updateLead(item.id, { temperature: 'morno' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-amber-500 border-none bg-transparent cursor-pointer" title="Morno"><Flame className="w-4 h-4" /></button>
                     <button onClick={() => { updateLead(item.id, { temperature: 'frio' }); setTempDropdownId(null); }} className="p-2 hover:bg-white/5 rounded-lg text-blue-500 border-none bg-transparent cursor-pointer" title="Frio"><Flame className="w-4 h-4" /></button>
                  </div>
               </>
             )}
           </div>
         </div>
         
         <div className="flex gap-2 items-center">
           <div className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${getPriorityColor(item.priority)}`}>
             {item.priority}
           </div>
           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button className="p-1 text-slate-500 hover:text-emerald-400 border-none bg-transparent cursor-pointer"><Phone className="w-3 h-3" /></button>
              <button className="p-1 text-slate-500 hover:text-blue-400 border-none bg-transparent cursor-pointer"><Mail className="w-3 h-3" /></button>
           </div>
           <div className="relative shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                }} 
                className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors border-none bg-transparent cursor-pointer"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              {openDropdownId === item.id && (
                <>
                   <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                   <div className="absolute right-0 top-full mt-1 w-52 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-left">
                         <Calendar className="w-3.5 h-3.5" /> Agendar Follow-up
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-left">
                         <FileText className="w-3.5 h-3.5" /> Enviar Proposta
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setSelectedLead(item); }} className="flex items-center gap-2 w-full p-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors border-none bg-transparent cursor-pointer text-left">
                         <History className="w-3.5 h-3.5" /> Ver Histórico
                      </button>
                      
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setShowRIModal(true); }}
                        className="flex items-center gap-2 w-full p-2 hover:bg-blue-500/10 rounded-lg text-xs font-medium text-blue-400 transition-colors border-none bg-transparent cursor-pointer text-left"
                      >
                        <Brain className="w-3.5 h-3.5 shrink-0" /> Analisar Ligação IA
                      </button>

                      {currentPipeline === 'sdr' && (
                        <>
                          <div className="h-px bg-white/5 my-1" />
                          <button onClick={(e) => handleTransferToComercial(e, item)} className="flex items-center gap-2 w-full p-2 hover:bg-blue-500/10 rounded-lg text-xs font-medium text-blue-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                             <ArrowRight className="w-3.5 h-3.5 shrink-0" /> Transf. Inteligente
                          </button>
                          <button onClick={(e) => handleExportIAResume(e, item)} className="flex items-center gap-2 w-full p-2 hover:bg-emerald-500/10 rounded-lg text-xs font-medium text-emerald-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                             <FileDown className="w-3.5 h-3.5 shrink-0" /> Exportar Resumo IA
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); setWebhookModalLead(item); }} className="flex items-center gap-2 w-full p-2 hover:bg-purple-500/10 rounded-lg text-xs font-medium text-purple-400 transition-colors border-none bg-transparent cursor-pointer text-left">
                             <Activity className="w-3.5 h-3.5 shrink-0" /> Configurar Webhook SDR
                          </button>
                        </>
                      )}
                   </div>
                </>
              )}
           </div>
         </div>
      </div>
      <h4 className="font-bold text-sm text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.name}</h4>
      <p className="text-[10px] text-slate-500 truncate mb-2">{item.company}</p>
      
      <div 
        className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2 py-1.5 rounded-lg w-fit mb-3 cursor-pointer transition-colors"
        onClick={(e) => { e.stopPropagation(); }}
        title="Interagir com IA Master"
      >
        <Brain className="w-3 h-3 text-blue-400 group-hover:text-white" />
        <span className="text-[9px] font-bold text-blue-400 group-hover:text-white uppercase tracking-widest">
           {item.status === 'IA Analisando' ? 'Analisando' : (item.temperature === 'quente' ? 'Qualificado' : 'Em Nutrição')}
        </span>
      </div>
      
      {currentPipeline === 'sdr' && (
        <div className="mb-3 space-y-2">
           <div className="flex items-center gap-2">
              <Zap className={`w-3.5 h-3.5 ${item.scoreIA && item.scoreIA > 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${item.scoreIA && item.scoreIA > 80 ? 'bg-emerald-500' : item.scoreIA && item.scoreIA > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                   style={{ width: `${item.scoreIA || 45}%` }}
                 />
              </div>
              <span className="text-[10px] font-black text-slate-300">{item.scoreIA || 45}%</span>
           </div>
           <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">IA ANALISADO</span>
              <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded whitespace-nowrap truncate max-w-[100px]">{item.temperature === 'quente' ? 'ALTA INTENÇÃO' : 'NUTRIÇÃO'}</span>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
         <span className="font-mono font-bold text-emerald-400/80">{item.value || "R$ 0"}</span>
         
         <div className="flex items-center gap-2">
           {item.timeIdle !== undefined && (
             <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
               item.timeIdle > 7 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'
             }`} title="Tempo sem interação">
               ⏳ {item.timeIdle}d idle
             </span>
           )}
           <span className="text-[9px]">{item.seller?.split(' ')[0]}</span>
         </div>
      </div>

      {showRIModal && (
        <RevenueIntelligenceModal
          lead={item}
          stageName={stageName}
          pipelineName={pipelineName}
          onClose={() => setShowRIModal(false)}
        />
      )}
    </Card>
  );
}
