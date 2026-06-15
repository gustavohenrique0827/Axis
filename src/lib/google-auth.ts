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

let cachedToken: CachedToken | null = null;

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

export const googleSignIn = async (): Promise<{ user: GoogleUser; accessToken: string } | null> => {
  const loaded = await waitForGIS();
  if (!loaded) {
    throw new Error(
      "Google Identity Services não carregou. Verifique sua conexão e recarregue a página."
    );
  }

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("Credencial Google não configurada. Contate o administrador.");
  }

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: async (response: any) => {
        if (response.error) {
          if (["access_denied", "user_cancelled"].includes(response.error)) {
            resolve(null);
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
        resolve({ user: { email, displayName: null }, accessToken: response.access_token });
      },
      error_callback: (err: any) => {
        if (["popup_closed", "popup_failed_to_open"].includes(err?.type ?? "")) {
          resolve(null);
          return;
        }
        reject(new Error(err?.message || "Erro ao autenticar com Google"));
      },
    });
    client.requestAccessToken();
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token;
  }
  cachedToken = null;
  return null;
};

export const logout = async () => {
  if (cachedToken?.access_token && isGISLoaded()) {
    window.google.accounts.oauth2.revoke(cachedToken.access_token, () => {});
  }
  cachedToken = null;
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
