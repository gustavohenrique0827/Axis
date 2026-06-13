import { useMemo } from 'react';
import { DollarSign, Users, Target, TrendingDown, Sun } from 'lucide-react';

export type DashboardStatsCard = {
  label: string;
  value: string;
  trend: string;
  color: string;
  bg: string;
  icon: React.ComponentType<any>;
  forecast: string;
};

export function DashboardStatsByNiche({
  tenantNiche,
  totalRevenue,
  leadsLength,
  conversionRate,
  churnRate,
}: {
  tenantNiche: string | undefined;
  totalRevenue: number;
  leadsLength: number;
  conversionRate: number;
  churnRate: number;
}) {
  const stats = useMemo<DashboardStatsCard[]>(() => {
    const niche = tenantNiche || 'Master';

    if (niche === 'Tecnologia') {
      return [
        {
          label: 'Hardware & Upgrades',
          value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
          trend: '--',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          icon: DollarSign,
          forecast: '--',
        },
        {
          label: 'Aparelhos Trade-In',
          value: leadsLength.toString(),
          trend: '--',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          icon: Users,
          forecast: '--',
        },
        {
          label: 'Ativação SDR',
          value: `${conversionRate}%`,
          trend: '--',
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          icon: Target,
          forecast: '--',
        },
        {
          label: 'Foco Conversão',
          value: `${churnRate.toFixed(1)}%`,
          trend: '--',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          icon: TrendingDown,
          forecast: '--',
        },
      ];
    }

    if (niche === 'Solar') {
      return [
        {
          label: 'Potência Total',
          value: '--',
          trend: '--',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          icon: Sun,
          forecast: '--',
        },
        {
          label: 'Projetos em Homologação',
          value: leadsLength.toString(),
          trend: '--',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          icon: Users,
          forecast: '--',
        },
        {
          label: 'Viabilidade Concluída',
          value: '--',
          trend: '--',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          icon: Target,
          forecast: '--',
        },
        {
          label: 'ROI Médio Projetos',
          value: '--',
          trend: '--',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          icon: TrendingDown,
          forecast: '--',
        },
      ];
    }

    if (niche === 'Clínica') {
      return [
        {
          label: 'Faturamento Clínico',
          value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
          trend: '--',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          icon: DollarSign,
          forecast: '--',
        },
        {
          label: 'Consultas Agendadas',
          value: leadsLength.toString(),
          trend: '--',
          color: 'text-pink-400',
          bg: 'bg-pink-500/10',
          icon: Users,
          forecast: '--',
        },
        {
          label: 'Teleconsultas Ativas',
          value: '--',
          trend: '--',
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          icon: Target,
          forecast: '--',
        },
        {
          label: 'Taxa Churn Pacientes',
          value: `${churnRate.toFixed(1)}%`,
          trend: '--',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          icon: TrendingDown,
          forecast: '--',
        },
      ];
    }

    if (niche === 'Imobiliária') {
      return [
        {
          label: 'VGV Estimado',
          value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
          trend: '--',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          icon: DollarSign,
          forecast: '--',
        },
        {
          label: 'Visitas Incorporador',
          value: leadsLength.toString(),
          trend: '--',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          icon: Users,
          forecast: '--',
        },
        {
          label: 'Crédito Pré-Aprovado',
          value: `${conversionRate}%`,
          trend: '--',
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          icon: Target,
          forecast: '--',
        },
        {
          label: 'Tempo de Campanha',
          value: '--',
          trend: '--',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          icon: TrendingDown,
          forecast: '--',
        },
      ];
    }

    // Default fallback
    return [
      {
        label: 'Receita (MRR)',
        value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
        trend: '--',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        icon: DollarSign,
        forecast: '--',
      },
      {
        label: 'Leads Ativos',
        value: leadsLength.toString(),
        trend: '--',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        icon: Users,
        forecast: '--',
      },
      {
        label: 'Conversão',
        value: `${conversionRate}%`,
        trend: '--',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        icon: Target,
        forecast: '--',
      },
      {
        label: 'Taxa Churn',
        value: `${churnRate.toFixed(1)}%`,
        trend: '--',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        icon: TrendingDown,
        forecast: '--',
      },
    ];
  }, [tenantNiche, totalRevenue, leadsLength, conversionRate, churnRate]);

  return stats;
}

