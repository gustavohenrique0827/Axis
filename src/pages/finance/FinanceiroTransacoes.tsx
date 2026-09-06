import { useState, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ArrowDownLeft, ArrowUpRight, Search, Download, Filter,
  Calendar, CheckCircle2, Clock, AlertTriangle, FileText
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { useData } from "../../contexts/DataContext";
import { downloadCsv } from "../../lib/csvExport";

export default function FinanceiroTransacoes() {
  const { financeEntries } = useData();
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return financeEntries.filter(t => {
      const matchQ =
        t.description.toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q);
      const matchTipo =
        tipoFilter === "Todos" ||
        (tipoFilter === "Entradas" && t.type === "Receber") ||
        (tipoFilter === "Saídas" && t.type === "Pagar");
      return matchQ && matchTipo;
    });
  }, [financeEntries, search, tipoFilter]);

  const handleExport = () => {
    downloadCsv(
      `extrato_transacoes_${Date.now()}.csv`,
      ["Descrição", "Tipo", "Categoria", "Data", "Status", "Valor (R$)"],
      filtered.map(t => [
        t.description,
        t.type === "Receber" ? "Entrada" : "Saída",
        t.category,
        t.date,
        t.status,
        t.value.toFixed(2),
      ])
    );
  };

  return (
    <PageContainer
      title="Transações & Extrato Consolidado"
      description="Extrato completo de todas as movimentações financeiras, receitas e despesas da operação."
      actions={
        <Button variant="outline" onClick={handleExport} className="h-9 px-3.5 text-xs font-bold gap-1.5 rounded-xl">
          <Download className="w-3.5 h-3.5" /> Exportar Extrato
        </Button>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-blue)]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--color-surface-sunken)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
          {["Todos", "Entradas", "Saídas"].map(tp => (
            <button
              key={tp}
              onClick={() => setTipoFilter(tp)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tipoFilter === tp
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Descrição</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filtered.map(t => {
                const isEntrada = t.type === "Receber";
                return (
                  <tr key={t.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[var(--color-text-primary)]">{t.description}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isEntrada
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        {isEntrada ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {isEntrada ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--color-text-muted)]">{t.category}</td>
                    <td className="px-4 py-3.5 font-mono text-[var(--color-text-muted)]">{t.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                        {t.status}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-bold ${isEntrada ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isEntrada ? "+" : "-"} R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-text-muted)]">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
