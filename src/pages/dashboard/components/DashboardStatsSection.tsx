import { QuickStatsGrid } from './QuickStatsGrid';
import { DashboardStatsByNiche } from './DashboardStatsByNiche';

export function DashboardStatsSection({
  tenantNiche,
  totalRevenue,
  leadsLength,
  conversionRate,
  churnRate,
}: {
  tenantNiche: string | undefined;
  totalRevenue: number;
  leadsLength: number;
  conversionRate: number | string;
  churnRate: number;
}) {
  const stats = DashboardStatsByNiche({
    tenantNiche,
    totalRevenue,
    leadsLength,
    conversionRate: typeof conversionRate === "string" ? parseFloat(conversionRate) : conversionRate,
    churnRate,
  });

  return <QuickStatsGrid stats={stats} />;
}

