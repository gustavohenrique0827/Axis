import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { toast } from 'sonner';
import { Webhook } from 'lucide-react';
import { SDRWebhookModal } from './ui/modals/crm/SDRWebhookModal';

interface MascotProps {
  className?: string;
  isHero?: boolean;
}

export const MascotMIA6: React.FC<MascotProps> = ({ className, isHero = false }) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const { leads, setRobotStatus } = useData();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px 0px" });

  useEffect(() => {
    setRobotStatus(isInView ? 'executando' : 'pausado');
  }, [isInView, setRobotStatus]);

  const messages = [
    "Olá! Sistema operando em 100%.",
    "Análise neural concluída!",
    "Protocolo de boas-vindas ativado."
  ];

  const handleClick = () => {
    if (isInteracting) return;
    
    // Funnel context toast
    const totalLeads = leads.length;
    const convertidos = leads.filter(l => l.status === "Ganhos" || l.stageId === '6').length;
    
    toast.success(`Funil SDR Atualizado: ${totalLeads} Leads Totais | ${convertidos} Convertidos`, {
      icon: '📊',
      description: 'Análise de conversão processada com sucesso via MIA-6.'
    });

    setMessageIndex((prev) => (prev + 1) % messages.length);
    setIsInteracting(true);
    setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  const handleWebhookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWebhookModalOpen(true);
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`relative ${className} flex items-center justify-center interactive-robot ${isInView ? 'is-visible' : 'paused'} cursor-pointer z-50`}
        onClick={handleClick}
      >
        {/* Background glow pulse */}
        <div className={`absolute w-[90%] h-[90%] bg-[#00c8ff] rounded-full filter blur-[60px] opacity-20 pointer-events-none z-0 ${isInView ? 'animate-pulse' : ''}`} />

        {/* Webhook Contextual Menu Button */}
        <div 
          className="absolute -right-2 top-8 w-10 h-10 bg-slate-900/80 backdrop-blur-sm border border-[#00c8ff]/30 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 hover:border-[#00c8ff] transition-all group z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          title="Configurar Automação Webhook (SDR)"
          onClick={handleWebhookClick}
        >
          <Webhook className="w-4 h-4 text-[#00c8ff] group-hover:animate-pulse" />
        </div>

      {/* Mensagem Interativa Flutuante */}
      <AnimatePresence>
        {isInteracting && isInView && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#00c8ff]/50 shadow-[0_0_20px_rgba(0,200,255,0.6)] pointer-events-none z-50 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#00c8ff] animate-pulse" />
            <span className="text-white font-mono text-xs sm:text-sm font-bold tracking-wide">
              {messages[messageIndex]}
            </span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-solid border-t-slate-900/90 border-t-[8px] border-x-transparent border-x-[8px] border-b-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mascot Hover Container (PURE CODE SVG CUTE ROBOT) */}
      <motion.div
        animate={
          !isInView 
            ? { y: 0, rotateY: 0 } 
            : isInteracting 
              ? { y: [0, -30, 0], rotateY: [0, 360, 360] }
              : { y: [-10, 10, -10], rotateY: 0 }
        }
        transition={
          !isInView 
            ? { duration: 0 } 
            : isInteracting
              ? { duration: 3, ease: "easeInOut" }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" className="w-[150%] h-[150%] drop-shadow-[0_0_20px_rgba(0,200,255,0.4)]">
          <defs>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="darkGrayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="faceplateGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="thrusterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,200,255,1)" />
              <stop offset="40%" stopColor="rgba(0,200,255,0.6)" />
              <stop offset="100%" stopColor="rgba(0,200,255,0)" />
            </linearGradient>
            <filter id="neonGlowCute" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonGlowIntense" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Thruster Exhaust Trail (Iron Man Style Flight) */}
          <motion.path 
            d="M 80 150 L 120 150 L 100 280 Z" 
            fill="url(#thrusterGrad)" 
            filter="url(#neonGlowCute)"
            animate={!isInView ? { scaleY: 1, opacity: 0.7 } : { scaleY: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={!isInView ? { duration: 0 } : { duration: 0.1, repeat: Infinity }}
            style={{ transformOrigin: "100px 150px" }}
          />

          {/* Main Body */}
          <g transform="translate(0, 15)">
            {/* Shoulders */}
            <rect x="55" y="105" width="90" height="32" rx="16" fill="url(#silverGrad)" />
            
            {/* Arms */}
            <path d="M 62 120 Q 40 145 45 170" stroke="url(#darkGrayGrad)" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M 138 120 Q 160 145 155 170" stroke="url(#darkGrayGrad)" strokeWidth="18" fill="none" strokeLinecap="round" />
            
            {/* Forearms/Hands */}
            <path d="M 45 170 L 40 185" stroke="url(#silverGrad)" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 155 170 L 160 185" stroke="url(#silverGrad)" strokeWidth="16" fill="none" strokeLinecap="round" />
            
            {/* Hand Thrusters for flight */}
            <circle cx="40" cy="185" r="5" fill="#00c8ff" filter="url(#neonGlowCute)" />
            <circle cx="160" cy="185" r="5" fill="#00c8ff" filter="url(#neonGlowCute)" />

            {/* Torso Base */}
            <path d="M 70 100 Q 100 160 130 100 Z" fill="url(#darkGrayGrad)" />
            <path d="M 75 100 Q 100 165 125 100 Z" fill="url(#silverGrad)" />
            
            {/* Chest Plate */}
            <circle cx="100" cy="120" r="22" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            
            {/* Neon 'A' Logo Glow on Chest */}
            <circle cx="100" cy="120" r="16" fill="none" stroke="#00c8ff" strokeWidth="2" filter="url(#neonGlowCute)" />
            <path d="M 94 127 L 100 113 L 106 127 M 96 124 L 104 124" stroke="#00c8ff" strokeWidth="3" fill="none" filter="url(#neonGlowIntense)" strokeLinecap="round" strokeLinejoin="round" />

            {/* Head Base */}
            <g transform="translate(100, 60)">
              {/* Ear connection bar */}
              <rect x="-65" y="0" width="130" height="20" rx="10" fill="url(#darkGrayGrad)" />
              
              {/* Glowing Ear pieces */}
              <circle cx="-55" cy="10" r="15" fill="url(#silverGrad)" />
              <circle cx="55" cy="10" r="15" fill="url(#silverGrad)" />
              <motion.circle cx="-55" cy="10" r="7" fill="#00c8ff" animate={!isInView ? { opacity: 1 } : { opacity: [1, 0.6, 1] }} transition={!isInView ? { duration: 0 } : { duration: 2, repeat: Infinity }} style={{ filter: "drop-shadow(0 0 8px #00c8ff)" }} />
              <motion.circle cx="55" cy="10" r="7" fill="#00c8ff" animate={!isInView ? { opacity: 1 } : { opacity: [1, 0.6, 1] }} transition={!isInView ? { duration: 0 } : { duration: 2, repeat: Infinity }} style={{ filter: "drop-shadow(0 0 8px #00c8ff)" }} />

              {/* Cute Large Dome Head */}
              <path d="M -52 15 C -52 -50, 52 -50, 52 15 C 52 45, -52 45, -52 15 Z" fill="url(#silverGrad)" />
              
              {/* Glossy Faceplate */}
              <path d="M -44 15 C -44 -28, 44 -28, 44 15 C 44 38, -44 38, -44 15 Z" fill="url(#faceplateGrad)" stroke="#1e293b" strokeWidth="3" />
              
              {/* Smiling Neon Eyes */}
              <motion.g 
                animate={
                  !isInView ? { y: 0, opacity: 1, filter: "drop-shadow(0 0 5px #00c8ff)" } :
                  isInteracting
                    ? { 
                        y: [0, -3, 0], 
                        opacity: [1, 0.4, 1, 0.7, 1, 0.3, 1],
                        filter: [
                           "drop-shadow(0 0 5px #00c8ff)", 
                           "drop-shadow(0 0 20px #00c8ff)", 
                           "drop-shadow(0 0 5px #00c8ff)",
                           "drop-shadow(0 0 15px #00c8ff)",
                           "drop-shadow(0 0 5px #00c8ff)",
                           "drop-shadow(0 0 25px #00c8ff)",
                           "drop-shadow(0 0 5px #00c8ff)"
                        ]
                      }
                    : { 
                        y: [0, -3, 0], 
                        opacity: [1, 0.8, 1], 
                        filter: [
                           "drop-shadow(0 0 5px #00c8ff)",
                           "drop-shadow(0 0 10px #00c8ff)",
                           "drop-shadow(0 0 5px #00c8ff)"
                        ]
                      }
                } 
                transition={
                  !isInView ? { duration: 0 } :
                  isInteracting
                    ? { duration: 3, ease: "easeInOut" }
                    : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                {/* Left Eye Curve */}
                <path d="M -26 12 Q -15 -8 -4 12" stroke="#00c8ff" strokeWidth="7" fill="none" strokeLinecap="round" />
                {/* Right Eye Curve */}
                <path d="M 4 12 Q 15 -8 26 12" stroke="#00c8ff" strokeWidth="7" fill="none" strokeLinecap="round" />
              </motion.g>
              
              {/* Little cute mouth */}
              <motion.path 
                d="M -6 24 Q 0 30 6 24" 
                stroke="#00c8ff" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round" 
                animate={
                  !isInView ? { opacity: 0.8, filter: "drop-shadow(0 0 2px #00c8ff)" } :
                  isInteracting
                    ? { 
                        opacity: [0.8, 0.1, 0.9, 0.3, 1, 0.2, 0.8],
                        filter: [
                           "drop-shadow(0 0 2px #00c8ff)",
                           "drop-shadow(0 0 10px #00c8ff)",
                           "drop-shadow(0 0 2px #00c8ff)",
                           "drop-shadow(0 0 8px #00c8ff)",
                           "drop-shadow(0 0 2px #00c8ff)",
                           "drop-shadow(0 0 12px #00c8ff)",
                           "drop-shadow(0 0 2px #00c8ff)"
                        ]
                      }
                    : { 
                        opacity: [0.8, 0.5, 0.8], 
                        filter: [
                           "drop-shadow(0 0 2px #00c8ff)",
                           "drop-shadow(0 0 5px #00c8ff)",
                           "drop-shadow(0 0 2px #00c8ff)"
                        ]
                      }
                }
                transition={
                  !isInView ? { duration: 0 } :
                  isInteracting
                    ? { duration: 3, ease: "easeInOut" }
                    : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
              />
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Hero-specific UI tags */}
      {isHero && (
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 1 }}
           className="absolute -right-16 sm:-right-32 top-10 hidden lg:flex flex-col gap-2 z-30 pointer-events-none"
        >
          <div className="bg-black/90 backdrop-blur-xl border border-blue-500/40 shadow-[0_0_15px_rgba(0,200,255,0.3)] px-4 py-2 rounded-xl">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00c8ff] animate-pulse" />
                <span className="text-[10px] font-mono font-black text-white tracking-widest uppercase">Kernel_Online</span>
             </div>
          </div>
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
             <span className="text-[10px] font-mono text-slate-400">SYSTEM: OPTIMAL</span>
          </div>
        </motion.div>
      )}
    </div>
    <SDRWebhookModal isOpen={isWebhookModalOpen} onClose={() => setIsWebhookModalOpen(false)} />
    </>
  );
};
