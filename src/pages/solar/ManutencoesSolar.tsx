import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Wrench, CheckCircle2, Clock, Activity, Calendar,
  ShieldCheck, AlertTriangle
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function ManutencoesSolar() {
  const [chamados, setChamados] = useState([
    { id: "1", usina: "UFV Granja Esperança", potencia: "30 kWp", servico: "Limpeza de Módulos (Semestral)", data: "15/09/2026", status: "Agendada", geracaoAtual: "98% do esperado" },
    { id: "2", usina: "Centro Automotivo Paulista", potencia: "15 kWp", servico: "Inspeção de Inversor & String Box", data: "02/09/2026", status: "Concluída", geracaoAtual: "100% normal" },
  ]);

  return (
    <PageContainer
      title="Manutenção & Pós-Venda Solar"
      description="Planos de limpeza periódica de módulos, telemetria de inversores e chamados de garantia."
    >
      <div className="space-y-3">
        {chamados.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{c.usina}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                  {c.potencia}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Serviço: <strong className="text-[var(--color-text-primary)]">{c.servico}</strong> • Data: {c.data} • Status de Geração: <span className="text-emerald-500 font-bold">{c.geracaoAtual}</span>
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25 self-start sm:self-auto">
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
