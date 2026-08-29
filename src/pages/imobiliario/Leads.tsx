import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, Search, Phone, Mail, Building2, X, MessageSquare,
  TrendingUp, Edit2, Trash2, ChevronRight, MapPin, User, Users,
  Calendar, Tag, DollarSign, Clock, Star, CheckCircle2,
  AlertCircle, Info, ExternalLink,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { confirmDialog } from "../../components/ui/confirm-dialog";

type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  interesse: "Compra" | "Locação" | "Investimento";
  tipo: string;
  bairro: string;
  orcamento: number;
  etapa: "Novo" | "Em Contato" | "Visita Agendada" | "Proposta" | "Fechado" | "Perdido";
  corretor: string;
  origem: string;
  prioridade: "Alta" | "Média" | "Baixa";
  obs: string;
  dias_etapa: number;
  created_at?: string;
};

const ETAPAS: Lead["etapa"][] = ["Novo", "Em Contato", "Visita Agendada", "Proposta", "Fechado", "Perdido"];

const ETAPA_COLORS: Record<string, string> = {
  "Novo": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Em Contato": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Visita Agendada": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Proposta": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Fechado": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Perdido": "bg-red-500/10 text-red-400 border-red-500/20",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  "Alta": "bg-red-500/10 text-red-400 border-red-500/20",
  "Média": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Baixa": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const MOCK: Lead[] = [
  { id: "1", nome: "Roberto Silva", telefone: "(11) 98888-7777", email: "roberto@email.com", interesse: "Compra", tipo: "Apartamento", bairro: "Moema", orcamento: 900000, etapa: "Visita Agendada", corretor: "Ana Lima", origem: "Instagram", prioridade: "Alta", obs: "Cliente tem 2 filhos, quer ver espaço dos quartos. Prefere imóveis com churrasqueira.", dias_etapa: 3, created_at: "2026-06-10" },
  { id: "2", nome: "Patrícia Costa", telefone: "(11) 97777-6666", email: "patricia@email.com", interesse: "Compra", tipo: "Casa", bairro: "Alphaville", orcamento: 1500000, etapa: "Proposta", corretor: "Carlos Matos", origem: "Site", prioridade: "Alta", obs: "Proposta enviada. Aguardando retorno do cliente.", dias_etapa: 5, created_at: "2026-06-08" },
  { id: "3", nome: "Marcos Alves", telefone: "(11) 96666-5555", email: "marcos@email.com", interesse: "Compra", tipo: "Cobertura", bairro: "Vila Olímpia", orcamento: 2500000, etapa: "Em Contato", corretor: "Fernanda Rocha", origem: "Indicação", prioridade: "Média", obs: "Trouxer planta baixa e habite-se na próxima reunião.", dias_etapa: 2, created_at: "2026-06-12" },
  { id: "4", nome: "Luciana Torres", telefone: "(11) 95555-4444", email: "luciana@email.com", interesse: "Locação", tipo: "Sala Comercial", bairro: "Faria Lima", orcamento: 15000, etapa: "Novo", corretor: "Carlos Matos", origem: "Portal Zap", prioridade: "Média", obs: "", dias_etapa: 1, created_at: "2026-06-15" },
  { id: "5", nome: "Eduardo Pinto", telefone: "(11) 94444-3333", email: "eduardo@email.com", interesse: "Investimento", tipo: "Apartamento", bairro: "Brooklin", orcamento: 1200000, etapa: "Fechado", corretor: "Ana Lima", origem: "Google", prioridade: "Baixa", obs: "Negócio fechado! Assinou contrato em 14/06.", dias_etapa: 15, created_at: "2026-05-30" },
  { id: "6", nome: "Camila Ferreira", telefone: "(11) 93333-2222", email: "camila@email.com", interesse: "Compra", tipo: "Apartamento", bairro: "Pinheiros", orcamento: 750000, etapa: "Em Contato", corretor: "Fernanda Rocha", origem: "WhatsApp", prioridade: "Alta", obs: "Cliente urgente — quer fechar antes do fim do mês.", dias_etapa: 4, created_at: "2026-06-11" },
];

const FIELD = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50";
const SELECT = "w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50";
const LABEL = "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block";

