import { useState, useEffect, useMemo } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Target, DollarSign, TrendingUp, Users, Award, 
  Sparkles, AlertTriangle, ShieldCheck, Play, RotateCcw, Plus, Flame, Download
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../components/PageContainer";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  ComposedChart, Line, LineChart
} from 'recharts';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface SquadMeta {
  id: string;
  name: string;
  focus: string;
  meta: number;
  faturamento: number;
  comissaoPercent: number; // base commission
  bonusSuperador: number; // bonus if goal is 100% achieved
  closers: number;
  sdrs: number;
}

interface ColaboradorMeta {
  id: string;
  name: string;
  squadId: string;
  meta: number;
  realizado: number;
}

const initialSquadMetas: SquadMeta[] = [
  { id: "squad-apple", name: "Squad Apple Palmas Elite", focus: "iPhones & Revendedores Premium", meta: 300000, faturamento: 265000, comissaoPercent: 5, bonusSuperador: 3500, closers: 2, sdrs: 2 },
  { id: "squad-gtech", name: "Squad G-Tech Admissões", focus: "Cursos & Matrículas Corporativas", meta: 120000, faturamento: 89000, comissaoPercent: 6, bonusSuperador: 2000, closers: 1, sdrs: 1 },
  { id: "squad-outbound", name: "Squad Outbound Enterprise", focus: "Contratos Médios / Grandes Contas", meta: 150000, faturamento: 45000, comissaoPercent: 8, bonusSuperador: 5000, closers: 1, sdrs: 2 }
];

const initialColaboradores: ColaboradorMeta[] = [
  { id: "colab-1", name: "Carlos Eduardo Mendes", squadId: "squad-apple", meta: 80000, realizado: 65000 },
  { id: "colab-2", name: "Ana Silva", squadId: "squad-gtech", meta: 50000, realizado: 42000 },
  { id: "colab-3", name: "Roberto Ramos", squadId: "squad-outbound", meta: 60000, realizado: 35000 },
  { id: "colab-4", name: "Juliana Costa", squadId: "squad-gtech", meta: 40000, realizado: 32000 },
];

interface AlertMessage {
  id: string;
  time: string;
  type: "success" | "warning" | "info";
  message: string;
}

