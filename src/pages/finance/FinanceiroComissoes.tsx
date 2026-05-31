import React, { useMemo, useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { DollarSign, Download, Calendar, ArrowUpRight, Plus, HelpCircle, BadgeAlert, CheckCircle, RefreshCw, Layers, PlusCircle, Trash2 } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

interface CommissionRecord {
  id: string;
  vendedor: string;
  periodo: string;
  baseValor: number;
  taxaPercent: number;
  comissaoValor: number;
  status: "Pago" | "A Pagar";
}

const defaultComissions: CommissionRecord[] = [];

export default function FinanceiroComissoes() {
  const { leads } = useData();

  // Load custom list from localStorage or defaults
  const [comissoes, setComissoes] = useState<CommissionRecord[]>(() => {
    try {
      const saved = localStorage.getItem("axis_comissoes_list_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultComissions;
  });

  // Automatically sync to local storage
  useEffect(() => {
    localStorage.setItem("axis_comissoes_list_v2", JSON.stringify(comissoes));
  }, [comissoes]);

  // Load salespeople from global system/leads to populate addition dropdowns
  const availableSellers = useMemo(() => {
    const list = Array.from(new Set(["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos", "Juliana Costa", ...leads.map(l => l.seller).filter(Boolean)]));
    return list;
  }, [leads]);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedorInput, setVendedorInput] = useState("Carlos Eduardo Mendes");
  const [periodoInput, setPeriodoInput] = useState("Maio/2026");
  const [baseValorInput, setBaseValorInput] = useState("100000");
  const [taxaPctInput, setTaxaPctInput] = useState("5");

  const [filterPeriod, setFilterPeriod] = useState<string>("Maio/2026");

  // Filtered list
  const filteredComissoes = useMemo(() => {
    return comissoes.filter(c => c.periodo === filterPeriod);
  }, [comissoes, filterPeriod]);

  // Calculations
  const totalApurado = useMemo(() => {
    return filteredComissoes.reduce((acc, curr) => acc + curr.comissaoValor, 0);
  }, [filteredComissoes]);

  const totalPago = useMemo(() => {
    return filteredComissoes
      .filter(c => c.status === "Pago")
      .reduce((acc, curr) => acc + curr.comissaoValor, 0);
  }, [filteredComissoes]);

  const totalPendente = useMemo(() => {
    return filteredComissoes
      .filter(c => c.status === "A Pagar")
      .reduce((acc, curr) => acc + curr.comissaoValor, 0);
  }, [filteredComissoes]);

  const currencyFormater = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const handleToggleStatus = (id: string, current: "Pago" | "A Pagar") => {
    const nextStatus = current === "Pago" ? "A Pagar" : "Pago";
    setComissoes(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    toast.success(`Status da comissão alterado para: ${nextStatus}`);
  };

  const handleCreateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendedorInput || !baseValorInput) {
      toast.error("Por favor, preencha as informações obrigatórias.");
      return;
    }

    const baseVal = parseFloat(baseValorInput) || 0;
    const taxa = parseFloat(taxaPctInput) || 5;
    const comValue = baseVal * (taxa / 100);

    const record: CommissionRecord = {
      id: "manual-" + Date.now().toString(),
      vendedor: vendedorInput,
      periodo: periodoInput,
      baseValor: baseVal,
      taxaPercent: taxa,
      comissaoValor: comValue,
      status: "A Pagar"
    };

    setComissoes(prev => [record, ...prev]);
    toast.success("Novo registro de comissão lançado!");
    setIsModalOpen(false);
  };

  const handleDeleteCommission = (id: string) => {
    setComissoes(prev => prev.filter(c => c.id !== id));
    toast.success("Registro de comissão deletado.");
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + ["Colaborador;Periodo;Faturamento Base;Taxa;Comissao;Status"].join("\r\n") + "\r\n"
      + filteredComissoes.map(c => `"${c.vendedor}";"${c.periodo}";"${c.baseValor}";"${c.taxaPercent}%";"${c.comissaoValor}";"${c.status}"`).join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `comissoes_${filterPeriod.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório de comissionamento exportado (CSV)!");
  };

  return (
    <PageContainer
      title="Comissões da Equipe"
      description="Apuração estratégica de comissões, faturamento sob gestão do vendedor, acompanhamento do OTE e pagamentos residuais de SDR e Closers."
      actions={
        <div className="flex gap-2">
          <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 text-white h-11"
          >
            <option value="Maio/2026">Maio/2026</option>
            <option value="Abril/2026">Abril/2026</option>
          </select>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest h-11 px-6 rounded-xl">
             <Plus className="w-4 h-4 mr-1" /> Novo Lançamento
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="border-white/10 bg-[#111827] text-slate-300 hover:text-white h-11 text-[10px] uppercase font-bold tracking-widest px-4 rounded-xl">
            <Download className="w-4 h-4 mr-1" /> Exportar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/5 border-l-[4px] border-l-blue-500 flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Comissões</div>
            <div className="text-3xl font-black font-mono text-white mt-2">{currencyFormater(totalApurado)}</div>
            <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Soma de comissões para {filterPeriod}</div>
          </Card>

          <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/5 border-l-[4px] border-l-emerald-500 flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest text-[#10B981]">Total Pago</div>
            <div className="text-3xl font-black font-mono text-[#10B981] mt-2">{currencyFormater(totalPago)}</div>
            <div className="text-[9px] text-emerald-500/80 font-bold uppercase mt-1">Concluído e transferido</div>
          </Card>

          <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/5 border-l-[4px] border-l-amber-500 flex flex-col justify-between">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest text-amber-500">Pendente de Pgto</div>
            <div className="text-3xl font-black font-mono text-amber-500 mt-2">{currencyFormater(totalPendente)}</div>
            <div className="text-[9px] text-amber-500/80 font-bold uppercase mt-1">Compromisso financeiro em aberto</div>
          </Card>
        </div>

        <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden rounded-2xl shadow-xl">
          <div className="p-5 border-b border-white/5 bg-[#0B1120]/40 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" /> Registro Detalhado de Comissionamento ({filteredComissoes.length})
            </h3>
            <span className="text-[9px] text-slate-500 font-bold uppercase">{filterPeriod}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0B1120]/20 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="p-4 pl-6">Vendedor</th>
                  <th className="p-4">Período</th>
                  <th className="p-4">Base (Faturamento)</th>
                  <th className="p-4">Alíquota %</th>
                  <th className="p-4">Comissão Devida</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {filteredComissoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 italic uppercase font-black text-[10px] tracking-widest">
                      Nenhuma comissão cadastrada ou apurada para este período.
                    </td>
                  </tr>
                ) : (
                  filteredComissoes.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="p-4 pl-6 font-bold text-white uppercase">{item.vendedor}</td>
                      <td className="p-4 text-slate-400 font-mono">{item.periodo}</td>
                      <td className="p-4 font-mono text-slate-300">{currencyFormater(item.baseValor)}</td>
                      <td className="p-4 font-mono font-black text-slate-500">{item.taxaPercent}%</td>
                      <td className="p-4 font-mono font-black text-[#10B981]">{currencyFormater(item.comissaoValor)}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border transition-all cursor-pointer hover:brightness-125 ${
                            item.status === 'Pago' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDeleteCommission(item.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Manual record addition modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-500" /> Nova Comissão Manual
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lançar ganho ou override comercial.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCommission} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Vendedor Comercial / Closer</label>
                <select 
                  className="w-full bg-[#1e293b] text-white border border-white/5 rounded-xl h-11 px-4 text-xs font-black focus:outline-none"
                  value={vendedorInput}
                  onChange={(e) => setVendedorInput(e.target.value)}
                >
                  {availableSellers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Mês/Ano</label>
                  <select 
                    className="w-full bg-[#1e293b] text-white border border-white/5 rounded-xl h-11 px-4 text-xs font-black focus:outline-none"
                    value={periodoInput}
                    onChange={(e) => setPeriodoInput(e.target.value)}
                  >
                    <option value="Maio/2026">Maio/2026</option>
                    <option value="Abril/2026">Abril/2026</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Alíquota (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full bg-[#1e293b] text-white border border-white/5 rounded-xl h-11 px-4 text-xs font-black focus:outline-none focus:border-blue-500"
                    value={taxaPctInput}
                    onChange={(e) => setTaxaPctInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Faturamento Base Gerado (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  required
                  className="w-full bg-[#1e293b] text-white border border-white/5 rounded-xl h-11 px-4 text-xs font-black focus:outline-none focus:border-blue-500"
                  value={baseValorInput}
                  onChange={(e) => setBaseValorInput(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Lançar Comissão
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

