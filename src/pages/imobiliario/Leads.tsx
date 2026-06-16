import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Plus, Search, User, Phone, Mail, Building2, X, MessageSquare, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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

const MOCK: Lead[] = [
  { id: "1", nome: "Roberto Silva", telefone: "(11) 98888-7777", email: "roberto@email.com", interesse: "Compra", tipo: "Apartamento", bairro: "Moema", orcamento: 900000, etapa: "Visita Agendada", corretor: "Ana Lima", origem: "Instagram" },
  { id: "2", nome: "Patrícia Costa", telefone: "(11) 97777-6666", email: "patricia@email.com", interesse: "Compra", tipo: "Casa", bairro: "Alphaville", orcamento: 1500000, etapa: "Proposta", corretor: "Carlos Matos", origem: "Site" },
  { id: "3", nome: "Marcos Alves", telefone: "(11) 96666-5555", email: "marcos@email.com", interesse: "Compra", tipo: "Cobertura", bairro: "Vila Olímpia", orcamento: 2500000, etapa: "Em Contato", corretor: "Fernanda Rocha", origem: "Indicação" },
  { id: "4", nome: "Luciana Torres", telefone: "(11) 95555-4444", email: "luciana@email.com", interesse: "Locação", tipo: "Sala Comercial", bairro: "Faria Lima", orcamento: 15000, etapa: "Novo", corretor: "Carlos Matos", origem: "Portal Zap" },
  { id: "5", nome: "Eduardo Pinto", telefone: "(11) 94444-3333", email: "eduardo@email.com", interesse: "Investimento", tipo: "Apartamento", bairro: "Brooklin", orcamento: 1200000, etapa: "Fechado", corretor: "Ana Lima", origem: "Google" },
];

function NovoLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", interesse: "Compra", tipo: "Apartamento", bairro: "", orcamento: "", corretor: "", origem: "Site" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Novo Lead Imobiliário</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nome</label>
              <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do cliente" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">E-mail</label>
            <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="cliente@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Interesse</label>
              <select value={form.interesse} onChange={e => set("interesse", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option>Compra</option><option>Locação</option><option>Investimento</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Tipo de Imóvel</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Apartamento","Casa","Cobertura","Kitnet","Comercial","Terreno"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Bairro de Interesse</label>
              <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Moema, Alphaville..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Orçamento (R$)</label>
              <input type="number" value={form.orcamento} onChange={e => set("orcamento", e.target.value)} placeholder="900000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Corretor</label>
              <input value={form.corretor} onChange={e => set("corretor", e.target.value)} placeholder="Responsável" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Origem</label>
              <select value={form.origem} onChange={e => set("origem", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Site", "Instagram", "Portal Zap", "OLX", "Google", "Indicação", "WhatsApp"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">Cadastrar Lead</Button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsImobiliario() {
  const [leads, setLeads] = useState<Lead[]>(MOCK);
  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("Todas");
  const [showModal, setShowModal] = useState(false);

  const filtered = leads.filter(l => {
    const matchSearch = l.nome.toLowerCase().includes(search.toLowerCase()) || l.bairro.toLowerCase().includes(search.toLowerCase()) || l.corretor.toLowerCase().includes(search.toLowerCase());
    const matchEtapa = etapaFilter === "Todas" || l.etapa === etapaFilter;
    return matchSearch && matchEtapa;
  });

  const handleSave = (form: any) => {
    const novo: Lead = { ...form, id: Date.now().toString(), etapa: "Novo", orcamento: Number(form.orcamento) };
    setLeads(prev => [novo, ...prev]);
    toast.success("Lead cadastrado!");
  };

  const updateEtapa = (id: string, etapa: Lead["etapa"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa } : l));
  };

  const handleDelete = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success("Lead removido.");
  };

  const total = leads.length;
  const fechados = leads.filter(l => l.etapa === "Fechado").length;
  const vgvPotencial = leads.filter(l => l.etapa !== "Perdido").reduce((acc, l) => acc + l.orcamento, 0);

  return (
    <PageContainer
      title="Leads Imobiliários"
      description="Pipeline de clientes interessados em compra, locação ou investimento."
      actions={
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      }
    >
      {showModal && <NovoLeadModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-white">{total}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total de Leads</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{fechados}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Fechados</p>
        </div>
        <div className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-violet-400">R$ {(vgvPotencial / 1e6).toFixed(1)}M</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">VGV Potencial</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lead, bairro ou corretor..." className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex flex-wrap bg-[#111827] border border-white/10 rounded-xl p-1 gap-1">
          {["Todas", ...ETAPAS].map(e => (
            <button key={e} onClick={() => setEtapaFilter(e)} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${etapaFilter === e ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>{e}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map(l => (
          <div key={l.id} className="flex items-center gap-4 p-4 bg-[#111827]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              {l.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white text-sm">{l.nome}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${ETAPA_COLORS[l.etapa]}`}>{l.etapa}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{l.interesse}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{l.telefone}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{l.tipo} · {l.bairro}</span>
                <span>Corretor: <span className="text-slate-300 font-bold">{l.corretor}</span></span>
                <span>Origem: <span className="text-slate-300">{l.origem}</span></span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-white text-sm">
                {l.interesse === "Locação" ? `R$ ${l.orcamento.toLocaleString("pt-BR")}/mês` : `R$ ${(l.orcamento / 1000).toFixed(0)}k`}
              </p>
              <select
                value={l.etapa}
                onChange={e => updateEtapa(l.id, e.target.value as Lead["etapa"])}
                className="mt-1 bg-[#0B1120] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-blue-500/50"
              >
                {ETAPAS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Mensagem">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum lead encontrado</p>
        </div>
      )}
    </PageContainer>
  );
}
