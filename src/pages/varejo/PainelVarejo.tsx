import { useState, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ShoppingCart, DollarSign, TrendingUp, Boxes, Package,
  Truck, ArrowRight, CheckCircle2, AlertTriangle
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type PedidoVarejo = {
  id: string;
  cliente: string;
  itens: string;
  total: number;
  metodo: string;
  status: string;
  data: string;
};

const DEFAULT_PEDIDOS: PedidoVarejo[] = [
  { id: "1", cliente: "Ana Carolina Ferraz", itens: "Cabo USB-C 2m (x2), Carregador 30W", total: 249.90, metodo: "Pix", status: "Concluído", data: new Date().toLocaleDateString("pt-BR") },
  { id: "2", cliente: "Rodrigo Mendonça", itens: "Fone Bluetooth ANC, Película 3D", total: 420.00, metodo: "Cartão de Crédito", status: "Concluído", data: new Date().toLocaleDateString("pt-BR") },
  { id: "3", cliente: "Camila Guimarães", itens: "Suporte Veicular MagSafe, Cabo Lightning", total: 185.50, metodo: "Pix", status: "Concluído", data: new Date().toLocaleDateString("pt-BR") },
  { id: "4", cliente: "Lucas Martins", itens: "Smartwatch Sport GPS v4", total: 890.00, metodo: "Cartão Parcelado", status: "Concluído", data: new Date().toLocaleDateString("pt-BR") },
];

export default function PainelVarejo() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "default";

  const [pedidos] = useState<PedidoVarejo[]>(() => {
    try {
      const saved = localStorage.getItem(`spy_pedidos_varejo_${tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PEDIDOS;
  });

  const [compras] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`spy_compras_varejo_${tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: "1", fornecedor: "Distribuidora Tech Brasil", valor: 14800, data: "03/09/2026", status: "Em Transporte" },
      { id: "2", fornecedor: "Global Imports Eletrônicos", valor: 8900, data: "28/08/2026", status: "Entregue" },
    ];
  });

  const kpis = useMemo(() => {
    const totalFaturamento = pedidos.reduce((s, p) => s + (Number(p.total) || 0), 0);
    const totalPedidos = pedidos.length;
    const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

    return {
      totalFaturamento,
      totalPedidos,
      ticketMedio,
      totalSkus: 480,
    };
  }, [pedidos]);

  return (
    <PageContainer
      title="Painel Executivo de Varejo & Loja"
      description="Faturamento de frente de caixa (PDV), giro de estoque, reposição e pedidos de venda."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/varejo/vendas"
            className="h-9 px-4 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-primary-blue)] text-white shadow-xs hover:opacity-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Abrir PDV / Vendas
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-emerald-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Faturamento do Mês</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-500 font-mono">
            R$ {kpis.totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">Vendas realizadas no PDV</span>
        </Card>

        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-blue-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Pedidos Concluídos</span>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-[var(--color-text-primary)]">{kpis.totalPedidos}</p>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">Transações finalizadas no caixa</span>
        </Card>

        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-amber-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-500 font-mono">
            R$ {kpis.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">Valor médio por cesta de compras</span>
        </Card>

        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-purple-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">SKUs Cadastrados</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-black text-[var(--color-text-primary)]">{kpis.totalSkus}</p>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-1">Itens monitorados em estoque</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estoque Crítico */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> Itens Abaixo do Ponto de Reposição
            </h4>
            <Link to="/app/varejo/compras" className="text-[11px] font-bold text-[var(--color-primary-blue)] hover:underline flex items-center gap-1">
              Novo Pedido <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { nome: "Cabo USB-C Trançado 2m", qtd: "3 un.", minimo: "15 un.", status: "Crítico" },
              { nome: "Adaptador Fast Charger 30W", qtd: "5 un.", minimo: "20 un.", status: "Atenção" },
              { nome: "Película de Vidro 3D Premium", qtd: "8 un.", minimo: "30 un.", status: "Atenção" },
            ].map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between hover:bg-[var(--color-surface-sunken)] transition-colors">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{p.nome}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Estoque atual: <strong className="text-rose-500">{p.qtd}</strong> • Mínimo desejado: {p.minimo}
                  </p>
                </div>
                <Link to="/app/varejo/compras" className="text-xs font-bold text-[var(--color-primary-blue)] hover:underline">
                  Repor Estoque
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Compras com Fornecedores */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" /> Últimas Compras com Fornecedores
            </h4>
            <Link to="/app/varejo/fornecedores" className="text-[11px] font-bold text-[var(--color-primary-blue)] hover:underline flex items-center gap-1">
              Fornecedores <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {compras.map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between hover:bg-[var(--color-surface-sunken)] transition-colors">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{c.fornecedor}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {c.data} • <strong className="text-[var(--color-text-primary)] font-mono">R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
