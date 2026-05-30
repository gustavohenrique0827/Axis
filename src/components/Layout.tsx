import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Columns3,
  CheckSquare,
  Settings,
  Bell,
  Search,
  Plus,
  Mail,
  Zap,
  Server,
  Briefcase,
  Target,
  Settings2,
  BarChart2,
  PieChart,
  Brain,
  Menu,
  AlertCircle,
  Wallet,
  FolderOpen,
  Clock,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  Megaphone,
  Edit3,
  Share2,
  Globe,
  Stethoscope,
  Calendar,
  Video,
  Archive,
  FlaskConical,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

import { CommandPalette } from "./CommandPalette";
import { SDRWebhookModal } from "./ui/SDRWebhookModal";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isModuleEnabled } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    simulateNewLeadAssignment,
    simulateOverdueTask,
    theme,
    toggleTheme,
  } = useData();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSDRWebhookOpen, setIsSDRWebhookOpen] = useState(false);

  const [activeModules, setActiveModules] = useState<{
    [key: string]: boolean;
  }>({
    crm: true,
    educacao: true,
    produtividade: true,
    financeiro: true,
    catalogo: true,
    marketing: true,
    engajamento: true,
    rh: true,
    bi: true,
    clinica: true,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("axis_sidebar_modules");
      if (saved) setActiveModules(JSON.parse(saved));
    } catch (e) { }

    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail) {
        setActiveModules(customEvent.detail);
      } else {
        try {
          const saved = localStorage.getItem("axis_sidebar_modules");
          if (saved) setActiveModules(JSON.parse(saved));
        } catch (e) { }
      }
    };
    window.addEventListener("axis_modules_changed", handleChanged);
    return () =>
      window.removeEventListener("axis_modules_changed", handleChanged);
  }, []);

  const [logoDarkFull, setLogoDarkFull] = useState(() => localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
  const [logoDarkIcon, setLogoDarkIcon] = useState(() => localStorage.getItem("axis_brand_logo_dark_icon") || "/logo-icon.png");
  const [logoLightFull, setLogoLightFull] = useState(() => localStorage.getItem("axis_brand_logo_light_full") || "/logo-full.png");
  const [logoLightIcon, setLogoLightIcon] = useState(() => localStorage.getItem("axis_brand_logo_light_icon") || "/logo-icon.png");

  useEffect(() => {
    const handleBrandChange = () => {
      setLogoDarkFull(localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
      setLogoDarkIcon(localStorage.getItem("axis_brand_logo_dark_icon") || "/logo-icon.png");
      setLogoLightFull(localStorage.getItem("axis_brand_logo_light_full") || "/logo-full.png");
      setLogoLightIcon(localStorage.getItem("axis_brand_logo_light_icon") || "/logo-icon.png");
    };
    window.addEventListener("axis_brand_changed", handleBrandChange);
    return () => window.removeEventListener("axis_brand_changed", handleBrandChange);
  }, []);

  const navSections = [
    {
      title: "Geral",
      items: [
        { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
        {
          name: "Performance SDR/IA",
          path: "/app/performance-ia",
          icon: Brain,
          reqModule: "bi"
        },
        {
          name: "CPM / Indicadores",
          path: "/app/indicadores",
          icon: BarChart2,
          reqModule: "bi"
        },
        { name: "Relatórios", path: "/app/relatorios", icon: PieChart, reqModule: "bi" },
      ],
    },
    {
      title: "CRM & Operações",
      items: [
        { name: "Leads", path: "/app/leads", icon: Target },
        { name: "Pipeline", path: "/app/pipeline", icon: Columns3 },
        { name: "Propostas", path: "/app/propostas", icon: FileText },
        { name: "Clientes", path: "/app/clientes", icon: Users },
        { name: "Produtos", path: "/app/produtos", icon: FolderOpen },
      ],
    },
    {
      title: "Gestão Clínica",
      items: [
        { name: "Painel Geral", path: "/app/clinica/painel", icon: Stethoscope },
        { name: "Agenda Médica", path: "/app/clinica/agenda", icon: Calendar },
        { name: "Pacientes", path: "/app/clinica/pacientes", icon: Users },
        { name: "Prontuários EHR", path: "/app/clinica/prontuarios", icon: FileText },
        { name: "Faturamento", path: "/app/clinica/faturamento", icon: Wallet },
        { name: "Estoque", path: "/app/clinica/estoque", icon: Archive },
        { name: "Telemedicina", path: "/app/clinica/telemedicina", icon: Video },
        { name: "Exames & Labs", path: "/app/clinica/exames", icon: FlaskConical },
        { name: "BI Clínico", path: "/app/clinica/bi", icon: BarChart3 },
      ],
    },
    {
      title: "Engajamento & Marketing",
      items: [
        { name: "Mensageria", path: "/app/mensageria", icon: Mail },
        { name: "Automações", path: "/app/automacoes", icon: Zap },
        { name: "Conteúdo", path: "/app/marketing/conteudo", icon: Edit3 },
        {
          name: "Campanhas",
          path: "/app/marketing/campanhas",
          icon: Megaphone,
        },
        { name: "Métricas", path: "/app/marketing/analytics", icon: BarChart2 },
        { name: "Social Media", path: "/app/marketing/social", icon: Share2 },
        {
          name: "Landing Pages",
          path: "/app/marketing/landing-pages",
          icon: Globe,
        },
      ],
    },
    {
      title: "Educação",
      items: [
        { name: "Painel Educação", path: "/app/educacao/painel", icon: LayoutDashboard },
        { name: "Turmas Ativas", path: "/app/educacao/turmas", icon: GraduationCap },
        { name: "Base de Alunos", path: "/app/educacao/alunos", icon: Users },
        { name: "Banco de Conteúdo", path: "/app/educacao/conteudo", icon: BookOpen },
        {
          name: "Certificados",
          path: "/app/educacao/certificados",
          icon: Award,
        },
      ],
    },
    {
      title: "Financeiro & Produtividade",
      items: [
        { name: "Painel Financeiro", path: "/app/financeiro", icon: Wallet },
        { name: "Tarefas", path: "/app/tarefas", icon: CheckSquare },
      ],
    },
    {
      title: "Gestão do Sistema",
      items: [
        { name: "Colaboradores", path: "/app/equipe", icon: Users },
        { name: "Integrações SDR", action: "sdr-webhooks", icon: Zap },
        { name: "Configurações", path: "/app/configuracoes", icon: Settings },
      ],
    },
  ];

  if (user?.isMaster || user?.tenantName?.includes("G-Tech")) {
    const sistemaSection = navSections.find((s) => s.title === "Sistema");
    if (sistemaSection) {
      sistemaSection.items.push({
        name: "Painel G-Tech",
        path: "/app/admin",
        icon: Server,
      });
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const userInitials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : "GT";
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] font-sans flex transition-all">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 lg:z-30 lg:static 
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-72"} 
        ${isMobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} 
        transition-all duration-300 ease-in-out border-r border-white/10 bg-[var(--color-dark-bg)] flex flex-col shrink-0
      `}
      >
        <div className="sidebar-logo-header h-20 flex items-center justify-center px-2 py-2 border-b border-white/5 shrink-0 bg-[#0B1120]">
          <Link
            to="/app"
            className={`logo-image-container flex items-center justify-center w-full h-full ${isSidebarCollapsed ? "mx-auto" : ""}`}
          >
            {isSidebarCollapsed ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1 bg-[#0B1120]">
                <img
                  src={logoDarkIcon}
                  alt="Axis"
                  className="w-full h-full object-contain mix-blend-screen"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden px-2 bg-[#0B1120]">
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
              const titleLower = section.title.toLowerCase();

              // 1. CRM
              if (titleLower.includes("crm") && (!activeModules.crm || !isModuleEnabled("crm"))) return false;

              // 2. Educação
              if (titleLower.includes("educação") && !activeModules.educacao) return false;

              // 3. Clínica
              if ((titleLower.includes("clínica") || titleLower.includes("clinica")) && !activeModules.clinica) return false;

              // 4. Financeiro & Produtividade (Exige um dos dois)
              if (titleLower.includes("financeiro") && !activeModules.financeiro && !activeModules.produtividade) return false;

              // 5. Engajamento & Marketing (Exige um dos dois)
              if ((titleLower.includes("engajamento") || titleLower.includes("marketing")) && !activeModules.marketing && !activeModules.engajamento) return false;

              // 6. Gestão do Sistema (Deve sempre estar presente para Configurações, mas podemos omitir itens internos via mapeamento, aqui garantimos a visualização da sessão pai)
              if (titleLower.includes("gestão do sistema")) return true;

              // 7. Se for Geral, podemos vincular a presença do BI, mas mantendo a sessão por causa do Dashboard raiz.
              // Então omitimos o 'return false' agressivo que bloqueava todo o painel geral.

              return true;
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
                  if (item.reqModule && (!activeModules[item.reqModule] && item.reqModule !== 'master')) return null;
                  if (item.reqModule === 'master' && !user?.isMaster) return null;

                  const isActive = item.path ? location.pathname.startsWith(item.path) : false;

                  const btnContent = (
                    <button
                      className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} text-sm font-bold rounded-xl transition-all ${isActive ? "bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.05)]" : "text-slate-500 hover:text-white hover:bg-white/[0.03]"}`}
                    >
                      <item.icon
                        className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-500" : "text-slate-600"}`}
                      />{" "}
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

        {/* System Alert Ticker (Sidebar Footer) */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-[-300px] right-[-100px] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors mr-2 block"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Branding Pill */}
            <div className="flex sm:hidden items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-5 h-5 rounded bg-white p-0.5">
                <img
                  src={logoDarkIcon}
                  alt="Axis Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
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
              className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              title="Alternar Tema (Light/Dark)"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`text-slate-400 hover:text-white transition-all relative p-2.5 rounded-xl border border-transparent ${isNotificationsOpen
                    ? "bg-white/10 border-white/10 text-white shadow-lg"
                    : unreadNotifications > 0
                      ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 text-rose-300"
                      : "hover:bg-white/5"
                  }`}
                title="Notificações"
              >
                <Bell
                  className={`w-5 h-5 ${unreadNotifications > 0 ? "animate-[bounce_2s_infinite]" : ""}`}
                />
                {unreadNotifications > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75" />
                    <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-[0_0_8px_#f43f5e] border-2 border-[#0B1120]">
                      {unreadNotifications}
                    </span>
                  </>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  ></div>
                  <Card className="fixed left-4 right-4 sm:left-auto sm:right-4 md:absolute md:left-auto md:right-0 top-16 md:top-full md:mt-4 md:w-[410px] bg-[#0B1120]/95 backdrop-blur-xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white">
                          Central de Notificações
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-[9px] font-black text-white">
                          {unreadNotifications} novas
                        </span>
                      </div>
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[10px] text-[#2563EB] font-bold hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    </div>

                    {/* Real-Time Live Testing Simulator Controls */}
                    <div className="bg-[#111827] border-b border-white/5 p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Simulador Real-Time (Testar Eventos Críticos)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => simulateNewLeadAssignment()}
                          className="text-[10px] font-bold text-white bg-[#2563EB]/15 hover:bg-[#2563EB]/30 border border-[#2563EB]/30 px-2 text-center py-1.5 rounded-lg transition-all"
                          title="Distribuir ou alterar responsável de lead aleatoriamente"
                        >
                          Atribuir Lead
                        </button>
                        <button
                          onClick={() => simulateOverdueTask()}
                          className="text-[10px] font-bold text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 px-2 text-center py-1.5 rounded-lg transition-all"
                          title="Lançará nova tarefa crítica com status de atrasado"
                        >
                          Tarefa Atrasada
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
                      {(() => {
                        const groupedNotifications: {
                          [key: string]: typeof notifications;
                        } = {};
                        notifications.forEach((n) => {
                          const groupKey = n.date || "Mais Antigos";
                          if (!groupedNotifications[groupKey]) {
                            groupedNotifications[groupKey] = [];
                          }
                          groupedNotifications[groupKey].push(n);
                        });

                        return notifications.length > 0 ? (
                          Object.keys(groupedNotifications).map((groupName) => (
                            <div key={groupName} className="space-y-0.5">
                              <div className="px-4 py-1.5 bg-white/[0.02] border-y border-white/5 text-[9px] uppercase font-black tracking-widest text-[#06B6D4] flex items-center justify-between">
                                <span>{groupName}</span>
                                <span className="text-[8px] font-bold lowercase text-slate-500">
                                  {groupedNotifications[groupName].length}{" "}
                                  item(ns)
                                </span>
                              </div>
                              {groupedNotifications[groupName].map((n) => {
                                // Determine matching icon and colors based on category
                                const getCategoryStyle = (cat?: string) => {
                                  switch (cat) {
                                    case "CRM":
                                      return {
                                        icon: Target,
                                        bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                                        label: "CRM",
                                      };
                                    case "Produtividade":
                                      return {
                                        icon: CheckSquare,
                                        bg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                                        label: "Produtividade",
                                      };
                                    case "Financeiro":
                                      return {
                                        icon: Wallet,
                                        bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                        label: "Financeiro",
                                      };
                                    case "Engajamento":
                                      return {
                                        icon: Mail,
                                        bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                                        label: "Engajamento",
                                      };
                                    case "Sistema":
                                      return {
                                        icon: Server,
                                        bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                        label: "Sistema",
                                      };
                                    default:
                                      return {
                                        icon: Bell,
                                        bg: "bg-slate-500/10 border-slate-500/20 text-slate-400",
                                        label: cat || "Geral",
                                      };
                                  }
                                };

                                const style = getCategoryStyle(n.category);
                                const IconComp = style.icon;

                                return (
                                  <div
                                    key={n.id}
                                    onClick={() => markNotificationAsRead(n.id)}
                                    className={`p-4 border-b border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all flex gap-4 relative group ${!n.read ? "bg-[#2563EB]/5" : ""}`}
                                  >
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${style.bg}`}
                                    >
                                      <IconComp className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1 gap-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <h5
                                            className={`text-xs font-bold truncate ${!n.read ? "text-white" : "text-slate-400"}`}
                                          >
                                            {n.title}
                                          </h5>
                                          <span
                                            className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase border shrink-0 ${n.type === "success"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : n.type === "error"
                                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                  : "bg-[#2563EB]/10 text-blue-400 border-blue-500/20"
                                              }`}
                                          >
                                            {n.type}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-slate-600 font-medium shrink-0 whitespace-nowrap">
                                          {n.time}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-1">
                                        {n.desc}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-extrabold uppercase tracking-wide">
                                          {style.label}
                                        </span>
                                        {n.link && (
                                          <Link
                                            to={n.link}
                                            className="text-[10px] text-emerald-400 font-bold hover:underline"
                                          >
                                            ACESSAR VISUALIZAÇÃO
                                          </Link>
                                        )}
                                        {!n.read && (
                                          <>
                                            <span className="text-[10px] text-slate-600">
                                              •
                                            </span>
                                            <span className="text-[9px] font-bold text-[#2563EB] animate-pulse">
                                              Não lida
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {!n.read && (
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]"></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))
                        ) : (
                          <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                            <Bell className="w-12 h-12 mb-4 text-slate-700" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                              Nenhuma notificação
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    <button className="w-full py-4 text-center text-[10px] font-bold text-slate-400 hover:text-white transition-colors border-t border-white/5 uppercase tracking-widest hover:bg-white/5">
                      Ver histórico completo
                    </button>
                  </Card>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-[10px] text-[#06B6D4] uppercase font-black tracking-widest">
                  {user?.tenantName || "Empresa"}
                </p>
              </div>
              <div className="relative">
                <div
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-blue-700 flex items-center justify-center text-sm font-black shadow-[0_8px_20px_rgba(37,99,235,0.4)] text-white hover:scale-110 hover:rotate-3 transition-all cursor-pointer"
                >
                  {userInitials}
                </div>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    <div className="absolute top-full right-0 pt-2 w-48 z-50">
                      <div className="bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/app/configuracoes");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Users className="w-4 h-4" /> Meu Perfil
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/app/configuracoes");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Settings2 className="w-4 h-4" /> Configs
                        </button>
                        <div className="h-px bg-white/5 my-1"></div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors cursor-pointer"
                        >
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

        {/* Content */}
        <div
          className={`flex-1 overflow-hidden z-10 relative scrollbar-none ${location.pathname.includes("/messaging") ||
              location.pathname.includes("/mensageria")
              ? "p-1 pb-20 sm:p-2 sm:pb-2.5"
              : "p-4 md:p-8 overflow-auto pb-24 sm:pb-8"
            }`}
        >
          <Outlet />
        </div>
      </main>

      {/* Floating Glassmorphism Bottom Tab Bar for Mobile devices (< 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111827]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-2 z-40 pb-safe shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
        {[
          { name: "Painel", path: "/app/dashboard", icon: LayoutDashboard },
          { name: "Leads", path: "/app/leads", icon: Target },
          { name: "Pipeline", path: "/app/pipeline", icon: Columns3 },
          { name: "Clientes", path: "/app/clientes", icon: Users },
        ].map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all relative active:scale-95 ${isActive ? "text-[#2563EB]" : "text-slate-400 hover:text-white"
                }`}
            >
              <TabIcon
                className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${isActive ? "text-[#2563EB] scale-110" : "text-slate-400 group-hover:scale-105"}`}
              />
              <span
                className={
                  isActive
                    ? "font-black text-[#2563EB] transition-all"
                    : "font-semibold text-slate-500"
                }
              >
                {tab.name}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#2563EB] rounded-b-full"></span>
              )}
            </Link>
          );
        })}

        {/* Toggle Mais Slider Button */}
        <button
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all active:scale-95 ${isMobileMoreOpen
              ? "text-[#06B6D4]"
              : "text-slate-400 hover:text-white"
            }`}
        >
          <Menu
            className={`w-5 h-5 mb-0.5 ${isMobileMoreOpen ? "text-[#06B6D4] rotate-90 scale-110" : "text-slate-400"} transition-transform duration-200`}
          />
          <span
            className={
              isMobileMoreOpen
                ? "font-black text-[#06B6D4]"
                : "font-semibold text-slate-500"
            }
          >
            Mais
          </span>
        </button>
      </nav>

      {/* Slide-up Drawer/Menu Sheet for Mobile "Mais" Navigation */}
      {isMobileMoreOpen && (
        <>
          {/* Backdrop screen lock mask */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in duration-200"
            onClick={() => setIsMobileMoreOpen(false)}
          />
          {/* Sheet main layout */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0B1120] border-t border-white/10 rounded-t-3xl max-h-[80vh] overflow-y-auto p-6 pb-12 flex flex-col gap-4 shadow-[0_-25px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom duration-300">
            {/* Horizontal pull line mockup */}
            <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-2 shrink-0"></div>

            <div className="flex justify-between items-center mb-1 shrink-0">
              <h3 className="text-xs font-black text-[#06B6D4] uppercase tracking-widest font-mono">
                Navegação Completa
              </h3>
              <button
                className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-1.5 rounded-xl text-slate-300 transition-colors uppercase tracking-wider font-mono"
                onClick={() => setIsMobileMoreOpen(false)}
              >
                Fechar
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto">
              {navSections.map((section, idx) => (
                <div
                  key={idx}
                  className="space-y-2.5 border-t border-white/5 pt-4 first:border-none first:pt-0"
                >
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {section.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item: any) => {
                      const isActive = item.path ? location.pathname.startsWith(item.path) : false;
                      const ItemIcon = item.icon;

                      const btnClass = `flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${isActive
                          ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 font-black"
                          : "text-slate-400 border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5"
                        }`;

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
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileMoreOpen(false)}
                          className={btnClass}
                        >
                          <ItemIcon className="w-4 h-4 text-[#06B6D4] shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* User settings options for mobile */}
              <div className="space-y-2.5 border-t border-white/5 pt-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Conta & Configurações
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      navigate("/app/configuracoes");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5 text-slate-400 w-full text-left"
                  >
                    <Users className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="truncate">Meu Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      navigate("/app/configuracoes");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-white/[0.01] hover:text-white hover:bg-white/5 text-slate-400 w-full text-left"
                  >
                    <Settings2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span className="truncate">Definições</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMoreOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-transparent bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 w-full text-left"
                  >
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
    </div>
  );
}
