import { motion } from "motion/react";
import { MascotMIA6 } from "../../../components/MascotMIA6";

export function FlyingMascot() {
  return (
    <motion.div
      animate={{
        x: ["-20vw", "40vw", "90vw", "60vw", "-20vw"],
        y: ["10vh", "80vh", "30vh", "15vh", "10vh"],
        rotate: [45, 10, -30, 20, 45],
        scale: [0.5, 1.2, 0.8, 1, 0.5]
      }}
      transition={{
        duration: 20,
        ease: "easeInOut",
        repeat: Infinity
      }}
      className="fixed top-0 left-0 z-[200] pointer-events-none will-change-transform"
      style={{ width: '12rem', height: '12rem' }}
    >
      <div className="w-full h-full pointer-events-auto">
        <MascotMIA6 className="w-full h-full" />
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--color-surface-elevated)]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
         <span className="text-[10px] font-mono tracking-widest text-slate-300">MIA-6_NEURAL_FLYBY</span>
      </div>
      {/* Particle Trail via multiple child divs optimized for GPU */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 bottom-10 w-3 h-3 rounded-full bg-blue-500 top-auto will-change-transform"
            animate={{
              y: [0, 40 * i, 120 + 30 * i],
              x: [0, (i % 2 === 0 ? 15 : -15) * (i / 2), (i % 2 === 0 ? 30 : -30) * i],
              scale: [1, 0.5, 0],
              opacity: [0.8, 0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
