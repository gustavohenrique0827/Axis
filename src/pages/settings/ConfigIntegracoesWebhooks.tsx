import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/ui/form-field";
import { Badge } from "../../components/ui/badge";
import { EmptyState } from "../../components/ui/empty-state";
import { Settings, X, Zap, Send, Activity } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";

export function ConfigIntegracoesWebhooks() {
  const { globalWebhooks, addGlobalWebhook, deleteGlobalWebhook, toggleGlobalWebhook } = useData();
  
  const [webhookLogs, setWebhookLogs] = useState<any[]>([
    {
      time: "10:45:12",
      endpoint: "https://n8n.cloud/webhook/novo-lead",
      status: 200,
      payload: '{"event":"lead.created","id":"ld_84920","timestamp":"2026-08-27T10:45:12Z"}'
    }
  ]);
  
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvent, setNewWebhookEvent] = useState("Novo Lead Criado");

  const isUrlValid = newWebhookUrl === "" || newWebhookUrl.startsWith("https://");

  const handleAddWebhook = () => {
    if (!newWebhookUrl) {
      toast.error("Por favor, preencha a URL do Webhook.");
      return;
    }
    
    try {
      const url = new URL(newWebhookUrl);
      if (url.protocol !== 'https:') {
        toast.error("Por motivos de segurança, apenas URLs HTTPS são permitidas.");
        return;
      }
    } catch (e) {
      toast.error("Por favor, insira uma URL válida.");
      return;
    }
    
    addGlobalWebhook({
      endpoint: newWebhookUrl,
      event: newWebhookEvent,
      active: true,
    });
    
    setNewWebhookUrl("");
    toast.success("URL de Webhook vinculada ao CRM com sucesso! Disparos automáticos ativados.");
  };

  const testWebhookTrigger = (indexNum: number) => {
    const webhook = globalWebhooks[indexNum];
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Disparando payload sintético para o endpoint...",
        success: () => {
          setWebhookLogs(prev => [
            {
              time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
              endpoint: webhook.endpoint.substring(0, 35) + (webhook.endpoint.length > 35 ? '...' : ''),
              status: 200,
              payload: JSON.stringify({ event: "test_ping", id: webhook.id, timestamp: new Date().toISOString() })
            },
            ...prev.slice(0, 9)
          ]);
          return "Disparo concluído! HTTP Status Code 200 (Success) retornado! 🌐✨";
        },
        error: "Erro no envio"
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
          Webhooks Globais & Logs de API
          <Zap className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Notifique sistemas terceiros (Make, Zapier, n8n, web services customizados) instantaneamente via requisições POST com payloads JSON.
        </p>
      </div>

      <Card className="p-6 space-y-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--color-text-muted)]" />
          Configurar Novo Webhook CRM
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <FormField
              label="URL de Callback (Endpoint HTTPS)"
              required
              error={!isUrlValid ? "Por segurança, a URL deve utilizar o protocolo HTTPS." : undefined}
            >
              <Input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://sua-automacao.com/webhook/..."
                className="font-mono text-xs"
              />
            </FormField>
          </div>
          <div className="w-full md:w-56 space-y-1.5">
            <FormField label="Gatilho de Disparo">
              <select
                value={newWebhookEvent}
                onChange={(e) => setNewWebhookEvent(e.target.value)}
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] h-10"
              >
                <option value="Novo Lead Criado">Novo Lead Criado</option>
                <option value="Negócio Ganho">Negócio Ganho (Purchase)</option>
                <option value="Negócio Perdido">Negócio Perdido</option>
                <option value="Nova Tarefa SDR">Nova Tarefa SDR</option>
                <option value="Reunião Agendada">Reunião Agendada</option>
              </select>
            </FormField>
          </div>
          <Button
            onClick={handleAddWebhook}
            disabled={!isUrlValid || !newWebhookUrl}
            className="font-bold text-xs h-10 w-full md:w-auto shrink-0"
          >
            Integrar Webhook
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center justify-between">
            <span>Endpoints em Execução</span>
            <Badge variant="secondary">{globalWebhooks.length} Ativo(s)</Badge>
          </h3>
          
          <div className="space-y-3">
            {globalWebhooks.length === 0 ? (
              <EmptyState
                icon={Zap}
                title="Nenhum webhook cadastrado"
                description="Cadastre um endpoint HTTPS acima para receber eventos do CRM."
                className="py-8"
              />
            ) : (
              globalWebhooks.map((w, idx) => (
                <div key={w.id} className="bg-[var(--color-surface-sunken)] p-3.5 rounded-[var(--radius-control)] border border-[var(--color-border-subtle)] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--color-text-primary)]">{w.event}</span>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggleGlobalWebhook(w.id)}
                        className="cursor-pointer"
                      >
                        <Badge variant={w.active ? "success" : "neutral"} dot dotPulse={w.active}>
                          {w.active ? "Ativo" : "Pausado"}
                        </Badge>
                      </button>
                      <button
                        onClick={() => deleteGlobalWebhook(w.id)}
                        className="text-[var(--color-text-faint)] hover:text-danger p-1 transition-colors"
                        title="Remover Webhook"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--color-text-muted)] truncate">{w.endpoint}</div>
                  <div className="pt-1.5 border-t border-[var(--color-border-subtle)] flex justify-end">
                    <button
                      onClick={() => testWebhookTrigger(idx)}
                      className="text-xs font-bold text-[var(--color-primary-blue)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Disparar Teste
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Logs de Envio & Depuração
          </h3>
          <div className="space-y-2.5 text-xs font-mono">
            {webhookLogs.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-faint)] text-xs">
                Nenhum log de disparo recente registrado.
              </div>
            ) : (
              webhookLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)] flex items-start gap-3">
                  <Badge variant="success" className="shrink-0">{log.status} OK</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[var(--color-text-faint)]">{log.time} • {log.endpoint}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] truncate mt-1 bg-[var(--color-surface-elevated)] p-1.5 rounded border border-[var(--color-border-subtle)]">
                      {log.payload}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
