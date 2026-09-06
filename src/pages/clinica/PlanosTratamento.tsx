import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  FileText, Plus, Search, DollarSign, Calendar,
  CheckCircle2, Clock, User
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function PlanosTratamento() {
  const [planos, setPlanos] = useState([
    { id: "1", paciente: "Mariana Souza", profissional: "Dra. Beatriz Albuquerque", descricao: "Protocolo Rejuvenescimento Facial (3 sessões)", totalSessoes: 3, sessoesFeitas: 1, valorTotal: 4200, status: "Em Execução" },
    { id: "2", paciente: "Carlos Alberto Mendes", profissional: "Dr. Rodrigo Silveira", descricao: "Reabilitação Cardiovascular & Monitoramento Holter", totalSessoes: 6, sessoesFeitas: 4, valorTotal: 2800, status: "Em Execução" },
  ]);

  return (
    <PageContainer
      title="Planos de Tratamento & Orçamentos"
      description="Orçamentos clínicos integrados, etapas de tratamento e faturamento de procedimentos seriados."
    >
      <div className="space-y-3">
        {planos.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-0.5">Paciente: {p.paciente}</h4>
              <p className="text-xs text-[var(--color-text-muted)]">
                Plano: <strong className="text-[var(--color-text-primary)]">{p.descricao}</strong> • Médico: {p.profissional}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                  Sessões: {p.sessoesFeitas} de {p.totalSessoes} concluídas
                </span>
                <div className="w-24 h-1.5 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.sessoesFeitas / p.totalSessoes) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <span className="text-sm font-black text-emerald-500">
                R$ {p.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
