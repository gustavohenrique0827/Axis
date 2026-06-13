import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ToggleLeft, ToggleRight, Lock, Unlock, ChevronDown, Info, RefreshCw, Users,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";

interface CloserConfig {
  name: string;
  email: string;
  active: boolean;
  leadTypes: string[];
  blocked: boolean;
}

interface GlobalConfig {
  distributionMode: string;
  blockOnMultipleClients: boolean;
  multiClientThreshold: number;
}

const STORAGE_KEY = "axis_rotation_config";
const LEAD_TYPES_DEFAULT = ["Instagram", "WhatsApp", "Indicação", "Site", "Google Ads", "Cold Call", "LinkedIn", "Orgânico"];
const DISTRIBUTION_MODES = [
  { value: "round-robin", label: "Round-Robin",  desc: "Cada lead vai para o próximo closer na fila" },
  { value: "priority",    label: "Prioridade",   desc: "Leads vão para o closer com menos atendimentos ativos" },
  { value: "manual",      label: "Manual",       desc: "Admin distribui manualmente cada lead" },
];

function loadLocalConfig(): { closers: CloserConfig[]; global: GlobalConfig } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { closers: [], global: { distributionMode: "round-robin", blockOnMultipleClients: false, multiClientThreshold: 2 } };
}

