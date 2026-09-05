/**
 * Estados visuais do núcleo da Aurora — mesmo modelo usado no núcleo 3D real dela no jarvis-os
 * (src/state/slices/sphereSlice.ts + src/components/sphere/sphereMoods.ts), portado aqui pra
 * manter a identidade visual consistente entre os dois apps.
 *
 * O S.P.Y. hoje só tem chat de texto (sem voz, sem execução de ferramenta visível separada do
 * "pensando") — por isso só "idle" | "thinking" | "speaking" | "error" são realmente usados por
 * AuroraWidget.tsx agora. Os demais ficam definidos aqui pra quando o S.P.Y. ganhar voz/execução
 * de verdade, sem fingir que já existe.
 */
export type AuroraCoreMode =
  | "idle"
  | "listening"
  | "thinking"
  | "analyzing"
  | "speaking"
  | "executing"
  | "warning"
  | "success"
  | "error";

export type AuroraCoreMood = "neutral" | "positive" | "alert";

export const MOOD_COLOR: Record<AuroraCoreMood, [number, number, number]> = {
  neutral: [0.31, 0.84, 1.0],
  positive: [0.36, 1.0, 0.69],
  alert: [1.0, 0.36, 0.48],
};

export const MODE_PULSE_SPEED: Record<AuroraCoreMode, number> = {
  idle: 0.6,
  listening: 1.4,
  thinking: 2.2,
  analyzing: 2.6,
  speaking: 1.8,
  executing: 2.4,
  warning: 1.5,
  success: 1.0,
  error: 0.9,
};

export const MODE_COLOR_OVERRIDE: Partial<Record<AuroraCoreMode, [number, number, number]>> = {
  analyzing: [0.72, 0.35, 1.0], // Violet / Holographic Magenta
  executing: [0.2, 0.95, 0.65], // Emerald Tech Neon
  warning: [1.0, 0.72, 0.18], // Amber warning
  success: [0.15, 1.0, 0.85], // Bright Cyan-Green Success
  error: [1.0, 0.28, 0.38], // Vivid Crimson
};

export function colorForMode(mode: AuroraCoreMode, mood: AuroraCoreMood = "neutral"): [number, number, number] {
  return MODE_COLOR_OVERRIDE[mode] ?? MOOD_COLOR[mood];
}

export function pulseSpeedForMode(mode: AuroraCoreMode): number {
  return MODE_PULSE_SPEED[mode] ?? 0.6;
}

export function rgbToCss([r, g, b]: [number, number, number], alpha = 1): string {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}
