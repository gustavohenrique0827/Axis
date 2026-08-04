import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { ConfirmModal } from "../../components/ui/modals/shared/ConfirmModal";
import { Plus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { ContractsKPIs } from "./components/Contracts/ContractsKPIs";
import { ContractsTable } from "./components/Contracts/ContractsTable";

const contractSchema = z.object({
  cliente: z.string().min(1, "O cliente é obrigatório"),
  plano:   z.string().min(1, "O plano é obrigatório"),
  valor:   z.string().refine((val) => {
    const clean = val.replace(/[^0-9,.]/g, "");
    return !isNaN(parseFloat(clean.replace(",", "."))) && clean.length > 0;
  }, "Formato de valor inválido. Use formato monetário, ex: 1500,00"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Insira uma data válida"),
});
type ContractFormData = z.infer<typeof contractSchema>;

const toNumberMRR = (mrr: string | number): number => {
  if (typeof mrr === "number") return mrr;
  const cleaned = mrr.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export default function Contracts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const { contracts, addContract, deleteContract } = useData();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const onSubmit = (data: ContractFormData) => {
    const formattedData = data.data.split("-").reverse().join("/");
    const cleanValue = parseFloat(data.valor.replace(/[^0-9,.]/g, "").replace(",", "."));
    const formattedValue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(cleanValue);
    addContract({ client: data.cliente, plan: data.plano, mrr: formattedValue, status: "Ativo", date: formattedData, progress: 100 });
    toast.success("Contrato criado com sucesso!");
    reset();
    setIsModalOpen(false);
  };

  const handleModalClose = () => { setIsModalOpen(false); reset(); };

  const totalMRR = contracts.reduce((acc, curr) => acc + toNumberMRR(curr.mrr), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Contratos</h1>
          <p className="text-sm text-slate-400">Contratos ativos, MRR e saúde financeira.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">Exportar CSV</Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <ContractsKPIs
        totalMRR={totalMRR}
        ativos={contracts.filter(c => c.status === "Ativo").length}
        inadimplentes={contracts.filter(c => c.status === "Inadimplente").length}
      />

      <ContractsTable
        contracts={contracts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDelete={(id) => setContractToDelete(id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Novo Contrato"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleModalClose}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)}>Salvar Contrato</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Cliente</label>
            <select {...register("cliente")} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/20 focus:outline-none">
              <option value="">Selecione o Cliente</option>
              <option value="TechCorp Brasil">TechCorp Brasil</option>
              <option value="Construtora RS">Construtora RS</option>
              <option value="Clínica Vida">Clínica Vida</option>
              <option value="Mendes Consultoria">Mendes Consultoria</option>
            </select>
            {errors.cliente && <p className="text-rose-400 text-xs">{errors.cliente.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Plano Acordado</label>
            <select {...register("plano")} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/20 focus:outline-none">
              <option value="">Selecione o Plano</option>
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Consultoria Avulsa">Consultoria Avulsa</option>
            </select>
            {errors.plano && <p className="text-rose-400 text-xs">{errors.plano.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Valor (MRR)</label>
            <input type="text" {...register("valor")} placeholder="Ex: 1500,00" className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/20 focus:outline-none" />
            {errors.valor && <p className="text-rose-400 text-xs">{errors.valor.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Data de Assinatura</label>
            <input type="date" {...register("data")} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:border-white/20 focus:outline-none [color-scheme:dark]" />
            {errors.data && <p className="text-rose-400 text-xs">{errors.data.message}</p>}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={contractToDelete !== null}
        onClose={() => setContractToDelete(null)}
        onConfirm={() => {
          if (contractToDelete) {
            deleteContract(contractToDelete);
            toast.success("Contrato excluído com sucesso!");
          }
        }}
        title="Confirmar Exclusão de Contrato"
        message="Tem certeza de que deseja remover permanentemente este contrato? Os dados associados não poderão ser recuperados."
      />
    </div>
  );
}
