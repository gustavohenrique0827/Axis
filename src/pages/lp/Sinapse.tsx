import { motion } from "motion/react";
import {
  MessageSquare, Database, Users, UserCog, Wallet, FolderKanban, Workflow, Sparkles, Plug, Network,
} from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, usePrefersReducedMotion, FONT_MONO } from "./shared";

const NODES = [
  { icon: MessageSquare, label: "WhatsApp", angle: 270 },
  { icon: Database, label: "CRM", angle: 310 },
  { icon: Users, label: "Leads e clientes", angle: 350 },
  { icon: UserCog, label: "Vendedores", angle: 30 },
  { icon: Wallet, label: "Financeiro", angle: 70 },
  { icon: FolderKanban, label: "Projetos", angle: 110 },
  { icon: Workflow, label: "Automação", angle: 150 },
  { icon: Sparkles, label: "Inteligência", angle: 190 },
  { icon: Plug, label: "Sistemas externos", angle: 230 },
];

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export function SinapseSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Section id="sinapse" glow>
      <div className="text-center mb-14">
        <Kicker>Sinapse</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">Tudo conectado. Nada perdido.</SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          A Sinapse é a camada de conexão do Axis — liga canais, times, sistemas e dados para que nada
          fique isolado em uma ferramenta separada.
        </Lede>
      </div>

      <FadeIn>
        <div className="relative mx-auto w-full max-w-2xl aspect-square flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="-260 -260 520 520">
            {NODES.map((n, i) => {
              const p = polar(n.angle, 200);
              return (
                <line
                  key={n.label}
                  x1={p.x} y1={p.y} x2={0} y2={0}
                  stroke="url(#sinapse-line-grad)"
                  strokeWidth="1.25"
                  strokeDasharray="4 5"
                  className={reducedMotion ? "" : "animate-[sinapse-flow_2.4s_linear_infinite]"}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              );
            })}
            <defs>
              <linearGradient id="sinapse-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.55" />
              </linearGradient>
            </defs>
          </svg>

          {NODES.map((n, i) => {
            const p = polar(n.angle, 44);
            return (
              <motion.div
                key={n.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="absolute flex flex-col items-center gap-1.5"
                style={{ left: `calc(50% + ${p.x}%)`, top: `calc(50% + ${p.y}%)`, transform: "translate(-50%, -50%)" }}
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                  <n.icon className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 text-center whitespace-nowrap">{n.label}</span>
              </motion.div>
            );
          })}

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-5 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/30 flex items-center justify-center">
                <Network className="w-8 h-8 text-white" />
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600" style={{ fontFamily: FONT_MONO }}>Sinapse</span>
          </div>
        </div>
      </FadeIn>

      <p className="text-center text-sm sm:text-base text-slate-500 max-w-lg mx-auto mt-10">
        Tudo o que acontece na sua empresa passa a estar no mesmo lugar — visível, conectado e
        disponível para a Aurora analisar.
      </p>
    </Section>
  );
}
