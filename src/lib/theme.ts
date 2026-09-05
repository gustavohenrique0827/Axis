export interface BrandColorOption {
  id: "blue" | "purple" | "orange" | "teal";
  label: string;
  hex: string;
}

/** As 4 cores de marca do S.P.Y. — mesmas do mockup do logo. Usadas como tema
 * por tenant (tenants.primary_color) e como paleta do componente <Logo>. */
export const BRAND_COLORS: BrandColorOption[] = [
  { id: "blue", label: "Azul", hex: "#2563EB" },
  { id: "purple", label: "Roxo", hex: "#7C3AED" },
  { id: "orange", label: "Laranja", hex: "#F97316" },
  { id: "teal", label: "Teal", hex: "#06B6D4" },
];

export const DEFAULT_BRAND_COLOR = BRAND_COLORS[0].hex;
