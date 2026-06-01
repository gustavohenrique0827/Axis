import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchTenants, updateTenantModulesInDB } from "../lib/supabase";

export type TenantNiche = "Master" | "Solar" | "Imobiliária" | "Clínica" | "Tecnologia" | "Parceira";

export interface UserSession {
  name: string;
  email: string;
  role: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default: Only G-Tech Master is hardcoded as system admin. All other tenants load from Supabase.
const DEFAULT_TENANT_MODULES: Record<string, TenantModules> = {
  "G-Tech Master": { crm: true, sdr: true, advDashboard: true }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  // Start with only G-Tech Master, always load from Supabase
  const [allTenantModules, setAllTenantModules] = useState<Record<string, TenantModules>>(DEFAULT_TENANT_MODULES);

  // Load tenants from Supabase on component mount - ALWAYS (ignore localStorage cache)
  useEffect(() => {
    const loadTenantsFromDB = async () => {
      console.log('[AuthContext] 🔄 Carregando tenants do banco de dados (sempre)...');
      const dbTenants = await fetchTenants();

      if (Object.keys(dbTenants).length > 0) {
        console.log('[AuthContext] ✅ Tenants do banco carregados:', Object.keys(dbTenants));
        // Merge G-Tech Master + database tenants
        const merged = {
          "G-Tech Master": DEFAULT_TENANT_MODULES["G-Tech Master"],
          ...dbTenants
        };
        setAllTenantModules(merged);
      } else {
        console.warn('[AuthContext] ⚠️ Nenhum tenant encontrado no banco, usando apenas G-Tech Master');
      }
    };

    loadTenantsFromDB();
  }, []);

  const login = (session: UserSession) => {
    setUser(session);
  };

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout, isModuleEnabled, updateTenantModules, getTenantModules, allTenantModules }}>
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
