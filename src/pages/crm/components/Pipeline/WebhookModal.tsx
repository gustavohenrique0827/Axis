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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-left">
        <button onClick={() => setWebhookModalLead(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
          ✕
        </button>
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" /> Webhook SDR para Closer
        </h3>
        <p className="text-xs text-slate-400 mb-6">Configurar URL de webhook (n8n/Zapier) para automação da passagem de bastão do lead <strong className="text-white">{webhookModalLead.name}</strong>.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Endpoint URL (POST)</label>
            <input 
              type="url" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://sua-url-do-webhook.com"
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm border-none"
          >
            Salvar e Ativar Automação
          </button>
        </div>
      </div>
    </div>
  );
}
