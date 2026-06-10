import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Columns3,
  Users,
  Menu,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { navSections } from "./navData";
import { SDRWebhookModal } from "../ui/SDRWebhookModal";

interface MobileNavProps {
  isMobileMoreOpen: boolean;
  setIsMobileMoreOpen: (val: boolean) => void;
}

export function MobileNav({ isMobileMoreOpen, setIsMobileMoreOpen }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSDRWebhookOpen, setIsSDRWebhookOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111827]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-2 z-40 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
        {[
          { name: "Painel", path: "/app/dashboard", icon: LayoutDashboard },
          { name: "Leads", path: "/app/pipeline", icon: Columns3 },
          { name: "Clientes", path: "/app/clientes", icon: Users },
        ].map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all relative active:scale-95 ${isActive ? "text-[#2563EB]" : "text-slate-400 hover:text-white"}`}
            >
              <TabIcon className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${isActive ? "text-[#2563EB] scale-110" : "text-slate-400 group-hover:scale-105"}`} />
              <span className={isActive ? "font-black text-[#2563EB] transition-all" : "font-semibold text-slate-500"}>
                {tab.name}
              </span>
              {isActive && <span className="absolute top-0 w-8 h-1 bg-[#2563EB] rounded-b-full"></span>}
            </Link>
          );
        })}

        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all active:scale-95 ${isMobileMoreOpen ? "text-[#06B6D4]" : "text-slate-400 hover:text-white"}`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${isMobileMoreOpen ? "text-[#06B6D4] rotate-90 scale-110" : "text-slate-400"} transition-transform duration-200`} />
          <span className={isMobileMoreOpen ? "font-black text-[#06B6D4]" : "font-semibold text-slate-500"}>Mais</span>
        </button>
      </nav>

      {isMobileMoreOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in duration-200" onClick={() => setIsMobileMoreOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B1120] border-t border-white/10 rounded-t-3xl max-h-[80vh] overflow-y-auto p-6 pb-12 flex flex-col gap-4 shadow-[0_-25px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-2 shrink-0"></div>

            <div className="flex justify-between items-center mb-1 shrink-0">
              <h3 className="text-xs font-black text-[#06B6D4] uppercase tracking-widest font-mono">
                Navegação Completa
              </h3>
              <button className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-1.5 rounded-xl text-slate-300 transition-colors uppercase tracking-wider font-mono" onClick={() => setIsMobileMoreOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-2.5 border-t border-white/5 pt-4 first:border-none first:pt-0">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{section.title}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item: any) => {
                      const isActive = item.path ? location.pathname.startsWith(item.path) : false;
                      const ItemIcon = item.icon;
                      const btnClass = `flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${isActive ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 font-black" : "text-slate-400 border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5"}`;

                      if (item.action) {
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              if (item.action === "sdr-webhooks") setIsSDRWebhookOpen(true);
                              setIsMobileMoreOpen(false);
                            }}
                            className={btnClass}
                          >
                            <ItemIcon className="w-4 h-4 text-[#06B6D4] shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      }

                      return (
                        <Link key={item.name} to={item.path} onClick={() => setIsMobileMoreOpen(false)} className={btnClass}>
                          <ItemIcon className="w-4 h-4 text-[#06B6D4] shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="space-y-2.5 border-t border-white/5 pt-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conta & Configurações</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setIsMobileMoreOpen(false); navigate("/app/configuracoes"); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5 text-slate-400 w-full text-left">
                    <Users className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="truncate">Meu Perfil</span>
                  </button>
                  <button onClick={() => { setIsMobileMoreOpen(false); navigate("/app/configuracoes"); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5 text-slate-400 w-full text-left">
                    <Settings2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="truncate">Definições</span>
                  </button>
                  <button onClick={() => { setIsMobileMoreOpen(false); handleLogout(); }} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 w-full text-left">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SDRWebhookModal isOpen={isSDRWebhookOpen} onClose={() => setIsSDRWebhookOpen(false)} />
    </>
  );
}