// CountUp component using motion/react
function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Math.round(latest).toLocaleString("pt-BR")
  );
  
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function FinanceiroMetas() {
  const [squads, setSquads] = useState<SquadMeta[]>(() => {
    try {
      const saved = localStorage.getItem("axis_squad_metas");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialSquadMetas;
  });

  const [period, setPeriod] = useState<"monthly" | "quarterly" | "annual">("monthly");
  
  // Custom attention threshold setup state from localStorage
  const [attentionThreshold, setAttentionThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("axis_attention_threshold");
      if (saved) return Number(saved);
    } catch (e) {}
    return 90; // defaults to 90%
  });

  useEffect(() => {
    localStorage.setItem("axis_attention_threshold", attentionThreshold.toString());
  }, [attentionThreshold]);

  const [alerts, setAlerts] = useState<AlertMessage[]>([
    { id: "1", time: "14:32", type: "info", message: "Squad Palmas está a apenas R$ 35k de atingir a meta OTE superadora!" },
    { id: "2", time: "Ontem", type: "success", message: "G-Tech Admissões registrou faturamento de R$ 12.000 em um único lote faturado." },
    { id: "3", time: "2 dias atrás", type: "warning", message: "Squad Outbound Enterprise apresenta desvio de 32% em relação à curva ideal do mês." }
  ]);

  // Form states for administrators setting custom targets
  const [selectedSquadId, setSelectedSquadId] = useState("squad-apple");
  const [formName, setFormName] = useState("");
  const [formFocus, setFormFocus] = useState("");
  const [formMeta, setFormMeta] = useState(300000);
  const [formBaseComissao, setFormBaseComissao] = useState(5);
  const [formBonusSuperador, setFormBonusSuperador] = useState(3500);
  const [formPeriod, setFormPeriod] = useState<"monthly" | "quarterly">("monthly");

  // Synchronize edit fields when selected squad changes
  useEffect(() => {
    const squad = squads.find(s => s.id === selectedSquadId);
    if (squad) {
      setFormName(squad.name);
      setFormFocus(squad.focus);
      setFormMeta(squad.meta);
      setFormBaseComissao(squad.comissaoPercent);
      setFormBonusSuperador(squad.bonusSuperador);
    }
  }, [selectedSquadId, squads]);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("axis_squad_metas", JSON.stringify(squads));
  }, [squads]);

  // Collaborators goal management state
  const [colaboradores, setColaboradores] = useState<ColaboradorMeta[]>(() => {
    try {
      const saved = localStorage.getItem("axis_colaborador_metas");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialColaboradores;
  });

  // Keep state saved
  useEffect(() => {
    localStorage.setItem("axis_colaborador_metas", JSON.stringify(colaboradores));
  }, [colaboradores]);

  // Form states for individual collaborators
  const [selectedColabId, setSelectedColabId] = useState<string>("new");
  const [colabName, setColabName] = useState<string>("");
  const [colabSquadId, setColabSquadId] = useState<string>("squad-apple");
  const [colabMeta, setColabMeta] = useState<number>(50000);
  const [colabRealizado, setColabRealizado] = useState<number>(25000);

  // Sync collaborator edit form when selected ID changes
  useEffect(() => {
    if (selectedColabId === "new") {
      setColabName("");
      setColabSquadId("squad-apple");
      setColabMeta(50000);
      setColabRealizado(10000);
    } else {
      const colab = colaboradores.find(c => c.id === selectedColabId);
      if (colab) {
        setColabName(colab.name);
        setColabSquadId(colab.squadId);
        setColabMeta(colab.meta);
        setColabRealizado(colab.realizado);
      }
    }
  }, [selectedColabId, colaboradores]);

  // ote Tab toggle configuration
  const [oteActiveTab, setOteActiveTab] = useState<"projection" | "history">("history");

  // Dynamic 6 months historical OTE gains computation
  const historicalOTEData = useMemo(() => {
    const currentTotalOTE = squads.reduce((sum, s) => {
      const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
      const fReal = s.faturamento * mult;
      const mReal = s.meta * mult;
      const base = fReal * (s.comissaoPercent / 100);
      const bonus = fReal >= mReal ? s.bonusSuperador : 0;
      return sum + base + bonus;
    }, 0);
    
    return [
      { name: "Dez", OTE: 125000 },
      { name: "Jan", OTE: 145000 },
      { name: "Fev", OTE: 158000 },
      { name: "Mar", OTE: 182000 },
      { name: "Abr", OTE: 204000 },
      { name: "At", OTE: currentTotalOTE }
    ];
  }, [squads, period]);

  // Formulating stats
  const totalMeta = squads.reduce((sum, s) => sum + s.meta * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1), 0);
  const totalFaturamento = squads.reduce((sum, s) => sum + s.faturamento * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1), 0);
  const totalPercent = Math.min(100, Math.round((totalFaturamento / totalMeta) * 100));

  // Dynamic OTE calculation
  // Base commission = faturamento * comissaoPercent/100
  // If faturamento >= meta, add bonusSuperador
  const calculateOTE = (squad: SquadMeta) => {
    const faturamentoReal = squad.faturamento * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1);
    const metaReal = squad.meta * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1);
    const base = faturamentoReal * (squad.comissaoPercent / 100);
    const bonus = faturamentoReal >= metaReal ? squad.bonusSuperador : 0;
    return { base, bonus, total: base + bonus };
  };

  const salesEvolutionData = [
    { name: "Semana 1", GTech: 20000, Palmas: 60000, Outbound: 10000 },
    { name: "Semana 2", GTech: 45000, Palmas: 120000, Outbound: 25000 },
    { name: "Semana 3", GTech: 68000, Palmas: 195000, Outbound: 32000 },
    { name: "Semana 4 (Proj)", GTech: 89000, Palmas: 265000, Outbound: 45000 },
  ];

  // Histórico de faturamento consolidado dos últimos 3 meses para cálculo de Projeção Inteligente
  const historicoFaturamento3Meses = [
    { mes: "Fevereiro", faturamento: 290000 },
    { mes: "Março", faturamento: 330000 },
    { mes: "Abril", faturamento: 380000 }
  ];

  // Cálculo da média de crescimento de faturamento consolidado dos últimos 3 meses:
  // Crescimento Mês 1 -> Mês 2: (330000 - 290000) / 290000 = 13.79%
  // Crescimento Mês 2 -> Mês 3: (380000 - 330000) / 330000 = 15.15%
  // Média de crescimento: (13.79% + 15.15%) / 2 = 14.47%
  const mediaCrescimento = (() => {
    try {
      const growth1 = (historicoFaturamento3Meses[1].faturamento - historicoFaturamento3Meses[0].faturamento) / historicoFaturamento3Meses[0].faturamento;
      const growth2 = (historicoFaturamento3Meses[2].faturamento - historicoFaturamento3Meses[1].faturamento) / historicoFaturamento3Meses[1].faturamento;
      return (growth1 + growth2) / 2;
    } catch (e) {
      return 0.125; // fallback definition (12.5%)
    }
  })();

  const projecaoInteligente = totalFaturamento * (1 + mediaCrescimento);

  // Simulator Handler: generate random sale
  const handleSimulateSale = () => {
    // Choose random squad
    const randomIndex = Math.floor(Math.random() * squads.length);
    const targetSquad = squads[randomIndex];
    const saleValues = [15000, 20000, 32000, 48000];
    const saleValue = saleValues[Math.floor(Math.random() * saleValues.length)];

    const updatedSquads = squads.map((s, idx) => {
      if (idx === randomIndex) {
        const newVal = s.faturamento + saleValue;
        const lastPct = (s.faturamento / s.meta) * 100;
        const newPct = (newVal / s.meta) * 100;

        // Check alerts based on customizable attentionThreshold limit
        if (s.faturamento < s.meta && newVal >= s.meta) {
          toast.success(`🎉 Meta Superada! ${s.name} bateu R$ ${s.meta.toLocaleString()}! Bônus OTE de R$ ${s.bonusSuperador.toLocaleString()} liberado!`, {
            duration: 5000
          });
          setAlerts(prev => [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              type: "success",
              message: `🔥 Meta batida por ${s.name}! Desbloqueio imediato do acelerador OTE.`
            },
            ...prev
          ]);
        } else if (lastPct < attentionThreshold && newPct >= attentionThreshold) {
          toast.warning(`⚠️ Limiar de Alerta Superado! ${s.name} atingiu ${newPct.toFixed(1)}% de vendas (limite de atenção personalizado de ${attentionThreshold}% superado)!`, {
            duration: 6000
          });
          setAlerts(prev => [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              type: "warning",
              message: `⚠️ Alerta de Atenção: ${s.name} cruzou a marca regulamentar de ${attentionThreshold}% configurada via Admin.`
            },
            ...prev
          ]);
        } else {
          toast.info(`📈 Venda de R$ ${saleValue.toLocaleString()} adicionada ao ${s.name}!`);
        }
        return { ...s, faturamento: newVal };
      }
      return s;
    });

    setSquads(updatedSquads);
  };

  // Reset Simulator
  const handleResetSimulator = () => {
    setSquads(initialSquadMetas);
    toast.success("Valores originais de metas restaurados!");
  };

  // Export Executive PDF Report function using jspdf and jspdf-autotable
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Top header band with pristine branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("Axis SaaS - Relatório Geral de Metas & OTE", 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 26);
      doc.text(`Período de Referência: ${period === "quarterly" ? "Trimestral" : period === "annual" ? "Anual" : "Mensal"}`, 14, 31);
      doc.text(`Gatilho Alerta de Atenção (Customizado): ${attentionThreshold}%`, 14, 36);

      // Section 1: Balanço Geral Consolidado
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text("1. Balanço Geral Consolidado", 14, 46);

      const diff = totalFaturamento - totalMeta;
      const progressPct = ((totalFaturamento / totalMeta) * 100).toFixed(1);

      const summaryHeaders = [["Indicador Comercial", "Valor Consolidado"]];
      const summaryRows = [
        ["Meta Total Projetada", `R$ ${totalMeta.toLocaleString("pt-BR")}`],
        ["Faturamento Total Alcançado", `R$ ${totalFaturamento.toLocaleString("pt-BR")}`],
        ["Percentual de Atingimento Global", `${progressPct}%`],
        ["Diferença Líquida contra o Teto", `${diff >= 0 ? "+" : "-"} R$ ${Math.abs(diff).toLocaleString("pt-BR")}`],
        ["Comissão + OTE Extra Provisionado", `R$ ${squads.reduce((sum, s) => sum + calculateOTE(s).total, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
      ];

      (doc as any).autoTable({
        startY: 50,
        head: summaryHeaders,
        body: summaryRows,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
      });

      // Section 2: Desempenho dos Squads
      const currentY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("2. Desempenho por Squad & Semáforos", 14, currentY);

      const squadHeaders = [["Nome do Squad", "Atuação", "Meta", "Faturado Real", "Progresso (%)", "Semáforo Status", "OTE Extra"]];
      
      const squadRows = squads.map(s => {
        const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
        const metaReal = s.meta * mult;
        const fatReal = s.faturamento * mult;
        const pct = (fatReal / metaReal) * 100;
        
        let statusSemaphor = "Abaixo de 90% (Vermelho)";
        if (pct >= 100) statusSemaphor = "Acima de 100% (Verde)";
        else if (pct >= attentionThreshold) statusSemaphor = `${Math.round(attentionThreshold)}-99% (Amarelo)`;

        const ote = calculateOTE(s);
        
        return [
          s.name,
          s.focus,
          `R$ ${metaReal.toLocaleString("pt-BR")}`,
          `R$ ${fatReal.toLocaleString("pt-BR")}`,
          `${pct.toFixed(1)}%`,
          statusSemaphor,
          `R$ ${ote.total.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
        ];
      });

      (doc as any).autoTable({
        startY: currentY + 4,
        head: squadHeaders,
        body: squadRows,
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 42 },
          1: { cellWidth: 32 },
          2: { cellWidth: 26 },
          3: { cellWidth: 26 },
          4: { cellWidth: 16 },
          5: { cellWidth: 28 },
          6: { cellWidth: 22 }
        }
      });

      // Simple footer notice on page
      const lastY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Este documento foi consolidado eletronicamente e auditado em conformidade com as regras de OTE do Axis SaaS.", 14, lastY);
      doc.text("Confidencial comercial - restrito a administradores e diretores regionais.", 14, lastY + 5);

      doc.save(`Axis_SaaS_Relatorio_Metas_${period}.pdf`);
      toast.success("Executive PDF report exported successfully!");
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast.error("Ocorreu um erro ao exportar o relatório de metas em PDF.");
    }
  };

  const handleSliderChange = (squadId: string, value: number) => {
    setSquads(prev => prev.map(s => s.id === squadId ? { ...s, faturamento: value } : s));
  };

  return (
    <PageContainer
      title="Campanhas de Metas & Comissionamento"
      description="Gerenciamento visual de targets corporativos, aceleradores OTE e distribuição de prêmios por Squad."
      actions={
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex bg-[#0A1120] border border-white/10 rounded-xl p-1 shrink-0">
            {(["monthly", "quarterly", "annual"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  period === p 
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/10" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "monthly" ? "Mensal" : p === "quarterly" ? "Trimestral" : "Anual"}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleSimulateSale}
            className="bg-emerald-600 hover:bg-emerald-550 text-white font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
          >
            <Play className="w-4 h-4 text-emerald-300 animate-pulse" /> Simular Venda
          </Button>

          <Button 
            variant="outline"
            onClick={handleResetSimulator}
            className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-11 px-4 rounded-xl text-[10px] uppercase font-bold tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button 
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-550 text-white font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10"
          >
            <Download className="w-3.5 h-3.5 text-blue-300" /> Exportar Relatório de Metas
          </Button>
        </div>
      }
    >
      {/* Balanço Geral */}
      <div className="mb-8 p-6 bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Balanço Geral & Comunicações Ativas
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
              Auditoria consolidada de conversão sdr/closer e diferencial líquido
            </p>
          </div>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8.5px] font-mono uppercase tracking-widest px-3 py-1 rounded-xl">
            Sincronizado via API
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mensagens sent rate */}
          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Flame className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Volume de Mensagens (WhatsApp)</span>
              <span className="text-lg font-mono font-black text-white block mt-0.5">
                {(4150 + Math.round((totalFaturamento - 399000)/120)).toLocaleString("pt-BR")} msgs
              </span>
              <span className="text-[9.5px] text-purple-400 font-bold block">Taxa de Resposta: 94.2%</span>
            </div>
          </div>

          {/* Ligações dials */}
          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5 text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total de Ligações Registradas</span>
              <span className="text-lg font-mono font-black text-white block mt-0.5">
                {(1420 + Math.round((totalFaturamento - 399000)/350)).toLocaleString("pt-BR")} dials
              </span>
              <span className="text-[9.5px] text-blue-400 font-bold block">Conexão Eficiente: 82%</span>
            </div>
          </div>

          {/* Diferença Líquida contra o teto da meta geral */}
          {(() => {
            const diff = totalFaturamento - totalMeta;
            const isPositive = diff >= 0;
            return (
              <div className={`p-4 rounded-2xl border transition-colors flex items-center gap-4 ${
                isPositive 
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30" 
                  : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/30"
              }`}>
                <div className={`p-3 rounded-xl ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  <TrendingUp className={`w-5 h-5 ${isPositive ? "" : "transform rotate-180"}`} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-sans">Diferença Líquida (Meta)</span>
                  <span className={`text-lg font-mono font-black block mt-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : "-"} R$ {Math.abs(diff).toLocaleString("pt-BR")}
                  </span>
                  <span className="text-[9.5px] text-slate-400 block font-medium">
                    {isPositive ? "Excedente de Meta Obtido" : "Déficit Restante do Teto"}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total revenue meta */}
        <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 uppercase tracking-widest">
              Geral {period === "monthly" ? "Mês" : period === "quarterly" ? "Trimestre" : "Ano"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Faturamento Realizado</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                R$ {totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                de R$ {totalMeta.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </span>
            </div>
            {/* Visual Gauge */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Progresso consolidado</span>
                <span className="font-extrabold text-blue-400">{totalPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalPercent}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Provisioned commission and OTE payout based on calculations */}
        <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">
              Provisionado
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Comissão + OTE Extra</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                R$ {squads.reduce((sum, s) => sum + calculateOTE(s).total, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] border-t border-white/5 pt-3 text-slate-400">
              <span>Bônus superador ativo:</span>
              <span className="font-bold text-emerald-400">
                R$ {squads.reduce((sum, s) => sum + calculateOTE(s).bonus, 0).toLocaleString("pt-BR")}
              </span>
            </div>
            
            {/* Tab Swapper Header Inside Card */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Visualização OTE</span>
              <div className="flex gap-1.5 font-mono">
                <button 
                  onClick={() => setOteActiveTab("history")} 
                  className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                    oteActiveTab === "history" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Histórico 6M
                </button>
                <button 
                  onClick={() => setOteActiveTab("projection")} 
                  className={`text-[8.5px] font-bold px-2 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                    oteActiveTab === "projection" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Projeção 3M
                </button>
              </div>
            </div>

            {/* Smooth animated comparative mini charts */}
            <motion.div 
              key={oteActiveTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              {oteActiveTab === "history" ? (
                <div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>Performance (Últimos 6 meses)</span>
                    <span className="text-emerald-400 font-mono">Histórico OTE</span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalOTEData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={8} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                          itemStyle={{ fontSize: "10px", color: "#10b981" }}
                        />
                        <Line type="monotone" dataKey="OTE" stroke="#10b981" strokeWidth={2} name="Ganhos OTE" dot={{ r: 3, stroke: "#111827", strokeWidth: 1 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    <span>Faturado vs Meta 3M</span>
                    <span className="text-emerald-400 font-mono">OTE Proj</span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={[
                          {
                            name: "Progresso",
                            "Faturamento": totalFaturamento,
                            "Meta Projetada 3M": squads.reduce((sum, s) => sum + s.meta * 3, 0),
                            "Projeção Inteligente": projecaoInteligente
                          }
                        ]}
                        margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={8} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                          itemStyle={{ fontSize: "10px" }}
                        />
                        <Bar dataKey="Faturamento" fill="#10b981" radius={[4, 4, 0, 0]} name="Atual" />
                        <Bar dataKey="Meta Projetada 3M" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Trimester 90d" />
                        <Line type="monotone" dataKey="Projeção Inteligente" stroke="#fbbf24" strokeWidth={2} name="Proj Inteligente" dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </Card>

        {/* Active alert indicator status card */}
        <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/15 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 uppercase tracking-widest">
              Consistência
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Squads na Meta</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                {squads.filter(s => {
                  const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
                  return s.faturamento >= s.meta * mult;
                }).length} de {squads.length}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">Surtindo Efeito</span>
            </div>
            <div className="mt-4 text-[10px] border-t border-white/5 pt-3 flex items-center gap-2 text-slate-400 leading-tight">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Aceleração SDR base Palma ativa.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Panel grid: Left columns detail squad metrics, Right details charts and simulators */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        
        {/* Squad Goals config & real-time tracking list */}
        <Card className="xl:col-span-2 p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Status & Alocação de Squads</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Definição, ajuste de progresso e comissão do time</p>
              </div>
              <span className="bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-xl">
                Ajuste os Sliders para simular faturamentos
              </span>
            </div>

            <div className="space-y-6">
              {squads.map((squad) => {
                const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
                const metaReal = squad.meta * mult;
                const faturamentoReal = squad.faturamento * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1);
                
                const pct = Math.min(100, Math.round((faturamentoReal / metaReal) * 100));
                const ote = calculateOTE(squad);

                return (
                  <div key={squad.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    {/* Top title and team distribution */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{squad.name}</span>
                          {faturamentoReal >= metaReal && (
                            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider animate-bounce">
                              <Sparkles className="w-2.5 h-2.5" /> Meta Batida
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">Foco Comercial: {squad.focus}</span>
                      </div>
                      
                      {/* Technical team allocation */}
                      <div className="flex gap-2 text-[9px] text-slate-500 font-bold font-mono">
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                          💼 Closers: {squad.closers}
                        </span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                          🎙️ SDRs: {squad.sdrs}
                        </span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      
                      {/* Slide slider wrapper */}
                      <div className="md:col-span-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Progresso faturado</span>
                          <span>{pct}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max={metaReal * 1.5}
                          step={metaReal / 100}
                          value={faturamentoReal}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const originalScale = val / mult;
                            handleSliderChange(squad.id, originalScale);
                          }}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#2563EB] focus:outline-none"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold pt-1">
                          <span>R$ 0</span>
                          <span>Meta: R$ {metaReal.toLocaleString("pt-BR")}</span>
                          <span>Max: R$ {(metaReal * 1.5).toLocaleString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Financial info summary */}
                      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Realizado</span>
                        <span className="text-xs font-mono font-extrabold text-white block mt-0.5">
                          R$ <CountUp value={faturamentoReal} />
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          Faltando R$ {Math.max(0, metaReal - faturamentoReal).toLocaleString()}
                        </span>
                      </div>

                      {/* Calculated OTE distribution */}
                      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                        <span className="text-[9px] text-[#2563EB] font-bold uppercase tracking-wider block">Comissão + Bônus</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-400 block mt-0.5">
                          R$ {ote.total.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">
                          Base {squad.comissaoPercent}% • Ext {ote.bonus > 0 ? "R$ " + ote.bonus.toLocaleString() : "Bloqueado"}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Garantia do Acordo de Nível de Serviço (SLA) SDR ➔ Closer estabelecido por comissões escaláveis por aceitabilidade.
            </span>
            <span className="text-blue-400 font-black font-mono">Axis SaaS OTE Engine v1.4</span>
          </div>
        </Card>

        {/* Right section: Charts, calculations, and alarms */}
        <div className="space-y-6">
          
          {/* Dynamic Distribution Chart */}
          <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Evolução do Faturamento Semanal</h4>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Divisão proporcional por Squad ativo</span>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesEvolutionData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                    labelStyle={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "10px" }}
                  />
                  <Bar dataKey="Palmas" fill="#3b82f6" stackId="a" name="Palmas Apple" />
                  <Bar dataKey="GTech" fill="#10b981" stackId="a" name="G-Tech" />
                  <Bar dataKey="Outbound" fill="#6366f1" stackId="a" name="Outbound" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Formulário de Configuração - Área do Administrador */}
          <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configuração de Metas (Admin)</h4>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Ajustar faturamento OTE e períodos das equipes</span>

            <form onSubmit={(e) => {
              e.preventDefault();
              setSquads(prev => prev.map(s => {
                if (s.id === selectedSquadId) {
                  return {
                    ...s,
                    name: formName,
                    focus: formFocus,
                    meta: formMeta,
                    comissaoPercent: formBaseComissao,
                    bonusSuperador: formBonusSuperador
                  };
                }
                return s;
              }));
              toast.success(`Configurações de metas salvas para o ${formName}!`);
            }} className="space-y-4">
              
              {/* Seleção do Squad */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Selecione o Squad</label>
                <select 
                  value={selectedSquadId}
                  onChange={(e) => setSelectedSquadId(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {squads.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Nome do Squad */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Squad</label>
                <input 
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Foco Comercial */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Foco Comercial</label>
                <input 
                  type="text"
                  value={formFocus}
                  onChange={(e) => setFormFocus(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Meta Base & Período (Mensal / Trimestral) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Meta Alvo (R$)</label>
                  <input 
                    type="number"
                    value={formMeta}
                    onChange={(e) => setFormMeta(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Período Alvo</label>
                  <select 
                    value={formPeriod}
                    onChange={(e) => {
                      const selectedPeriod = e.target.value as "monthly" | "quarterly";
                      setFormPeriod(selectedPeriod);
                      setPeriod(selectedPeriod === "monthly" ? "monthly" : "quarterly");
                    }}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral</option>
                  </select>
                </div>
              </div>

              {/* OTE - Comissão Base & Bônus */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Comissão Base (%)</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    max="25"
                    value={formBaseComissao}
                    onChange={(e) => setFormBaseComissao(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Bônus OTE (R$)</label>
                  <input 
                    type="number"
                    value={formBonusSuperador}
                    onChange={(e) => setFormBonusSuperador(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Gatilho Alerta de Atenção (%) */}
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Gatilho Alerta de Atenção (%)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="50"
                    max="150"
                    value={attentionThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAttentionThreshold(val);
                    }}
                    className="flex-1 bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="text-xs text-slate-500 font-bold font-mono">%</span>
                </div>
                <span className="text-[8px] text-slate-500 block">Define o percentual para as notificações toast e relatórios executivos.</span>
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl transition-all shadow-md shadow-blue-500/10"
                >
                  Salvar Meta
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newId = `squad-custom-${Date.now()}`;
                    const newSquad: SquadMeta = {
                      id: newId,
                      name: `Novo Squad ${squads.length + 1}`,
                      focus: "Novos leads & Contas Médias",
                      meta: 150000,
                      faturamento: 0,
                      comissaoPercent: 5,
                      bonusSuperador: 2500,
                      closers: 1,
                      sdrs: 1
                    };
                    setSquads(prev => [...prev, newSquad]);
                    setSelectedSquadId(newId);
                    toast.success("Novo squad comercial provisionado com sucesso!");
                  }}
                  className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-10 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider"
                >
                  + Novo
                </Button>
              </div>
            </form>
          </Card>

          {/* Alert and Warning center feeds */}
          <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Alertas & Gatilhos</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex gap-2 w-full text-left">
                  {alert.type === "success" ? (
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : alert.type === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                    <span className="text-[8px] font-bold text-slate-600 block mt-1 font-mono uppercase">
                      {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              className="w-full mt-4 border border-dashed border-white/10 hover:border-white/20 bg-transparent text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider"
              onClick={() => {
                setAlerts([
                  {
                    id: Date.now().toString(),
                    time: "Agora",
                    type: "info",
                    message: "Log de alertas atualizado de acordo com o funil comercial."
                  },
                  ...alerts
                ]);
                toast.success("Logs recarregados em tempo de execução!");
              }}
            >
              Recarregar Alertas
            </Button>
          </Card>

        </div>
      </div>

      {/* SEÇÃO EXTRA DE COLABORADORES INDIVIDUAIS */}
      <div className="mt-8">
        <div className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500 animate-pulse" />
            Metas de Colaboradores Individuais
          </h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
            Acompanhamento individual dos vendedores corporativos comparado com a performance do seu squad correspondente
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Listagem de Colaboradores com progresso individual e side-by-side de squad */}
          <Card className="xl:col-span-2 p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-tight">Vendedores Cadastrados & Desempenho</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Visão unificada: progresso pessoal vs. progresso geral do squad</p>
                </div>
              </div>

              <div className="space-y-4">
                {colaboradores.map(colab => {
                  const mySquad = squads.find(s => s.id === colab.squadId) || squads[0];
                  
                  // Compute collaborator progress percent
                  const colabPct = colab.meta > 0 ? Math.min(100, Math.round((colab.realizado / colab.meta) * 100)) : 0;
                  
                  // Compute squad progress percent
                  const mult = period === "quarterly" ? 3 : period === "annual" ? 12 : 1;
                  const squadMetaReal = mySquad.meta * mult;
                  const squadFaturamentoReal = mySquad.faturamento * mult;
                  const squadPct = squadMetaReal > 0 ? Math.min(100, Math.round((squadFaturamentoReal / squadMetaReal) * 100)) : 0;

                  return (
                    <div key={colab.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                            {colab.name.charAt(0)}
                          </span>
                          <div>
                            <span className="text-xs font-black text-white uppercase tracking-tight block leading-none">{colab.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">{mySquad?.name || "Sem Squad"}</span>
                          </div>
                        </div>

                        {/* Dual Progress sliders or indicators */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {/* Progress Collaborator */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                              <span>Progresso Pessoal</span>
                              <span className="font-bold text-blue-400">{colabPct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${colabPct}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                              <span>Realizado: R$ {colab.realizado.toLocaleString("pt-BR")}</span>
                              <span>Meta: R$ {colab.meta.toLocaleString("pt-BR")}</span>
                            </div>
                          </div>

                          {/* Progress Squad side-by-side */}
                          <div className="space-y-1">
                            <div className="text-[9px] font-mono text-slate-400 flex justify-between items-center">
                              <span>Progresso Completo do Squad</span>
                              <span className="font-bold text-emerald-400">{squadPct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${squadPct}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                              <span>Squad Faturado: R$ {squadFaturamentoReal.toLocaleString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right button/actions */}
                      <div className="flex flex-row md:flex-col items-end gap-2 shrink-0 justify-end pt-2 md:pt-0">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setSelectedColabId(colab.id);
                            toast.info(`Editando metas para o colaborador ${colab.name}`);
                          }}
                          className="h-8 px-3 rounded-lg border border-white/5 text-slate-300 hover:text-white bg-white/5 uppercase text-[9px] tracking-wider font-extrabold cursor-pointer"
                        >
                          Editar Meta
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setColaboradores(prev => prev.filter(c => c.id !== colab.id));
                            toast.error(`Colaborador ${colab.name} removido!`);
                          }}
                          className="h-8 px-3 rounded-lg border border-rose-500/10 text-rose-400 hover:bg-rose-500/10 uppercase text-[9px] tracking-wider font-bold cursor-pointer"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-mono text-right font-bold uppercase tracking-widest">
              Totalizadores individuais vinculados aos canais de comissionamento ativos.
            </div>
          </Card>

          {/* Form de Configuração do Colaborador (Admin) */}
          <Card className="p-5 border-white/5 bg-[#111827]/80 backdrop-blur-xl shrink-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Metas de Colaborador (Form)
            </h4>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">Cadastrar ou atualizar metas comerciais individuais</span>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!colabName.trim()) {
                toast.error("Por favor, preencha o nome do colaborador!");
                return;
              }

              if (selectedColabId === "new") {
                const newColabObj: ColaboradorMeta = {
                  id: `colab-custom-${Date.now()}`,
                  name: colabName,
                  squadId: colabSquadId,
                  meta: colabMeta,
                  realizado: colabRealizado
                };
                setColaboradores(prev => [...prev, newColabObj]);
                toast.success(`Colaborador ${colabName} cadastrado com sucesso!`);
                setColabName("");
                setColabMeta(50000);
                setColabRealizado(10000);
              } else {
                setColaboradores(prev => prev.map(c => {
                  if (c.id === selectedColabId) {
                    return {
                      ...c,
                      name: colabName,
                      squadId: colabSquadId,
                      meta: colabMeta,
                      realizado: colabRealizado
                    };
                  }
                  return c;
                }));
                toast.success(`Metas de ${colabName} atualizadas com sucesso!`);
              }
              setSelectedColabId("new");
            }} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ficha do Colaborador</label>
                <select 
                  value={selectedColabId}
                  onChange={(e) => setSelectedColabId(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="new">+ Cadastrar Novo Colaborador</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>Editar: {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Vendedor</label>
                <input 
                  type="text"
                  placeholder="Ex: Carlos Eduardo..."
                  value={colabName}
                  onChange={(e) => setColabName(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Squad Associado</label>
                <select 
                  value={colabSquadId}
                  onChange={(e) => setColabSquadId(e.target.value)}
                  className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {squads.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 flex-wrap">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Meta Alvo (R$)</label>
                  <input 
                    type="number"
                    value={colabMeta}
                    onChange={(e) => setColabMeta(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Realizado (R$)</label>
                  <input 
                    type="number"
                    value={colabRealizado}
                    onChange={(e) => setColabRealizado(Number(e.target.value))}
                    className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-3 py-2 text-xs font-medium font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {selectedColabId === "new" ? "Cadastrar Meta" : "Salvar Alterações"}
                </Button>
                {selectedColabId !== "new" && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedColabId("new")}
                    className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-10 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                  >
                    Novo
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
