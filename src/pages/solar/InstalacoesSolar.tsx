import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Wrench, CheckCircle2, Clock, Calendar, Users,
  CheckSquare, ArrowRight, ShieldCheck
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function InstalacoesSolar() {
  const [instalacoes, setInstalacoes] = useState([
    { id: "1", cliente: "Fazenda Santa Maria", equipe: "Equipe Alpha (4 montadores)", progresso: 65, inicio: "01/09/2026", previsaoConclusao: "12/09/2026", modulosInstalados: "62/96 módulos", status: "Em Execução" },
    { id: "2", cliente: "Supermercado CompreBem", equipe: "Equipe Beta (6 montadores)", progresso: 20, inicio: "04/09/2026", previsaoConclusao: "22/09/2026", modulosInstalados: "45/220 módulos", status: "Fixação de Estrutura" },
  ]);

  return (
    <PageContainer
      title="Obras & Instalações em Andamento"
      description="Controle de cronograma de montagem, equipe de instaladores, fixação de estruturas e comissionamento."
    >
      <div className="space-y-4">
        {instalacoes.map(inst => (
          <div key={inst.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{inst.cliente}</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Responsável: <strong className="text-[var(--color-text-primary)]">{inst.equipe}</strong> • Prazo: {inst.previsaoConclusao}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 self-start sm:self-auto">
                {inst.status}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-text-muted)]">Montagem Física ({inst.modulosInstalados}):</span>
                <span className="font-bold text-amber-500">{inst.progresso}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${inst.progresso}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">Início: {inst.inicio}</span>
              <Button size="sm" variant="outline" onClick={() => toast.success("Diário de obra atualizado.")} className="h-8 text-xs font-bold rounded-xl">
                Atualizar Diário de Obra
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
