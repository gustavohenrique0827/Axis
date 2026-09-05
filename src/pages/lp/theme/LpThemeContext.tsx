import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { LP_THEMES, DEFAULT_LP_THEME_ID, type LpTheme } from "./LP_THEMES";

interface LpThemeContextValue {
  theme: LpTheme;
  setThemeId: (id: LpTheme["id"]) => void;
  /** rgba helper: glow(0.15) → "rgba(r,g,b,0.15)" usando a primary do tema */
  glow: (alpha: number) => string;
}

const LpThemeContext = createContext<LpThemeContextValue | undefined>(undefined);

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function LpThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: LpTheme["id"];
}) {
  const [themeId, setThemeId] = useState<LpTheme["id"]>(initialTheme ?? DEFAULT_LP_THEME_ID);
  const theme = LP_THEMES[themeId];

  const [r, g, b] = hexToRgb(theme.primary);
  const glow = (alpha: number) => `rgba(${r},${g},${b},${alpha})`;

  return (
    <LpThemeContext.Provider value={{ theme, setThemeId, glow }}>
      {children}
    </LpThemeContext.Provider>
  );
}

export function useLpTheme(): LpThemeContextValue {
  const ctx = useContext(LpThemeContext);
  if (!ctx) throw new Error("useLpTheme must be used inside <LpThemeProvider>");
  return ctx;
}
