import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase, fetchTenants, fetchTenantIdMap, fetchUserProfile, updateTenantModulesInDB } from "../lib/supabase";

export type TenantNiche = "Master" | "Solar" | "Imobiliária" | "Clínica" | "Tecnologia" | "Parceira";

export interface UserSession {
  /** public.users.id — ausente em sessões demo (sem Supabase Auth real). */
  id?: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantName: string;
  tenantNiche: TenantNiche;
  isMaster: boolean;
  /** Preenchido só para usuários de organizações parceiras (G-Tech, Pluppex Holding,
   *  outras parceiras) — origem: public.users.partner_id / public.partners. */
  partnerId?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  preferences?: Record<string, any>;
}

export type TenantModules = Record<string, boolean>;

interface AuthContextType {
  user: UserSession | null;
  authLoading: boolean;
  login: (user: UserSession) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updatePreferences: (partial: Record<string, any>) => Promise<void>;
  isModuleEnabled: (moduleName: keyof TenantModules) => boolean;
  updateTenantModules: (tenantName: string, modules: TenantModules) => Promise<void>;
  getTenantModules: (tenantName: string) => TenantModules;
  allTenantModules: Record<string, TenantModules>;
  tenantIdMap: Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sessões demo (Acesso Demonstração) não passam pelo Supabase Auth — não há
// JWT/cookie real para o supabase-js persistir sozinho entre reloads. Guardamos
// aqui como fallback (sessionStorage, não localStorage: some ao fechar a aba)
// para essas sessões, e como rede de segurança caso o client do Supabase não
// esteja configurado no ambiente.
const AXIS_SESSION_KEY = "axis_user_session";

function readSavedSession(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(AXIS_SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

// Módulos padrão dos tenants demo — carregados localmente como fallback quando Supabase não está acessível
const DEFAULT_TENANT_MODULES: Record<string, TenantModules> = {
  "G-Tech Master": {
    crm: true, sdr: true, advDashboard: true, financeiro: true, marketing: true,
    educacao: true, clinica: true, produtividade: true, rh: true, bi: true,
    engajamento: true, catalogo: true, dev: true, aurora: true
  },
  "SolarCorp Engenharia": {
    crm: true, financeiro: true, produtividade: true, marketing: true, bi: true, rh: true, engajamento: true
  },
  "Imobiliária Prime": {
    crm: true, financeiro: true, produtividade: true, marketing: true, bi: true, rh: true, catalogo: true, imobiliario: true
  },
  "Clínica Vida": {
    clinica: true, crm: true, financeiro: true, produtividade: true, rh: true, engajamento: true, bi: true
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  // Começa "true" até a sessão do Supabase Auth (getSession) ser resolvida —
  // evita redirecionar para /login por uma fração de segundo em cada refresh
  // enquanto a sessão real (cookie/localStorage do próprio supabase-js) carrega.
  const [authLoading, setAuthLoading] = useState(true);

  // Start with only G-Tech Master, always load from Supabase
  const [allTenantModules, setAllTenantModules] = useState<Record<string, TenantModules>>(DEFAULT_TENANT_MODULES);
  // tenantIdMap: name → UUID (ex: "PLUPPEX DIGITAL MACHINES LTDA" → "27ef95ee-...")
  const [tenantIdMap, setTenantIdMap] = useState<Record<string, string>>({});

  // Fonte de verdade da sessão: Supabase Auth (JWT real), não mais localStorage
  // próprio. O localStorage usado internamente pelo supabase-js já persiste a
  // sessão entre reloads — não duplicamos esse estado aqui.
  useEffect(() => {
    if (!supabase) {
      setUser(readSavedSession());
      setAuthLoading(false);
      return;
    }

    let active = true;

    const applySession = async (userId: string | undefined) => {
      if (!userId) {
        // Sem sessão real do Supabase Auth — pode ser uma sessão demo, que só
        // existe no localStorage local (ver login()/AXIS_SESSION_KEY).
        if (active) setUser(readSavedSession());
        return;
      }
      const profile = await fetchUserProfile(userId);
      if (!active) return;
      setUser(profile.success ? (profile.user as UserSession) : null);
    };

    supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session?.user?.id);
      if (active) setAuthLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Carrega os tenants e as configurações de módulos do banco
  useEffect(() => {
    const loadTenantsFromDB = async () => {
      console.log('[AuthContext] 🔄 Carregando tenants do banco de dados (sempre)...');
      const [dbTenants, idMap] = await Promise.all([fetchTenants(), fetchTenantIdMap()]);

      if (Object.keys(dbTenants).length > 0) {
        console.log('[AuthContext] ✅ Tenants do banco carregados:', Object.keys(dbTenants));
        const merged = {
          "G-Tech Master": DEFAULT_TENANT_MODULES["G-Tech Master"],
          ...dbTenants
        };
        setAllTenantModules(merged);
      } else {
        console.warn('[AuthContext] ⚠️ Nenhum tenant encontrado no banco, usando apenas G-Tech Master');
      }

      if (Object.keys(idMap).length > 0) {
        setTenantIdMap(idMap);
      }
    };

    loadTenantsFromDB();
  }, []);

  const login = (session: UserSession) => {
    // A autenticação real (supabase.auth.signInWithPassword/signUp) já aconteceu
    // em signIn()/registerPartner() antes de chamar login() — aqui só refletimos
    // o perfil resolvido no estado local; onAuthStateChange mantém a sessão
    // sincronizada em refreshes futuros. Também guardamos localmente para que
    // sessões demo (sem JWT real do Supabase) sobrevivam a um reload da página.
    sessionStorage.setItem(AXIS_SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    sessionStorage.removeItem(AXIS_SESSION_KEY);
    setUser(null);
    supabase?.auth.signOut();
  };

  // Re-busca o perfil em public.users — usado depois que uma tela (ex.: Meu
  // Perfil) grava mudanças direto na tabela, pra refletir em todo o app
  // (Topbar etc.) sem duplicar o dado em localStorage/eventos customizados.
  const refreshUser = async () => {
    if (!user?.id) return;
    const profile = await fetchUserProfile(user.id);
    if (profile.success) setUser(profile.user as UserSession);
  };

  // Preferências de UI por usuário (tema, sons, colunas de kanban, etc.) —
  // gravadas em public.users.preferences, nunca em localStorage.
  const updatePreferences = async (partial: Record<string, any>) => {
    if (!user) return;
    const merged = { ...(user.preferences || {}), ...partial };
    setUser({ ...user, preferences: merged });
    if (!supabase || !user.id) return;
    const { error } = await supabase.from("users").update({ preferences: merged }).eq("id", user.id);
    if (error) console.error('[AuthContext] Falha ao salvar preferências:', error.message);
  };

  const getTenantModules = (tenant: string): TenantModules => {
    // Normalize string matching
    const keys = Object.keys(allTenantModules);
    const matchedKey = keys.find(k => k.toLowerCase() === tenant.toLowerCase() || tenant.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tenant.toLowerCase()));
    if (matchedKey) {
      return allTenantModules[matchedKey];
    }
    return { crm: true, sdr: false, advDashboard: false };
  };

  const isModuleEnabled = (moduleName: keyof TenantModules): boolean => {
    if (!user) return false;
    // Master também respeita o módulo real do próprio tenant — antes havia um bypass
    // incondicional aqui, o que fazia o toggle de módulos em "Empresas Parceiras" nunca
    // refletir no próprio sidebar de quem está testando (sempre master). Acesso
    // administrativo (Painel G-Tech, Configurações) não depende de isModuleEnabled,
    // então master não perde acesso a essas telas por causa disso.
    const modules = getTenantModules(user.tenantName);
    return !!modules[moduleName];
  };

  const updateTenantModules = async (tenant: string, modules: TenantModules) => {
    // 1. Atualiza o estado local para feedback imediato na UI
    setAllTenantModules(prev => {
      const keys = Object.keys(prev);
      const matchedKey = keys.find(k => k.toLowerCase() === tenant.toLowerCase() || tenant.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tenant.toLowerCase())) || tenant;
      return {
        ...prev,
        [matchedKey]: modules
      };
    });

    // 2. Persiste no banco de dados (Supabase)
    const result = await updateTenantModulesInDB(tenant, modules);

    if (!result.success) {
      console.error('[AuthContext] Falha ao persistir módulos no banco');
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, refreshUser, updatePreferences, isModuleEnabled, updateTenantModules, getTenantModules, allTenantModules, tenantIdMap }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
