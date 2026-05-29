import React, { useState } from 'react';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  DollarSign, FileText, AlertCircle, 
  Download, Filter, Search, Calendar,
  CreditCard, Wallet, Landmark, PieChart as PieIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { motion } from "motion/react";

const revenueData = [
  { month: 'Jan', faturado: 120000, recebido: 105000, glosas: 5000 },
  { month: 'Fev', faturado: 145000, recebido: 128000, glosas: 4200 },
  { month: 'Mar', faturado: 138000, recebido: 132000, glosas: 3800 },
  { month: 'Abr', faturado: 162000, recebido: 145000, glosas: 7500 },
  { month: 'Mai', faturado: 185000, recebido: 168000, glosas: 2100 },
];

const insuranceData = [
  { name: 'Unimed', value: 45, color: '#3b82f6' },
  { name: 'Bradesco', value: 25, color: '#10b981' },
  { name: 'SulAmérica', value: 15, color: '#8b5cf6' },
  { name: 'Particular', value: 15, color: '#f59e0b' },
];

export default function FaturamentoClinico() {
  return (
    <PageContainer 
      title="Faturamento Clínico" 
      description="Gestão financeira, controle de glosas e repasses médicos."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
              <Download className="w-4 h-4" /> Exportar Relatório
           </Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
              <FileText className="w-4 h-4" /> Nova Fatura
           </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Faturamento Bruto", value: "R$ 185.000", trend: "+12%", icon: Landmark, color: "text-emerald-400" },
             { label: "Receita Líquida", value: "R$ 168.420", trend: "+8.5%", icon: Wallet, color: "text-blue-400" },
             { label: "Taxa de Glosa", value: "2.1%", trend: "-0.5%", icon: AlertCircle, color: "text-rose-400" },
             { label: "Ticket Médio", value: "R$ 442", trend: "+3%", icon: CreditCard, color: "text-amber-400" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[#111827]/80 border-white/5 relative group">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-white/5">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   <div className="flex items-center gap-1">
                      {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                      <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.trend}</span>
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white font-mono italic">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{stat.label}</p>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Revenue Chart */}
           <Card className="lg:col-span-2 p-8 bg-[#111827]/80 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-emerald-400" /> Evolução Financeira Trimestral
              </h3>
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
                         contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #ffffff05', borderRadius: '16px' }}
                       />
                       <Area type="monotone" dataKey="faturado" stroke="#10b981" fillOpacity={1} fill="url(#colorFat)" strokeWidth={3} />
                       <Area type="monotone" dataKey="recebido" stroke="#3b82f6" fillOpacity={0} strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Insurance Mix */}
           <Card className="p-8 bg-[#111827]/80 border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
                 <PieIcon className="w-4 h-4 text-emerald-400" /> Mix de Recebeiveis
              </h3>
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
                 <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                       "O faturamente via **Unimed** cresceu 14% este mês. Recomendado auditar as guias pendentes do lote #2026-05."
                    </p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-[#111827]/80 border-white/5 overflow-hidden">
           <div className="p-6 border-b border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Contas a Receber / Pendências</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pagador</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Emissão</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vencimento</th>
                       <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                       <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {[
                      { payer: 'Unimed BH', date: '12/05/2026', due: '12/06/2026', value: 'R$ 8.420', status: 'Processando' },
                      { payer: 'Particular (João P.)', date: '25/05/2026', due: '25/05/2026', value: 'R$ 450', status: 'Recebido' },
                      { payer: 'Bradesco Saúde', date: '01/05/2026', due: '01/06/2026', value: 'R$ 12.180', status: 'Glosa Parcial' },
                      { payer: 'SulAmérica', date: '15/05/2026', due: '15/06/2026', value: 'R$ 4.900', status: 'Aguardando' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                         <td className="p-6">
                            <p className="text-sm font-black text-white">{row.payer}</p>
                            <p className="text-[10px] text-slate-500">Nota Fiscal: #NF-2026-{880+i}</p>
                         </td>
                         <td className="p-6 text-xs text-slate-400">{row.date}</td>
                         <td className="p-6 text-xs text-slate-400">{row.due}</td>
                         <td className="p-6 text-sm font-black text-white font-mono">{row.value}</td>
                         <td className="p-6 text-right">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                              row.status === 'Recebido' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                              row.status === 'Glosa Parcial' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' :
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
        </Card>

      </div>
    </PageContainer>
  );
}
