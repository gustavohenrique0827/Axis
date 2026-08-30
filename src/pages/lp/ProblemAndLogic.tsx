import { ArrowDown, MessageCircle, Clock, Snowflake } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, GlassCard, FadeIn, BrandLine, FONT_DISPLAY } from "./shared";

export function ProblemSection() {
  return (
    <Section id="problema">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Kicker>O problema real</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-6">
            Sua empresa já recebe oportunidades.
            <br />
            <span className="text-slate-400">O problema é o que acontece depois.</span>
          </SectionTitle>
          <Lede className="text-base sm:text-lg mb-8 max-w-lg">
            Um lead chega pelo WhatsApp. Alguém responde. O cliente demonstra interesse. A conversa para.
            O vendedor esquece. O follow-up não acontece. O lead esfria. E uma oportunidade que poderia
            virar receita simplesmente desaparece.
          </Lede>
          <FadeIn delay={0.15}>
            <GlassCard className="p-5 sm:p-6 border-blue-200 bg-blue-50/60">
              <BrandLine>
                "O problema não é necessariamente falta de leads.
                <br />É falta de operação sobre eles."
              </BrandLine>
            </GlassCard>
          </FadeIn>
        </div>

        <FadeIn delay={0.1}>
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 space-y-4">
            {[
              { icon: MessageCircle, label: "Lead chega pelo WhatsApp", tone: "text-blue-600 border-blue-200 bg-blue-50" },
              { icon: MessageCircle, label: "Alguém responde, interesse real aparece", tone: "text-blue-600 border-blue-200 bg-blue-50" },
              { icon: Clock, label: "A conversa para. O follow-up não acontece.", tone: "text-amber-600 border-amber-200 bg-amber-50" },
              { icon: Snowflake, label: "O lead esfria e desaparece do radar", tone: "text-slate-500 border-slate-200 bg-white" },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${step.tone}`}>
                  <step.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {i < arr.length - 1 && <ArrowDown className="w-4 h-4 text-slate-300 mx-auto my-1.5" />}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export function NovaLogicaSection() {
  const tradicional = ["Lead", "Cadastro", "Vendedor", "Follow-up", "Venda"];
  const axis = ["Lead", "Inteligência", "Oportunidade", "Ação", "Resultado"];

  return (
    <Section id="nova-logica" className="bg-slate-50/70">
      <div className="text-center mb-14">
        <Kicker>Uma lógica diferente</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">O Axis muda essa lógica.</SectionTitle>
        <Lede className="max-w-xl mx-auto text-base sm:text-lg">
          Em vez de apenas armazenar oportunidades, o Axis trabalha sobre elas.
        </Lede>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 h-full shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Modelo tradicional</p>
            <div className="space-y-3">
              {tradicional.map((step, i, arr) => (
                <div key={step}>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-500">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-slate-300 mx-auto my-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-6 sm:p-8 h-full shadow-lg shadow-blue-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/15">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-6" style={{ fontFamily: FONT_DISPLAY }}>AXIS</p>
            <div className="space-y-3">
              {axis.map((step, i, arr) => (
                <div key={step}>
                  <div className="px-4 py-3 rounded-xl bg-white border border-blue-200 shadow-sm text-sm font-bold text-slate-900">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-blue-300 mx-auto my-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
