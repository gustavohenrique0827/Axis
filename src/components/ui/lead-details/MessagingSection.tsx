import React, { useState } from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessagingSectionProps {
  leadName: string;
  companyName: string;
  seller: string;
}

export function MessagingSection({ leadName, companyName, seller }: MessagingSectionProps) {
  const [chatChannel, setChatChannel] = useState<'whatsapp' | 'email' | 'instagram'>('whatsapp');
  const [quickMessageText, setQuickMessageText] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ id: string; sender: 'me' | 'client' | 'ai'; text: string; time: string; channel: string }>>([
    { id: '1', sender: 'client', text: "Olá! Vi o anúncio de vocês e queria saber mais sobre a Consultoria.", time: "Hoje, 10:25", channel: "whatsapp" },
    { id: '2', sender: 'ai', text: "Olá! Seja bem-vindo à Axis. Nossos especialistas já receberam seu contato.", time: "Hoje, 10:26", channel: "whatsapp" }
  ]);

  const handleSendQuickMessage = () => {
    if (!quickMessageText.trim()) return;
    const newMsgObj = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: quickMessageText,
      time: "Agora",
      channel: chatChannel
    };
    setChatLog(prev => [...prev, newMsgObj]);
    setQuickMessageText("");
    toast.success(`Mensagem enviada via simulador de ${chatChannel.toUpperCase()}`);

    setTimeout(() => {
      setChatLog(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "💡 [IA Resposta Sugerida] Gostaria de agendar uma demonstração completa para amanhã às 14:00 ou prefere às 16:30?",
        time: "Agora mesmo",
        channel: chatChannel
      }]);
    }, 1000);
  };

  const applyMessageTemplate = (tpl: string) => {
    const formatted = tpl
      .replace("{client}", leadName)
      .replace("{company}", companyName)
      .replace("{seller}", seller || "Carlos");
    setQuickMessageText(formatted);
    toast.info("Template aplicado! Você pode editar antes de simular o envio.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Omnichannel Integrado</h4>
          <div className="flex gap-2">
            {['whatsapp', 'email', 'instagram'].map(ch => (
              <button
                key={ch}
                onClick={() => setChatChannel(ch as any)}
                className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition-colors ${
                  chatChannel === ch ? 'bg-accent/15 text-accent font-bold border border-accent/30' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]'
                }`}
              >
                {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'E-mail' : 'Instagram'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 overflow-y-auto bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-2xl p-4 space-y-3">
          {chatLog.filter(m => m.channel === chatChannel).map(msg => {
            const isMe = msg.sender === 'me';
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                  isMe ? 'bg-[var(--color-primary-blue)] text-white rounded-tr-none' :
                  isAi ? 'bg-accent/10 border border-accent/25 text-accent rounded-tl-none font-medium' :
                  'bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-muted)] rounded-tl-none'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[8px] opacity-50 block mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`Digite uma resposta para enviar via ${chatChannel.toUpperCase()}...`}
            value={quickMessageText}
            onChange={(e) => setQuickMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuickMessage()}
            className="flex-1 h-auto py-2 text-xs"
          />
          <Button onClick={handleSendQuickMessage} className="px-4 font-bold shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Modelos de Resposta Rápida</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            { title: "Apresentação de Solução", text: "Olá {client}! Vi seu interesse na Consultoria Enterprise. Sou a(o) {seller}, consultor principal. Podemos agendar uma chamada rápida de 10 min amanhã?" },
            { title: "SLA Follow-up (3 dias parado)", text: "Oi {client}, tudo bom? Estou reavaliando nosso cronograma de implantação da {company}. Conseguiram analisar nossa minuta?" },
            { title: "Proposta Comercial Direta", text: "Prezado {client}, segue em anexo a proposta oficial do escopo de serviços contratado pela {company}." },
            { title: "Link de Agendamento Cal", text: "Para facilitar nosso alinhamento, {client}, segue meu link de agendamento: calendly.com/{seller}-axis" }
          ].map((tpl, i) => (
            <Card
              key={i}
              onClick={() => applyMessageTemplate(tpl.text)}
              className="p-3 hover:border-accent/40 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <h5 className="text-xs font-black text-accent">{tpl.title}</h5>
              <p className="text-[10.5px] text-[var(--color-text-muted)] truncate mt-1 leading-normal">{tpl.text.replace("{client}", leadName)}</p>
              <span className="text-[8px] text-[var(--color-text-faint)] block mt-1.5 uppercase font-bold">Injetar no editor &rarr;</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
