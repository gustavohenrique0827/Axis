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
  const [editingCliente, setEditingCliente] = useState<any | null>(null);
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
    setClientes(prev => [newClient, ...prev]);
    if (supabase) {
      const { error } = await supabase.from("clientes").insert(newClient);
      if (error) console.error("[Supabase] clientes insert error:", error.message);
    }
    toast.success("Cliente inserido com sucesso!");
  };

  const handleEditCliente = (cliente: any) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleUpdateCliente = async (data: any) => {
    if (!editingCliente) return;
    if (!data.nome) { toast.error("Nome da empresa é obrigatório."); return; }
    const updated = {
      name: data.nome,
      industry: data.industry || editingCliente.industry,
      city: data.cidade || editingCliente.city,
      state: (data.estado || editingCliente.state || "SP").toUpperCase(),
      phone: data.telefone || editingCliente.phone,
      email: data.email || editingCliente.email,
    };
    setClientes(prev => prev.map(c => c.id === editingCliente.id ? { ...c, ...updated } : c));
    if (supabase) {
      const { error } = await supabase.from("clientes").update(updated).eq("id", editingCliente.id);
      if (error) console.error("[Supabase] clientes update error:", error.message);
    }
    toast.success("Cliente atualizado com sucesso!");
    setEditingCliente(null);
  };

  const handleDeleteCliente = async (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
    if (supabase) {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) console.error("[Supabase] clientes delete error:", error.message);
    }
    toast.success("Cliente removido.");
  };

  return (
    <PageContainer
      title="Base de Clientes Axis"
      description="Gerencie a carteira de clientes ativos e em implantação de forma inteligente."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
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
        onEdit={handleEditCliente}
      />

      <NovoClienteModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCliente(null); }}
        onAction={editingCliente ? handleUpdateCliente : handleCreateCliente}
        initialValue={editingCliente ? {
          nome: editingCliente.name,
          industry: editingCliente.industry,
          email: editingCliente.email,
          telefone: editingCliente.phone,
          cidade: editingCliente.city,
          estado: editingCliente.state,
        } : null}
        heading={editingCliente ? "Editar Cliente" : "Novo Cliente"}
        subheading={editingCliente ? "Atualize os dados da conta no CRM Axis" : "Cadastro de conta no CRM Axis"}
        submitLabel={editingCliente ? "Salvar Alterações" : "Cadastrar Cliente"}
      />
    </PageContainer>
  );
}
