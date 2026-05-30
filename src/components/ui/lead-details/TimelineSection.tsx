import React, { useState } from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Phone, Mail, Calendar, MessageSquare, Paperclip, FileText } from "lucide-react";
import { toast } from "sonner";
// Type definition inline
export interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string;
  seller: string;
  date: string;
  files?: any[];
}

interface TimelineSectionProps {
  lead: any;
  seller: string;
  leadActivities: LeadActivity[];
  addLeadActivity: (leadId: string, type: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro', title: string, description: string, seller: string, customDate?: string, files?: { name: string; size: string; }[]) => void;
  setAlterationLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

export function TimelineSection({ lead, seller, leadActivities, addLeadActivity, setAlterationLogs }: TimelineSectionProps) {
  const [activityType, setActivityType] = useState<'Ligação' | 'E-mail' | 'Reunião' | 'Outro'>('Ligação');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDate, setActivityDate] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
  });
  const [activityTime, setActivityTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [activityError, setActivityError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; }[]>([]);

  const getFormattedActivityDate = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const selectedDate = new Date(year, month - 1, day, hours, minutes);
      const today = new Date();
      
      const isToday = selectedDate.getDate() === today.getDate() &&
                      selectedDate.getMonth() === today.getMonth() &&
                      selectedDate.getFullYear() === today.getFullYear();
                      
      if (isToday) return `Hoje, ${timeStr}`;
      
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}, ${timeStr}`;
    } catch {
      return `Gravado em ${dateStr} ${timeStr}`;
    }
  };

  const handleRegisterActivity = () => {
    if (!activityDesc.trim()) {
      setActivityError("A descrição detalhada da atividade é obrigatória.");
      toast.error("Erro: Insira uma descrição para registrar a atividade!");
      return;
    }

    const titlesMap = {
      'Ligação': 'Ligação Telefônica realizada',
      'E-mail': 'E-mail Comercial enviado',
      'Reunião': 'Apresentação/Reunião executada',
      'Outro': 'Observação Geral do Consultor'
    };
    
    const finalTitle = activityTitle.trim() || titlesMap[activityType];
    const finalDate = getFormattedActivityDate(activityDate, activityTime);

    addLeadActivity(
      lead.id,
      activityType,
      finalTitle,
      activityDesc,
      seller || "Consultor G-Tech",
      finalDate,
      selectedFiles.length > 0 ? selectedFiles : undefined
    );
    
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: seller || "Consultor G-Tech", desc: `Registrou nova atividade comercial: ${finalTitle}`, time: "Agora" },
      ...prev
    ]);

    setActivityDesc('');
    setActivityTitle('');
    setActivityError('');
    setSelectedFiles([]);
    toast.success('Histórico comercial atualizado com sucesso!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-4 border-white/5 bg-[#0B1120]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Registrar Nova Interação</h4>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { type: 'Ligação', label: 'Telefonou', color: 'text-cyan-400 bg-cyan-450/10' },
            { type: 'E-mail', label: 'E-mail', color: 'text-amber-400 bg-amber-450/10' },
            { type: 'Reunião', label: 'Reunião', color: 'text-purple-400 bg-purple-450/10' },
            { type: 'Outro', label: 'Nota Interna', color: 'text-slate-400 bg-slate-450/10' }
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setActivityType(item.type as any)}
              className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border text-center transition-colors cursor-pointer ${
                activityType === item.type 
                  ? `${item.color} border-[#06B6D4]/30 shadow-inner scale-[1.01]` 
                  : 'bg-[#111827] border-white/5 text-slate-500 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="Título curto (Ex: Follow-up inicial)"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="bg-[#111827] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="date" 
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="bg-[#111827] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
            />
            <input 
              type="time" 
              value={activityTime}
              onChange={(e) => setActivityTime(e.target.value)}
              className="bg-[#111827] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
            />
          </div>
        </div>
        <div className="space-y-1">
          <textarea 
            placeholder="Relate detalhadamente como correu o contato..."
            value={activityDesc}
            rows={3}
            onChange={(e) => {
              setActivityDesc(e.target.value);
              if (e.target.value) setActivityError('');
            }}
            className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-650"
          />
          {activityError && <p className="text-[10.5px] text-rose-400 font-bold font-sans">⚠️ {activityError}</p>}
        </div>
        <div className="relative border border-dashed border-white/10 hover:border-[#06B6D4]/30 rounded-xl bg-[#0B1120] p-4 text-center cursor-pointer transition-colors"
              onClick={() => {
                const demoDocs = [
                  { name: "Proposta_Plano_AxisEnterprise.pdf", size: "380 KB" },
                  { name: "Orcamento_GTech.xlsx", size: "120 KB" }
                ];
                const randomPick = demoDocs[Math.floor(Math.random() * demoDocs.length)];
                if (!selectedFiles.some(f => f.name === randomPick.name)) {
                  setSelectedFiles(prev => [...prev, randomPick]);
                  toast.success(`Anexou rascunho com sucesso: ${randomPick.name}`);
                }
              }}>
          <Paperclip className="w-5 h-5 mx-auto text-slate-500 mb-1" />
          <p className="text-[11px] text-slate-400 font-bold">Simular Anexo de Documentos</p>
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedFiles.map((file, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-[#06B6D4] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> {file.name} ({file.size})
                <button onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, i) => i !== idx)); }} className="hover:text-red-400 font-bold ml-1 text-xs">&times;</button>
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
                <div key={act.id} className="p-4 bg-[#0B1120] rounded-2xl border border-white/5 hover:border-white/10 flex gap-4">
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
                            <FileText className="w-3.5 h-3.5 text-[#06B6D4]" /> {file.name}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
