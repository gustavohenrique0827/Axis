import { Brain, Search, Headset, RefreshCcw, LifeBuoy, CalendarClock, LineChart, LayoutDashboard } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, BrandLine, FONT_DISPLAY } from "./shared";

const AGENTS = [
  { icon: Brain, name: "Inteligência", text: "Analisa informações e identifica oportunidades." },
  { icon: Search, name: "Prospecção", text: "Encontra e qualifica potenciais compradores." },
  { icon: Headset, name: "Atendimento", text: "Responde e conduz conversas." },
  { icon: RefreshCcw, name: "Follow-up", text: "Acompanha oportunidades que ainda não avançaram." },
  { icon: LifeBuoy, name: "Recuperação", text: "Identifica oportunidades perdidas ou esquecidas." },
  { icon: CalendarClock, name: "Agendamento", text: "Conduz o cliente até o próximo compromisso." },
  { icon: LineChart, name: "Análise", text: "Avalia conversas, comportamento e resultados." },
  { icon: LayoutDashboard, name: "Gestão", text: "Transforma dados comerciais em visão para o gestor." },
];

export function AgentesSection() {
  return (
    <Section id="agentes" className="bg-white/[0.015]">
      <div className="text-center mb-14">
        <Kicker>Agentes especializados</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">
          Uma inteligência.<br />Vários agentes especializados.
        </SectionTitle>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {AGENTS.map((a, i) => (
          <FadeIn key={a.name} delay={i * 0.05}>
            <div className="h-full p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-400/25 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/10 border border-blue-400/20 flex items-center justify-center mb-4">
                <a.icon className="w-4.5 h-4.5 text-blue-300" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 uppercase tracking-wide" style={{ fontFamily: FONT_DISPLAY }}>{a.name}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">{a.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"O Axis não precisa substituir seus vendedores. Ele pode potencializar cada um deles."</BrandLine>
      </div>
    </Section>
  );
}
