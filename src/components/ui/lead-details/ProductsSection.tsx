import { Card } from "../card";
import { Button } from "../button";
import { EmptyState } from "../empty-state";
import { FileText, Package } from "lucide-react";
import { toast } from "sonner";

interface ProductsSectionProps {
  estimatedSum: number;
  availableProducts: any[];
  linkedProductIds: string[];
  toggleProductLink: (id: string) => void;
  seller: string;
  setAlterationLogs: any;
}

export function ProductsSection({
  estimatedSum,
  availableProducts,
  linkedProductIds,
  toggleProductLink,
  seller,
  setAlterationLogs
}: ProductsSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Estrutura de Orçamento & Produtos Vinculados</h4>
          <span className="text-xs font-mono font-bold text-success bg-success/10 border border-success/25 px-2.5 py-0.5 rounded-full">
            Total: R$ {estimatedSum.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--color-text-muted)]">Vincule serviços ou planos de SaaS diretamente para formalizar o orçamento comercial do lead:</p>
          {availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
              {availableProducts.map(prod => {
                const isLinked = linkedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProductLink(prod.id)}
                    className={`p-3.5 rounded-[var(--radius-control)] border cursor-pointer transition-all flex items-center justify-between ${
                      isLinked
                        ? 'bg-[var(--color-primary-blue)]/15 border-[var(--color-primary-blue)]/60 text-[var(--color-text-primary)] shadow-md'
                        : 'bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold leading-snug">{prod.name}</p>
                      <span className="text-[9px] text-accent uppercase tracking-wider font-bold">{prod.category} {prod.recurrence && '(Recorrente/mês)'}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-success">
                      R$ {prod.price.toLocaleString('pt-BR')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Nenhum produto disponível"
              description="Cadastre produtos ou planos para vinculá-los a este lead."
            />
          )}
        </div>

        {/* Profit Margin & Commission calculations simulator */}
        <div className="bg-[var(--color-surface-sunken)] p-4 rounded-[var(--radius-panel)] border border-[var(--color-border-subtle)] space-y-3">
          <h5 className="text-[10px] font-black uppercase text-accent tracking-wider">Detalhamento Financeiro & Comissionamento</h5>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-muted)]">Lucro Estimado (82%):</span>
              <span className="text-success font-bold">R$ {(estimatedSum * 0.82).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-muted)]">Custo Infra (18%):</span>
              <span className="text-danger font-bold">R$ {(estimatedSum * 0.18).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-muted)]">Comissão de Venda (2.5%):</span>
              <span className="text-warning font-bold">R$ {(estimatedSum * 0.025).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-muted)]">Consultor responsável:</span>
              <span className="text-accent font-bold truncate max-w-[120px]">{seller || 'Carlos Eduardo'}</span>
            </div>
          </div>
        </div>

        {/* Proposal generator action buttons */}
        <div className="flex gap-2">
          <Button
            variant="subtle"
            onClick={() => {
              toast.success("Documento em formato PDF gerado no servidor!");
              setAlterationLogs((prev: any[]) => [
                { id: Date.now().toString(), author: seller || "Sistema", desc: `Proposta comercial eletrônica criada de R$ ${estimatedSum.toLocaleString('pt-BR')}`, time: "Agora" },
                ...prev
              ]);
            }}
            className="flex-1 text-xs font-bold gap-1.5 h-10"
          >
            <FileText className="w-4 h-4" /> Visualizar PDF da Proposta
          </Button>
        </div>
      </Card>
    </div>
  );
}
