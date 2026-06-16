import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, ChevronRight, ChevronLeft, Building2, DollarSign,
  MapPin, User, MessageSquare, X, TrendingUp, Columns3,
  Clock, AlertCircle, Edit2, Trash2, Phone, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

type Etapa = "Novo" | "Contatado" | "Visita Agendada" | "Proposta" | "Negociação" | "Fechado";
type Prioridade = "Alta" | "Média" | "Baixa";

type Lead = {
  id: string;
  cliente: string;
  telefone: string;
  email?: string;
  interesse: string;
  bairro: string;
  orcamento: number;
  corretor: string;
  origem: string;
  etapa: Etapa;
  diasEtapa: number;
  prioridade: Prioridade;
  obs?: string;
};

const ETAPAS: Etapa[] = ["Novo", "Contatado", "Visita Agendada", "Proposta", "Negociação", "Fechado"];

const ETAPA_CONFIG: Record<Etapa, { color: string; bg: string; border: string; dot: string; headerBg: string }> = {
  "Novo": { color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20", dot: "bg-slate-400", headerBg: "bg-slate-500/5" },
  "Contatado": { color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400", headerBg: "bg-blue-500/5" },
  "Visita Agendada": { color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400", headerBg: "bg-amber-500/5" },
  "Proposta": { color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/20", dot: "bg-violet-400", headerBg: "bg-violet-500/5" },
  "Negociação": { color: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/20", dot: "bg-cyan-400", headerBg: "bg-cyan-500/5" },
  "Fechado": { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400", headerBg: "bg-emerald-500/5" },
};

const MOCK_LEADS: Lead[] = [
  { id: "1", cliente: "Roberto Silva", telefone: "11988887777", email: "roberto@email.com", interesse: "Apartamento 3q", bairro: "Moema", orcamento: 900000, corretor: "Ana Lima", origem: "Instagram", etapa: "Visita Agendada", diasEtapa: 3, prioridade: "Alta", obs: "Cliente tem 2 filhos, quer ver espaço dos quartos." },
  { id: "2", cliente: "Patrícia Costa", telefone: "11977776666", email: "patricia@email.com", interesse: "Casa 4q", bairro: "Alphaville", orcamento: 1500000, corretor: "Carlos Matos", origem: "Site", etapa: "Proposta", diasEtapa: 5, prioridade: "Alta", obs: "Proposta enviada. Aguardando retorno." },
  { id: "3", cliente: "Marcos Alves", telefone: "11966665555", email: "", interesse: "Cobertura Duplex", bairro: "Vila Olímpia", orcamento: 2500000, corretor: "Fernanda Rocha", origem: "Indicação", etapa: "Contatado", diasEtapa: 2, prioridade: "Média", obs: "" },
  { id: "4", cliente: "Luciana Torres", telefone: "11955554444", email: "luciana@email.com", interesse: "Sala Comercial", bairro: "Faria Lima", orcamento: 1200000, corretor: "Carlos Matos", origem: "Portal Zap", etapa: "Novo", diasEtapa: 1, prioridade: "Média", obs: "" },
  { id: "5", cliente: "Eduardo Pinto", telefone: "11944443333", email: "", interesse: "Apartamento", bairro: "Brooklin", orcamento: 1200000, corretor: "Ana Lima", origem: "Google", etapa: "Fechado", diasEtapa: 15, prioridade: "Baixa", obs: "Negócio fechado! Assinou em 14/06." },
  { id: "6", cliente: "Juliana Mendes", telefone: "11933332222", email: "", interesse: "Casa", bairro: "Granja Viana", orcamento: 800000, corretor: "Ana Lima", origem: "Instagram", etapa: "Novo", diasEtapa: 0, prioridade: "Alta", obs: "" },
  { id: "7", cliente: "Ricardo Nunes", telefone: "11922221111", email: "", interesse: "Apartamento 2q", bairro: "Vila Mariana", orcamento: 650000, corretor: "Fernanda Rocha", origem: "WhatsApp", etapa: "Negociação", diasEtapa: 8, prioridade: "Alta", obs: "Urgente — concorrência com outra imobiliária." },
  { id: "8", cliente: "Camila Souza", telefone: "11911110000", email: "camila@email.com", interesse: "Cobertura", bairro: "Higienópolis", orcamento: 3200000, corretor: "Ana Lima", origem: "Indicação", etapa: "Proposta", diasEtapa: 2, prioridade: "Alta", obs: "" },
  { id: "9", cliente: "Felipe Araújo", telefone: "11900009999", email: "", interesse: "Apartamento 3q", bairro: "Pinheiros", orcamento: 750000, corretor: "Carlos Matos", origem: "OLX", etapa: "Contatado", diasEtapa: 4, prioridade: "Baixa", obs: "" },
];

const FIELD = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50";
const SELECT = "w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50";
const LABEL = "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

// ─── LEAD FORM MODAL ──────────────────────────────────────────────────────────
function LeadFormModal({ onClose, onSave, initial }: {
  onClose: () => void;
  onSave: (d: any) => void;
  initial?: Partial<Lead>;
}) {
  const [form, setForm] = useState({
    cliente: initial?.cliente ?? "",
    telefone: initial?.telefone ?? "",
    email: initial?.email ?? "",
    interesse: initial?.interesse ?? "Apartamento",
    bairro: initial?.bairro ?? "",
    orcamento: String(initial?.orcamento ?? ""),
    corretor: initial?.corretor ?? "",
    origem: initial?.origem ?? "Site",
    prioridade: initial?.prioridade ?? "Média",
    etapa: initial?.etapa ?? "Novo",
    obs: initial?.obs ?? "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = Boolean(initial?.id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-base font-black text-white">{isEdit ? "Editar Lead" : "Novo Lead no Pipeline"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? "Atualize as informações do lead" : "Adicione um novo lead ao funil"}</p>
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
                {["Apartamento","Casa","Cobertura","Kitnet","Comercial","Terreno"].map(t => <option key={t}>{t}</option>)}
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
              <textarea value={form.obs} onChange={e => set("obs", e.target.value)} rows={2} placeholder="Notas sobre o cliente, preferências..." className={`${FIELD} resize-none`} />
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
function LeadDetailDrawer({ lead, onClose, onEdit, onRemove, onMove }: {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onMove: (dir: "avancar" | "voltar") => void;
}) {
  const etapaIdx = ETAPAS.indexOf(lead.etapa);
  const cfg = ETAPA_CONFIG[lead.etapa];
  const phoneRaw = lead.telefone.replace(/\D/g, "");
  const priColor = lead.prioridade === "Alta"
    ? "bg-red-500/10 text-red-400 border-red-500/20"
    : lead.prioridade === "Média"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-slate-500/10 text-slate-400 border-slate-500/20";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[#0B1120] border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`p-6 border-b border-white/5 ${cfg.headerBg}`}>
          <div className="flex items-start justify-between mb-4">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              {lead.etapa}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              {lead.cliente.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="font-black text-white text-sm">{lead.cliente}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${priColor}`}>{lead.prioridade} Prioridade</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">{lead.origem}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* KPIs */}
          <div className="px-6 py-4 border-b border-white/5 grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-sm font-black text-white">
                {lead.orcamento >= 1e6 ? `R$ ${(lead.orcamento / 1e6).toFixed(1)}M` : `R$ ${(lead.orcamento / 1000).toFixed(0)}k`}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Orçamento</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className={`text-sm font-black ${lead.diasEtapa >= 7 ? "text-red-400" : "text-white"}`}>{lead.diasEtapa}d</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Na Etapa</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-sm font-black text-white">{etapaIdx + 1}/{ETAPAS.length}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Progresso</p>
            </div>
          </div>

          {/* Funil visual */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className={LABEL}>Progresso no Funil</p>
            <div className="flex gap-1 mt-2">
              {ETAPAS.map((e, i) => (
                <div key={e} title={e} className={`h-1.5 flex-1 rounded-full ${i <= etapaIdx ? cfg.dot.replace("bg-", "bg-") : "bg-white/10"}`} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-600">Novo</span>
              <span className="text-[9px] text-slate-600">Fechado</span>
            </div>
          </div>

          {/* Interesse */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className={LABEL}>Interesse Imobiliário</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500">Tipo</p>
                <p className="text-sm font-bold text-white mt-0.5">{lead.interesse}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500">Bairro</p>
                <p className="text-sm font-bold text-white mt-0.5">{lead.bairro}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500">Corretor</p>
                <p className="text-sm font-bold text-white mt-0.5">{lead.corretor}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500">Dias parado</p>
                <p className={`text-sm font-bold mt-0.5 ${lead.diasEtapa >= 7 ? "text-red-400" : "text-white"}`}>{lead.diasEtapa === 0 ? "Hoje" : `${lead.diasEtapa} dias`}</p>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className={LABEL}>Contato</p>
            <div className="space-y-2 mt-2">
              {lead.telefone && (
                <a href={`tel:${phoneRaw}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm text-slate-300">{lead.telefone}</span>
                </a>
              )}
              {lead.email && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm text-slate-300">{lead.email}</span>
                </div>
              )}
              <a href={`https://wa.me/55${phoneRaw}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-bold">Abrir WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-400 ml-auto" />
              </a>
            </div>
          </div>

          {/* Obs */}
          {lead.obs && (
            <div className="px-6 py-4 border-b border-white/5">
              <p className={LABEL}>Observações</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <p className="text-sm text-slate-300 leading-relaxed">{lead.obs}</p>
              </div>
            </div>
          )}

          {/* Mover etapa */}
          <div className="px-6 py-4">
            <p className={LABEL}>Mover no Funil</p>
            <div className="flex gap-2 mt-2">
              {etapaIdx > 0 && (
                <button onClick={() => onMove("voltar")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-black border border-white/10 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> {ETAPAS[etapaIdx - 1]}
                </button>
              )}
              {etapaIdx < ETAPAS.length - 1 && (
                <button onClick={() => onMove("avancar")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl ${cfg.bg} ${cfg.color} text-[11px] font-black border ${cfg.border} hover:opacity-80 transition-all`}>
                  {ETAPAS[etapaIdx + 1]} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <Button onClick={onEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </Button>
          <Button onClick={() => { onRemove(); onClose(); }} variant="ghost" className="px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── LEAD CARD (Kanban) ───────────────────────────────────────────────────────
function LeadCard({ lead, onMove, onRemove, onSelect }: {
  lead: Lead;
  onMove: (id: string, dir: "avancar" | "voltar") => void;
  onRemove: (id: string) => void;
  onSelect: (lead: Lead) => void;
}) {
  const etapaIdx = ETAPAS.indexOf(lead.etapa);
  const priColor = lead.prioridade === "Alta"
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : lead.prioridade === "Média"
    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-slate-500 bg-slate-500/10 border-slate-500/20";
  const isStale = lead.diasEtapa >= 7;

  return (
    <div
      onClick={() => onSelect(lead)}
      className="bg-[#0F1929] border border-white/[0.07] rounded-xl p-4 hover:border-white/20 transition-all group shadow-lg cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
            {lead.cliente.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">{lead.cliente}</p>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${priColor}`}>{lead.prioridade}</span>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemove(lead.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-slate-600 hover:text-red-400 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Building2 className="w-3 h-3 shrink-0 text-slate-600" />
          <span className="text-slate-300">{lead.interesse}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <MapPin className="w-3 h-3 shrink-0 text-slate-600" />
          <span>{lead.bairro}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <DollarSign className="w-3 h-3 shrink-0 text-slate-600" />
          <span className="font-black text-white">
            R$ {lead.orcamento >= 1e6 ? `${(lead.orcamento / 1e6).toFixed(1)}M` : `${(lead.orcamento / 1000).toFixed(0)}k`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <User className="w-3 h-3 shrink-0 text-slate-600" />
          <span>{lead.corretor}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-[9px] mb-3">
        <span className="bg-white/[0.06] text-slate-500 px-2 py-0.5 rounded-full">{lead.origem}</span>
        <div className={`flex items-center gap-1 ${isStale ? "text-red-400" : "text-slate-600"}`}>
          {isStale && <AlertCircle className="w-2.5 h-2.5" />}
          <Clock className="w-2.5 h-2.5" />
          <span className="font-bold">{lead.diasEtapa === 0 ? "Hoje" : `${lead.diasEtapa}d`}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <a
          href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black transition-all border border-emerald-500/20"
        >
          <MessageSquare className="w-3 h-3" /> WhatsApp
        </a>
        <div className="flex gap-1">
          {etapaIdx > 0 && (
            <button onClick={() => onMove(lead.id, "voltar")} className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-white transition-all border border-white/[0.06]" title="Voltar">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {etapaIdx < ETAPAS.length - 1 && (
            <button onClick={() => onMove(lead.id, "avancar")} className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition-all border border-blue-500/20" title="Avançar">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PipelineImobiliario() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleSave = (form: any) => {
    const novo: Lead = { ...form, id: Date.now().toString(), etapa: "Novo", diasEtapa: 0 };
    setLeads(prev => [novo, ...prev]);
    toast.success("Lead adicionado ao pipeline!");
  };

  const handleEdit = (form: any) => {
    if (!editLead) return;
    const updated = { ...editLead, ...form };
    setLeads(prev => prev.map(l => l.id === editLead.id ? updated : l));
    if (selectedLead?.id === editLead.id) setSelectedLead(updated);
    toast.success("Lead atualizado!");
    setEditLead(null);
  };

  const moveCard = (id: string, direcao: "avancar" | "voltar") => {
    setLeads(prev =>
      prev.map(lead => {
        if (lead.id !== id) return lead;
        const idx = ETAPAS.indexOf(lead.etapa);
        if (direcao === "avancar" && idx < ETAPAS.length - 1) {
          const novaEtapa = ETAPAS[idx + 1];
          toast.success(`${lead.cliente} → ${novaEtapa}`);
          const updated = { ...lead, etapa: novaEtapa, diasEtapa: 0 };
          if (selectedLead?.id === id) setSelectedLead(updated);
          return updated;
        }
        if (direcao === "voltar" && idx > 0) {
          const novaEtapa = ETAPAS[idx - 1];
          toast.success(`${lead.cliente} ← ${novaEtapa}`);
          const updated = { ...lead, etapa: novaEtapa, diasEtapa: 0 };
          if (selectedLead?.id === id) setSelectedLead(updated);
          return updated;
        }
        return lead;
      })
    );
  };

  const removeCard = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success("Lead removido do pipeline.");
  };

  const totalVGV = leads.reduce((s, l) => s + (l.orcamento || 0), 0);
  const fechados = leads.filter(l => l.etapa === "Fechado");
  const vgvFechado = fechados.reduce((s, l) => s + (l.orcamento || 0), 0);
  const taxaConversao = leads.length > 0 ? ((fechados.length / leads.length) * 100).toFixed(1) : "0";

  return (
    <PageContainer
      title="Pipeline de Vendas"
      description="Acompanhe a jornada de cada lead do interesse ao fechamento do negócio."
      actions={
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      }
    >
      {showForm && <LeadFormModal onClose={() => setShowForm(false)} onSave={handleSave} />}
      {editLead && <LeadFormModal onClose={() => setEditLead(null)} onSave={handleEdit} initial={editLead} />}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEdit={() => { setEditLead(selectedLead); setSelectedLead(null); }}
          onRemove={() => removeCard(selectedLead.id)}
          onMove={dir => moveCard(selectedLead.id, dir)}
        />
      )}

      {/* KPI Bar */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[
          { icon: Columns3, label: "Total no Funil", value: `${leads.length} leads`, color: "text-blue-400" },
          { icon: DollarSign, label: "VGV Potencial", value: `R$ ${(totalVGV / 1e6).toFixed(1)}M`, color: "text-violet-400" },
          { icon: TrendingUp, label: "Fechados", value: `${fechados.length} · R$ ${(vgvFechado / 1e6).toFixed(1)}M`, color: "text-emerald-400" },
          { icon: TrendingUp, label: "Conversão", value: `${taxaConversao}%`, color: "text-cyan-400" },
        ].map(k => (
          <div key={k.label} className="bg-[#111827]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <k.icon className={`w-4 h-4 ${k.color}`} />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{k.label}</p>
              <p className="text-lg font-black text-white">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2">
        {ETAPAS.map(etapa => {
          const col = leads.filter(l => l.etapa === etapa);
          const vgvCol = col.reduce((s, l) => s + (l.orcamento || 0), 0);
          const cfg = ETAPA_CONFIG[etapa];
          const altas = col.filter(l => l.prioridade === "Alta").length;

          return (
            <div key={etapa} className="flex-shrink-0 w-[280px]">
              {/* Column Header */}
              <div className={`p-3 rounded-xl mb-3 border ${cfg.border} ${cfg.headerBg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${cfg.color}`}>{etapa}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{col.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  {vgvCol > 0 ? (
                    <p className="text-[10px] text-slate-600 font-bold">VGV: R$ {vgvCol >= 1e6 ? `${(vgvCol / 1e6).toFixed(1)}M` : `${(vgvCol / 1000).toFixed(0)}k`}</p>
                  ) : <span />}
                  {altas > 0 && (
                    <p className="text-[9px] text-red-400 font-black flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />{altas} urgente{altas > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[120px]">
                {col.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onMove={moveCard}
                    onRemove={removeCard}
                    onSelect={setSelectedLead}
                  />
                ))}
                {col.length === 0 && (
                  <div className="border border-dashed border-white/[0.06] rounded-xl p-6 text-center">
                    <p className="text-[10px] text-slate-700 font-bold">Nenhum lead</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
