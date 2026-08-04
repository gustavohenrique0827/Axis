import { Card } from "../../../../components/ui/card";
import { Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

export function PipelineDefaultState() {
  return (
    <Card className="p-6 flex items-center gap-4">
      <Settings2 className="w-6 h-6 text-slate-400 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-white">Nenhum funil configurado</p>
        <p className="text-xs text-slate-400 mt-0.5">Configure seus funis nas configurações do CRM.</p>
      </div>
      <Link
        to="/app/configuracoes/crm/funis"
        className="shrink-0 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs rounded-xl hover:bg-white/10 transition-all"
      >
        Configurar →
      </Link>
    </Card>
  );
}

