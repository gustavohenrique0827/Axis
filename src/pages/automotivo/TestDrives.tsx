import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Calendar, Car, Clock, User, CheckCircle2,
  Plus, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function TestDrives() {
  const [testDrives, setTestDrives] = useState([
    { id: "1", cliente: "Dr. Marcelo Fonseca", telefone: "(11) 98765-4321", carro: "BMW 320i M Sport 2022", vendedor: "Ricardo Dias", data: "06/09/2026", hora: "15:00", cnhValida: true, status: "Confirmado" },
    { id: "2", cliente: "Camila Guimarães", telefone: "(11) 97654-3210", carro: "Toyota Corolla Altis 2.0 2024", vendedor: "Ricardo Dias", data: "07/09/2026", hora: "10:30", cnhValida: true, status: "Confirmado" },
    { id: "3", cliente: "Jorge Benício", telefone: "(11) 99112-8877", carro: "Jeep Compass Longitude 2023", vendedor: "Ana Paula", data: "05/09/2026", hora: "16:00", cnhValida: true, status: "Realizado / Proposta em Andamento" },
  ]);

  return (
    <PageContainer
      title="Test-Drives Agendados"
      description="Controle de experiência de condução com clientes, verificação de CNH e agendamentos integrados à Agenda."
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/app/agenda/calendario"
            className="h-9 px-3.5 text-xs font-bold gap-1.5 inline-flex items-center rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)] transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Ver no Calendário Geral
          </Link>
          <Button onClick={() => toast.info("Para agendar test-drive, utilize o botão Agendar no lead ou no veículo.")} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Test-Drive
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {testDrives.map(td => (
          <div key={td.id} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{td.cliente}</h4>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)]">({td.telefone})</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  CNH Válida
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-primary)] font-bold">
                Veículo: {td.carro}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                Vendedor Acompanhante: <strong className="text-[var(--color-text-primary)]">{td.vendedor}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold text-[var(--color-primary-blue)]">
                {td.data} às {td.hora}
              </span>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                {td.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
