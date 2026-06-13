import { useState, useEffect, useMemo } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Search, Plus, Building, Building2, MapPin, Phone, Mail, Trash2, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { NovoClienteModal } from "../../components/ui/NovoClienteModal";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { supabase } from "../../lib/supabase";

export default function Clientes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos as situações");
  const [sectorFilter, setSectorFilter] = useState("Todos os setores");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) console.error("[Supabase] clientes load error:", error.message);
      else if (data) setClientes(data);
    });
  }, []);

  const kpis = useMemo(() => ({
    total:       clientes.length,
    ativos:      clientes.filter(c => c.status === 'Ativo').length,
    implantacao: clientes.filter(c => c.status === 'Em Implantação').length,
    inativos:    clientes.filter(c => c.status === 'Inativo').length,
  }), [clientes]);

  const handleCreateCliente = async (data: any) => {
    if (!data.nome) {
      toast.error("Nome da empresa é obrigatório.");
      return;
    }
    const newClient = {
      id: Date.now().toString(),
      name: data.nome,
      industry: data.industry || "Tecnologia",
      city: data.cidade || "São Paulo",
      state: (data.estado || "SP").toUpperCase(),
      phone: data.telefone || "(11) 99999-9999",
      email: data.email || "contato@empresa.com",
      status: "Ativo"
    };
    setClientes(prev => [newClient, ...prev]);
    if (supabase) {
      const { error } = await supabase.from("clientes").insert(newClient);
      if (error) console.error("[Supabase] clientes insert error:", error.message);
    }
    toast.success("Cliente inserido com sucesso!");
  };

  const handleDeleteCliente = async (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
    if (supabase) {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) console.error("[Supabase] clientes delete error:", error.message);
    }
    toast.success("Cliente removido.");
  };

  const filteredClientes = clientes.filter(c => {
    if (statusFilter !== "Todos as situações" && c.status !== statusFilter) return false;
    if (sectorFilter !== "Todos os setores" && c.industry !== sectorFilter) return false;
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      return c.name?.toLowerCase().includes(term) ||
             c.email?.toLowerCase().includes(term) ||
             c.industry?.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <PageContainer
      title="Base de Clientes Axis"
      description="Gerencie a carteira de clientes ativos e em implantação de forma inteligente."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      }
    >

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 bg-[#111827]/80 border border-blue-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total</p>
            <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400"><Users className="w-3.5 h-3.5" /></div>
          </div>
          <h3 className="text-2xl font-black text-white">{kpis.total}</h3>
        </Card>
        <Card className="p-4 bg-[#111827]/80 border border-emerald-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Ativos</p>
            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400">{kpis.ativos}</h3>
        </Card>
        <Card className="p-4 bg-[#111827]/80 border border-amber-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Em Implantação</p>
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400"><Clock className="w-3.5 h-3.5" /></div>
          </div>
          <h3 className="text-2xl font-black text-amber-400">{kpis.implantacao}</h3>
        </Card>
        <Card className="p-4 bg-[#111827]/80 border border-slate-500/20 backdrop-blur-xl hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Inativos</p>
            <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400"><AlertCircle className="w-3.5 h-3.5" /></div>
          </div>
          <h3 className="text-2xl font-black text-slate-400">{kpis.inativos}</h3>
        </Card>
      </div>

      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-white/5 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full bg-[#0B1120] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none text-white"
            />
          </div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
          >
            <option>Todos os setores</option>
            <option>Tecnologia</option>
            <option>Engenharia</option>
            <option>Saúde</option>
            <option>Varejo</option>
            <option>Indústria</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
          >
            <option>Todos as situações</option>
            <option>Ativo</option>
            <option>Em Implantação</option>
            <option>Inativo</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Setor</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wide">
                      {c.industry}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-600"/> {c.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-600"/> {c.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-600" /> {c.city}, {c.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border ${
                      c.status === 'Ativo'           ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      c.status === 'Em Implantação'  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                       'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCliente(c.id); }}
                      title="Remover Cliente"
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Building className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-medium">Nenhum cliente encontrado</p>
                    <p className="text-slate-600 text-xs mt-1">Ajuste os filtros ou cadastre um novo cliente</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-white/5">
          {filteredClientes.map((c) => (
            <div key={c.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.01] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-bold text-white text-sm truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-full border ${
                    c.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    c.status === 'Em Implantação' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>{c.status}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCliente(c.id); }}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-slate-400">{c.industry}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="w-3 h-3" /> {c.city}, {c.state}</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-600 shrink-0" /><span className="truncate">{c.email}</span></div>
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-600 shrink-0" /><span>{c.phone}</span></div>
              </div>
            </div>
          ))}
          {filteredClientes.length === 0 && (
            <div className="p-12 text-center">
              <Building className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Nenhum cliente cadastrado</p>
            </div>
          )}
        </div>
      </Card>

      <NovoClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleCreateCliente}
      />
    </PageContainer>
  );
}