function saveLocalConfig(config: { closers: CloserConfig[]; global: GlobalConfig }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function TabClosersCRM() {
  const [closers, setClosers] = useState<CloserConfig[]>([]);
  const [global, setGlobal] = useState<GlobalConfig>({ distributionMode: "round-robin", blockOnMultipleClients: false, multiClientThreshold: 2 });
  const [loading, setLoading] = useState(true);
  const [expandedCloser, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const saved = loadLocalConfig();
      setGlobal(saved.global);
      let dbClosers: Array<{ name: string; email: string }> = [];
      if (supabase) {
        const { data } = await supabase.from("colaboradores").select("nome, email, cargo").ilike("cargo", "%closer%").eq("status", "Ativo");
        if (data?.length) dbClosers = data.map((d: any) => ({ name: d.nome, email: d.email || "" }));
      }
      const merged: CloserConfig[] = dbClosers.map(db => {
        const existing = saved.closers.find(c => c.name === db.name);
        return existing ?? { name: db.name, email: db.email, active: true, leadTypes: LEAD_TYPES_DEFAULT, blocked: false };
      });
      setClosers(merged.length > 0 ? merged : saved.closers);
      setLoading(false);
    }
    init();
  }, []);

  function persist(updatedClosers: CloserConfig[], updatedGlobal = global) {
    saveLocalConfig({ closers: updatedClosers, global: updatedGlobal });
  }

  function toggleActive(name: string) {
    const updated = closers.map(c => c.name === name ? { ...c, active: !c.active } : c);
    setClosers(updated); persist(updated); toast.success("Configuração salva.");
  }

  function toggleBlocked(name: string) {
    const updated = closers.map(c => c.name === name ? { ...c, blocked: !c.blocked } : c);
    setClosers(updated); persist(updated);
  }

  function toggleLeadType(name: string, type: string) {
    const updated = closers.map(c => {
      if (c.name !== name) return c;
      const has = c.leadTypes.includes(type);
      return { ...c, leadTypes: has ? c.leadTypes.filter(t => t !== type) : [...c.leadTypes, type] };
    });
    setClosers(updated); persist(updated);
  }

  function updateGlobal(patch: Partial<GlobalConfig>) {
    const updated = { ...global, ...patch };
    setGlobal(updated); persist(closers, updated); toast.success("Configuração global salva.");
  }

  const activeCount = closers.filter(c => c.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
          {activeCount} closer{activeCount !== 1 ? "s" : ""} ativo{activeCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-5 border-b border-white/5">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5"><Info className="w-3.5 h-3.5 text-slate-500" /></div>
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Configuração Global</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Regras que se aplicam a todos os closers na rotação.</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Modo de Distribuição</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {DISTRIBUTION_MODES.map(mode => (
                <button key={mode.value} onClick={() => updateGlobal({ distributionMode: mode.value })}
                  className={`p-4 rounded-xl border text-left transition-all ${global.distributionMode === mode.value ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"}`}>
                  <p className={`text-[11px] font-black uppercase tracking-wide ${global.distributionMode === mode.value ? "text-blue-300" : "text-white"}`}>{mode.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${global.blockOnMultipleClients ? "bg-rose-500/10" : "bg-white/5"}`}>
                {global.blockOnMultipleClients ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-wide">Bloquear closer com múltiplos clientes</p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium max-w-sm">Closers atendendo {global.multiClientThreshold}+ clientes ficam fora da rotação até liberar uma vaga.</p>
              </div>
            </div>
            <button onClick={() => updateGlobal({ blockOnMultipleClients: !global.blockOnMultipleClients })} className="shrink-0 mt-1">
              {global.blockOnMultipleClients ? <ToggleRight className="w-8 h-8 text-rose-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>
          {global.blockOnMultipleClients && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Bloquear a partir de</label>
              <div className="flex items-center gap-2">
                <button onClick={() => global.multiClientThreshold > 1 && updateGlobal({ multiClientThreshold: global.multiClientThreshold - 1 })} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-black flex items-center justify-center hover:bg-white/10">-</button>
                <span className="text-base font-black text-white w-6 text-center">{global.multiClientThreshold}</span>
                <button onClick={() => updateGlobal({ multiClientThreshold: global.multiClientThreshold + 1 })} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-black flex items-center justify-center hover:bg-white/10">+</button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">clientes simultâneos</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-5 border-b border-white/5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-0.5"><Users className="w-3.5 h-3.5 text-blue-400" /></div>
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Closers na Rotação</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Closers com cargo "Closer" no módulo Equipe.</p>
          </div>
        </div>
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3 opacity-40">
            <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
            <p className="text-xs font-black text-slate-500 uppercase">Carregando...</p>
          </div>
        ) : closers.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 opacity-40">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Nenhum closer ativo</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {closers.map(closer => {
              const isExpanded = expandedCloser === closer.name;
              const initials = closer.name.split(" ").map(n => n[0]).join("").substring(0, 2);
              return (
                <div key={closer.name} className={`transition-colors ${closer.active ? "" : "opacity-50"}`}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{closer.name}</span>
                        {closer.blocked && global.blockOnMultipleClients && (
                          <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {closer.leadTypes.length === LEAD_TYPES_DEFAULT.length ? "Todos os tipos de lead"
                          : closer.leadTypes.length === 0 ? "Nenhum tipo selecionado"
                          : `${closer.leadTypes.slice(0, 3).join(", ")}${closer.leadTypes.length > 3 ? ` +${closer.leadTypes.length - 3}` : ""}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {global.blockOnMultipleClients && (
                        <button onClick={() => toggleBlocked(closer.name)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                          {closer.blocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-slate-600 hover:text-slate-400" />}
                        </button>
                      )}
                      <button onClick={() => toggleActive(closer.name)}>
                        {closer.active ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                      </button>
                      <button onClick={() => setExpanded(isExpanded ? null : closer.name)}
                        className={`p-1.5 rounded-lg transition-all ${isExpanded ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-500"}`}>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-white/5 overflow-hidden">
                        <div className="px-5 py-4 bg-white/[0.02]">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tipos de Lead Recebidos</p>
                          <div className="flex flex-wrap gap-2">
                            {LEAD_TYPES_DEFAULT.map(type => {
                              const selected = closer.leadTypes.includes(type);
                              return (
                                <button key={type} onClick={() => toggleLeadType(closer.name, type)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${selected ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10"}`}>
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-600 text-center font-medium">Configurações salvas automaticamente no dispositivo.</p>
    </div>
  );
}
