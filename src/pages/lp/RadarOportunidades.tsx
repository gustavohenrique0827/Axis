import { MessageCircle, PauseCircle, Users2, FileX, CalendarX, TrendingUp, ArrowUpRight } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, BrandLine, FONT_DISPLAY } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

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

const PATTERNS = [
  "Detectamos uma queda na conversão",
  "Identificamos leads sem acompanhamento",
  "Encontramos gargalos no processo comercial",
  "Identificamos oportunidades de recuperação",
  "Sugerimos próximas ações",
];

function ChipCard({ icon: Icon, label }: { icon: typeof MessageCircle; label: string }) {
  const { theme } = useLpTheme();
  return (
    <div className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div
        className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors duration-300"
        style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}35` }}
      >
        <Icon className="w-4.5 h-4.5 transition-colors duration-300" style={{ color: theme.primaryDark }} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export function RadarOportunidadesSection() {
  const { theme } = useLpTheme();

  return (
    <Section id="radar" glow>
      <div className="text-center mb-14">
        <Kicker>Radar de oportunidades</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Talvez sua próxima venda<br className="hidden sm:block" /> já esteja dentro da sua operação.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg mb-7">
          Uma oportunidade pode estar escondida em uma conversa antiga, em um lead que parou de responder,
          em um cliente que já comprou, em uma proposta esquecida ou em uma reunião que nunca teve follow-up.
        </Lede>
        <p className="text-base sm:text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: FONT_DISPLAY }}>
          O S.P.Y. não apenas mostra dados. Ele encontra padrões.
        </p>
        <FadeIn className="flex flex-wrap items-center justify-center gap-2">
          {PATTERNS.map((p) => (
            <span key={p} className={`px-3.5 py-2 rounded-full text-[12px] font-medium ${theme.badgeClass}`}>
              {p}
            </span>
          ))}
        </FadeIn>
      </div>

      <div className="space-y-4 mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          <FadeIn className="sm:col-span-2">
            <div
              className="group h-full flex flex-col justify-center gap-3 p-6 sm:p-7 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryLight}, #ffffff)`,
                borderColor: `${theme.primary}40`,
              }}
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: theme.primary, color: "#0F172A" }}
              >
                <LEAD.icon className="w-5 h-5" />
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
          <div
            className="group flex items-center justify-between gap-4 p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300"
            style={{
              background: `${theme.primary}12`,
              borderColor: `${theme.primary}35`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: theme.primary, color: "#0F172A" }}
              >
                <BANNER.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-0.5" style={{ fontFamily: FONT_DISPLAY }}>{BANNER.label}</h3>
                <p className="text-[13px] text-slate-600 leading-snug hidden sm:block">{BANNER.text}</p>
              </div>
            </div>
            <ArrowUpRight
              className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0"
              style={{ color: theme.primaryDark }}
            />
          </div>
        </FadeIn>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"O S.P.Y. encontra sinais e os transforma em oportunidades com contexto e próxima ação."</BrandLine>
      </div>
    </Section>
  );
}
