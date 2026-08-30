import { Boxes, Network, Sparkles, Workflow, Users2 } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, FONT_DISPLAY } from "./shared";

const PILLARS = [
  { icon: Boxes, name: "AXIS", text: "O centro da operação. Onde CRM, dados e processos vivem juntos.", tone: "from-slate-700 to-slate-900" },
  { icon: Network, name: "SINAPSE", text: "Conecta tudo. A camada que liga canais, times e sistemas ao Axis.", tone: "from-blue-500 to-blue-700", featured: true },
  { icon: Sparkles, name: "AURORA", text: "Entende tudo. A inteligência que analisa contexto e sugere ação.", tone: "from-violet-500 to-violet-700", featured: true },
  { icon: Workflow, name: "AUTOMAÇÕES", text: "Executam tudo. Processos que rodam sem depender de alguém lembrar.", tone: "from-emerald-500 to-emerald-700" },
  { icon: Users2, name: "EQUIPE", text: "Toma as decisões que importam, com contexto em vez de achismo.", tone: "from-amber-500 to-amber-700" },
];

export function EcossistemaSection() {
  return (
    <Section id="ecossistema" className="bg-slate-50/70" glow>
      <div className="text-center mb-14">
        <Kicker>O ecossistema Axis</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Não é uma ferramenta. É um ecossistema operacional.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          Cinco camadas trabalhando juntas — dados entram, a Sinapse conecta, a Aurora entende, as
          automações executam e a sua equipe decide o que só uma pessoa pode decidir.
        </Lede>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PILLARS.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.08}>
            <div
              className={`h-full p-5 rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                p.featured ? "border-blue-200 bg-white hover:shadow-blue-500/10" : "border-slate-200 bg-white"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.tone} flex items-center justify-center mb-4 shadow-sm`}>
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[13px] font-black tracking-wider text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>{p.name}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{p.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400">
          <span>Dados</span><span className="text-blue-400">→</span>
          <span className="text-blue-600">Sinapse</span><span className="text-blue-400">→</span>
          <span className="text-violet-600">Aurora</span><span className="text-blue-400">→</span>
          <span>Decisão</span><span className="text-blue-400">→</span>
          <span>Ação</span><span className="text-blue-400">→</span>
          <span className="text-emerald-600">Resultado</span>
        </div>
      </FadeIn>
    </Section>
  );
}
