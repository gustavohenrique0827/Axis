import { MessageCircleQuestion } from "lucide-react";
import { AuroraCore } from "../../components/ui/auroraCore/AuroraCore";
import { Section, Kicker, SectionTitle, Lede, FadeIn, AuroraStage, BrandLine, FONT_DISPLAY } from "./shared";

const EXAMPLE_PROMPTS = [
  "Quais leads estão parados?",
  "Quanto vendemos este mês?",
  "Quais vendedores estão abaixo da meta?",
  "Quais clientes precisam de acompanhamento?",
  "Gere um relatório comercial.",
  "Crie uma tarefa para o vendedor entrar em contato.",
];

export function InteligenciaSection() {
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
            A Aurora não é simplesmente um chatbot. Ela entende o contexto da sua operação — leads,
            conversas, pipeline e histórico — para transformar informação em ação.
          </Lede>
          <BrandLine>"A Aurora entende o contexto da sua operação para transformar informação em ação."</BrandLine>
        </div>

        <FadeIn delay={0.15} className="justify-self-center flex flex-col items-center gap-5">
          <AuroraStage size={240}>
            <AuroraCore mode="thinking" size={140} />
          </AuroraStage>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ativo agora
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.1}>
        <div className="max-w-3xl mx-auto">
          <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            <MessageCircleQuestion className="w-3.5 h-3.5" /> Perguntas que você pode fazer
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {EXAMPLE_PROMPTS.map((p) => (
              <span
                key={p}
                className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-[13px] font-medium text-slate-600 hover:border-blue-300 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                "{p}"
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
