import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { AuroraCore } from "../../components/ui/auroraCore/AuroraCore";
import { AuroraStage, ACCENT_GRADIENT, FONT_DISPLAY, FONT_MONO } from "./shared";

const INPUTS = [
  { label: "WhatsApp", angle: 200 },
  { label: "Marketing", angle: 160 },
  { label: "Reuniões", angle: 240 },
  { label: "Clientes", angle: 280 },
  { label: "Propostas", angle: 20 },
  { label: "Dados", angle: 340 },
];

const OUTPUTS = ["Decisão", "Ação", "Resultado"];

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export function Hero({ onPrimaryCta, onSecondaryCta }: { onPrimaryCta: () => void; onSecondaryCta: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div id="top" className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 px-5 sm:px-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 75%)",
          }}
        />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-blue-500/[0.07] blur-[160px]" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-8"
          style={{ fontFamily: FONT_MONO }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Não é apenas um CRM — é o cérebro operacional da sua empresa
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: FONT_DISPLAY }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6"
        >
          Seu próximo vendedor<br className="hidden sm:block" /> <span className={ACCENT_GRADIENT}>não precisa dormir.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-700 font-medium max-w-2xl mx-auto mb-4"
        >
          O Axis conecta CRM, vendas, atendimento, automação e inteligência artificial em uma única
          operação — para você entender o que está acontecendo na sua empresa e o que fazer a seguir.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Dados, conversas e processos deixam de estar espalhados em WhatsApp, planilhas e ferramentas
          soltas — e passam a alimentar uma inteligência capaz de identificar oportunidades e agir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <button
            onClick={onPrimaryCta}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
          >
            Quero conhecer o Axis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={onSecondaryCta}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            Ver o Axis funcionando
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[11px] text-slate-400 mb-16 sm:mb-20"
        >
          Menos lead esquecido. Menos follow-up perdido. Mais oportunidades avançando.
        </motion.p>
      </div>

      {/* Núcleo visual — sinais convergindo para a inteligência Axis e saindo como decisão/ação/resultado */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative mx-auto w-full max-w-3xl aspect-square sm:aspect-[16/10] flex items-center justify-center"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* linhas convergentes sutis */}
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="-300 -220 600 440">
            {INPUTS.map((inp, i) => {
              const p = polar(inp.angle, 210);
              return (
                <motion.line
                  key={inp.label}
                  x1={p.x} y1={p.y * 0.6} x2={0} y2={0}
                  stroke="url(#lp-line-grad)"
                  initial={{ pathLength: 0, opacity: 0, strokeWidth: 1 }}
                  animate={{
                    pathLength: 1,
                    opacity: hovered === i ? 1 : 0.6,
                    strokeWidth: hovered === i ? 2 : 1,
                  }}
                  transition={{
                    pathLength: { delay: 0.6 + i * 0.08, duration: 1 },
                    opacity: { duration: 0.2 },
                    strokeWidth: { duration: 0.2 },
                  }}
                />
              );
            })}
            <defs>
              <linearGradient id="lp-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
                <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
              </linearGradient>
            </defs>
          </svg>

          {/* labels de entrada, distribuídas ao redor do núcleo */}
          {INPUTS.map((inp, i) => {
            const p = polar(inp.angle, 44);
            return (
              <motion.div
                key={inp.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: hovered === i ? 1.08 : 1 }}
                transition={{ opacity: { delay: 0.5 + i * 0.06 }, scale: { duration: 0.2 } }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`absolute px-3 py-1.5 rounded-full bg-white border shadow-sm text-[10px] sm:text-[11px] font-semibold whitespace-nowrap cursor-default transition-colors duration-200 ${
                  hovered === i ? "border-blue-300 text-slate-900 shadow-md" : "border-slate-200 text-slate-600"
                }`}
                style={{ left: `calc(50% + ${p.x}%)`, top: `calc(50% + ${p.y}%)`, transform: "translate(-50%, -50%)" }}
              >
                {inp.label}
              </motion.div>
            );
          })}

          {/* núcleo */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <AuroraStage size={200}>
              <AuroraCore mode={hovered !== null ? "executing" : "analyzing"} size={128} />
            </AuroraStage>
            <div className="flex items-center gap-1.5" style={{ fontFamily: FONT_MONO }}>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Aurora</span>
              <span className="text-[9px] text-slate-400 lowercase tracking-normal">· sempre ativa</span>
            </div>
          </div>

          {/* saídas abaixo */}
          <div className="absolute bottom-[6%] sm:bottom-[10%] left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
            {OUTPUTS.map((out, i) => (
              <motion.div
                key={out}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 text-[10px] sm:text-[11px] font-bold text-blue-700 uppercase tracking-wider"
              >
                {out}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
