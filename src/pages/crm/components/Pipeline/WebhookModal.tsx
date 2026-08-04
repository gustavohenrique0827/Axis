import React from 'react';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookModalProps {
  webhookModalLead: any;
  setWebhookModalLead: (lead: any) => void;
  webhookUrl: string;
  setWebhookUrl: (v: string) => void;
}

export function WebhookModal({
  webhookModalLead,
  setWebhookModalLead,
  webhookUrl,
  setWebhookUrl
}: WebhookModalProps) {
  if (!webhookModalLead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-150">
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-left ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <button onClick={() => setWebhookModalLead(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
          ✕
        </button>
        <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" /> Webhook SDR para Closer
        </h3>
        <p className="text-xs text-slate-400 mb-6">Configurar URL de webhook (n8n/Zapier) para automação da passagem de bastão do lead <strong className="text-white">{webhookModalLead.name}</strong>.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Endpoint URL (POST)</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://sua-url-do-webhook.com"
              className="w-full bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
            />
          </div>

          <button
            onClick={() => {
               if(webhookUrl) {
                 toast.success("Webhook configurado com sucesso e passagem processada!");
                 setWebhookModalLead(null);
                 setWebhookUrl("");
               } else {
                 toast.error("Informe uma URL válida.");
               }
            }}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-xl transition-colors cursor-pointer text-sm"
          >
            Salvar e Ativar Automação
          </button>
        </div>
      </div>
    </div>
  );
}
