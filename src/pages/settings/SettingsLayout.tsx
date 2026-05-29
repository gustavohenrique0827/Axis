import React, { useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Building, Users, Columns3, Briefcase, Zap, Globe, Bell, Menu, X, 
  PanelLeftClose, PanelLeftOpen 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/button";

export default function SettingsLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const secPreferencias = [
    { title: "Preferências de Notificação", path: "/app/configuracoes/usuario/notificacoes" },
  ];

  const secEmpresa = [
    { title: "Dados da empresa", path: "/app/configuracoes/empresa/dados" },
    { title: "Módulos & Demos Ativas", path: "/app/configuracoes/empresa/modulos" },
    { title: "Aparência & marca", path: "/app/configuracoes/empresa/marca" },
    { title: "Filiais", path: "/app/configuracoes/empresa/filiais" },
    { title: "Equipe & convites", path: "/app/configuracoes/empresa/equipe" },
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
  ];

  const secProdutividade = [
    { title: "Categorias de tarefas", path: "/app/configuracoes/produtividade/categorias" },
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
    <div className="flex flex-col lg:flex-row h-full -mx-4 sm:mx-0 -my-4 lg:-m-8 relative w-full lg:w-auto">
      {/* Floating Trigger when Hidden */}
      <AnimatePresence>
        {isHidden && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-0 top-12 z-[60] hidden lg:block"
          >
            <Button
              onClick={() => setIsHidden(false)}
              className="h-10 w-6 bg-[#0B1120] hover:bg-white/5 text-slate-500 hover:text-white border-y border-r border-white/10 rounded-l-none rounded-r-lg shadow-xl shadow-black/20 flex items-center justify-center p-0 group"
              title="Abrir Sidebar"
            >
              <PanelLeftOpen className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          width: isHidden ? 0 : 256,
          opacity: isHidden ? 0 : 1,
          x: isHidden ? -20 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex bg-[#0B1120] border-r border-white/5 flex-col shrink-0 z-20 lg:overflow-visible sticky top-0 h-[calc(100vh-80px)] overflow-hidden"
      >
        
        <div className="px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-black text-white tracking-tighter">Configurações</h2>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Gerenciamento Geral</p>
          </motion.div>
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
          <MenuSection title="CRM" icon={<Columns3 className="w-4 h-4" />} items={secCRM} currentPath={location.pathname} />
          <MenuSection title="Prod." icon={<Briefcase className="w-4 h-4" />} items={secProdutividade} currentPath={location.pathname} />
          <MenuSection title="Financeiro" icon={<Globe className="w-4 h-4" />} items={secFinanceiro} currentPath={location.pathname} />
          <MenuSection title="Engaj." icon={<Zap className="w-4 h-4" />} items={secEngajamento} currentPath={location.pathname} />
          <MenuSection title="Integrações" icon={<Users className="w-4 h-4" />} items={secIntegracoes} currentPath={location.pathname} />
          <MenuSection title="Sistema" icon={<Zap className="w-4 h-4" />} items={secSistema} currentPath={location.pathname} />
        </div>
      </motion.div>

      {/* Mobile Top Nav */}
      <div className="lg:hidden w-full bg-[#0B1120] border-b border-white/5 pt-3 shrink-0 z-20 sticky top-0">
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

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 right-0 bg-[#0B1120] border-b border-white/10 shadow-2xl max-h-[75vh] overflow-y-auto p-4 z-40"
            >
              <MenuSection title="Preferências" icon={<Bell className="w-4 h-4" />} items={secPreferencias} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Empresa" icon={<Building className="w-4 h-4" />} items={secEmpresa} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="CRM" icon={<Columns3 className="w-4 h-4" />} items={secCRM} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Prod." icon={<Briefcase className="w-4 h-4" />} items={secProdutividade} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Financeiro" icon={<Globe className="w-4 h-4" />} items={secFinanceiro} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Engaj." icon={<Zap className="w-4 h-4" />} items={secEngajamento} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Integrações" icon={<Users className="w-4 h-4" />} items={secIntegracoes} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
              <MenuSection title="Sistema" icon={<Zap className="w-4 h-4" />} items={secSistema} currentPath={location.pathname} onItemClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Configurações Main Content */}
      <div className="flex-1 lg:overflow-auto overflow-visible p-2 sm:p-4 lg:p-8 relative min-w-0 w-full">
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
            <Link key={item.title} to={item.path} onClick={onItemClick}>
              <button className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="truncate w-full text-left">{item.title}</span>
              </button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
