import {
  Package, Box, Plus, Search,
  Truck, ShieldAlert, Zap,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PageContainer } from "../../components/PageContainer";
import { useEstoque } from './hooks/useEstoque';
import { toast } from 'sonner';

export default function EstoqueClinico() {
  const { items: stockItems } = useEstoque();

  return (
    <PageContainer 
      title="Estoque e Suprimentos" 
      description="Controle de insumos, rastreabilidade de lotes e automação de suprimentos clínicos."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => toast.success("Solicitação enviada ao setor de compras!")}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" /> Solicitar Pedido
          </Button>
          <Button 
            onClick={() => toast.info("Cadastro de insumo aberto")}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Item
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
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</span>
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
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--color-primary-blue)]" /> Lista de Insumos Clínicos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50">
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Material</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Categoria</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Qtd Atual</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="p-3.5 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider text-right">Preço Un.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {stockItems.map((item) => (
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
                </tbody>
              </table>
            </div>
          </Card>

          {/* Logistics & Alerts */}
          <div className="space-y-4">
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Previsão de Reabastecimento
              </h3>
              <div className="p-3 bg-[var(--color-surface-sunken)] rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1.5">
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Sugestão de Reposição</p>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed italic">
                  O consumo de Luvas Nitrílicas aumentou 40% nas últimas 2 semanas. Sugerimos antecipar o pedido do fornecedor Alpha em 5 dias.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-black text-[var(--color-text-faint)] uppercase tracking-wider">Vencimentos Próximos</p>
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
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Contagem Cíclica Atualizada</h4>
                <p className="text-[10px] text-[var(--color-text-muted)]">Última auditoria física: Hoje às 08:30</p>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
