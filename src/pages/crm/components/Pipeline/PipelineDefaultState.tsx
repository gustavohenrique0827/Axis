import { Card } from "../../../../components/ui/card";
import { Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

export function PipelineDefaultState() {
  return (
    <Card className="p-6 bg-[var(--color-surface-elevated)]/60 border border-amber-500/20 rounded-2xl flex items-center gap-4">
      <Settings2 className="w-8 h-8 text-amber-400 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Nenhum funil configurado</p>
        <p className="text-xs text-slate-400 mt-0.5">Configure seus funis nas configurações do CRM.</p>
      </div>
      <Link
        to="/app/configuracoes/crm/funis"
        className="shrink-0 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all"
      >
        Configurar →
      </Link>
    </Card>
  );
}

