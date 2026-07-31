import { Card } from "../card";
import { Button } from "../button";
import { FileText } from "lucide-react";
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
      <Card className="p-4 border-white/10 bg-[var(--color-surface)]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Estrutura de Orçamento & Produtos Vinculados</h4>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Total: R$ {estimatedSum.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">Vincule serviços ou planos de SaaS diretamente para formalizar o orçamento comercial do lead:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
            {availableProducts.map(prod => {
              const isLinked = linkedProductIds.includes(prod.id);
              return (
                <div 
                  key={prod.id}
                  onClick={() => toggleProductLink(prod.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isLinked 
                      ? 'bg-[#2563EB]/15 border-blue-500/60 text-white shadow-md' 
                      : 'bg-[var(--color-surface-elevated)] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold leading-snug">{prod.name}</p>
                    <span className="text-[9px] text-[#06B6D4] uppercase tracking-wider font-bold">{prod.category} {prod.recurrence && '(Recorrente/mês)'}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    R$ {prod.price.toLocaleString('pt-BR')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profit Margin & Commission calculations simulator */}
        <div className="bg-[var(--color-surface-elevated)] p-4 rounded-2xl border border-white/5 space-y-3">
          <h5 className="text-[10px] font-black uppercase text-[#06B6D4] tracking-wider">Detalhamento Financeiro & Comissionamento</h5>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-slate-500">Lucro Estimado (82%):</span>
              <span className="text-emerald-400 font-bold">R$ {(estimatedSum * 0.82).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-slate-500">Custo Infra (18%):</span>
              <span className="text-rose-400 font-bold">R$ {(estimatedSum * 0.18).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-slate-500">Comissão de Venda (2.5%):</span>
              <span className="text-amber-400 font-bold">R$ {(estimatedSum * 0.025).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
              <span className="text-slate-500">Consultor responsável:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[120px]">{seller || 'Carlos Eduardo'}</span>
            </div>
          </div>
        </div>

        {/* Proposal generator action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              toast.success("Documento em formato PDF gerado no servidor!");
              setAlterationLogs((prev: any[]) => [
                { id: Date.now().toString(), author: seller || "Sistema", desc: `Proposta comercial eletrônica criada de R$ ${estimatedSum.toLocaleString('pt-BR')}`, time: "Agora" },
                ...prev
              ]);
            }}
            className="flex-1 bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold gap-1.5 h-10"
          >
            <FileText className="w-4 h-4" /> Visualizar PDF da Proposta
          </Button>
        </div>
      </Card>
    </div>
  );
}
