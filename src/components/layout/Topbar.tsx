import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { Card } from "../ui/card";
import { CommandPalette } from "../CommandPalette";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Target,
  CheckSquare,
  Wallet,
  Mail,
  Server,
  Users,
  Settings2,
  AlertCircle,
} from "lucide-react";

interface TopbarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean) => void;
  logoDarkIcon: string;
}

export function Topbar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  logoDarkIcon,
}: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    theme,
    toggleTheme,
  } = useData();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "GT";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-[var(--color-border-default)] bg-[var(--color-surface)]/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-border-default)] rounded-lg transition-colors mr-2 block"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Branding Pill */}
        <div className="flex sm:hidden items-center gap-2 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] px-3 py-1.5 rounded-xl">
          <div className="w-5 h-5 rounded bg-[#0B1120] p-0.5">
            <img
              src={logoDarkIcon}
              alt="Axis Logo"
              className="w-full h-full object-contain mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-primary)]">
            Axis
          </span>
        </div>

        <div className="hidden md:block">
          <CommandPalette />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => toggleTheme()}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-border-default)] rounded-xl transition-colors"
          title="Alternar Tema (Light/Dark)"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all relative p-2.5 rounded-xl border border-transparent ${isNotificationsOpen
                ? "bg-[var(--color-border-default)] text-[var(--color-text-primary)] shadow-lg"
                : unreadNotifications > 0
                  ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 text-rose-500"
                  : "hover:bg-[var(--color-surface-sunken)]"
              }`}
            title="Notificações"
          >
            <Bell className={`w-5 h-5 ${unreadNotifications > 0 ? "animate-[bounce_2s_infinite]" : ""}`} />
            {unreadNotifications > 0 && (
              <>
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75" />
                <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-[0_0_8px_#f43f5e] border-2 border-[var(--color-surface)]">
                  {unreadNotifications}
                </span>
              </>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
              <Card className="fixed left-4 right-4 sm:left-auto sm:right-4 md:absolute md:left-auto md:right-0 top-16 md:top-full md:mt-4 md:w-[410px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 border-b border-[var(--color-border-default)] flex justify-between items-center bg-[var(--color-surface-sunken)]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase tracking-tight text-[var(--color-text-primary)]">
                      Central de Notificações
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-[9px] font-black text-white">
                      {unreadNotifications} novas
                    </span>
                  </div>
                  <button onClick={() => markAllNotificationsAsRead()} className="text-[10px] text-[#2563EB] font-bold hover:underline">
                    Marcar todas como lidas
                  </button>
                </div>

                <div className="bg-[var(--color-surface-sunken)] border-b border-[var(--color-border-default)] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Simulador Real-Time
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[var(--color-text-muted)]">Simulações desativadas</span>
                  </div>
                </div>

                <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
                  {(() => {
                    const groupedNotifications: { [key: string]: typeof notifications } = {};
                    notifications.forEach((n) => {
                      const groupKey = n.date || "Mais Antigos";
                      if (!groupedNotifications[groupKey]) groupedNotifications[groupKey] = [];
                      groupedNotifications[groupKey].push(n);
                    });

                    return notifications.length > 0 ? (
                      Object.keys(groupedNotifications).map((groupName) => (
                        <div key={groupName} className="space-y-0.5">
                          <div className="px-4 py-1.5 bg-[var(--color-surface-sunken)] border-y border-[var(--color-border-default)] text-[9px] uppercase font-black tracking-widest text-[#06B6D4] flex items-center justify-between">
                            <span>{groupName}</span>
                            <span className="text-[8px] font-bold lowercase text-[var(--color-text-faint)]">{groupedNotifications[groupName].length} item(ns)</span>
                          </div>
                          {groupedNotifications[groupName].map((n) => {
                            const getCategoryStyle = (cat?: string) => {
                              switch (cat) {
                                case "CRM": return { icon: Target, bg: "bg-blue-500/10 border-blue-500/20 text-blue-500", label: "CRM" };
                                case "Produtividade": return { icon: CheckSquare, bg: "bg-purple-500/10 border-purple-500/20 text-purple-500", label: "Produtividade" };
                                case "Financeiro": return { icon: Wallet, bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", label: "Financeiro" };
                                case "Engajamento": return { icon: Mail, bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500", label: "Engajamento" };
                                case "Sistema": return { icon: Server, bg: "bg-amber-500/10 border-amber-500/20 text-amber-500", label: "Sistema" };
                                default: return { icon: Bell, bg: "bg-slate-500/10 border-slate-500/20 text-slate-500", label: cat || "Geral" };
                              }
                            };
                            const style = getCategoryStyle(n.category);
                            const IconComp = style.icon;

                            return (
                              <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-4 border-b border-[var(--color-border-default)] hover:bg-[var(--color-surface-sunken)] cursor-pointer transition-all flex gap-4 relative group ${!n.read ? "bg-[#2563EB]/5" : ""}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${style.bg}`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1 gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <h5 className={`text-xs font-bold truncate ${!n.read ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}>{n.title}</h5>
                                    </div>
                                    <span className="text-[9px] text-[var(--color-text-faint)] font-medium shrink-0 whitespace-nowrap">{n.time}</span>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed mb-1">{n.desc}</p>
                                </div>
                                {!n.read && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]"></div></div>}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                        <Bell className="w-12 h-12 mb-4 text-[var(--color-text-faint)]" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Nenhuma notificação</p>
                      </div>
                    );
                  })()}
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-[var(--color-border-default)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">{user?.name || "Usuário"}</p>
            <p className="text-[10px] text-[#06B6D4] uppercase font-black tracking-widest">{user?.tenantName || "Empresa"}</p>
          </div>
          <div className="relative">
            <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-blue-700 flex items-center justify-center text-sm font-black shadow-[0_8px_20px_rgba(37,99,235,0.4)] text-white hover:scale-110 hover:rotate-3 transition-all cursor-pointer">
              {userInitials}
            </div>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                <div className="absolute top-full right-0 pt-2 w-48 z-50">
                  <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { setIsUserMenuOpen(false); navigate("/app/configuracoes"); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] rounded-lg transition-colors cursor-pointer">
                      <Users className="w-4 h-4" /> Meu Perfil
                    </button>
                    <button onClick={() => { setIsUserMenuOpen(false); navigate("/app/configuracoes"); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] rounded-lg transition-colors cursor-pointer">
                      <Settings2 className="w-4 h-4" /> Configs
                    </button>
                    <div className="h-px bg-[var(--color-border-default)] my-1"></div>
                    <button onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">
                      <AlertCircle className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
