import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Plus, Search, Star, Building2, TrendingUp, Copy, ExternalLink, X, Phone, Mail, Edit2, Trash2, Link } from "lucide-react";
import { toast } from "sonner";

type Corretor = {
  id: string;
  nome: string;
  creci: string;
  telefone: string;
  email: string;
  especialidade: string;
  imovisAtivos: number;
  vendasMes: number;
  avaliacao: number;
  bio: string;
  slug: string;
  status: "Ativo" | "Inativo";
};

const MOCK: Corretor[] = [
  { id: "1", nome: "Ana Lima", creci: "CRECI-SP 123456", telefone: "(11) 98765-4321", email: "ana@imobiliaria.com", especialidade: "Alto Padrão", imovisAtivos: 14, vendasMes: 3, avaliacao: 4.9, bio: "Especialista em imóveis de alto padrão em São Paulo há 10 anos.", slug: "ana-lima", status: "Ativo" },
  { id: "2", nome: "Carlos Matos", creci: "CRECI-SP 234567", telefone: "(11) 97654-3210", email: "carlos@imobiliaria.com", especialidade: "Residencial", imovisAtivos: 9, vendasMes: 2, avaliacao: 4.7, bio: "Corretor residencial com foco em famílias que buscam qualidade de vida.", slug: "carlos-matos", status: "Ativo" },
  { id: "3", nome: "Fernanda Rocha", creci: "CRECI-SP 345678", telefone: "(11) 96543-2109", email: "fernanda@imobiliaria.com", especialidade: "Comercial", imovisAtivos: 6, vendasMes: 1, avaliacao: 4.8, bio: "Especialista em imóveis comerciais e salas de escritório.", slug: "fernanda-rocha", status: "Ativo" },
];

function NovoCorretorModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({ nome: "", creci: "", telefone: "", email: "", especialidade: "Residencial", bio: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Novo Corretor</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nome Completo</label>
              <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ana Lima" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">CRECI</label>
              <input value={form.creci} onChange={e => set("creci", e.target.value)} placeholder="CRECI-SP 123456" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">E-mail</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="corretor@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Especialidade</label>
            <select value={form.especialidade} onChange={e => set("especialidade", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
              {["Residencial", "Comercial", "Alto Padrão", "Lançamentos", "Rural", "Industrial"].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Bio / Descrição</label>
            <textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Fale sobre a experiência e especialização do corretor..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">Cadastrar Corretor</Button>
        </div>
      </div>
    </div>
  );
}

export default function Corretores() {
  const [corretores, setCorretores] = useState<Corretor[]>(MOCK);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = corretores.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.especialidade.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form: any) => {
    const slug = form.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
    const novo: Corretor = { ...form, id: Date.now().toString(), slug, imovisAtivos: 0, vendasMes: 0, avaliacao: 5.0, status: "Ativo" };
    setCorretores(prev => [novo, ...prev]);
    toast.success("Corretor cadastrado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setCorretores(prev => prev.filter(c => c.id !== id));
    toast.success("Corretor removido.");
  };

  const copyPortfolio = (slug: string) => {
    const url = `${window.location.origin}/corretor/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link do portfólio copiado! Envie para o cliente.");
  };

  const openPortfolio = (slug: string) => {
    window.open(`/corretor/${slug}`, "_blank");
  };

  return (
    <PageContainer
      title="Corretores"
      description="Gerencie a equipe de corretores, seus portfólios públicos e performance."
      actions={
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Novo Corretor
        </Button>
      }
    >
      {showModal && <NovoCorretorModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar corretor ou especialidade..." className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                  {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">{c.nome}</h3>
                  <p className="text-[10px] text-slate-500">{c.creci}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-black">{c.avaliacao}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">{c.especialidade}</span>
            </div>

            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{c.bio}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-black text-white">{c.imovisAtivos}</p>
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Building2 className="w-3 h-3" />Imóveis Ativos</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-black text-white">{c.vendasMes}</p>
                <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Vendas/mês</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4">
              <Phone className="w-3 h-3" /><span>{c.telefone}</span>
              <span className="mx-1 text-slate-700">·</span>
              <Mail className="w-3 h-3" /><span className="truncate">{c.email}</span>
            </div>

            {/* Portfólio público */}
            <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Link className="w-3 h-3" />Portfólio do Corretor</p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyPortfolio(c.slug)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[11px] font-black transition-all border border-blue-500/20 hover:border-blue-500/40"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Link
                </button>
                <button
                  onClick={() => openPortfolio(c.slug)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-black transition-all border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Visualizar
                </button>
              </div>
            </div>

            <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black transition-all">
                <Edit2 className="w-3 h-3" /> Editar
              </button>
              <button onClick={() => handleDelete(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[10px] font-black transition-all">
                <Trash2 className="w-3 h-3" /> Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum corretor encontrado</p>
        </div>
      )}
    </PageContainer>
  );
}
