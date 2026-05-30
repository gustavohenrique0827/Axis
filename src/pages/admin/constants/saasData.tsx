import React from "react";

export const revenueData = [
  { name: 'Jan', mrr: 800000 },
  { name: 'Fev', mrr: 950000 },
  { name: 'Mar', mrr: 1050000 },
  { name: 'Abr', mrr: 1100000 },
  { name: 'Mai', mrr: 1200000 },
  { name: 'Jun', mrr: 1250000 },
];

export const planDistribution = [
  { name: 'Standard', value: 250 },
  { name: 'Pro', value: 180 },
  { name: 'Enterprise', value: 112 },
];

export const COLORS = ['#94A3B8', '#06B6D4', '#2563EB'];

export const tenantsData = [
    { id: 't-105', name: "TechCorp Brasil", plan: "Enterprise", status: "Healthy", dbSize: "450 MB", mrr: "R$ 4.500", users: 150, lastSync: "há 2 min" },
    { id: 't-106', name: "Solar Solutions", plan: "Pro", status: "Healthy", dbSize: "120 MB", mrr: "R$ 1.200", users: 45, lastSync: "há 14 min" },
    { id: 't-107', name: "Clínica Vida", plan: "Express", status: "Warning", dbSize: "2.1 GB", mrr: "R$ 800", users: 12, lastSync: "há 1h" },
    { id: 't-108', name: "Construtora RS", plan: "Standard", status: "Healthy", dbSize: "85 MB", mrr: "R$ 400", users: 5, lastSync: "há 24 min" },
    { id: 't-109', name: "Mendes Consultoria", plan: "Standard", status: "Healthy", dbSize: "12 MB", mrr: "R$ 400", users: 3, lastSync: "há 5 min" },
    { id: 't-110', name: "AgroTech Sul", plan: "Enterprise", status: "Suspended", dbSize: "890 MB", mrr: "R$ 0", users: 0, lastSync: "há 2 dias" },
    { id: 't-111', name: "Logística Alpha", plan: "Pro", status: "Healthy", dbSize: "340 MB", mrr: "R$ 1.500", users: 60, lastSync: "há 1 min" },
];

export const recentLogs = [
    "[18:05:22] INFO: Backup completed for t-105 in 12s.",
    "[18:04:10] WARN: High API latency detected on region SA-East.",
    "[18:01:45] INFO: New tenant provisioned: t-112 (Trial).",
    "[17:58:00] ERROR: Webhook delivery failed for t-107. Retrying...",
    "[17:50:11] INFO: DB scale-up triggered for Node 04.",
    "[17:45:00] INFO: Daily billing job executed. 12 invoices generated.",
    "[17:30:00] INFO: System health check passed. All services nominal.",
    "[17:15:22] WARN: t-107 exceeding storage soft quota (85%).",
];

export const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-[#06B6D4] font-bold text-sm">
            R$ {(payload[0].value / 1000).toFixed(0)}k
          </p>
        </div>
      );
    }
    return null;
};
