import React, { useState, useMemo } from "react";
import { Card } from "../card";
import {
  Sparkles, Brain, ArrowRight, Edit, Tag, Trophy,
  Phone, MessageSquare, Mail, FileCheck, Search,
  User, Building2, Lock, Copy, CheckCheck, DollarSign, Briefcase,
} from "lucide-react";
import { Button } from "../button";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";

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
  priority: "Alta" | "Média" | "Baixa";
  setPriority: (val: any) => void;
  score: number;
  temperature: "Quente" | "Morno" | "Frio";
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
  setAlterationLogs: any;
  setActiveTab: (tab: string) => void;
  setChatChannel: (ch: any) => void;
  applyMessageTemplate: (tpl: string) => void;
  updateLead: any;
}

const TEMP_CFG = {
  Quente: {
    gradient: "from-rose-600/20 via-rose-500/5 to-transparent",
    badge: "bg-rose-500/10 border-rose-500/25 text-rose-400",
    avatar: "bg-rose-500/20 text-rose-200 ring-rose-500/40",
    ring: "ring-rose-500/40",
    emoji: "🔥",
  },
  Morno: {
    gradient: "from-amber-500/20 via-amber-400/5 to-transparent",
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-400",
    avatar: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
    ring: "ring-amber-500/40",
    emoji: "☀️",
  },
  Frio: {
    gradient: "from-blue-600/20 via-blue-500/5 to-transparent",
    badge: "bg-blue-500/10 border-blue-500/25 text-blue-400",
    avatar: "bg-blue-500/20 text-blue-200 ring-blue-500/40",
    ring: "ring-blue-500/40",
    emoji: "❄️",
  },
};

