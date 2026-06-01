import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";
import { MobileNav } from "./layout/MobileNav";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarModules } = useData();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isSDRWebhookOpen, setIsSDRWebhookOpen] = useState(false);

  const activeModules = sidebarModules;

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const [logoDarkFull, setLogoDarkFull] = useState(() => localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
  const [logoDarkIcon, setLogoDarkIcon] = useState(() => localStorage.getItem("axis_brand_logo_dark_icon") || "/logo-icon.png");

  useEffect(() => {
    const handleBrandChange = () => {
      setLogoDarkFull(localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
      setLogoDarkIcon(localStorage.getItem("axis_brand_logo_dark_icon") || "/logo-icon.png");
    };
    window.addEventListener("axis_brand_changed", handleBrandChange);
    return () => window.removeEventListener("axis_brand_changed", handleBrandChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] font-sans flex transition-all">
      <Sidebar 
        isSidebarCollapsed={isSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        activeModules={activeModules}
        logoDarkIcon={logoDarkIcon}
        logoDarkFull={logoDarkFull}
        setIsSDRWebhookOpen={setIsSDRWebhookOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-[-300px] right-[-100px] w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>

        <Topbar 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          logoDarkIcon={logoDarkIcon}
        />

        <div className={`flex-1 overflow-hidden relative scrollbar-none ${location.pathname.includes("/messaging") || location.pathname.includes("/mensageria") ? "p-1 pb-20 sm:p-2 sm:pb-2.5" : "p-4 md:p-8 overflow-auto pb-24 sm:pb-8"}`}>
          <Outlet />
        </div>
      </main>

      <MobileNav 
        isMobileMoreOpen={isMobileMoreOpen}
        setIsMobileMoreOpen={setIsMobileMoreOpen}
      />
    </div>
  );
}
