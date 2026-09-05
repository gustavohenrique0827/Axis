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

export const LAST_TENANT_COLOR_KEY = "spy_last_tenant_color";
export const LAST_TENANT_NAME_KEY  = "spy_last_tenant_name";

/**
 * Gera o SVG do Favicon oficial do S.P.Y. (mira, chapéu e óculos de espião)
 * customizado dinamicamente com a cor primária escolhida.
 */
export function generateFaviconSvg(hex: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#0B1120"/>
  <circle cx="50" cy="50" r="38" stroke="${hex}" stroke-width="5" fill="none"/>
  <line x1="50" y1="6"  x2="50" y2="18" stroke="${hex}" stroke-width="5" stroke-linecap="round"/>
  <line x1="50" y1="82" x2="50" y2="94" stroke="${hex}" stroke-width="5" stroke-linecap="round"/>
  <line x1="6"  y1="50" x2="18" y2="50" stroke="${hex}" stroke-width="5" stroke-linecap="round"/>
  <line x1="82" y1="50" x2="94" y2="50" stroke="${hex}" stroke-width="5" stroke-linecap="round"/>
  <path d="M27 47c0-13 10-23 23-23s23 10 23 23c8 1 13 5 13 9H14c0-4 5-8 13-9Z" fill="${hex}"/>
  <rect x="17" y="53" width="66" height="8" rx="4" fill="${hex}"/>
  <rect x="29" y="58" width="17" height="10" rx="5" fill="#0B1120"/>
  <rect x="54" y="58" width="17" height="10" rx="5" fill="#0B1120"/>
  <rect x="46" y="61" width="8" height="3" rx="1.5" fill="#0B1120"/>
</svg>`;
}

/**
 * Atualiza dinamicamente o favicon na aba do navegador com a cor informada.
 */
export function updateFaviconColor(hex: string) {
  if (typeof document === "undefined" || !hex) return;
  const svg = generateFaviconSvg(hex);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const selectors = ["link[rel~='icon']", "link[rel='apple-touch-icon']"];
  let updated = false;

  selectors.forEach((sel) => {
    document.querySelectorAll<HTMLLinkElement>(sel).forEach((link) => {
      link.href = dataUri;
      updated = true;
    });
  });

  if (!updated) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = dataUri;
    document.head.appendChild(link);
  }
}

/**
 * Aplica a cor do tema nas variáveis CSS globais e no favicon.
 */
export function applyThemeColor(hex: string, tenantName?: string) {
  if (typeof document === "undefined" || !hex) return;
  document.documentElement.style.setProperty("--color-primary-blue", hex);
  document.documentElement.style.setProperty("--primary", hex);
  updateFaviconColor(hex);
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_TENANT_COLOR_KEY, hex);
    if (tenantName) {
      localStorage.setItem(LAST_TENANT_NAME_KEY, tenantName);
    }
  }
}

export function getSavedThemeColor(): string {
  if (typeof window === "undefined") return DEFAULT_BRAND_COLOR;
  return localStorage.getItem(LAST_TENANT_COLOR_KEY) || DEFAULT_BRAND_COLOR;
}
