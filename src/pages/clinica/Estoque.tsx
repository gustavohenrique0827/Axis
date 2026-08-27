import React, { useState, useMemo } from 'react';
import {
  Package, Box, Plus, Search,
  Truck, ShieldAlert, Zap,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";
import { PageContainer } from "../../components/PageContainer";
import { useEstoque } from './hooks/useEstoque';

function parsePriceBRL(price: string): number {
  const num = parseFloat(price.replace(/[^\d,-]/g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

function formatPriceBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

const EMPTY_FORM = { name: '', category: '', qty: '', minQty: '', price: '' };

export default function EstoqueClinico() {
  const { items: stockItems, loading, addItem } = useEstoque();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return stockItems;
    return stockItems.filter(item =>
      item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)
    );
  }, [stockItems, searchTerm]);

  const kpis = useMemo(() => {
    const itemCount = stockItems.length;
    const alerts = stockItems.filter(i => i.status !== 'Normal').length;
    const totalValue = stockItems.reduce((sum, i) => sum + parsePriceBRL(i.price) * i.qty, 0);
    const pendingOrders = stockItems.filter(i => i.status === 'Crítico').length;
    return { itemCount, alerts, totalValue, pendingOrders };
  }, [stockItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) return;
    setSubmitting(true);
    try {
      await addItem({
        name: form.name.trim(),
        category: form.category.trim(),
        qty: Number(form.qty) || 0,
        minQty: Number(form.minQty) || 0,
        price: form.price ? formatPriceBRL(parsePriceBRL(form.price)) : 'R$ 0,00',
      });
      setForm(EMPTY_FORM);
      setIsAddOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Estoque e Suprimentos" 
      description="Controle de insumos, rastreabilidade de lotes e automação de compras."
      actions={
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-4 gap-2">
              <Truck className="w-4 h-4" /> Solicitar Pedido
           </Button>
           <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2">
              <Plus className="w-4 h-4" /> Novo Item
           </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
        
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Itens Cadastrados", value: kpis.itemCount.toString(), icon: Box, color: "text-blue-500" },
             { label: "Alertas de Reposição", value: kpis.alerts.toString(), icon: ShieldAlert, color: "text-amber-500" },
             { label: "Valor em Estoque", value: formatPriceBRL(kpis.totalValue), icon: BarChart3, color: "text-emerald-500" },
             { label: "Pedidos Pendentes", value: kpis.pendingOrders.toString().padStart(2, '0'), icon: Truck, color: "text-blue-500" },
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
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
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
                       {filteredItems.map((item) => (
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Novo Item de Estoque" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nome do Item</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Luvas Nitrílicas (M)" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Categoria</label>
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: EPIs" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quantidade</label>
              <Input type="number" min="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="0" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Qtd. Mínima</label>
              <Input type="number" min="0" value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))} placeholder="0" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Preço Unitário (R$)</label>
            <Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0,00" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="border-white/10" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? 'Salvando...' : 'Adicionar Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
