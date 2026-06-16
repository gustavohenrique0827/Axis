import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, ChevronRight, ChevronLeft, Building2, DollarSign,
  MapPin, User, MessageSquare, X, TrendingUp, Columns3,
  Clock, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Etapa = "Novo" | "Contatado" | "Visita Agendada" | "Proposta" | "Negociação" | "Fechado";
type Prioridade = "Alta" | "Média" | "Baixa";

type Lead = {
  id: string;
  cliente: string;
  telefone: string;
  interesse: string;
  bairro: string;
  orcamento: number;
  corretor: string;
  origem: string;
  etapa: Etapa;
  diasEtapa: number;
  prioridade: Prioridade;
};

const ETAPAS: Etapa[] = ["Novo", "Contatado", "Visita Agendada", "Proposta", "Negociação", "Fechado"];

const ETAPA_CONFIG: Record<Etapa, { color: string; bg: string; border: string; dot: string; headerBg: string }> = {
  "Novo": {
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
    headerBg: "bg-slate-500/5",
  },
  "Contatado": {
    color: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    headerBg: "bg-blue-500/5",
  },
  "Visita Agendada": {
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    headerBg: "bg-amber-500/5",
  },
  "Proposta": {
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
    headerBg: "bg-violet-500/5",
  },
  "Negociação": {
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    dot: "bg-cyan-400",
    headerBg: "bg-cyan-500/5",
  },
  "Fechado": {
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    headerBg: "bg-emerald-500/5",
  },
};

const MOCK_LEADS: Lead[] = [
  { id: "1", cliente: "Roberto Silva", telefone: "11988887777", interesse: "Apartamento 3q", bairro: "Moema", orcamento: 900000, corretor: "Ana Lima", origem: "Instagram", etapa: "Visita Agendada", diasEtapa: 3, prioridade: "Alta" },
  { id: "2", cliente: "Patrícia Costa", telefone: "11977776666", interesse: "Casa 4q", bairro: "Alphaville", orcamento: 1500000, corretor: "Carlos Matos", origem: "Site", etapa: "Proposta", diasEtapa: 5, prioridade: "Alta" },
  { id: "3", cliente: "Marcos Alves", telefone: "11966665555", interesse: "Cobertura Duplex", bairro: "Vila Olímpia", orcamento: 2500000, corretor: "Fernanda Rocha", origem: "Indicação", etapa: "Contatado", diasEtapa: 2, prioridade: "Média" },
  { id: "4", cliente: "Luciana Torres", telefone: "11955554444", interesse: "Sala Comercial", bairro: "Faria Lima", orcamento: 1200000, corretor: "Carlos Matos", origem: "Portal Zap", etapa: "Novo", diasEtapa: 1, prioridade: "Média" },
  { id: "5", cliente: "Eduardo Pinto", telefone: "11944443333", interesse: "Apartamento", bairro: "Brooklin", orcamento: 1200000, corretor: "Ana Lima", origem: "Google", etapa: "Fechado", diasEtapa: 15, prioridade: "Baixa" },
  { id: "6", cliente: "Juliana Mendes", telefone: "11933332222", interesse: "Casa", bairro: "Granja Viana", orcamento: 800000, corretor: "Ana Lima", origem: "Instagram", etapa: "Novo", diasEtapa: 0, prioridade: "Alta" },
  { id: "7", cliente: "Ricardo Nunes", telefone: "11922221111", interesse: "Apartamento 2q", bairro: "Vila Mariana", orcamento: 650000, corretor: "Fernanda Rocha", origem: "WhatsApp", etapa: "Negociação", diasEtapa: 8, prioridade: "Alta" },
  { id: "8", cliente: "Camila Souza", telefone: "11911110000", interesse: "Cobertura", bairro: "Higienópolis", orcamento: 3200000, corretor: "Ana Lima", origem: "Indicação", etapa: "Proposta", diasEtapa: 2, prioridade: "Alta" },
  { id: "9", cliente: "Felipe Araújo", telefone: "11900009999", interesse: "Apartamento 3q", bairro: "Pinheiros", orcamento: 750000, corretor: "Carlos Matos", origem: "OLX", etapa: "Contatado", diasEtapa: 4, prioridade: "Baixa" },
];

