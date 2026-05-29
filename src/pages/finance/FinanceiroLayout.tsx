import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Menu, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, FileText, Target,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, X
} from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/button";

export default function FinanceiroLayout() {
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);

  const navItems = [
    { title: "Visão geral", path: "/app/financeiro", icon: PieChart },
    { title: "Faturas", path: "/app/financeiro/faturas", icon: FileText },
    { title: "A receber", path: "/app/financeiro/receber", icon: TrendingUp },
    { title: "A pagar", path: "/app/financeiro/pagar", icon: TrendingDown },
    { title: "Comissões", path: "/app/financeiro/comissoes", icon: DollarSign },
    { title: "Metas", path: "/app/financeiro/metas", icon: Target },
    { title: "DRE", path: "/app/financeiro/dre", icon: Menu },
    { title: "Categorias", path: "/app/financeiro/categorias", icon: Wallet },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full -m-4 lg:-m-8 relative">
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
        className="hidden lg:flex shrink-0 bg-[#0B1120] border-r border-white/5 flex-col pt-6 z-20 print:hidden sticky top-0 h-[calc(100vh-80px)] overflow-hidden"
      >
        <div className="px-6 mb-4 flex items-center justify-between">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold text-slate-500 uppercase tracking-widest"
          >
            Financeiro
          </motion.h2>
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

        <div className="px-2 space-y-0.5 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.title} to={item.path}>
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-600/10 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-600 group-hover:text-slate-400'}`} /> 
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.title}
                  </motion.span>
                </button>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Mobile Top Nav (Always visible on small screens) */}
      <div className="lg:hidden w-full bg-[#0B1120] border-b border-white/5 pt-4 shrink-0 z-20 overflow-x-auto scrollbar-hide">
        <div className="px-2 pb-2 flex flex-row gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.title} to={item.path} className="shrink-0">
                <button className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600/10 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-600'}`} /> 
                  <span className="whitespace-nowrap">{item.title}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Financeiro Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
        <Outlet />
      </div>
    </div>
  );
}
