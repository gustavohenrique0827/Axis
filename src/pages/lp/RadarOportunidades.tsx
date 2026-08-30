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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {CARDS.map((c, i) => (
          <FadeIn key={c.label} delay={i * 0.06}>
            <div className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                <c.icon className="w-4.5 h-4.5 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{c.label}</span>
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
