import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { FileText, Plus, DollarSign, TrendingUp, AlertCircle, ChevronRight, Edit2, Trash2, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";

const contractSchema = z.object({
  cliente: z.string().min(1, "O cliente é obrigatório"),
  plano: z.string().min(1, "O plano é obrigatório"),
  valor: z.string().refine((val) => {
    const clean = val.replace(/[^0-9,.]/g, '');
    return !isNaN(parseFloat(clean.replace(',', '.'))) && clean.length > 0;
  }, "Formato de valor inválido. Use formato monetário, ex: 1500,00"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Insira uma data válida"),
});
type ContractFormData = z.infer<typeof contractSchema>;

export default function Contracts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const { contracts, addContract, deleteContract } = useData();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const onSubmit = (data: ContractFormData) => {
    const formattedData = data.data.split('-').reverse().join('/');
    const cleanValue = parseFloat(data.valor.replace(/[^0-9,.]/g, '').replace(',', '.'));
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(cleanValue);
    
    addContract({
      client: data.cliente,
      plan: data.plano,
      mrr: formattedValue,
      status: "Ativo",
      date: formattedData,
      progress: 100,
    });
    
    toast.success("Contrato criado com sucesso!");
    reset();
    setIsModalOpen(false);
  };
  
  const handleModalClose = () => {
      setIsModalOpen(false);
      reset();
  }

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Ativo": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Inadimplente": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Cancelado": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  }

  const filteredContracts = contracts.filter(c => 
    c.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toNumberMRR = (mrr: string | number): number => {
    if (typeof mrr === 'number') return mrr;
    const cleaned = mrr.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const totalMRR = contracts.reduce((acc, curr) => acc + toNumberMRR(curr.mrr), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Contratos</h1>
          <p className="text-sm text-slate-400">Contratos ativos, MRR e saúde financeira.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            Exportar CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-[#111827] to-[#111827]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">MRR Total</p>
            <h3 className="text-2xl font-bold text-white">R$ {totalMRR.toLocaleString('pt-BR')}</h3>
          </div>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-[#111827] to-[#111827]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Contratos Ativos</p>
            <h3 className="text-2xl font-bold text-white">{contracts.filter(c => c.status === 'Ativo').length}</h3>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-[#111827] to-[#111827]/80 border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Inadimplência</p>
            <h3 className="text-2xl font-bold text-white">{contracts.filter(c => c.status === 'Inadimplente').length}</h3>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-[#111827] to-[#111827]/80 border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Retenção Estimada</p>
            <h3 className="text-2xl font-bold text-white">96.8%</h3>
          </div>
        </Card>
      </div>

      <Card className="bg-[#111827]/50 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Buscar contratos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0B1120] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none w-full" 
                />
            </div>
            <select className="bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#2563EB]">
                <option>Todos os Planos</option>
                <option>Enterprise</option>
                <option>Pro</option>
                <option>Starter</option>
            </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-[#0B1120]/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">MRR</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assinatura</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white group-hover:text-[#06B6D4] transition-colors">{contract.client}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">{contract.plan}</td>
                  <td className="px-6 py-4 font-mono font-medium text-emerald-400">{contract.mrr}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    <div className="flex flex-col justify-center gap-1.5 h-[36px]">
                        {contract.date}
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden inline-[block]">
                            <div className="h-full bg-[#2563EB]" style={{ width: `${contract.progress}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button 
                            onClick={() => setContractToDelete(contract.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                            title="Excluir contrato"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-[#06B6D4] hover:bg-[#06B6D4]/10 rounded-md transition-colors ml-1"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
            <select {...register("cliente")} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none">
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
            <select {...register("plano")} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none">
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
            <input type="text" {...register("valor")} placeholder="Ex: 1500,00" className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#2563EB] focus:outline-none" />
            {errors.valor && <p className="text-rose-400 text-xs">{errors.valor.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Data de Assinatura</label>
            <input type="date" {...register("data")} className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:border-[#2563EB] focus:outline-none [color-scheme:dark]" />
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
