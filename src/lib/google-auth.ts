declare global {
  interface Window { google: any; }
}

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/meetings.space.created",
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

const STORAGE_KEY = "spy_google_auth_token";

function getStoredToken(): CachedToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: CachedToken = JSON.parse(raw);
    if (parsed.expires_at && parsed.expires_at > Date.now() + 60_000) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return null;
}

function setStoredToken(token: CachedToken | null) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

let cachedToken: CachedToken | null = getStoredToken();

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

export const googleSignIn = async (): Promise<{ user: GoogleUser; accessToken: string }> => {
  const loaded = await waitForGIS();
  if (!loaded) {
    throw new Error(
      "Google Identity Services não carregou. Verifique sua conexão e recarregue a página."
    );
  }

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("Credencial Google (VITE_GOOGLE_CLIENT_ID) não configurada no .env.");
  }

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
            if (r.ok) {
              const info = await r.json();
              email = info.email ?? null;
            }
          } catch {}
          cachedToken = { access_token: response.access_token, expires_at: expiresAt, email: email ?? undefined };
          setStoredToken(cachedToken);
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

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedToken) {
    cachedToken = getStoredToken();
  }
  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token;
  }
  cachedToken = null;
  setStoredToken(null);
  return null;
};

export const getGoogleUserEmail = (): string | null => {
  if (!cachedToken) {
    cachedToken = getStoredToken();
  }
  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.email ?? null;
  }
  return null;
};

export const logout = async () => {
  if (cachedToken?.access_token && isGISLoaded()) {
    try {
      window.google.accounts.oauth2.revoke(cachedToken.access_token, () => {});
    } catch {}
  }
  cachedToken = null;
  setStoredToken(null);
};

export const initAuth = (
  onAuthSuccess?: (user: GoogleUser, token: string) => void,
  onAuthFailure?: () => void
): (() => void) => {
  getAccessToken().then((token) => {
    if (token && cachedToken) {
      onAuthSuccess?.({ email: cachedToken.email ?? null }, token);
    } else {
      onAuthFailure?.();
    }
  });
  return () => {};
};
