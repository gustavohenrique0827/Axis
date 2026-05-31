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

// Log Supabase configuration status
if (!supabase) {
  console.warn(
    "Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set. " +
    "Axis CRM will fall back to local offline storage persistence automatically."
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
