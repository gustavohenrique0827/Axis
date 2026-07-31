import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchTenants, fetchTenantIdMap, updateTenantModulesInDB } from "../lib/supabase";

export type TenantNiche = "Master" | "Solar" | "Imobiliária" | "Clínica" | "Tecnologia" | "Parceira";

export interface UserSession {
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantName: string;
  tenantNiche: TenantNiche;
  isMaster: boolean;
}

export type TenantModules = Record<string, boolean>;

interface AuthContextType {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
  isModuleEnabled: (moduleName: keyof TenantModules) => boolean;
  updateTenantModules: (tenantName: string, modules: TenantModules) => Promise<void>;
  getTenantModules: (tenantName: string) => TenantModules;
  allTenantModules: Record<string, TenantModules>;
  tenantIdMap: Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Módulos padrão dos tenants demo — carregados localmente como fallback quando Supabase não está acessível
const DEFAULT_TENANT_MODULES: Record<string, TenantModules> = {
  "G-Tech Master": {
    crm: true, sdr: true, advDashboard: true, financeiro: true, marketing: true,
    educacao: true, clinica: true, produtividade: true, rh: true, bi: true,
    engajamento: true, catalogo: true, dev: true
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
  const [user, setUser] = useState<UserSession | null>(() => {
    // Recupera a sessão salva no localStorage ao iniciar
    const savedSession = localStorage.getItem("axis_session");
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Start with only G-Tech Master, always load from Supabase
  const [allTenantModules, setAllTenantModules] = useState<Record<string, TenantModules>>(DEFAULT_TENANT_MODULES);
  // tenantIdMap: name → UUID (ex: "PLUPPEX DIGITAL MACHINES LTDA" → "27ef95ee-...")
  const [tenantIdMap, setTenantIdMap] = useState<Record<string, string>>({});

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
    setUser(session);
    localStorage.setItem("axis_session", JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("axis_session");
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
    // G-Tech master user always has access to all modules
    if (user.isMaster || user.tenantName.includes("G-Tech")) return true;

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
    <AuthContext.Provider value={{ user, login, logout, isModuleEnabled, updateTenantModules, getTenantModules, allTenantModules, tenantIdMap }}>
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
