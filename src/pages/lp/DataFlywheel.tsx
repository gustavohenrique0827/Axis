import { MessageSquare, Megaphone, CalendarCheck, Database, FileText, Users, BarChart3 } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, FONT_DISPLAY } from "./shared";

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
    <Section id="flywheel" className="bg-white/[0.015]">
      <div className="text-center mb-14">
        <Kicker>O ciclo de inteligência</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Tudo o que acontece na sua operação<br className="hidden sm:block" /> alimenta a inteligência.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          Quanto mais informações relevantes entram na operação, mais contexto a inteligência possui para
          analisar oportunidades e orientar os próximos movimentos.
        </Lede>
      </div>

      <FadeIn>
        <div className="flex flex-col items-center gap-10">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 w-full max-w-3xl">
            {INPUTS.map((inp) => (
              <div key={inp.label} className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <inp.icon className="w-5 h-5 text-blue-300" />
                <span className="text-[10px] font-semibold text-slate-400 text-center">{inp.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-px h-8 bg-gradient-to-b from-blue-500/40 to-violet-500/60" />
            <div className="w-2 h-2 rotate-45 bg-violet-400" />
          </div>

          <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500/15 to-violet-500/15 border border-blue-400/25">
            <span className="text-sm sm:text-base font-bold text-white tracking-wide" style={{ fontFamily: FONT_DISPLAY }}>
              AXIS INTELLIGENCE
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-px h-8 bg-gradient-to-b from-violet-500/60 to-emerald-400/40" />
            <div className="w-2 h-2 rotate-45 bg-emerald-400" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Decisão", "Ação", "Resultado"].map((o) => (
              <span key={o} className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-bold text-slate-200 uppercase tracking-wider">
                {o}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
