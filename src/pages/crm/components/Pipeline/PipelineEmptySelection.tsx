import { Filter } from "lucide-react";
import { EmptyState } from "../../../../components/ui/empty-state";

export function PipelineEmptySelection() {
  return (
    <EmptyState
      className="flex-1"
      icon={Filter}
      title="Selecione um funil"
      description="Selecione um funil para visualizar o pipeline."
    />
  );
}