function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    cliente: "", telefone: "", interesse: "Apartamento", bairro: "",
    orcamento: "", corretor: "", origem: "Site", prioridade: "Média",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Novo Lead no Pipeline</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Nome do Cliente</label>
              <input value={form.cliente} onChange={(e) => set("cliente", e.target.value)} placeholder="Nome completo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Telefone</label>
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="11999999999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Interesse</label>
              <select value={form.interesse} onChange={(e) => set("interesse", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Apartamento", "Casa", "Cobertura", "Kitnet", "Comercial", "Terreno"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Bairro / Região</label>
              <input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Moema, SP" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Orçamento (R$)</label>
              <input type="number" value={form.orcamento} onChange={(e) => set("orcamento", e.target.value)} placeholder="900000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Prioridade</label>
              <select value={form.prioridade} onChange={(e) => set("prioridade", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Corretor Responsável</label>
              <input value={form.corretor} onChange={(e) => set("corretor", e.target.value)} placeholder="Nome do corretor" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Origem</label>
              <select value={form.origem} onChange={(e) => set("origem", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Site", "Instagram", "Portal Zap", "OLX", "Google", "Indicação", "WhatsApp"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button
            onClick={() => { onSave(form); onClose(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          >
            Adicionar ao Pipeline
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead, onMove, onRemove }: {
  lead: Lead;
  onMove: (id: string, dir: "avancar" | "voltar") => void;
  onRemove: (id: string) => void;
}) {
  const etapaIdx = ETAPAS.indexOf(lead.etapa);
  const priColor = lead.prioridade === "Alta"
    ? "text-red-400 bg-red-500/10 border-red-500/20"
    : lead.prioridade === "Média"
    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-slate-500 bg-slate-500/10 border-slate-500/20";
  const isStale = lead.diasEtapa >= 7;

  return (
    <div className="bg-[#0F1929] border border-white/[0.07] rounded-xl p-4 hover:border-white/15 transition-all group shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
            {lead.cliente.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">{lead.cliente}</p>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${priColor}`}>
              {lead.prioridade}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(lead.id)}
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
            R$ {lead.orcamento >= 1000000
              ? `${(lead.orcamento / 1000000).toFixed(1)}M`
              : `${(lead.orcamento / 1000).toFixed(0)}k`}
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
      <div className="flex gap-2">
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
            <button
              onClick={() => onMove(lead.id, "voltar")}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-white transition-all border border-white/[0.06]"
              title="Voltar etapa"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {etapaIdx < ETAPAS.length - 1 && (
            <button
              onClick={() => onMove(lead.id, "avancar")}
              className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20"
              title="Avançar etapa"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PipelineImobiliario() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (form: any) => {
    const novo: Lead = {
      ...form,
      id: Date.now().toString(),
      etapa: "Novo",
      diasEtapa: 0,
      orcamento: Number(form.orcamento) || 0,
    };
    setLeads((prev) => [novo, ...prev]);
    toast.success("Lead adicionado ao pipeline!");
  };

  const moveCard = (id: string, direcao: "avancar" | "voltar") => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        const idx = ETAPAS.indexOf(lead.etapa);
        if (direcao === "avancar" && idx < ETAPAS.length - 1) {
          const novaEtapa = ETAPAS[idx + 1];
          toast.success(`${lead.cliente} avançou para ${novaEtapa}`);
          return { ...lead, etapa: novaEtapa, diasEtapa: 0 };
        }
        if (direcao === "voltar" && idx > 0) {
          const novaEtapa = ETAPAS[idx - 1];
          toast.success(`${lead.cliente} voltou para ${novaEtapa}`);
          return { ...lead, etapa: novaEtapa, diasEtapa: 0 };
        }
        return lead;
      })
    );
  };

  const removeCard = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead removido do pipeline.");
  };

  const totalVGV = leads.reduce((acc, l) => acc + (l.orcamento || 0), 0);
  const fechados = leads.filter((l) => l.etapa === "Fechado");
  const vgvFechado = fechados.reduce((acc, l) => acc + (l.orcamento || 0), 0);
  const taxaConversao = leads.length > 0 ? ((fechados.length / leads.length) * 100).toFixed(1) : "0";

  return (
    <PageContainer
      title="Pipeline de Vendas"
      description="Acompanhe a jornada de cada lead do interesse ao fechamento do negócio."
      actions={
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold"
        >
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      }
    >
      {showModal && <NovoLeadModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* KPI Bar */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <Columns3 className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total no Funil</p>
            <p className="text-lg font-black text-white">{leads.length} leads</p>
          </div>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-violet-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">VGV Potencial</p>
            <p className="text-lg font-black text-white">
              R$ {(totalVGV / 1e6).toFixed(1)}M
            </p>
          </div>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fechados</p>
            <p className="text-lg font-black text-white">
              {fechados.length} · R$ {(vgvFechado / 1e6).toFixed(1)}M
            </p>
          </div>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Conversão</p>
            <p className="text-lg font-black text-white">{taxaConversao}%</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2">
        {ETAPAS.map((etapa) => {
          const col = leads.filter((l) => l.etapa === etapa);
          const vgvCol = col.reduce((acc, l) => acc + (l.orcamento || 0), 0);
          const cfg = ETAPA_CONFIG[etapa];
          const altasPrioridade = col.filter((l) => l.prioridade === "Alta").length;

          return (
            <div key={etapa} className="flex-shrink-0 w-[280px]">
              {/* Column Header */}
              <div className={`p-3 rounded-xl mb-3 border ${cfg.border} ${cfg.headerBg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${cfg.color}`}>
                      {etapa}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    {col.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  {vgvCol > 0 ? (
                    <p className="text-[10px] text-slate-600 font-bold">
                      VGV: R$ {vgvCol >= 1e6 ? `${(vgvCol / 1e6).toFixed(1)}M` : `${(vgvCol / 1000).toFixed(0)}k`}
                    </p>
                  ) : <span />}
                  {altasPrioridade > 0 && (
                    <p className="text-[9px] text-red-400 font-black flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5" />{altasPrioridade} urgente{altasPrioridade > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[120px]">
                {col.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onMove={moveCard}
                    onRemove={removeCard}
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
