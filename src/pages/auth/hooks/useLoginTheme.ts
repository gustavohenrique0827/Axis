import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { DEFAULT_BRAND_COLOR } from "../../../lib/theme";

const LAST_TENANT_COLOR_KEY = "spy_last_tenant_color";
const LAST_TENANT_NAME_KEY  = "spy_last_tenant_name";

/** Busca o primary_color de um tenant pelo nome (match case-insensitive parcial). */
async function fetchColorByTenantName(name: string): Promise<string | null> {
  if (!supabase || !name.trim()) return null;
  try {
    const { data } = await supabase
      .from("tenants")
      .select("primary_color, name")
      .ilike("name", `%${name.trim()}%`)
      .eq("status", "Active")
      .maybeSingle();
    return data?.primary_color ?? null;
  } catch {
    return null;
  }
}

/** Tenta inferir o nome do tenant a partir do domínio do e-mail.
 *  Ex: "maria@solarcorp.com.br" → "solarcorp" */
function domainFromEmail(email: string): string {
  const match = email.match(/@([^@]+)$/);
  if (!match) return "";
  const parts = match[1].split(".");
  // Remove TLDs comuns (com, com.br, io, app, etc.) e pega a parte principal
  const tld = ["com", "org", "net", "io", "app", "br"];
  const meaningful = parts.filter(
    (p) => p.length > 2 && !tld.includes(p.toLowerCase())
  );
  return meaningful[0] ?? "";
}

interface LoginTheme {
  /** Cor primária resolvida (hex) */
  primaryColor: string;
  /** Nome do tenant identificado (ou vazio) */
  tenantName: string;
  /** true enquanto busca a cor no Supabase */
  resolving: boolean;
  /** Chama quando o e-mail muda para re-resolver a cor */
  resolveFromEmail: (email: string) => void;
}

/**
 * Hook que resolve a cor de marca do tenant *antes* do login,
 * usando duas estratégias em cascata:
 *   1. última cor salva em localStorage (sessão anterior)
 *   2. inferência pelo domínio do e-mail digitado → busca no Supabase
 *
 * Aplica a cor como CSS custom property em :root automaticamente.
 */
export function useLoginTheme(): LoginTheme {
  const savedColor = typeof window !== "undefined"
    ? localStorage.getItem(LAST_TENANT_COLOR_KEY) ?? DEFAULT_BRAND_COLOR
    : DEFAULT_BRAND_COLOR;

  const savedName = typeof window !== "undefined"
    ? localStorage.getItem(LAST_TENANT_NAME_KEY) ?? ""
    : "";

  const [primaryColor, setPrimaryColor] = useState<string>(savedColor);
  const [tenantName, setTenantName]     = useState<string>(savedName);
  const [resolving, setResolving]       = useState(false);

  // Aplica a cor como CSS var sempre que muda
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary-blue", primaryColor);
    document.documentElement.style.setProperty("--primary", primaryColor);
  }, [primaryColor]);

  // Debounce: espera 600ms após o usuário parar de digitar para buscar
  const resolveFromEmail = useCallback((email: string) => {
    const domain = domainFromEmail(email);
    if (!domain) return;

    let cancelled = false;
    setResolving(true);

    const timer = setTimeout(async () => {
      const color = await fetchColorByTenantName(domain);
      if (cancelled) return;
      if (color) {
        setPrimaryColor(color);
        setTenantName(domain);
        localStorage.setItem(LAST_TENANT_COLOR_KEY, color);
        localStorage.setItem(LAST_TENANT_NAME_KEY, domain);
      }
      setResolving(false);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return { primaryColor, tenantName, resolving, resolveFromEmail };
}

/**
 * Persiste a cor do tenant *após* o login bem-sucedido,
 * para que na próxima vez já apareça na tela de login.
 */
export function persistTenantTheme(color: string, name: string) {
  if (!color) return;
  localStorage.setItem(LAST_TENANT_COLOR_KEY, color);
  localStorage.setItem(LAST_TENANT_NAME_KEY, name);
}
