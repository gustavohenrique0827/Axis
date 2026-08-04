import { useState, useRef, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, X, Trophy, ThumbsDown, ChevronRight, Check, Brain,
  MessageSquare, Phone, Mail, Calendar, FileText, Building2,
  MapPin, DollarSign, User, Tag, Send, Flame, Droplets,
  Snowflake, LayoutList, Columns3, Trash, Clock, AlertCircle,
  Edit2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Etapa = "Prospecção" | "Qualificação" | "Apresentação" | "Negociação" | "Fechamento";
type Prioridade = "Alta" | "Média" | "Baixa";
type Temperatura = "Quente" | "Morno" | "Frio";
type Status = "Ativo" | "Ganho" | "Perdido";

interface Lead {
  id: string;
  cliente: string;
  telefone: string;
  email: string;
  interesse: string;
  bairro: string;
  orcamento: number;
  corretor: string;
  origem: string;
  etapa: Etapa;
  diasEtapa: number;
  prioridade: Prioridade;
  obs: string;
  tags: string[];
  status: Status;
  criadoEm: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ETAPAS: Etapa[] = ["Prospecção", "Qualificação", "Apresentação", "Negociação", "Fechamento"];

const ETAPA_CFG: Record<Etapa, { color: string; dot: string }> = {
  "Prospecção":  { color: "text-blue-300",    dot: "bg-blue-400" },
  "Qualificação":{ color: "text-amber-300",   dot: "bg-amber-400" },
  "Apresentação":{ color: "text-violet-300",  dot: "bg-violet-400" },
  "Negociação":  { color: "text-cyan-300",    dot: "bg-cyan-400" },
  "Fechamento":  { color: "text-emerald-300", dot: "bg-emerald-400" },
};

const TEMP_CFG: Record<Temperatura, {
  label: string; icon: React.ElementType; text: string; avatarBg: string;
}> = {
  Quente: { label: "Quente", icon: Flame,     text: "text-orange-300", avatarBg: "bg-orange-500/15 text-orange-300" },
  Morno:  { label: "Morno",  icon: Droplets,  text: "text-amber-300",  avatarBg: "bg-amber-500/15 text-amber-300" },
  Frio:   { label: "Frio",   icon: Snowflake, text: "text-blue-300",   avatarBg: "bg-blue-500/15 text-blue-300" },
};

const FIELD  = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50";
const SELECT = "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50";
const LABEL  = "text-xs text-slate-400 mb-1.5 block";


// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTemperatura(diasEtapa: number): Temperatura {
  if (diasEtapa < 2) return "Quente";
  if (diasEtapa < 7) return "Morno";
  return "Frio";
}
function getSLA(diasEtapa: number) {
  if (diasEtapa <= 5) return { label: "Em Dia",  dot: "bg-emerald-400", text: "text-emerald-400" };
  if (diasEtapa <= 10) return { label: "Atenção", dot: "bg-amber-400",  text: "text-amber-400" };
  return { label: "Crítico", dot: "bg-rose-400", text: "text-rose-400" };
}
function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}
function fmtBRL(v: number) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}k`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}
function fmtBRLFull(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

// ─── LEAD FORM MODAL ──────────────────────────────────────────────────────────
function LeadFormModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (d: Partial<Lead>) => void;
  initial?: Partial<Lead>;
}) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    cliente:   initial?.cliente   ?? "",
    telefone:  initial?.telefone  ?? "",
    email:     initial?.email     ?? "",
    interesse: initial?.interesse ?? "Apartamento",
    bairro:    initial?.bairro    ?? "",
    orcamento: String(initial?.orcamento ?? ""),
    corretor:  initial?.corretor  ?? "",
    origem:    initial?.origem    ?? "Site",
    prioridade:initial?.prioridade ?? "Média" as Prioridade,
    etapa:     initial?.etapa     ?? "Prospecção" as Etapa,
    obs:       initial?.obs       ?? "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold text-white">{isEdit ? "Editar Lead" : "Novo Lead"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? "Atualize as informações" : "Adicione ao funil imobiliário"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nome do Cliente</label>
              <input value={form.cliente} onChange={e => set("cliente", e.target.value)} placeholder="Nome completo" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="11999999999" className={FIELD} />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>E-mail</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="cliente@email.com" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Interesse</label>
              <select value={form.interesse} onChange={e => set("interesse", e.target.value)} className={SELECT}>
                {["Apartamento","Apartamento 2q","Apartamento 3q","Casa","Cobertura","Cobertura Duplex","Kitnet","Sala Comercial","Terreno"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Bairro / Região</label>
              <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Moema, SP" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Orçamento (R$)</label>
              <input type="number" value={form.orcamento} onChange={e => set("orcamento", e.target.value)} placeholder="900000" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Prioridade</label>
              <select value={form.prioridade} onChange={e => set("prioridade", e.target.value)} className={SELECT}>
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Corretor Responsável</label>
              <input value={form.corretor} onChange={e => set("corretor", e.target.value)} placeholder="Nome do corretor" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Origem</label>
              <select value={form.origem} onChange={e => set("origem", e.target.value)} className={SELECT}>
                {["Site","Instagram","Portal Zap","OLX","Google","Indicação","WhatsApp"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {isEdit && (
              <div className="col-span-2">
                <label className={LABEL}>Etapa</label>
                <select value={form.etapa} onChange={e => set("etapa", e.target.value)} className={SELECT}>
                  {ETAPAS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className={LABEL}>Observações</label>
              <textarea value={form.obs} onChange={e => set("obs", e.target.value)} rows={2} placeholder="Notas sobre o cliente..." className={`${FIELD} resize-none`} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button
            onClick={() => {
              if (!form.cliente.trim()) { toast.error("Nome é obrigatório"); return; }
              onSave({ ...form, orcamento: Number(form.orcamento) || 0 });
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          >
            {isEdit ? "Salvar Alterações" : "Adicionar ao Pipeline"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LEAD DETAIL DRAWER ───────────────────────────────────────────────────────
const DRAWER_TABS = [
  { id: "info",    short: "Info",     icon: Building2 },
  { id: "notas",   short: "Notas",    icon: FileText },
  { id: "tarefas", short: "Tarefas",  icon: CheckCircle2 },
  { id: "hist",    short: "Histórico",icon: Clock },
  { id: "ia",      short: "IA",       icon: Brain },
];

const SCORE_AI: Record<Etapa, number> = {
  "Prospecção": 20, "Qualificação": 40, "Apresentação": 60, "Negociação": 80, "Fechamento": 95,
};
const AI_MSG: Record<Etapa, string> = {
  "Prospecção":  "Lead recém-chegado. Faça o primeiro contato em até 24h para aumentar as chances de qualificação.",
  "Qualificação":"Verifique orçamento e timeline de compra. Agende uma visita para converter para Apresentação.",
  "Apresentação":"Apresente imóveis que correspondam ao perfil. Colete feedback e ajuste as opções.",
  "Negociação":  "Estágio crítico. Envie a proposta formal e defina um prazo de resposta para fechar o ciclo.",
  "Fechamento":  "Lead prestes a fechar. Prepare documentação e acione o jurídico para agilizar o contrato.",
};

function LeadDetailDrawer({ lead, onClose, onEdit, onGanho, onPerdido, onDelete, onMoveStage, onUpdateLead }: {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
  onGanho: () => void;
  onPerdido: () => void;
  onDelete: () => void;
  onMoveStage: (etapa: Etapa) => void;
  onUpdateLead: (patch: Partial<Lead>) => void;
}) {
  const [tab, setTab] = useState("info");
  const [notaText, setNotaText] = useState(lead.obs);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(lead.tags ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditingNota, setIsEditingNota] = useState(false);

  const temp = getTemperatura(lead.diasEtapa);
  const tc = TEMP_CFG[temp];
  const TempIcon = tc.icon;
  const sla = getSLA(lead.diasEtapa);
  const etapaIdx = ETAPAS.indexOf(lead.etapa);
  const score = SCORE_AI[lead.etapa];
  const phoneRaw = lead.telefone.replace(/\D/g, "");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    onUpdateLead({ tags: next });
    setTagInput("");
  };
  const removeTag = (t: string) => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    onUpdateLead({ tags: next });
  };

  const QUICK_ACTIONS = [
    { label: "WhatsApp",    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20", icon: MessageSquare, href: `https://wa.me/55${phoneRaw}` },
    { label: "Ligar",       color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20",             icon: Phone,         href: `tel:${phoneRaw}` },
    { label: "E-mail",      color: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",         icon: Mail,          href: lead.email ? `mailto:${lead.email}` : undefined },
    { label: "Visita",      color: "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20",     icon: Calendar,      href: undefined },
    { label: "Proposta",    color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20",             icon: FileText,      href: undefined },
    { label: "Fechar",      color: "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20",             icon: CheckCircle2,  href: undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[546px] bg-[var(--color-surface)] border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">

        {/* ── Hero ── */}
        <div className="relative shrink-0 bg-[var(--color-surface)] border-b border-white/[0.06]">
          {/* Top action bar */}
          <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onGanho}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-all active:scale-95"
              >
                <Trophy className="w-3 h-3" /> Ganho
              </button>
              <button
                onClick={onPerdido}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-all active:scale-95"
              >
                <ThumbsDown className="w-3 h-3" /> Perdido
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTab("ia")}
                className={cn(
                  "p-1.5 rounded-lg border transition-all",
                  tab === "ia"
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                    : "border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10"
                )}
                title="IA Copilot"
              >
                <Brain className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="relative flex items-center gap-4 px-5 pb-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-semibold shrink-0 select-none", tc.avatarBg)}>
              {getInitials(lead.cliente)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-white truncate leading-tight">{lead.cliente}</h2>
                <span className={cn("inline-flex items-center gap-1 text-xs shrink-0", tc.text)}>
                  <TempIcon className="w-3 h-3" /> {tc.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                <span className="text-sm font-semibold text-white font-mono">{fmtBRLFull(lead.orcamento)}</span>
                <div className="w-px h-3 bg-white/10 shrink-0" />
                <span className={cn(
                  "flex items-center gap-1",
                  lead.prioridade === "Alta" ? "text-rose-400"
                  : lead.prioridade === "Média" ? "text-amber-400"
                  : "text-slate-500"
                )}>
                  {lead.prioridade}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={cn("w-1.5 h-1.5 rounded-full", sla.dot)} />
                  SLA · {sla.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stage stepper */}
          <div className="relative px-5 pb-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center min-w-max">
              {ETAPAS.map((stg, idx) => {
                const isActive = lead.etapa === stg;
                const isPast = etapaIdx > idx;
                const isLast = idx === ETAPAS.length - 1;
                return (
                  <span key={stg} className="flex items-center">
                    <button
                      onClick={() => onMoveStage(stg)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer border",
                        isActive ? "bg-blue-500/15 text-blue-300 border-blue-500/35"
                        : isPast  ? "text-emerald-500/70 border-transparent hover:border-white/10 hover:bg-white/5"
                        : "text-slate-600 border-transparent hover:text-slate-300 hover:border-white/10 hover:bg-white/5"
                      )}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                      {isPast   && <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0"><Check className="w-2 h-2 text-emerald-400" /></span>}
                      {stg}
                    </button>
                    {!isLast && <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 mx-0.5" />}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-none shrink-0 bg-[var(--color-surface)] px-1 pt-1 gap-0.5">
          {DRAWER_TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 pt-2 pb-2.5 px-3.5 text-[10px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer min-w-[64px] rounded-t-lg",
                  isActive ? "text-blue-400 bg-white/[0.04]" : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.03]"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.short}</span>
                {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-blue-400" />}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {/* INFO */}
          {tab === "info" && (
            <div className="px-5 py-4 space-y-3">
              {/* Row principal */}
              <div className="bg-[var(--color-surface-elevated)] border border-white/[0.06] rounded-xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Interesse</p>
                  <p className="text-sm font-semibold text-white">{lead.interesse}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Orçamento</p>
                  <p className="text-sm font-semibold text-white">{fmtBRLFull(lead.orcamento)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Responsável</p>
                  <p className="text-sm font-semibold text-white">{lead.corretor || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Prioridade</p>
                  <p className={cn("text-sm font-semibold",
                    lead.prioridade === "Alta" ? "text-rose-400"
                    : lead.prioridade === "Média" ? "text-amber-400"
                    : "text-slate-400"
                  )}>{lead.prioridade}</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-[var(--color-surface-elevated)] border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-3">Ações Rápidas</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_ACTIONS.map(a => (
                    a.href ? (
                      <a
                        key={a.label}
                        href={a.href}
                        target={a.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-xs font-medium transition-all"
                      >
                        <a.icon className="w-4 h-4" />
                        {a.label}
                      </a>
                    ) : (
                      <button
                        key={a.label}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-xs font-medium transition-all"
                        onClick={() => toast.info(`${a.label} — em breve`)}
                      >
                        <a.icon className="w-4 h-4" />
                        {a.label}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* AI Copilot */}
              <div className="bg-[var(--color-surface-elevated)] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <p className="text-xs text-slate-400">Recomendação Axis Copilot</p>
                  </div>
                  <span className="text-xs text-violet-400">IA</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Score</span>
                    <span className="text-sm font-semibold text-white">{score}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        score >= 70 ? "bg-emerald-400" : score >= 40 ? "bg-amber-400" : "bg-blue-400"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{AI_MSG[lead.etapa]}</p>
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500">Sugestão de ação:</span>
                  <button
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => toast.info("Abrindo sugestão...")}
                  >
                    Aplicar Proposta →
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-[var(--color-surface-elevated)] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-xs text-slate-500">Tags Corporativas</p>
                </div>
                {tags.length === 0 ? (
                  <p className="text-xs text-slate-600 italic mb-3">Nenhuma tag adicionada ainda</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300">
                        {t}
                        <button onClick={() => removeTag(t)} className="text-slate-600 hover:text-red-400 ml-0.5"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Nova tag... (Enter para adicionar)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
                  />
                  <button onClick={addTag} className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium transition-all">+</button>
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-[var(--color-surface-elevated)] border border-white/[0.06] rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 mb-2">Contato</p>
                {lead.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <a href={`tel:${phoneRaw}`} className="text-sm text-slate-300 hover:text-white">{lead.telefone}</a>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-slate-300 hover:text-white">{lead.email}</a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-sm text-slate-300">{lead.bairro}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-sm text-slate-300">Origem: {lead.origem}</span>
                </div>
              </div>
            </div>
          )}

          {/* NOTAS */}
          {tab === "notas" && (
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observações e Notas</p>
                {!isEditingNota && (
                  <button onClick={() => setIsEditingNota(true)} className="text-[10px] font-black text-blue-400 hover:text-blue-300">Editar</button>
                )}
              </div>
              {isEditingNota ? (
                <div className="space-y-3">
                  <textarea
                    value={notaText}
                    onChange={e => setNotaText(e.target.value)}
                    rows={8}
                    placeholder="Adicione notas sobre este lead..."
                    className={`${FIELD} resize-none`}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => { setNotaText(lead.obs); setIsEditingNota(false); }} className="text-slate-400 text-xs h-8">Cancelar</Button>
                    <Button
                      onClick={() => { onUpdateLead({ obs: notaText }); setIsEditingNota(false); toast.success("Nota salva!"); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
                    >
                      <Send className="w-3 h-3 mr-1.5" /> Salvar Nota
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingNota(true)}
                  className={cn(
                    "min-h-[120px] p-4 rounded-xl border cursor-text",
                    notaText ? "bg-white/[0.03] border-white/[0.06] text-sm text-slate-300 leading-relaxed" : "bg-white/[0.02] border-dashed border-white/10 text-slate-600 text-sm italic"
                  )}
                >
                  {notaText || "Clique para adicionar uma nota..."}
                </div>
              )}
            </div>
          )}

          {/* TAREFAS */}
          {tab === "tarefas" && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tarefas</p>
              <div className="space-y-2">
                {[
                  { label: "Ligar para o cliente", done: true  },
                  { label: "Enviar proposta por e-mail", done: false },
                  { label: "Agendar visita ao imóvel", done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", task.done ? "bg-emerald-500 border-emerald-500" : "border-slate-600")}>
                      {task.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={cn("text-sm", task.done ? "line-through text-slate-600" : "text-slate-300")}>{task.label}</span>
                  </div>
                ))}
                <button className="w-full flex items-center gap-2 p-3 border border-dashed border-white/10 rounded-xl text-slate-600 hover:text-slate-400 hover:border-white/20 text-sm transition-all">
                  <Plus className="w-3.5 h-3.5" /> Nova tarefa
                </button>
              </div>
            </div>
          )}

          {/* HIST */}
          {tab === "hist" && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Histórico</p>
              <div className="space-y-3">
                {[
                  { label: `Entrou na etapa ${lead.etapa}`, time: `${lead.diasEtapa}d atrás`, icon: Building2 },
                  { label: "Cadastrado no pipeline", time: lead.criadoEm, icon: Plus },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3 h-3 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">{item.label}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IA */}
          {tab === "ia" && (
            <div className="px-5 py-4 space-y-4">
              <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-black text-white">Análise Axis Copilot</h3>
                </div>

                {/* Score meter */}
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-black text-white">{score}</span>
                    <span className="text-sm text-slate-500 mb-1">/100</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700",
                        score >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-400"
                        : score >= 40 ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                        : "bg-gradient-to-r from-blue-400 to-cyan-400"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Score de probabilidade de fechamento</p>
                </div>

                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 mb-4">
                  <p className="text-xs text-slate-300 leading-relaxed">{AI_MSG[lead.etapa]}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-white">{lead.diasEtapa}d</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Na Etapa Atual</p>
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                    <p className={cn("text-lg font-black", score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-blue-400")}>{score}%</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Prob. Conversão</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-white/[0.06] px-5 py-3 bg-[var(--color-surface)]">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400 flex-1">Confirmar exclusão permanente?</p>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="text-slate-400 text-xs h-8">Cancelar</Button>
              <Button onClick={() => { onDelete(); onClose(); }} className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 px-4">Excluir</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(true)} className="border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 gap-1.5 h-9 px-4 text-xs">
                <Trash className="w-3.5 h-3.5" /> Excluir
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onClose} className="text-slate-400 font-bold px-4 h-9 hover:text-white text-xs">Fechar</Button>
                <Button onClick={onEdit} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-5 h-9 text-xs">
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Editar Lead
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN CARD ──────────────────────────────────────────────────────────────
function LeadCard({ lead, onSelect, isDragging, onDragStart, onDragEnd }: {
  lead: Lead;
  onSelect: (l: Lead) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const temp = getTemperatura(lead.diasEtapa);
  const tc = TEMP_CFG[temp];
  const TempIcon = tc.icon;
  const sla = getSLA(lead.diasEtapa);
  const cfg = ETAPA_CFG[lead.etapa];
  const isStale = lead.diasEtapa >= 7;

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(lead)}
      className={cn(
        "bg-[var(--color-surface-elevated)] border border-white/[0.07] rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer shadow-lg select-none group",
        isDragging && "opacity-40 scale-95 rotate-1 border-blue-500/40"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0", tc.avatar)}>
            {getInitials(lead.cliente)}
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">{lead.cliente}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TempIcon className="w-2.5 h-2.5 text-slate-500" />
              <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-full border",
                lead.prioridade === "Alta" ? "text-red-400 bg-red-500/10 border-red-500/20"
                : lead.prioridade === "Média" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-slate-500 bg-slate-500/10 border-slate-500/20"
              )}>{lead.prioridade}</span>
            </div>
          </div>
        </div>
        <span className="text-slate-600 text-lg font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">⠿</span>
      </div>

      {/* Etapa badge */}
      <div className="mb-3">
        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", cfg.bg, cfg.color, cfg.border)}>
          ⚡ {lead.etapa.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-[10px]">
          <Building2 className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-slate-300">{lead.interesse}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-slate-500">{lead.bairro}</span>
        </div>
      </div>

      {/* Value + date */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-black text-white">{fmtBRL(lead.orcamento)}</span>
        <span className="text-[9px] text-slate-600">{lead.criadoEm}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1 text-[9px] font-bold", isStale ? "text-red-400" : "text-slate-600")}>
          {isStale && <AlertCircle className="w-2.5 h-2.5" />}
          <Clock className="w-2.5 h-2.5" />
          <span>{lead.diasEtapa === 0 ? "Hoje" : `${lead.diasEtapa}d`}</span>
        </div>
        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", sla.cls)}>{sla.label}</span>
      </div>
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────────────────────
function LeadRow({ lead, onSelect }: { lead: Lead; onSelect: (l: Lead) => void }) {
  const cfg = ETAPA_CFG[lead.etapa];
  const sla = getSLA(lead.diasEtapa);
  const temp = getTemperatura(lead.diasEtapa);
  const tc = TEMP_CFG[temp];

  return (
    <div
      onClick={() => onSelect(lead)}
      className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all group"
    >
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0", tc.avatar)}>
        {getInitials(lead.cliente)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{lead.cliente}</p>
        <p className="text-[10px] text-slate-500 truncate">{lead.interesse} · {lead.bairro}</p>
      </div>
      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0", cfg.bg, cfg.color, cfg.border)}>{lead.etapa}</span>
      <span className="text-sm font-black text-white shrink-0">{fmtBRL(lead.orcamento)}</span>
      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0", sla.cls)}>{sla.label}</span>
      <span className="text-[10px] text-slate-600 shrink-0 w-16 text-right">{lead.corretor}</span>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PipelineImobiliario() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLeadEtapa, setNewLeadEtapa] = useState<Etapa>("Prospecção");

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Etapa | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("imobiliario_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setLeads(data.map(r => ({
          id: r.id,
          cliente: r.nome ?? "",
          telefone: r.telefone ?? "",
          email: r.email ?? "",
          interesse: r.interesse ?? "",
          bairro: r.bairro ?? "",
          orcamento: r.orcamento ?? 0,
          corretor: r.corretor ?? "",
          origem: r.origem ?? "",
          etapa: (r.etapa ?? "Prospecção") as Etapa,
          diasEtapa: r.dias_etapa ?? 0,
          prioridade: (r.prioridade ?? "Média") as Prioridade,
          obs: r.obs ?? "",
          tags: r.tags ?? [],
          status: (r.status ?? "Ativo") as Status,
          criadoEm: r.criado_em ?? r.created_at?.split("T")[0] ?? "",
        })));
      });
  }, []);

  // Async save to Supabase
  const saveToDB = async (lead: Lead) => {
    if (!supabase) return;
    const { id, ...rest } = lead;
    const row = {
      nome: rest.cliente, telefone: rest.telefone, email: rest.email,
      interesse: rest.interesse, bairro: rest.bairro, orcamento: rest.orcamento,
      corretor: rest.corretor, origem: rest.origem, etapa: rest.etapa,
      dias_etapa: rest.diasEtapa, prioridade: rest.prioridade, obs: rest.obs,
      status: rest.status,
    };
    await supabase.from("imobiliario_leads").update(row).eq("id", id);
  };

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, ...patch };
      saveToDB(updated);
      return updated;
    }));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...patch } : null);
  };

  const handleSave = async (form: Partial<Lead>) => {
    const novo: Lead = {
      ...form as Lead,
      id: Date.now().toString(),
      etapa: newLeadEtapa,
      diasEtapa: 0,
      tags: [],
      status: "Ativo",
      criadoEm: new Date().toISOString().split("T")[0],
    };
    setLeads(prev => [novo, ...prev]);
    if (supabase) {
      const { data } = await supabase.from("imobiliario_leads").insert({
        nome: novo.cliente, telefone: novo.telefone, email: novo.email,
        interesse: novo.interesse, bairro: novo.bairro, orcamento: novo.orcamento,
        corretor: novo.corretor, origem: novo.origem, etapa: novo.etapa,
        dias_etapa: novo.diasEtapa, prioridade: novo.prioridade, obs: novo.obs,
        status: novo.status, tags: novo.tags,
      }).select("id").single();
      if (data?.id) setLeads(prev => prev.map(l => l.id === novo.id ? { ...l, id: data.id } : l));
    }
    toast.success(`Lead adicionado em ${newLeadEtapa}!`);
  };

  const handleEdit = (form: Partial<Lead>) => {
    if (!editLead) return;
    const updated = { ...editLead, ...form };
    setLeads(prev => prev.map(l => l.id === editLead.id ? updated : l));
    if (selectedLead?.id === editLead.id) setSelectedLead(updated);
    saveToDB(updated);
    toast.success("Lead atualizado!");
    setEditLead(null);
  };

  const handleDelete = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (supabase) supabase.from("imobiliario_leads").delete().eq("id", id);
    toast.success("Lead removido.");
  };

  const handleDrop = (etapa: Etapa) => {
    if (!draggedId || draggedId === "") return;
    updateLead(draggedId, { etapa, diasEtapa: 0 });
    const lead = leads.find(l => l.id === draggedId);
    if (lead && lead.etapa !== etapa) toast.success(`${lead.cliente} → ${etapa}`);
    setDraggedId(null);
    setDragOverCol(null);
  };

  // KPIs
  const totalVGV = leads.reduce((s, l) => s + l.orcamento, 0);
  const ganhos = leads.filter(l => l.status === "Ganho").length;
  const ativos = leads.filter(l => l.status === "Ativo").length;
  const perdidos = leads.filter(l => l.status === "Perdido").length;

  return (
    <PageContainer
      title="Leads & Pipeline"
      description="Gerencie leads imobiliários em visão kanban ou lista. Arraste para mover entre etapas."
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-0.5">
            <button onClick={() => setView("kanban")} className={cn("p-1.5 rounded-lg transition-all", view === "kanban" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white")}>
              <Columns3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("lista")} className={cn("p-1.5 rounded-lg transition-all", view === "lista" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white")}>
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button onClick={() => { setNewLeadEtapa("Prospecção"); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
            <Plus className="w-4 h-4" /> Novo Lead
          </Button>
        </div>
      }
    >
      {showForm && <LeadFormModal onClose={() => setShowForm(false)} onSave={handleSave} />}
      {editLead && <LeadFormModal onClose={() => setEditLead(null)} onSave={handleEdit} initial={editLead} />}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEdit={() => { setEditLead(selectedLead); setSelectedLead(null); }}
          onGanho={() => { updateLead(selectedLead.id, { status: "Ganho", etapa: "Fechamento" }); toast.success("Lead fechado como GANHO! 🏆"); }}
          onPerdido={() => { updateLead(selectedLead.id, { status: "Perdido" }); toast.warning("Lead marcado como Perdido."); setSelectedLead(null); }}
          onDelete={() => handleDelete(selectedLead.id)}
          onMoveStage={etapa => updateLead(selectedLead.id, { etapa, diasEtapa: 0 })}
          onUpdateLead={patch => updateLead(selectedLead.id, patch)}
        />
      )}

      {/* KPI Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "VGV Potencial",  value: fmtBRL(totalVGV),  color: "text-blue-400",    dot: "bg-blue-400" },
          { label: "Ativos",         value: `${ativos}`,        color: "text-white",       dot: "bg-slate-400" },
          { label: "Fechados (Ganho)",value: `${ganhos}`,       color: "text-emerald-400", dot: "bg-emerald-400" },
          { label: "Perdidos",       value: `${perdidos}`,      color: "text-rose-400",    dot: "bg-rose-400" },
          { label: "Conversão",      value: leads.length > 0 ? `${((ganhos / leads.length) * 100).toFixed(0)}%` : "0%", color: "text-cyan-400", dot: "bg-cyan-400" },
        ].map(k => (
          <div key={k.label} className="bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3 min-w-[140px]">
            <div className={cn("w-2 h-2 rounded-full shrink-0", k.dot)} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{k.label}</p>
              <p className={cn("text-lg font-black", k.color)}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KANBAN */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2">
          {ETAPAS.map(etapa => {
            const col = leads.filter(l => l.etapa === etapa);
            const vgvCol = col.reduce((s, l) => s + l.orcamento, 0);
            const cfg = ETAPA_CFG[etapa];
            const isDragTarget = dragOverCol === etapa;

            return (
              <div
                key={etapa}
                className="flex-shrink-0 w-[290px] flex flex-col"
                onDragOver={e => { e.preventDefault(); setDragOverCol(etapa); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                onDrop={() => handleDrop(etapa)}
              >
                {/* Column Header */}
                <div className={cn(
                  "p-3 rounded-xl mb-3 border transition-all",
                  cfg.border, cfg.headerBg,
                  isDragTarget && "ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/10"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                      <span className={cn("text-[11px] font-black uppercase tracking-widest", cfg.color)}>{etapa}</span>
                    </div>
                    <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", cfg.bg, cfg.color, cfg.border)}>{col.length}</span>
                  </div>
                  {vgvCol > 0 && (
                    <p className="text-[10px] text-slate-600 font-bold">{fmtBRL(vgvCol)}</p>
                  )}
                </div>

                {/* Cards */}
                <div className={cn(
                  "space-y-3 flex-1 min-h-[80px] rounded-xl transition-all",
                  isDragTarget && "bg-blue-500/[0.04] ring-1 ring-blue-500/20 ring-dashed p-2"
                )}>
                  {col.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={setSelectedLead}
                      isDragging={draggedId === lead.id}
                      onDragStart={() => setDraggedId(lead.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                    />
                  ))}
                  {col.length === 0 && !isDragTarget && (
                    <div className="border border-dashed border-white/[0.06] rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-700 font-bold">Nenhum lead</p>
                    </div>
                  )}
                </div>

                {/* Add button */}
                <button
                  onClick={() => { setNewLeadEtapa(etapa); setShowForm(true); }}
                  className="mt-3 flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-white/[0.08] rounded-xl text-slate-600 hover:text-slate-400 hover:border-white/20 text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  <Plus className="w-3 h-3" /> Novo Lead
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST */}
      {view === "lista" && (
        <div className="bg-[var(--color-surface-elevated)]/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="w-8" />
            <p className="flex-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">Lead</p>
            <p className="w-28 text-[9px] font-black text-slate-500 uppercase tracking-widest">Etapa</p>
            <p className="w-24 text-[9px] font-black text-slate-500 uppercase tracking-widest">Orçamento</p>
            <p className="w-16 text-[9px] font-black text-slate-500 uppercase tracking-widest">SLA</p>
            <p className="w-16 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Corretor</p>
          </div>
          {leads.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-600 text-sm">Nenhum lead cadastrado</p>
            </div>
          ) : (
            leads.map(lead => <LeadRow key={lead.id} lead={lead} onSelect={setSelectedLead} />)
          )}
        </div>
      )}
    </PageContainer>
  );
}
