import { Boxes, Sparkles, Workflow, Users2 } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, AnimatedCounter, FONT_DISPLAY, FONT_MONO } from "./shared";

const STATS = [
  { value: 4, suffix: "", label: "Camadas conectadas" },
  { value: 8, suffix: "", label: "Agentes especializados" },
  { value: 24, suffix: "/7", label: "Operação contínua" },
  { value: 1, suffix: "", label: "Lugar só para tudo" },
];

interface Pillar {
  icon: typeof Boxes;
  name: string;
  text: string;
  tone: string;
  featured?: boolean;
}

const PILLARS: Pillar[] = [
  { icon: Boxes, name: "AXIS", text: "O centro da operação. Onde CRM, dados e processos vivem juntos.", tone: "from-slate-700 to-slate-900" },
  { icon: Sparkles, name: "AURORA", text: "O centro de tudo. Conecta canais, dados e times, entende o contexto de toda a operação e decide o que fazer a seguir.", tone: "from-teal-400 via-blue-500 to-violet-600", featured: true },
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
          Quatro camadas trabalhando juntas — dados entram, a Aurora conecta e entende, as
          automações executam e a sua equipe decide o que só uma pessoa pode decidir.
        </Lede>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PILLARS.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.08}>
            <div
              className={`relative h-full p-5 rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                p.featured ? "border-violet-200 bg-white ring-1 ring-violet-100 shadow-md hover:shadow-violet-500/15 sm:scale-[1.03]" : "border-slate-200 bg-white"
              }`}
            >
              {p.featured && (
                <span
                  className="absolute -top-2.5 left-5 px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-violet-600 text-white text-[9px] font-semibold uppercase tracking-[0.15em]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  Núcleo
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.tone} flex items-center justify-center mb-4 shadow-sm`}>
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[13px] font-black tracking-wider text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>{p.name}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{p.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.25}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mt-12 mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                <AnimatedCounter value={s.value} suffix={s.suffix} duration={1} />
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400" style={{ fontFamily: FONT_MONO }}>
          <span>Dados</span><span className="text-blue-400">→</span>
          <span className="text-violet-600">Aurora</span><span className="text-blue-400">→</span>
          <span>Decisão</span><span className="text-blue-400">→</span>
          <span>Ação</span><span className="text-blue-400">→</span>
          <span className="text-emerald-600">Resultado</span>
        </div>
      </FadeIn>
    </Section>
  );
}
