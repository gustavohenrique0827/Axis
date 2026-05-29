import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type TenantNiche = "Master" | "Solar" | "Imobiliária" | "Clínica" | "Tecnologia";

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

const DEFAULT_TENANT_MODULES: Record<string, TenantModules> = {
  "G-Tech (Master)": { crm: true, sdr: true, advDashboard: true },
  "G-Tech Master": { crm: true, sdr: true, advDashboard: true },
  "SolarCorp Engenharia": { crm: true, sdr: false, advDashboard: false },
  "Solar Solutions": { crm: true, sdr: false, advDashboard: false },
  "Imobiliária Prime": { crm: true, sdr: true, advDashboard: false },
  "Clínica Vida": { crm: true, sdr: false, advDashboard: true },
  "TechCorp Brasil": { crm: true, sdr: false, advDashboard: true },
  "Solar Solutions (SolarCorp)": { crm: true, sdr: false, advDashboard: false },
  "Construtora RS": { crm: true, sdr: false, advDashboard: false },
  "Mendes Consultoria": { crm: true, sdr: false, advDashboard: false }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("axis_session");
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [allTenantModules, setAllTenantModules] = useState<Record<string, TenantModules>>(() => {
    const saved = localStorage.getItem("axis_tenant_modules");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing axis_tenant_modules", e);
      }
    }
    return DEFAULT_TENANT_MODULES;
  });

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
