import React, { useState } from 'react';
import {
  Package, Box, Plus, Search,
  Truck, ShieldAlert, Zap,
  BarChart3, RefreshCw, X, Check
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useEstoque } from './hooks/useEstoque';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function EstoqueClinico() {
  const { items: stockItems, addItem } = useEstoque();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Descartáveis');
  const [itemQty, setItemQty] = useState('');
  const [itemMinQty, setItemMinQty] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const filteredItems = stockItems.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemQty || !itemMinQty) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    addItem({
      name: itemName.trim(),
      category: itemCategory,
      qty: parseInt(itemQty, 10) || 0,
      minQty: parseInt(itemMinQty, 10) || 0,
      price: itemPrice.trim() ? (itemPrice.startsWith('R$') ? itemPrice : `R$ ${itemPrice}`) : 'R$ 0,00',
    });

    setIsAddModalOpen(false);
    setItemName('');
    setItemQty('');
    setItemMinQty('');
    setItemPrice('');
  };

  return (
    <PageContainer 
      title="Estoque e Suprimentos" 
      description="Controle de insumos e alertas automáticos de estoque baixo ou crítico."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => toast.info("Integração com fornecedores ainda não disponível — em breve.")}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" /> Solicitar Pedido
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Insumo
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
        
        {/* Inventory Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Itens Cadastrados", value: stockItems.length.toString(), icon: Box, color: "text-[var(--color-primary-blue)]" },
            { label: "Alertas de Reposição", value: stockItems.filter(i => i.status === 'Crítico' || i.status === 'Alerta').length.toString(), icon: ShieldAlert, color: "text-amber-500" },
            { label: "Valor em Estoque", value: "R$ 42.150", icon: BarChart3, color: "text-emerald-500" },
            { label: "Pedidos Pendentes", value: "05", icon: Truck, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detailed Inventory Table */}
          <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--color-surface-sunken)]">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--color-primary-blue)]" /> Lista de Insumos Clínicos
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-faint)]" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar material..." 
                  className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] py-1.5 pl-9 pr-3 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50">
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Material</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Categoria</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Qtd Atual</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="p-3.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Preço Un.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors">
                      <td className="p-3.5 text-xs font-bold text-[var(--color-text-primary)]">{item.name}</td>
                      <td className="p-3.5 text-xs text-[var(--color-text-muted)] font-medium">{item.category}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{item.qty}</span>
                          <span className="text-[10px] text-[var(--color-text-faint)]">/ min: {item.minQty}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge 
                          variant={item.status === 'Normal' ? 'success' : item.status === 'Crítico' ? 'destructive' : 'warning'} 
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-mono text-xs font-bold text-[var(--color-text-primary)]">{item.price}</td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-xs text-[var(--color-text-muted)] italic">
                        Nenhum insumo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Logistics & Alerts */}
          <div className="space-y-4">
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Previsão de Reabastecimento
              </h3>
              <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1.5">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Sugestão de Reposição Automática</p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                  O consumo de insumos críticos está mapeado. Solicitações acima de 500 unidades recebem desconto via fornecedor parceiro.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">Vencimentos Próximos</p>
                {[
                  { item: "Lidocaína 2%", date: "12 Ago/26", qty: "14 frascos" },
                  { item: "Vitamina C Inj.", date: "15 Jul/26", qty: "08 frascos" },
                ].map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 bg-[var(--color-surface-sunken)] rounded-md">
                    <span className="font-medium text-[var(--color-text-primary)]">{v.item}</span>
                    <span className="text-rose-500 font-mono font-bold text-[10px]">{v.date}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Contagem Cíclica Ativa</h4>
                <p className="text-[10px] text-[var(--color-text-muted)]">Rastreamento de lote e data de validade integrado.</p>
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Modal: Novo Insumo */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-panel)] overflow-hidden shadow-2xl z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--color-primary-blue)]" />
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Cadastrar Novo Insumo</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="p-5 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Nome do Material / Medicamento *</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Ex: Luvas Cirúrgicas Látex M"
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Categoria *</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-2.5 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-medium"
                    >
                      <option value="Descartáveis">Descartáveis</option>
                      <option value="EPIs">EPIs</option>
                      <option value="Curativos">Curativos</option>
                      <option value="Medicamentos">Medicamentos</option>
                      <option value="Saneantes">Saneantes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Preço Unitário</label>
                    <input
                      type="text"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="R$ 15,00"
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Qtd em Estoque *</label>
                    <input
                      type="number"
                      min="0"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Qtd Mínima (Alerta) *</label>
                    <input
                      type="number"
                      min="0"
                      value={itemMinQty}
                      onChange={(e) => setItemMinQty(e.target.value)}
                      placeholder="20"
                      className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-9 px-4 text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-xs font-bold shadow-xs gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Salvar Insumo
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
