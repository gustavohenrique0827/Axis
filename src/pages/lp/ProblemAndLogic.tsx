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
            <span className="text-slate-500">O problema é o que acontece depois.</span>
          </SectionTitle>
          <Lede className="text-base sm:text-lg mb-8 max-w-lg">
            Um lead chega pelo WhatsApp. Alguém responde. O cliente demonstra interesse. A conversa para.
            O vendedor esquece. O follow-up não acontece. O lead esfria. E uma oportunidade que poderia
            virar receita simplesmente desaparece.
          </Lede>
          <FadeIn delay={0.15}>
            <GlassCard className="p-5 sm:p-6 border-blue-500/20 bg-blue-500/[0.04]">
              <BrandLine>
                "O problema não é necessariamente falta de leads.
                <br />É falta de operação sobre eles."
              </BrandLine>
            </GlassCard>
          </FadeIn>
        </div>

        <FadeIn delay={0.1}>
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
            {[
              { icon: MessageCircle, label: "Lead chega pelo WhatsApp", tone: "text-blue-400 border-blue-500/20 bg-blue-500/[0.06]" },
              { icon: MessageCircle, label: "Alguém responde, interesse real aparece", tone: "text-blue-400 border-blue-500/20 bg-blue-500/[0.06]" },
              { icon: Clock, label: "A conversa para. O follow-up não acontece.", tone: "text-amber-400 border-amber-500/20 bg-amber-500/[0.06]" },
              { icon: Snowflake, label: "O lead esfria e desaparece do radar", tone: "text-slate-500 border-white/10 bg-white/[0.02]" },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${step.tone}`}>
                  <step.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {i < arr.length - 1 && <ArrowDown className="w-4 h-4 text-slate-700 mx-auto my-1.5" />}
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
    <Section id="nova-logica" className="bg-white/[0.015]">
      <div className="text-center mb-14">
        <Kicker>Uma lógica diferente</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">O Axis muda essa lógica.</SectionTitle>
        <Lede className="max-w-xl mx-auto text-base sm:text-lg">
          Em vez de apenas armazenar oportunidades, o Axis trabalha sobre elas.
        </Lede>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 h-full">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Modelo tradicional</p>
            <div className="space-y-3">
              {tradicional.map((step, i, arr) => (
                <div key={step}>
                  <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-slate-400">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-slate-700 mx-auto my-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-b from-blue-500/[0.06] to-violet-500/[0.03] p-6 sm:p-8 h-full shadow-[0_0_60px_-20px_rgba(59,130,246,0.35)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-6" style={{ fontFamily: FONT_DISPLAY }}>AXIS</p>
            <div className="space-y-3">
              {axis.map((step, i, arr) => (
                <div key={step}>
                  <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-blue-400/20 text-sm font-bold text-white">
                    {step}
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-blue-500/50 mx-auto my-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
