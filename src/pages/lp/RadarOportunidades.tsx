import { MessageCircle, PauseCircle, Users2, FileX, CalendarX, TrendingUp, ArrowUpRight } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, BrandLine, FONT_DISPLAY } from "./shared";

const LEAD = {
  icon: MessageCircle,
  label: "Conversas antigas",
  text: "Uma conversa que parou de responder pode conter exatamente o contexto que falta para reabrir a oportunidade.",
};

const REGULAR = [
  { icon: PauseCircle, label: "Leads parados" },
  { icon: Users2, label: "Clientes existentes" },
  { icon: FileX, label: "Propostas esquecidas" },
  { icon: CalendarX, label: "Reuniões sem follow-up" },
];

const BANNER = { icon: TrendingUp, label: "Sinais de expansão", text: "Clientes que já compraram costumam ser a fonte mais barata da próxima venda." };

function ChipCard({ icon: Icon, label }: { icon: typeof MessageCircle; label: string }) {
  return (
    <div className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-md transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
        <Icon className="w-4.5 h-4.5 text-blue-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export function RadarOportunidadesSection() {
  return (
    <Section id="radar" glow>
      <div className="text-center mb-14">
        <Kicker>Radar de oportunidades</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Talvez sua próxima venda<br className="hidden sm:block" /> já esteja dentro da sua operação.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          Uma oportunidade pode estar escondida em uma conversa antiga, em um lead que parou de responder,
          em um cliente que já comprou, em uma proposta esquecida ou em uma reunião que nunca teve follow-up.
        </Lede>
      </div>

      <div className="space-y-4 mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          <FadeIn className="sm:col-span-2">
            <div className="group h-full flex flex-col justify-center gap-3 p-6 sm:p-7 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                <LEAD.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>{LEAD.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md">{LEAD.text}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.06}>
            <ChipCard icon={REGULAR[0].icon} label={REGULAR[0].label} />
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {REGULAR.slice(1).map((c, i) => (
            <FadeIn key={c.label} delay={0.12 + i * 0.06}>
              <ChipCard icon={c.icon} label={c.label} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="group flex items-center justify-between gap-4 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <BANNER.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5" style={{ fontFamily: FONT_DISPLAY }}>{BANNER.label}</h3>
                <p className="text-[13px] text-slate-400 leading-snug hidden sm:block">{BANNER.text}</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
          </div>
        </FadeIn>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"O Axis encontra sinais e os transforma em oportunidades com contexto e próxima ação."</BrandLine>
      </div>
    </Section>
  );
}
