import React from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Send } from "lucide-react";

interface ChatSectionProps {
  chatChannel: 'whatsapp' | 'email' | 'instagram';
  setChatChannel: (val: 'whatsapp' | 'email' | 'instagram') => void;
  chatLog: Array<{ id: string; sender: 'me' | 'client' | 'ai'; text: string; time: string; channel: string }>;
  quickMessageText: string;
  setQuickMessageText: (val: string) => void;
  handleSendQuickMessage: () => void;
  applyMessageTemplate: (tpl: string) => void;
  leadName: string;
}

export function ChatSection({
  chatChannel,
  setChatChannel,
  chatLog,
  quickMessageText,
  setQuickMessageText,
  handleSendQuickMessage,
  applyMessageTemplate,
  leadName
}: ChatSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-4 border-white/10 bg-[var(--color-surface)]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Omnichannel Integrado</h4>
          <div className="flex gap-2">
            {['whatsapp', 'email', 'instagram'].map(ch => (
              <button 
                key={ch}
                onClick={() => setChatChannel(ch as any)}
                className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition-colors ${
                  chatChannel === ch ? 'bg-cyan-500/15 text-[#06B6D4] font-bold border border-cyan-400/20' : 'bg-[var(--color-surface-elevated)] text-slate-500'
                }`}
              >
                {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'E-mail' : 'Instagram'}
              </button>
            ))}
          </div>
        </div>

        {/* Messaging Live Simulator Sandbox */}
        <div className="h-64 overflow-y-auto bg-[var(--color-surface-elevated)] border border-white/5 rounded-2xl p-4 space-y-3">
          {chatLog.filter(m => m.channel === chatChannel).map(msg => {
            const isMe = msg.sender === 'me';
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 
                  isAi ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 rounded-tl-none font-medium' :
                  'bg-[var(--color-surface)] border border-white/5 text-slate-400 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[8px] opacity-50 block mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat message composer */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder={`Digite uma resposta para enviar via ${chatChannel.toUpperCase()}...`}
            value={quickMessageText}
            onChange={(e) => setQuickMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuickMessage()}
            className="flex-1 bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
          />
          <Button onClick={handleSendQuickMessage} className="bg-[#2563EB] text-white hover:bg-blue-600 px-4 font-bold shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Templates shortcuts */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Modelos de Resposta Rápida</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            { title: "Apresentação de Solução", text: "Olá {client}! Vi seu interesse na Consultoria Enterprise. Sou a(o) {seller}, consultor principal. Podemos agendar uma chamada rápida de 10 min amanhã?" },
            { title: "SLA Follow-up (3 dias parado)", text: "Oi {client}, tudo bom? Estou reavaliando nosso cronograma de implantação da {company}. Conseguiram analisar nossa minuta?" },
            { title: "Proposta Comercial Direta", text: "Prezado {client}, segue em anexo a proposta oficial do escopo de serviços contratado pela {company} no valor de {value}." },
            { title: "Link de Agendamento Cal", text: "Para facilitar nosso alinhamento, {client}, segue meu link de agendamento: calendly.com/{seller}-axis" }
          ].map((tpl, i) => (
            <Card 
              key={i} 
              onClick={() => applyMessageTemplate(tpl.text)}
              className="p-3 bg-[var(--color-surface)] border-white/5 hover:border-cyan-500/20 rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
            >
              <h5 className="text-xs font-black text-[#06B6D4]">{tpl.title}</h5>
              <p className="text-[10.5px] text-slate-400 truncate mt-1 leading-normal">{tpl.text.replace("{client}", leadName)}</p>
              <span className="text-[8px] text-slate-500 block mt-1.5 uppercase font-bold">Injetar no editor &rarr;</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
