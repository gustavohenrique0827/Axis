import React from "react";
import { Card } from "../card";
import { Sparkles, Brain, ArrowRight, Edit, Tag, Trophy, Phone, MessageSquare, Mail, FileCheck } from "lucide-react";
import { Button } from "../button";

interface ProfileSectionProps {
  lead: any;
  companyName: string;
  setCompanyName: (val: string) => void;
  leadName: string;
  setLeadName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  value: string;
  setValue: (val: string) => void;
  seller: string;
  setSeller: (val: string) => void;
  priority: 'Alta' | 'Média' | 'Baixa';
  setPriority: (val: any) => void;
  score: number;
  temperature: 'Quente' | 'Morno' | 'Frio';
  probability: number;
  slaStatus: string;
  timeIdle: string;
  customTags: string[];
  newTagInput: string;
  setNewTagInput: (val: string) => void;
  isEditingInline: boolean;
  setIsEditingInline: (val: boolean) => void;
  tempColors: Record<string, string>;
  customLeadFields: any[];
  customFieldsState: Record<string, string | number>;
  setCustomFieldsState: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleConvertLead: () => void;
  addLeadActivity: any;
  setAlterationLogs: any;
  setActiveTab: (tab: string) => void;
  setChatChannel: (ch: any) => void;
  applyMessageTemplate: (tpl: string) => void;
  updateLead: any;
}

