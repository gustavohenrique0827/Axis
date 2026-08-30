import { Radar, Brain, Target, Zap } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY, FONT_MONO } from "./shared";

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
    <Section id="como-funciona" glow>
      <div className="text-center mb-16">
        <Kicker>Como funciona</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">O Axis encontra, entende e age.</SectionTitle>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.1} className={i % 2 === 1 ? "lg:mt-9" : ""}>
            <div className="group relative h-full flex flex-col p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-blue-300">
                  <s.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 tracking-[0.2em]" style={{ fontFamily: FONT_MONO }}>{s.n}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
