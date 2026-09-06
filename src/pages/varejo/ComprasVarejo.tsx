import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  ClipboardList, Plus, Search, Truck, DollarSign,
  CheckCircle2, Clock, Package
} from "lucide-react";
import { toast } from "sonner";

export default function ComprasVarejo() {
  const [compras, setCompras] = useState([
    { id: "PC-102", fornecedor: "Distribuidora Tech Brasil", valor: 14800, itens: "120 cabos, 50 carregadores", data: "03/09/2026", previsaoEntrega: "08/09/2026", status: "Em Transporte" },
    { id: "PC-101", fornecedor: "Global Imports Eletrônicos", valor: 8900, itens: "30 smartwatches, 40 fones bluetooth", data: "28/08/2026", previsaoEntrega: "02/09/2026", status: "Recebido no Estoque" },
  ]);

  return (
    <PageContainer
      title="Ordens de Compra & Reposição"
      description="Emissão de pedidos a fornecedores, entrada de notas fiscais e alimentação automática de estoque."
      actions={
        <Button onClick={() => toast.info("Nova ordem de compra gerada.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Plus className="w-3.5 h-3.5" /> Nova Ordem de Compra
        </Button>
      }
    >
      <div className="space-y-3">
        {compras.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] text-[var(--color-primary-blue)]">
                  {c.id}
                </span>
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.fornecedor}</h4>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Itens: {c.itens} • Previsão: {c.previsaoEntrega} • Total: <strong className="text-emerald-500">R$ {c.valor.toLocaleString("pt-BR")}</strong>
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25 self-start sm:self-auto">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
