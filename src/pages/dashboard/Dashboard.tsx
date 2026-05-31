import { useMemo } from 'react';
import {
  DollarSign, Users, Target, TrendingDown, Sun
} from 'lucide-react';
import { PageContainer } from "../../components/PageContainer";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Gauge, Zap, Megaphone, HeartHandshake } from "lucide-react";

import { useDashboard } from "./useDashboard";
import { QuickStatsGrid } from "./components/QuickStatsGrid";
import { StrategicalView } from "./components/StrategicalView";
import { CommercialView } from "./components/CommercialView";
import { MarketingView } from "./components/MarketingView";
import { CustomerSuccessView } from "./components/CustomerSuccessView";

export default function Dashboard() {
  const {
    leads,
    activeTab,
    setActiveTab,
    comparisonPeriod,
    setComparisonPeriod,
    goalAlerts,
    totalRevenue,
    conversionRate,
    squads,
    contracts,
    user,
    performanceData,
    salesRanking,
    funnelData,
    recentActivities,
  } = useDashboard();

  // Niche based Stats Calculations
  const stats = useMemo(() => {
    const niche = user?.tenantNiche || "Master";

    if (niche === "Tecnologia") {
      return [
        { label: "Hardware & Upgrades", value: "R$ 78.400", trend: "+15.2%", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: DollarSign, forecast: "R$ 90.0k" },
        { label: "Aparelhos Trade-In", value: "48 Unid.", trend: "+12.1%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Users, forecast: "60" },
        { label: "Ativação SDR", value: "91.5%", trend: "+3.2%", color: "text-purple-400", bg: "bg-purple-500/10", icon: Target, forecast: "94.0%" },
        { label: "Foco Conversão", value: "85.8%", trend: "-1.5%", color: "text-rose-400", bg: "bg-rose-500/10", icon: TrendingDown, forecast: "88.0%" },
      ];
    } else if (niche === "Solar") {
      return [
        { label: "Potência Total", value: "180 kWp", trend: "+24.5%", color: "text-amber-400", bg: "bg-amber-500/10", icon: Sun, forecast: "240 kWp" },
        { label: "Projetos em Homologação", value: "5 Ativos", trend: "+15.2%", color: "text-amber-500", bg: "bg-amber-500/10", icon: Users, forecast: "8" },
        { label: "Viabilidade Concluída", value: "11 Estudos", trend: "+8.9%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Target, forecast: "15" },
        { label: "ROI Médio Projetos", value: "3.2 Anos", trend: "-0.8%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "2.8 Anos" },
      ];
    } else if (niche === "Clínica") {
      return [
        { label: "Faturamento Clínico", value: "R$ 34.800", trend: "+10.4%", color: "text-rose-400", bg: "bg-rose-500/10", icon: DollarSign, forecast: "R$ 45.0k" },
        { label: "Consultas Agendadas", value: "14 Sessões", trend: "+18.2%", color: "text-pink-400", bg: "bg-pink-500/10", icon: Users, forecast: "20" },
        { label: "Tele consultas Ativas", value: "3 Salas", trend: "+50.0%", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Target, forecast: "5 Salas" },
        { label: "Taxa Churn Pacientes", value: "1.8%", trend: "-0.5%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "1.2%" },
      ];
    } else if (niche === "Imobiliária") {
      return [
        { label: "VGV Estimado", value: "R$ 7.8M", trend: "+30.1%", color: "text-blue-500", bg: "bg-blue-500/10", icon: DollarSign, forecast: "R$ 10.0M" },
        { label: "Visitas Incorporador", value: "6 Visitas", trend: "+12.0%", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: Users, forecast: "10" },
        { label: "Crédito Pré-Aprovado", value: "88.2%", trend: "+5.1%", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: Target, forecast: "92%" },
        { label: "Tempo de Campanha", value: "14 Dias", trend: "-4.2%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: TrendingDown, forecast: "10 Dias" },
      ];
    }

    // Default fallback
    return [
      { label: "Receita (MRR)", value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, trend: "+12.5%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: DollarSign, forecast: "R$ 6.8k" },
      { label: "Leads Ativos", value: leads.length.toString(), trend: "+5.2%", color: "text-blue-400", bg: "bg-blue-500/10", icon: Users, forecast: "12" },
      { label: "Conversão", value: `${conversionRate}%`, trend: "+2.4%", color: "text-purple-400", bg: "bg-purple-500/10", icon: Target, forecast: "24.5%" },
      { label: "Churn Rate", value: "3.2%", trend: "-0.4%", color: "text-rose-400", bg: "bg-rose-500/10", icon: TrendingDown, forecast: "2.9%" },
    ];
  }, [user, totalRevenue, leads, conversionRate]);


  return (
    <PageContainer
      title="Inteligência Axis"
      description="Painel de comando estratégico para decisões baseadas em dados."
      actions={
        <div className="flex bg-[#111827]/80 border border-white/5 rounded-2xl p-1 w-fit gap-1 shadow-2xl backdrop-blur-xl">
          {[
            { id: 'executivo', label: 'Estratégico', icon: Gauge },
            { id: 'comercial', label: 'Comercial', icon: Zap },
            { id: 'marketing', label: 'Marketing', icon: Megaphone },
            { id: 'sucesso', label: 'Retenção', icon: HeartHandshake }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-white'
                }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Goal Alerts Banner */}
        <AnimatePresence>
          {goalAlerts.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden text-left"
            >
              <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Performace de Elite Detectada</h4>
                    <p className="text-xs text-emerald-400/80 font-medium">
                      {goalAlerts.map(sq => `${sq.nome}`).join(", ")} {goalAlerts.length > 1 ? 'atingiram' : 'atingiu'} 90%+ da meta mensal!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    Meta Próxima
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Grid */}
        <QuickStatsGrid stats={stats} />

        <AnimatePresence mode="wait">
          {activeTab === 'executivo' && (
            <StrategicalView
              comparisonPeriod={comparisonPeriod}
              setComparisonPeriod={setComparisonPeriod}
              performanceData={performanceData}
              squads={squads}
              contracts={contracts}
            />
          )}

          {activeTab === 'comercial' && (
            <CommercialView salesRanking={salesRanking} funnelData={funnelData} recentActivities={recentActivities} />
          )}

          {activeTab === 'marketing' && (
            <MarketingView />
          )}

          {activeTab === 'sucesso' && (
            <CustomerSuccessView />
          )}
        </AnimatePresence>

      </div>
    </PageContainer>
  );
}
