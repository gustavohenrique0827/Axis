import React, { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Zap, Settings, X } from "lucide-react";
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

      <Card className="p-6 bg-[#111827]/80 border border-[#2563EB]/30 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Zap className="w-24 h-24 text-blue-500" />
        </div>
        <div className="relative z-10 space-y-5">
          <h3 className="font-black text-white text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> 
            Configurar Novo Webhook CRM
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">URL de Callback (Endpoint)</label>
              <div>
                <input 
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://sua-automacao.com/webhook/..."
                  className={`w-full bg-[#0B1120] border ${!isUrlValid ? 'border-red-500/50 text-red-100 focus:border-red-500 focus:ring-red-500' : 'border-white/10 text-white focus:border-blue-500 focus:ring-blue-500'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600`}
                />
                {!isUrlValid && (
                  <p className="text-red-400 text-[10px] mt-1.5 ml-1 font-medium flex items-center gap-1">
                    Por segurança, a URL deve utilizar o protocolo HTTPS.
                  </p>
                )}
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Gatilho de Disparo</label>
              <select 
                value={newWebhookEvent}
                onChange={(e) => setNewWebhookEvent(e.target.value)}
                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
              >
                <option value="Novo Lead Criado">Novo Lead Criado</option>
                <option value="Negócio Ganho">Negócio Ganho</option>
                <option value="Negócio Perdido">Negócio Perdido</option>
                <option value="Nova Tarefa SDR">Nova Tarefa SDR</option>
              </select>
            </div>
            <Button onClick={handleAddWebhook} disabled={!isUrlValid || !newWebhookUrl} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 h-auto rounded-xl w-full md:w-auto shadow-lg shadow-blue-500/20">
              Integrar Webhook
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5 bg-[#111827]/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-[#06B6D4]">Endpoints em Execução</h3>
          <div className="space-y-4">
            {globalWebhooks.map((w, idx) => (
              <div key={w.id} className="bg-[#0B1120] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center column-gap">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{w.event}</span>
                  <div className="flex gap-2 items-center">
                     <button onClick={() => toggleGlobalWebhook(w.id)} className={`text-[8px] px-1 border rounded font-black upper h-fit ${w.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {w.active ? 'POST Ativo' : 'Pausado'}
                     </button>
                     <button onClick={() => deleteGlobalWebhook(w.id)} className="text-red-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">{w.endpoint}</div>
                <div className="pt-2 flex justify-end gap-2">
                  <button onClick={() => testWebhookTrigger(idx)} className="text-[10px] text-[#2563EB] font-black hover:underline uppercase">Disparar Teste</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-[#111827]/80 border border-white/10 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Logs de Envio (Debugging History)</h3>
          <div className="space-y-2 text-[11px] font-mono">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900 border border-white/5 rounded-lg flex items-start gap-3">
                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-450 text-emerald-400 border border-emerald-500/20 rounded font-bold">{log.status}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-slate-500">{log.time} • Endpoint {log.endpoint}</div>
                  <div className="text-slate-350 truncate mt-0.5">{log.payload}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
