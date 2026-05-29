import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Search, Plus, Building, MapPin, Phone, Mail, MoreHorizontal, Trash2 } from "lucide-react";
import { ActionModal } from "../../components/ui/ActionModal";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";

export default function Clientes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos as situações");
  const [sectorFilter, setSectorFilter] = useState("Todos os setores");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [clientes, setClientes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("axis_clientes");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 1, name: "TechCorp Brasil", industry: "Tecnologia", city: "São Paulo", state: "SP", phone: "(11) 98888-7777", email: "contato@techcorp.com", status: "Ativo" },
      { id: 2, name: "Construtora RS", industry: "Engenharia", city: "Porto Alegre", state: "RS", phone: "(51) 97777-6666", email: "admin@crs.com.br", status: "Ativo" },
      { id: 3, name: "Clínica Vida", industry: "Saúde", city: "Rio de Janeiro", state: "RJ", phone: "(21) 99999-0000", email: "financeiro@vida.med.br", status: "Em Implantação" },
    ];
  });

  const saveClientes = (updated: any[]) => {
    setClientes(updated);
    try {
      localStorage.setItem("axis_clientes", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCreateCliente = (data: any) => {
    if (!data.nome) {
      toast.error("Nome da empresa é obrigatório.");
      return;
    }
    const newClient = {
      id: Date.now(),
      name: data.nome,
      industry: data.industry || "Tecnologia",
      city: data.cidade || "São Paulo",
      state: (data.estado || "SP").toUpperCase(),
      phone: data.telefone || "(11) 99999-9999",
      email: data.email || "contato@empresa.com",
      status: "Ativo"
    };

    const updated = [newClient, ...clientes];
    saveClientes(updated);
    toast.success("Cliente inserido com sucesso na base!");
  };

  const handleDeleteCliente = (id: number) => {
    const updated = clientes.filter(c => c.id !== id);
    saveClientes(updated);
    toast.success("Cliente removido.");
  };

  const filteredClientes = clientes.filter(c => {
     if (statusFilter !== "Todos as situações" && c.status !== statusFilter) return false;
     if (sectorFilter !== "Todos os setores" && c.industry !== sectorFilter) return false;
     if (searchQuery) {
       const term = searchQuery.toLowerCase();
       return c.name.toLowerCase().includes(term) ||
              c.email.toLowerCase().includes(term) ||
              c.industry.toLowerCase().includes(term);
     }
     return true;
  });

  return (
    <PageContainer
      title="Base de Clientes Axis"
      description="Gerencie a carteira de clientes ativos e em implantação de forma inteligente."
      actions={
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      }
    >

      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4 w-full flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cliente..." 
                  className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-white" 
                />
            </div>
            <select 
               value={sectorFilter}
               onChange={(e) => setSectorFilter(e.target.value)}
               className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#2563EB] focus:outline-none"
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
               className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-[#2563EB] focus:outline-none"
            >
               <option>Todos as situações</option>
               <option>Ativo</option>
               <option>Em Implantação</option>
               <option>Inativo</option>
            </select>
        </div>
        {/* Desktop / Tablet Table View */}
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
                    <div className="font-semibold text-white group-hover:text-[#2563EB] transition-colors flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-500" /> {c.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{c.industry}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-slate-300 text-xs">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500"/> {c.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500"/> {c.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                     <div className="flex items-center gap-1">
                       <MapPin className="w-3 h-3 text-slate-500" /> {c.city}, {c.state}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${c.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCliente(c.id);
                      }}
                      title="Remover Cliente"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (Phones) */}
        <div className="sm:hidden divide-y divide-white/5">
          {filteredClientes.map((c) => (
            <div key={c.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.01] transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                  <Building className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span className="font-bold text-white text-sm truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[8px] font-black rounded-full border shrink-0 ${c.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {c.status}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCliente(c.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-slate-400">{c.industry}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="w-3 h-3 mr-0.5" /> {c.city}, {c.state}</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5 text-[11px] text-slate-400 bg-white/[0.01] p-2 rounded-lg mt-1">
                 <div className="flex items-center gap-1.5">
                   <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                   <span className="truncate">{c.email}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                   <span>{c.phone}</span>
                 </div>
              </div>
            </div>
          ))}
          {filteredClientes.length === 0 && (
            <div className="p-8 text-center text-slate-500 border border-dashed border-white/5 rounded-xl">
              Nenhum cliente cadastrado
            </div>
          )}
        </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleCreateCliente}
        title="Novo Cliente"
        fields={[
          { name: "nome", label: "Nome do Cliente/Empresa", type: "text", required: true },
          { name: "documento", label: "CPF/CNPJ (Opcional)", type: "text" },
          { name: "industry", label: "Setor / Indústria", type: "select", options: ["Tecnologia", "Engenharia", "Saúde", "Varejo", "Indústria"], required: true },
          { name: "email", label: "E-mail Principal", type: "email", required: true },
          { name: "telefone", label: "Telefone", type: "tel", required: true },
          { name: "cidade", label: "Cidade", type: "text", required: true, defaultValue: "São Paulo" },
          { name: "estado", label: "Estado (Sigla)", type: "text", required: true, defaultValue: "SP" }
        ]}
      />
    </PageContainer>
  );
}
