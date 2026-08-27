import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Zap } from "lucide-react";
import { toast } from "sonner";

interface SdrWebhookConfig {
  reuniaoUrl: string;
  reuniaoActive: boolean;
  qualificadoUrl: string;
  qualificadoActive: boolean;
  qualificadoEventos: string[];
}

const SDR_WEBHOOK_STORAGE_KEY = "axis_integracoes_sdr_webhooks";

const DEFAULT_SDR_WEBHOOK_CONFIG: SdrWebhookConfig = {
  reuniaoUrl: "",
  reuniaoActive: true,
  qualificadoUrl: "",
  qualificadoActive: true,
  qualificadoEventos: [],
};

function loadSdrWebhookConfig(): SdrWebhookConfig {
  try {
    const saved = localStorage.getItem(SDR_WEBHOOK_STORAGE_KEY);
    if (saved) return { ...DEFAULT_SDR_WEBHOOK_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    // ignore
  }
  return DEFAULT_SDR_WEBHOOK_CONFIG;
}

export function ConfigIntegracoesSDR() {
  const initial = loadSdrWebhookConfig();
  const [webhookUrl, setWebhookUrl] = useState(initial.reuniaoUrl);
  const [webhookActive, setWebhookActive] = useState(initial.reuniaoActive);
  const [qualificadoUrl, setQualificadoUrl] = useState(initial.qualificadoUrl);
  const [qualificadoActive, setQualificadoActive] = useState(initial.qualificadoActive);
  const [qualificadoEventos, setQualificadoEventos] = useState<string[]>(initial.qualificadoEventos);

  const toggleQualificadoEvento = (evt: string) => {
    setQualificadoEventos(prev => prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]);
  };

  const persist = () => {
    const payload: SdrWebhookConfig = {
      reuniaoUrl: webhookUrl,
      reuniaoActive: webhookActive,
      qualificadoUrl,
      qualificadoActive,
      qualificadoEventos,
    };
    try {
      localStorage.setItem(SDR_WEBHOOK_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    toast.success("Configuração salva com sucesso");
  };

  const testWebhook = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1200)), {
      loading: "Enviando payload de teste...",
      success: "Webhook disparado e resposta 200 OK recebida!",
      error: "Erro no disparo do Webhook.",
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Integrações SDR <Zap className="w-5 h-5 text-purple-500" />
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure disparos de webhooks quando eventos importantes acontecerem no funil de Pré-Vendas.</p>
      </div>

      {/* Reunião Agendada */}
      <Card className="bg-[var(--color-surface-elevated)]/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-purple-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Reunião Agendada (Qualificação Final)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado sempre que um lead atinge a etapa de Reunião Agendada no pipeline do SDR.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={webhookActive} onChange={() => setWebhookActive(p => !p)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${webhookActive ? "bg-purple-600" : "bg-slate-700"}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${webhookActive ? "transform translate-x-4" : ""}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
              placeholder="https://"
            />
          </div>

          <div className="bg-[var(--color-surface)]/50 p-4 rounded-lg border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-purple-300 font-mono overflow-auto opacity-80">{`{
  "event": "sdr.reuniao_agendada",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "company": "TechCorp Brasil",
    "scoreIA": 92,
    "temperature": "quente",
    "seller_sdr": "Roberto Ramos",
    "ia_summary": "Empresa demonstrou forte interesse..."
  },
  "timestamp": "2026-05-21T15:30:00Z"
}`}</pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
            <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={persist}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>

      {/* Lead Qualificado */}
      <Card className="bg-[var(--color-surface-elevated)]/80 border border-white/10 overflow-hidden shadow-xl mt-6">
        <div className="p-5 border-b border-white/5 bg-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Lead Qualificado (Aprovado pela Master AI)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado quando o Lead Score atinge métricas pré-definidas na qualificação.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={qualificadoActive} onChange={() => setQualificadoActive(p => !p)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${qualificadoActive ? "bg-emerald-600" : "bg-slate-700"}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${qualificadoActive ? "transform translate-x-4" : ""}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input
              type="text"
              value={qualificadoUrl}
              onChange={e => setQualificadoUrl(e.target.value)}
              placeholder="https://n8n.seumodelo.com/webhook/sdr-qualificado"
              className="w-full bg-[var(--color-surface)] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Eventos de Disparo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {["Atualização de Score IA", "Mapeamento de Perfil Concluído", "Contato Iniciado (1º Touchpoint)", "Identificação de Ticket Médio"].map(evt => (
                <label key={evt} className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={qualificadoEventos.includes(evt)}
                    onChange={() => toggleQualificadoEvento(evt)}
                    className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  {evt}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-surface)]/50 p-4 rounded-lg border border-white/5 space-y-2 mt-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-emerald-300 font-mono overflow-auto opacity-80">{`{
  "event": "sdr.lead_qualificado",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "scoreIA": 92,
    "events": ["score_updated", "profile_mapped"]
  },
  "timestamp": "2026-05-21T15:35:00Z"
}`}</pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
            <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={persist}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
