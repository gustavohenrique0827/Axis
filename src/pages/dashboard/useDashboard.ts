import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export function useDashboard() {
  const { leads, contracts, squads } = useData();
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

  return {
    leads,
    contracts,
    squads,
    isModuleEnabled,
    user,
    activeTab,
    setActiveTab,
    comparisonPeriod,
    setComparisonPeriod,
    goalAlerts,
    totalRevenue,
    conversionRate
  };
}
