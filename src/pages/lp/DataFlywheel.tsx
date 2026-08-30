import { MessageSquare, Megaphone, CalendarCheck, Database, FileText, Users, BarChart3 } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, GlassCard, FONT_DISPLAY } from "./shared";

const INPUTS = [
  { icon: MessageSquare, label: "WhatsApp" },
  { icon: Megaphone, label: "Marketing" },
  { icon: CalendarCheck, label: "Reuniões" },
  { icon: Database, label: "CRM" },
  { icon: FileText, label: "Propostas" },
  { icon: Users, label: "Clientes" },
  { icon: BarChart3, label: "Dados" },
];

export function DataFlywheelSection() {
  return (
    <Section id="flywheel" className="bg-slate-50/70" glow>
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
        <div>
          <Kicker>O ciclo de inteligência</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
            Tudo o que acontece na sua operação alimenta a inteligência.
          </SectionTitle>
          <Lede className="text-base sm:text-lg max-w-md">
            Quanto mais informações relevantes entram na operação, mais contexto a inteligência possui para
            analisar oportunidades e orientar os próximos movimentos.
          </Lede>
        </div>

        <FadeIn delay={0.1}>
          <GlassCard className="p-6 sm:p-8">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-6">
              {INPUTS.map((inp) => (
                <div
                  key={inp.label}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                >
                  <inp.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight">{inp.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-300" />
              <div className="w-1.5 h-1.5 rotate-45 bg-violet-400 shrink-0" />
            </div>

            <div className="relative mb-6">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-xl" />
              <div className="relative py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20 text-center">
                <span className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: FONT_DISPLAY }}>
                  AXIS INTELLIGENCE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rotate-45 bg-emerald-500 shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-transparent" />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {["Decisão", "Ação", "Resultado"].map((o) => (
                <span
                  key={o}
                  className="py-2.5 rounded-lg bg-white border border-slate-200 shadow-sm text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center"
                >
                  {o}
                </span>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </Section>
  );
}
