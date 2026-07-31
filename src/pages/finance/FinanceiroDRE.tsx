import { Card } from "../../components/ui/card";
import { Download, Filter, Percent, DollarSign, Calendar, RefreshCw, BarChart3, Presentation, PiggyBank, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { PageContainer } from "../../components/PageContainer";
import { toast } from "sonner";

export default function FinanceiroDRE() {
  const { financeEntries, contracts } = useData();

  // Load parameter inputs from local storage or defaults
  const [impostoPct, setImpostoPct] = useState(() => {
    return Number(localStorage.getItem("axis_dre_imposto_pct_v2") || "0");
  });
  const [cpvPct, setCpvPct] = useState(() => {
    return Number(localStorage.getItem("axis_dre_cpv_pct_v2") || "0");
  });
  const [despesaPessoal, setDespesaPessoal] = useState(() => {
    return Number(localStorage.getItem("axis_dre_pessoal_v2") || "0");
  });
  const [despesaMarketing, setDespesaMarketing] = useState(() => {
    return Number(localStorage.getItem("axis_dre_marketing_v2") || "0");
  });
  const [despesaAdmin, setDespesaAdmin] = useState(() => {
    return Number(localStorage.getItem("axis_dre_admin_v2") || "0");
  });

  const [period, setPeriod] = useState<"mensal" | "trimestral" | "anual">("mensal");

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("axis_dre_imposto_pct_v2", impostoPct.toString());
    localStorage.setItem("axis_dre_cpv_pct_v2", cpvPct.toString());
    localStorage.setItem("axis_dre_pessoal_v2", despesaPessoal.toString());
    localStorage.setItem("axis_dre_marketing_v2", despesaMarketing.toString());
    localStorage.setItem("axis_dre_admin_v2", despesaAdmin.toString());
  }, [impostoPct, cpvPct, despesaPessoal, despesaMarketing, despesaAdmin]);

  // Aggregate current actuals from the data provider
  const parsedData = useMemo(() => {
    // Current total of paid incoming entries
    const receitaBrutaPaid = financeEntries
      .filter(f => f.type === "Receber" && f.status === "Pago")
      .reduce((sum, f) => sum + f.value, 0);

    // Sum of incoming pending/a vencer entries (for projection calculations)
    const receitaBrutaPending = financeEntries
      .filter(f => f.type === "Receber" && f.status === "A Vencer")
      .reduce((sum, f) => sum + f.value, 0);

    const finalReceitaBruta = receitaBrutaPaid;

    // Apply period scaling factors
    const scaleFactor = period === "mensal" ? 1 : period === "trimestral" ? 3 : 12;
    const scaledReceitaBruta = finalReceitaBruta * scaleFactor;

    // Direct calculated deductions
    const impostos = scaledReceitaBruta * (impostoPct / 100);
    const receitaLiquida = scaledReceitaBruta - impostos;
    const cpv = receitaLiquida * (cpvPct / 100);
    const lucroBruto = receitaLiquida - cpv;

    // Scaled expenses
    const pessoal = despesaPessoal * scaleFactor;
    const marketing = despesaMarketing * scaleFactor;
    const admin = despesaAdmin * scaleFactor;
    const totalDespesasOperacionais = pessoal + marketing + admin;

    const ebitda = lucroBruto - totalDespesasOperacionais;

    return {
      receitaBruta: scaledReceitaBruta,
      impostos,
      receitaLiquida,
      cpv,
      lucroBruto,
      pessoal,
      marketing,
      admin,
      totalDespesasOperacionais,
      ebitda,
    };
  }, [financeEntries, impostoPct, cpvPct, despesaPessoal, despesaMarketing, despesaAdmin, period]);

  const currencyFormat = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(val);
  };

  const dreLines = [
    { name: "Receita Operacional Bruta", value: currencyFormat(parsedData.receitaBruta), isTotal: true },
    { name: `(-) Impostos e Deduções (${impostoPct}%)`, value: `(${currencyFormat(parsedData.impostos)})`, isSub: true, indent: true },
    { name: "Receita Operacional Líquida", value: currencyFormat(parsedData.receitaLiquida), isTotal: true },
    { name: `(-) Custos dos Serviços / CPV (${cpvPct}%)`, value: `(${currencyFormat(parsedData.cpv)})`, isSub: true, indent: true },
    { name: "Lucro Bruto", value: currencyFormat(parsedData.lucroBruto), isTotal: true },
    { name: "(-) Despesas Operacionais", value: `(${currencyFormat(parsedData.totalDespesasOperacionais)})`, isSub: true, indent: true },
    { name: "   - Despesas com Pessoal", value: `(${currencyFormat(parsedData.pessoal)})`, indent: true },
    { name: "   - Despesas de Marketing (SDR/IA/Anúncios)", value: `(${currencyFormat(parsedData.marketing)})`, indent: true },
    { name: "   - Despesas Administrativas Geral", value: `(${currencyFormat(parsedData.admin)})`, indent: true },
    { name: "Lucro Operacional (EBITDA)", value: currencyFormat(parsedData.ebitda), isTotal: true, isEbitda: true },
  ];

  // Dummy monthly projection charts using scaled data
  const chartData = useMemo(() => {
    const factor = period === "mensal" ? 1 : period === "trimestral" ? 3 : 12;
    return [
      { name: "Receita Bruta", Valor: parsedData.receitaBruta, fill: "#2563EB" },
      { name: "Margem CPV", Valor: parsedData.lucroBruto, fill: "#10B981" },
      { name: "EBITDA", Valor: parsedData.ebitda, fill: parsedData.ebitda >= 0 ? "#8B5CF6" : "#EF4444" }
    ];
  }, [parsedData, period]);

  const handleExportXLS = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + ["Linha no DRE;Valor Calculado"].join("\r\n") + "\r\n"
      + dreLines.map(line => `"${line.name.trim()}";"${line.value}"`).join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dre_gerencial_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Demonstrativo exportado com sucesso em formato de planilha (CSV)!");
  };

  const handleResetParameters = () => {
    setImpostoPct(0);
    setCpvPct(0);
    setDespesaPessoal(0);
    setDespesaMarketing(0);
    setDespesaAdmin(0);
    toast.info("Parâmetros do DRE zerados.");
  };

  return (
    <PageContainer
      title="DRE Gerencial Axis"
      description="Demonstrativo de Resultados do Exercício gerado em tempo real com apuração de fluxo de caixa e filtros inteligentes."
      actions={
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1 h-11">
            {[
              { id: "mensal", label: "Mensal" },
              { id: "trimestral", label: "Trimestral" },
              { id: "anual", label: "Anual" }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-4 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                  period === p.id ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExportXLS}
            className="px-5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider h-11 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar DRE
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Dynamic setup and simulation panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border-white/5">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Parâmetros e Simulação do DRE
              </h3>
              <button 
                onClick={handleResetParameters}
                className="text-[10px] uppercase tracking-widest font-black text-slate-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resetar Padrões
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Percent className="w-3 h-3 text-blue-500" /> Impostos / Deduções</span>
                    <span className="font-mono text-white font-black">{impostoPct}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={impostoPct} 
                    onChange={(e) => setImpostoPct(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Percent className="w-3 h-3 text-emerald-500" /> CPV / Provedores</span>
                    <span className="font-mono text-white font-black">{cpvPct}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="60" 
                    value={cpvPct} 
                    onChange={(e) => setCpvPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Folha de Pessoal (R$/Mês)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number"
                      step="1000"
                      value={despesaPessoal}
                      onChange={(e) => setDespesaPessoal(Number(e.target.value))}
                      className="w-full bg-[var(--color-surface-elevated)]/50 border border-white/5 h-11 rounded-xl pl-8 pr-4 text-xs font-black text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Orçamento Marketing (R$/Mês)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number"
                      step="500"
                      value={despesaMarketing}
                      onChange={(e) => setDespesaMarketing(Number(e.target.value))}
                      className="w-full bg-[var(--color-surface-elevated)]/50 border border-white/5 h-11 rounded-xl pl-8 pr-4 text-xs font-black text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Despesa Admin / Infra (R$/Mês)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number"
                      step="500"
                      value={despesaAdmin}
                      onChange={(e) => setDespesaAdmin(Number(e.target.value))}
                      className="w-full bg-[var(--color-surface-elevated)]/50 border border-white/5 h-11 rounded-xl pl-8 pr-4 text-xs font-black text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border-white/5 flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Gráfico de Lucratividade</h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} itemStyle={{ fontSize: "10px", color: "#FFF" }} />
                    <Bar dataKey="Valor" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Margem EBITDA Líquida</p>
                  <h5 className="text-lg font-black text-emerald-400 font-mono">
                    {parsedData.receitaBruta > 0 ? ((parsedData.ebitda / parsedData.receitaBruta) * 100).toFixed(1) : "0"}%
                  </h5>
               </div>
               <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                 <PiggyBank className="w-5 h-5" />
               </div>
            </div>
          </Card>
        </div>

        {/* Dynamic DRE Table display */}
        <Card className="bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border-white/10 p-6 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
             <div>
                <h3 className="text-base font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> Demonstração Consolidada ({period === "mensal" ? "Mês Atual" : period === "trimestral" ? "Trimestre" : "Anual"})
                </h3>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
               Regime de Caixa
             </span>
          </div>
          
          <div className="space-y-1.5">
             {dreLines.map((line, idx) => (
               <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    line.isTotal 
                      ? 'bg-white/5 font-black text-white border border-white/5' 
                      : 'text-slate-400 hover:text-white'
                  } ${line.indent && !line.isTotal ? 'pl-8' : ''} ${line.isEbitda && parsedData.ebitda < 0 ? 'bg-red-500/10 border-red-500/20' : ''}`}
               >
                  <div className={`text-xs font-black uppercase tracking-tight ${line.isSub ? 'text-slate-500 italic' : ''}`}>{line.name}</div>
                  <div className={`font-mono font-black ${line.isTotal ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} ${
                    line.value.includes('(') 
                      ? 'text-rose-400' 
                      : (line.isTotal ? 'text-emerald-400 text-shadow-glow' : 'text-slate-300')
                  }`}>
                     {line.value}
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

