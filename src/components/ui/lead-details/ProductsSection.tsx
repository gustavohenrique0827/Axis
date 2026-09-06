import { Card } from "../card";
import { Button } from "../button";
import { EmptyState } from "../empty-state";
import { Badge } from "../badge";
import { FileText, Package } from "lucide-react";
import { toast } from "sonner";
import { handleDownloadPdf } from "../../../pages/crm/utils/proposalPdf";

interface ProductsSectionProps {
  estimatedSum: number;
  availableProducts: any[];
  linkedProductIds: string[];
  toggleProductLink: (id: string) => void;
  seller: string;
  setAlterationLogs: any;
  leadName?: string;
  companyName?: string;
}

export function ProductsSection({
  estimatedSum,
  availableProducts,
  linkedProductIds,
  toggleProductLink,
  seller,
  setAlterationLogs,
  leadName,
  companyName,
}: ProductsSectionProps) {
  const linkedProducts = availableProducts.filter(p => linkedProductIds.includes(p.id));
  const totalCost = linkedProducts.reduce((sum, p) => sum + (p.cost || 0), 0);
  const totalCommission = linkedProducts.reduce((sum, p) => sum + (p.price * ((p.commission || 0) / 100)), 0);
  const netProfit = Math.max(0, estimatedSum - totalCost - totalCommission);
  const hasCostData = linkedProducts.some(p => p.cost > 0 || p.commission > 0);
  return (
    <div className="px-5 py-4 space-y-4 animate-in fade-in duration-200">
      <Card className="p-4 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-blue)]">
            Orçamento & Produtos Vinculados
          </h4>
          <Badge variant="success" className="font-mono text-xs">
            Total: R$ {estimatedSum.toLocaleString('pt-BR')}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Selecione produtos ou serviços para compor a proposta comercial do lead:
          </p>
          {availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {availableProducts.map(prod => {
                const isLinked = linkedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProductLink(prod.id)}
                    className={`p-3 rounded-[var(--radius-control)] border cursor-pointer transition-all flex items-center justify-between ${
                      isLinked
                        ? 'bg-[var(--color-primary-blue)]/10 border-[var(--color-primary-blue)]/40 text-[var(--color-text-primary)] shadow-sm'
                        : 'bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold leading-snug">{prod.name}</p>
                      <span className="text-[10px] text-[var(--color-text-faint)] uppercase font-semibold">
                        {prod.category} {prod.recurrence && '(Recorrente)'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                      R$ {prod.price.toLocaleString('pt-BR')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Nenhum produto cadastrado"
              description="Cadastre produtos na aba de Vendas para associá-los a este lead."
              className="py-6"
            />
          )}
        </div>

        {/* Detalhamento financeiro — baseado no custo/comissão reais de cada produto vinculado */}
        <div className="bg-[var(--color-surface-sunken)] p-3.5 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-2.5">
          <h5 className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
            Detalhamento Comercial
          </h5>
          {hasCostData ? (
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1">
                <span className="text-[var(--color-text-muted)]">Lucro Estimado:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">R$ {netProfit.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1">
                <span className="text-[var(--color-text-muted)]">Custos:</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">R$ {totalCost.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1">
                <span className="text-[var(--color-text-muted)]">Comissão:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">R$ {totalCommission.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1">
                <span className="text-[var(--color-text-muted)]">Consultor:</span>
                <span className="text-[var(--color-primary-blue)] font-bold truncate max-w-[100px]">{seller || 'Não atribuído'}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-[var(--color-text-faint)]">
              Cadastre custo e comissão nos produtos (aba Vendas) para ver a margem real aqui.
            </p>
          )}
        </div>

        {/* Ação Proposta */}
        <div className="pt-1">
          <Button
            variant="outline"
            disabled={linkedProducts.length === 0}
            onClick={() => {
              handleDownloadPdf(
                {
                  id: "preview",
                  cliente: companyName || leadName || "Cliente",
                  titulo: `Orçamento — ${leadName || "Lead"}`,
                  valor: estimatedSum,
                  vendedor: seller || "Sistema",
                  status: "Enviada",
                },
                linkedProducts.map(p => ({ product_name: p.name, quantidade: 1, preco_unitario: p.price }))
              );
              setAlterationLogs((prev: any[]) => [
                { id: Date.now().toString(), author: seller || "Sistema", desc: `PDF de orçamento baixado no valor de R$ ${estimatedSum.toLocaleString('pt-BR')}`, time: "Agora" },
                ...prev
              ]);
            }}
            className="w-full text-xs font-bold gap-1.5 h-9 disabled:opacity-40"
          >
            <FileText className="w-4 h-4" /> Baixar PDF do Orçamento
          </Button>
        </div>
      </Card>
    </div>
  );
}
