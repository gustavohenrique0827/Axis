import { Radar, Brain, Target, Zap } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const STEPS = [
  {
    n: "01",
    icon: Radar,
    title: "Percebe",
    text: "Recebe sinais de WhatsApp, CRM, marketing, reuniões, campanhas, clientes, propostas e outros dados.",
  },
  {
    n: "02",
    icon: Brain,
    title: "Entende",
    text: "Interpreta intenção, urgência, orçamento, autoridade, problema, objeções, contexto e momento da compra.",
  },
  {
    n: "03",
    icon: Target,
    title: "Decide",
    text: "Define prioridade, próxima melhor ação e quando uma situação precisa de intervenção humana.",
  },
  {
    n: "04",
    icon: Zap,
    title: "Age",
    text: "Pode responder, qualificar, fazer follow-up, agendar, criar tarefas, recuperar oportunidades e encaminhar situações.",
  },
];

export function ComoFuncionaSection() {
  return (
    <Section id="como-funciona">
      <div className="text-center mb-16">
        <Kicker>Como funciona</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">O Axis encontra, entende e age.</SectionTitle>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        {STEPS.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.1}>
            <div className="relative flex flex-col items-center text-center px-4">
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 border border-blue-400/25 flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-blue-300" />
              </div>
              <span className="text-[11px] font-black text-slate-600 tracking-[0.2em] mb-2">{s.n}</span>
              <h3 className="text-lg font-bold text-white mb-2.5" style={{ fontFamily: FONT_DISPLAY }}>{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
