// Cliente Google Identity Services (GIS) dedicado à sincronização com Google
// Tasks (useTarefas.ts) — API diferente do Google Calendar, não migrada pro
// fluxo server-side em server/googleCalendar.ts nesta rodada (ver relatório
// da auditoria multi-tenant do Google Calendar). Mantido isolado aqui, e não
// mais reexportado de google-auth.ts, porque google-auth.ts agora só fala
// com o backend e nunca guarda token nenhum no browser. O access_token de
// curta duração (GIS implicit flow nunca dá refresh_token) vive só em memória
// nesta aba — sem nenhuma persistência local — então um reload exige
// reconectar a conta Google novamente.
declare global {
  interface Window { google: any; }
}

const SCOPES = [
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/tasks.readonly",
  "email",
  "profile",
].join(" ");

export interface GoogleUser {
  email: string | null;
  displayName?: string | null;
}

interface CachedToken {
  access_token: string;
  expires_at: number;
  email?: string;
}

const cachedTokens = new Map<string, CachedToken>();

function isGISLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.google !== "undefined" &&
    typeof window.google.accounts?.oauth2 !== "undefined"
  );
}

async function waitForGIS(maxMs = 8000): Promise<boolean> {
  if (isGISLoaded()) return true;
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (isGISLoaded()) { resolve(true); return; }
      if (Date.now() - start > maxMs) { resolve(false); return; }
      setTimeout(check, 150);
    };
    check();
  });
}

export const googleSignIn = async (tenantId: string): Promise<{ user: GoogleUser; accessToken: string }> => {
  const loaded = await waitForGIS();
  if (!loaded) throw new Error("Google Identity Services não carregou. Verifique sua conexão e recarregue a página.");

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error("Credencial Google (VITE_GOOGLE_CLIENT_ID) não configurada no .env.");

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error) {
            if (["access_denied", "user_cancelled"].includes(response.error)) {
              reject(new Error("Acesso cancelado ou não autorizado pelo usuário no Google."));
              return;
            }
            reject(new Error(response.error_description || response.error));
            return;
          }
          const expiresAt = Date.now() + (parseInt(response.expires_in) || 3600) * 1000;
          let email: string | null = null;
          try {
            const r = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` },
            });
            if (r.ok) email = (await r.json())?.email ?? null;
          } catch {}
          const token: CachedToken = { access_token: response.access_token, expires_at: expiresAt, email: email ?? undefined };
          cachedTokens.set(tenantId, token);
          resolve({ user: { email, displayName: null }, accessToken: response.access_token });
        },
        error_callback: (err: any) => {
          if (err?.type === "popup_failed_to_open") {
            reject(new Error("O navegador bloqueou a janela pop-up do Google. Permita pop-ups para este site nas opções do navegador e tente novamente."));
            return;
          }
          if (err?.type === "popup_closed") {
            reject(new Error("A janela de conexão Google foi fechada antes de autorizar."));
            return;
          }
          reject(new Error(err?.message || "Erro ao conectar conta Google. Verifique se a origem está autorizada no Google Cloud Console."));
        },
      });
      client.requestAccessToken({ prompt: "" });
    } catch (e: any) {
      reject(new Error("Falha ao inicializar autenticação Google: " + (e?.message || e)));
    }
  });
};

export const getAccessToken = async (tenantId: string): Promise<string | null> => {
  const cached = cachedTokens.get(tenantId);
  if (cached && cached.expires_at > Date.now() + 60_000) return cached.access_token;
  cachedTokens.delete(tenantId);
  return null;
};

export const logout = async (tenantId: string) => {
  const cached = cachedTokens.get(tenantId);
  if (cached?.access_token && isGISLoaded()) {
    try { window.google.accounts.oauth2.revoke(cached.access_token, () => {}); } catch {}
  }
  cachedTokens.delete(tenantId);
};

export const initAuth = (
  tenantId: string,
  onAuthSuccess?: (user: GoogleUser, token: string) => void,
  onAuthFailure?: () => void
): (() => void) => {
  getAccessToken(tenantId).then((token) => {
    const cached = cachedTokens.get(tenantId);
    if (token && cached) onAuthSuccess?.({ email: cached.email ?? null }, token);
    else onAuthFailure?.();
  });
  return () => {};
};
