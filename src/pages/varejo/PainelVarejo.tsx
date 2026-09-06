import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ShoppingCart, DollarSign, TrendingUp, Boxes, Package,
  Users, ArrowRight, Truck, Plus
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Link } from "react-router-dom";

export default function PainelVarejo() {
  return (
    <PageContainer
      title="Painel Executivo de Varejo & Loja"
      description="Faturamento de frente de caixa (PDV), giro de estoque, reposição e pedidos de venda."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/varejo/vendas"
            className="h-9 px-4 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-primary-blue)] text-white shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Abrir PDV / Vendas
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: "Faturamento do Mês", val: "R$ 48.950", color: "text-emerald-500" },
          { icon: ShoppingCart, label: "Pedidos no PDV", val: "312", color: "text-blue-500" },
          { icon: TrendingUp, label: "Ticket Médio", val: "R$ 156,89", color: "text-amber-500" },
          { icon: Boxes, label: "SKUs em Estoque", val: "480", color: "text-purple-500" },
        ].map((k, i) => (
          <Card key={i} className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-xl font-black text-[var(--color-text-primary)]">{k.val}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" /> Itens Abaixo do Ponto de Reposição
          </h4>
          <div className="space-y-2">
            {[
              { nome: "Cabo USB-C Trançado 2m", qtd: "3 un.", minimo: "15 un.", status: "Crítico" },
              { nome: "Adaptador Fast Charger 30W", qtd: "5 un.", minimo: "20 un.", status: "Atenção" },
              { nome: "Película de Vidro 3D Premium", qtd: "8 un.", minimo: "30 un.", status: "Atenção" },
            ].map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{p.nome}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Atual: <strong className="text-rose-500">{p.qtd}</strong> (Mínimo: {p.minimo})</p>
                </div>
                <Link to="/app/varejo/compras" className="text-xs font-bold text-[var(--color-primary-blue)] hover:underline">
                  Pedir Reposição
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" /> Últimas Compras com Fornecedores
          </h4>
          <div className="space-y-2">
            {[
              { fornecedor: "Distribuidora Tech Brasil", valor: "R$ 14.800", data: "03/09/2026", status: "Em Transporte" },
              { fornecedor: "Global Imports Eletrônicos", valor: "R$ 8.900", data: "28/08/2026", status: "Entregue" },
            ].map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">{c.fornecedor}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{c.data} • {c.valor}</p>
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
