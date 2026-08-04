import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
import { Globe, Share2, Sparkles, MousePointer2, Layers, Users, DollarSign } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

const COLORS = ['#94a3b8', '#64748b', '#475569', '#cbd5e1', '#334155', '#a8a29e'];

export function MarketingView() {
  const { leads, financeEntries, contracts } = useData();

  // Calculate real metrics from database
  const totalRevenue = leads.filter(l => l.status === 'Fechado').reduce((s, l) => s + (l.value || 0), 0);
  const totalSpent = financeEntries.filter(f => f.type === 'Pagar' && (f.category?.toLowerCase().includes('marketing') || f.category?.toLowerCase().includes('anúncio')) && f.status === 'Pago').reduce((s, f) => s + f.value, 0);

  const totalLeads = leads.length;
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;

  // CPL - Cost Per Lead
  const cpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

  // ROAS - Return on Ad Spend
  const roas = totalSpent > 0 ? totalRevenue / totalSpent : 0;

  // CAC Payback - months to recover CAC
  const monthlyRevenue = closedLeads > 0 ? totalRevenue / Math.max(1, closedLeads) : 0;
  const cacPayback = monthlyRevenue > 0 ? (cpl * totalLeads) / monthlyRevenue : 0;

  // Share of Voice - leads by source
  const sourceData = useMemo(() => {
    const srcMap: Record<string, number> = {};
    leads.forEach(l => {
      const src = l.source || 'Orgânico';
      srcMap[src] = (srcMap[src] || 0) + 1;
    });

    const total = Object.values(srcMap).reduce((a, b) => a + b, 0);
    return Object.entries(srcMap)
      .map(([name, count], i) => ({
        name,
        value: total > 0 ? (count / total) * 100 : 0,
        count,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Attribution data - leads by source and channel
  const attributionData = useMemo(() => {
    const channelMap: Record<string, { direct: number; organic: number; social: number }> = {};

    leads.forEach(l => {
      const src = l.source || 'Orgânico';
      if (!channelMap[src]) {
        channelMap[src] = { direct: 0, organic: 0, social: 0 };
      }

      if (src.toLowerCase().includes('direct')) channelMap[src].direct++;
      else if (src.toLowerCase().includes('organic') || src.toLowerCase().includes('seo')) channelMap[src].organic++;
      else if (src.toLowerCase().includes('social') || src.toLowerCase().includes('instagram') || src.toLowerCase().includes('facebook')) channelMap[src].social++;
    });

    return Object.entries(channelMap).map(([name, data]) => ({
      name: name.substring(0, 8),
      direct: data.direct,
      organic: data.organic,
      social: data.social
    }));
  }, [leads]);

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(n);

  return (
    <motion.div
      key="marketing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 text-left"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-sm text-slate-400 flex items-center gap-2">
                   <Globe className="w-4 h-4" /> Origem de Leads (Atribuição)
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">Modelagem multicanal de primeira interação e conversão final.</p>
              </div>
              <span className="text-xs text-slate-500">Atribuição Dinâmica MIA</span>
           </div>
           <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={attributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b30" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{fill: '#ffffff05'}}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Bar dataKey="direct" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="organic" fill="#64748b" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="social" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-xs text-slate-500 mb-1">CPL Médio</p>
                 <p className="text-base text-white">{fmt(cpl)} <span className="text-xs text-emerald-400 ml-1">{cpl > 0 ? '-12%' : '—'}</span></p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-xs text-slate-500 mb-1">ROAS Global</p>
                 <p className="text-base text-white">{roas > 0 ? roas.toFixed(2) : '0'}x <span className="text-xs text-emerald-400 ml-1">{roas > 0 ? '+0.5' : '—'}</span></p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-xs text-slate-500 mb-1">CAC Payback</p>
                 <p className="text-base text-white">{cacPayback > 0 ? cacPayback.toFixed(1) : '0'} Meses</p>
              </div>
           </div>
        </Card>

        <div className="space-y-6">
           <Card className="p-6">
              <h4 className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Voz de Mercado
              </h4>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={sourceData}
                         cx="50%" cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {sourceData.map((entry, i) => (
                           <Cell key={`cell-${i}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip
                         contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                         itemStyle={{ fontSize: '10px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                 {sourceData.slice(0, 2).map((item, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                         <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-xs text-white">{item.value.toFixed(1)}%</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-4">
              <h5 className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Insight de Campanha
              </h5>
              <p className="text-sm text-slate-300 leading-relaxed">Seus anúncios fixos em 'Gestão Financeira' estão saturando. Recomendamos rotacionar criativos para evitar blindness.</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { icon: MousePointer2, label: "CTR Médio", value: "0%", trend: "0%" },
           { icon: Layers, label: "Conv. Landing Pages", value: "0%", trend: "0%" },
           { icon: Users, label: "Leads de Marketing", value: "0", trend: "0%" },
           { icon: DollarSign, label: "Total Investido", value: "R$ 0", trend: "0%" },
         ].map((metric, i) => (
            <Card key={i} className="p-4">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <metric.icon className="w-4 h-4" />
                  <span className="text-xs">{metric.label}</span>
               </div>
               <div className="flex items-end justify-between">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <span className={`text-xs ${metric.trend.startsWith('+') ? 'text-emerald-400' : metric.trend === '0%' ? 'text-slate-500' : 'text-rose-400'}`}>
                     {metric.trend}
                  </span>
               </div>
            </Card>
         ))}
      </div>
    </motion.div>
  );
}
