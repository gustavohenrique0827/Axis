import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronRight, Terminal, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface HeroSectionProps {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

export function HeroSection({ rotateX, rotateY }: HeroSectionProps) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 sm:pt-40 pb-12 sm:pb-32 px-4 sm:px-6">
      <motion.div 
        style={{ opacity, scale, rotateX, rotateY, perspective: 1000 }}
        className="max-w-6xl mx-auto text-center z-20 w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-1.5 sm:py-3 glass-card rounded-full mb-6 sm:mb-14 border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.1)]"
        >
          <motion.div 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500" 
          />
          <span className="text-[8px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-blue-400">STATUS: DOMINAÇÃO TOTAL ATIVA</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[11rem] xl:text-[13rem] font-display font-bold leading-[0.85] sm:leading-[0.75] tracking-[-0.08em] mb-6 sm:mb-14 text-glow px-2 italic"
        >
          O PODER <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-white to-blue-600 animate-gradient-x bg-[length:200%_auto]">
            INFINITO.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="max-w-4xl mx-auto text-sm sm:text-xl lg:text-3xl text-slate-400 font-medium leading-relaxed mb-10 sm:mb-20 px-4 sm:px-8"
        >
          Sinta a força da <span className="text-white font-black italic underline decoration-blue-500 decoration-4 underline-offset-8">Aurora</span>. O primeiro CRM do planeta que não apenas organiza, mas antecipa cada respiração do seu mercado.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10">
          <Link to="/login" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="relative group w-full"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Button className="relative w-full sm:w-auto h-14 sm:h-20 lg:h-28 px-6 sm:px-10 lg:px-20 bg-blue-600 text-white hover:bg-blue-700 rounded-xl sm:rounded-[3rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-xs sm:text-sm shadow-2xl transition-all border border-white/20">
                INICIAR DOMÍNIO <ChevronRight className="w-4 h-4 ml-2 sm:w-6 sm:h-6 sm:ml-4" />
              </Button>
            </motion.div>
          </Link>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-auto h-14 sm:h-20 lg:h-28 px-6 sm:px-10 lg:px-14 glass-card rounded-xl sm:rounded-[3rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 sm:gap-6 border-white/10 group overflow-hidden relative"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            PROTOCOLOS IA
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-0 group-hover:w-full transition-all duration-700" />
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Kinetic HUD Elements */}
      <motion.div 
        style={{ y: y1, rotate: -5 }}
        className="absolute top-20 left-20 hidden xl:block glass-card p-6 rounded-3xl w-64 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] backdrop-blur-3xl z-30"
      >
         <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 tracking-[0.2em]">NEURAL_LINK_01</span>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div className="text-[10px] text-slate-500 font-bold">REVENUE_GEN</div>
               <div className="text-2xl font-display font-black text-white">+84%</div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: "84%" }}
                 transition={{ duration: 2, delay: 0.5 }}
                 className="h-full bg-blue-600" 
               />
            </div>
         </div>
      </motion.div>

      <motion.div 
        style={{ y: y2, rotate: 5 }}
        className="absolute bottom-20 right-20 hidden xl:block glass-card p-6 rounded-3xl w-72 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] backdrop-blur-3xl z-30"
      >
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-indigo-500" />
               <span className="text-[10px] font-black text-indigo-400 tracking-[0.2em]">CORE_SYNC</span>
            </div>
            <div className="text-[8px] font-black text-slate-700 px-2 py-1 bg-white/5 rounded">SECURED</div>
         </div>
         <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6].map(i => (
              <motion.div 
                key={i} 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: Math.random() * 2 + 1, delay: i * 0.2 }}
                className="w-8 h-2 bg-indigo-500/20 rounded-full" 
              />
            ))}
         </div>
         <div className="mt-6 text-[11px] font-black text-white uppercase tracking-widest text-center italic">AURORA_ACTIVE: 100%</div>
      </motion.div>
    </section>
  );
}
