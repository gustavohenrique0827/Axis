import { Card } from "../../components/ui/card";
import { 
  Download, Calendar, CheckCircle2, 
  Clock, AlertTriangle, Plus, Trash2, X, DollarSign 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import React, { useMemo, useState } from "react";
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
      case 'Pago': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case 'A Vencer': return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case 'Atrasado': return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default: return "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Lançamento
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.info("Exportação de relatório em formato XLSX gerada.")}
            className="h-9 px-4 text-xs font-bold gap-1.5 border-[var(--color-border-default)]"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
        </div>
      </div>

      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Fluxo de Caixa / {type === 'Pagar' ? 'Contas a Pagar' : 'Contas a Receber'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary-blue)] font-semibold">
            <Calendar className="w-3.5 h-3.5" /> Ciclo Atual
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-xs text-left hidden md:table">
            <thead className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-6 py-3.5">Descrição</th>
                <th className="px-6 py-3.5">Categoria</th>
                <th className="px-6 py-3.5">Vencimento</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Valor</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    Nenhum lançamento encontrado para este período.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">{item.description}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{item.category}</td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)] font-mono">{item.date}</td>
                    <td className="px-6 py-4">
                      <button 
                        type="button"
                        onClick={() => {
                          const nextStatus = item.status === 'Pago' ? 'A Vencer' : 'Pago';
                          updateFinanceEntry(item.id, { status: nextStatus });
                          toast.success(`Lançamento marcado como ${nextStatus}`);
                        }}
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </button>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${type === 'Pagar' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {type === 'Pagar' ? '-' : '+'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => {
                          deleteFinanceEntry(item.id);
                          toast.success("Lançamento excluído.");
                        }}
                        className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[var(--color-surface-sunken)] border-t border-[var(--color-border-subtle)] font-bold">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-[var(--color-text-muted)] text-right uppercase tracking-wider text-[10px]">Total:</td>
                <td className={`px-6 py-4 font-mono font-bold text-sm text-right ${type === 'Pagar' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {data.map((item) => (
              <div key={item.id} className="bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] p-4 rounded-xl flex flex-col gap-3 relative">
                <button 
                  type="button"
                  onClick={() => {
                    deleteFinanceEntry(item.id);
                    toast.success("Lançamento excluído.");
                  }}
                  className="absolute top-3 right-3 text-[var(--color-text-faint)] hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <p className="font-bold text-[var(--color-text-primary)] text-xs mb-1 pr-6">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase">{item.category}</span>
                    <span className="text-[10px] text-[var(--color-text-faint)] font-mono">{item.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2.5">
                  <button 
                    type="button"
                    onClick={() => {
                      const nextStatus = item.status === 'Pago' ? 'A Vencer' : 'Pago';
                      updateFinanceEntry(item.id, { status: nextStatus });
                    }}
                    className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-md border ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status}
                  </button>
                  <p className={`font-mono font-bold text-xs ${type === 'Pagar' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-surface-sunken)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--color-primary-blue)]" />
                  Novo {type === 'Pagar' ? 'Gasto / Despesa' : 'Recebimento / Receita'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Registre um lançamento financeiro no sistema.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Servidor AWS, Licença de Software, Fatura..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Categoria Financeira</label>
                <input
                  type="text"
                  placeholder="Ex: Infraestrutura, Operacional, Marketing..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0,00"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Data de Vencimento</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 text-xs font-bold shadow-xs"
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
