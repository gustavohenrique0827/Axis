import type { LogoColorId } from "../../../components/ui/Logo";

export interface LpTheme {
  id: "blue" | "purple" | "orange" | "green";
  label: string;
  /** Cor primária hex */
  primary: string;
  /** Variação escura para hover */
  primaryDark: string;
  /** Variação clara para backgrounds sutis */
  primaryLight: string;
  /** LogoColorId para o componente <Logo> */
  logoColor: LogoColorId;
  /** Gradiente do título hero — string CSS completo */
  heroGradient: string;
  /** Gradiente do accent glow hero (orbs de fundo) */
  glowColor: string;
  glowColorAlt: string;
  /** Classes Tailwind para botão CTA primário */
  ctaClass: string;
  /** Classes Tailwind para botão CTA outline */
  ctaOutlineClass: string;
  /** Classes Tailwind para badge/pill destaque */
  badgeClass: string;
  /** Ícone de kicker (quadradinho rotacionado) — color stop pair */
  kickerGradient: string;
  /** Classe de texto para kicker */
  kickerTextClass: string;
  /** ACCENT_GRADIENT para texto gradiente inline */
  accentTextGradient: string;
  /** Classes do plano em destaque (cards de planos) */
  highlightPlanBorder: string;
  highlightPlanBg: string;
  highlightPlanShadow: string;
}

export const LP_THEMES: Record<LpTheme["id"], LpTheme> = {
  blue: {
    id: "blue",
    label: "Azul",
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#DBEAFE",
    logoColor: "blue",
    heroGradient: "linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #7C3AED 100%)",
    glowColor: "#2563EB",
    glowColorAlt: "#7C3AED",
    ctaClass:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20",
    ctaOutlineClass:
      "border border-slate-300 text-slate-900 hover:bg-slate-50",
    badgeClass:
      "border border-blue-200 bg-blue-50 text-blue-700",
    kickerGradient: "from-blue-400 to-violet-500",
    kickerTextClass: "text-blue-600",
    accentTextGradient:
      "bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent",
    highlightPlanBorder: "border-blue-300",
    highlightPlanBg: "bg-gradient-to-b from-blue-50 to-white",
    highlightPlanShadow: "shadow-xl shadow-blue-500/15",
  },

  purple: {
    id: "purple",
    label: "Roxo",
    primary: "#7C3AED",
    primaryDark: "#6D28D9",
    primaryLight: "#EDE9FE",
    logoColor: "purple",
    heroGradient: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #EC4899 100%)",
    glowColor: "#7C3AED",
    glowColorAlt: "#EC4899",
    ctaClass:
      "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20",
    ctaOutlineClass:
      "border border-violet-200 text-violet-900 hover:bg-violet-50",
    badgeClass:
      "border border-violet-200 bg-violet-50 text-violet-700",
    kickerGradient: "from-violet-400 to-pink-500",
    kickerTextClass: "text-violet-600",
    accentTextGradient:
      "bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 bg-clip-text text-transparent",
    highlightPlanBorder: "border-violet-300",
    highlightPlanBg: "bg-gradient-to-b from-violet-50 to-white",
    highlightPlanShadow: "shadow-xl shadow-violet-500/15",
  },

  orange: {
    id: "orange",
    label: "Laranja",
    primary: "#F97316",
    primaryDark: "#EA580C",
    primaryLight: "#FFEDD5",
    logoColor: "orange",
    heroGradient: "linear-gradient(135deg, #FCD34D 0%, #F97316 50%, #EF4444 100%)",
    glowColor: "#F97316",
    glowColorAlt: "#EF4444",
    ctaClass:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-900/20",
    ctaOutlineClass:
      "border border-orange-200 text-orange-900 hover:bg-orange-50",
    badgeClass:
      "border border-orange-200 bg-orange-50 text-orange-700",
    kickerGradient: "from-amber-400 to-orange-500",
    kickerTextClass: "text-orange-600",
    accentTextGradient:
      "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent",
    highlightPlanBorder: "border-orange-300",
    highlightPlanBg: "bg-gradient-to-b from-orange-50 to-white",
    highlightPlanShadow: "shadow-xl shadow-orange-500/15",
  },

  green: {
    id: "green",
    label: "Verde",
    primary: "#4ADE80",
    primaryDark: "#16A34A",
    primaryLight: "#DCFCE7",
    logoColor: "green",
    heroGradient: "linear-gradient(135deg, #86EFAC 0%, #4ADE80 50%, #22C55E 100%)",
    glowColor: "#4ADE80",
    glowColorAlt: "#22C55E",
    ctaClass:
      "bg-[#4ADE80] hover:bg-[#22C55E] text-slate-900 font-bold shadow-lg shadow-green-900/20",
    ctaOutlineClass:
      "border border-green-300 text-green-900 hover:bg-green-50",
    badgeClass:
      "border border-green-300 bg-green-50 text-green-700",
    kickerGradient: "from-green-400 to-emerald-500",
    kickerTextClass: "text-green-600",
    accentTextGradient:
      "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent",
    highlightPlanBorder: "border-green-300",
    highlightPlanBg: "bg-gradient-to-b from-green-50 to-white",
    highlightPlanShadow: "shadow-xl shadow-green-500/15",
  },
};

export const DEFAULT_LP_THEME_ID: LpTheme["id"] = "blue";
