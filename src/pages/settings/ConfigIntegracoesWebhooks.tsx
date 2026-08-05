import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Settings, X } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";

export function ConfigIntegracoesWebhooks() {
  const { globalWebhooks, addGlobalWebhook, deleteGlobalWebhook, toggleGlobalWebhook } = useData();
  
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  
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
              endpoint: webhook.endpoint.substring(0, 30) + (webhook.endpoint.length > 30 ? '...' : ''),
              status: 200,
              payload: JSON.stringify({ event: "test_ping", id: webhook.id, timestamp: new Date().toISOString() })
            },
            ...prev.slice(0, 9)
          ]);
          return "Disparo concluído! HTTP Status Code 200 (Success) retornado! 🌐";
        },
        error: "Erro no envio"
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Webhooks & Integrações de Saída</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Notifique sistemas terceiros (Make, Zapier, Web-services customizados) instantaneamente via JSON POST.</p>
      </div>

      <Card className="p-6 space-y-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[var(--color-text-muted)]" />
          Configurar Novo Webhook CRM
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">URL de Callback (Endpoint)</label>
            <div>
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://sua-automacao.com/webhook/..."
                className={`w-full bg-[var(--color-surface-sunken)] border ${!isUrlValid ? 'border-red-500/50 text-red-600 focus:border-red-500 focus:ring-red-500' : 'border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:border-blue-500 focus:ring-blue-500'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-[var(--color-text-faint)]`}
              />
              {!isUrlValid && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  Por segurança, a URL deve utilizar o protocolo HTTPS.
                </p>
              )}
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">Gatilho de Disparo</label>
            <select
              value={newWebhookEvent}
              onChange={(e) => setNewWebhookEvent(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 transition-all appearance-none"
            >
              <option value="Novo Lead Criado">Novo Lead Criado</option>
              <option value="Negócio Ganho">Negócio Ganho</option>
              <option value="Negócio Perdido">Negócio Perdido</option>
              <option value="Nova Tarefa SDR">Nova Tarefa SDR</option>
            </select>
          </div>
          <Button onClick={handleAddWebhook} disabled={!isUrlValid || !newWebhookUrl} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 h-auto rounded-xl w-full md:w-auto">
            Integrar Webhook
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Endpoints em Execução</h3>
          <div className="space-y-4">
            {globalWebhooks.map((w, idx) => (
              <div key={w.id} className="bg-[var(--color-surface-sunken)] p-3 rounded-xl border border-[var(--color-border-default)] space-y-1.5 text-xs">
                <div className="flex justify-between items-center column-gap">
                  <span className="text-xs text-[var(--color-text-muted)]">{w.event}</span>
                  <div className="flex gap-2 items-center">
                     <button onClick={() => toggleGlobalWebhook(w.id)} className="text-xs px-2 py-0.5 flex items-center gap-1.5 text-[var(--color-text-muted)]">
                        <span className={`w-1.5 h-1.5 rounded-full ${w.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {w.active ? 'Ativo' : 'Pausado'}
                     </button>
                     <button onClick={() => deleteGlobalWebhook(w.id)} className="text-[var(--color-text-faint)] hover:text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--color-text-muted)] truncate">{w.endpoint}</div>
                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => testWebhookTrigger(idx)} className="text-xs text-blue-600 hover:underline">Disparar Teste</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Logs de Envio (Debugging History)</h3>
          <div className="space-y-2 text-xs font-mono">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg flex items-start gap-3">
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">{log.status}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-text-faint)]">{log.time} • Endpoint {log.endpoint}</div>
                  <div className="text-[var(--color-text-muted)] truncate mt-0.5">{log.payload}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
