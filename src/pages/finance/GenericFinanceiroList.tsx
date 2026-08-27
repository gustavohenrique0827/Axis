import { Card } from "../../components/ui/card";
import { 
  FileText, Download, Calendar, Filter, CheckCircle2, 
  Clock, AlertTriangle, Plus, Trash2, X, DollarSign 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import React, { useMemo, useState } from "react";
import { FinanceEntry } from "../../contexts/DataContext";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";

interface GenericProps {
  title: string;
  desc: string;
  type: 'Pagar' | 'Receber';
}

export default function GenericFinanceiroList({ title, desc, type }: GenericProps) {
  const { financeEntries, addFinanceEntry, deleteFinanceEntry, updateFinanceEntry } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New entry form
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");

  const data = useMemo(() => {
    return financeEntries.filter(f => f.type === type);
  }, [financeEntries, type]);

  const totalValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  const handleExport = () => {
    const lines = ['Descrição;Categoria;Data;Status;Valor'];
    data.forEach(item => lines.push(`"${item.description}";"${item.category}";"${item.date}";"${item.status}";${item.value}`));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type === 'Pagar' ? 'contas_a_pagar' : 'contas_a_receber'}.csv`;
    a.click();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newValue) return;

    addFinanceEntry({
      description: newDesc,
      category: newCategory || "Geral",
      value: parseFloat(newValue),
      status: "A Vencer",
      type: type,
      date: newDate ? new Date(newDate).toLocaleDateString("pt-BR") : new Date().toLocaleDateString("pt-BR")
    });

    setIsModalOpen(false);
    setNewDesc("");
    setNewCategory("");
    setNewValue("");
    setNewDate("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pago': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'A Vencer': return <Clock className="w-3 h-3 mr-1" />;
      default: return <AlertTriangle className="w-3 h-3 mr-1" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'A Vencer': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'Atrasado': return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">{title}</h1>
          <p className="text-sm text-slate-500 italic">{desc}</p>
        </div>
        <div className="flex gap-2">
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl"
            >
                <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2 border-white/10 bg-[var(--color-surface-elevated)] text-slate-400 hover:text-white h-10 text-[10px] uppercase font-bold tracking-widest px-4 rounded-xl">
                <Download className="w-4 h-4" /> Exportar
            </Button>
        </div>
      </div>

      <Card className="bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10 overflow-hidden rounded-2xl shadow-2xl">
        <div className="p-5 border-b border-white/10 bg-[var(--color-surface)]/50 flex items-center justify-between">
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fluxo de Caixa / Lançamentos</div>
           <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
             <Calendar className="w-4 h-4" /> Ciclo de Faturamento Atual
           </div>
        </div>
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-sm text-left hidden md:table">
            <thead className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-[var(--color-surface)]/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5">Categoria</th>
                <th className="px-6 py-5">Data</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Valor</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-600 italic uppercase text-[10px] font-bold tracking-widest">
                    Nenhum lançamento encontrado para este período.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-bold text-white uppercase text-xs tracking-tight">{item.description}</td>
                    <td className="px-6 py-5 text-slate-400 text-xs font-medium">{item.category}</td>
                    <td className="px-6 py-5 text-slate-500 text-xs font-mono">{item.date}</td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => {
                          const nextStatus = item.status === 'Pago' ? 'A Vencer' : 'Pago';
                          updateFinanceEntry(item.id, { status: nextStatus });
                          toast.success(`Lançamento marcado como ${nextStatus}`);
                        }}
                        className={`inline-flex items-center px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all cursor-pointer hover:brightness-125 ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </button>
                    </td>
                    <td className={`px-6 py-5 text-right font-mono font-bold ${type === 'Pagar' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {type === 'Pagar' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button 
                         onClick={() => deleteFinanceEntry(item.id)}
                         className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[var(--color-surface)]/40 border-t border-white/10">
              <tr>
                <td colSpan={4} className="px-6 py-6 font-black text-slate-500 text-right uppercase tracking-widest text-[10px]">Total Acumulado:</td>
                <td className={`px-6 py-6 font-mono font-black text-lg text-right ${type === 'Pagar' ? 'text-rose-500' : 'text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {data.map((item) => (
              <div key={item.id} className="bg-[var(--color-surface)] border border-white/5 p-4 rounded-2xl flex flex-col gap-4 relative">
                <button 
                  onClick={() => deleteFinanceEntry(item.id)}
                  className="absolute top-4 right-4 text-slate-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <p className="font-black text-white text-xs uppercase tracking-tight mb-1">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{item.category}</span>
                    <span className="text-[10px] text-slate-600 font-mono italic">{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <button 
                    onClick={() => {
                      const nextStatus = item.status === 'Pago' ? 'A Vencer' : 'Pago';
                      updateFinanceEntry(item.id, { status: nextStatus });
                    }}
                    className={`inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status}
                  </button>
                  <p className={`font-mono font-bold ${type === 'Pagar' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Modern Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  Novo {type === 'Pagar' ? 'Gasto' : 'Recebimento'}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registre um lançamento manual no sistema Axis.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">O que é? (Descrição)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Servidor, Venda de Licença..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[var(--color-surface-elevated)] text-white border border-white/5 rounded-xl h-12 px-4 shadow-inner text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoria Financeira</label>
                <input
                  type="text"
                  placeholder="Ex: Infraestrutura, Operacional, Marketing..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--color-surface-elevated)] text-white border border-white/5 rounded-xl h-12 px-4 shadow-inner text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0,00"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-[var(--color-surface-elevated)] text-white border border-white/5 rounded-xl h-12 px-4 shadow-inner text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vencimento</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[var(--color-surface-elevated)] text-white border border-white/5 rounded-xl h-12 px-4 shadow-inner text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20"
                >
                  Confirmar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
