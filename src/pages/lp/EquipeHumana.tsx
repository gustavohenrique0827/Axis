import { Eye, Brain, Filter, RefreshCcw, LifeBuoy, CalendarClock, Handshake, Scale, Users, CircleCheck } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, BrandLine, FONT_DISPLAY } from "./shared";

const AXIS_TASKS = [
  { icon: Eye, label: "Observa" },
  { icon: Brain, label: "Analisa" },
  { icon: Filter, label: "Qualifica" },
  { icon: RefreshCcw, label: "Acompanha" },
  { icon: LifeBuoy, label: "Recupera" },
  { icon: CalendarClock, label: "Agenda" },
];

const HUMAN_TASKS = [
  { icon: Handshake, label: "Negocia" },
  { icon: Scale, label: "Decide" },
  { icon: Users, label: "Relaciona" },
  { icon: CircleCheck, label: "Fecha" },
];

export function EquipeHumanaSection() {
  return (
    <Section id="equipe">
      <div className="text-center mb-14">
        <Kicker>Pessoas + inteligência</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">Sua equipe não precisa fazer tudo.</SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          O Axis assume tarefas repetitivas e operacionais. Sua equipe assume negociações complexas,
          relacionamentos estratégicos, decisões importantes e fechamentos que exigem intervenção humana.
        </Lede>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <FadeIn>
          <div className="h-full rounded-2xl border border-blue-200 bg-blue-50/50 p-6 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-5" style={{ fontFamily: FONT_DISPLAY }}>AXIS</p>
            <div className="grid grid-cols-2 gap-3">
              {AXIS_TASKS.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white border border-blue-100 shadow-sm">
                  <t.icon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-5" style={{ fontFamily: FONT_DISPLAY }}>HUMANO</p>
            <div className="grid grid-cols-2 gap-3">
              {HUMAN_TASKS.map((t) => (
                <div key={t.label} className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <t.icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"A tecnologia trabalha. As pessoas fazem o que importa."</BrandLine>
      </div>
    </Section>
  );
}
