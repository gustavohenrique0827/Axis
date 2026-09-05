import * as React from "react";

export type LogoColorId = "blue" | "purple" | "orange" | "teal";

export const LOGO_COLORS: Record<LogoColorId, string> = {
  blue: "#2563EB",
  purple: "#7C3AED",
  orange: "#F97316",
  teal: "#06B6D4",
};

export interface LogoProps {
  /** "icon" = só o símbolo (chapéu + mira). "full" = símbolo + wordmark "S.P.Y." */
  variant?: "icon" | "full";
  /** Uma das 4 cores de marca, ou qualquer hex customizado (ex.: tenant.primary_color). */
  color?: LogoColorId | (string & {});
  size?: number;
  className?: string;
}

function resolveColor(color: LogoProps["color"]): string {
  if (!color) return LOGO_COLORS.blue;
  if (color in LOGO_COLORS) return LOGO_COLORS[color as LogoColorId];
  return color;
}

/** Ícone de marca: chapéu de espião dentro de uma mira circular. */
function LogoMark({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" role="img" aria-label="S.P.Y.">
      <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="5" />
      <line x1="50" y1="2" x2="50" y2="16" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="84" x2="50" y2="98" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="2" y1="50" x2="16" y2="50" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <line x1="84" y1="50" x2="98" y2="50" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M27 47c0-13 10-23 23-23s23 10 23 23c8 1 13 5 13 9H14c0-4 5-8 13-9Z"
        fill={color}
      />
      <rect x="18" y="54" width="64" height="7" rx="3.5" fill={color} />
      <ellipse cx="38" cy="64" rx="7" ry="5" fill="#0B1120" />
      <ellipse cx="62" cy="64" rx="7" ry="5" fill="#0B1120" />
    </svg>
  );
}

/** Logo da S.P.Y. — ícone sozinho ou com o wordmark, na cor de marca do tenant (4 opções ou hex custom). */
export function Logo({ variant = "full", color, size = 32, className }: LogoProps) {
  const hex = resolveColor(color);
  if (variant === "icon") {
    return (
      <span className={className}>
        <LogoMark color={hex} size={size} />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark color={hex} size={size} />
      <span
        className="font-bold tracking-[0.15em] leading-none"
        style={{ fontSize: size * 0.5, color: hex }}
      >
        S.P.Y.
      </span>
    </span>
  );
}
