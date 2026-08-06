import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Settings, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { apiFetch } from "../../lib/apiClient";

export function ConfigIntegracoesWebhooks() {
  const { globalWebhooks, addGlobalWebhook, deleteGlobalWebhook, toggleGlobalWebhook } = useData();

  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvent, setNewWebhookEvent] = useState("Novo Lead Criado");

  const fetchLogs = () => {
    apiFetch("/api/webhooks/logs")
      .then(res => res.json())
      .then(data => setWebhookLogs(data.logs || []))
      .catch(err => console.error("Failed to fetch webhook logs:", err));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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

  const testWebhookTrigger = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      const res = await apiFetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no disparo de teste.");
      if (data.statusCode && data.statusCode >= 200 && data.statusCode < 300) {
        toast.success(`Disparo concluído! HTTP ${data.statusCode} retornado. 🌐`);
      } else {
        toast.warning(`Endpoint respondeu com status ${data.statusCode || "desconhecido"}.`);
      }
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao disparar o teste do webhook.");
    } finally {
      setTestingId(null);
    }
  };

  const copySecret = (secret?: string) => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    toast.success("Chave secreta copiada.");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Webhooks & Integrações Genéricas</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Conecte qualquer sistema — Make, Zapier, ou até um CRM próprio — via chamadas HTTP simples, nos dois sentidos.</p>
      </div>

      <Card className="p-5 space-y-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Recebendo dados de outro sistema (Entrada)</h3>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          Qualquer sistema (inclusive um CRM próprio) pode enviar ou atualizar leads no Axis via{" "}
          <code className="px-1 py-0.5 bg-[var(--color-surface-sunken)] rounded text-[11px]">POST /api/v1/leads</code>, autenticado com o header{" "}
          <code className="px-1 py-0.5 bg-[var(--color-surface-sunken)] rounded text-[11px]">x-api-key</code>. Envie um{" "}
          <code className="px-1 py-0.5 bg-[var(--color-surface-sunken)] rounded text-[11px]">external_id</code> no corpo para que reenvios atualizem o mesmo lead em vez de duplicar.
          A chave de API desta empresa é configurada pela equipe Axis — fale com o suporte para obter a sua.
        </p>
      </Card>

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
            {globalWebhooks.map((w) => (
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
                {w.secretKey && (
                  <div className="flex items-center gap-1.5 text-[var(--color-text-faint)]">
                    <span>Chave de assinatura (X-Axis-Signature):</span>
                    <span className="font-mono truncate max-w-[120px]">{w.secretKey}</span>
                    <button onClick={() => copySecret(w.secretKey)} className="hover:text-blue-500 shrink-0"><Copy className="w-3 h-3" /></button>
                  </div>
                )}
                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => testWebhookTrigger(w.id)} disabled={testingId === w.id} className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                    {testingId === w.id ? "Disparando..." : "Disparar Teste"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Logs de Envio (Debugging History)</h3>
          <div className="space-y-2 text-xs font-mono">
            {webhookLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-lg flex items-start gap-3">
                <span className={`px-1.5 py-0.5 rounded ${log.status_code >= 200 && log.status_code < 300 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                  {log.status_code || "—"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-text-faint)]">{new Date(log.created_at).toLocaleString('pt-BR')}</div>
                  <div className="text-[var(--color-text-muted)] truncate mt-0.5">{log.payload}</div>
                </div>
              </div>
            ))}
            {webhookLogs.length === 0 && (
              <p className="text-[var(--color-text-faint)] italic">Nenhum disparo registrado ainda.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
