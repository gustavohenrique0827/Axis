import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { NovoClienteModal } from "../../components/ui/modals/crm/NovoClienteModal";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { supabase } from "../../lib/supabase";
import { useData } from "../../contexts/DataContext";
import { ClientesKPIs } from "./components/Clientes/ClientesKPIs";
import { ClientesList } from "./components/Clientes/ClientesList";

const STORAGE_KEY = "axis_clientes";

const DEFAULT_CLIENTS = [
  { id: "1", name: "Alpha Tech Soluções", industry: "Tecnologia", city: "São Paulo", state: "SP", phone: "(11) 98765-4321", email: "contato@alphatech.com", status: "Ativo" },
  { id: "2", name: "Beta Logística & Frotas", industry: "Logística", city: "Curitiba", state: "PR", phone: "(41) 99876-5432", email: "suporte@betalog.com.br", status: "Em Implantação" },
  { id: "3", name: "Gama Saúde Hospitalar", industry: "Saúde", city: "Belo Horizonte", state: "MG", phone: "(31) 97654-3210", email: "diretoria@gamasaude.com", status: "Ativo" },
];

export default function Clientes() {
  const { clienteBase } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos as situações");
  const [sectorFilter, setSectorFilter] = useState("Todos os setores");
  const [searchQuery, setSearchQuery] = useState("");

  const [clientes, setClientes] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    if (clienteBase && clienteBase.length > 0) return clienteBase;
    return DEFAULT_CLIENTS;
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) {
        console.error("[Supabase] clientes load error:", error.message);
      } else if (data && data.length > 0) {
        setClientes(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    });
  }, []);

  const kpis = useMemo(() => ({
    total:       clientes.length,
    ativos:      clientes.filter(c => c.status === "Ativo").length,
    implantacao: clientes.filter(c => c.status === "Em Implantação").length,
    inativos:    clientes.filter(c => c.status === "Inativo").length,
  }), [clientes]);

  const handleCreateCliente = async (data: any) => {
    if (!data.nome) { toast.error("Nome da empresa é obrigatório."); return; }
    const newClient = {
      id: Date.now().toString(),
      name: data.nome,
      industry: data.industry || "Tecnologia",
      city: data.cidade || "São Paulo",
      state: (data.estado || "SP").toUpperCase(),
      phone: data.telefone || "(11) 99999-9999",
      email: data.email || "contato@empresa.com",
      status: "Ativo",
    };

    setClientes(prev => {
      const updated = [newClient, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (supabase) {
      const { error } = await supabase.from("clientes").insert(newClient);
      if (error) console.error("[Supabase] clientes insert error:", error.message);
    }
    toast.success("Cliente cadastrado com sucesso!");
    setIsModalOpen(false);
  };

  const handleDeleteCliente = async (id: string) => {
    setClientes(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (supabase) {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) console.error("[Supabase] clientes delete error:", error.message);
    }
    toast.success("Cliente removido com sucesso!");
  };

  return (
    <PageContainer
      title="Base de Clientes Axis"
      description="Gerencie a carteira de clientes ativos e em implantação de forma inteligente."
      actions={
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Cliente
        </Button>
      }
    >
      <ClientesKPIs {...kpis} />

      <ClientesList
        clientes={clientes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sectorFilter={sectorFilter}
        onSectorChange={setSectorFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onDelete={handleDeleteCliente}
      />

      <NovoClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleCreateCliente}
      />
    </PageContainer>
  );
}
