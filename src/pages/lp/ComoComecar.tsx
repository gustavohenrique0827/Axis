import { Link2, Database, Workflow, Sparkles, LineChart } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const STEPS = [
  { icon: Link2, title: "Conecte sua operação", text: "WhatsApp, formulários, e-mail e as ferramentas que você já usa." },
  { icon: Database, title: "Centralize seus dados", text: "Leads, clientes e histórico em um único lugar, sem planilhas soltas." },
  { icon: Workflow, title: "Automatize seus processos", text: "Follow-up, distribuição de leads e tarefas repetitivas saem da sua mão." },
  { icon: Sparkles, title: "Ative a inteligência", text: "A Aurora passa a analisar sua operação e sinalizar o que importa." },
  { icon: LineChart, title: "Tome decisões melhores", text: "Com dados organizados e contexto, menos achismo e mais previsibilidade." },
];

export function ComoComecarSection() {
  return (
    <Section id="como-comecar">
      <div className="text-center mb-14">
        <Kicker>Como começar</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">Do primeiro acesso à operação conectada.</SectionTitle>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-0 relative">
        <div className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300" />
        {STEPS.map((s, i) => (
          <FadeIn key={s.title} delay={i * 0.08} className="lg:px-3">
            <div className="flex flex-col items-center text-center">
              <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center mb-4 shadow-sm">
                <s.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-300 tracking-[0.2em] mb-1.5">PASSO {i + 1}</span>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5" style={{ fontFamily: FONT_DISPLAY }}>{s.title}</h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">{s.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
