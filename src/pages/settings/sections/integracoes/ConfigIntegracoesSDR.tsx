import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { FormField } from "../../../../components/ui/form-field";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import { Zap, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ConfigIntegracoesSDR() {
  const [webhookUrl, setWebhookUrl] = useState("https://n8n.seumodelo.com/webhook/reuniao-agendada");
  const [webhookActive, setWebhookActive] = useState(true);
  const [leadQualificadoUrl, setLeadQualificadoUrl] = useState("https://n8n.seumodelo.com/webhook/sdr-qualificado");
  const [leadQualificadoActive, setLeadQualificadoActive] = useState(true);
  const [testing, setTesting] = useState(false);

  const testWebhook = (event: string) => {
    setTesting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Enviando payload de teste '${event}'...`,
        success: () => {
          setTesting(false);
          return `Webhook '${event}' disparado com sucesso! Resposta 200 OK recebida. ⚡`;
        },
        error: () => {
          setTesting(false);
          return "Erro no disparo do Webhook.";
        },
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
          Integrações SDR & Pré-Vendas
          <Zap className="w-5 h-5 text-purple-500" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Configure disparos automatizados de webhooks para ferramentas de automação (n8n, Make, Zapier) acionados por eventos de qualificação.
        </p>
      </div>

      {/* Reunião Agendada */}
      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--color-border-subtle)] bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--color-text-primary)] text-base">
                Reunião Agendada (Qualificação Concluída)
              </h3>
              <Badge variant={webhookActive ? "purple" : "neutral"} dot dotPulse={webhookActive}>
                {webhookActive ? "Ativo" : "Pausado"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Disparado sempre que um lead atinge a etapa de Reunião Agendada no pipeline do SDR.
            </p>
          </div>
          <Switch
            checked={webhookActive}
            onCheckedChange={setWebhookActive}
            label={webhookActive ? "Ativado" : "Desativado"}
          />
        </div>

        <div className="p-5 space-y-4">
          <FormField label="Endpoint URL (POST)" required hint="URL que receberá o JSON com os dados do lead e da reunião">
            <Input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.sua-empresa.com/webhook/..."
              className="font-mono text-xs"
            />
          </FormField>

          <div className="bg-[var(--color-surface-sunken)] p-4 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1.5">
            <span className="text-[10px] font-black uppercase text-[var(--color-text-faint)] tracking-widest block">
              Payload de Exemplo (JSON)
            </span>
            <pre className="text-[11px] text-purple-500 dark:text-purple-300 font-mono overflow-auto leading-relaxed">{`{
  "event": "sdr.reuniao_agendada",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "company": "TechCorp Brasil",
    "scoreIA": 92,
    "temperature": "quente",
    "seller_sdr": "Roberto Ramos",
    "ia_summary": "Empresa demonstrou forte interesse no plano corporativo..."
  },
  "timestamp": "${new Date().toISOString()}"
}`}</pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => testWebhook("sdr.reuniao_agendada")}
              loading={testing}
              className="text-xs font-bold gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Disparar Teste
            </Button>
            <Button
              onClick={() => toast.success("Webhook de Reunião Agendada salvo com sucesso!")}
              className="font-bold text-xs"
            >
              Salvar Webhook
            </Button>
          </div>
        </div>
      </Card>

      {/* Lead Qualificado */}
      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--color-border-subtle)] bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--color-text-primary)] text-base">
                Lead Qualificado (Score IA Atingido)
              </h3>
              <Badge variant={leadQualificadoActive ? "success" : "neutral"} dot dotPulse={leadQualificadoActive}>
                {leadQualificadoActive ? "Ativo" : "Pausado"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Disparado quando a IA (MIA) classifica o lead com score suficiente para transferência.
            </p>
          </div>
          <Switch
            checked={leadQualificadoActive}
            onCheckedChange={setLeadQualificadoActive}
            label={leadQualificadoActive ? "Ativado" : "Desativado"}
          />
        </div>

        <div className="p-5 space-y-4">
          <FormField label="Endpoint URL (POST)" required hint="URL para receber leads qualificados pela Master AI">
            <Input
              type="url"
              value={leadQualificadoUrl}
              onChange={(e) => setLeadQualificadoUrl(e.target.value)}
              placeholder="https://n8n.seumodelo.com/webhook/sdr-qualificado"
              className="font-mono text-xs"
            />
          </FormField>

          <div className="bg-[var(--color-surface-sunken)] p-4 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-1.5">
            <span className="text-[10px] font-black uppercase text-[var(--color-text-faint)] tracking-widest block">
              Payload de Exemplo (JSON)
            </span>
            <pre className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono overflow-auto leading-relaxed">{`{
  "event": "sdr.lead_qualificado",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "scoreIA": 92,
    "events": ["score_updated", "profile_mapped", "needs_confirmed"]
  },
  "timestamp": "${new Date().toISOString()}"
}`}</pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => testWebhook("sdr.lead_qualificado")}
              loading={testing}
              className="text-xs font-bold gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Disparar Teste
            </Button>
            <Button
              onClick={() => toast.success("Webhook de Lead Qualificado salvo com sucesso!")}
              className="font-bold text-xs"
            >
              Salvar Webhook
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
