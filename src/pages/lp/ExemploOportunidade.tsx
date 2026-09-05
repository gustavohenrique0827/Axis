import { CheckCircle2, TrendingUp, Calendar, Target, Sparkles } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, BrandLine, GlassCard, FONT_MONO } from "./shared";

export function ExemploOportunidadeSection() {
  return (
    <Section id="exemplo" className="bg-slate-50/70" glow>
      <div className="text-center mb-14">
        <Kicker>Na prática</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">Uma conversa pode esconder uma oportunidade.</SectionTitle>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <FadeIn className="relative">
          <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-3xl max-w-md mx-auto" />
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#EFEAE2] max-w-md mx-auto shadow-lg">
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-[11px] font-bold text-white">CL</div>
              <div>
                <p className="text-sm font-semibold text-white">Cliente em potencial</p>
                <p className="text-[10px] text-emerald-100">online</p>
              </div>
            </div>
            <div className="p-4 min-h-[180px] flex flex-col justify-end gap-2 bg-[#EFEAE2]">
              <div className="self-start max-w-[85%] bg-white text-slate-800 text-sm rounded-xl rounded-tl-sm px-3.5 py-2.5 leading-relaxed shadow-sm border border-slate-200/60">
                Estou pensando em trocar o sistema da empresa ainda este mês. Quanto custa?
              </div>
              <span className="self-start text-[10px] text-slate-400 pl-1">agora</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <GlassCard className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 mb-1" style={{ fontFamily: FONT_MONO }}>
              <Sparkles className="w-3.5 h-3.5" /> Análise do S.P.Y.
            </div>

            {[
              { icon: TrendingUp, label: "Intenção de compra", value: "Alta", tone: "text-emerald-600" },
              { icon: Calendar, label: "Prazo", value: "Este mês", tone: "text-blue-600" },
              { icon: Target, label: "Contexto", value: "Possível troca de sistema", tone: "text-slate-800" },
              { icon: CheckCircle2, label: "Próxima ação", value: "Aprofundar necessidade e agendar diagnóstico", tone: "text-slate-800" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <row.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5" style={{ fontFamily: FONT_MONO }}>{row.label}</p>
                  <p className={`text-sm font-semibold ${row.tone}`}>{row.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">
                Oportunidade identificada
              </span>
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      <div className="mt-12 text-center max-w-lg mx-auto">
        <BrandLine>
          "A conversa não precisa ficar perdida no histórico. Ela pode virar contexto, oportunidade e ação."
        </BrandLine>
        <p className="text-[11px] text-slate-400 mt-4 uppercase tracking-wider font-medium" style={{ fontFamily: FONT_MONO }}>Exemplo ilustrativo</p>
      </div>
    </Section>
  );
}
