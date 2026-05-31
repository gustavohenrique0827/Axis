import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function useDashboard() {
  const { leads, contracts, squads, leadActivities } = useData();
  const { isModuleEnabled, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'executivo' | 'comercial' | 'sucesso' | 'marketing'>('executivo');
  const [comparisonPeriod, setComparisonPeriod] = useState<'month' | 'year'>('month');

  // Goal Alerts
  const goalAlerts = useMemo(() => {
    return squads.filter(sq => (sq.faturamentoAlcancado / sq.meta) >= 0.9);
  }, [squads]);
  
  // Stats Calculations
  const totalRevenue = useMemo(() => contracts.reduce((acc, curr) => {
    try {
      const val = parseFloat(curr.mrr.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
      return acc + (isNaN(val) ? 0 : val);
    } catch(e) { return acc; }
  }, 0), [contracts]);
  
  const closedWonLeads = leads.filter(l => l.status === 'Fechado').length;
  const conversionRate = leads.length > 0 ? ((closedWonLeads / leads.length) * 100).toFixed(1) : "0";

  // Performance chart: group leads by month of creation (last 7 months)
  const performanceData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth(), name: MONTH_NAMES[d.getMonth()] };
    });

    return months.map(({ year, month, name }) => {
      const monthLeads = leads.filter(l => {
        if (!l.date) return false;
        try {
          const d = new Date(l.date);
          return !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
        } catch { return false; }
      });
      const closedThisMonth = monthLeads.filter(l => l.status === 'Fechado').length;
      const mrrThisMonth = contracts.filter(c => {
        if (!c.date) return false;
        try {
          const d = new Date(c.date.split('/').reverse().join('-'));
          return !isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month;
        } catch { return false; }
      }).reduce((sum, c) => {
        try { return sum + parseFloat(c.mrr.replace('R$ ', '').replace(/\./g, '').replace(',', '.')); }
        catch { return sum; }
      }, 0);

      return {
        name,
        vendas: Math.round(mrrThisMonth),
        leads: monthLeads.length,
        retention: closedThisMonth,
      };
    });
  }, [leads, contracts]);

  // Sales ranking: group closed leads by seller
  const salesRanking = useMemo(() => {
    const bySellerMap: Record<string, { name: string; deals: number; total: number }> = {};
    leads.filter(l => l.status === 'Fechado').forEach(l => {
      const seller = l.seller || 'Sem atribuição';
      if (!bySellerMap[seller]) bySellerMap[seller] = { name: seller, deals: 0, total: 0 };
      bySellerMap[seller].deals += 1;
      try {
        const val = parseFloat((l.value || '0').replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.'));
        bySellerMap[seller].total += isNaN(val) ? 0 : val;
      } catch { /* ignore */ }
    });

    const sorted = Object.values(bySellerMap).sort((a, b) => b.total - a.total);
    const topTotal = sorted[0]?.total || 1;

    return sorted.slice(0, 3).map(s => ({
      name: s.name,
      total: s.total,
      deals: s.deals,
      rate: Math.round((s.deals / Math.max(leads.filter(l => l.seller === s.name).length, 1)) * 100),
    }));
  }, [leads]);

  // Funnel data: count leads per stage
  const funnelData = useMemo(() => {
    const stages = [
      { label: 'Prospecção', statuses: ['Novo', 'Prospecção'], color: 'bg-emerald-500' },
      { label: 'Qualificação', statuses: ['Qualificado', 'IA Analisando', 'Em Nutrição'], color: 'bg-emerald-400' },
      { label: 'Negociação', statuses: ['Em Negociação'], color: 'bg-emerald-300' },
      { label: 'Proposta', statuses: ['Proposta Enviada'], color: 'bg-emerald-200' },
      { label: 'Fechamento', statuses: ['Fechado'], color: 'bg-emerald-100' },
    ];
    const total = leads.length || 1;
    return stages.map((s, i) => {
      const count = leads.filter(l => s.statuses.includes(l.status)).length;
      const prev = i === 0 ? total : leads.filter(l => stages[i-1].statuses.includes(l.status)).length;
      const drop = prev > 0 && i > 0 ? Math.round((1 - count / prev) * 100) : 0;
      return { ...s, value: count, drop };
    });
  }, [leads]);

  // Behavioral activities: last 4 lead activities
  const recentActivities = useMemo(() => {
    return [...leadActivities]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 4);
  }, [leadActivities]);

  return {
    leads,
    contracts,
    squads,
    leadActivities,
    isModuleEnabled,
    user,
    activeTab,
    setActiveTab,
    comparisonPeriod,
    setComparisonPeriod,
    goalAlerts,
    totalRevenue,
    conversionRate,
    performanceData,
    salesRanking,
    funnelData,
    recentActivities,
  };
}
