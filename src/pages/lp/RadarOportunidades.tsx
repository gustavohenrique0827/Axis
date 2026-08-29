import { MessageCircle, PauseCircle, Users2, FileX, CalendarX, TrendingUp } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, BrandLine } from "./shared";

const CARDS = [
  { icon: MessageCircle, label: "Conversas antigas" },
  { icon: PauseCircle, label: "Leads parados" },
  { icon: Users2, label: "Clientes existentes" },
  { icon: FileX, label: "Propostas esquecidas" },
  { icon: CalendarX, label: "Reuniões sem follow-up" },
  { icon: TrendingUp, label: "Sinais de expansão" },
];

export function RadarOportunidadesSection() {
  return (
    <Section id="radar">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {CARDS.map((c, i) => (
          <FadeIn key={c.label} delay={i * 0.06}>
            <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-400/25 hover:bg-blue-500/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                <c.icon className="w-4.5 h-4.5 text-blue-300" />
              </div>
              <span className="text-sm font-semibold text-slate-200">{c.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"O Axis encontra sinais e os transforma em oportunidades com contexto e próxima ação."</BrandLine>
      </div>
    </Section>
  );
}
