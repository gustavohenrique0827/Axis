import React, { useState, useMemo } from "react";
import { Card } from "../card";
import { Sparkles, Brain, ArrowRight, Edit, Tag, Trophy, Phone, MessageSquare, Mail, FileCheck, Search } from "lucide-react";
import { Button } from "../button";
import { useData } from "../../../contexts/DataContext";

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
  companyName, setCompanyName,
  leadName, setLeadName,
  phone, setPhone,
  email, setEmail,
  title, setTitle,
  value,
  seller, setSeller,
  priority, setPriority,
  score, temperature, probability, slaStatus, timeIdle,
  customTags, newTagInput, setNewTagInput,
  isEditingInline, setIsEditingInline,
  tempColors, customLeadFields, customFieldsState, setCustomFieldsState,
  handleAddTag, handleRemoveTag, handleConvertLead,
  addLeadActivity, setAlterationLogs, setActiveTab, setChatChannel,
  applyMessageTemplate, updateLead,
}: ProfileSectionProps) {
  const [cnpjFetching, setCnpjFetching] = useState(false);
  const { leads: allLeads } = useData();

  const sellerOptions = useMemo(
    () => [...new Set((allLeads as any[]).map((l: any) => l.seller).filter(Boolean))] as string[],
    [allLeads]
  );

  const fetchCnpjData = async () => {
    const digits = (lead.cnpj || "").replace(/\D/g, "");
    if (digits.length !== 14) return;
    setCnpjFetching(true);
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.nome_fantasia || data.razao_social) setCompanyName(data.nome_fantasia || data.razao_social);
        if (data.email && !email) setEmail(data.email.toLowerCase());
        if (data.ddd_telefone_1 && !phone) {
          const raw = data.ddd_telefone_1.replace(/\D/g, "");
          const d = raw.slice(0, 11);
          const formatted = d.length === 11
            ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
            : `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
          setPhone(formatted);
        }
      }
    } finally {
      setCnpjFetching(false);
    }
  };

  const inputClass = "w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs focus:outline-none focus:border-blue-500/50";

  return (
    <div className="space-y-4">

      {/* Profile card */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 backdrop-blur-xl relative overflow-hidden">
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border tracking-wide uppercase ${tempColors[temperature]}`}>
            🔥 {temperature}
          </span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full border tracking-wide uppercase ${
            slaStatus === 'Em Dia' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            slaStatus === 'Crítico'  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            SLA: {slaStatus}
          </span>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 pt-1 pb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 shrink-0 flex items-center justify-center text-lg font-black font-mono">
            {(companyName || leadName || "LD").substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 pr-28">
            <h3 className="text-sm font-black text-white leading-tight truncate">{companyName || leadName}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Contato: {leadName}</p>
            <p className="text-[11px] font-bold text-emerald-400 mt-0.5 font-mono">{value || 'R$ 0'}</p>
          </div>
        </div>

        {/* Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
          <div className="bg-[#0B1120] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Lead Score</span>
            <div className="flex items-center gap-1 mt-1 text-cyan-400 font-black text-sm">
              <Sparkles className="w-3 h-3" />
              <span>{score}</span>
              <span className="text-[8px] text-slate-600">/100</span>
            </div>
          </div>
          <div className="bg-[#0B1120] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Conversão</span>
            <div className="text-sm text-emerald-400 font-mono font-black mt-1">{probability}%</div>
          </div>
          <div className="bg-[#0B1120] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Parado</span>
            <span className="text-xs text-slate-300 font-bold mt-1 truncate w-full text-center">{timeIdle || '—'}</span>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 backdrop-blur-xl">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] mb-3">Atalhos Rápidos</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            {
              label: 'WhatsApp', icon: MessageSquare, color: 'text-[#25D366]',
              bg: 'bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/20',
              action: () => window.open(`https://wa.me/55${phone.replace(/\D/g, '')}`, '_blank'),
            },
            {
              label: 'Instagram', icon: Phone, color: 'text-pink-400',
              bg: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20',
              action: () => window.open(`https://instagram.com`, '_blank'),
            },
            {
              label: 'VoIP', icon: Phone, color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
              action: () => addLeadActivity(lead.id, 'Ligação', 'Tentativa de Ligação', 'Discagem virtual executada.', seller || 'Sistema'),
            },
            {
              label: 'E-mail', icon: Mail, color: 'text-amber-400',
              bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
              action: () => window.open(`mailto:${email}`),
            },
            {
              label: 'Contrato', icon: FileCheck, color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
              action: () => setAlterationLogs((prev: any[]) => [
                { id: Date.now().toString(), author: seller || "Sistema", desc: "Contrato criado via DocuSign", time: "Agora" },
                ...prev
              ]),
            },
            {
              label: 'Converter', icon: Trophy, color: 'text-purple-400',
              bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20',
              action: handleConvertLead,
            },
          ].map(({ label, icon: Icon, color, bg, action }) => (
            <button key={label} onClick={action}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-1 ${bg} border rounded-xl transition-all cursor-pointer`}>
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-[8px] font-black uppercase ${color}`}>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* AI recommendation */}
      <Card className="p-4 border-cyan-500/20 bg-cyan-950/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#06B6D4]/20 px-2 py-0.5 rounded-full border border-[#06B6D4]/30 text-[#06B6D4] text-[8px] font-black uppercase">
          <Sparkles className="w-2 h-2 animate-pulse" /> IA Copilot
        </div>
        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-1.5 mb-2">
          <Brain className="w-3.5 h-3.5" /> Recomendação Axis CoPilot
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Score <strong className="text-cyan-300">{score}</strong> indica interesse em produtos recorrentes.
          Envie a proposta <strong className="text-white">Consultoria Enterprise</strong> hoje.
        </p>
        <div className="mt-3 bg-[#0B1120]/45 p-2 rounded-lg border border-[#06B6D4]/20 flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Sugestão de ação:</span>
          <button
            onClick={() => {
              setActiveTab('whatsapp');
              setChatChannel('whatsapp');
              applyMessageTemplate("Olá {client}! Preparei a proposta para {company}. Segue em anexo.");
            }}
            className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
          >
            Aplicar Proposta <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </Card>

      {/* Editable fields */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dados Principais</h4>
          <button
            onClick={() => setIsEditingInline(!isEditingInline)}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Edit className="w-3 h-3" /> {isEditingInline ? 'Bloquear' : 'Editar'}
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            { label: 'Empresa/Lead', val: companyName, set: setCompanyName, placeholder: '' },
            { label: 'Contato Principal', val: leadName, set: setLeadName, placeholder: '' },
            { label: 'E-mail', val: email, set: setEmail, placeholder: '' },
            { label: 'Telefone', val: phone, set: setPhone, placeholder: '' },
            { label: 'Iniciativa / Produto', val: title, set: setTitle, placeholder: '' },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-slate-500 font-bold block">{label}</label>
              {isEditingInline ? (
                <input type="text" value={val} onChange={(e) => set(e.target.value)} className={inputClass} />
              ) : (
                <span className="text-white font-semibold mt-0.5 block">{val || '—'}</span>
              )}
            </div>
          ))}

          {/* CNPJ */}
          <div>
            <label className="text-slate-500 font-bold block">CNPJ</label>
            {isEditingInline ? (
              <div className="flex gap-1 mt-1">
                <input
                  type="text" maxLength={18}
                  value={lead.cnpj || ''}
                  onChange={(e) => {
                    import('../../../lib/utils').then(({ formatCNPJ }) => {
                      updateLead(lead.id, { cnpj: formatCNPJ(e.target.value) });
                    });
                  }}
                  className="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50"
                />
                <button
                  type="button"
                  onClick={fetchCnpjData}
                  disabled={cnpjFetching || (lead.cnpj || '').replace(/\D/g, '').length !== 14}
                  className="px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Buscar na Receita Federal"
                >
                  <Search className={`w-3 h-3 ${cnpjFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : (
              <span className="text-white font-mono mt-0.5 block">{lead.cnpj || '—'}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500 font-bold block">Responsável</label>
              {isEditingInline ? (
                <select value={seller} onChange={(e) => setSeller(e.target.value)} className={inputClass}>
                  <option value="">Não Atribuído</option>
                  {sellerOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className="text-[#06B6D4] font-bold mt-0.5 block">{seller || 'Não Atribuído'}</span>
              )}
            </div>
            <div>
              <label className="text-slate-500 font-bold block">Prioridade</label>
              {isEditingInline ? (
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={inputClass}>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              ) : (
                <span className={`font-bold mt-0.5 block ${
                  priority === 'Alta' ? 'text-rose-400' : priority === 'Média' ? 'text-amber-400' : 'text-blue-400'
                }`}>{priority}</span>
              )}
            </div>
          </div>
        </div>

        {customLeadFields.length > 0 && (
          <div className="pt-3 border-t border-white/5 space-y-3">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Campos Personalizados</h4>
            <div className="grid grid-cols-2 gap-3">
              {customLeadFields.map((field) => (
                <div key={field.id}>
                  <label className="text-slate-500 font-bold block">{field.name}</label>
                  {isEditingInline ? (
                    <input
                      type={field.type === 'Data' ? 'date' : field.type === 'Número' ? 'number' : 'text'}
                      value={customFieldsState[field.id] || ''}
                      onChange={(e) => setCustomFieldsState(prev => ({ ...prev, [field.id]: e.target.value }))}
                      className={inputClass}
                    />
                  ) : (
                    <span className="text-white font-medium mt-0.5 block">{lead.customFields?.[field.id] || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tags */}
      <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4]">Tags Corporativas</h4>
        <div className="flex flex-wrap gap-1.5">
          {customTags.map((tag) => (
            <span
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              title="Clique para remover"
              className="group flex items-center gap-1.5 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5" /> {tag}
              <span className="text-[8px] font-black opacity-0 group-hover:opacity-100">&times;</span>
            </span>
          ))}
          {customTags.length === 0 && (
            <span className="text-[10px] text-slate-600 italic">Nenhuma tag adicionada</span>
          )}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Nova tag..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
          />
          <Button size="sm" onClick={handleAddTag} className="bg-slate-800 text-white hover:bg-slate-700 px-3 font-bold shrink-0">+</Button>
        </div>
      </Card>
    </div>
  );
}