export function ProfileSection({
  lead,
  companyName,
  setCompanyName,
  leadName,
  setLeadName,
  phone,
  setPhone,
  email,
  setEmail,
  title,
  setTitle,
  value,
  setValue,
  seller,
  setSeller,
  priority,
  setPriority,
  score,
  temperature,
  probability,
  slaStatus,
  timeIdle,
  customTags,
  newTagInput,
  setNewTagInput,
  isEditingInline,
  setIsEditingInline,
  tempColors,
  customLeadFields,
  customFieldsState,
  setCustomFieldsState,
  handleAddTag,
  handleRemoveTag,
  handleConvertLead,
  addLeadActivity,
  setAlterationLogs,
  setActiveTab,
  setChatChannel,
  applyMessageTemplate,
  updateLead
}: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header Block with Avatar, Score & Temperature indicators */}
      <Card className="p-5 border-white/10 bg-[#111827]/70 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${tempColors[temperature]}`}>
            🔥 {temperature}
          </span>
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
            slaStatus === 'Em Dia' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            slaStatus === 'Atendimento Crítico' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            🕔 SLA: {slaStatus}
          </span>
        </div>

        <div className="flex items-center gap-4 py-2 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-black font-mono">
            {(companyName || leadName || "LD").substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white leading-tight truncate">
                {companyName || leadName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Contato: {leadName}</p>
            <p className="text-xs font-semibold text-emerald-400 mt-1 font-mono">Orçamento: {value || 'R$ 0'}</p>
          </div>
        </div>

        {/* Advanced Indicators */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-white/5">
          <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lead Score</span>
            <div className="flex items-center gap-1 mt-1 text-cyan-400 font-black text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{score}</span><span className="text-[9px] text-slate-600">/100</span>
            </div>
          </div>
          <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Conversão %</span>
            <div className="flex items-center gap-1 mt-1 text-emerald-400 font-mono font-black text-sm">
              <span>{probability}%</span>
            </div>
          </div>
          <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tempo Parado</span>
            <span className="text-[10px] text-slate-300 font-bold mt-1 text-center truncate w-full">{timeIdle}</span>
          </div>
        </div>
      </Card>

      {/* Quick Interactive Actions Panel */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 backdrop-blur-xl">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] mb-3">Atalhos e Ações Rápidas</h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => {
              const numberOnly = phone.replace(/\D/g, '');
              window.open(`https://wa.me/55${numberOnly}`, '_blank');
            }}
            className="flex items-center gap-2 px-3 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-xs font-bold rounded-xl transition-all"
          >
            <MessageSquare className="w-4 h-4 shrink-0" /> Abrir WhatsApp
          </button>
          <button 
            onClick={() => window.open(`https://instagram.com`, '_blank')}
            className="flex items-center gap-2 px-3 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 text-xs font-bold rounded-xl transition-all"
          >
            <Phone className="w-4 h-4 shrink-0" /> Instagram Direct
          </button>
          <button 
            onClick={() => {
              addLeadActivity(lead.id, 'Ligação', 'Tentativa de Ligação Direta', 'Executou discagem virtual e enviou notificação do contato.', seller || 'Carlos');
            }}
            className="flex items-center gap-2 px-3 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl transition-all"
          >
            <Phone className="w-4 h-4 shrink-0" /> Ligação VoIP
          </button>
          <button 
            onClick={() => window.open(`mailto:${email}`)}
            className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all"
          >
            <Mail className="w-4 h-4 shrink-0" /> Enviar E-mail
          </button>
          <button 
            onClick={() => {
              setAlterationLogs((prev: any[]) => [
                { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "Contrato de Prestação de Serviços criado e enviado via DocuSign", time: "Agora" },
                ...prev
              ]);
            }}
            className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all"
          >
            <FileCheck className="w-4 h-4 shrink-0" /> Criar Contrato
          </button>
          <button 
            onClick={handleConvertLead}
            className="flex items-center gap-2 px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-xl transition-all"
          >
            <Trophy className="w-4 h-4 shrink-0" /> Converter Lead
          </button>
        </div>
      </Card>

      {/* Smart AI suggested next action */}
      <Card className="p-4 border-cyan-500/20 bg-cyan-950/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-2 right-2 animate-pulse flex items-center gap-1.5 bg-[#06B6D4]/20 px-2 py-0.5 rounded-full border border-[#06B6D4]/30 text-[#06B6D4] text-[8px] font-black uppercase">
          <Sparkles className="w-2.5 h-2.5" /> IA Copilot
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-1.5">
          <Brain className="w-4 h-4" /> Recomendação Axis CoPilot
        </h4>
        <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2.5">
          &ldquo;O lead de pontuação <strong className="text-cyan-300">{score}</strong> demonstrou alto interesse em produtos recorrentes. Sugiro enviar o template de proposta <strong className="text-white">Consultoria Enterprise + Licença Usuário</strong> hoje mesmo para antecipar o fechamento.&rdquo;
        </p>
        <div className="mt-3.5 bg-[#0B1120]/45 p-2 rounded-lg border border-[#06B6D4]/20 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Sugestão:</span>
          <button 
            onClick={() => {
              setActiveTab('whatsapp');
              setChatChannel('whatsapp');
              applyMessageTemplate("Olá {client}! Preparei a proposta oficial para a {company}. Inclui a {seller} no loop. Segue anexo com nosso cronograma.");
            }}
            className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
          >
            Aplicar Proposta <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* Editable Attributes Panel */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados Principais</h4>
          <button 
            onClick={() => setIsEditingInline(!isEditingInline)}
            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3 h-3" /> {isEditingInline ? 'Bloquear' : 'Editar Inline'}
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-slate-500 font-bold block">Empresa/Lead</label>
            {isEditingInline ? (
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-semibold mt-0.5 block">{companyName || 'Nenhuma'}</span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-bold block">Contato Principal</label>
            {isEditingInline ? (
              <input 
                type="text" 
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-semibold mt-0.5 block">{leadName}</span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-bold block">CNPJ</label>
            {isEditingInline ? (
              <input 
                type="text" 
                maxLength={18}
                value={lead.cnpj || ''}
                onChange={(e) => {
                  import('../../../lib/utils').then(({ formatCNPJ }) => {
                    const val = formatCNPJ(e.target.value);
                    updateLead(lead.id, { cnpj: val });
                  });
                }}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-mono mt-0.5 block">{lead.cnpj || '-'}</span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-bold block">E-mail</label>
            {isEditingInline ? (
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-mono mt-0.5 block">{email || '-'}</span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-bold block">Telefone</label>
            {isEditingInline ? (
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-mono mt-0.5 block">{phone || '-'}</span>
            )}
          </div>

          <div>
            <label className="text-slate-500 font-bold block">Iniciativa / Produto</label>
            {isEditingInline ? (
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
              />
            ) : (
              <span className="text-white font-medium mt-0.5 block">{title || '-'}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500 font-bold block">Responsável</label>
              {isEditingInline ? (
                <select 
                  value={seller} 
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-white mt-1 text-xs"
                >
                  <option value="">Não Atribuído</option>
                  <option value="Carlos Eduardo Mendes">Carlos Eduardo Mendes</option>
                  <option value="Ana Silva">Ana Silva</option>
                  <option value="Roberto Ramos">Roberto Ramos</option>
                  <option value="Juliana Costa">Juliana Costa</option>
                </select>
              ) : (
                <span className="text-[#06B6D4] font-bold mt-0.5 block">{seller || 'Não Atribuído'}</span>
              )}
            </div>

            <div>
              <label className="text-slate-500 font-bold block">Prioridade</label>
              {isEditingInline ? (
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-white mt-1 text-xs"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              ) : (
                <span className={`font-bold mt-0.5 block ${
                  priority === 'Alta' ? 'text-rose-450 text-rose-400' : priority === 'Média' ? 'text-amber-400' : 'text-slate-400'
                }`}>{priority}</span>
              )}
            </div>
          </div>
        </div>

        {customLeadFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Campos Personalizados</h4>
            <div className="grid grid-cols-2 gap-4">
              {customLeadFields.map((field) => (
                <div key={field.id}>
                  <label className="text-slate-500 font-bold block">{field.name}</label>
                  {isEditingInline ? (
                    <input 
                      type={field.type === 'Data' ? 'date' : field.type === 'Número' ? 'number' : 'text'}
                      value={customFieldsState[field.id] || ''}
                      onChange={(e) => setCustomFieldsState(prev => ({ ...prev, [field.id]: e.target.value }))}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-medium mt-0.5 block">{lead.customFields?.[field.id] || '-'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Custom tags list */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Tags Corporativas</h4>
        <div className="flex flex-wrap gap-1.5">
          {customTags.map((tag) => (
            <span 
              key={tag} 
              className="group flex items-center gap-1.5 bg-white/5 hover:bg-rose-500/10 text-slate-350 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
              title="Clique para excluir tag"
            >
              <Tag className="w-3 h-3" /> {tag}
              <span className="text-[8px] font-black opacity-0 group-hover:opacity-100">&times;</span>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input 
            type="text" 
            placeholder="Nova tag..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            className="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
          />
          <Button size="sm" onClick={handleAddTag} className="bg-slate-800 text-white hover:bg-slate-750 px-3 font-bold block shrink-0">+</Button>
        </div>
      </Card>
    </div>
  );
}
