import { supabase } from './supabase';

/**
 * fetch() para as rotas internas do S.P.Y. (/api/ai/*, /api/whatsapp/*,
 * /api/settings/*, /api/leads/*) — todas exigem uma sessão real do Supabase
 * Auth (ver requireUser em server.ts). Anexa automaticamente o header
 * Authorization com o access_token da sessão atual.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  return fetch(input, { ...init, headers });
}
