import { Brain, Search, Headset, RefreshCcw, LifeBuoy, CalendarClock, LineChart, LayoutDashboard } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, BrandLine, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const CORE_AGENTS = [
  { icon: Brain, name: "Inteligência", text: "Analisa informações, cruza sinais e identifica oportunidades em tempo real." },
  { icon: Search, name: "Prospecção", text: "Encontra e qualifica potenciais compradores antes mesmo do primeiro contato." },
  { icon: Headset, name: "Atendimento", text: "Responde, conduz conversas e mantém o cliente engajado no momento certo." },
];

const SUPPORT_AGENTS = [
  { icon: RefreshCcw, name: "Follow-up", text: "Acompanha oportunidades que ainda não avançaram." },
  { icon: LifeBuoy, name: "Recuperação", text: "Identifica oportunidades perdidas ou esquecidas." },
  { icon: CalendarClock, name: "Agendamento", text: "Conduz o cliente até o próximo compromisso." },
  { icon: LineChart, name: "Análise", text: "Avalia conversas, comportamento e resultados." },
  { icon: LayoutDashboard, name: "Gestão", text: "Transforma dados comerciais em visão para o gestor." },
];

export function AgentesSection() {
  const { theme } = useLpTheme();

  return (
    <Section id="agentes" className="bg-slate-50/70" glow>
      <div className="text-center mb-14">
        <Kicker>Agentes especializados</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">
          Uma inteligência.<br />Vários agentes especializados.
        </SectionTitle>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4 text-center sm:text-left" style={{ fontFamily: FONT_MONO }}>Núcleo do ciclo comercial</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        {CORE_AGENTS.map((a, i) => (
          <FadeIn key={a.name} delay={i * 0.06}>
            <div className="h-full p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm text-white"
                style={{
                  background: theme.id === "green"
                    ? "linear-gradient(135deg, #15803D 0%, #22C55E 50%, #4ADE80 100%)"
                    : theme.heroGradient,
                  boxShadow: `0 4px 12px ${theme.glowColor}33`,
                }}
              >
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>{a.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{a.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4 text-center sm:text-left" style={{ fontFamily: FONT_MONO }}>Agentes de suporte</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        {SUPPORT_AGENTS.map((a, i) => (
          <FadeIn key={a.name} delay={0.18 + i * 0.05}>
            <div className="h-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border"
                style={{
                  background: `${theme.primary}1A`,
                  borderColor: `${theme.primary}33`,
                  color: theme.primaryDark,
                }}
              >
                <a.icon className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-1" style={{ fontFamily: FONT_DISPLAY }}>{a.name}</h3>
              <p className="text-[11px] text-slate-500 leading-snug">{a.text}</p>
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
