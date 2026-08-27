import React, { useMemo } from 'react';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  DollarSign, FileText, AlertCircle, 
  Download, Filter, Search, Calendar,
  CreditCard, Wallet, Landmark, PieChart as PieIcon,
  Inbox
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion } from "motion/react";
import { useData } from "../../contexts/DataContext";

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#64748b', '#ec4899', '#14b8a6'];

export default function FaturamentoClinico() {
  const { financeEntries, appointments } = useData();

  // Receitas (apenas entradas 'Receber')
  const receivables = financeEntries.filter(f => f.type === 'Receber');
  
  const totalBilled = receivables.reduce((sum, f) => sum + f.value, 0);
  const totalReceived = receivables.filter(f => f.status === 'Pago').reduce((sum, f) => sum + f.value, 0);
  
  // Taxa de Glosa simulada a partir de atrasados / valor total (já que não temos tabela de glosas separada)
  const totalLate = receivables.filter(f => f.status === 'Atrasado').reduce((sum, f) => sum + f.value, 0);
  const glosaRate = totalBilled > 0 ? ((totalLate / totalBilled) * 100).toFixed(1) + '%' : '0%';
  
  const avgTicket = appointments.length > 0 ? (totalReceived / appointments.length) : 0;

  // Chart data: Faturamento por Mês
  const revenueData = useMemo(() => {
    const months: Record<string, { faturado: number, recebido: number, glosas: number }> = {};
    receivables.forEach(f => {
      try {
        const d = new Date(f.date || '');
        if (isNaN(d.getTime())) return;
        const month = d.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!months[month]) months[month] = { faturado: 0, recebido: 0, glosas: 0 };
        
        months[month].faturado += f.value;
        if (f.status === 'Pago') months[month].recebido += f.value;
        if (f.status === 'Atrasado') months[month].glosas += f.value;
      } catch {}
    });
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [receivables]);

  // Mix de convênios a partir do tipo de agendamento (ou categoria da conta)
  const insuranceData = useMemo(() => {
    const categories: Record<string, number> = {};
    receivables.forEach(f => {
      const c = f.category || 'Outros';
      categories[c] = (categories[c] || 0) + f.value;
    });

    const total = Object.values(categories).reduce((a,b) => a + b, 0);
    return Object.entries(categories)
      .map(([name, val], i) => ({
        name,
        value: total > 0 ? Math.round((val / total) * 100) : 0,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [receivables]);

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  return (
    <PageContainer 
      title="Faturamento Clínico" 
      description="Gestão financeira, controle de glosas e repasses médicos."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
              <Download className="w-4 h-4" /> Exportar Relatório
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
              <FileText className="w-4 h-4" /> Nova Fatura
           </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Faturamento Bruto", value: fmt(totalBilled), trend: "+12%", icon: Landmark, color: "text-blue-500" },
             { label: "Receita Líquida", value: fmt(totalReceived), trend: "+8.5%", icon: Wallet, color: "text-emerald-500" },
             { label: "Taxa de Glosa (Atrasos)", value: glosaRate, trend: "-0.5%", icon: AlertCircle, color: "text-rose-500" },
             { label: "Ticket Médio Estimado", value: fmt(avgTicket), trend: "+3%", icon: CreditCard, color: "text-blue-500" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
                <div className="flex items-center justify-between mb-4">
                   <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   {receivables.length > 0 && (
                     <div className="flex items-center gap-1">
                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                        <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.trend}</span>
                     </div>
                   )}
                </div>
                <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Revenue Chart */}
           <Card className="lg:col-span-2 p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-emerald-400" /> Evolução Financeira Trimestral
              </h3>
              {revenueData.length === 0 ? (
                <div className="h-[350px] flex flex-col items-center justify-center gap-4 opacity-40">
                  <Inbox className="w-12 h-12 text-slate-500" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                    Nenhum lançamento financeiro.<br/>Cadastre contas a receber para visualizar o gráfico.
                  </p>
                </div>
              ) : (
                <div className="h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                         <defs>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <XAxis dataKey="month" stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis stroke="#64748b30" fontSize={10} axisLine={false} tickLine={false} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #ffffff05', borderRadius: '16px' }}
                         />
                         <Area type="monotone" dataKey="faturado" stroke="#10b981" fillOpacity={1} fill="url(#colorFat)" strokeWidth={3} />
                         <Area type="monotone" dataKey="recebido" stroke="#3b82f6" fillOpacity={0} strokeWidth={3} />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              )}
           </Card>

           {/* Insurance Mix */}
           <Card className="p-8 bg-[var(--color-surface-elevated)]/80 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
                 <PieIcon className="w-4 h-4 text-emerald-400" /> Mix de Recebíveis (Categoria)
              </h3>
              {insuranceData.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center gap-4 opacity-40">
                  <PieIcon className="w-10 h-10 text-slate-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    Sem categorias definidas.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                   {insuranceData.map((item, i) => (
                      <div key={i}>
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                            <span className="text-sm font-black text-white">{item.value}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-full rounded-full" 
                              style={{ backgroundColor: item.color }} 
                            />
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-[var(--color-surface-elevated)]/80 border-white/5 overflow-hidden">
           <div className="p-6 border-b border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Contas a Receber / Pendências (Top 5 recentes)</h3>
           </div>
           {receivables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <Inbox className="w-10 h-10 text-slate-500" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Nenhuma pendência financeira encontrada.
                </p>
              </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-white/5">
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Vencimento</th>
                         <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                         <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {receivables.slice(0, 5).map((row, i) => (
                        <tr key={row.id || i} className="hover:bg-white/[0.02] transition-colors">
                           <td className="p-6">
                              <p className="text-sm font-black text-white">{row.description}</p>
                              <p className="text-[10px] text-slate-500">Nota/Recibo associado</p>
                           </td>
                           <td className="p-6 text-xs text-slate-400">{row.category || 'Sem Categoria'}</td>
                           <td className="p-6 text-xs text-slate-400">{row.date}</td>
                           <td className="p-6 text-sm font-black text-white font-mono">{fmt(row.value)}</td>
                           <td className="p-6 text-right">
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                row.status === 'Pago' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                                row.status === 'Atrasado' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' :
                                'bg-blue-500/5 text-blue-400 border-blue-500/20'
                              }`}>
                                 {row.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </Card>

      </div>
    </PageContainer>
  );
}
