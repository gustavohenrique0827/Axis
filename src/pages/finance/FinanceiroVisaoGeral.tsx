import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Printer, Download } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { PageContainer } from "../../components/PageContainer";
import { FinanceiroKPIs } from "./components/FinanceiroVisaoGeral/FinanceiroKPIs";
import { FinanceiroCashflowChart } from "./components/FinanceiroVisaoGeral/FinanceiroCashflowChart";
import { FinanceiroBottomPanels } from "./components/FinanceiroVisaoGeral/FinanceiroBottomPanels";

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function FinanceiroVisaoGeral() {
  const { financeEntries, contracts, squads } = useData();

  const { receita, despesa, mrr, inadimplencia } = useMemo(() => {
    const receita = financeEntries.filter(f => f.type === "Receber" && f.status === "Pago").reduce((s, f) => s + f.value, 0);
    const despesa = financeEntries.filter(f => f.type === "Pagar"   && f.status === "Pago").reduce((s, f) => s + f.value, 0);
    const mrr = contracts.filter(c => c.status === "Ativo").reduce((s, c) => {
      const raw = c.mrr;
      const valStr = typeof raw === "number" ? String(raw) : (raw ?? "0");
      const val = parseFloat(String(valStr).replace(/[^\d]/g, "") || "0") / 100;
      return s + (isNaN(val) ? 0 : val);
    }, 0);
    const entriesPagar = financeEntries.filter(f => f.type === "Pagar");
    const inadimplencia = entriesPagar.length > 0 ? (entriesPagar.filter(f => f.status === "Atrasado").length / entriesPagar.length) * 100 : 0;
    return { receita, despesa, mrr, inadimplencia };
  }, [financeEntries, contracts]);

  const upcomingEntries = useMemo(() =>
    financeEntries.filter(f => f.status === "A Vencer").slice(0, 4).map(f => ({
      label: f.description,
      date: f.date,
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.value),
      type: f.type.toLowerCase() as "pagar" | "receber",
    })),
  [financeEntries]);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const y = d.getFullYear(); const m = d.getMonth();
      const monthEntries = financeEntries.filter(f => {
        try {
          const parts = f.date?.split("/");
          if (!parts || parts.length < 3) return false;
          const fd = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          return fd.getFullYear() === y && fd.getMonth() === m;
        } catch { return false; }
      });
      const rec = monthEntries.filter(f => f.type === "Receber" && f.status === "Pago").reduce((s, f) => s + f.value, 0);
      const des = monthEntries.filter(f => f.type === "Pagar"   && f.status === "Pago").reduce((s, f) => s + f.value, 0);
      return { name: MONTH_NAMES[m], receita: rec, despesa: des, projection: Math.round(rec * 1.1) };
    });
  }, [financeEntries]);

  const stabilityScore = receita + despesa > 0 ? Math.round((receita / (receita + despesa)) * 100) : 0;

  const handleExport = () => {
    const lines = ['Descrição;Tipo;Categoria;Data;Status;Valor'];
    financeEntries.forEach(f => lines.push(`"${f.description}";"${f.type}";"${f.category}";"${f.date}";"${f.status}";${f.value}`));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'painel_financeiro.csv';
    a.click();
  };

  return (
    <PageContainer
      title="Painel Financeiro"
      description="Monitoramento avançado de fluxo, MRR, inadimplência e projeção de caixa em tempo real."
      actions={
        <div className="flex gap-2">
          <Button onClick={() => window.print()} className="print:hidden h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Printer className="w-4 h-4 mr-2" />
          </Button>
          <Button onClick={handleExport} className="print:hidden h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#2563EB] hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      }
    >
      <FinanceiroKPIs receita={receita} despesa={despesa} mrr={mrr} inadimplencia={inadimplencia} />
      <FinanceiroCashflowChart chartData={chartData} stabilityScore={stabilityScore} />
      <FinanceiroBottomPanels
        upcomingEntries={upcomingEntries}
        squads={squads}
        financeEntries={financeEntries}
        receita={receita}
        despesa={despesa}
      />
    </PageContainer>
  );
}
