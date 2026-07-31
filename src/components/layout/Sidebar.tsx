import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { Server } from "lucide-react";

import { navSections as defaultNavSections } from "./navData";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  logoDarkIcon: string;
  logoDarkFull: string;
  setIsSDRWebhookOpen: (isOpen: boolean) => void;
}

export function Sidebar({
  isSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  logoDarkIcon,
  logoDarkFull,
  setIsSDRWebhookOpen,
}: SidebarProps) {
  const location = useLocation();
  const { user, isModuleEnabled } = useAuth();
  const { cargos } = useData();
  const userCargo = cargos.find(c => c.nome === user?.role);
  const cargoModulos: string[] | null = userCargo && Array.isArray(userCargo.modulos) && userCargo.modulos.length > 0
    ? userCargo.modulos
    : null;
  const canAccessModule = (mod: string) => {
    if (user?.isMaster) return isModuleEnabled(mod);
    if (!cargoModulos) return isModuleEnabled(mod);
    return isModuleEnabled(mod) && cargoModulos.includes(mod);
  };

  const navSections = defaultNavSections.map(s => ({ ...s, items: [...s.items] }));

  if (user?.isMaster || user?.tenantName?.includes("G-Tech")) {
    const sistemaSection = navSections.find((s) => s.title === "Gestão do Sistema") || navSections.find((s) => s.title === "Sistema");
    if (sistemaSection) {
      if (!sistemaSection.items.some((item: any) => item.name === "Painel G-Tech")) {
        sistemaSection.items.push({
          name: "Painel G-Tech",
          path: "/app/admin",
          icon: Server,
        });
      }
    } else {
        navSections.push({
            title: "Sistema",
            items: [
                { name: "Painel G-Tech", path: "/app/admin", icon: Server }
            ]
        })
    }
  }

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 lg:z-30 lg:relative lg:h-full
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-72"}
        ${isMobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        transition-all duration-300 ease-in-out border-r border-[var(--color-border-default)] bg-[var(--color-surface)] flex flex-col shrink-0
      `}
      >
        <div className="h-20 flex items-center justify-center px-3 py-3 shrink-0">
          <Link
            to="/app"
            className={`logo-image-container sidebar-logo-header flex items-center justify-center w-full h-full rounded-2xl bg-[var(--color-surface)] shadow-sm ${isSidebarCollapsed ? "mx-auto" : ""}`}
          >
            {isSidebarCollapsed ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1">
                <img
                  src={logoDarkIcon}
                  alt="Axis"
                  className="w-full h-full object-contain mix-blend-screen"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-2">
                <img
                  src={logoDarkFull}
                  alt="Axis"
                  className="logo-container"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-none">
          {navSections
            .filter((section) => {
              const mod = (section as any).reqModule;
              if (!mod) return true;
              return canAccessModule(mod);
            })
            .map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isSidebarCollapsed ? (
                  <div className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
                {section.items.map((item: any) => {
                  if (item.reqModule && item.reqModule !== 'master' && !canAccessModule(item.reqModule)) return null;
                  if (item.reqModule === 'master' && !user?.isMaster) return null;

                  const isActive = item.path ? location.pathname.startsWith(item.path) : false;

                  const btnContent = (
                    <button
                      className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} text-sm font-bold rounded-xl transition-all ${isActive ? "bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.05)]" : "text-slate-500 hover:text-white hover:bg-white/[0.03]"}`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-500" : "text-slate-600"}`} />{" "}
                      {!isSidebarCollapsed && item.name}
                    </button>
                  );

                  if (item.action) {
                    return (
                      <div
                        key={item.name}
                        title={isSidebarCollapsed ? item.name : undefined}
                        className="cursor-pointer"
                        onClick={() => {
                          if (item.action === "sdr-webhooks") setIsSDRWebhookOpen(true);
                          setIsMobileSidebarOpen(false);
                        }}
                      >
                        {btnContent}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={isSidebarCollapsed ? item.name : undefined}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      {btnContent}
                    </Link>
                  );
                })}
              </div>
            ))}
        </div>

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Global Status 99.8%
              </span>
            </div>
            <div className="text-[10px] text-slate-600 font-medium italic line-clamp-1 border-l border-blue-500/20 pl-2">
              Próximo backup global em 4h 12m
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
