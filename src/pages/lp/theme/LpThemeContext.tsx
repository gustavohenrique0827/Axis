import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { LP_THEMES, DEFAULT_LP_THEME_ID, type LpTheme } from "./LP_THEMES";
import { BRAND_COLORS, LAST_TENANT_COLOR_KEY, updateFaviconColor } from "../../../lib/theme";

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
  const [themeId, setThemeId] = useState<LpTheme["id"]>(() => {
    if (initialTheme) return initialTheme;
    if (typeof window !== "undefined") {
      const savedHex = localStorage.getItem(LAST_TENANT_COLOR_KEY);
      if (savedHex) {
        const found = BRAND_COLORS.find(
          (b) => b.hex.toLowerCase() === savedHex.toLowerCase()
        );
        if (found) return found.id as LpTheme["id"];
      }
    }
    return DEFAULT_LP_THEME_ID;
  });
  const theme = LP_THEMES[themeId];

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary-blue", theme.primary);
    document.documentElement.style.setProperty("--primary", theme.primary);
    updateFaviconColor(theme.primary);
  }, [theme.primary]);

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
