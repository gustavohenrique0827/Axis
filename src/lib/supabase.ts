import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string): string {
  try {
    const parsed = new URL((url || '').trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Initialize client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log Supabase configuration status for debugging
if (supabase) {
  console.log('[Supabase] ✅ Configurado e pronto para uso');
} else {
  console.warn(
    '[Supabase] ⚠️ NÃO CONFIGURADO\n' +
    'URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Definida' : '✗ Não definida', '\n' +
    'ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Definida' : '✗ Não definida', '\n' +
    'Ação: Reinicie o servidor Vite após configurar .env (npm run dev)'
  );
}

// Persistência em sessão para evitar tentativas repetitivas de DNS que geram erros no console
const CONNECTION_CACHE_KEY = 'axis_supabase_connection_status';
let isReachableCache: boolean | null = (() => {
  if (typeof window === 'undefined') return null;
  const saved = sessionStorage.getItem(CONNECTION_CACHE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return null;
})();

let reachabilityPromise: Promise<boolean> | null = null;

/**
 * Tests if Supabase is actually reachable (not just configured).
 * Returns false if the URL fails to resolve (ERR_NAME_NOT_RESOLVED, timeout, etc.)
 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (isReachableCache !== null) {
    return isReachableCache;
  }

  if (reachabilityPromise) {
    return reachabilityPromise;
  }

  // Se o navegador estiver offline, não tentamos a conexão
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

  if (!supabase || !supabaseUrl) return false;

  reachabilityPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      isReachableCache = res.ok || res.status === 400;
    } catch {
      // Falha de resolução de nome (DNS) ou rede
      isReachableCache = false;
    } finally {
      if (typeof window !== 'undefined' && isReachableCache !== null) {
        sessionStorage.setItem(CONNECTION_CACHE_KEY, String(isReachableCache));
      }
      reachabilityPromise = null;
    }
    return isReachableCache;
  })();

  return reachabilityPromise;
}

/**
 * Hash password using basic implementation (consider bcrypt in production)
 */
export function hashPassword(password: string): string {
  // For now, use a simple approach. In production, use bcryptjs library
  // This is a placeholder - in real app, use bcrypt on backend
  return btoa(password + Date.now().toString());
}

/**
 * Register a new partner company and admin user
 */
export async function registerPartner(
  companyName: string,
  email: string,
  password: string,
  phone: string,
  niche: string
): Promise<{ success: boolean; error?: string; userId?: string; tenantId?: string }> {
  if (!supabase) {
    const errorMsg = 'Supabase não está configurado. Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY faltam. Reinicie o servidor (npm run dev) após configurar .env';
    console.error('[Register] ' + errorMsg);
    console.error('[Env Debug] URL:', import.meta.env.VITE_SUPABASE_URL);
    console.error('[Env Debug] KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
    return { success: false, error: errorMsg };
  }

  try {
    // 1. Create tenant (company)
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: companyName,
        niche: niche || "Parceira",
        plan: "Standard",
        status: "Active",
        timezone: "America/Sao_Paulo"
      })
      .select()
      .single();

    if (tenantError || !tenantData) {
      const errMsg = `Erro ao criar empresa: ${tenantError?.message || "Unknown error"}`;
      console.error('[Register] ' + errMsg, tenantError);
      return { success: false, error: errMsg };
    }

    // 2. Create admin user for tenant
    const passwordHash = hashPassword(password);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        tenant_id: tenantData.id,
        name: `Admin ${companyName}`,
        email: email,
        password_hash: passwordHash,
        role: "Admin",
        is_master: false,
        active: true
      })
      .select()
      .single();

    if (userError || !userData) {
      // Rollback tenant if user creation fails
      await supabase.from("tenants").delete().eq("id", tenantData.id);
      const errMsg = `Erro ao criar usuário: ${userError?.message || "Unknown error"}`;
      console.error('[Register] ' + errMsg, userError);
      return { success: false, error: errMsg };
    }

    console.log('[Register] ✅ Parceiro registrado com sucesso', { tenantId: tenantData.id, userId: userData.id });
    return {
      success: true,
      userId: userData.id,
      tenantId: tenantData.id
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Erro desconhecido no registro";
    console.error('[Register] ' + errMsg, err);
    return { success: false, error: errMsg };
  }
}