// ─── FORM MODAL (create / edit) ────────────────────────────────────────────────
function LeadFormModal({
  onClose, onSave, initial,
}: {
  onClose: () => void;
  onSave: (d: any) => void;
  initial?: Partial<Lead>;
}) {
  const [form, setForm] = useState({
    nome: initial?.nome ?? "",
    telefone: initial?.telefone ?? "",
    email: initial?.email ?? "",
    interesse: initial?.interesse ?? "Compra",
    tipo: initial?.tipo ?? "Apartamento",
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
      <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-base font-black text-white">{isEdit ? "Editar Lead" : "Novo Lead Imobiliário"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? "Atualize as informações do lead" : "Cadastre um novo interesse"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL}>Nome Completo</label>
              <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do cliente" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>E-mail</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="cliente@email.com" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Tipo de Interesse</label>
              <select value={form.interesse} onChange={e => set("interesse", e.target.value)} className={SELECT}>
                <option>Compra</option><option>Locação</option><option>Investimento</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Tipo de Imóvel</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className={SELECT}>
                {["Apartamento","Casa","Cobertura","Kitnet","Comercial","Terreno"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Bairro de Interesse</label>
              <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Moema, Alphaville..." className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Orçamento (R$)</label>
              <input type="number" value={form.orcamento} onChange={e => set("orcamento", e.target.value)} placeholder="900000" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Corretor Responsável</label>
              <input value={form.corretor} onChange={e => set("corretor", e.target.value)} placeholder="Nome do corretor" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Origem</label>
              <select value={form.origem} onChange={e => set("origem", e.target.value)} className={SELECT}>
                {["Site","Instagram","Portal Zap","OLX","Google","Indicação","WhatsApp","Facebook"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Prioridade</label>
              <select value={form.prioridade} onChange={e => set("prioridade", e.target.value)} className={SELECT}>
                <option>Alta</option><option>Média</option><option>Baixa</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Etapa</label>
              <select value={form.etapa} onChange={e => set("etapa", e.target.value)} className={SELECT}>
                {ETAPAS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Observações</label>
              <textarea value={form.obs} onChange={e => set("obs", e.target.value)} placeholder="Notas sobre o cliente, preferências, histórico..." rows={3} className={`${FIELD} resize-none`} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button
            onClick={() => {
              if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
              onSave({ ...form, orcamento: Number(form.orcamento) });
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          >
            {isEdit ? "Salvar Alterações" : "Cadastrar Lead"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function LeadDetailDrawer({
  lead, onClose, onEdit, onDelete, onChangeEtapa,
}: {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeEtapa: (etapa: Lead["etapa"]) => void;
}) {
  const fmt = (v: number) =>
    lead.interesse === "Locação"
      ? `R$ ${v.toLocaleString("pt-BR")}/mês`
      : v >= 1e6
      ? `R$ ${(v / 1e6).toFixed(1)}M`
      : `R$ ${(v / 1000).toFixed(0)}k`;

  const phoneRaw = lead.telefone.replace(/\D/g, "");

  const etapaIndex = ETAPAS.indexOf(lead.etapa);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-[var(--color-surface)] border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              {lead.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="font-black text-white text-sm">{lead.nome}</h2>
              <p className="text-[10px] text-slate-500">Lead #{lead.id} · {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Badges */}
          <div className="p-6 border-b border-white/5 flex flex-wrap gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${ETAPA_COLORS[lead.etapa]}`}>{lead.etapa}</span>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${PRIORIDADE_COLORS[lead.prioridade]}`}>{lead.prioridade} Prioridade</span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">{lead.interesse}</span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">{lead.origem}</span>
          </div>

          {/* KPI strip */}
          <div className="px-6 py-4 border-b border-white/5 grid grid-cols-3 gap-3">
            <div className="bg-[var(--color-surface-elevated)] rounded-xl p-3 text-center">
              <p className="text-sm font-black text-white">{fmt(lead.orcamento)}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Orçamento</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-xl p-3 text-center">
              <p className={`text-sm font-black ${lead.dias_etapa >= 7 ? "text-red-400" : "text-white"}`}>{lead.dias_etapa}d</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Na Etapa</p>
            </div>
            <div className="bg-[var(--color-surface-elevated)] rounded-xl p-3 text-center">
              <p className="text-sm font-black text-white">{etapaIndex + 1}/{ETAPAS.length}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Progresso</p>
            </div>
          </div>

          {/* Funil de etapas */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className={LABEL}>Progresso no Funil</p>
            <div className="flex gap-1 mt-2">
              {ETAPAS.map((e, i) => (
                <button
                  key={e}
                  onClick={() => onChangeEtapa(e)}
                  title={e}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= etapaIndex
                      ? e === "Perdido" ? "bg-red-500" : "bg-blue-500"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-600">Novo</span>
              <span className="text-[9px] text-slate-600">Fechado</span>
            </div>
          </div>

          {/* Detalhes */}
          <div className="px-6 py-4 border-b border-white/5 space-y-3">
            <p className={LABEL}>Informações de Contato</p>
            <div className="space-y-2">
              {lead.telefone && (
                <a href={`tel:${phoneRaw}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm text-slate-300">{lead.telefone}</span>
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
                  <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  <span className="text-sm text-slate-300">{lead.email}</span>
                </a>
              )}
              <a
                href={`https://wa.me/55${phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-bold">Abrir WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-400 ml-auto" />
              </a>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-white/5 space-y-3">
            <p className={LABEL}>Interesse Imobiliário</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Tipo</p>
                <p className="text-sm font-bold text-white mt-1">{lead.tipo}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Bairro</p>
                <p className="text-sm font-bold text-white mt-1">{lead.bairro || "—"}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Corretor</p>
                <p className="text-sm font-bold text-white mt-1">{lead.corretor || "—"}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Operação</p>
                <p className="text-sm font-bold text-white mt-1">{lead.interesse}</p>
              </div>
            </div>
          </div>

          {lead.obs && (
            <div className="px-6 py-4 border-b border-white/5">
              <p className={LABEL}>Observações</p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <p className="text-sm text-slate-300 leading-relaxed">{lead.obs}</p>
              </div>
            </div>
          )}

          {/* Alterar etapa */}
          <div className="px-6 py-4">
            <p className={LABEL}>Alterar Etapa</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ETAPAS.map(e => (
                <button
                  key={e}
                  onClick={() => onChangeEtapa(e)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${
                    lead.etapa === e
                      ? ETAPA_COLORS[e] + " ring-1 ring-current"
                      : "bg-white/5 text-slate-500 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 flex gap-2">
          <Button onClick={onEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </Button>
          <Button
            onClick={() => { onDelete(); onClose(); }}
            variant="ghost"
            className="px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LeadsImobiliario() {
  const [leads, setLeads] = useState<Lead[]>(MOCK);
  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("Todas");
  const [prioFilter, setPrioFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("imobiliario_leads").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data && data.length) {
        setLeads(data.map(r => ({
          id: r.id, nome: r.nome, telefone: r.telefone ?? "", email: r.email ?? "",
          interesse: r.interesse, tipo: r.tipo, bairro: r.bairro ?? "",
          orcamento: Number(r.orcamento), etapa: r.etapa, corretor: r.corretor ?? "",
          origem: r.origem, prioridade: r.prioridade, obs: r.obs ?? "",
          dias_etapa: r.dias_etapa ?? 0, created_at: r.created_at,
        })));
      }
    });
  }, []);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchQ = l.nome.toLowerCase().includes(q) || l.bairro.toLowerCase().includes(q) || l.corretor.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    const matchE = etapaFilter === "Todas" || l.etapa === etapaFilter;
    const matchP = prioFilter === "Todas" || l.prioridade === prioFilter;
    return matchQ && matchE && matchP;
  });

  const handleSave = async (form: any) => {
    const novo: Lead = { ...form, id: Date.now().toString(), dias_etapa: 0, created_at: new Date().toISOString() };
    setLeads(prev => [novo, ...prev]);
    toast.success("Lead cadastrado!");
    if (supabase) {
      const { error } = await supabase.from("imobiliario_leads").insert({ ...form, id: novo.id });
      if (error) console.error("[Supabase]", error.message);
    }
  };

  const handleEdit = async (form: any) => {
    if (!editLead) return;
    const updated = { ...editLead, ...form };
    setLeads(prev => prev.map(l => l.id === editLead.id ? updated : l));
    if (selectedLead?.id === editLead.id) setSelectedLead(updated);
    toast.success("Lead atualizado!");
    if (supabase) {
      const { error } = await supabase.from("imobiliario_leads").update(form).eq("id", editLead.id);
      if (error) console.error("[Supabase]", error.message);
    }
    setEditLead(null);
  };

  const handleDelete = async (id: string) => {
    const alvo = leads.find(l => l.id === id);
    if (!(await confirmDialog({
      title: "Excluir lead",
      description: `Excluir ${alvo?.nome || "este lead"}? Essa ação não pode ser desfeita.`,
    }))) return;
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success("Lead removido.");
    if (supabase) await supabase.from("imobiliario_leads").delete().eq("id", id);
  };

  const updateEtapa = async (id: string, etapa: Lead["etapa"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa, dias_etapa: 0 } : l));
    if (selectedLead?.id === id) setSelectedLead(s => s ? { ...s, etapa, dias_etapa: 0 } : null);
    toast.success(`Etapa alterada para ${etapa}`);
    if (supabase) await supabase.from("imobiliario_leads").update({ etapa, dias_etapa: 0 }).eq("id", id);
  };

  const total = leads.length;
  const ativos = leads.filter(l => !["Fechado","Perdido"].includes(l.etapa)).length;
  const fechados = leads.filter(l => l.etapa === "Fechado").length;
  const perdidos = leads.filter(l => l.etapa === "Perdido").length;
  const vgvPotencial = leads.filter(l => !["Perdido"].includes(l.etapa)).reduce((s, l) => s + l.orcamento, 0);
  const conversao = total > 0 ? Math.round((fechados / total) * 100) : 0;

  return (
    <PageContainer
      title="Leads Imobiliários"
      description="Pipeline de clientes interessados em compra, locação ou investimento."
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
          onDelete={() => handleDelete(selectedLead.id)}
          onChangeEtapa={e => updateEtapa(selectedLead.id, e)}
        />
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total de Leads", value: total, icon: Users, color: "text-indigo-500" },
          { label: "Ativos", value: ativos, icon: TrendingUp, color: "text-blue-500" },
          { label: "Fechados", value: fechados, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Perdidos", value: perdidos, icon: AlertCircle, color: "text-rose-500" },
          { label: "VGV Potencial", value: `R$ ${(vgvPotencial / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-amber-500" },
        ].map(k => (
          <Card key={k.label} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
            <k.icon className={`w-5 h-5 ${k.color} mb-4`} />
            <div className="text-2xl font-display font-black text-white mb-1 italic">{k.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, bairro, corretor..." className="w-full bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl p-1 gap-1 overflow-x-auto">
          {["Todas", ...ETAPAS].map(e => (
            <button key={e} onClick={() => setEtapaFilter(e)} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all whitespace-nowrap ${etapaFilter === e ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>{e}</button>
          ))}
        </div>
        <div className="flex bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl p-1 gap-1">
          {["Todas", "Alta", "Média", "Baixa"].map(p => (
            <button key={p} onClick={() => setPrioFilter(p)} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${prioFilter === p ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>{p}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3">{filtered.length} lead(s) encontrado(s)</p>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.map(l => {
          const phoneRaw = l.telefone.replace(/\D/g, "");
          return (
            <div
              key={l.id}
              onClick={() => setSelectedLead(l)}
              className="flex items-center gap-4 p-4 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-xl hover:border-blue-500/20 hover:bg-[var(--color-surface-elevated)] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {l.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-white text-sm">{l.nome}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${ETAPA_COLORS[l.etapa]}`}>{l.etapa}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${PRIORIDADE_COLORS[l.prioridade]}`}>{l.prioridade}</span>
                  {l.dias_etapa >= 7 && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-red-400"><AlertCircle className="w-3 h-3" />{l.dias_etapa}d parado</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{l.telefone}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{l.tipo}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.bairro}</span>
                  <span>Corretor: <span className="text-slate-300 font-bold">{l.corretor}</span></span>
                  <span className="text-slate-600">{l.origem}</span>
                </div>
              </div>
              <div className="text-right shrink-0 mr-2">
                <p className="font-black text-white text-sm">
                  {l.interesse === "Locação" ? `R$ ${l.orcamento.toLocaleString("pt-BR")}/mês` : l.orcamento >= 1e6 ? `R$ ${(l.orcamento / 1e6).toFixed(1)}M` : `R$ ${(l.orcamento / 1000).toFixed(0)}k`}
                </p>
                <p className="text-[9px] text-slate-500">{l.interesse}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <a
                  href={`https://wa.me/55${phoneRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => setEditLead(l)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Editar">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Remover">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum lead encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre um novo lead.</p>
        </div>
      )}
    </PageContainer>
  );
}
