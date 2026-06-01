import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchTenants } from "../lib/supabase";

export type TenantNiche = "Master" | "Solar" | "Imobiliária" | "Clínica" | "Tecnologia" | "Parceira";

export interface UserSession {
  name: string;
  email: string;
  role: string;
  tenantName: string;
  tenantNiche: TenantNiche;
  isMaster: boolean;
}

export interface TenantModules {
  crm: boolean;
  sdr: boolean;
  advDashboard: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
  isModuleEnabled: (moduleName: keyof TenantModules) => boolean;
  updateTenantModules: (tenantName: string, modules: TenantModules) => void;
  getTenantModules: (tenantName: string) => TenantModules;
  allTenantModules: Record<string, TenantModules>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default: Only G-Tech Master is hardcoded as system admin. All other tenants load from Supabase.
const DEFAULT_TENANT_MODULES: Record<string, TenantModules> = {
  "G-Tech Master": { crm: true, sdr: true, advDashboard: true }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("axis_session");
    if (saved) return JSON.parse(saved);
    return null;
  });

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
        localStorage.setItem("axis_tenant_modules", JSON.stringify(merged));
      } else {
        console.warn('[AuthContext] ⚠️ Nenhum tenant encontrado no banco, usando apenas G-Tech Master');
      }
    };

    loadTenantsFromDB();
  }, []);

  useEffect(() => {
    localStorage.setItem("axis_tenant_modules", JSON.stringify(allTenantModules));
  }, [allTenantModules]);

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

  const updateTenantModules = (tenant: string, modules: TenantModules) => {
    setAllTenantModules(prev => {
      // Find matching key if normalized
      const keys = Object.keys(prev);
      const matchedKey = keys.find(k => k.toLowerCase() === tenant.toLowerCase() || tenant.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(tenant.toLowerCase())) || tenant;
      return {
        ...prev,
        [matchedKey]: modules
      };
    });
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
