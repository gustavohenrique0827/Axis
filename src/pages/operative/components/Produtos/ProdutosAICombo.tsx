import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ProdutosAICombo() {
  return (
    <Card className="p-5 border-dashed">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <h4 className="text-sm text-white">
              Sugestão de combinações (IA)
            </h4>
            <p className="text-xs text-slate-500">
              A IA analisou as margens e calculou o seguinte kit sugerido de alta rentabilidade para vendas casadas.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Combo Promocional 'Setup Max Pro' importado para as propostas!")}
        >
          Adicionar Combo Sugerido
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Combo Premium</span>
            <p className="text-xs text-white mt-0.5">Sem Recomendação</p>
          </div>
          <span className="text-xs text-white font-mono mt-0.5">R$ 0,00</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Desconto do Combo</span>
            <p className="text-xs text-white mt-0.5">Sem Desconto</p>
          </div>
          <span className="text-xs text-white mt-0.5 font-mono">-R$ 0,00</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Média Margem Líquida</span>
            <p className="text-xs text-white mt-0.5">Rentabilidade Combinada</p>
          </div>
          <span className="text-xs text-white font-mono mt-0.5">0%</span>
        </div>
      </div>
    </Card>
  );
}
