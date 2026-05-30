import React, { useState, useEffect } from 'react';
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { 
  Cpu, Sparkles, Smartphone, Sun, Activity, RefreshCw, Layers, Database, UserCheck, 
  ArrowRight, Target, Award, DollarSign, Package, MessageSquare, Users, Columns3, Check, Clock
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_PRESETS } from "./constants/demoPresets";

export default function ConfigModulosDemos() {
  const { login, user } = useAuth();
  
  // Dynamic Modules States
  const [activeModules, setActiveModules] = useState<{ [key: string]: boolean }>({
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

  const [simulationRole, setSimulationRole] = useState(() => {
    return localStorage.getItem("axis_simulation_role") || "Administrador / Sócio";
  });

  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);

  // Load modules configuration from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("axis_sidebar_modules");
      if (saved) {
        setActiveModules(JSON.parse(saved));
      } else {
        localStorage.setItem("axis_sidebar_modules", JSON.stringify(activeModules));
      }
    } catch (e) {}
  }, []);

  // Update modules list helper
  const handleToggleModule = (key: string) => {
    const updated = {
      ...activeModules,
      [key]: !activeModules[key]
    };
    setActiveModules(updated);
    localStorage.setItem("axis_sidebar_modules", JSON.stringify(updated));
    
    // Broadcast sidebar modules change event
    const event = new CustomEvent("axis_modules_changed", { detail: updated });
    window.dispatchEvent(event);
    toast.success(`Módulo "${key.toUpperCase()}" ${updated[key] ? 'ATIVADO' : 'OCULTADO'} com sucesso!`);
  };

  // Switch role helper
  const handleSwitchRole = (role: string) => {
    setSimulationRole(role);
    localStorage.setItem("axis_simulation_role", role);
    
    if (user) {
      const updatedUser = {
        ...user,
        role: role
      };
      login(updatedUser);
    }
    toast.info(`Simulando visualização para a função: ${role}`);
  };

  const applyPreset = (presetName: string) => {
    let preset: typeof activeModules;
    switch (presetName) {
      case "ALL_ACTIVE":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: true, engajamento: true, rh: true, bi: true, clinica: true, marketing: true };
        toast.info("Aplicado Preset: Ecossistema Global (Todos Ativos)");
        break;
      case "EDUCACAO":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: false, engajamento: true, rh: true, bi: true, clinica: false, marketing: true };
        toast.info("Aplicado Preset: Admissão & Educação (Foco Turmas e Alunos)");
        break;
      case "SDR_CLOSER":
        preset = { crm: true, educacao: false, produtividade: true, financeiro: false, catalogo: false, engajamento: true, rh: false, bi: true, clinica: false, marketing: true };
        toast.info("Aplicado Preset: Agência SDR & Closers (Estrutura Leve / Funil)");
        break;
      default:
        return;
    }
    setActiveModules(preset);
    localStorage.setItem("axis_sidebar_modules", JSON.stringify(preset));
    window.dispatchEvent(new CustomEvent("axis_modules_changed", { detail: preset }));
  };

  // Demo Importer Main Logic
  const handleImportPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setLoadingPresetId(preset.id);
    
    setTimeout(() => {
      // 1. Update session niche & tenant name
      if (user) {
        const updatedUser = {
          ...user,
          tenantNiche: preset.niche as any,
          tenantName: preset.name
        };
        login(updatedUser);
      }

      // 2. Set specific active modules for this demo template
      const fullModulesList = {
        crm: preset.modules.crm,
        educacao: preset.modules.educacao,
        clinica: preset.modules.clinica,
        financeiro: preset.modules.financeiro,
        catalogo: preset.modules.crm,
        marketing: preset.modules.marketing,
        engajamento: preset.modules.engajamento,
        rh: preset.modules.rh,
        bi: preset.modules.bi,
        produtividade: true // Always true helper
      };

      setActiveModules(fullModulesList);
      localStorage.setItem("axis_sidebar_modules", JSON.stringify(fullModulesList));
      
      // 3. Inject customized Industry Data
      if (preset.stages && preset.stages.length > 0) {
        localStorage.setItem("axis_custom_stages", JSON.stringify(preset.stages));
      }
      if (preset.leads && preset.leads.length > 0) {
        localStorage.setItem("axis_leads", JSON.stringify(preset.leads));
      }
      if (preset.finance && preset.finance.length > 0) {
        localStorage.setItem("axis_finance_entries", JSON.stringify(preset.finance));
      }
      if (preset.appointments) {
        localStorage.setItem("axis_appointments", JSON.stringify(preset.appointments));
      }

      // Dispatch global events for instant sync
      window.dispatchEvent(new CustomEvent("axis_modules_changed", { detail: fullModulesList }));
      window.dispatchEvent(new CustomEvent("axis_brand_changed"));
      
      setLoadingPresetId(null);
      toast.success(`Demo "${preset.name}" carregada perfeitamente! Dados e funis reconfigurados.`);
      
      // Slight delay and dispatch visual reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      
      {/* Header Panel */}
      <div className="border border-white/5 bg-[#111827]/40 p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-[#06B6D4]/13 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-extrabold uppercase tracking-wide">
              <Cpu className="w-3.5 h-3.5" /> Arquitetura Multitenant Modular
            </div>
            <h1 className="text-3xl font-black italic text-white tracking-tighter">Modicality Control Center</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Carregue Demos estruturadas por nicho de atuação da empresa. O painel adapta as regras de permissão, funis, bancos de dados simulados de leads e visibilidade do menu dinâmico no ato.
            </p>
          </div>
          <Card className="p-4 bg-[#0B1120]/90 border border-white/10 flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tenant Ativo</p>
              <h4 className="text-sm font-black text-white max-w-[200px] truncate">{user?.tenantName || "G-Tech Master"}</h4>
              <p className="text-[9px] text-[#06B6D4] font-black uppercase tracking-widest mt-0.5">Nicho: {user?.tenantNiche || "Master"}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* 4 DEMO PRESETS */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Demos por Nicho Comercial
          </h2>
          <p className="text-xs text-slate-400">Importe configurações pré-montadas de acordo com o segmento comercial selecionado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_PRESETS.map((demo) => {
            const IconComponent = demo.icon;
            const isCurrentNiche = user?.tenantNiche === demo.niche;
            const isLoading = loadingPresetId === demo.id;

            return (
              <Card 
                key={demo.id} 
                className={`p-6 border transition-all relative flex flex-col justify-between overflow-hidden group ${
                  isCurrentNiche 
                    ? "bg-[#1E293B]/40 border-blue-500/40 shadow-[0_4px_30px_rgba(37,99,235,0.15)]" 
                    : "bg-[#111827]/60 border-white/5 hover:border-white/15"
                }`}
              >
                {/* Gradient background glowing */}
                {isCurrentNiche && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${demo.bgAccent} border flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isCurrentNiche ? (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        NICHO ATIVO
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">
                        PRESET DISPONÍVEL
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{demo.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal min-h-[50px]">{demo.description}</p>
                  </div>

                  {/* Modules to enable list preview */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Recursos Ativos no Menu:</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[9px] font-bold">CRM Funnel</span>
                      {demo.modules.clinica && <span className="px-2 py-0.5 bg-red-500/10 text-rose-400 rounded text-[9px] font-bold">Clínica EHR</span>}
                      {demo.modules.financeiro && <span className="px-2 py-0.5 bg-[#10B981]/10 text-emerald-400 rounded text-[9px] font-bold">Financeiro Avançado</span>}
                      {demo.modules.marketing && <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-bold">Automação Marketing</span>}
                      {demo.modules.bi && <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-bold">BI Analítico</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 block">Etapas de vendas:</span>
                    <span className="text-xs text-slate-300 font-bold leading-none">{demo.stages.length} Estágios de Funil</span>
                  </div>
                  
                  <button
                    onClick={() => handleImportPreset(demo)}
                    disabled={isLoading || isCurrentNiche}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all ${
                      isCurrentNiche
                        ? "bg-slate-800 text-slate-500 cursor-default border border-white/5"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Injetando...
                      </>
                    ) : isCurrentNiche ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Ativado
                      </>
                    ) : (
                      <>
                        Rodar Demo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* INDIVIDUAL MODULE ACTIVATION SWITCHES */}
      {(user?.isMaster || user?.tenantName?.includes("G-Tech")) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module flags */}
        <div className="lg:col-span-2 space-y-4">
          {/* Modular Sidebar Section */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Sidebar Modular Sob Medida
              </h3>
              <p className="text-xs text-slate-400">Ative ou desative seções inteiras da sua barra lateral para simplificar a interface e moldar o CRM para a sua operação.</p>
            </div>

            {/* Quick Presets */}
            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">🎯 Presets Estratégicos de Operação</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  onClick={() => applyPreset("ALL_ACTIVE")}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  🌐 Geral Full
                </button>
                <button 
                  onClick={() => applyPreset("EDUCACAO")}
                  className="px-3 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  🎓 Escola/Edu
                </button>
                <button 
                  onClick={() => applyPreset("SDR_CLOSER")}
                  className="px-3 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/25 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  ⚡ SDR & Closers
                </button>
              </div>
            </div>

            {/* Individual toggles list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {[
                { id: 'crm', title: "Motor de CRM & Pipeline", desc: "Leads, Funil Comercial e SDR IA", icon: Target },
                { id: 'educacao', title: "Educação & Admissão", desc: "Turmas, Matrículas, Alunos e Acadêmico", icon: Award },
                { id: 'produtividade', title: "Tarefas & Produtividade", desc: "Quadro Kanban de afazeres diários", icon: Clock },
                { id: 'financeiro', title: "Cofre & Financeiro", desc: "Painel Financeiro, Entradas, Saídas e DRE", icon: DollarSign },
                { id: 'catalogo', title: "Catálogo de Produtos", desc: "Rastreamento, estoque, iPhones e SKUs", icon: Package },
                { id: 'engajamento', title: "Engajamento & Mensagens", desc: "Central de WhatsApp, E-mail e Automações", icon: MessageSquare },
                { id: 'rh', title: "RH & Colaboradores", desc: "Equipe interna, comissões de corretores/closers", icon: Users },
                { id: 'bi', title: "BI & Indicadores Relatórios", desc: "Melhores estatísticas de faturamento e OTE", icon: Columns3 }
              ].map((mod) => {
                const isEnabled = activeModules[mod.id] ?? true;
                return (
                  <div 
                    key={mod.id} 
                    onClick={() => handleToggleModule(mod.id)}
                    className={`p-4 bg-[#0B1120] border rounded-2xl flex items-center justify-between gap-4 cursor-pointer select-none transition-all duration-300 ${
                      isEnabled 
                        ? 'border-blue-500/40 bg-blue-600/[0.02] shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                        : 'border-white/5 opacity-55 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isEnabled ? 'bg-blue-600/10 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                        <mod.icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-black text-white uppercase tracking-wider block">{mod.title}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight block truncate mt-0.5">{mod.desc}</span>
                      </div>
                    </div>
                    <div>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-700 justify-start'}`}>
                        <div className="w-3 h-3 rounded-full bg-white transition-transform shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Simulador de Usuário & Permissões */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" /> Cargos & Permissões
            </h2>
            <p className="text-xs text-slate-400">Varie os níveis de autorização para simular a visão de cada usuário.</p>
          </div>

          <Card className="p-6 border-white/5 bg-[#111827]/80 backdrop-blur-xl rounded-2xl space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Modificando a função do usuário atual do Axis, certas rotas de administrador ou configurações gerais podem se ocultar ou necessitar de re-autorização no Middleware.
            </p>

            <div className="space-y-2.5">
              {[
                { title: "Administrador / Sócio", desc: "Acesso total irrestrito a configurações de infraestrutura e relatórios de DRE." },
                { title: "Médico / Clínico Closer", desc: "Permissões restritas focadas em prontuários EHR e telemedicina médica." },
                { title: "SDR / Analista de Marketing", desc: "Liberado apenas para triagem de leads, conteúdo e campanhas." },
                { title: "Professor / Mentor de Turmas", desc: "Focado em gerenciar certificados, alunos e base acadêmica." },
              ].map((role) => {
                const isSelected = simulationRole === role.title;
                return (
                  <button
                    key={role.title}
                    onClick={() => handleSwitchRole(role.title)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 relative overflow-hidden group ${
                      isSelected 
                        ? "bg-blue-600/10 border-blue-500/40 text-white font-bold" 
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500" />
                    )}
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? "border-blue-500 text-blue-500" : "border-slate-700"
                      }`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-200">{role.title}</h5>
                      <span className="text-[10px] text-slate-500 block leading-normal mt-1">{role.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[10px] text-blue-400/90 leading-relaxed">
              <strong>Regra de Infrestrutura:</strong> Quando logado como Master, o menu lateral libera painéis de servidores globais no SaaS. Alternando sua empresa por demo acima, o banco de dados reseta instantaneamente.
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}
