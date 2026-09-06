import { motion, MotionValue } from "motion/react";
import { Terminal, Star, Zap, Sparkles } from "lucide-react";

interface NeuralSectionProps {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}

export function NeuralSection({ rotateX, rotateY }: NeuralSectionProps) {
  return (
    <section id="neural" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-black/20">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 sm:gap-24 lg:gap-40">
          <div className="flex-1 space-y-8 sm:space-y-16">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 rounded-full border border-blue-500/20 w-fit">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-blue-500">NÚCLEO_AURORA_ACTIVE</span>
             </div>
             <h2 className="text-4xl sm:text-7xl lg:text-9xl font-display font-bold tracking-tighter leading-[0.9] sm:leading-[0.8] italic">
                DOMINE A <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">PREVISÃO.</span>
             </h2>
             <p className="text-slate-400 text-lg sm:text-2xl font-medium leading-relaxed max-w-xl italic">
               "A melhor maneira de prever o futuro é construí-lo com dados preditivos de alta densidade."
             </p>
             <div className="space-y-6 sm:space-y-10">
                {[
                   { icon: Star, t: "Probabilidade_Atal", d: "Cálculos estocásticos de fechamento em tempo real." },
                   { icon: Zap, t: "Impacto_Exponencial", d: "Multiplique sua produtividade por um fator de 5x." }
                ].map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ x: -100, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     transition={{ delay: i * 0.3 }}
                     className="flex gap-4 sm:gap-8 items-start group"
                   >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-700">
                         <item.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                      </div>
                      <div>
                         <h4 className="text-lg sm:text-xl font-display font-black uppercase tracking-widest text-white mb-1.5 sm:mb-3 italic">{item.t}</h4>
                         <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-xs">{item.d}</p>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>

          <div className="flex-1 w-full relative perspective-1000">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full animate-pulse z-0" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/20 blur-3xl rounded-full animate-pulse z-0" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-20 mb-12 flex justify-center"
            >
              {/* Floating Tech Nodes */}
              {[
                { t: "+", x: -80, y: -60, d: 3 },
                { t: "01", x: 100, y: -40, d: 4 },
                { t: "[ ]", x: -90, y: 50, d: 3.5 },
                { t: "SYNC", x: 90, y: 70, d: 5 }
              ].map((node, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [node.y, node.y - 20, node.y],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: node.d, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute font-mono text-[10px] font-black text-blue-500/40 tracking-widest hidden sm:block"
                  style={{ left: `calc(50% + ${node.x}px)`, top: `calc(50% + ${node.y}px)` }}
                >
                  {node.t}
                </motion.div>
              ))}

              <motion.div 
                initial={{ x: "60vw", y: -100, opacity: 0, scale: 0.8 }}
                whileInView={{ 
                  x: 0, 
                  y: 0,
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ 
                  duration: 1.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                viewport={{ once: true }}
                className="w-64 h-64 sm:w-96 sm:h-96 relative group flex items-center justify-center"
              >
                <div className="absolute w-[70%] h-[70%] bg-blue-500 rounded-full filter blur-[80px] opacity-20 animate-pulse" />
                <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-blue-500/30 bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 text-blue-500" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white">Aurora</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
               style={{ rotateX, rotateY }}
               className="relative glass-card rounded-3xl sm:rounded-[4rem] p-1.5 border-white/5 shadow-[0_0_150px_rgba(37,99,235,0.2)] overflow-hidden"
             >
                <div className="bg-[var(--color-surface)]/90 p-6 sm:p-10 lg:p-16 rounded-[1.4rem] sm:rounded-[3.8rem] space-y-6 sm:space-y-10 lg:space-y-12">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[12px] font-black text-slate-700 tracking-[0.3em] sm:tracking-[0.5em]">OPERATIONAL_VISOR</span>
                      <div className="flex gap-2">
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-600 animate-ping" />
                         <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-600/30" />
                      </div>
                   </div>
                   
                   <div className="space-y-6 sm:space-y-10">
                      <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/5 space-y-3 sm:space-y-4">
                         <div className="flex justify-between items-center mb-2 sm:mb-4">
                             <div className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-glow">NEURAL_CONFIDENCE</div>
                             <div className="text-2xl sm:text-4xl font-display font-bold text-blue-500">99.8%</div>
                         </div>
                         <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "99.8%" }}
                              transition={{ duration: 3 }}
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600" 
                            />
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                         {[
                            { l: "Uptime", v: "42d:12h:08s", c: "text-emerald-500" },
                            { l: "Sync", v: "Verified", c: "text-blue-500" }
                         ].map((st, i) => (
                           <div key={i} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5">
                              <div className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">{st.l}</div>
                              <div className={`text-xs sm:text-sm font-black italic ${st.c}`}>{st.v}</div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
                {/* Scanning Animation */}
                <motion.div 
                  animate={{ top: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute left-0 w-full h-[100px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none z-10"
                />
             </motion.div>
          </div>
       </div>
    </section>
  );
}
