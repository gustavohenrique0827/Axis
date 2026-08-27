import React, { useState } from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { Send, MessageSquare } from "lucide-react";
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
    { id: '1', sender: 'client', text: "Olá! Gostaria de entender melhor como funciona a implementação do Axis.", time: "Hoje, 10:25", channel: "whatsapp" },
    { id: '2', sender: 'ai', text: "Olá! Seja bem-vindo à Axis. Nossa equipe comercial já está pronta para atendê-lo.", time: "Hoje, 10:26", channel: "whatsapp" }
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
    toast.success(`Mensagem disparada via ${chatChannel.toUpperCase()}`);

    setTimeout(() => {
      setChatLog(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "💡 [Sugestão IA] Podemos agendar uma demonstração executiva para amanhã às 14h?",
        time: "Agora mesmo",
        channel: chatChannel
      }]);
    }, 1000);
  };

  const applyMessageTemplate = (tpl: string) => {
    const formatted = tpl
      .replace("{client}", leadName)
      .replace("{company}", companyName)
      .replace("{seller}", seller || "Consultor");
    setQuickMessageText(formatted);
    toast.info("Modelo inserido no campo de envio.");
  };

  return (
    <div className="px-5 py-4 space-y-4 animate-in fade-in duration-200">
      <Card className="p-4 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary-blue)]">
            Comunicação Integrada
          </h4>
          <div className="flex gap-1.5">
            {[
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'email', label: 'E-mail' },
              { id: 'instagram', label: 'Instagram' }
            ].map(ch => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChatChannel(ch.id as any)}
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                  chatChannel === ch.id
                    ? 'bg-[var(--color-primary-blue)] text-white shadow-sm'
                    : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-60 overflow-y-auto bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)] p-3.5 space-y-2.5">
          {chatLog.filter(m => m.channel === chatChannel).map(msg => {
            const isMe = msg.sender === 'me';
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                  isMe ? 'bg-[var(--color-primary-blue)] text-white rounded-tr-none' :
                  isAi ? 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 rounded-tl-none font-medium' :
                  'bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-tl-none shadow-sm'
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-60 block mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={`Escreva uma mensagem para ${chatChannel.toUpperCase()}...`}
            value={quickMessageText}
            onChange={(e) => setQuickMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuickMessage()}
            className="flex-1 text-xs"
          />
          <Button onClick={handleSendQuickMessage} className="px-3.5 font-bold shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="space-y-2.5">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
          Modelos Rápidos de Resposta
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { title: "Apresentação Comercial", text: "Olá {client}! Vi seu interesse em nossa solução. Sou o(a) {seller}. Podemos agendar uma chamada rápida de 10 min amanhã?" },
            { title: "Follow-up de Proposta", text: "Oi {client}, tudo bem? Estou revisando o planejamento da {company}. Conseguiram analisar a proposta que enviamos?" },
            { title: "Envio de Minuta / Escopo", text: "Prezado {client}, segue o escopo dos serviços discutidos para a {company}." },
            { title: "Link de Agendamento", text: "Para facilitar nosso alinhamento, {client}, segue meu calendário: calendly.com/{seller}-axis" }
          ].map((tpl, i) => (
            <Card
              key={i}
              onClick={() => applyMessageTemplate(tpl.text)}
              className="p-3 hover:border-[var(--color-primary-blue)]/50 transition-all cursor-pointer bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]"
            >
              <h5 className="text-xs font-bold text-[var(--color-text-primary)]">{tpl.title}</h5>
              <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-1">{tpl.text.replace("{client}", leadName)}</p>
              <span className="text-[9px] text-[var(--color-primary-blue)] font-bold block mt-1 uppercase">Usar modelo &rarr;</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
