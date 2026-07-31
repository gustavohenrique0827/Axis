import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Users, ExternalLink } from "lucide-react";

export function ConfigEmpresaEquipe() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe & Convites</h1>
          <p className="text-sm text-slate-400">Convide novos membros para sua empresa no Axis.</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20">
          <Users className="w-4 h-4 mr-2" /> Convidar Membro
        </Button>
      </div>
      <Card className="p-6 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/10">
        <p className="text-slate-400">Gerenciamento de equipe movido para o menu principal. Acesse "Equipe" na barra lateral esquerda.</p>
        <Button onClick={() => window.location.href = "/app/equipe"} className="mt-4 bg-[var(--color-surface)] border border-white/10 text-white hover:bg-white/5">
          Ir para Gestão de Equipe <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
