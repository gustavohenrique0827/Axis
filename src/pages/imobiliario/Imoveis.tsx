import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Building2, Plus, Search, MapPin, Bed, Bath, Car, Eye, Edit2, Trash2,
  Copy, ExternalLink, X, Home, DollarSign, Grid3x3, List
} from "lucide-react";
import { toast } from "sonner";

type Imovel = {
  id: string;
  titulo: string;
  tipo: "Apartamento" | "Casa" | "Cobertura" | "Kitnet" | "Comercial" | "Terreno";
  operacao: "Venda" | "Locação";
  status: "Disponível" | "Vendido" | "Locado" | "Reservado";
  valor: number;
  bairro: string;
  cidade: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  corretor: string;
  visitas: number;
  descricao: string;
  fotos: string[];
};

const MOCK: Imovel[] = [
  { id: "1", titulo: "Apto 3 quartos - Moema", tipo: "Apartamento", operacao: "Venda", status: "Disponível", valor: 850000, bairro: "Moema", cidade: "São Paulo", area: 120, quartos: 3, banheiros: 2, vagas: 2, corretor: "Ana Lima", visitas: 12, descricao: "Apartamento moderno com varanda gourmet.", fotos: [] },
  { id: "2", titulo: "Casa 4 quartos - Alphaville", tipo: "Casa", operacao: "Venda", status: "Vendido", valor: 1500000, bairro: "Alphaville", cidade: "Barueri", area: 280, quartos: 4, banheiros: 4, vagas: 4, corretor: "Carlos Matos", visitas: 8, descricao: "Casa ampla em condomínio fechado.", fotos: [] },
  { id: "3", titulo: "Cobertura Duplex - Vila Olímpia", tipo: "Cobertura", operacao: "Venda", status: "Disponível", valor: 2200000, bairro: "Vila Olímpia", cidade: "São Paulo", area: 320, quartos: 4, banheiros: 5, vagas: 4, corretor: "Fernanda Rocha", visitas: 5, descricao: "Cobertura duplex com piscina privativa.", fotos: [] },
  { id: "4", titulo: "Kitnet Centro", tipo: "Kitnet", operacao: "Locação", status: "Locado", valor: 1800, bairro: "Centro", cidade: "São Paulo", area: 28, quartos: 1, banheiros: 1, vagas: 0, corretor: "Ana Lima", visitas: 20, descricao: "Kitnet reformada, próxima ao metrô.", fotos: [] },
  { id: "5", titulo: "Sala Comercial - Faria Lima", tipo: "Comercial", operacao: "Venda", status: "Disponível", valor: 950000, bairro: "Itaim Bibi", cidade: "São Paulo", area: 80, quartos: 0, banheiros: 2, vagas: 2, corretor: "Carlos Matos", visitas: 3, descricao: "Sala comercial no coração financeiro.", fotos: [] },
];

const TIPOS = ["Todos", "Apartamento", "Casa", "Cobertura", "Kitnet", "Comercial", "Terreno"];
const STATUS_LIST = ["Todos", "Disponível", "Vendido", "Locado", "Reservado"];

function NovoImovelModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({ titulo: "", tipo: "Apartamento", operacao: "Venda", valor: "", bairro: "", cidade: "São Paulo", area: "", quartos: "2", banheiros: "1", vagas: "1", corretor: "", descricao: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1929] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-base font-black text-white">Novo Imóvel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Título do Imóvel</label>
            <input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Ex: Apartamento 3 quartos - Moema" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Tipo</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {["Apartamento","Casa","Cobertura","Kitnet","Comercial","Terreno"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Operação</label>
              <select value={form.operacao} onChange={e => set("operacao", e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
                <option>Venda</option><option>Locação</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Valor (R$)</label>
              <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="850000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Área (m²)</label>
              <input type="number" value={form.area} onChange={e => set("area", e.target.value)} placeholder="120" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Bairro</label>
              <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Moema" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Cidade</label>
              <input value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="São Paulo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Quartos</label>
              <input type="number" value={form.quartos} onChange={e => set("quartos", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Banheiros</label>
              <input type="number" value={form.banheiros} onChange={e => set("banheiros", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Vagas</label>
              <input type="number" value={form.vagas} onChange={e => set("vagas", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Corretor Responsável</label>
            <input value={form.corretor} onChange={e => set("corretor", e.target.value)} placeholder="Nome do corretor" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Descrição</label>
            <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3} placeholder="Descrição do imóvel..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">Salvar Imóvel</Button>
        </div>
      </div>
    </div>
  );
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>(MOCK);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);

  const filtered = imoveis.filter(i => {
    const matchSearch = i.titulo.toLowerCase().includes(search.toLowerCase()) || i.bairro.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === "Todos" || i.tipo === tipoFilter;
    const matchStatus = statusFilter === "Todos" || i.status === statusFilter;
    return matchSearch && matchTipo && matchStatus;
  });

  const handleSave = (form: any) => {
    const novo: Imovel = { ...form, id: Date.now().toString(), status: "Disponível", visitas: 0, fotos: [], valor: Number(form.valor), area: Number(form.area), quartos: Number(form.quartos), banheiros: Number(form.banheiros), vagas: Number(form.vagas) };
    setImoveis(prev => [novo, ...prev]);
    toast.success("Imóvel cadastrado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setImoveis(prev => prev.filter(i => i.id !== id));
    toast.success("Imóvel removido.");
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/imovel/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const statusColor = (s: string) => {
    if (s === "Disponível") return "bg-emerald-500/10 text-emerald-400";
    if (s === "Vendido") return "bg-blue-500/10 text-blue-400";
    if (s === "Locado") return "bg-violet-500/10 text-violet-400";
    return "bg-amber-500/10 text-amber-400";
  };

  return (
    <PageContainer
      title="Imóveis"
      description="Gerencie o portfólio completo de imóveis disponíveis, vendidos e locados."
      actions={
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 gap-2 font-bold">
          <Plus className="w-4 h-4" /> Novo Imóvel
        </Button>
      }
    >
      {showModal && <NovoImovelModal onClose={() => setShowModal(false)} onSave={handleSave} />}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar imóvel, bairro..." className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50">
          {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="flex bg-[#111827] border border-white/10 rounded-xl p-1 gap-1">
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-white"}`}><Grid3x3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-white"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(im => (
            <div key={im.id} className="bg-[#111827]/80 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
              {/* Foto placeholder */}
              <div className="h-40 bg-gradient-to-br from-blue-900/20 to-violet-900/20 flex items-center justify-center relative">
                <Building2 className="w-10 h-10 text-white/10" />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor(im.status)}`}>{im.status}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-black px-2 py-1 rounded-full bg-black/40 text-white">{im.tipo}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-white text-sm mb-1 truncate">{im.titulo}</h3>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{im.bairro}, {im.cidade}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3">
                  {im.quartos > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{im.quartos}</span>}
                  <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{im.banheiros}</span>
                  {im.vagas > 0 && <span className="flex items-center gap-1"><Car className="w-3 h-3" />{im.vagas}</span>}
                  <span className="flex items-center gap-1"><Home className="w-3 h-3" />{im.area}m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500">{im.operacao === "Locação" ? "Aluguel" : "Valor"}</p>
                    <p className="text-base font-black text-white">
                      {im.operacao === "Locação" ? `R$ ${im.valor.toLocaleString("pt-BR")}/mês` : `R$ ${(im.valor / 1000).toFixed(0)}k`}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyLink(im.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Copiar link"><Copy className="w-3.5 h-3.5" /></button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(im.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all" title="Remover"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Corretor: <span className="text-slate-300 font-bold">{im.corretor}</span></span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{im.visitas} visitas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(im => (
            <div key={im.id} className="flex items-center gap-4 p-4 bg-[#111827]/80 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/30 to-violet-900/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm truncate">{im.titulo}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${statusColor(im.status)}`}>{im.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{im.bairro}</span>
                  {im.quartos > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{im.quartos} qts</span>}
                  <span className="flex items-center gap-1"><Home className="w-3 h-3" />{im.area}m²</span>
                  <span>Corretor: {im.corretor}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-white text-sm">{im.operacao === "Locação" ? `R$ ${im.valor.toLocaleString("pt-BR")}/mês` : `R$ ${(im.valor / 1000).toFixed(0)}k`}</p>
                <p className="text-[10px] text-slate-500">{im.operacao}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyLink(im.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" title="Copiar link"><Copy className="w-3.5 h-3.5" /></button>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(im.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Nenhum imóvel encontrado</p>
          <p className="text-xs mt-1">Tente ajustar os filtros ou cadastre um novo imóvel.</p>
        </div>
      )}
    </PageContainer>
  );
}
