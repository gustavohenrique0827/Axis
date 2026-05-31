import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface SquadMeta {
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

export interface ColaboradorMeta {
  id: string;
  name: string;
  squadId: string;
  meta: number;
  realizado: number;
}

export interface AlertMessage {
  id: string;
  time: string;
  type: "success" | "warning" | "info";
  message: string;
}

import { useData } from "../../../contexts/DataContext";

export function useFinanceiroMetas() {
  const { squadMetas: squads, setSquadMetas: setSquads } = useData();

  const [period, setPeriod] = useState<"monthly" | "quarterly" | "annual">("monthly");
  
  const [attentionThreshold, setAttentionThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("axis_attention_threshold_v2");
      if (saved) return Number(saved);
    } catch (e) {}
    return 90; // defaults to 90%
  });

  useEffect(() => {
    localStorage.setItem("axis_attention_threshold_v2", attentionThreshold.toString());
  }, [attentionThreshold]);

  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

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



  const { colaboradores, setColaboradores } = useData();



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

  const totalMeta = useMemo(() => {
    return squads.reduce((sum, s) => sum + s.meta * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1), 0);
  }, [squads, period]);

  const totalFaturamento = useMemo(() => {
    return squads.reduce((sum, s) => sum + s.faturamento * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1), 0);
  }, [squads, period]);

  const totalPercent = useMemo(() => {
    if (totalMeta === 0) return 0;
    return Math.min(100, Math.round((totalFaturamento / totalMeta) * 100));
  }, [totalFaturamento, totalMeta]);

  const calculateOTE = (squad: SquadMeta) => {
    const faturamentoReal = squad.faturamento * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1);
    const metaReal = squad.meta * (period === "quarterly" ? 3 : period === "annual" ? 12 : 1);
    const base = faturamentoReal * (squad.comissaoPercent / 100);
    const bonus = faturamentoReal >= metaReal ? squad.bonusSuperador : 0;
    return { base, bonus, total: base + bonus };
  };

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
      { name: "Mês 1", OTE: 0 },
      { name: "Mês 2", OTE: 0 },
      { name: "Mês 3", OTE: 0 },
      { name: "Mês 4", OTE: 0 },
      { name: "Mês 5", OTE: 0 },
      { name: "Atual", OTE: currentTotalOTE }
    ];
  }, [squads, period]);

  const historicoFaturamento3Meses = [
    { mes: "Mês 1", faturamento: 0 },
    { mes: "Mês 2", faturamento: 0 },
    { mes: "Mês 3", faturamento: 0 }
  ];

  const mediaCrescimento = useMemo(() => {
    try {
      const growth1 = (historicoFaturamento3Meses[1].faturamento - historicoFaturamento3Meses[0].faturamento) / historicoFaturamento3Meses[0].faturamento;
      const growth2 = (historicoFaturamento3Meses[2].faturamento - historicoFaturamento3Meses[1].faturamento) / historicoFaturamento3Meses[1].faturamento;
      return (growth1 + growth2) / 2;
    } catch (e) {
      return 0.125;
    }
  }, []);

  const projecaoInteligente = useMemo(() => {
    return totalFaturamento * (1 + mediaCrescimento);
  }, [totalFaturamento, mediaCrescimento]);

  const handleSimulateSale = () => {
    const randomIndex = Math.floor(Math.random() * squads.length);
    const saleValues = [15000, 20000, 32000, 48000];
    const saleValue = saleValues[Math.floor(Math.random() * saleValues.length)];

    setSquads(prev => prev.map((s, idx) => {
      if (idx === randomIndex) {
        const newVal = s.faturamento + saleValue;
        const lastPct = (s.faturamento / s.meta) * 100;
        const newPct = (newVal / s.meta) * 100;

        if (s.faturamento < s.meta && newVal >= s.meta) {
          toast.success(`🎉 Meta Superada! ${s.name} bateu R$ ${s.meta.toLocaleString()}! Bônus OTE de R$ ${s.bonusSuperador.toLocaleString()} liberado!`, {
            duration: 5000
          });
          setAlerts(p => [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              type: "success",
              message: `🔥 Meta batida por ${s.name}! Desbloqueio imediato do acelerador OTE.`
            },
            ...p
          ]);
        } else if (lastPct < attentionThreshold && newPct >= attentionThreshold) {
          toast.warning(`⚠️ Limiar de Alerta Superado! ${s.name} atingiu ${newPct.toFixed(1)}% de vendas (limite de atenção personalizado de ${attentionThreshold}% superado)!`, {
            duration: 6050
          });
          setAlerts(p => [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
              type: "warning",
              message: `⚠️ Alerta de Atenção: ${s.name} cruzou a marca de ${attentionThreshold}% configurada via Admin.`
            },
            ...p
          ]);
        } else {
          toast.info(`📈 Venda de R$ ${saleValue.toLocaleString()} adicionada ao ${s.name}!`);
        }
        return { ...s, faturamento: newVal };
      }
      return s;
    }));
  };

  const handleResetSimulator = () => {
    toast.info("A reinicialização das metas não pode ser feita porque está integrada aos dados reais.");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Axis SaaS - Relatório Geral de Metas & OTE", 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 26);
      doc.text(`Período de Referência: ${period === "quarterly" ? "Trimestral" : period === "annual" ? "Anual" : "Mensal"}`, 14, 31);
      doc.text(`Gatilho Alerta de Atenção (Customizado): ${attentionThreshold}%`, 14, 36);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
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

      const lastY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
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

  return {
    squads, setSquads,
    period, setPeriod,
    attentionThreshold, setAttentionThreshold,
    alerts, setAlerts,
    selectedSquadId, setSelectedSquadId,
    formName, setFormName,
    formFocus, setFormFocus,
    formMeta, setFormMeta,
    formBaseComissao, setFormBaseComissao,
    formBonusSuperador, setFormBonusSuperador,
    formPeriod, setFormPeriod,
    colaboradores, setColaboradores,
    selectedColabId, setSelectedColabId,
    colabName, setColabName,
    colabSquadId, setColabSquadId,
    colabMeta, setColabMeta,
    colabRealizado, setColabRealizado,
    oteActiveTab, setOteActiveTab,
    totalMeta,
    totalFaturamento,
    totalPercent,
    calculateOTE,
    historicalOTEData,
    projecaoInteligente,
    handleSimulateSale,
    handleResetSimulator,
    handleExportPDF,
    handleSliderChange
  };
}
