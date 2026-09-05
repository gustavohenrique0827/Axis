import { useState } from "react";
import { MessageCircleQuestion, Sparkles, ArrowRight } from "lucide-react";
import { AuroraCore } from "../../components/ui/auroraCore/AuroraCore";
import { Section, Kicker, SectionTitle, Lede, FadeIn, AuroraStage, BrandLine, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const EXAMPLES = [
  {
    q: "Quais leads estão parados?",
    a: "Encontrei 13 leads sem atividade há mais de 3 dias. 4 deles têm alta intenção de compra.",
    cta: "Ver leads parados",
  },
  {
    q: "Quanto vendemos este mês?",
    a: "R$ 84.300 fechados até agora. Faltam R$ 15.700 para bater a meta, com 6 propostas em aberto.",
    cta: "Ver relatório completo",
  },
  {
    q: "Quais vendedores estão abaixo da meta?",
    a: "2 vendedores abaixo do ritmo esperado este mês, com contexto de motivo disponível para cada um.",
    cta: "Ver desempenho da equipe",
  },
  {
    q: "Quais clientes precisam de acompanhamento?",
    a: "9 clientes sem contato há mais de 30 dias. 3 deles são bons candidatos a uma nova venda.",
    cta: "Ver clientes",
  },
  {
    q: "Gere um relatório comercial.",
    a: "Relatório gerado com pipeline, conversão e atividade da equipe na última semana.",
    cta: "Baixar relatório",
  },
  {
    q: "Crie uma tarefa para o vendedor entrar em contato.",
    a: "Tarefa criada com prioridade alta e prazo para hoje às 17h.",
    cta: "Ver tarefa criada",
  },
];

export function InteligenciaSection() {
  const [active, setActive] = useState<number | null>(0);
  const { theme, glow } = useLpTheme();
  const current = active !== null ? EXAMPLES[active] : null;

  return (
    <Section id="inteligencia" glow>
      <div className="grid lg:grid-cols-[1fr_auto] gap-14 items-center mb-14">
        <div>
          <Kicker>Conheça a Aurora</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-6">
            A inteligência comercial<br />trabalhando 24 horas.
          </SectionTitle>
          <div className="space-y-2 mb-7 text-slate-700 text-base sm:text-lg font-medium leading-relaxed">
            <p>Enquanto sua equipe vende, a Aurora observa.</p>
            <p>Enquanto sua equipe atende, ela analisa.</p>
            <p>Enquanto sua equipe descansa, ela continua trabalhando.</p>
          </div>
          <Lede className="text-sm sm:text-base max-w-xl mb-5">
            A Aurora não é simplesmente um chatbot. Ela conecta os sinais da sua operação — leads,
            conversas, pipeline e histórico — e entende o contexto para transformar informação em ação.
          </Lede>
          <BrandLine>"A Aurora entende o contexto da sua operação para transformar informação em ação."</BrandLine>
        </div>

        <FadeIn delay={0.15} className="justify-self-center flex flex-col items-center gap-5">
          <AuroraStage size={240}>
            <AuroraCore mode={current ? "analyzing" : "thinking"} size={140} />
          </AuroraStage>
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border shadow-sm text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: FONT_MONO, borderColor: `${theme.primary}44`, color: theme.primaryDark }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.primary }} />
            Ativo agora
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.1}>
        <div className="max-w-2xl mx-auto">
          <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4" style={{ fontFamily: FONT_MONO }}>
            <MessageCircleQuestion className="w-3.5 h-3.5" /> Pergunte à Aurora
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            {EXAMPLES.map((ex, i) => (
              <button
                key={ex.q}
                onClick={() => setActive(active === i ? null : i)}
                className={`px-4 py-2.5 rounded-full border text-[13px] font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  active === i
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 shadow-sm hover:text-slate-900 hover:shadow-md"
                }`}
                style={{
                  borderColor: active === i ? undefined : `${theme.primary}33`,
                }}
              >
                "{ex.q}"
              </button>
            ))}
          </div>

          {current ? (
            <FadeIn key={active}>
              <div
                className="rounded-2xl border p-5 sm:p-6 shadow-md"
                style={{
                  background: `${theme.primary}0D`,
                  borderColor: `${theme.primary}33`,
                  boxShadow: `0 8px 24px ${glow(0.1)}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                    style={{
                      background: theme.id === "green"
                        ? "linear-gradient(135deg, #15803D 0%, #22C55E 50%, #4ADE80 100%)"
                        : theme.heroGradient,
                      boxShadow: `0 4px 10px ${theme.glowColor}33`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed mb-4">{current.a}</p>
                    <button
                      className="group inline-flex items-center gap-1.5 text-[13px] font-bold transition-colors"
                      style={{ color: theme.primaryDark }}
                    >
                      {current.cta}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-wider font-medium" style={{ fontFamily: FONT_MONO }}>Resposta simulada, ilustrativa</p>
            </FadeIn>
          ) : (
            <p className="text-center text-sm text-slate-400">Clique em uma pergunta para ver a Aurora responder.</p>
          )}
        </div>
      </FadeIn>
    </Section>
  );
}
