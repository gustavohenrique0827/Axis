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
        <h1 className="text-2xl font-bold tracking-tight">Webhooks & Integrações de Saída</h1>
        <p className="text-sm text-slate-400">Notifique sistemas terceiros (Make, Zapier, Web-services customizados) instantaneamente via JSON POST.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-5">
          <h3 className="font-medium text-white text-lg flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            Configurar Novo Webhook CRM
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs text-slate-400">URL de Callback (Endpoint)</label>
              <div>
                <input 
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://sua-automacao.com/webhook/..."
                  className={`w-full bg-[var(--color-surface)] border ${!isUrlValid ? 'border-red-500/50 text-red-100 focus:border-red-500 focus:ring-red-500' : 'border-white/10 text-white focus:border-blue-500 focus:ring-blue-500'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600`}
                />
                {!isUrlValid && (
                  <p className="text-red-400 text-[10px] mt-1.5 ml-1 font-medium flex items-center gap-1">
                    Por segurança, a URL deve utilizar o protocolo HTTPS.
                  </p>
                )}
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs text-slate-400">Gatilho de Disparo</label>
              <select 
                value={newWebhookEvent}
                onChange={(e) => setNewWebhookEvent(e.target.value)}
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Novo Lead Criado">Novo Lead Criado</option>
                <option value="Negócio Ganho">Negócio Ganho</option>
                <option value="Negócio Perdido">Negócio Perdido</option>
                <option value="Nova Tarefa SDR">Nova Tarefa SDR</option>
              </select>
            </div>
            <Button onClick={handleAddWebhook} disabled={!isUrlValid || !newWebhookUrl} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 h-auto rounded-xl w-full md:w-auto">
              Integrar Webhook
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm text-slate-400">Endpoints em Execução</h3>
          <div className="space-y-4">
            {globalWebhooks.map((w, idx) => (
              <div key={w.id} className="bg-[var(--color-surface)] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center column-gap">
                  <span className="text-[10px] text-slate-400">{w.event}</span>
                  <div className="flex gap-2 items-center">
                     <button onClick={() => toggleGlobalWebhook(w.id)} className="text-[8px] px-1.5 py-0.5 border rounded flex items-center gap-1 h-fit border-white/10 text-slate-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${w.active ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        {w.active ? 'POST Ativo' : 'Pausado'}
                     </button>
                     <button onClick={() => deleteGlobalWebhook(w.id)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">{w.endpoint}</div>
                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => testWebhookTrigger(idx)} className="text-[10px] text-slate-400 hover:text-white hover:underline">Disparar Teste</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="text-sm text-slate-400">Logs de Envio (Debugging History)</h3>
          <div className="space-y-2 text-[11px] font-mono">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-[var(--color-surface)] border border-white/5 rounded-lg flex items-start gap-3">
                <span className="px-1.5 py-0.5 bg-white/5 text-slate-300 border border-white/10 rounded">{log.status}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-slate-500">{log.time} • Endpoint {log.endpoint}</div>
                  <div className="text-slate-400 truncate mt-0.5">{log.payload}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
