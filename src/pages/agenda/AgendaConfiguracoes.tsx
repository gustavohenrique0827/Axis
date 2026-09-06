import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Calendar, CheckCircle2, ShieldCheck, Zap,
  Save, RefreshCw, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

export default function AgendaConfiguracoes() {
  const { user } = useAuth();
  const [googleConnected, setGoogleConnected] = useState(true);
  const [autoInvite, setAutoInvite] = useState(true);
  const [lembreteWhatsapp, setLembreteWhatsapp] = useState(true);

  const handleSave = () => {
    toast.success("Configurações da Agenda salvas com sucesso!");
  };

  return (
    <PageContainer
      title="Configurações da Agenda"
      description="Gerencie a sincronização bidirecional do Google Calendar e alertas automáticos aos clientes."
      actions={
        <Button onClick={handleSave} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Save className="w-3.5 h-3.5" /> Salvar Preferências
        </Button>
      }
    >
      <div className="max-w-2xl space-y-6">
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-primary-blue)]" /> Conexão Google Calendar
          </h4>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Google Agenda Conectado</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Sincronização multi-tenant isolada por conta.</p>
              </div>
            </div>
            <button
              onClick={() => toast.info("Reautenticação Google disparada.")}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-default)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
            >
              Reconectar
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">Envio Automático de Convite por E-mail</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Envia o convite do Google Calendar automaticamente aos participantes.</span>
              </div>
              <input
                type="checkbox"
                checked={autoInvite}
                onChange={e => setAutoInvite(e.target.checked)}
                className="rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">Disparo de Lembrete via WhatsApp</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Envia link e orientações da reunião 1 hora antes do agendamento.</span>
              </div>
              <input
                type="checkbox"
                checked={lembreteWhatsapp}
                onChange={e => setLembreteWhatsapp(e.target.checked)}
                className="rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
