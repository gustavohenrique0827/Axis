import { MessageSquare, Database, FileText, Megaphone, CalendarCheck, Link2, ArrowRight, Inbox } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, GlassCard, FONT_DISPLAY } from "./shared";

const CHANNELS = [
  { icon: MessageSquare, label: "WhatsApp" },
  { icon: Database, label: "CRM" },
  { icon: FileText, label: "Formulários" },
  { icon: Megaphone, label: "Marketing" },
  { icon: CalendarCheck, label: "Reuniões" },
  { icon: Link2, label: "Outros canais" },
];

export function CanaisSection() {
  return (
    <Section id="canais">
      <div className="text-center mb-10">
        <Kicker>Canais</Kicker>
        <SectionTitle className="text-2xl sm:text-3xl lg:text-4xl mb-5">
          Conecte os canais onde suas oportunidades acontecem.
        </SectionTitle>
      </div>
      <FadeIn>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-3xl mx-auto mb-8">
          {CHANNELS.map((c) => (
            <div key={c.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <c.icon className="w-5 h-5 text-blue-300" />
              <span className="text-[10px] font-semibold text-slate-400 text-center">{c.label}</span>
            </div>
          ))}
        </div>
      </FadeIn>
      <Lede className="text-center max-w-xl mx-auto text-sm sm:text-base">
        O Axis reúne os sinais da operação para que a inteligência tenha contexto suficiente para agir.
      </Lede>
    </Section>
  );
}

export function BeneficiosSection() {
  const gestorQuestions = [
    "Quais oportunidades estão quentes?",
    "Quais leads estão parados?",
    "Quais oportunidades precisam de follow-up?",
    "Quais clientes podem comprar novamente?",
    "Onde existem gargalos?",
    "O que os agentes estão fazendo?",
    "Onde a equipe precisa intervir?",
  ];

  return (
    <Section id="beneficios" className="bg-white/[0.015]">
      <div className="grid lg:grid-cols-2 gap-10">
        <FadeIn>
          <GlassCard className="p-7 sm:p-8 h-full">
            <Inbox className="w-8 h-8 text-blue-300 mb-5" />
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: FONT_DISPLAY }}>
              O vendedor deixa de procurar onde vender.
            </h3>
            <p className="text-base font-semibold text-blue-300 mb-5 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> E passa a receber onde vender.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cada vendedor pode receber contexto, prioridade, histórico, objeções identificadas e próxima
              ação recomendada.
            </p>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.1}>
          <GlassCard className="p-7 sm:p-8 h-full">
            <h3 className="text-2xl font-bold text-white mb-1 leading-snug" style={{ fontFamily: FONT_DISPLAY }}>
              Pare de administrar apenas atividades.
            </h3>
            <p className="text-base font-semibold text-blue-300 mb-5">Comece a administrar oportunidades.</p>
            <div className="space-y-2">
              {gestorQuestions.map((q) => (
                <div key={q} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-slate-300">{q}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </Section>
  );
}
