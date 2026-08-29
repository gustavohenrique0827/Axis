import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section, Kicker, SectionTitle } from "./shared";

const FAQS = [
  {
    q: "O Axis é um CRM?",
    a: "Sim. O Axis possui recursos de CRM, mas sua proposta vai além do armazenamento e gestão de contatos. Ele utiliza inteligência para identificar e agir sobre oportunidades.",
  },
  {
    q: "O Axis funciona pelo WhatsApp?",
    a: "Sim, o WhatsApp pode fazer parte da operação do Axis, conforme a configuração e integração utilizada.",
  },
  {
    q: "A inteligência pode conversar com meus clientes?",
    a: "Nos cenários com agentes autônomos, a inteligência pode participar de conversas e executar etapas comerciais seguindo as regras definidas pela empresa.",
  },
  {
    q: "Posso usar minha própria API da OpenAI ou Gemini?",
    a: "Sim. A arquitetura pode permitir que a empresa utilize sua própria API de inteligência artificial.",
  },
  {
    q: "A IA pode fechar vendas sozinha?",
    a: "Depende da configuração da operação. O Axis pode executar etapas comerciais automaticamente, enquanto situações que exigem intervenção podem ser encaminhadas para uma pessoa.",
  },
  {
    q: "Preciso substituir minha equipe?",
    a: "Não. O Axis pode trabalhar junto com sua equipe, assumindo tarefas operacionais e entregando contexto e oportunidades para os vendedores.",
  },
  {
    q: "O consumo de IA está incluído?",
    a: "Cada plano possui uma franquia de utilização. O consumo adicional pode ser contratado conforme a utilização.",
  },
  {
    q: "O Axis serve para qualquer empresa?",
    a: "O Axis pode atender diferentes operações comerciais. O maior potencial aparece em empresas que possuem volume de leads, atendimento, vendas consultivas ou processos comerciais que precisam de acompanhamento.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <div className="text-center mb-14">
        <Kicker>Perguntas frequentes</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">Perguntas frequentes.</SectionTitle>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm sm:text-[15px] font-semibold text-slate-900">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-500 leading-relaxed">{f.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
