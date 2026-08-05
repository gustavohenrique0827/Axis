import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Building, Users, Columns3, Briefcase, Zap, Globe, Bell, Menu, X, 
  PanelLeftClose, PanelLeftOpen 
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function SettingsLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [activeModules, setActiveModules] = useState<{ [key: string]: boolean }>({
    crm: true, educacao: true, produtividade: true, financeiro: true, 
    catalogo: true, marketing: true, engajamento: true, rh: true, bi: true, clinica: true,
  });

  useEffect(() => {
    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail) setActiveModules(customEvent.detail);
    };
    window.addEventListener("axis_modules_changed", handleChanged);
    return () => window.removeEventListener("axis_modules_changed", handleChanged);
  }, []);

  const secPreferencias = [
    { title: "Preferências de Notificação", path: "/app/configuracoes/usuario/notificacoes" },
  ];

  const secEmpresa = [
    { title: "Dados da empresa", path: "/app/configuracoes/empresa/dados" },
    ...(user?.isMaster ? [{ title: "Módulos & Demos", path: "/app/configuracoes/empresa/modulos" }] : []),
    { title: "Filiais / Unidades", path: "/app/configuracoes/empresa/filiais" },
    { title: "Equipe & convites", path: "/app/configuracoes/empresa/equipe" },
    { title: "Cargos", path: "/app/configuracoes/empresa/cargos" },
    { title: "Perfis & permissões", path: "/app/configuracoes/empresa/permissoes" },
  ];

  const secCRM = [
    { title: "Funis & etapas", path: "/app/configuracoes/crm/funis" },
    { title: "Origens de leads", path: "/app/configuracoes/crm/origens" },
    { title: "Produtos", path: "/app/configuracoes/crm/produtos" },
    { title: "Campos personalizados", path: "/app/configuracoes/crm/campos" },
    { title: "Configuração de SLA", path: "/app/configuracoes/crm/sla" },
    { title: "Gatilhos IA", path: "/app/configuracoes/crm/gatilhos-ia" },
    { title: "Configuração de Dashboards", path: "/app/configuracoes/crm/dashboards" },
    { title: "Rodízio de Leads", path: "/app/configuracoes/crm/rodizio" },
  ];

  const secProdutividade = [
    { title: "Categorias de tarefas", path: "/app/configuracoes/produtividade/categorias" },
    { title: "Funis & Kanbans", path: "/app/configuracoes/kanbans" },
  ];

  const secFinanceiro = [
    { title: "Categorias financeiras", path: "/app/configuracoes/financeiro/categorias" },
    { title: "Gestão financeira de times", path: "/app/configuracoes/financeiro/squads" },
  ];

  const secEngajamento = [
    { title: "Modelos de mensagem", path: "/app/configuracoes/engajamento/modelos" },
    { title: "Automações", path: "/app/configuracoes/engajamento/automacoes" },
  ];

  const secIntegracoes = [
    { title: "Google, WhatsApp...", path: "/app/configuracoes/integracoes/apps" },
    { title: "Servidores SMTP", path: "/app/configuracoes/integracoes/smtp" },
    { title: "Webhooks & logs API", path: "/app/configuracoes/integracoes/webhooks" },
    { title: "Webhooks do SDR", path: "/app/configuracoes/integracoes/sdr-webhooks" },
  ];

  const secSistema = [
    { title: "Backups automáticos", path: "/app/configuracoes/sistema/backups" },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full -m-4 md:-m-8 relative overflow-hidden">
      {/* Floating Trigger when Hidden */}
        {isHidden && (
          <div className="absolute left-0 top-12 z-[60] hidden lg:block">
            <Button
              onClick={() => setIsHidden(false)}
              className="h-10 w-6 bg-[var(--color-surface)] hover:bg-white/5 text-slate-500 hover:text-white border-y border-r border-white/10 rounded-l-none rounded-r-lg shadow-xl shadow-black/20 flex items-center justify-center p-0 group"
              title="Abrir Sidebar"
            >
              <PanelLeftOpen className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            </Button>
          </div>
        )}

      <div 
        style={{ width: isHidden ? 0 : 256, opacity: isHidden ? 0 : 1 }}
        className="hidden lg:flex shrink-0 bg-[var(--color-dark-bg)] border-r border-white/5 flex-col z-20 sticky top-0 h-full overflow-hidden"
      >
        
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter">Configurações</h2>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Gerenciamento Geral</p>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsHidden(true)}
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
            title="Recolher Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col overflow-y-auto pb-10 px-2 scrollbar-hide">
          <MenuSection title="Preferências" icon={<Bell className="w-4 h-4" />} items={secPreferencias} currentPath={location.pathname} />
          <MenuSection title="Empresa" icon={<Building className="w-4 h-4" />} items={secEmpresa} currentPath={location.pathname} />
          {activeModules.crm && <MenuSection title="CRM" icon={<Columns3 className="w-4 h-4" />} items={secCRM} currentPath={location.pathname} />}
          {activeModules.produtividade && <MenuSection title="Prod." icon={<Briefcase className="w-4 h-4" />} items={secProdutividade} currentPath={location.pathname} />}
          {activeModules.financeiro && <MenuSection title="Financeiro" icon={<Globe className="w-4 h-4" />} items={secFinanceiro} currentPath={location.pathname} />}
          {(activeModules.marketing || activeModules.engajamento) && <MenuSection title="Engaj." icon={<Zap className="w-4 h-4" />} items={secEngajamento} currentPath={location.pathname} />}
          <MenuSection title="Integrações" icon={<Users className="w-4 h-4" />} items={secIntegracoes} currentPath={location.pathname} />
          <MenuSection title="Sistema" icon={<Zap className="w-4 h-4" />} items={secSistema} currentPath={location.pathname} />
        </div>
      </div>

      {/* Mobile Top Nav */}
      <div className="lg:hidden w-full bg-[var(--color-dark-bg)] border-b border-white/5 pt-3 shrink-0 z-20 sticky top-0">
        <div className="px-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tighter">Configurações</h2>
          </div>
          <button 
            className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

          {mobileMenuOpen && (
            <div 
              className="absolute top-full left-0 right-0 bg-[var(--color-dark-bg)] border-b border-white/10 shadow-2xl max-h-[75vh] overflow-y-auto p-4 z-40"
            >
              <MenuSection title="Preferências" icon={<Bell className="w-4 h-4" />} items={secPreferencias} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Empresa" icon={<Building className="w-4 h-4" />} items={secEmpresa} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              {activeModules.crm && <MenuSection title="CRM" icon={<Columns3 className="w-4 h-4" />} items={secCRM} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />}
              {activeModules.produtividade && <MenuSection title="Prod." icon={<Briefcase className="w-4 h-4" />} items={secProdutividade} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />}
              {activeModules.financeiro && <MenuSection title="Financeiro" icon={<Globe className="w-4 h-4" />} items={secFinanceiro} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />}
              {(activeModules.marketing || activeModules.engajamento) && <MenuSection title="Engaj." icon={<Zap className="w-4 h-4" />} items={secEngajamento} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />}
              <MenuSection title="Integrações" icon={<Users className="w-4 h-4" />} items={secIntegracoes} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Sistema" icon={<Zap className="w-4 h-4" />} items={secSistema} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          )}
      </div>
      
      {/* Configurações Main Content */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8 relative min-w-0 w-full">
        <Outlet />
      </div>
    </div>
  );
}

function MenuSection({ title, icon, items, currentPath, onItemClick }: { title: string, icon: React.ReactNode, items: any[], currentPath: string, onItemClick?: () => void }) {
  return (
    <div className="px-2 w-full md:w-auto mb-6 last:mb-0">
      <div className="px-4 mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {icon} <span>{title}</span>
      </div>
      <div className="space-y-0.5 flex flex-col">
        {items.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <Link
              key={item.title}
              to={item.path}
              onClick={onItemClick}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="truncate w-full text-left">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
