import { useMemo } from "react";
import { Users, Brain, DollarSign, Target, Award, Flame, CheckCircle2, TrendingUp, AreaChart, FileText } from "lucide-react";

import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";

import { MiaHero } from "./components/PerformanceDashboard/MiaHero";
import { KpiCards } from "./components/PerformanceDashboard/KpiCards";
import { PerformanceScoreChart, HotLeadsPanel, LeadsVolumeChart } from "./components/PerformanceDashboard/PerformanceCharts";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, Area } from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const { leads, robotStatus } = useData();

  const performanceData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const target = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = target.toLocaleString("pt-BR", { month: "short" });
      const monthLeads = (leads as any[]).filter(l => {
        const d = new Date(l.created_at || l.createdAt || 0);
        return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
      });
      const avgScore = monthLeads.length > 0
        ? Math.round(monthLeads.reduce((s: number, l: any) => s + (l.scoreIA || 0), 0) / monthLeads.length)
        : 0;
      const won = monthLeads.filter((l: any) => l.status === "Fechado").length;
      const conversionRate = monthLeads.length > 0 ? Math.round((won / monthLeads.length) * 100) : 0;
      return { month, avgScore, conversionRate, leads: monthLeads.length };
    });
  }, [leads]);

  const stats = useMemo(() => {
    const all = leads as any[];
    const totalLeads = all.length;
    const avgScore = totalLeads > 0 ? all.reduce((a, l) => a + (l.scoreIA || 0), 0) / totalLeads : 0;
    const totalValue = all.reduce((a, l) => {
      const v = parseFloat((l.value || "").replace(/[^\d]/g, "")) || 0;
      return a + v;
    }, 0);
    const wonLeads = all.filter(l => l.status === "Fechado").length;
    const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    return [
      { label: "Leads Totais",      value: totalLeads,                    icon: Users },
      { label: "Score IA Médio",    value: avgScore.toFixed(1),           icon: Brain },
      { label: "Pipeline Total",    value: `R$ ${(totalValue/1000).toFixed(1)}k`, icon: DollarSign },
      { label: "Taxa de Conversão", value: `${winRate.toFixed(1)}%`,      icon: Award },
    ];
  }, [leads]);

  const hotLeads = useMemo(() =>
    (leads as any[]).filter(l => (l.temperature || "").toLowerCase() === "quente").slice(0, 5),
  [leads]);

  return (
    <PageContainer
      title="Dashboard de Performance"
      description="Análise inteligente da correlação entre pré-qualificação IA e conversão comercial."
    >
      <MiaHero robotStatus={robotStatus || "idle"} leadsCount={(leads as any[]).length} />

      <KpiCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <PerformanceScoreChart performanceData={performanceData} />
        <HotLeadsPanel leads={leads as any[]} hotLeads={hotLeads} />
      </div>

      <LeadsVolumeChart performanceData={performanceData} />

    </PageContainer>
  );
}
