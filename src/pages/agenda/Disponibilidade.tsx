import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import { Clock, Check, Save, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const DIAS = [
  { id: "seg", label: "Segunda-feira" },
  { id: "ter", label: "Terça-feira" },
  { id: "qua", label: "Quarta-feira" },
  { id: "qui", label: "Quinta-feira" },
  { id: "sex", label: "Sexta-feira" },
  { id: "sab", label: "Sábado" },
];

export default function Disponibilidade() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState({
    inicio: "09:00",
    fim: "18:00",
    intervalo: "15",
    duracaoPadrao: "45",
  });

  const handleSave = () => {
    toast.success("Grade de horários de atendimento salva com sucesso!");
  };

  return (
    <PageContainer
      title="Disponibilidade & Horários de Atendimento"
      description="Configure janelas de agendamento para reuniões de SDR, closers, visitas a imóveis e vistorias."
      actions={
        <Button onClick={handleSave} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Save className="w-3.5 h-3.5" /> Salvar Disponibilidade
        </Button>
      }
    >
      <div className="max-w-2xl space-y-6">
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-primary-blue)]" /> Horário Comercial Padrão
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Início</label>
              <input
                type="time"
                value={horarios.inicio}
                onChange={e => setHorarios({ ...horarios, inicio: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Término</label>
              <input
                type="time"
                value={horarios.fim}
                onChange={e => setHorarios({ ...horarios, fim: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Duração Reunião</label>
              <select
                value={horarios.duracaoPadrao}
                onChange={e => setHorarios({ ...horarios, duracaoPadrao: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]"
              >
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] block mb-1">Intervalo Entre</label>
              <select
                value={horarios.intervalo}
                onChange={e => setHorarios({ ...horarios, intervalo: e.target.value })}
                className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]"
              >
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl space-y-3 shadow-xs">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-primary-blue)]" /> Dias Ativos na Semana
          </h4>

          <div className="space-y-2">
            {DIAS.map(d => (
              <label key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">{d.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={d.id !== "sab"}
                  className="rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
