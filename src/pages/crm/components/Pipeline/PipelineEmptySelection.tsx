import { Card } from "../../../../components/ui/card";

export function PipelineEmptySelection() {
  return (
    <Card className="flex-1 flex items-center justify-center p-12 bg-[var(--color-surface-elevated)]/40 border border-white/5 rounded-3xl">
      <p className="text-sm text-slate-400">Selecione um funil para visualizar o pipeline.</p>
    </Card>
  );
}

