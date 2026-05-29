import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Zap, BarChart3, ShieldCheck, 
  Component, Activity, Star, Check, 
  MousePointer2, Sparkles, Layers,
  ChevronRight, Terminal, Network,
  TrendingUp, Cpu, GraduationCap
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useRef, useEffect, useState } from "react";
import { MascotMIA6 } from "../../components/MascotMIA6";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-[#F8FAFC] font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <div className="noise-overlay" />
      
      {/* Cinematic Flying Mascot - Iron Man Continuous Viewport Path (GPU optimized with transform will-change) */}
      <motion.div
        animate={{
          x: ["-20vw", "40vw", "90vw", "60vw", "-20vw"],
          y: ["10vh", "80vh", "30vh", "15vh", "10vh"],
          rotate: [45, 10, -30, 20, 45],
          scale: [0.5, 1.2, 0.8, 1, 0.5]
        }}
        transition={{
          duration: 20,
          ease: "easeInOut", // organic bezier curve acceleration
          repeat: Infinity
        }}
        className="fixed top-0 left-0 z-[200] pointer-events-none will-change-transform"
        style={{ width: '12rem', height: '12rem' }}
      >
        <div className="w-full h-full pointer-events-auto">
          <MascotMIA6 className="w-full h-full" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#00c8ff]/20 backdrop-blur-md px-3 py-1 rounded-full border border-[#00c8ff]/30">
           <span className="text-[10px] font-mono font-black text-[#00c8ff] tracking-widest animate-[neonPulse_2s_infinite]">MIA-6_NEURAL_FLYBY</span>
        </div>
        {/* Neon Particle Trail via multiple child divs optimized for GPU */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 bottom-10 w-3 h-3 rounded-full bg-[#00c8ff] top-auto will-change-transform"
              style={{
                filter: "drop-shadow(0 0 10px #00c8ff)",
              }}
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
      
      {/* Background System - Interactive Parallax */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ 
            x: useTransform(smoothMouseX, (v) => v * -0.05),
            y: useTransform(smoothMouseY, (v) => v * -0.05)
          }}
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] opacity-[0.05]" 
        />
        <motion.div 
          style={{ 
            x: useTransform(smoothMouseX, (v) => v * 0.1),
            y: useTransform(smoothMouseY, (v) => v * 0.1)
          }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full" 
        />
        <motion.div 
          style={{ 
            x: useTransform(smoothMouseX, (v) => v * -0.15),
            y: useTransform(smoothMouseY, (v) => v * -0.15)
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-indigo-600/10 blur-[180px] rounded-full" 
        />
      </div>

      {/* Futuristic Navbar */}
      <nav className="fixed top-0 w-full z-[110] px-3 py-3 sm:px-6 sm:py-6 lg:px-12 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 glass-card px-4 py-3 sm:px-8 sm:py-5 rounded-xl sm:rounded-[2.5rem] border-white/5 shadow-2xl pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-4 group cursor-pointer shrink-0 pr-4 lg:pr-12"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:rotate-12 transition-transform duration-500 overflow-hidden p-1">
              <img src="/logo-icon.png" alt="Axis Icon" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg sm:text-3xl font-display font-black tracking-[-0.05em] group-hover:tracking-[0.05em] transition-all">AXIS</span>
          </motion.div>

          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] xl:tracking-[0.3em] text-slate-500 whitespace-nowrap flex-1">
            {["Explorar", "Neural", "Rede", "Planos"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-blue-400 transition-all hover:scale-110">
                {item}
              </a>
            ))}
            
            {/* Form Demos Links Dropdown-ish */}
            <div className="relative group cursor-pointer inline-flex items-center">
               <span className="hover:text-amber-400 transition-all hover:scale-110 flex items-center gap-1 text-amber-500 shrink-0">
                  DEMOS_CAPTAÇÃO <ChevronRight className="w-3 h-3 rotate-90" />
               </span>
               <div className="absolute top-full left-0 mt-4 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-64 shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[200]">
                  <Link to="/f/apple" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">🍏 Revendas Apple</Link>
                  <Link to="/f/solar" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">⚡ Energia Solar</Link>
                  <Link to="/f/imobiliaria" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">🏢 Imobiliárias</Link>
                  <Link to="/f/clinica" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">🏥 Clínicas Saúde</Link>
                  <Link to="/f/educacao" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors font-medium">🎓 Educação</Link>
               </div>
            </div>
          </div>

          <div className="flex items-center shrink-0 gap-2 sm:gap-4 pl-4 lg:pl-12">
            <Link to="/login" className="px-2 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:-translate-y-1">Acessar</Link>
            <Link to="/f/mia-6">
              <Button className="bg-[#F8FAFC] hover:bg-white text-black rounded-lg sm:rounded-[1.5rem] px-3 py-2.5 sm:px-8 sm:py-5 h-auto font-black uppercase tracking-widest text-[8px] sm:text-[11px] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all shrink-0">
                Implantar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full">
        
        {/* Kinetic Hero Section */}
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
              Sinta a força da <span className="text-white font-black italic underline decoration-blue-500 decoration-4 underline-offset-8">MIA-6</span>. O primeiro CRM do planeta que não apenas organiza, mas antecipa cada respiração do seu mercado.
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
             <div className="mt-6 text-[11px] font-black text-white uppercase tracking-widest text-center italic">MIA_ACTIVE: 100%</div>
          </motion.div>
        </section>

        {/* The Interface Horizon - Depth Effect */}
        <section className="py-16 sm:py-32 lg:py-40 relative px-4 sm:px-6 perspective-1000">
           <motion.div 
             style={{ rotateX: 20 }}
             className="max-w-[1500px] mx-auto overflow-hidden rounded-3xl sm:rounded-[4rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_100px_200px_-50px_rgba(37,99,235,0.4)] relative p-4 sm:p-0 isolate"
           >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
              <motion.img 
                initial={{ opacity: 0, scale: 1.2, y: 100 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="/logo-full.png" 
                alt="Axis Commercial Interface" 
                className="w-full opacity-100 rounded-2xl sm:rounded-none p-4 sm:p-12 mix-blend-screen"
              />
              <div className="relative sm:absolute bottom-4 left-4 sm:bottom-10 sm:left-10 lg:bottom-20 lg:left-20 z-20 mt-4 sm:mt-0">
                 <div className="glass-card p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border-white/20 max-w-full sm:max-w-md">
                    <h3 className="text-xl sm:text-3xl font-display font-black mb-3 sm:mb-6 uppercase italic">Visualize o Futuro.</h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8">Nossa interface imersiva foi projetada para reduzir a carga cognitiva em 60%, permitindo que sua mente foque apenas no que importa: <span className="text-white font-bold italic">Crescimento Exponencial.</span></p>
                    <div className="flex gap-2 sm:gap-4">
                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 animate-[pulse_2s_infinite]" />
                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500/30" />
                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500/10" />
                    </div>
                 </div>
              </div>
           </motion.div>
        </section>

        {/* Bento Vision - Interactive Grid */}
        <section id="explorar" className="py-12 sm:py-24 lg:py-32 px-4 sm:px-6 bg-[#020617] relative border-t border-white/5">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between mb-8 sm:mb-16 lg:mb-20 gap-8 lg:gap-16">
                 <div className="max-w-3xl">
                    <motion.span 
                       initial={{ letterSpacing: "1em", opacity: 0 }}
                       whileInView={{ letterSpacing: "0.5em", opacity: 1 }}
                       className="text-[10px] sm:text-[12px] font-black text-blue-500 uppercase mb-4 sm:mb-8 block"
                    >
                       ENGENHARIA_SUPERIOR
                    </motion.span>
                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6 sm:mb-10 leading-[0.9] sm:leading-[0.85]">
                       MÓDULOS DE <br /><span className="text-blue-500 italic">ALTA INTENSIDADE.</span>
                    </h2>
                 </div>
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="relative w-28 h-28 sm:w-48 sm:h-48 border-4 border-dashed border-white/5 rounded-full flex items-center justify-center p-4 sm:p-8 group"
                 >
                    <div className="w-full h-full border-4 border-blue-500/20 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-700" />
                    <Sparkles className="absolute w-6 h-6 sm:w-10 sm:h-10 text-blue-500" />
                 </motion.div>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 sm:gap-8">
               <motion.div 
                  whileHover={{ y: -10 }}
                  className="col-span-1 sm:col-span-2 md:col-span-8 glass-card rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-16 flex flex-col justify-end relative overflow-hidden group min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
                  <BarChart3 className="w-10 h-10 sm:w-16 lg:w-24 lg:h-24 text-blue-500 mb-4 sm:mb-10 lg:mb-12 transform group-hover:rotate-12 transition-transform duration-700" />
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-8 uppercase tracking-tighter italic">Arquitetura de Pipeline</h3>
                  <p className="text-slate-400 text-xs sm:text-sm lg:text-xl max-w-2xl leading-relaxed">
                     Não é apenas um funil convencional. É uma simulação viva do seu motor de faturamento, perfeitamente otimizada para ciclos ágeis de SDR/Closures, vendas de alta escala educacional ou nichos de comércio premium como revendedores Apple em Palmas, garantindo rastreamento preciso de inventário de iPhones e margens financeiras robustas.
                  </p>
               </motion.div>
               
               <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="col-span-1 sm:col-span-1 md:col-span-4 glass-card rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-16 flex flex-col justify-center items-center text-center bg-blue-600 border-none group relative overflow-hidden h-[300px] sm:h-[450px] lg:h-[500px]"
               >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <Zap className="w-10 h-10 sm:w-16 lg:w-24 lg:h-24 text-white mb-4 sm:mb-10 lg:mb-12 animate-bounce" />
                  <h4 className="font-display font-bold uppercase tracking-widest text-lg sm:text-2xl text-white mb-2 sm:mb-6 italic underline underline-offset-8">Gatilhos_Ativos</h4>
                  <p className="text-blue-100 text-[10px] sm:text-sm lg:text-lg font-medium leading-relaxed">
                     Acelere a execução com automações que respondem ao pulso do seu lead em nanossegundos.
                  </p>
               </motion.div>

               <div className="col-span-1 sm:col-span-1 md:col-span-4 glass-card rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center h-[200px] sm:h-[350px] lg:h-[400px]">
                  <ShieldCheck className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-500 mb-4 sm:mb-10" />
                  <h5 className="font-display font-black text-base sm:text-xl uppercase italic mb-1 sm:mb-4">Criptografia_Pure</h5>
                  <p className="text-slate-500 text-[8px] sm:text-sm font-bold uppercase tracking-widest">Segurança de Grado Militar</p>
               </div>

               <div className="col-span-1 sm:col-span-1 md:col-span-4 glass-card rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center h-[200px] sm:h-[350px] lg:h-[400px] border-blue-500/20">
                  <GraduationCap className="w-10 h-10 sm:w-16 sm:h-16 text-blue-500 mb-4 sm:mb-10" />
                  <h5 className="font-display font-black text-base sm:text-xl uppercase italic mb-1 sm:mb-4">Núcleo_Escolar</h5>
                  <p className="text-slate-500 text-[8px] sm:text-sm font-bold uppercase tracking-widest leading-relaxed">Gestão de Turmas, Alunos e Matrículas com Inteligência Pedagógica.</p>
               </div>

               <div className="col-span-1 sm:col-span-1 md:col-span-4 glass-card rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center h-[200px] sm:h-[350px] lg:h-[400px]">
                  <Activity className="w-10 h-10 sm:w-16 sm:h-16 text-emerald-500 mb-4 sm:mb-10" />
                  <h5 className="font-display font-black text-base sm:text-xl uppercase italic mb-1 sm:mb-4">Fluxo_Dinâmico</h5>
                  <p className="text-slate-500 text-[8px] sm:text-sm font-bold uppercase tracking-widest">Financeiro em Tempo Real</p>
               </div>

                 <div className="col-span-1 md:col-span-4 glass-card rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center text-center h-[250px] sm:h-[350px] lg:h-[400px]">
                    <Cpu className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-500 mb-4 sm:mb-10" />
                    <h5 className="font-display font-black text-lg sm:text-xl uppercase italic mb-2 sm:mb-4">Open_Kernel</h5>
                    <p className="text-slate-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest">Full API Scalability</p>
                 </div>
              </div>
            </div>
         </section>

         {/* Master AI Visual Interface Prototype */}
        <section id="neural" className="py-20 sm:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-black/20">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 sm:gap-24 lg:gap-40">
              <div className="flex-1 space-y-8 sm:space-y-16">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 rounded-full border border-blue-500/20 w-fit">
                    <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-blue-500">NÚCLEO_MIA_ACTIVE</span>
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
                    className="w-64 h-64 sm:w-96 sm:h-96 relative group"
                  >
                     <MascotMIA6 isHero={true} />
                  </motion.div>
                </motion.div>

                <motion.div
                   style={{ rotateX, rotateY }}
                   className="relative glass-card rounded-3xl sm:rounded-[4rem] p-1.5 border-white/5 shadow-[0_0_150px_rgba(37,99,235,0.2)] overflow-hidden"
                 >
                    <div className="bg-[#020617]/90 p-6 sm:p-10 lg:p-16 rounded-[1.4rem] sm:rounded-[3.8rem] space-y-6 sm:space-y-10 lg:space-y-12">
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

        {/* Scalability Grid - Massive Logos & Stats */}
        <section id="rede" className="py-12 sm:py-24 lg:py-32 px-4 sm:px-6 relative border-y border-white/5 bg-[#020617]">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 sm:mb-20 lg:mb-28">
                 <motion.h2 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-5xl sm:text-7xl md:text-9xl font-display font-bold tracking-tighter mb-4 sm:mb-10 italic"
                 >
                    RED_GLOBAL.
                 </motion.h2>
                 <p className="text-slate-500 uppercase font-black text-[10px] sm:text-[12px] tracking-[0.25em] sm:tracking-[0.6em]">Ecossistema Corporativo de Alta Densidade</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16 lg:gap-20">
                 {[
                    { l: "Empresas_Ativas", v: "1.2k+" },
                    { l: "Leads_Processados", v: "45M+" },
                    { l: "ROI_Médio", v: "312%" },
                    { l: "Latência", v: "4ms" }
                 ].map((stat, i) => (
                    <motion.div 
                       key={i}
                       viewport={{ once: true }}
                       initial={{ opacity: 0, y: 50 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.2 }}
                       className="flex flex-col items-center gap-6"
                    >
                       <div className="text-6xl font-display font-black text-white italic underline decoration-blue-800 decoration-8">{stat.v}</div>
                       <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">{stat.l}</div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Final Ascension CTA - Bombastic End */}
        <section className="py-20 sm:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-[#020617]">
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.05, 0.1, 0.05]
             }}
             transition={{ repeat: Infinity, duration: 10 }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] bg-blue-600 rounded-full blur-[300px] z-0" 
           />
           
           <div className="max-w-6xl mx-auto text-center relative z-10 space-y-16">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-8xl md:text-[14rem] font-display font-bold tracking-[-0.08em] leading-[0.75] text-glow italic"
              >
                ASCENSÃO <br /><span className="text-blue-500">TOTAL.</span>
              </motion.h2>
              <p className="text-2xl md:text-4xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium italic">
                Você não está contratando uma ferramenta. Você está assinando um <span className="text-white font-black underline decoration-blue-500 decoration-8">Novo Destino Comerical.</span>
              </p>
              <Link to="/login" className="inline-block">
                <motion.div
                  whileHover={{ scale: 1.1, rotateX: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button className="h-16 sm:h-24 lg:h-32 px-8 sm:px-16 lg:px-24 bg-white text-black hover:bg-slate-100 rounded-full font-black uppercase tracking-[0.2em] sm:tracking-[0.5em] text-sm sm:text-lg lg:text-xl shadow-[0_0_100px_rgba(255,255,255,0.4)] transition-all">
                     ASSUMIR_O_EIXO
                  </Button>
                </motion.div>
              </Link>
           </div>
        </section>

      </main>

      {/* Industrial Monolithic Footer - Tightened Size */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-3xl px-4 sm:px-12 py-6 sm:py-10 relative z-[110]">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
            <div className="md:col-span-2">
               <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden p-1.5">
                    <img src="/logo-icon.png" alt="Axis Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xl sm:text-2xl font-display font-black tracking-[-0.05em] italic">AXIS_CORE_SYSTEMS</span>
               </div>
               <p className="text-slate-500 text-[10px] sm:text-xs lg:text-sm leading-relaxed max-w-lg italic font-medium">
                 Definindo o padrão ouro para a infraestrutura de dados corporativos de próxima geração. A inteligência agora é o seu único patrimônio.
               </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 block">PROTOCOLOS</span>
               <div className="flex flex-col gap-1.5 sm:gap-3">
                 {["Manifesto_Rede", "Kernel_Status", "Arquitetura_IA", "Conformidade"].map(link => (
                   <a key={link} href="#" className="text-[9px] sm:text-[11px] font-black text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest">{link}</a>
                 ))}
               </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
               <div>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 block mb-4">ESTAÇÃO_SYNC</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                     {[Star, Zap, ShieldCheck, Component].map((Icon, i) => (
                       <motion.div 
                         key={i} 
                         whileHover={{ y: -3 }}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500 transition-all cursor-pointer font-black text-slate-500 hover:text-blue-500"
                       >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                       </motion.div>
                     ))}
                  </div>
               </div>
               <p className="text-[7px] sm:text-[8px] text-slate-800 uppercase font-black tracking-[0.3em] sm:tracking-[0.4em]">©MMXXVI_G-TECH_NEURAL_DIV • ALL_SYNC_VERIFIED_V.2.0.4</p>
            </div>
         </div>
      </footer>
    </div>
  );
}

