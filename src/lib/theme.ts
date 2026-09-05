export interface BrandColorOption {
  id: "blue" | "purple" | "orange" | "green";
  label: string;
  hex: string;
}

/** As 4 cores de marca do S.P.Y. — mesmas do mockup do logo. Usadas como tema
 * por tenant (tenants.primary_color) e como paleta do componente <Logo>. */
export const BRAND_COLORS: BrandColorOption[] = [
  { id: "blue", label: "Azul", hex: "#2563EB" },
  { id: "purple", label: "Roxo", hex: "#7C3AED" },
  { id: "orange", label: "Laranja", hex: "#F97316" },
  { id: "green", label: "Verde", hex: "#4ADE80" },
];

export const DEFAULT_BRAND_COLOR = BRAND_COLORS[0].hex;
