import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Stethoscope, Plus, Search, Calendar, Phone,
  Mail, Award, CheckCircle2, Clock
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ProfissionaisClinica() {
  const [doutores, setDoutores] = useState([
    { id: "1", nome: "Dra. Beatriz Albuquerque", crm: "CRM/SP 142.890", especialidade: "Dermatologia & Estética", diasAtendimento: "Seg, Qua, Sex", consultasMes: 54, status: "Ativa" },
    { id: "2", nome: "Dr. Rodrigo Silveira", crm: "CRM/SP 128.450", especialidade: "Cardiologia & Clínica Geral", diasAtendimento: "Ter, Qui", consultasMes: 42, status: "Ativa" },
    { id: "3", nome: "Dra. Mariana Castro", crm: "CRM/SP 165.220", especialidade: "Ortopedia & Traumatologia", diasAtendimento: "Seg a Sex", consultasMes: 68, status: "Ativa" },
  ]);

  return (
    <PageContainer
      title="Corpo Clínico & Especialistas"
      description="Cadastro de médicos, número de registro profissional (CRM/CRO/CRP) e agenda de consultas."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/clinicas/agenda"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Ver Agenda Médica
          </Link>
          <Button onClick={() => toast.info("Cadastro de especialista clínico.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Profissional
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Médicos Cadastrados</span>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{doutores.length}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Consultas Realizadas no Mês</span>
          <div className="text-2xl font-black text-emerald-500">{doutores.reduce((s, d) => s + d.consultasMes, 0)}</div>
        </Card>
        <Card className="p-4 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Especialidades Atendidas</span>
          <div className="text-2xl font-black text-[var(--color-primary-blue)]">{doutores.length}</div>
        </Card>
      </div>

      <div className="space-y-3">
        {doutores.map(d => (
          <div key={d.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{d.nome}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-primary-blue)] font-bold">
                  {d.crm}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Especialidade: <strong className="text-[var(--color-text-primary)]">{d.especialidade}</strong> • Dias: {d.diasAtendimento} • Consultas no Mês: {d.consultasMes}
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 self-start sm:self-auto">
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
