import React, { useState } from 'react';
import {
  Package, Box, Plus, Search,
  Truck, ShieldAlert, Zap,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useEstoque } from './hooks/useEstoque';

export default function EstoqueClinico() {
  const { items: stockItems, loading } = useEstoque();

  return (
    <PageContainer 
      title="Estoque e Suprimentos" 
      description="Controle de insumos, rastreabilidade de lotes e automação de compras."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
              <Truck className="w-4 h-4" /> Solicitar Pedido
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" /> Novo Item
           </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Itens Cadastrados", value: "482", icon: Box, color: "text-indigo-500" },
             { label: "Alertas de Reposição", value: "12", icon: ShieldAlert, color: "text-amber-500" },
             { label: "Valor em Estoque", value: "R$ 42.150", icon: BarChart3, color: "text-emerald-500" },
             { label: "Pedidos Pendentes", value: "05", icon: Truck, color: "text-blue-500" },
           ].map((stat, i) => (
             <Card key={i} className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                <div className="text-2xl font-display font-black text-white mb-1 italic">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Detailed Inventory Table */}
           <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)]/80 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" /> Lista de Insumos
                 </h3>
                 <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar estoque..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none"
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Material</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Qtd Atual</th>
                          <th className="text-left p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="text-right p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Preço Un.</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {stockItems.map((item) => (
                         <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="p-6 font-black text-sm text-white">{item.name}</td>
                            <td className="p-6 text-xs text-slate-500 uppercase tracking-tighter">{item.category}</td>
                            <td className="p-6">
                               <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-slate-300 font-mono">{item.qty}</span>
                                  <span className="text-[9px] text-slate-600 font-bold">min: {item.minQty}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${
                                 item.status === 'Normal' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                                 item.status === 'Crítico' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' :
                                 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                               }`}>
                                  {item.status}
                               </span>
                            </td>
                            <td className="p-6 text-right font-mono text-xs text-slate-400">{item.price}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* Inventory Automation IA */}
           <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20 group">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" /> MIA Predictive Logistics
                 </h3>
                 <div className="space-y-6">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-[10px] text-blue-400 font-black uppercase mb-2">Sugestão de Compra</p>
                       <p className="text-xs text-slate-300 italic leading-relaxed">
                          "O consumo de **Luvas Nitrílicas** aumentou 40% nas últimas 2 semanas. Sugerimos antecipar o pedido do fornecedor Alpha em 5 dias."
                       </p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] text-slate-500 font-black uppercase border-b border-white/5 pb-2">Vencimentos Próximos</p>
                       {[
                         { item: "Lidocaína 2%", date: "12 Ago/26", qty: "14 frascos" },
                         { item: "Vitamina C Inj.", date: "15 Jul/26", qty: "08 frascos" },
                       ].map((v, i) => (
                         <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400">{v.item}</span>
                            <span className="text-rose-400 font-mono tracking-tighter">{v.date}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>

              <Card className="p-6 bg-emerald-500/5 border-emerald-500/10">
                 <div className="flex items-center gap-4">
                    <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase mb-1">Backup Sincronizado</h4>
                       <p className="text-[9px] text-slate-500 font-medium">Última contagem cíclica: Hoje, 08:30</p>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

      </div>
    </PageContainer>
  );
}
