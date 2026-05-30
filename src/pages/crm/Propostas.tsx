import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Download,
  Trash2,
  X,
  History,
  Send,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { Proposta, INITIAL_PROPOSTAS, handleDownloadPdf } from "./utils/proposalPdf";

export default function Propostas() {
  const [propostas, setPropostas] = useState<Proposta[]>(() => {
    try {
      const saved = localStorage.getItem("axis_propostas");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROPOSTAS;
  });
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal states
  const [newCliente, setNewCliente] = useState("");
  const [newTitulo, setNewTitulo] = useState("");
  const [newValor, setNewValor] = useState("");
  const [newVendedor, setNewVendedor] = useState("Carlos Silva");
  const [newVencimento, setNewVencimento] = useState("");

  const savePropostas = (updated: Proposta[]) => {
    setPropostas(updated);
    try {
      localStorage.setItem("axis_propostas", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCreateProposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliente || !newTitulo || !newValor) {
      toast.error("Por favor, preencha os campos obrigatórios!");
      return;
    }

    const today = new Date();
    const formattedToday = today.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const valDate = newVencimento 
      ? new Date(newVencimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      : new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

    const newProposal: Proposta = {
      id: Math.random().toString(36).substring(2, 9),
      cliente: newCliente,
      titulo: newTitulo,
      valor: newValor.startsWith("R$") ? newValor : `R$ ${parseFloat(newValor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      dataCriacao: formattedToday,
      vencimento: valDate,
      status: "Aberta",
      vendedor: newVendedor
    };

    const updated = [newProposal, ...propostas];
    savePropostas(updated);
    toast.success("Proposta comercial criada com sucesso!");
    setIsModalOpen(false);
    
    // reset form
    setNewCliente("");
    setNewTitulo("");
    setNewValor("");
    setNewVencimento("");
  };

  const handleDeleteProposta = (id: string) => {
    const updated = propostas.filter(p => p.id !== id);
    savePropostas(updated);
    toast.success("Proposta de venda excluída.");
  };

  const handleUpdateStatus = (id: string, newStatus: Proposta["status"]) => {
    const updated = propostas.map(p => p.id === id ? { ...p, status: newStatus } : p);
    savePropostas(updated);
    toast.success(`Proposta atualizada para: ${newStatus}`);
  };

  const filteredPropostas = propostas.filter(
    (p) =>
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.titulo.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Aceita":
        return {
          color: "text-emerald-500 bg-emerald-500/10",
          icon: CheckCircle2,
        };
      case "Enviada":
        return { color: "text-blue-500 bg-blue-500/10", icon: Send };
      case "Aberta":
        return { color: "text-amber-500 bg-amber-500/10", icon: Clock };
      case "Recusada":
        return { color: "text-rose-500 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-slate-500 bg-slate-500/10", icon: History };
    }
  };

  return (
    <PageContainer
      title="Propostas Axis"
      description="Gestão de orçamentos, contratos e follow-up de vendas de alta conversão."
      actions={
        <div className="flex items-center gap-3">
          <Button 
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            onClick={() => {
              toast.info("Apenas modelos premium de engenharia e tecnologia estão ativos no plano.");
            }}
          >
            Modelos
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2563EB] hover:bg-blue-605 text-white h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Nova Proposta
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Aguardando Aceite",
            value: "R$ 142.5k",
            icon: Send,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Convertidas (Mês)",
            value: "R$ 89.2k",
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Taxa de Conversão",
            value: "32%",
            icon: ArrowUpRight,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Propostas Ativas",
            value: propostas.length.toString(),
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-5 bg-[#111827]/80 border-white/5 backdrop-blur-md flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-white italic">
                {stat.value}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-[#111827]/50 border-white/5 flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou título..."
            className="w-full bg-transparent border-white/5 pl-12 h-12 rounded-xl text-sm italic text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => toast.info("Filtros extras ativados automaticamente para seller ativo.")}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
          >
            Filtros Avançados
          </Button>
        </div>
      </Card>

      <div className="overflow-x-auto pb-12">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">
              <th className="text-left pb-2 pl-6">Cliente / Título</th>
              <th className="text-left pb-2">Valor</th>
              <th className="text-left pb-2">Status</th>
              <th className="text-left pb-2">Datas</th>
              <th className="text-left pb-2">Vendedor</th>
              <th className="text-right pb-2 pr-6">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPropostas.map((item) => {
              const status = getStatusInfo(item.status);
              return (
                <tr
                  key={item.id}
                  className="group bg-[#111827]/80 hover:bg-white/[0.03] transition-all"
                >
                  <td className="py-5 pl-6 rounded-l-2xl border-y border-l border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">
                          {item.cliente}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                          {item.titulo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="text-sm font-black text-white">
                      {item.valor}
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${status.color} border-none font-black uppercase tracking-widest text-[9px] px-2.5 py-1 flex items-center gap-1.5 w-fit`}
                      >
                        <status.icon className="w-3 h-3" />
                        {item.status}
                      </Badge>
                      
                      {/* Quick Status Adjustments */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button 
                          onClick={() => handleUpdateStatus(item.id, "Aceita")}
                          className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"
                          title="Marcar como Aceita"
                        >
                          Aceitar
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, "Recusada")}
                          className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"
                          title="Marcar como Recusada"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="text-[10px] font-bold text-slate-400">
                      Criada: {item.dataCriacao}
                    </div>
                    <div className="text-[10px] font-bold text-rose-500">
                      Venc: {item.vencimento}
                    </div>
                  </td>
                  <td className="py-5 border-y border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">
                        {item.vendedor}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-6 rounded-r-2xl border-y border-r border-white/5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDownloadPdf(item)}
                        title="Baixar Contrato (PDF)"
                        className="p-2 text-slate-400 hover:text-white hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProposta(item.id)}
                        title="Deletar Proposta"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  💥 Criar Proposta Axis
                </h3>
                <p className="text-xs text-slate-400 mt-1">Preencha os dados comerciais da nova oferta.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposta} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grupo Pão de Açúcar, TechCorp"
                  value={newCliente}
                  onChange={(e) => setNewCliente(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Projeto / Título da Proposta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consultoria CRM Adicional, Migração DB"
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Valor Proposto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 15000"
                    value={newValor}
                    onChange={(e) => setNewValor(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Prazo de Validade</label>
                  <input
                    type="date"
                    value={newVencimento}
                    onChange={(e) => setNewVencimento(e.target.value)}
                    className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Vendedor Associado</label>
                <select
                  value={newVendedor}
                  onChange={(e) => setNewVendedor(e.target.value)}
                  className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Carlos Silva">Carlos Silva</option>
                  <option value="Ana Paula">Ana Paula</option>
                  <option value="Roberto Neves">Roberto Neves</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl border border-white/5 uppercase text-xs font-black tracking-widest"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-blue-600 text-white h-12 rounded-xl uppercase text-xs font-black tracking-widest"
                >
                  Criar Proposta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
