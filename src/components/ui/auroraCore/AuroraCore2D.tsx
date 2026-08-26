import { useEffect, useRef } from "react";
import { colorForMode, pulseSpeedForMode, rgbToCss, type AuroraCoreMode } from "./auroraCoreStates";

interface AuroraCore2DProps {
  mode: AuroraCoreMode;
  size: number;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  scale: number;
}

/**
 * Núcleo leve da Aurora — Canvas 2D puro (sem WebGL), pra não pesar o bundle do CRM. Desenha um
 * glow radial pulsante + anel + partículas orbitando, na mesma paleta/velocidade de pulso do
 * núcleo 3D real (auroraCoreStates.ts), só que sem depender de Three.js.
 */
export function AuroraCore2D({ mode, size }: AuroraCore2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * Math.PI * 2,
      radius: 0.72 + Math.random() * 0.15,
      speed: 0.3 + Math.random() * 0.25,
      scale: 0.5 + Math.random() * 0.5,
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const currentMode = modeRef.current;
      const [r, g, b] = colorForMode(currentMode);
      const pulseSpeed = pulseSpeedForMode(currentMode);
      const cx = size / 2;
      const cy = size / 2;
      const baseR = size * 0.28;
      const pulse = 1 + Math.sin(t * pulseSpeed) * 0.08;

      ctx.clearRect(0, 0, size, size);

      // Glow radial de fundo
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.2 * pulse);
      glow.addColorStop(0, rgbToCss([r, g, b], 0.45));
      glow.addColorStop(0.5, rgbToCss([r, g, b], 0.12));
      glow.addColorStop(1, rgbToCss([r, g, b], 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 2.2 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo sólido
      ctx.fillStyle = rgbToCss([r, g, b], 0.85);
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Anel de contenção
      ctx.strokeStyle = rgbToCss([r, g, b], 0.55);
      ctx.lineWidth = Math.max(1, size * 0.018);
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.55, t * 0.4, t * 0.4 + Math.PI * 1.5);
      ctx.stroke();

      // Partículas orbitando
      for (const p of particlesRef.current) {
        const angle = p.angle + t * p.speed;
        const px = cx + Math.cos(angle) * baseR * p.radius * 2.1;
        const py = cy + Math.sin(angle) * baseR * p.radius * 2.1;
        ctx.fillStyle = rgbToCss([r, g, b], 0.7);
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, size * 0.016 * p.scale), 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="block" />;
}
