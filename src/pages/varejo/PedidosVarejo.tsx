import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ShoppingBag, Search, DollarSign, CheckCircle2,
  Clock, Package, ArrowRight
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function PedidosVarejo() {
  const [pedidos, setPedidos] = useState([
    { id: "PED-9821", cliente: "Lucas Pinheiro", itens: "1x Smartwatch Pro Ultra, 1x Película 3D", total: 429.90, formaPagto: "Pix", data: "Hoje às 14:22", status: "Pago / Separando" },
    { id: "PED-9820", cliente: "Carla Esteves", itens: "2x Fone Bluetooth TWS, 1x Carregador 30W", total: 319.80, formaPagto: "Cartão de Crédito 3x", data: "Hoje às 11:40", status: "Entregue / Concluído" },
    { id: "PED-9819", cliente: "Vinicius Prado", itens: "1x Suporte Veicular MagSafe", total: 89.90, formaPagto: "Pix", data: "Ontem às 18:10", status: "Entregue / Concluído" },
  ]);

  return (
    <PageContainer
      title="Pedidos de Venda & Balcão"
      description="Histórico de vendas realizadas pelo PDV, pedidos de entrega e status de separação."
      actions={
        <Link
          to="/app/varejo/vendas"
          className="h-9 px-4 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-primary-blue)] text-white shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Nova Venda no PDV
        </Link>
      }
    >
      <div className="space-y-3">
        {pedidos.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-primary-blue)]">
                  {p.id}
                </span>
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{p.cliente}</h4>
                <span className="text-[10px] text-[var(--color-text-muted)]">({p.formaPagto})</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Itens: {p.itens} • Data: {p.data}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-black text-emerald-500">
                R$ {p.total.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
