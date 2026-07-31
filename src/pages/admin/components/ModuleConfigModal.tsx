import React from "react";
import { Cpu, X, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface ModuleConfigModalProps {
  selectedTenant: string;
  setSelectedTenant: (tenant: string | null) => void;
  crmEnabled: boolean;
  setCrmEnabled: (enabled: boolean) => void;
  sdrEnabled: boolean;
  setSdrEnabled: (enabled: boolean) => void;
  advDashboardEnabled: boolean;
  setAdvDashboardEnabled: (enabled: boolean) => void;
  handleSaveModules: () => void;
}

export function ModuleConfigModal({
  selectedTenant,
  setSelectedTenant,
  crmEnabled,
  setCrmEnabled,
  sdrEnabled,
  setSdrEnabled,
  advDashboardEnabled,
  setAdvDashboardEnabled,
  handleSaveModules
}: ModuleConfigModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setSelectedTenant(null)}></div>

        {/* Modal Content */}
        <div className="relative bg-[var(--color-surface-elevated)] border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            {/* Gradient glow top */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4 relative z-10">
                <div>
                    <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">
                        <Cpu className="w-3.5 h-3.5" /> G-Tech Controle Modular
                    </div>
                    <h3 className="text-lg font-black text-white">Editar Recursos de {selectedTenant}</h3>
                </div>
                <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Apenas administradores da G-Tech podem conceder ou revogar o acesso a módulos inteligentes e integrados do Axis CRM para este tenant.
            </p>

            <div className="space-y-4 mb-8">
                {/* CRM Module Card */}
                <div className={`p-4 rounded-xl border transition-all flex items-start gap-3 select-none cursor-pointer ${
                    crmEnabled 
                        ? 'bg-blue-600/10 border-blue-500/40 text-white' 
                        : 'bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]'
                }`} onClick={() => setCrmEnabled(!crmEnabled)}>
                    <div className="mt-0.5">
                        {crmEnabled ? (
                            <div className="w-[18px] h-[18px] rounded bg-blue-500 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="w-[18px] h-[18px] rounded border border-white/20" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-200">Módulo CRM Padrão</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Habilita leads, pipeline de vendas comercial básico e gestão de contatos das empresas.</p>
                    </div>
                </div>

                {/* SDR Module Card */}
                <div className={`p-4 rounded-xl border transition-all flex items-start gap-3 select-none cursor-pointer ${
                    sdrEnabled 
                        ? 'bg-pink-600/10 border-pink-500/40 text-white font-bold' 
                        : 'bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]'
                }`} onClick={() => setSdrEnabled(!sdrEnabled)}>
                    <div className="mt-0.5">
                        {sdrEnabled ? (
                            <div className="w-[18px] h-[18px] rounded bg-pink-500 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="w-[18px] h-[18px] rounded border border-white/20" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-200">Módulo SDR Inteligente</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Ativa funil SDR nativo, triagem por Inteligência Artificial G-Tech, métricas integradas e transferência automática para closer.</p>
                    </div>
                </div>

                {/* Advanced Dashboard Module Card */}
                <div className={`p-4 rounded-xl border transition-all flex items-start gap-3 select-none cursor-pointer ${
                    advDashboardEnabled 
                        ? 'bg-emerald-600/10 border-emerald-500/40 text-white font-bold' 
                        : 'bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03]'
                }`} onClick={() => setAdvDashboardEnabled(!advDashboardEnabled)}>
                    <div className="mt-0.5">
                        {advDashboardEnabled ? (
                            <div className="w-[18px] h-[18px] rounded bg-emerald-500 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="w-[18px] h-[18px] rounded border border-white/20" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-200">Módulo BI Avançado</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Ativa análises preditivas, score/threshold de risco de churn, simulações de suporte/tíquetes e micro-dashboard financeiro completo.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white text-xs px-4" onClick={() => setSelectedTenant(null)}>
                    Cancelar
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-6 font-bold shadow-lg shadow-cyan-500/15" onClick={handleSaveModules}>
                    Salvar Habilitação
                </Button>
            </div>
        </div>
    </div>
  );
}
