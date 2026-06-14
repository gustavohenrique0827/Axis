import { Card } from "../../../../components/ui/card";

export function PipelineEmptySelection() {
  return (
    <Card className="flex-1 flex items-center justify-center p-12 bg-[#111827]/40 border border-white/5 rounded-3xl">
      <p className="text-sm font-bold text-slate-400">Selecione um funil para visualizar o pipeline.</p>
    </Card>
  );
}

