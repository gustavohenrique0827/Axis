import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import { NovoClienteModal } from "../../components/ui/modals/crm/NovoClienteModal";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { supabase } from "../../lib/supabase";
import { ClientesKPIs } from "./components/Clientes/ClientesKPIs";
import { ClientesList } from "./components/Clientes/ClientesList";

export default function Clientes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos as situações");
  const [sectorFilter, setSectorFilter] = useState("Todos os setores");
  const [searchQuery, setSearchQuery] = useState("");

  // Supabase (clientes) é a única fonte — sem cache local.
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(`Erro ao carregar clientes: ${error.message}`);
      else if (data) setClientes(data);
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
    if (!supabase) { toast.error("Supabase não configurado."); return; }
    const newClient = {
      name: data.nome,
      industry: data.industry || "Tecnologia",
      city: data.cidade || "São Paulo",
      state: (data.estado || "SP").toUpperCase(),
      phone: data.telefone || "(11) 99999-9999",
      email: data.email || "contato@empresa.com",
      status: "Ativo",
    };

    const { data: inserted, error } = await supabase.from("clientes").insert(newClient).select().maybeSingle();
    if (error) { toast.error(`Erro ao cadastrar cliente: ${error.message}`); return; }
    if (inserted) setClientes(prev => [inserted, ...prev]);
    toast.success("Cliente cadastrado com sucesso!");
    setIsModalOpen(false);
  };

  const handleDeleteCliente = async (id: string) => {
    if (!supabase) { toast.error("Supabase não configurado."); return; }
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { toast.error(`Erro ao remover cliente: ${error.message}`); return; }
    setClientes(prev => prev.filter(c => c.id !== id));
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
