import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Clock, Flame, Bell, ShieldAlert, Palette } from "lucide-react";
import { toast } from "sonner";

export function ConfigCRMSLA() {
  // Load existing or default rules
  const [activePriority, setActivePriority] = useState<"Alta" | "Média" | "Baixa">("Alta");
  
  const [slaRules, setSlaRules] = useState(() => {
    const cached = localStorage.getItem("crm_sla_rules_v2");
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

  const [seniorSlaRules] = useState([
    { profile: "Vendedor Sênior", priority: "Alta", responseMins: 30, warningMins: 10, active: true }
  ]);

  const [sdrSlaRules] = useState([
    { stage: "Novo Lead (SDR)", maxWaitMins: 10, warningMins: 5, active: true }
  ]);

  const currentRule = slaRules.find(r => r.priority === activePriority) || slaRules[0];

  const updateCurrentRule = (updatedFields: Partial<typeof currentRule>) => {
    setSlaRules(prev => prev.map(r => r.priority === activePriority ? { ...r, ...updatedFields } : r));
  };

  const handleSaveSla = () => {
    localStorage.setItem("crm_sla_rules_v2", JSON.stringify(slaRules));
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

  // Helper to resolve CSS classes for preview card based on alert settings
  const getPreviewAlertClass = (color: string, style: string) => {
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
              <p className="text-xs text-slate-400 leading-relaxed">Pré-visualização de como este lead aparecerá no funil de negociações quando o SLA estourar:</p>
            </div>

            {/* Actual simulated card */}
            <div className="my-6">
              <div className={`p-4 bg-[#111827]/90 border backdrop-blur-xl rounded-xl transition-all ${getPreviewAlertClass(currentRule.color, currentRule.alertStyle)}`}>
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
                  <h4 className="font-bold text-white text-sm truncate">Empresa Exemplo LTDA</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                     <span className="bg-[#0B1120] px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/5 truncate max-w-[120px]">
                       Nome do Vendedor
                     </span>
                     <span>•</span>
                     <span className="font-mono text-[10px] text-slate-500">R$ 0,00</span>
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
