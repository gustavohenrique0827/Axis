import { Target, CalendarCheck, RefreshCcw, TrendingUp, Percent, Bot } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const METRICS = [
  { icon: Target, label: "Oportunidades identificadas", value: "—" },
  { icon: CalendarCheck, label: "Reuniões agendadas", value: "—" },
  { icon: RefreshCcw, label: "Follow-ups ativos", value: "—" },
  { icon: TrendingUp, label: "Pipeline", value: "—" },
  { icon: Percent, label: "Conversões", value: "—" },
  { icon: Bot, label: "Atividades dos agentes", value: "—" },
];

export function DashboardMockupSection() {
  return (
    <Section id="dashboard" className="bg-slate-50/70">
      <div className="text-center mb-14">
        <Kicker>Visão do gestor</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">
          Você passa a administrar<br className="hidden sm:block" /> uma máquina de oportunidades.
        </SectionTitle>
      </div>

      <FadeIn className="relative">
        <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-transparent blur-3xl max-w-4xl mx-auto" />
        <div className="relative rounded-2xl border border-white/[0.1] bg-[#07080c] overflow-hidden shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <span className="ml-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest" style={{ fontFamily: FONT_DISPLAY }}>
              Axis · Painel Comercial
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {METRICS.map((m) => (
                <div key={m.label} className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <m.icon className="w-4 h-4 text-blue-300 mb-4" />
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1" style={{ fontFamily: FONT_DISPLAY }}>{m.value}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide leading-snug">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-5 uppercase tracking-wider font-bold">Exemplo de visualização</p>
      </FadeIn>
    </Section>
  );
}
