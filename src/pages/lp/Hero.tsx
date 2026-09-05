import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { AuroraCore } from "../../components/ui/auroraCore/AuroraCore";
import { AuroraStage, FONT_MONO, ThemedCTAButton, ThemedOutlineButton } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const INPUTS = [
  { label: "WhatsApp",  angle: 200 },
  { label: "Marketing", angle: 160 },
  { label: "Reuniões",  angle: 240 },
  { label: "Clientes",  angle: 280 },
  { label: "Propostas", angle:  20 },
  { label: "Dados",     angle: 340 },
];

const OUTPUTS = ["Decisão", "Ação", "Resultado"];

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export function Hero({
  onPrimaryCta,
  onSecondaryCta,
}: {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
}) {
  const { theme, glow } = useLpTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div id="top" className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 px-5 sm:px-8 overflow-hidden">

      {/* ── Fundo animado com cor do tema ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grade de pontos */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 75%)",
          }}
        />
        {/* Orb principal — cor do tema */}
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[160px] transition-colors duration-700"
          style={{ background: glow(0.09) }}
        />
        {/* Orb secundário — cor alternativa do tema */}
        <div
          className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-700"
          style={{ background: `rgba(${hexToRgb(theme.glowColorAlt).join(",")},0.08)` }}
        />
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-5xl mx-auto text-center relative z-10">

        {/* Badge kicker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white/80 backdrop-blur-sm shadow-sm text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-8 ${theme.badgeClass}`}
          style={{ fontFamily: FONT_MONO }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Não é apenas um CRM — é o cérebro operacional da sua empresa
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6"
          style={{ fontFamily: "'Archivo', 'Inter', ui-sans-serif, system-ui, sans-serif" }}
        >
          Seu próximo vendedor<br className="hidden sm:block" />{" "}
          <span
            className="bg-clip-text text-transparent transition-all duration-700"
            style={{ backgroundImage: theme.heroGradient }}
          >
            não precisa dormir.
          </span>
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

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <ThemedCTAButton onClick={onPrimaryCta} className="w-full sm:w-auto">
            Quero conhecer o Axis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </ThemedCTAButton>
          <ThemedOutlineButton onClick={onSecondaryCta} className="w-full sm:w-auto">
            <PlayCircle className="w-4 h-4" />
            Ver o Axis funcionando
          </ThemedOutlineButton>
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

      {/* ── Núcleo visual ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative mx-auto w-full max-w-3xl aspect-square sm:aspect-[16/10] flex items-center justify-center"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Linhas convergentes com cor do tema */}
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
                <stop offset="0%"   stopColor={theme.glowColorAlt} stopOpacity="0" />
                <stop offset="60%"  stopColor={theme.primary}       stopOpacity="0.7" />
                <stop offset="100%" stopColor={theme.glowColor}      stopOpacity="0.85" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels de entrada */}
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
                className="absolute px-3 py-1.5 rounded-full bg-white border shadow-sm text-[10px] sm:text-[11px] font-semibold whitespace-nowrap cursor-default transition-all duration-200"
                style={{
                  left: `calc(50% + ${p.x}%)`,
                  top:  `calc(50% + ${p.y}%)`,
                  transform: "translate(-50%, -50%)",
                  borderColor: hovered === i ? theme.primary : "#E2E8F0",
                  color:       hovered === i ? "#0F172A" : "#475569",
                  boxShadow:   hovered === i ? `0 4px 12px ${glow(0.2)}` : undefined,
                }}
              >
                {inp.label}
              </motion.div>
            );
          })}

          {/* Núcleo Aurora */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <AuroraStage size={200}>
              <AuroraCore mode={hovered !== null ? "executing" : "analyzing"} size={128} />
            </AuroraStage>
            <div className="flex items-center gap-1.5" style={{ fontFamily: FONT_MONO }}>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-700" style={{ color: theme.primary }}>
                Aurora
              </span>
              <span className="text-[9px] text-slate-400 lowercase tracking-normal">· sempre ativa</span>
            </div>
          </div>

          {/* Output pills */}
          <div className="absolute bottom-[6%] sm:bottom-[10%] left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
            {OUTPUTS.map((out, i) => (
              <motion.div
                key={out}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="px-3 sm:px-4 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-700"
                style={{
                  background: glow(0.07),
                  borderColor: glow(0.25),
                  color: theme.primary,
                  filter: "brightness(0.9)",
                }}
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

/** Helper inline (só usado aqui) */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
