import React from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Paperclip, FileText, Phone, Mail, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface TimelineSectionProps {
  lead: any;
  leadActivities: any[];
  activityType: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro';
  setActivityType: (val: any) => void;
  activityTitle: string;
  setActivityTitle: (val: string) => void;
  activityDate: string;
  setActivityDate: (val: string) => void;
  activityTime: string;
  setActivityTime: (val: string) => void;
  activityDesc: string;
  setActivityDesc: (val: string) => void;
  activityError: string;
  setActivityError: (val: string) => void;
  selectedFiles: { name: string; size: string; }[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<{ name: string; size: string; }[]>>;
  handleRegisterActivity: () => void;
  seller: string;
}

export function TimelineSection({
  lead,
  leadActivities,
  activityType,
  setActivityType,
  activityTitle,
  setActivityTitle,
  activityDate,
  setActivityDate,
  activityTime,
  setActivityTime,
  activityDesc,
  setActivityDesc,
  activityError,
  setActivityError,
  selectedFiles,
  setSelectedFiles,
  handleRegisterActivity,
}: TimelineSectionProps) {
  return (
    <div className="space-y-6">
      {/* Advanced Form for Adding Interaction */}
      <Card className="p-4 border-white/5 bg-[var(--color-surface)]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Registrar Nova Interação</h4>
        </div>

        {/* Channel selectors */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { type: 'Ligação', label: 'Telefonou', color: 'text-cyan-400 bg-cyan-400/10' },
            { type: 'E-mail', label: 'E-mail', color: 'text-amber-400 bg-amber-400/10' },
            { type: 'Reunião', label: 'Reunião', color: 'text-purple-400 bg-purple-400/10' },
            { type: 'Outro', label: 'Nota Interna', color: 'text-slate-400 bg-slate-400/10' }
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setActivityType(item.type as any)}
              className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border text-center transition-colors cursor-pointer ${
                activityType === item.type 
                  ? `${item.color} border-[#06B6D4]/30 shadow-inner scale-[1.01]` 
                  : 'bg-[var(--color-surface-elevated)] border-white/5 text-slate-500 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom fields (Title & datetime) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Título curto (Ex: Follow-up inicial)"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
            />
            <input
              type="time"
              value={activityTime}
              onChange={(e) => setActivityTime(e.target.value)}
              className="bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
            />
          </div>
        </div>

        {/* Descriptive textarea */}
        <div className="space-y-1">
          <textarea 
            placeholder="Relate detalhadamente como correu o contato para que outros membros saibam..."
            value={activityDesc}
            rows={3}
            onChange={(e) => {
              setActivityDesc(e.target.value);
              if (e.target.value) setActivityError('');
            }}
            className="w-full bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-600"
          />
          {activityError && <p className="text-[10.5px] text-rose-400 font-bold font-sans">⚠️ {activityError}</p>}
        </div>

        {/* File Simulator Uploader */}
        <div className="relative border border-dashed border-white/10 hover:border-[#06B6D4]/30 rounded-xl bg-[var(--color-surface)] p-4 text-center cursor-pointer transition-colors"
             onClick={() => {
               const demoDocs = [
                 { name: "Proposta_Plano_AxisEnterprise.pdf", size: "380 KB" },
                 { name: "Orcamento_GTech.xlsx", size: "120 KB" },
                 { name: "Cronograma_Execucao.docx", size: "450 KB" }
               ];
               const randomPick = demoDocs[Math.floor(Math.random() * demoDocs.length)];
               if (!selectedFiles.some(f => f.name === randomPick.name)) {
                 setSelectedFiles(prev => [...prev, randomPick]);
                 toast.success(`Anexou rascunho com sucesso: ${randomPick.name}`);
               }
             }}>
          <Paperclip className="w-5 h-5 mx-auto text-slate-500 mb-1" />
          <p className="text-[11px] text-slate-400 font-bold">Simular Anexo de Documentos</p>
          <p className="text-[9px] text-slate-500">Clique para anexar arquivo de proposta técnica fictícia em PDF / Excel</p>
        </div>

        {/* Attachment pills if exists */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedFiles.map((file, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-[#06B6D4] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {file.name} ({file.size})
                <button onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                }} className="hover:text-red-400 font-bold ml-1 text-xs">&times;</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button onClick={handleRegisterActivity} className="bg-[#06B6D4] text-white hover:bg-cyan-600 font-bold shadow-lg shadow-cyan-500/10">
            Registrar Atividade
          </Button>
        </div>
      </Card>

      {/* Main Activity Timeline */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Histórico Completo de Atividades</h4>
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {leadActivities.filter(act => act.leadId === lead.id).length > 0 ? (
            leadActivities.filter(act => act.leadId === lead.id).map((act) => {
              const getIcon = () => {
                const iconClass = "w-4 h-4 text-[#06B6D4]";
                switch (act.type) {
                  case 'Ligação': return <Phone className={iconClass} />;
                  case 'E-mail': return <Mail className={iconClass} />;
                  case 'Reunião': return <Calendar className={iconClass} />;
                  default: return <MessageSquare className={iconClass} />;
                }
              };

              return (
                <div key={act.id} className="p-4 bg-[var(--color-surface)] rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex gap-4">
                  <div className="w-9 h-9 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-xl flex items-center justify-center shrink-0">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-white">{act.title}</p>
                      <span className="text-[9.5px] text-slate-500 font-medium">{act.date}</span>
                    </div>
                    <p className="text-[9.5px] font-black text-cyan-400 uppercase mt-0.5">{act.seller || 'Consultor'}</p>
                    <p className="text-xs text-slate-300 mt-2 bg-white/[0.015] border border-white/[0.04] p-2.5 rounded-lg leading-relaxed">{act.description}</p>
                    
                    {act.files && act.files.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1 border-t border-white/5 pt-2">
                        {act.files.map((file: any, fIdx: number) => (
                          <span key={fIdx} className="bg-white/5 border border-white/15 px-2 py-0.5 rounded text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-[#06B6D4]" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico Limpo</h4>
              <p className="text-[11px] text-slate-500 mt-1">Nenhum evento registrado. Insira uma nova ação comercial acima.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
