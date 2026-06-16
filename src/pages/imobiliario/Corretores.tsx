import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Plus, Search, Star, Building2, TrendingUp, Copy, ExternalLink, X,
  Phone, Mail, Edit2, Trash2, Link, Target, Award, Users,
} from "lucide-react";
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
  totalVendas: number;
  vgvMes: number;
  meta: number;
  avaliacao: number;
  bio: string;
  slug: string;
  status: "Ativo" | "Inativo";
};

const MOCK: Corretor[] = [
  { id: "1", nome: "Ana Lima", creci: "CRECI-SP 123456", telefone: "(11) 98765-4321", email: "ana@imobiliaria.com", especialidade: "Alto Padrão", imovisAtivos: 14, vendasMes: 3, totalVendas: 47, vgvMes: 4.8, meta: 5, avaliacao: 4.9, bio: "Especialista em imóveis de alto padrão em São Paulo há 10 anos. CRECI-SP premiada consecutivamente.", slug: "ana-lima", status: "Ativo" },
  { id: "2", nome: "Carlos Matos", creci: "CRECI-SP 234567", telefone: "(11) 97654-3210", email: "carlos@imobiliaria.com", especialidade: "Residencial", imovisAtivos: 9, vendasMes: 2, totalVendas: 28, vgvMes: 2.4, meta: 4, avaliacao: 4.7, bio: "Corretor residencial com foco em famílias que buscam qualidade de vida e segurança.", slug: "carlos-matos", status: "Ativo" },
  { id: "3", nome: "Fernanda Rocha", creci: "CRECI-SP 345678", telefone: "(11) 96543-2109", email: "fernanda@imobiliaria.com", especialidade: "Comercial", imovisAtivos: 6, vendasMes: 1, totalVendas: 15, vgvMes: 3.2, meta: 3, avaliacao: 4.8, bio: "Especialista em imóveis comerciais e lajes corporativas no eixo Faria Lima-Berrini.", slug: "fernanda-rocha", status: "Ativo" },
];

function NovoCorretorModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    nome: "", creci: "", telefone: "", email: "",
    especialidade: "Residencial", bio: "", meta: "5",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Novo Corretor</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Nome Completo</label>
              <input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ana Lima" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">CRECI</label>
              <input value={form.creci} onChange={(e) => set("creci", e.target.value)} placeholder="CRECI-SP 123456" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Telefone</label>
              <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">E-mail</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="corretor@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Especialidade</label>
              <select value={form.especialidade} onChange={(e) => set("especialidade", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Residencial", "Comercial", "Alto Padrão", "Lançamentos", "Rural", "Industrial"].map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Meta Mensal (vendas)</label>
              <input type="number" value={form.meta} onChange={(e) => set("meta", e.target.value)} placeholder="5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Bio / Descrição</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Fale sobre a experiência e especialização do corretor..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
            Cadastrar Corretor
          </Button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(value) ? "text-amber-400 fill-current" : "text-slate-700"}`}
        />
      ))}
      <span className="text-[11px] font-black text-amber-400 ml-1">{value}</span>
    </div>
  );
}

const especialidadeColor: Record<string, string> = {
  "Alto Padrão": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Residencial": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Comercial": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Lançamentos": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Rural": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Industrial": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function Corretores() {
  const [corretores, setCorretores] = useState<Corretor[]>(MOCK);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<"vendas" | "avaliacao" | "vgv">("vendas");

  const filtered = corretores
    .filter((c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.especialidade.toLowerCase().includes(search.toLowerCase()) ||
      c.creci.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "vendas") return b.vendasMes - a.vendasMes;
      if (sortBy === "avaliacao") return b.avaliacao - a.avaliacao;
      return b.vgvMes - a.vgvMes;
    });

  const handleSave = (form: any) => {
    const slug = form.nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\s+/g, "-");
    const novo: Corretor = {
      ...form,
      id: Date.now().toString(),
      slug,
      imovisAtivos: 0,
      vendasMes: 0,
      totalVendas: 0,
      vgvMes: 0,
      meta: Number(form.meta) || 5,
      avaliacao: 5.0,
      status: "Ativo",
    };
    setCorretores((prev) => [novo, ...prev]);
    toast.success("Corretor cadastrado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setCorretores((prev) => prev.filter((c) => c.id !== id));
    toast.success("Corretor removido.");
  };

  const copyPortfolio = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/corretor/${slug}`);
    toast.success("Link do portfólio copiado! Envie para o cliente.", { duration: 3000 });
  };

  const openPortfolio = (slug: string) => {
    window.open(`/corretor/${slug}`, "_blank");
  };

  // Totals
  const totalAtivos = corretores.filter((c) => c.status === "Ativo").length;
  const totalVendas = corretores.reduce((acc, c) => acc + c.vendasMes, 0);
  const totalVGV = corretores.reduce((acc, c) => acc + c.vgvMes, 0);
  const mediaAvaliacao = corretores.length ? (corretores.reduce((acc, c) => acc + c.avaliacao, 0) / corretores.length).toFixed(1) : "0";

  return (
    <PageContainer
      title="Corretores"
      description="Gerencie a equipe, seus portfólios públicos e performance individual."
      actions={
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Novo Corretor
        </Button>
      }
    >
      {showModal && <NovoCorretorModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, label: "Ativos", value: totalAtivos.toString(), color: "text-blue-400 bg-blue-500/10" },
          { icon: TrendingUp, label: "Vendas Mês", value: totalVendas.toString(), color: "text-emerald-400 bg-emerald-500/10" },
          { icon: Target, label: "VGV Mês", value: `R$ ${totalVGV.toFixed(1)}M`, color: "text-violet-400 bg-violet-500/10" },
          { icon: Star, label: "Média Avaliação", value: mediaAvaliacao, color: "text-amber-400 bg-amber-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-[#111827]/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-lg font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar corretor ou especialidade..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex bg-[#111827] border border-white/10 rounded-xl p-1 gap-1">
          {(["vendas", "avaliacao", "vgv"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${sortBy === s ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}
            >
              {s === "vendas" ? "Por Vendas" : s === "avaliacao" ? "Por Avaliação" : "Por VGV"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, idx) => {
          const metaPct = Math.min((c.vendasMes / c.meta) * 100, 100);
          const espColor = especialidadeColor[c.especialidade] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";

          return (
            <div key={c.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                      {c.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Award className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">{c.nome}</h3>
                    <p className="text-[10px] text-slate-500">{c.creci}</p>
                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 ${c.status === "Ativo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <StarRating value={c.avaliacao} />
              </div>

              <div className="mb-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${espColor}`}>
                  {c.especialidade}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{c.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-white">{c.imovisAtivos}</p>
                  <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                    <Building2 className="w-2.5 h-2.5" />Ativos
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-white">{c.vendasMes}</p>
                  <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />Vendas
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-white">{c.totalVendas}</p>
                  <p className="text-[9px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                    <Award className="w-2.5 h-2.5" />Total
                  </p>
                </div>
              </div>

              {/* Meta progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Target className="w-3 h-3" />Meta mensal: {c.meta} vendas
                  </span>
                  <span className={`text-[10px] font-black ${metaPct >= 100 ? "text-emerald-400" : metaPct >= 60 ? "text-amber-400" : "text-slate-400"}`}>
                    {metaPct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${metaPct >= 100 ? "bg-emerald-500" : metaPct >= 60 ? "bg-amber-500" : "bg-blue-500"}`}
                    style={{ width: `${metaPct}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-600 mt-1">VGV mês: R$ {c.vgvMes}M</p>
              </div>

              {/* Contatos */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telefone}</span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{c.email}</span>
              </div>

              {/* Portfólio */}
              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Link className="w-3 h-3" />Portfólio Público
                </p>
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

              {/* Ações hover */}
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black transition-all">
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[10px] font-black transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum corretor encontrado</p>
          <p className="text-xs mt-1">Tente ajustar o filtro ou cadastre um novo corretor.</p>
        </div>
      )}
    </PageContainer>
  );
}
