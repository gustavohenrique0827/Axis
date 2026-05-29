import React, { useState, useMemo } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Save, Plus, Palette, Store, Users, Key, Columns3, Target, Package, Briefcase, DollarSign, MessageSquare, Zap, ExternalLink, Mail, FileText, Bell, Clock, ShieldAlert, Award, ChevronDown, ChevronUp, Settings, X, Flame, Check, Volume2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../../contexts/DataContext";
import { ActionModal } from "../../components/ui/ActionModal";
import { Reorder } from "motion/react";

export function ConfigEmpresaMarca() {
  const { theme, toggleTheme } = useData();
  const [activeModules, setActiveModules] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem("axis_sidebar_modules");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      crm: true,
      educacao: true,
      produtividade: true,
      financeiro: true,
      catalogo: true,
      engajamento: true,
      rh: true,
      bi: true,
    };
  });

  // Logo States
  const [logoDarkFull, setLogoDarkFull] = useState(() => localStorage.getItem("axis_brand_logo_dark_full") || "/logo-full.png");
  const [logoDarkIcon, setLogoDarkIcon] = useState(() => localStorage.getItem("axis_brand_logo_dark_icon") || "/logo-icon.png");
  const [logoLightFull, setLogoLightFull] = useState(() => localStorage.getItem("axis_brand_logo_light_full") || "/logo-full.png");
  const [logoLightIcon, setLogoLightIcon] = useState(() => localStorage.getItem("axis_brand_logo_light_icon") || "/logo-icon.png");

  // Global Color States
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem("axis_brand_primary_color") || "#2563EB");
  const [secondaryColor, setSecondaryColor] = useState(() => localStorage.getItem("axis_brand_secondary_color") || "#0F172A");
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("axis_brand_accent_color") || "#06B6D4");
  const [successColor, setSuccessColor] = useState(() => localStorage.getItem("axis_brand_success_color") || "#10B981");
  const [dangerColor, setDangerColor] = useState(() => localStorage.getItem("axis_brand_danger_color") || "#EF4444");

  const saveModules = (newMods: typeof activeModules) => {
    setActiveModules(newMods);
    localStorage.setItem("axis_sidebar_modules", JSON.stringify(newMods));
    window.dispatchEvent(new CustomEvent("axis_modules_changed", { detail: newMods }));
    toast.success("Módulos da Sidebar atualizados e sincronizados em tempo real!");
  };

  const handleToggle = (key: string) => {
    const updated = { ...activeModules, [key]: !activeModules[key] };
    saveModules(updated);
  };

  const applyPreset = (presetName: string) => {
    let preset: typeof activeModules;
    switch (presetName) {
      case "ALL_ACTIVE":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: true, engajamento: true, rh: true, bi: true };
        toast.info("Aplicado Preset: Ecossistema Global (Todos Ativos)");
        break;
      case "EDUCACAO":
        preset = { crm: true, educacao: true, produtividade: true, financeiro: true, catalogo: false, engajamento: true, rh: true, bi: true };
        toast.info("Aplicado Preset: Admissão & Educação (Foco Turmas e Alunos)");
        break;
      case "SDR_CLOSER":
        preset = { crm: true, educacao: false, produtividade: true, financeiro: false, catalogo: false, engajamento: true, rh: false, bi: true };
        toast.info("Aplicado Preset: Agência SDR & Closers (Estrutura Leve / Funil)");
        break;
      default:
        return;
    }
    saveModules(preset);
  };

  const handleSaveBrand = () => {
    localStorage.setItem("axis_brand_logo_dark_full", logoDarkFull);
    localStorage.setItem("axis_brand_logo_dark_icon", logoDarkIcon);
    localStorage.setItem("axis_brand_logo_light_full", logoLightFull);
    localStorage.setItem("axis_brand_logo_light_icon", logoLightIcon);
    localStorage.setItem("axis_brand_primary_color", primaryColor);
    localStorage.setItem("axis_brand_secondary_color", secondaryColor);
    localStorage.setItem("axis_brand_accent_color", accentColor);
    localStorage.setItem("axis_brand_success_color", successColor);
    localStorage.setItem("axis_brand_danger_color", dangerColor);
    
    window.dispatchEvent(new CustomEvent("axis_brand_changed"));
    toast.success("Identidade visual da marca salva com sucesso e sincronizada em tempo real!");
  };

  const simulateUpload = (type: "darkFull" | "darkIcon" | "lightFull" | "lightIcon") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const result = event.target.result;
          if (type === "darkFull") setLogoDarkFull(result);
          if (type === "darkIcon") setLogoDarkIcon(result);
          if (type === "lightFull") setLogoLightFull(result);
          if (type === "lightIcon") setLogoLightIcon(result);
          toast.success("Imagem carregada com sucesso! Clique em 'Salvar Visual' para registrar.");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-1 sm:p-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aparência & Marca</h1>
        <p className="text-sm text-slate-400">Personalize a identidade visual e os módulos visíveis do seu AX CRM.</p>
      </div>

      <Card className="p-4 sm:p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">Identidade Visual</h3>
        
        {/* LOGO VERSÃO ESCURA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#06B6D4]">🌑 Logotipo Versão Escura (Default/Dark Mode)</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Utilizado nos fundos escuros da plataforma padrão do AX CRM.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dark Mode: Full Logo */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logo Completo de Cabeçalho</span>
              <div className="h-24 bg-[#0B1120] rounded-xl border border-dashed border-white/10 flex items-center justify-center p-2 relative overflow-hidden group">
                <img src={logoDarkFull} alt="Dark Full Logo" className="max-h-16 object-contain mix-blend-screen" />
                <button 
                  onClick={() => simulateUpload("darkFull")}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white uppercase tracking-widest"
                >
                  Fazer Upload
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ou insira a URL do Logotipo</label>
                <input 
                  type="text" 
                  value={logoDarkFull} 
                  onChange={(e) => setLogoDarkFull(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Dark Mode: Simplificado Logo Icon */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ícone Compacto Simplificado</span>
              <div className="h-24 bg-[#0B1120] rounded-xl border border-dashed border-white/10 flex items-center justify-center p-2 relative overflow-hidden group">
                <img src={logoDarkIcon} alt="Dark Icon" className="w-12 h-12 object-contain rounded-lg p-1 bg-white mix-blend-screen" />
                <button 
                  onClick={() => simulateUpload("darkIcon")}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white uppercase tracking-widest"
                >
                  Fazer Upload
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ou insira a URL do Ícone</label>
                <input 
                  type="text" 
                  value={logoDarkIcon} 
                  onChange={(e) => setLogoDarkIcon(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* LOGO VERSÃO CLARA */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">☀️ Logotipo Versão Clara (Light Mode)</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Utilizado quando o usuário ativa o Light Mode nas configurações visuais.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light Mode: Full Logo */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logo Completo (Luminoso)</span>
              <div className="h-24 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                <img src={logoLightFull} alt="Light Full Logo" className="max-h-16 object-contain" />
                <button 
                  onClick={() => simulateUpload("lightFull")}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white uppercase tracking-widest"
                >
                  Fazer Upload
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ou insira a URL do Logotipo</label>
                <input 
                  type="text" 
                  value={logoLightFull} 
                  onChange={(e) => setLogoLightFull(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Light Mode: Simplificado Logo Icon */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ícone Compacto (Luminoso)</span>
              <div className="h-24 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                <img src={logoLightIcon} alt="Light Icon" className="w-12 h-12 object-contain rounded-lg p-1 bg-slate-100" />
                <button 
                  onClick={() => simulateUpload("lightIcon")}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white uppercase tracking-widest"
                >
                  Fazer Upload
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ou insira a URL do Ícone</label>
                <input 
                  type="text" 
                  value={logoLightIcon} 
                  onChange={(e) => setLogoLightIcon(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* CORES GLOBAIS DA IDENTIDADE VISUAL */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Palette className="w-4.5 h-4.5 text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-widest text-[#06B6D4]">🎨 Seletores de Cores Globais</span>
          </div>
          <p className="text-xs text-slate-400 -mt-2">Personalize a paleta central da plataforma para refletir a identidade visual corporativa.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            
            {/* Cor Primária */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Cor Primária (Principal)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-white/15 bg-transparent cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Cor Secundária (Fundo Cards)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-white/15 bg-transparent cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cor de Destaque / Accent */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Cor de Destaque (Glow)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded border border-white/15 bg-transparent cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cor de Sucesso */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Cor Temática de Sucesso</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={successColor} 
                  onChange={(e) => setSuccessColor(e.target.value)}
                  className="w-10 h-10 rounded border border-white/15 bg-transparent cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={successColor} 
                  onChange={(e) => setSuccessColor(e.target.value)}
                  className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cor de Alerta / Perigo */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Cor Temática de Alerta</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={dangerColor} 
                  onChange={(e) => setDangerColor(e.target.value)}
                  className="w-10 h-10 rounded border border-white/15 bg-transparent cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={dangerColor} 
                  onChange={(e) => setDangerColor(e.target.value)}
                  className="flex-1 bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tema do Sistema Dropdown */}
            <div className="p-4 bg-[#0B1120] border border-white/5 rounded-2xl space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Tema do Sistema Ativo</label>
              <div className="h-10 flex items-center">
                <select 
                  value={theme}
                  onChange={(e) => {
                    const selected = e.target.value as 'dark' | 'light';
                    if (selected !== theme) {
                      toggleTheme();
                    }
                  }}
                  className="w-full h-full bg-[#111827] border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none text-slate-300"
                >
                  <option value="dark">Dark Mode (Padrão)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-4 border-b border-white/5 pb-4">
           <Button onClick={handleSaveBrand} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Save className="w-4 h-4 mr-2" /> Salvar Visual</Button>
        </div>

        {/* Modular Sidebar Section */}
        <div className="space-y-6 pt-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">🎛️ Sidebar Modular Sob Medida</h3>
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
                  onClick={() => handleToggle(mod.id)}
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
      </Card>
    </div>
  );
}

export function ConfigEmpresaFiliais() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filiais / Unidades</h1>
          <p className="text-sm text-slate-400">Cadastre múltiplas unidades da sua empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Filial</Button>
      </div>

      <div className="grid gap-4">
        {[
          { nome: "Matriz - São Paulo", cnpj: "00.000.000/0001-00", cidade: "São Paulo, SP", status: "Principal" },
          { nome: "Filial - Rio de Janeiro", cnpj: "00.000.000/0002-11", cidade: "Rio de Janeiro, RJ", status: "Ativa" }
        ].map((filial, i) => (
          <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                 <Store className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                 <h4 className="font-bold text-white">{filial.nome}</h4>
                 <div className="text-xs text-slate-400 mt-1 flex gap-3">
                    <span>CNPJ: {filial.cnpj}</span>
                    <span>{filial.cidade}</span>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${filial.status === 'Principal' ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'bg-emerald-500/20 text-emerald-400'}`}>{filial.status}</span>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Filial"
        actionText="Cadastrar Filial"
        fields={[
          { name: "nome", label: "Nome da Unidade", type: "text", required: true },
          { name: "cnpj", label: "CNPJ", type: "text", required: true },
          { name: "cidade", label: "Cidade / Estado", type: "text", required: true }
        ]}
      />
    </div>
  );
}

export function ConfigEmpresaEquipe() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe & Convites</h1>
          <p className="text-sm text-slate-400">Convide novos membros para sua empresa no Axis.</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Users className="w-4 h-4 mr-2" /> Convidar Membro</Button>
      </div>
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <p className="text-slate-400">Gerenciamento de equipe movido para o menu principal. Acesse "Equipe" na barra lateral esquerda.</p>
         <Button onClick={() => window.location.href='/app/equipe'} className="mt-4 bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Gestão de Equipe <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>
    </div>
  );
}

export function ConfigEmpresaPermissoes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis & Permissões</h1>
          <p className="text-sm text-slate-400">Controle o nível de acesso (RBAC) de cada perfil.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Perfil</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { perfil: "Administrador", modulos: "Acesso Total", usuarios: 2, icon: Key, color: "text-rose-500", bg: "bg-rose-500/10" },
          { perfil: "Gerente Comercial", modulos: "Dashboards, CRM, Relatórios", usuarios: 1, icon: Target, color: "text-[#2563EB]", bg: "bg-[#2563EB]/10" },
          { perfil: "Vendedor Sênior", modulos: "CRM, Tarefas", usuarios: 4, icon: Briefcase, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
          { perfil: "Financeiro", modulos: "Faturamento, Notas, Relatórios", usuarios: 1, icon: DollarSign, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
        ].map((p, i) => (
           <Card key={i} className="p-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-2 rounded-lg ${p.bg}`}>
                    <p.icon className={`w-5 h-5 ${p.color}`} />
                 </div>
                 <div className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">{p.usuarios} usuários</div>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">{p.perfil}</h3>
              <p className="text-xs text-slate-400 h-8">{p.modulos}</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                 <button className="text-xs font-bold text-[#2563EB] hover:text-blue-400 uppercase tracking-widest">Editar Permissões</button>
              </div>
           </Card>
        ))}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Perfil"
        actionText="Cadastrar Perfil"
        fields={[
          { name: "nome", label: "Nome do Perfil", type: "text", required: true },
          { name: "modulos", label: "Módulos de Acesso (Separados por vírgula)", type: "text" }
        ]}
      />
    </div>
  );
}

export function ConfigCRMCampos() {
  const { customLeadFields, setCustomLeadFields } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const handleSave = (field: any) => {
    if (editingField) {
      setCustomLeadFields(customLeadFields.map(f => f.id === editingField.id ? { ...field, id: editingField.id } : f));
    } else {
      setCustomLeadFields([...customLeadFields, { ...field, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsModalOpen(false);
    setEditingField(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campos Personalizados (CRM)</h1>
          <p className="text-sm text-slate-400">Defina campos adicionais e validações para seus leads.</p>
        </div>
        <Button onClick={() => { setEditingField(null); setIsModalOpen(true); }} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
      </div>
      
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <div className="space-y-3">
           {customLeadFields.map((field) => (
             <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{field.name}</span>
                  <div className="flex gap-4 mt-0.5">
                    <span className="text-xs text-slate-500 font-mono">Tipo: {field.type}</span>
                    {field.validationRegex && <span className="text-xs text-slate-500 font-mono italic">Regex: {field.validationRegex}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white group-hover:opacity-100 opacity-0" onClick={() => { setEditingField(field); setIsModalOpen(true); }}>Editar</Button>
             </div>
           ))}
         </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? "Editar Campo" : "Novo Campo"}
        actionText="Salvar"
        fields={[
          { name: "name", label: "Nome do Campo", type: "text", required: true, defaultValue: editingField?.name },
          { name: "type", label: "Tipo de Dado", type: "select", options: ["Texto", "Número", "Data"], defaultValue: editingField?.type },
          { name: "required", label: "Obrigatório", type: "checkbox", defaultValue: editingField?.required },
          { name: "validationRegex", label: "Validação (Regex)", type: "text", defaultValue: editingField?.validationRegex }
        ]}
        onAction={(data: any) => handleSave(data)}
      />
    </div>
  );
}

// CRM
export function ConfigCRMFunis() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funis & Etapas</h1>
          <p className="text-sm text-slate-400">Configure os pipelines de vendas da empresa.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Funil</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Columns3 className="w-5 h-5 text-[#2563EB]" /> Funil Principal Exemplo</h3>
        <div className="space-y-3">
          {['Prospecção', 'Qualificação', 'Proposta Enviada', 'Negociação', 'Fechamento'].map((etapa, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-slate-400">{i+1}</div>
                 <span className="font-bold text-white">{etapa}</span>
               </div>
               <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar Etapa</Button>
            </div>
          ))}
        </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Funil"
        actionText="Criar Funil"
        fields={[
          { name: "nome", label: "Nome do Funil", type: "text", required: true }
        ]}
      />
    </div>
  )
}

export function ConfigCRMOrigens() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Origens de Leads</h1>
                    <p className="text-sm text-slate-400">Classificação de onde seus leads estão vindo.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Origem</Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                {['Google Ads', 'Meta Ads', 'Orgânico', 'Indicação', 'Prospecção Ativa (Outbound)', 'Parceiros'].map((origem, i) => (
                    <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex justify-between items-center gap-4 group">
                        <span className="font-semibold text-slate-200">{origem}</span>
                        <Target className="w-4 h-4 text-slate-500 group-hover:text-[#2563EB]" />
                    </Card>
                ))}
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Origem"
                actionText="Cadastrar Origem"
                fields={[
                { name: "nome", label: "Nome da Origem", type: "text", required: true }
                ]}
            />
        </div>
    );
}

export function ConfigCRMProdutos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customFields, setCustomFields] = useState([
    { id: 1, name: "Código SKU", type: "Texto" },
    { id: 2, name: "Peso (kg)", type: "Número" },
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-400">Personalize os dados de produtos e serviços.</p>
        </div>
      </div>
      
      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <h3 className="font-bold text-lg mb-2">Acesso ao Catálogo</h3>
         <p className="text-slate-400 mb-4 text-sm">O catálogo principal foi movido para o menu lateral. Acesse "Produtos" na barra de navegação esquerda.</p>
         <Button onClick={() => window.location.href='/app/produtos'} className="bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Ir para Produtos <ExternalLink className="w-4 h-4 ml-2" /></Button>
      </Card>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg">Campos Personalizados</h3>
              <p className="text-sm text-slate-400">Adicione mais detalhes aos produtos (SKU, dimensões, atributos específicos).</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold h-9 bg-transparent border border-white/10 shadow-none"><Plus className="w-4 h-4 mr-2" /> Novo Campo</Button>
         </div>
         
         <div className="space-y-3">
           {customFields.map((field) => (
             <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1120] border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{field.name}</span>
                  <span className="text-xs text-slate-500 font-mono mt-0.5">Tipo: {field.type}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">Editar Campo</Button>
             </div>
           ))}
         </div>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Campo Personalizado"
        actionText="Salvar Campo"
        fields={[
          { name: "nome", label: "Nome do Campo (ex: Código SKU)", type: "text", required: true },
          { name: "tipo", label: "Tipo de Dado", type: "select", options: ["Texto", "Número", "Data", "Verdadeiro / Falso (Checkbox)"] }
        ]}
      />
    </div>
  );
}

// Produtividade
export function ConfigProdutividadeCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { squads, leads } = useData();

    const cacData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return squads.map(sq => {
            // Count leads assigned to members of this squad in current month
            const newLeads = leads.filter(l => {
                const leadDate = new Date(l.date.replace('Hoje, ', '').replace('Ontem, ', '')); // Simple parser
                const isCurrentMonth = leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
                return isCurrentMonth && sq.membros.some(m => l.seller && m.includes(l.seller.split(' ')[0]));
            }).length;

            const cac = newLeads > 0 ? (sq.orcamentoMensal / newLeads) : 0;

            return {
                name: sq.nome.split(' ')[1] || sq.nome,
                cac: cac,
                leads: newLeads,
                budget: sq.orcamentoMensal
            };
        });
    }, [squads, leads]);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categorias & Produtividade</h1>
                    <p className="text-sm text-slate-400">Organize as tarefas e visualize o CAC por time comercial.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>

            {/* CAC Visualization Section */}
            <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden relative group">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Custo de Aquisição (CAC) por Squad
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Investimento Mensal / Novos Leads (Mês Atual)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cacData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', color: '#fff' }}
                                    formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'CAC']}
                                />
                                <Bar dataKey="cac" radius={[4, 4, 0, 0]} barSize={32}>
                                    {cacData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.cac > 200 ? '#f43f5e' : '#10b981'} fillOpacity={0.6} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {cacData.map((sq, i) => (
                            <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase truncate max-w-[150px]">{sq.name}</span>
                                    <span className={`text-[10px] font-black ${sq.cac > 200 ? 'text-rose-400' : 'text-emerald-400'}`}>R$ {sq.cac.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] text-slate-500 font-bold uppercase">
                                    <span>leads: {sq.leads}</span>
                                    <span>verba: R$ {sq.budget}</span>
                                </div>
                            </div>
                        ))}
                        {cacData.some(s => s.leads === 0) && (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[9px] text-amber-500 font-bold uppercase">Alguns squads estão sem leads novos este mês</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                {[
                    { nome: "Ligação / Follow-up", cor: "bg-blue-500" },
                    { nome: "Reunião Presencial", cor: "bg-emerald-500" },
                    { nome: "Reunião Online", cor: "bg-purple-500" },
                    { nome: "Envio de Proposta", cor: "bg-amber-500" },
                ].map((cat, i) => (
                    <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${cat.cor}`}></div>
                            <span className="font-semibold text-slate-200">{cat.nome}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Editar</Button>
                    </Card>
                ))}
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Categoria de Tarefa"
                fields={[
                { name: "nome", label: "Nome da Categoria", type: "text", required: true },
                { name: "cor", label: "Cor", type: "select", options: ["Azul", "Verde", "Vermelho", "Laranja", "Roxo"] }
                ]}
            />
        </div>
    );
}

// Financeiro
export function ConfigFinanceiroCategorias() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Planos de Contas (Categorias)</h1>
                    <p className="text-sm text-slate-400">Categorias para classificar receitas e despesas.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Categoria</Button>
            </div>
            
            <div className="space-y-6">
                <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-[#10B981] flex items-center gap-2"><DollarSign className="w-5 h-5" /> Receitas</h3>
                    <div className="space-y-2">
                        {['Venda de Software (SaaS)', 'Serviços de Implantação', 'Consultoria', 'Comissões de Parceiros'].map((cat, i) => (
                            <div key={i} className="p-3 bg-[#0B1120] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
                    <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Despesas</h3>
                    <div className="space-y-2">
                        {['Folha de Pagamento', 'Impostos (Simples, PIS/COFINS, etc)', 'Marketing (Ads, Patrocínios)', 'Infraestrutura (Servidores, Cloud)'].map((cat, i) => (
                            <div key={i} className="p-3 bg-[#0B1120] border border-white/5 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-slate-300">{cat}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Plano de Constas"
                fields={[
                { name: "nome", label: "Nome da Categoria", type: "text", required: true },
                { name: "tipo", label: "Tipo", type: "select", options: ["Receita", "Despesa"] }
                ]}
            />
        </div>
    );
}

// Engajamento
export function ConfigEngajamentoModelos() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Modelos de Mensagem</h1>
                    <p className="text-sm text-slate-400">Templates para WhatsApp e E-mail.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Novo Modelo</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { nome: "Apresentação Inicial (Frio)", tipo: "WhatsApp", uso: "145 views" },
                    { nome: "Follow-up de Proposta (3 dias)", tipo: "WhatsApp", uso: "89 views" },
                    { nome: "Boas vindas (Onboarding)", tipo: "E-mail", uso: "230 views" },
                    { nome: "Cobrança Preventiva (-2 dias)", tipo: "WhatsApp", uso: "540 views" },
                ].map((modelo, i) => (
                    <Card key={i} className="p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{modelo.nome}</h4>
                                <div className="text-xs text-slate-400 mt-1 flex gap-2 items-center">
                                    <span className="bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">{modelo.tipo}</span>
                                    <span>&bull;</span>
                                    <span>Usado: {modelo.uso}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 shrink-0">Editar Modelo</Button>
                    </Card>
                ))}
            </div>

            <ActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Modelo"
                fields={[
                { name: "nome", label: "Nome do Template", type: "text", required: true },
                { name: "tipo", label: "Canal", type: "select", options: ["WhatsApp", "E-mail", "Ambos"] },
                { name: "conteudo", label: "Conteúdo da Mensagem", type: "textarea", required: true }
                ]}
            />
        </div>
    );
}

export function ConfigEngajamentoAutomacoes() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Regras de Automação</h1>
                    <p className="text-sm text-slate-400">Gatilhos do sistema baseados em eventos.</p>
                </div>
                <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20"><Plus className="w-4 h-4 mr-2" /> Nova Automação</Button>
            </div>
            
            <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
               <p className="text-slate-400">O construtor central de automações agora possui uma tela dedicada em tela cheia.</p>
               <Button onClick={() => window.location.href='/app/automacoes'} className="mt-4 bg-[#0B1120] border border-white/10 text-white hover:bg-white/5">Abrir Motor de Automação <ExternalLink className="w-4 h-4 ml-2" /></Button>
            </Card>
        </div>
    );
}

export function ConfigBusinessDashboard() {
  const [selectedKPIs, setSelectedKPIs] = useState<{name: string, alertEnabled: boolean, target: number}[]>([
    { name: 'Receita (MRR)', alertEnabled: false, target: 100000 },
    { name: 'Leads Totais', alertEnabled: false, target: 500 },
    { name: 'Conversão', alertEnabled: false, target: 20 },
    { name: 'Win Rate', alertEnabled: false, target: 30 }
  ]);
  const [availableKPIs] = useState(['Receita (MRR)', 'Leads Totais', 'Conversão', 'Win Rate', 'Churn Rate', 'Score IA Médio']);

  const toggleKPI = (kpiName: string) => {
    if (selectedKPIs.find(k => k.name === kpiName)) {
      setSelectedKPIs(prev => prev.filter(p => p.name !== kpiName));
    } else {
      setSelectedKPIs(prev => [...prev, { name: kpiName, alertEnabled: false, target: 0 }]);
    }
  };

  const updateKPI = (name: string, field: 'alertEnabled' | 'target', value: any) => {
    setSelectedKPIs(prev => prev.map(k => k.name === name ? { ...k, [field]: value } : k));
  };

  const moveKPI = (index: number, direction: 'up' | 'down') => {
    const newKPIs = [...selectedKPIs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newKPIs.length) return;
    [newKPIs[index], newKPIs[targetIndex]] = [newKPIs[targetIndex], newKPIs[index]];
    setSelectedKPIs(newKPIs);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Nome,Alerta,Meta"].concat(selectedKPIs.map(kpi => `${kpi.name},${kpi.alertEnabled},${kpi.target}`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_kpis.csv");
    document.body.appendChild(link);
    link.click();
    toast.success("Relatório de KPIs exportado com sucesso!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Negócios</h1>
          <p className="text-sm text-slate-400">Personalize os KPIs e alertas da tela inicial.</p>
        </div>
        <Button onClick={handleExport} className="bg-white/10 hover:bg-white/20 border border-white/10">Exportar Relatório</Button>
      </div>

      <Card className="p-6 bg-[#111827]/80 backdrop-blur-xl border border-white/10">
        <Reorder.Group axis="y" values={selectedKPIs} onReorder={setSelectedKPIs} className="space-y-4">
           {selectedKPIs.map((kpi) => (
             <Reorder.Item key={kpi.name} value={kpi} className="flex items-center justify-between p-4 bg-[#0B1120] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing">
               <div className="flex items-center gap-3">
                 <span className="font-bold text-white">{kpi.name}</span>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={kpi.alertEnabled} onChange={(e) => updateKPI(kpi.name, 'alertEnabled', e.target.checked)} className="rounded border-white/10 bg-white/5" />
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Bell className="w-3 h-3" /> Alerta (Meta: )</span>
                    <input type="number" value={kpi.target} onChange={(e) => updateKPI(kpi.name, 'target', e.target.value)} className="w-20 bg-[#111827] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                  </div>
                  <input 
                    type="checkbox" 
                    checked={true}
                    onChange={() => toggleKPI(kpi.name)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 cursor-pointer" 
                  />
               </div>
             </Reorder.Item>
           ))}
           {availableKPIs.filter(kpi => !selectedKPIs.find(s => s.name === kpi)).map(kpi => (
             <div key={kpi} className="flex items-center justify-between p-4 bg-[#0B1120] border border-white/5 rounded-xl opacity-60">
               <span className="font-bold text-white">{kpi}</span>
               <input 
                 type="checkbox" 
                 checked={false}
                 onChange={() => toggleKPI(kpi)}
                 className="w-4 h-4 rounded border-white/10 bg-white/5 cursor-pointer" 
               />
             </div>
           ))}
        </Reorder.Group>
        <Button onClick={() => toast.success("Configuração de Dashboard salva com sucesso!")} className="mt-6 bg-[#2563EB] hover:bg-blue-600 font-bold px-6">Salvar Dashboards</Button>
      </Card>
    </div>
  )
}

// Integracoes
export function ConfigIntegracoesApps() {
    const [integrations, setIntegrations] = useState([
        { id: 'wa', nome: "WhatsApp Oficial (API)", desc: "Envio de mensagens automatizadas via Evolution API.", status: "Conectado", connected: true, icon: Zap },
        { id: 'resend', nome: "Resend Email", desc: "Mala direta e campanhas.", status: "Conectado", connected: true, icon: Mail },
        { id: 'calendar', nome: "Google Calendar", desc: "Sincronização de reuniões.", status: "Desconectado", connected: false, icon: CalendarIcon },
        { id: 'sheets', nome: "Google Sheets", desc: "Importar de planilhas.", status: "Desconectado", connected: false, icon: FileText },
        { id: 'stripe', nome: "Stripe", desc: "Pagamentos de faturas.", status: "Desconectado", connected: false, icon: DollarSign },
        { id: 'n8n', nome: "N8N", desc: "Automações externas.", status: "Desconectado", connected: false, icon: Zap },
    ]);

    const [instances, setInstances] = useState<any[]>([]);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedInstanceId, setSelectedInstanceId] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContactId, setSelectedContactId] = useState("");
    const [simulationText, setSimulationText] = useState("Olá! Gostaria de falar com o time comercial da Axis CRM.");
    const [savingWebhook, setSavingWebhook] = useState(false);
    const [simulating, setSimulating] = useState(false);

    const { evolutionWebhookUrl, setEvolutionWebhookUrl } = useData();
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
    const [modalWebhookUrl, setModalWebhookUrl] = useState(evolutionWebhookUrl || "");

    // Fetch instances and contacts on mount
    React.useEffect(() => {
        fetchInstances();
        fetchContacts();
    }, []);

    const fetchInstances = () => {
        fetch("/api/whatsapp/instances")
            .then(res => res.json())
            .then(data => {
                setInstances(data);
                if (data.length > 0) {
                    setSelectedInstanceId(data[0].id);
                    setWebhookUrl(data[0].webhookUrl || "");
                    setEvolutionWebhookUrl(data[0].webhookUrl || "");
                }
            })
            .catch(err => console.error("Error fetching instances:", err));
    };

    const fetchContacts = () => {
        fetch("/api/whatsapp/contacts")
            .then(res => res.json())
            .then(data => {
                setContacts(data);
                if (data.length > 0) {
                    setSelectedContactId(data[0].id);
                }
            })
            .catch(err => console.error("Error fetching contacts:", err));
    };

    const handleSaveWebhookFromModal = (url: string) => {
        if (!selectedInstanceId) {
            setEvolutionWebhookUrl(url);
            toast.success("URL de Webhook salva no estado global da aplicação!");
            setIsWebhookModalOpen(false);
            return;
        }
        setSavingWebhook(true);
        fetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ webhookUrl: url })
        })
        .then(res => res.json())
        .then(updated => {
            setEvolutionWebhookUrl(url);
            setWebhookUrl(url);
            toast.success("URL de Webhook salva com sucesso!");
            setSavingWebhook(false);
            setIsWebhookModalOpen(false);
            fetchInstances();
        })
        .catch(err => {
            console.error("Error saving webhook:", err);
            toast.error("Erro ao salvar configuração do Webhook.");
            setSavingWebhook(false);
        });
    };

    const handleSaveWebhook = () => {
        if (!selectedInstanceId) {
            toast.error("Nenhuma instância do WhatsApp encontrada para atualizar.");
            return;
        }
        setSavingWebhook(true);
        fetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ webhookUrl })
        })
        .then(res => res.json())
        .then(updated => {
            toast.success("URL de Webhook da Evolution API salva com sucesso!");
            setSavingWebhook(false);
            fetchInstances();
        })
        .catch(err => {
            console.error("Error saving webhook:", err);
            toast.error("Erro ao salvar configuração do Webhook.");
            setSavingWebhook(false);
        });
    };

    const handleSimulateWebhook = () => {
        if (!selectedContactId || !simulationText.trim()) {
            toast.error("Por favor, selecione um contato e digite uma mensagem.");
            return;
        }

        setSimulating(true);
        fetch("/api/whatsapp/simulate-incoming", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contactId: selectedContactId,
                text: simulationText.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                    loading: "Evolution API empacotando evento 'messages.upsert'...",
                    success: "Webhook notificado! Mensagem entregue ao CRM em tempo real! 📲⚡",
                    error: "Erro no webhook"
                }
            );
            setSimulating(false);
            // reset simulation box
            setSimulationText("Gostaria de mais detalhes sobre o plano Pro!");
        })
        .catch(err => {
            console.error("Simulation error:", err);
            toast.error("Falha ao simular envio do Webhook.");
            setSimulating(false);
        });
    };

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(item => {
            if (item.id === id) {
                const newConnected = !item.connected;
                if (newConnected) {
                    toast.success(`${item.nome} conectado com sucesso!`);
                    return { ...item, connected: true, status: "Conectado" };
                } else {
                    toast.info(`${item.nome} desconectado.`);
                    return { ...item, connected: false, status: "Desconectado" };
                }
            }
            return item;
        }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 p-1 sm:p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Integrações Globais</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Conecte seu CRM com ferramentas essenciais e configure a Evolution API.</p>
                </div>
                <Button 
                    onClick={() => {
                        setModalWebhookUrl(evolutionWebhookUrl || webhookUrl);
                        setIsWebhookModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-xs h-10 hover:scale-[1.02] transition-transform duration-200 cursor-pointer w-full sm:w-auto"
                >
                    <Settings className="w-4 h-4" /> Configurar Webhook
                </Button>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {integrations.map((app, i) => (
                    <Card key={i} className={`p-4 sm:p-5 bg-[#111827]/80 backdrop-blur-xl border transition-all duration-300 ${app.connected ? 'border-[#2563EB]/30' : 'border-white/10'} flex flex-col items-start gap-4`}>
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${app.connected ? 'bg-[#2563EB]/10 border-[#2563EB]/30' : 'bg-white/5 border-white/10'}`}>
                            <app.icon className={`w-6 h-6 ${app.connected ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base sm:text-lg">{app.nome}</h3>
                            <p className="text-xs text-slate-400 mt-1">{app.desc}</p>
                            {app.id === 'wa' && app.connected && (
                                <button
                                    onClick={() => {
                                        setModalWebhookUrl(evolutionWebhookUrl || webhookUrl);
                                        setIsWebhookModalOpen(true);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1.5 mt-2.5 transition-colors cursor-pointer bg-none border-none p-0"
                                >
                                    <Settings className="w-3.5 h-3.5" /> Configurar Webhook
                                </button>
                            )}
                        </div>
                        <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${app.connected ? 'text-emerald-400' : 'text-slate-500'}`}>{app.status}</span>
                            <Button 
                                variant={app.connected ? "outline" : "default"} 
                                size="sm" 
                                onClick={() => handleToggleIntegration(app.id)}
                                className={`h-8 min-w-[80px] text-xs ${app.connected ? 'border-white/10 bg-transparent hover:bg-white/5 text-white' : 'bg-[#2563EB] hover:bg-blue-600'}`}
                            >
                                {app.connected ? 'Desconectar' : 'Conectar'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* WhatsApp Business Configuration Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">Configuração da Evolution API (WhatsApp)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instance Details & Webhook URL Input */}
                    <Card className="p-4 sm:p-6 bg-[#111827]/80 border border-white/10 space-y-6">
                        <div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Instância Ativa</span>
                            {instances.map((inst, idx) => (
                                <div key={inst.id} className="mt-3 space-y-2">
                                    <h3 className="text-lg font-bold text-white">{inst.name}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                                        <div>📞 Linha: <span className="text-slate-200">{inst.phone}</span></div>
                                        <div>🌐 Status: <span className="text-emerald-400 font-bold">{inst.status}</span></div>
                                        <div className="col-span-1 sm:col-span-2 truncate">🔑 Token: <span className="text-slate-350">{inst.apiKey}</span></div>
                                    </div>
                                </div>
                            ))}
                            {instances.length === 0 && (
                                <div className="text-slate-500 text-xs italic mt-2">Nenhuma instância WhatsApp ativa conectada no backend.</div>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <label className="text-[11px] font-bold tracking-widest text-[#2563EB] uppercase block">
                                URL de Callback do Webhook (Evolution API)
                            </label>
                            <p className="text-xs text-slate-400 leading-normal">
                                A Evolution API enviará requisições POST para esta URL sempre que houver novas mensagens recebidas de clientes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://sua-api.com/api/webhooks/whatsapp"
                                    className="flex-1 bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                />
                                <Button
                                    onClick={handleSaveWebhook}
                                    disabled={savingWebhook}
                                    className="bg-blue-600 hover:bg-blue-500 font-bold py-2 px-4 rounded-xl shrink-0 w-full sm:w-auto"
                                >
                                    {savingWebhook ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Real-time Webhook Simulator */}
                    <Card className="p-4 sm:p-6 bg-[#1E293B]/60 backdrop-blur-md border border-white/10 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">Testes em Ambiente de Desenvolvimento</span>
                                <h3 className="text-lg font-bold text-white mt-1.5">Simulador de Eventos Webhook</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                    Simule o recebimento de mensagens enviadas por clientes fictícios no WhatsApp para a Evolution API. Isso notificará o Axis CRM instantaneamente!
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-350 uppercase tracking-wider block font-bold">Cliente Emitindo Mensagem</label>
                                    <select
                                        value={selectedContactId}
                                        onChange={(e) => setSelectedContactId(e.target.value)}
                                        className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                                    >
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.phone || "Sem telefone"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-350 uppercase tracking-wider block font-bold">Mensagem Enviada pelo WhatsApp</label>
                                    <textarea
                                        value={simulationText}
                                        onChange={(e) => setSimulationText(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                        placeholder="Digite a mensagem que o cliente enviará..."
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSimulateWebhook}
                            disabled={simulating || contacts.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl mt-4 w-full flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-normal text-center"
                        >
                            <Zap className="w-4 h-4 fill-white" /> Disparar Webhook (Simular Entrada)
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Modal for Webhook Configuration */}
            {isWebhookModalOpen && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsWebhookModalOpen(false)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">Evolution API</span>
                            <h3 className="text-lg font-bold text-white mt-1">Configurar URL de Webhook</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Digite a URL de callback que receberá notificações em tempo real sempre que mensagens forem disparadas ou recebidas.
                            </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                                URL de Callback (POST)
                            </label>
                            <input
                                type="text"
                                value={modalWebhookUrl}
                                onChange={(e) => setModalWebhookUrl(e.target.value)}
                                placeholder="https://sua-api.com/api/webhooks/whatsapp"
                                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-end gap-3 text-xs">
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setIsWebhookModalOpen(false)}
                                className="bg-transparent border border-white/15 px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="button"
                                onClick={() => handleSaveWebhookFromModal(modalWebhookUrl)}
                                disabled={savingWebhook}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition-all"
                            >
                                {savingWebhook ? "Salvando..." : "Salvar Configuração"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

export function ConfigNotificacoesPreferencias() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem("axis_notification_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map back icons from IDs so they render correctly
        const iconMap: Record<string, any> = {
          novo_lead: Target,
          lead_distribuido: Users,
          tarefa_vencida: ShieldAlert,
          tarefa_proxima: Clock,
          proposta_aberta: Mail,
          venda_fechada: Award
        };
        return parsed.map((p: any) => ({
          ...p,
          icon: iconMap[p.id] || Target
        }));
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: "novo_lead", title: "Novo Lead Cadastrado", category: "Leads", description: "Notificar quando um novo lead entrar no funil via automação ou formulário.", inApp: true, email: true, whatsapp: false, icon: Target },
      { id: "lead_distribuido", title: "Lead Atribuído", category: "Leads", description: "Notificar quando um lead for distribuído ou atribuído à sua carteira.", inApp: true, email: true, whatsapp: true, icon: Users },
      { id: "tarefa_vencida", title: "Tarefa Vencida", category: "Tarefas", description: "Alerta crítico para tarefas que ultrapassaram a data limite sem conclusão.", inApp: true, email: true, whatsapp: true, icon: ShieldAlert },
      { id: "tarefa_proxima", title: "Tarefa Próxima do Vencimento", category: "Tarefas", description: "Aviso de tarefas que vencem nas próximas 2 horas.", inApp: true, email: false, whatsapp: false, icon: Clock },
      { id: "proposta_aberta", title: "Proposta Visualizada", category: "Vendas", description: "Notificar no exato instante em que o cliente abrir o e-mail com a proposta.", inApp: true, email: true, whatsapp: false, icon: Mail },
      { id: "venda_fechada", title: "Venda Concluída (Fechamento)", category: "Vendas", description: "Notificar quando uma oportunidade for marcada como Ganho.", inApp: true, email: true, whatsapp: true, icon: Award },
    ];
  });

  const [generalEmail, setGeneralEmail] = useState(true);
  const [generalWhatsapp, setGeneralWhatsapp] = useState(true);
  const [generalInApp, setGeneralInApp] = useState(true);

  const handleToggle = (id: string, channel: 'inApp' | 'email' | 'whatsapp') => {
    setPrefs((prev: any[]) => prev.map(p => {
      if (p.id === id) {
        return { ...p, [channel]: !p[channel] };
      }
      return p;
    }));
  };

  const handleSave = () => {
    // Avoid serializing react components by stripping them
    const output = prefs.map(({ icon, ...p }: any) => p);
    localStorage.setItem("axis_notification_prefs", JSON.stringify(output));
    toast.success("Preferências de notificações salvas com sucesso!");
  };

  const handleToggleChannelAll = (channel: 'inApp' | 'email' | 'whatsapp', value: boolean) => {
    setPrefs((prev: any[]) => prev.map(p => ({ ...p, [channel]: value })));
    if (channel === 'inApp') setGeneralInApp(value);
    if (channel === 'email') setGeneralEmail(value);
    if (channel === 'whatsapp') setGeneralWhatsapp(value);
    toast.info(`Todas as notificações de ${channel === 'inApp' ? 'Plataforma' : channel === 'email' ? 'E-mail' : 'WhatsApp'} foram ${value ? 'ativadas' : 'desativadas'}.`);
  };

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("axis_whatsapp_sound") !== "false";
  });

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("axis_whatsapp_sound", String(newVal));
    toast.info(`Alerta sonoro de nova mensagem ${newVal ? 'ativado' : 'desativado'}.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-1 sm:p-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Preferências de Notificações</h1>
        <p className="text-xs sm:text-sm text-slate-400">Configure com precisão quais alertas você deseja receber e em quais canais de comunicação comercial.</p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] shrink-0`}>
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider truncate">In-App</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Painel</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('inApp', !generalInApp)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalInApp ? 'bg-[#2563EB]' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalInApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400`}>
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider truncate">E-mails</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Entrada</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('email', !generalEmail)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalEmail ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalEmail ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400`}>
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider truncate">Whats</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Mensagens</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('whatsapp', !generalWhatsapp)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalWhatsapp ? 'bg-cyan-400' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalWhatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400`}>
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider truncate">Sons</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Alertas som</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={toggleSound}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${soundEnabled ? 'bg-purple-500' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>
      </div>

      <Card className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h3 className="text-xs font-black text-[#06B6D4] uppercase tracking-widest font-mono">Disparadores por Categoria</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ajuste individual por canal</span>
        </div>

        <div className="divide-y divide-white/5">
          {Array.from(new Set(prefs.map((p: any) => p.category))).map((category: any) => (
              <div key={category}>
                  <button 
                    className="w-full p-4 flex flex-row items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    onClick={() => setCollapsed(prev => ({...prev, [category]: !prev[category]}))}
                  >
                    <h4 className="font-bold text-sm sm:text-base text-slate-300">{category}</h4>
                    {collapsed[category] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  {!collapsed[category] && (
                    <div className="divide-y divide-white/5">
                        {prefs.filter((p: any) => p.category === category).map((pref: any) => {
                          const IconComponent = pref.icon;
                          return (
                            <div key={pref.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors duration-150">
                              <div className="flex gap-3 sm:gap-4 items-start min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-[#06B6D4]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-[8.5px] font-black uppercase tracking-widest bg-white/5 text-slate-400 px-1.5 py-0.5 rounded leading-none">{pref.category}</span>
                                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{pref.title}</h4>
                                  </div>
                                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 mr-2 sm:mr-4">{pref.description}</p>
                                </div>
                              </div>

                              <div className="flex gap-4 sm:gap-6 md:gap-8 justify-between md:justify-end items-center shrink-0 border-t border-white/5 pt-3 md:pt-0 md:border-none w-full md:w-auto">
                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Painel</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'inApp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.inApp ? 'bg-[#2563EB]' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.inApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">E-mail</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'email')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.email ? 'bg-emerald-500' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.email ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Whats</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'whatsapp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.whatsapp ? 'bg-cyan-400' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.whatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
          ))}
        </div>

        <div className="p-4 sm:p-5 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 w-full">
          <Button 
            type="button"
            onClick={() => {
              setPrefs([
                { id: "novo_lead", title: "Novo Lead Cadastrado", category: "Leads", description: "Notificar quando um novo lead entrar no funil via automação ou formulário.", inApp: true, email: true, whatsapp: false, icon: Target },
                { id: "lead_distribuido", title: "Lead Atribuído", category: "Leads", description: "Notificar quando um lead for distribuído ou atribuído à sua carteira.", inApp: true, email: true, whatsapp: true, icon: Users },
                { id: "tarefa_vencida", title: "Tarefa Vencida", category: "Tarefas", description: "Alerta crítico para tarefas que ultrapassaram a data limite sem conclusão.", inApp: true, email: true, whatsapp: true, icon: ShieldAlert },
                { id: "tarefa_proxima", title: "Tarefa Próxima do Vencimento", category: "Tarefas", description: "Aviso de tarefas que vencem nas próximas 2 horas.", inApp: true, email: false, whatsapp: false, icon: Clock },
                { id: "proposta_aberta", title: "Proposta Visualizada", category: "Vendas", description: "Notificar no exato instante em que o cliente abrir o e-mail com a proposta.", inApp: true, email: true, whatsapp: false, icon: Mail },
                { id: "venda_fechada", title: "Venda Concluída (Fechamento)", category: "Vendas", description: "Notificar quando uma oportunidade for marcada como Ganho.", inApp: true, email: true, whatsapp: true, icon: Award },
              ]);
              setGeneralEmail(true);
              setGeneralInApp(true);
              setGeneralWhatsapp(true);
              toast.success("Configurações originais restauradas!");
            }}
            variant="ghost" 
            className="text-slate-400 hover:text-white text-xs sm:text-sm order-2 sm:order-1 self-center sm:self-auto"
          >
            Restaurar Padrão
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 shadow-lg shadow-blue-500/20 text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Salvar Preferências
          </Button>
        </div>
      </Card>
    </div>
  );
}

// 1. CUSTOM FIELDS - LEADS (Settings module)

export function ConfigCRMSLA() {
  // Load existing or default rules
  const [activePriority, setActivePriority] = useState<"Alta" | "Média" | "Baixa">("Alta");
  
  const [slaRules, setSlaRules] = useState(() => {
    const cached = localStorage.getItem("crm_sla_rules");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to default
      }
    }
    return [
      { priority: "Alta", limitHours: 24, warningHours: 4, active: true, color: "#EF4444", alertStyle: "border-pulse-shake", icon: "Flame" },
      { priority: "Média", limitHours: 48, warningHours: 8, active: true, color: "#F59E0B", alertStyle: "shadow-glow", icon: "Clock" },
      { priority: "Baixa", limitHours: 72, warningHours: 12, active: false, color: "#3B82F6", alertStyle: "border-solid-color", icon: "Bell" }
    ];
  });

  const [seniorSlaRules, setSeniorSlaRules] = useState([
    { profile: "Vendedor Sênior", priority: "Alta", responseMins: 30, warningMins: 10, active: true }
  ]);

  const [sdrSlaRules, setSdrSlaRules] = useState([
    { stage: "Novo Lead (SDR)", maxWaitMins: 10, warningMins: 5, active: true }
  ]);

  const currentRule = slaRules.find(r => r.priority === activePriority) || slaRules[0];

  const updateCurrentRule = (updatedFields: Partial<typeof currentRule>) => {
    setSlaRules(prev => prev.map(r => r.priority === activePriority ? { ...r, ...updatedFields } : r));
  };

  const handleSaveSla = () => {
    localStorage.setItem("crm_sla_rules", JSON.stringify(slaRules));
    toast.success("Regras de tempo limite (SLA) e Alertas Customizados sincronizados!");
  };

  // Helper to render icon for the preview
  const renderSelectedIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame": return <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
      case "Bell": return <Bell className="w-3.5 h-3.5 text-blue-400" />;
      case "ShieldAlert": return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case "Clock":
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Helper to resolve CSS classes for mockup card based on alert settings
  const getMockupAlertClass = (color: string, style: string) => {
    let classes = "";
    if (style === "border-pulse-shake") {
      classes = "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-[pulse_2s_infinite] bg-red-500/[0.02]";
    } else if (style === "shadow-glow") {
      classes = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-[pulse_3s_infinite] bg-amber-500/[0.02]";
    } else if (style === "pink-neon") {
      classes = "border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse bg-pink-500/[0.01]";
    } else if (style === "border-solid-color") {
      classes = "border-blue-500 bg-blue-500/[0.01]";
    } else {
      classes = "border-white/5";
    }
    return classes;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 p-1 sm:p-2 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Configuração de SLA & Alertas <Clock className="text-blue-500 w-5 h-5" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Garanta conversões rápidas cobrando sua equipe de vendas caso o tempo de primeiro contato estoure.</p>
        </div>
        <Button onClick={handleSaveSla} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 py-2 text-xs uppercase tracking-wider rounded-lg shadow-xl shrink-0 w-full sm:w-auto">
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left editor: form controls */}
        <Card className="lg:col-span-3 p-4 sm:p-6 bg-[#111827]/80 border border-white/10 flex flex-col justify-between rounded-2xl relative overflow-hidden">
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-4 space-y-3">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest font-mono">Definir por Complexidade</h3>
              
              {/* Tabs for Priority Selection */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#0B1120] rounded-xl border border-white/5 w-full sm:w-fit">
                {(["Alta", "Média", "Baixa"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActivePriority(p)}
                    className={`flex-1 sm:flex-initial text-center px-2 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all uppercase tracking-normal cursor-pointer ${
                      activePriority === p 
                        ? p === "Alta" ? "bg-rose-500 text-white" : p === "Média" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Form Elements for Selected Priority */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0B1120] p-3 rounded-xl border border-white/5 gap-3">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs text-white font-bold block">Meta de SLA Ativa</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">Monitorar tempo limite para leads de prioridade {activePriority}.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={currentRule.active}
                  onChange={(e) => updateCurrentRule({ active: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded border-white/10 bg-[#0B1120] focus:ring-0 cursor-pointer shrink-0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 bg-[#0B1120]/40 p-3 sm:p-4 border border-white/5 rounded-xl">
                  <label className="text-[10px] text-slate-500 uppercase font-black block">Espera Máxima (SLA)</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="number" 
                      value={currentRule.limitHours} 
                      onChange={(e) => updateCurrentRule({ limitHours: parseInt(e.target.value) || 0 })}
                      className="bg-[#0B1120] border border-white/10 rounded-lg p-2 text-sm text-white w-20 sm:w-24 font-mono font-bold text-center" 
                      min="1"
                    />
                    <span className="text-xs text-slate-400 font-semibold">horas</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Tempo parado sem atendimento para o lead esfriar.</span>
                </div>

                <div className="space-y-1.5 bg-[#0B1120]/40 p-3 sm:p-4 border border-white/5 rounded-xl">
                  <label className="text-[10px] text-slate-500 uppercase font-black block">Pré-alerta Visual</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="number" 
                      value={currentRule.warningHours} 
                      onChange={(e) => updateCurrentRule({ warningHours: parseInt(e.target.value) || 0 })}
                      className="bg-[#0B1120] border border-white/10 rounded-lg p-2 text-sm text-white w-20 sm:w-24 font-mono font-bold text-center" 
                      min="1"
                    />
                    <span className="text-xs text-slate-400 font-semibold">horas antes</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">Disparar micro-alerta antes do estouro total.</span>
                </div>
              </div>

              {/* Customizing Alerts UI */}
              <div className="space-y-3 bg-[#0B1120]/20 p-3 sm:p-4 border border-white/5 rounded-xl">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" /> Customização de Alerta Visual
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Select alertStyle */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Efeito de Destaque</label>
                    <select 
                      value={currentRule.alertStyle}
                      onChange={(e) => updateCurrentRule({ alertStyle: e.target.value })}
                      className="bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                    >
                      <option value="border-pulse-shake">Pulsar Vermelho (Alta)</option>
                      <option value="shadow-glow">Glow Dourado (Média)</option>
                      <option value="pink-neon">Neon Rosa Glow</option>
                      <option value="border-solid-color">Borda Sólida Sutil</option>
                    </select>
                  </div>

                  {/* Select alertColor */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Tema Cromático</label>
                    <select 
                      value={currentRule.color}
                      onChange={(e) => updateCurrentRule({ color: e.target.value })}
                      className="bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                    >
                      <option value="#EF4444">Tom Vermelho</option>
                      <option value="#F59E0B">Tom Âmbar</option>
                      <option value="#3B82F6">Tom Azul</option>
                      <option value="#EC4899">Tom Rosa</option>
                      <option value="#10B981">Tom Esmeralda</option>
                    </select>
                  </div>

                  {/* Select alertIcon */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Ícone do Alerta</label>
                    <select 
                      value={currentRule.icon}
                      onChange={(e) => updateCurrentRule({ icon: e.target.value })}
                      className="bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                    >
                      <option value="Clock">Relógio (SLA)</option>
                      <option value="Flame">Fogo (Esfriando)</option>
                      <option value="ShieldAlert">Escudo (Perigo)</option>
                      <option value="Bell">Sino (Aviso)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <span>Última sincronização local: Hoje</span>
            <Button onClick={handleSaveSla} variant="outline" className="border-white/10 text-xs py-1 h-8 bg-[#0B1120] text-slate-200 w-full sm:w-auto">
              Aplicar Regra
            </Button>
          </div>
        </Card>

        {/* Right mockup card preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-4 sm:p-6 bg-[#111827]/80 border border-white/10 flex flex-col justify-between rounded-2xl relative overflow-hidden h-full">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">Visualizador de Card</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Mockup real de como este lead aparecerá no funil de negociações quando o SLA estourar:</p>
            </div>

            {/* Actual simulated card */}
            <div className="my-6">
              <div className={`p-4 bg-[#111827]/90 border backdrop-blur-xl rounded-xl transition-all ${getMockupAlertClass(currentRule.color, currentRule.alertStyle)}`}>
                <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded-md border uppercase bg-rose-500/10 text-rose-400 border-rose-500/20`}>
                    {activePriority} Prioridade
                    {activePriority === "Alta" && <Flame className="w-3 h-3 text-rose-400 animate-pulse" />}
                  </span>

                  {currentRule.active ? (
                    <span className="flex items-center gap-1 text-[8.5px] font-bold px-2 py-0.5 rounded-md border uppercase text-white animate-pulse" style={{ backgroundColor: `${currentRule.color}15`, borderColor: `${currentRule.color}35`, color: currentRule.color }}>
                      {renderSelectedIcon(currentRule.icon)} Esfriando ({currentRule.limitHours}h)
                    </span>
                  ) : (
                    <span className="text-[8.5px] text-slate-500 font-bold uppercase">SLA Desativado</span>
                  )}
                </div>

                <div className="space-y-2 col-span-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">Almeida Logistics</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                     <span className="bg-[#0B1120] px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/5 truncate max-w-[120px]">
                       Lucas Almeida
                     </span>
                     <span>•</span>
                     <span className="font-mono text-[10px] text-slate-500">R$ 45.000</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                  <span className="font-sans flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Atendimento Pendente
                  </span>
                  <span>Parado: {currentRule.limitHours + 3}h</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1120] p-3 border border-white/5 rounded-xl space-y-1 text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Efeito de Atenção Ativo</span>
              <span className="text-xs font-mono font-black text-amber-400 uppercase">
                {currentRule.active ? currentRule.alertStyle : "Nenhum Alerta Ativo"}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Senior and SDR SLAs (Retained and polished to keep other rules active) */}
      <h3 className="text-lg font-bold text-white mt-8 border-b border-white/5 pb-2">Regras de Exceção CRM</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-5 bg-[#111827]/60 border border-white/10 rounded-2xl">
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest font-mono mb-3">Vendedor Sênior</h4>
          {seniorSlaRules.map((rule, idx) => (
            <div key={`senior-${idx}`} className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">{rule.profile}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">ATIVA</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500">Meta de Resposta</span>
                  <input type="number" readOnly value={rule.responseMins} className="bg-[#0B1120] border border-white/5 rounded p-1 text-xs text-white w-full text-center" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500">Pre-alerta</span>
                  <input type="number" readOnly value={rule.warningMins} className="bg-[#0B1120] border border-white/5 rounded p-1 text-xs text-white w-full text-center" />
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-4 sm:p-5 bg-[#111827]/60 border border-white/10 rounded-2xl">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest font-mono mb-3">Espera Máxima no Funil SDR</h4>
          {sdrSlaRules.map((rule, idx) => (
            <div key={`sdr-${idx}`} className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">{rule.stage}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">ATIVA</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500">Espera Máxima</span>
                  <input type="number" readOnly value={rule.maxWaitMins} className="bg-[#0B1120] border border-white/5 rounded p-1 text-xs text-white w-full text-center" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500">Pre-alerta</span>
                  <input type="number" readOnly value={rule.warningMins} className="bg-[#0B1120] border border-white/5 rounded p-1 text-xs text-white w-full text-center" />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function ConfigCRMGatilhosIA() {
  const { leadScoreTriggers, setLeadScoreTriggers } = useData();

  const [newTrigger, setNewTrigger] = useState({ name: "", scoreThreshold: 80, condition: "greater", actionStageId: "s5" });

  const sdrStagesMap: Record<string, string> = {
    's1': "Novo Lead",
    's2': "IA Analisando",
    's3': "Contato Iniciado",
    's4': "Em Nutrição",
    's5': "Qualificado",
    's6': "Reunião Agendada",
    's7': "Perdido"
  };

  const handleSaveTriggers = () => {
    toast.success("Gatilhos de Lead Score IA sincronizados com o motor da Master AI! 🤖✨");
  };

  const handleDelete = (id: string) => {
    setLeadScoreTriggers(leadScoreTriggers.filter(t => t.id !== id));
    toast.success("Gatilho removido com sucesso!");
  };

  const handleCreate = () => {
    if (!newTrigger.name.trim()) {
      toast.error("Por favor, digite um nome para o gatilho.");
      return;
    }
    setLeadScoreTriggers([
      ...leadScoreTriggers, 
      { 
        id: Date.now().toString(), 
        scoreThreshold: Number(newTrigger.scoreThreshold), 
        condition: newTrigger.condition as 'greater' | 'less', 
        targetStageId: newTrigger.actionStageId, 
      }
    ]);
    setNewTrigger({ name: "", scoreThreshold: 80, condition: "greater", actionStageId: "s5" });
    toast.success("Novo gatilho automático de Lead Score registrado!");
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-350">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Gatilhos de Lead Score IA <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />
        </h1>
        <p className="text-sm text-slate-400">
          Configure regras automatizadas baseadas no Lead Score calculado pelo motor da Master AI para mover os leads imediatamente para etapas do funil SDR.
        </p>
      </div>

      {/* Rules list */}
      <Card className="bg-[#111827]/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
          <h3 className="text-xs font-black text-[#2563EB] uppercase tracking-widest font-mono">Gatilhos Ativos no SDR</h3>
          <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15 px-2.5 py-0.5 rounded-full font-bold">
            Master AI Engine Operacional
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {leadScoreTriggers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm italic">
              Nenhuma regra de automação de lead score cadastrada. Crie uma abaixo.
            </div>
          ) : (
            leadScoreTriggers.map((trigger) => (
              <div key={trigger.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Regra de Gatilho</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    Se <span className="font-mono text-yellow-400 bg-yellow-400/5 px-1 rounded border border-yellow-400/10">Lead Score</span> for <strong>{trigger.condition === 'greater' ? 'Maior ou Igual a' : 'Menor ou Igual a'}</strong> <strong className="text-white font-mono">{trigger.scoreThreshold}</strong>, 
                    mover de forma autônoma para a coluna <strong className="text-blue-400">{sdrStagesMap[trigger.targetStageId] || trigger.targetStageId}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button 
                    onClick={() => handleDelete(trigger.id)}
                    className="p-1 px-2.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 text-rose-400 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add trigger form */}
      <Card className="bg-[#111827]/80 border border-white/10 p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">Criar Novo Gatilho do Lead Score</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nome do Gatilho</label>
            <input 
              type="text" 
              placeholder="Ex: Leads Altamente Qualificados para Comercial" 
              value={newTrigger.name}
              onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Condição de Disparo (Condição Lógica)</label>
            <select 
              value={newTrigger.condition}
              onChange={(e) => setNewTrigger({ ...newTrigger, condition: e.target.value as any })}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="greater">Maior ou Igual a</option>
              <option value="less">Menor ou Igual a</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score Alvo (0-100)</label>
            <input 
              type="number" 
              min="0"
              max="100"
              value={newTrigger.scoreThreshold}
              onChange={(e) => setNewTrigger({ ...newTrigger, scoreThreshold: Number(e.target.value) })}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mover Automático para Coluna SDR</label>
            <select 
              value={newTrigger.actionStageId}
              onChange={(e) => setNewTrigger({ ...newTrigger, actionStageId: e.target.value })}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {Object.entries(sdrStagesMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleCreate} className="gap-1 bg-[#2563EB] hover:bg-blue-600 font-medium text-xs">
            <Plus className="w-3.5 h-3.5" /> Adicionar Regra Automática
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={handleSaveTriggers} className="bg-[#2563EB] hover:bg-blue-600 font-bold px-6 text-xs uppercase shadow-xl shadow-blue-500/10">
          Sincronizar Gatilhos IA
        </Button>
      </div>
    </div>
  );
}

// 3. SMTP SERVER SETUP (Settings module)
export function ConfigIntegracoesSMTP() {
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("vendas@seu-workspace-workspace.com");

  const testConnection = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Verificando credenciais de criptografia TLS...",
        success: "Conexão SMTP efetuada! E-mail de homologação disparado com sucesso! ✉️",
        error: "Falha na resposta do servidor de destino"
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Servidores SMTP (Campanhas de E-mail)</h1>
        <p className="text-sm text-slate-400">Configure seu próprio disparador de e-mails comercial corporativo (AWS SES, G-Suite, Sendgrid, etc).</p>
      </div>

      <Card className="p-6 bg-[#111827]/80 border border-white/10 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-[#06B6D4]">Credenciais de Transmissão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Servidor Host</label>
            <input type="text" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Porta de Conexão</label>
            <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Criptografia Protocolo</label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>StartTLS (Recomendado)</option>
              <option>SSL puro</option>
              <option>Nenhuma (Não seguro)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-black">Usuário Log (E-mail Autenticado)</label>
            <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Senha de Aplicativo (Secret Token)</label>
            <input type="password" placeholder="••••••••••••••••••••" className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={testConnection} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Testar Conexão TLS
          </Button>
          <Button type="button" onClick={() => toast.success("Preferências de SMTP salvas!")} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Salvar Canal SMTP
          </Button>
        </div>
      </Card>
    </div>
  );
}


// 5. BACKUPS AUTOMATICOS (Settings module)
export function ConfigSistemaBackups() {
  const [scheduleTime, setScheduleTime] = useState("02:00 Semanal");
  const [lastBackupDate, setLastBackupDate] = useState("Ontem, 02:00");

  const runImmediateBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Compactando tabelas do banco de dados e preparando instantâneo...",
        success: "Snapshot criptografado salvo no servidor S3 AWS! Volume gerado com sucesso! 🗄️",
        error: "Falha na criação do snapshot"
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Políticas de Backups de Segurança</h1>
        <p className="text-sm text-slate-400">Garanta a integridade operacional de sua empresa programando instantâneos na Cloud AWS securizados.</p>
      </div>

      <Card className="p-6 bg-[#111827]/80 border border-white/10 space-y-5">
        <h3 className="font-bold text-xs uppercase tracking-widest text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>Schedule AWS S3 Storage</span>
          <span className="text-[10px] text-slate-500">Incremental Snapshot</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Frequência Programada</label>
            <select value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>Diariamente às 02:00h</option>
              <option>Semanalmente (Aos domingos)</option>
              <option>Mensal (Primeiro dia do mês)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Destinatário Storage Cloud</label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>AWS S3 Bucket (Criptografado AES-256)</option>
              <option>Google Cloud Storage (GCS)</option>
              <option>SFTP Server Interno</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-white/5 p-4 rounded-xl text-xs space-y-1">
          <div className="text-slate-400 flex justify-between">
            <span>Último Snap gerado:</span>
            <strong className="text-white">{lastBackupDate}</strong>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>Tamanho do Arquivo:</span>
            <strong className="text-white">12.8 MB (.tar.gz)</strong>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>Criptografia Assinatura:</span>
            <strong className="text-[#06B6D4]">SHA-512 Ativa</strong>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={runImmediateBackup} className="bg-emerald-600/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/25 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Criar Instantâneo Agora
          </Button>
          <Button type="button" onClick={() => toast.success("Configuração de backup salva!")} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Sincronizar Cronologia
          </Button>
        </div>
      </Card>
    </div>
  );
}

// 6. WEHOOKS CONFIGURATION PARA SDR PIPELINE
export function ConfigIntegracoesSDR() {
  const [webhookUrl, setWebhookUrl] = useState("https://n8n.seumodelo.com/webhook/sdr-reuniao");
  const [webhookActive, setWebhookActive] = useState(true);

  const testWebhook = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Enviando payload de teste...',
        success: 'Webhook disparado e resposta 200 OK recebida!',
        error: 'Erro no disparo do Webhook.',
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Integrações SDR <Zap className="w-5 h-5 text-purple-500"/></h1>
        <p className="text-sm text-slate-400 mt-1">Configure disparos de webhooks quando eventos importantes acontecerem no funil de Pré-Vendas.</p>
      </div>

      <Card className="bg-[#111827]/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-purple-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Reunião Agendada (Qualificação Final)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado sempre que um lead atinge a etapa de Reunião Agendada no pipeline do SDR.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={webhookActive} onChange={() => setWebhookActive(!webhookActive)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${webhookActive ? 'bg-purple-600' : 'bg-slate-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${webhookActive ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input 
              type="text" 
              value={webhookUrl} 
              onChange={(e) => setWebhookUrl(e.target.value)} 
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none" 
              placeholder="https://"
            />
          </div>
          
          <div className="bg-[#0B1120]/50 p-4 rounded-lg border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-purple-300 font-mono overflow-auto opacity-80">
{`{
  "event": "sdr.reuniao_agendada",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "company": "TechCorp Brasil",
    "scoreIA": 92,
    "temperature": "quente",
    "seller_sdr": "Roberto Ramos",
    "ia_summary": "Empresa demonstrou forte interesse..."
  },
  "timestamp": "2026-05-21T15:30:00Z"
}`}
            </pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
             <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={() => toast.success("Configuração salva com sucesso")}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>

      <Card className="bg-[#111827]/80 border border-white/10 overflow-hidden shadow-xl mt-6">
        <div className="p-5 border-b border-white/5 bg-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Lead Qualificado (Aprovado pela Master AI)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado quando o Lead Score atinge métricas pré-definidas na qualificação.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked={true} />
                <div className={`block w-10 h-6 rounded-full transition-colors bg-emerald-600`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform translate-x-4`}></div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input 
              type="text" 
              defaultValue="https://n8n.seumodelo.com/webhook/sdr-qualificado"
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none" 
              placeholder="https://"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Eventos de Disparo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" defaultChecked className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Atualização de Score IA
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" defaultChecked className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Mapeamento de Perfil Concluído
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Contato Iniciado (1º Touchpoint)
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" defaultChecked className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Identificação de Ticket Médio
               </label>
            </div>
          </div>
          
          <div className="bg-[#0B1120]/50 p-4 rounded-lg border border-white/5 space-y-2 mt-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-emerald-300 font-mono overflow-auto opacity-80">
{`{
  "event": "sdr.lead_qualificado",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "scoreIA": 92,
    "events": ["score_updated", "profile_mapped"]
  },
  "timestamp": "2026-05-21T15:35:00Z"
}`}
            </pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
             <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={() => toast.success("Configuração salva com sucesso")}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ConfigFinanceiroSquads() {
  const { squads, updateSquad, leads } = useData();

  const handleUpdateBudget = (id: string, budget: string) => {
    updateSquad(id, { orcamentoMensal: parseFloat(budget) || 0 });
    toast.success("Orçamento do squad atualizado!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Gestão Financeira de Times & CAC <Briefcase className="w-5 h-5 text-blue-500"/></h1>
        <p className="text-sm text-slate-400 mt-1">Configure o orçamento mensal de cada squad para cálculo automático de Custo de Aquisição de Clientes (CAC) em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {squads.map(sq => {
          const squadLeadsCount = leads.filter(l => sq.membros.some(m => l.seller && m.includes(l.seller))).length || 1;
          const cac = sq.orcamentoMensal / squadLeadsCount;

          return (
            <Card key={sq.id} className="bg-[#111827]/80 border border-white/10 p-5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 w-full md:w-1/3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{sq.nome}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{sq.membros.length} Integrantes</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full md:w-2/3 justify-end items-center">
                <div className="w-full sm:w-48 space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Orçamento Mensal (Spend)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">R$</span>
                    <input 
                      type="number"
                      defaultValue={sq.orcamentoMensal}
                      onBlur={(e) => handleUpdateBudget(sq.id, e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/10 p-2 px-4 rounded-xl text-center min-w-[120px]">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">CAC Sugerido</span>
                  <span className="text-sm font-bold text-white italic">R$ {cac.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3">
        <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-white block mb-0.5 uppercase tracking-wide">Como funciona o CAC por Squad?</strong>
          O sistema cruza o orçamento mensal alocado acima com os leads ganhos/gerados atribuídos aos membros do squad. 
          O cálculo é: <code className="text-yellow-400 font-mono">Orcamento / Total_Leads_no_Periodo</code>. 
          Manter orçamentos precisos permite que a IA identifique qual squad tem a melhor eficiência financeira na prospecção.
        </p>
      </div>
    </div>
  );
}
