import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  Calendar, CheckCircle2, ShieldCheck, Zap,
  Save, RefreshCw, MessageSquare, Video, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

type AgendaConfig = {
  googleConnected: boolean;
  autoInvite: boolean;
  lembreteWhatsapp: boolean;
  autoMeetLink: boolean;
  permitirRemarcacao: boolean;
  antecedenciaMinimaHoras: string;
};

const DEFAULT_CONFIG: AgendaConfig = {
  googleConnected: true,
  autoInvite: true,
  lembreteWhatsapp: true,
  autoMeetLink: true,
  permitirRemarcacao: true,
  antecedenciaMinimaHoras: "2",
};

export default function AgendaConfiguracoes() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "default";
  const storageKey = `spy_agenda_configuracoes_${tenantId}`;

  const [config, setConfig] = useState<AgendaConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CONFIG;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleToggle = (key: keyof AgendaConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
      toast.success("Configurações da Agenda salvas com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar preferências.");
    }
  };

  const handleReconnectGoogle = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setConfig(prev => ({ ...prev, googleConnected: true }));
      toast.success("Sincronização com Google Calendar reestabelecida com sucesso!");
    }, 1200);
  };

  return (
    <PageContainer
      title="Configurações da Agenda"
      description="Gerencie a sincronização bidirecional do Google Calendar, geração de salas e alertas aos clientes."
      actions={
        <Button
          onClick={handleSave}
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs bg-[var(--color-primary-blue)] text-white hover:opacity-95"
        >
          <Save className="w-3.5 h-3.5" /> Salvar Preferências
        </Button>
      }
    >
      <div className="max-w-3xl space-y-6">
        {/* Google Calendar */}
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--color-primary-blue)]" /> Conexão Google Calendar & Meet
          </h4>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  {config.googleConnected ? "Google Agenda Conectado e Ativo" : "Google Agenda Desconectado"}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {config.googleConnected
                    ? `Sincronizado com ${user?.email || "conta corporativa"}. Reuniões criadas geram links do Google Meet automaticamente.`
                    : "Conecte sua conta para habilitar sincronização em tempo real."}
                </p>
              </div>
            </div>
            <button
              onClick={handleReconnectGoogle}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-default)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
              {isSyncing ? "Conectando..." : "Reconectar"}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Gerar Sala Google Meet Automaticamente
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  Ao criar uma reunião remota, gera o link único do Google Meet para os participantes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.autoMeetLink}
                onChange={() => handleToggle("autoMeetLink")}
                className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Envio Automático de Convite por E-mail
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  Dispara convite formal do calendário aos e-mails de todos os participantes convidados.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.autoInvite}
                onChange={() => handleToggle("autoInvite")}
                className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>
          </div>
        </div>

        {/* Lembretes e WhatsApp */}
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" /> Mensageria & Notificações aos Clientes
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Disparo de Lembrete via WhatsApp (1h antes)
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  Envia link de acesso à sala e orientações para o WhatsApp do cliente 60 minutos antes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.lembreteWhatsapp}
                onChange={() => handleToggle("lembreteWhatsapp")}
                className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Permitir Auto-Remarcação pelo Cliente
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  Inclui link seguro no convite para o cliente solicitar novo horário em sua grade livre.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.permitirRemarcacao}
                onChange={() => handleToggle("permitirRemarcacao")}
                className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--color-primary-blue)]"
              />
            </label>

            <div className="p-3.5 rounded-xl bg-[var(--color-surface-sunken)]/60 border border-[var(--color-border-subtle)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Antecedência Mínima para Agendamento
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  Tempo mínimo entre o momento do agendamento e o início da reunião.
                </span>
              </div>
              <select
                value={config.antecedenciaMinimaHoras}
                onChange={e => setConfig({ ...config, antecedenciaMinimaHoras: e.target.value })}
                className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="1">1 hora</option>
                <option value="2">2 horas</option>
                <option value="4">4 horas</option>
                <option value="24">24 horas</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