export function ProfileSection({
  lead,
  companyName, setCompanyName,
  leadName, setLeadName,
  phone, setPhone,
  email, setEmail,
  title, setTitle,
  value, setValue,
  seller, setSeller,
  priority, setPriority,
  score, temperature, probability, slaStatus, timeIdle,
  customTags, newTagInput, setNewTagInput,
  isEditingInline, setIsEditingInline,
  customLeadFields, customFieldsState, setCustomFieldsState,
  handleAddTag, handleRemoveTag, handleConvertLead,
  setAlterationLogs, setActiveTab, setChatChannel,
  applyMessageTemplate, updateLead,
}: ProfileSectionProps) {
  const [cnpjFetching, setCnpjFetching] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { leads: allLeads, colaboradores, addLeadActivity: addActivityCtx } = useData();

  const sellerOptions = useMemo(() => {
    const fromColab = (colaboradores as any[])
      .filter((c: any) => c.status !== "Desligado" && c.departamento === "Vendas")
      .map((c: any) => c.nome)
      .filter(Boolean);
    if (fromColab.length > 0) return fromColab as string[];
    return [...new Set((allLeads as any[]).map((l: any) => l.seller).filter(Boolean))] as string[];
  }, [colaboradores, allLeads]);

  const displayValue = useMemo(() => {
    if (!value) return "R$ 0,00";
    const num = parseFloat(String(value).replace(/[^\d,.-]/g, "").replace(",", "."));
    if (isNaN(num) || num === 0) return value as string;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  }, [value]);

  const probNum = Math.round(Number(probability) || 0);
  const timeIdleNum = parseInt(String(timeIdle)) || 0;

  const tc = TEMP_CFG[temperature] || TEMP_CFG.Frio;

  const copyToClipboard = (text: string, field: string) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${field} copiado!`);
  };

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
          const raw = data.ddd_telefone_1.replace(/\D/g, "").slice(0, 11);
          const fmt = raw.length === 11
            ? `(${raw.slice(0,2)}) ${raw.slice(2,7)}-${raw.slice(7)}`
            : `(${raw.slice(0,2)}) ${raw.slice(2,6)}-${raw.slice(6)}`;
          setPhone(fmt);
        }
      }
    } finally {
      setCnpjFetching(false);
    }
  };

  const inputClass =
    "w-full bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600";

  const quickActions = [
    {
      label: "WhatsApp", icon: MessageSquare, color: "text-[#25D366]",
      bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/20",
      action: () => window.open(`https://wa.me/55${phone.replace(/\D/g, "")}`, "_blank"),
    },
    {
      label: "Instagram", icon: Phone, color: "text-pink-400",
      bg: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",
      action: () => window.open("https://instagram.com", "_blank"),
    },
    {
      label: "Ligação VoIP", icon: Phone, color: "text-cyan-400",
      bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20",
      action: () => {
        addActivityCtx(lead.id, "Ligação", "Ligação VoIP", "Discagem virtual executada pelo sistema Axis.", seller || "Sistema");
        toast.success("Ligação VoIP registrada!");
      },
    },
    {
      label: "E-mail", icon: Mail, color: "text-amber-400",
      bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20",
      action: () => window.open(`mailto:${email}`),
    },
    {
      label: "Contrato", icon: FileCheck, color: "text-emerald-400",
      bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
      action: () =>
        setAlterationLogs((prev: any[]) => [
          { id: Date.now().toString(), author: seller || "Sistema", desc: "Contrato criado via DocuSign", time: "Agora" },
          ...prev,
        ]),
    },
    {
      label: "Converter", icon: Trophy, color: "text-purple-400",
      bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20",
      action: handleConvertLead,
    },
  ];

  const contactRows = [
    { icon: Phone, label: "Telefone", val: phone, color: "text-emerald-400", bg: "bg-emerald-500/10", href: phone ? `tel:${phone}` : null },
    { icon: Mail, label: "E-mail", val: email, color: "text-amber-400", bg: "bg-amber-500/10", href: email ? `mailto:${email}` : null },
    { icon: Building2, label: "Empresa", val: companyName, color: "text-blue-400", bg: "bg-blue-500/10", href: null },
    { icon: User, label: "Responsável", val: seller || "Não Atribuído", color: "text-cyan-400", bg: "bg-cyan-500/10", href: null },
  ];

  return (
    <div className="space-y-3">

      {/* ── Hero Card ── */}
      <div className={`rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br ${tc.gradient} bg-[#111827]`}>
        <div className="p-4">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${tc.badge}`}>
                {tc.emoji} {temperature}
              </span>
              <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${
                slaStatus === "Em Dia"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : slaStatus === "Crítico"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                SLA · {slaStatus}
              </span>
            </div>
            <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${
              priority === "Alta"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : priority === "Média"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-slate-700/40 border-white/10 text-slate-400"
            }`}>
              ▲ {priority}
            </span>
          </div>

          {/* Avatar + identity */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ring-2 ring-offset-2 ring-offset-[#111827] ${tc.avatar}`}>
              {(companyName || leadName || "LD").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-white leading-tight truncate">
                {companyName || leadName || <span className="text-slate-500 italic font-normal text-sm">Sem nome cadastrado</span>}
              </h3>
              {companyName && leadName && (
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{leadName}</span>
                </p>
              )}
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{displayValue}</span>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Score */}
            <div className="bg-[#070E1A]/70 rounded-xl p-3 border border-white/[0.05]">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Score</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-cyan-400">{score}</span>
                <span className="text-[9px] text-slate-600">/100</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {/* Conversão */}
            <div className="bg-[#070E1A]/70 rounded-xl p-3 border border-white/[0.05]">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Conversão</div>
              <div className="mt-1">
                <span className={`text-xl font-black ${
                  probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-slate-400"
                }`}>{probNum}%</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    probNum >= 70 ? "bg-emerald-400" : probNum >= 40 ? "bg-amber-400" : "bg-slate-600"
                  }`}
                  style={{ width: `${probNum}%` }}
                />
              </div>
            </div>

            {/* Parado */}
            <div className={`rounded-xl p-3 border ${
              timeIdleNum > 7
                ? "bg-rose-500/10 border-rose-500/20"
                : timeIdleNum > 3
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-[#070E1A]/70 border-white/[0.05]"
            }`}>
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Parado</div>
              <div className={`text-xl font-black mt-1 ${
                timeIdleNum > 7 ? "text-rose-400" : timeIdleNum > 3 ? "text-amber-400" : "text-slate-300"
              }`}>{timeIdle || "0d"}</div>
              <div className="text-[8px] text-slate-600 mt-1">sem contato</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Info ── */}
      <Card className="border-white/10 bg-[#111827]/70 overflow-hidden p-0">
        <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Informações de Contato</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {contactRows.map(({ icon: Icon, label, val, color, bg, href }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-white/[0.015] transition-colors">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-500 leading-none mb-0.5">{label}</div>
                {href && val ? (
                  <a href={href} className={`text-xs font-bold truncate block hover:underline ${color}`}>{val}</a>
                ) : (
                  <div className={`text-xs font-semibold truncate ${val && val !== "Não Atribuído" ? "text-white" : "text-slate-500 italic"}`}>
                    {val || "—"}
                  </div>
                )}
              </div>
              {val && val !== "Não Atribuído" && val !== "—" && (
                <button
                  onClick={() => copyToClipboard(val, label)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                  title="Copiar"
                >
                  {copiedField === label
                    ? <CheckCheck className="w-3 h-3 text-emerald-400" />
                    : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Quick Actions ── */}
      <Card className="border-white/10 bg-[#111827]/70 p-4">
        <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3">Ações Rápidas</h4>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map(({ label, icon: Icon, color, bg, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex flex-col items-center gap-1.5 py-3 ${bg} border rounded-xl transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-[8px] font-black uppercase text-center leading-tight px-1 ${color}`}>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* ── AI Copilot Recommendation ── */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-[#111827] p-4 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/[0.07] rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/[0.06] rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Recomendação Axis CoPilot</span>
            </div>
            <span className="text-[8px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Sparkles className="w-2 h-2 animate-pulse" /> IA
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Score <strong className="text-cyan-300">{score}</strong> — este lead demonstra interesse em produtos recorrentes.
            Envie a proposta{" "}
            <strong className="text-white">Consultoria Enterprise + Licença Usuário</strong>{" "}
            hoje mesmo para antecipar o fechamento.
          </p>
          <div className="mt-3 bg-[#070E1A]/60 rounded-xl p-2.5 border border-cyan-500/15 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Sugestão de ação:</span>
            <button
              onClick={() => {
                setActiveTab("whatsapp");
                setChatChannel("whatsapp");
                applyMessageTemplate("Olá {client}! Preparei a proposta para {company}. Segue em anexo.");
              }}
              className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
            >
              Aplicar Proposta <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Dados Principais ── */}
      <Card className="border-white/10 bg-[#111827]/70 overflow-hidden p-0">
        <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
          <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400">Dados Principais</h4>
          <button
            onClick={() => setIsEditingInline(!isEditingInline)}
            className={`text-[9px] font-black flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
              isEditingInline
                ? "text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/15"
                : "text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15"
            }`}
          >
            {isEditingInline
              ? <><Lock className="w-2.5 h-2.5" /> Bloquear</>
              : <><Edit className="w-2.5 h-2.5" /> Editar</>}
          </button>
        </div>

        <div className="divide-y divide-white/[0.04]">

          {/* Empresa + Contato */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Empresa/Líder
              </div>
              {isEditingInline ? (
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Nome da empresa" />
              ) : (
                <span className="text-xs text-white font-semibold">{companyName || <span className="text-slate-500 italic">—</span>}</span>
              )}
            </div>
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Contato
              </div>
              {isEditingInline ? (
                <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} className={inputClass} placeholder="Nome do contato" />
              ) : (
                <span className="text-xs text-white font-semibold">{leadName || <span className="text-slate-500 italic">—</span>}</span>
              )}
            </div>
          </div>

          {/* E-mail */}
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Mail className="w-3 h-3" /> E-mail
            </div>
            {isEditingInline ? (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@empresa.com" />
            ) : (
              <span className={`text-xs font-semibold ${email ? "text-amber-400" : "text-slate-500 italic"}`}>{email || "—"}</span>
            )}
          </div>

          {/* Telefone */}
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3" /> Telefone
            </div>
            {isEditingInline ? (
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="(00) 00000-0000" />
            ) : (
              <span className={`text-xs font-semibold font-mono ${phone ? "text-emerald-400" : "text-slate-500 italic"}`}>{phone || "—"}</span>
            )}
          </div>

          {/* CNPJ */}
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <FileCheck className="w-3 h-3" /> CNPJ
            </div>
            {isEditingInline ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={18}
                  value={lead.cnpj || ""}
                  onChange={(e) => {
                    import("../../../lib/utils").then(({ formatCNPJ }) => {
                      updateLead(lead.id, { cnpj: formatCNPJ(e.target.value) });
                    });
                  }}
                  className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="00.000.000/0000-00"
                />
                <button
                  type="button"
                  onClick={fetchCnpjData}
                  disabled={cnpjFetching || (lead.cnpj || "").replace(/\D/g, "").length !== 14}
                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Buscar na Receita Federal"
                >
                  <Search className={`w-3.5 h-3.5 ${cnpjFetching ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : (
              <span className={`text-xs font-mono ${lead.cnpj ? "text-white" : "text-slate-500 italic"}`}>{lead.cnpj || "—"}</span>
            )}
          </div>

          {/* Iniciativa + Valor */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Iniciativa
              </div>
              {isEditingInline ? (
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Ex: Novo Negócio" />
              ) : (
                <span className={`text-xs font-semibold ${title ? "text-white" : "text-slate-500 italic"}`}>{title || "—"}</span>
              )}
            </div>
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Valor
              </div>
              {isEditingInline ? (
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} placeholder="0,00" />
              ) : (
                <span className="text-xs font-bold font-mono text-emerald-400">{displayValue}</span>
              )}
            </div>
          </div>

          {/* Responsável + Prioridade */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.04]">
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Responsável
              </div>
              {isEditingInline ? (
                <select value={seller} onChange={(e) => setSeller(e.target.value)} className={inputClass}>
                  <option value="">Não Atribuído</option>
                  {sellerOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`text-xs font-bold ${seller ? "text-cyan-400" : "text-slate-500 italic"}`}>
                  {seller || "Não Atribuído"}
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Prioridade</div>
              {isEditingInline ? (
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={inputClass}>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              ) : (
                <span className={`text-xs font-black ${
                  priority === "Alta" ? "text-rose-400" : priority === "Média" ? "text-amber-400" : "text-blue-400"
                }`}>
                  {priority || <span className="text-slate-500 italic font-normal">—</span>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Custom fields */}
        {customLeadFields.length > 0 && (
          <div className="border-t border-white/[0.05] p-3 space-y-2.5">
            <div className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-2">Campos Personalizados</div>
            <div className="grid grid-cols-2 gap-2.5">
              {customLeadFields.map((field) => (
                <div key={field.id}>
                  <div className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{field.name}</div>
                  {isEditingInline ? (
                    <input
                      type={field.type === "Data" ? "date" : field.type === "Número" ? "number" : "text"}
                      value={customFieldsState[field.id] || ""}
                      onChange={(e) => setCustomFieldsState((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      className={inputClass}
                    />
                  ) : (
                    <span className="text-xs text-white font-semibold">{lead.customFields?.[field.id] || <span className="text-slate-500 italic">—</span>}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Tags ── */}
      <Card className="border-white/10 bg-[#111827]/70 overflow-hidden p-0">
        <div className="px-4 py-2.5 border-b border-white/[0.05] bg-white/[0.01]">
          <h4 className="text-[8px] font-black uppercase tracking-widest text-cyan-500/60 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Tags Corporativas
          </h4>
        </div>
        <div className="p-3.5 space-y-3">
          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
            {customTags.length === 0 ? (
              <span className="text-[10px] text-slate-600 italic self-center">Nenhuma tag adicionada ainda</span>
            ) : (
              customTags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  title="Clique para remover"
                  className="group flex items-center gap-1 bg-blue-500/10 hover:bg-rose-500/10 text-blue-300 hover:text-rose-400 border border-blue-500/15 hover:border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer"
                >
                  #{tag}
                  <span className="text-[8px] font-black opacity-0 group-hover:opacity-100">&times;</span>
                </span>
              ))
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Nova tag... (Enter para adicionar)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1 bg-[#070E1A] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all"
            />
            <Button
              size="sm"
              onClick={handleAddTag}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/20 px-3 font-black shrink-0"
            >
              +
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
