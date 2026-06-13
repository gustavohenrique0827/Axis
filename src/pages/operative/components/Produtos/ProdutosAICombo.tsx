import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ProdutosAICombo() {
  return (
    <Card className="p-5 border-dashed border-white/10 bg-[#111827]/40 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
              G-AI Combinations Suggestion Module
            </h4>
            <p className="text-[11px] text-slate-500">
              A IA analisou as margens e calculou o seguinte kit sugerido de alta rentabilidade para vendas casadas.
            </p>
          </div>
        </div>
        <Button
          onClick={() => toast.success("Combo Promocional 'Setup Max Pro' importado para as propostas!")}
          className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg shrink-0 transition-all"
        >
          Adicionar Combo Sugerido
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#2563EB] font-bold block uppercase tracking-wide">Combo Premium</span>
            <p className="text-xs font-bold text-white mt-0.5">Sem Recomendação</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">R$ 0,00</span>
        </div>

        <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#2563EB] font-bold block uppercase tracking-wide">Desconto do Combo</span>
            <p className="text-xs font-bold text-white mt-0.5">Sem Desconto</p>
          </div>
          <span className="text-xs font-bold text-rose-400 mt-0.5 font-mono">-R$ 0,00</span>
        </div>

        <div className="bg-[#0B1120] border border-white/5 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-amber-400 font-bold block uppercase tracking-wide">Média Margem Líquida</span>
            <p className="text-xs font-bold text-white mt-0.5">Rentabilidade Combinada</p>
          </div>
          <span className="text-xs font-bold text-white font-mono mt-0.5">0%</span>
        </div>
      </div>
    </Card>
  );
}
