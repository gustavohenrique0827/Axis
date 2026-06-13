import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { CriarPropostaModal } from "../../components/ui/CriarPropostaModal";
import { NovaPropostaRapidaModal } from "../../components/ui/NovaPropostaRapidaModal";

import { PropostasKPIs } from "./components/Propostas/PropostasKPIs";
import { PropostasTable } from "./components/Propostas/PropostasTable";

export default function Propostas() {
  const { proposals: propostas, addProposal, updateProposal, deleteProposal } = useData();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPropostaModalOpen, setIsPropostaModalOpen] = useState(false);

  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const handleCreatePropostaNew = (data: any) => {
    addProposal({
      id: Math.random().toString(36).substring(2, 9),
      cliente: data.cliente,
      titulo: data.titulo,
      valor: `R$ ${parseFloat(data.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      dataCriacao: fmt(new Date()),
      vencimento: new Date(data.dataValidade).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Enviada",
      vendedor: "Sistema Axis",
    });
    toast.success("✨ Proposta criada com sucesso! Pronta para envio.");
    setIsPropostaModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: any) => {
    updateProposal(id, { status: newStatus });
    toast.success(`Proposta atualizada para: ${newStatus}`);
  };

  return (
    <PageContainer
      title="Propostas Axis"
      description="Gestão de orçamentos, contratos e follow-up de vendas de alta conversão."
      actions={
        <div className="flex items-center gap-3">
          <Button
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            onClick={() => toast.info("Apenas modelos premium de engenharia e tecnologia estão ativos no plano.")}
          >
            Modelos
          </Button>
          <Button
            onClick={() => setIsPropostaModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-605 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Proposta
          </Button>
        </div>
      }
    >
      <PropostasKPIs propostas={propostas as any} />

      <PropostasTable
        propostas={propostas as any}
        search={search}
        onSearchChange={setSearch}
        onUpdateStatus={handleUpdateStatus}
        onDelete={(id) => { deleteProposal(id); toast.success("Proposta de venda excluída."); }}
      />

      <NovaPropostaRapidaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={({ cliente, titulo, valor, vencimento, vendedor }) => {
          const today = new Date();
          const valDate = vencimento ? fmt(new Date(vencimento)) : fmt(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000));
          addProposal({
            id: Math.random().toString(36).substring(2, 9),
            cliente, titulo,
            valor: valor.startsWith("R$") ? valor : `R$ ${parseFloat(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            dataCriacao: fmt(today),
            vencimento: valDate,
            status: "Aberta",
            vendedor,
          });
          toast.success("Proposta comercial criada com sucesso!");
          setIsModalOpen(false);
        }}
      />

      <CriarPropostaModal
        isOpen={isPropostaModalOpen}
        onClose={() => setIsPropostaModalOpen(false)}
        onSave={handleCreatePropostaNew}
        title="Criar Proposta Axis"
        submitText="Gerar Proposta"
      />
    </PageContainer>
  );
}
