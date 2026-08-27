import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ToggleLeft, ToggleRight, Lock, Unlock, ChevronDown, RefreshCw, Users, ShieldCheck,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
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

const DEFAULT_CLOSERS: CloserConfig[] = [
  { name: "Lucas Martins", email: "lucas.martins@axis.com", active: true, leadTypes: LEAD_TYPES_DEFAULT, blocked: false },
  { name: "Mariana Rios", email: "mariana.rios@axis.com", active: true, leadTypes: LEAD_TYPES_DEFAULT, blocked: false },
  { name: "Carlos Mendes", email: "carlos.mendes@axis.com", active: true, leadTypes: LEAD_TYPES_DEFAULT, blocked: false },
  { name: "Fernanda Lima", email: "fernanda.lima@axis.com", active: true, leadTypes: LEAD_TYPES_DEFAULT, blocked: false },
];

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
      const resolved = merged.length > 0 ? merged : (saved.closers.length > 0 ? saved.closers : DEFAULT_CLOSERS);
      setClosers(resolved);
      saveLocalConfig({ closers: resolved, global: saved.global });
      setLoading(false);
    }
    init();
  }, []);

  function persist(updatedClosers: CloserConfig[], updatedGlobal = global) {
    saveLocalConfig({ closers: updatedClosers, global: updatedGlobal });
  }

  const updateGlobal = (patch: Partial<GlobalConfig>) => {
    const next = { ...global, ...patch };
    setGlobal(next);
    persist(closers, next);
    toast.success("Regras de distribuição atualizadas!");
  };

  const toggleActive = (name: string) => {
    const next = closers.map(c => c.name === name ? { ...c, active: !c.active } : c);
    setClosers(next);
    persist(next);
    toast.success(`Status de ${name} alterado.`);
  };

  const toggleBlocked = (name: string) => {
    const next = closers.map(c => c.name === name ? { ...c, blocked: !c.blocked } : c);
    setClosers(next);
    persist(next);
    toast.success(`Trava de ${name} atualizada.`);
  };

  const toggleLeadType = (name: string, type: string) => {
    const next = closers.map(c => {
      if (c.name !== name) return c;
      const leadTypes = c.leadTypes.includes(type)
        ? c.leadTypes.filter(t => t !== type)
        : [...c.leadTypes, type];
      return { ...c, leadTypes };
    });
    setClosers(next);
    persist(next);
  };

  return (
    <div className="space-y-6">
      {/* Distribution Mode Card */}
      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Modo de Distribuição</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Selecione o algoritmo de repasse automático de leads para os closers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DISTRIBUTION_MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => updateGlobal({ distributionMode: m.value })}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                global.distributionMode === m.value
                  ? "bg-[var(--color-primary-blue)]/10 border-[var(--color-primary-blue)] text-[var(--color-text-primary)]"
                  : "bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-border-default)]/80"
              }`}
            >
              <div className="font-bold text-xs text-[var(--color-text-primary)]">{m.label}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-1">{m.desc}</div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${global.blockOnMultipleClients ? "bg-rose-500/10" : "bg-[var(--color-surface-sunken)]"}`}>
                {global.blockOnMultipleClients ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-[var(--color-text-muted)] text-slate-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Bloquear closer com múltiplos atendimentos em paralelo</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 max-w-sm">Closers atendendo {global.multiClientThreshold}+ leads simultâneos saem temporariamente da fila até liberarem capacidade.</p>
              </div>
            </div>
            <button type="button" onClick={() => updateGlobal({ blockOnMultipleClients: !global.blockOnMultipleClients })} className="shrink-0 cursor-pointer">
              {global.blockOnMultipleClients ? <ToggleRight className="w-7 h-7 text-rose-500" /> : <ToggleLeft className="w-7 h-7 text-[var(--color-text-muted)]" />}
            </button>
          </div>

          {global.blockOnMultipleClients && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-3 pt-2">
              <label className="text-xs font-bold text-[var(--color-text-muted)] shrink-0">Bloquear a partir de:</label>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  onClick={() => global.multiClientThreshold > 1 && updateGlobal({ multiClientThreshold: global.multiClientThreshold - 1 })} 
                  className="w-7 h-7 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold font-mono text-[var(--color-text-primary)] w-6 text-center">{global.multiClientThreshold}</span>
                <button 
                  type="button" 
                  onClick={() => updateGlobal({ multiClientThreshold: global.multiClientThreshold + 1 })} 
                  className="w-7 h-7 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-elevated)] cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">clientes simultâneos</span>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Closers on Rotation */}
      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="flex items-start gap-3 p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
          <div className="p-2 rounded-xl bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Closers na Rotação</h3>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-medium">Controle individual de disponibilidade e tipos de lead permitidos.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center gap-2 opacity-50">
            <RefreshCw className="w-5 h-5 text-[var(--color-primary-blue)] animate-spin" />
            <p className="text-xs text-[var(--color-text-muted)] font-medium">Carregando closers...</p>
          </div>
        ) : closers.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-2 text-center">
            <Users className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />
            <p className="text-xs font-bold text-[var(--color-text-primary)]">Nenhum closer ativo encontrado</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Adicione membros com o cargo "Closer" no módulo de Equipe.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {closers.map(closer => {
              const isExpanded = expandedCloser === closer.name;
              const initials = closer.name.split(" ").map(n => n[0]).join("").substring(0, 2);
              return (
                <div key={closer.name} className={`transition-colors ${closer.active ? "" : "opacity-50"}`}>
                  <div className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary-blue)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">{closer.name}</span>
                        {closer.blocked && global.blockOnMultipleClients && (
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">
                        {closer.leadTypes.length === LEAD_TYPES_DEFAULT.length ? "Todos os tipos de lead"
                          : closer.leadTypes.length === 0 ? "Nenhum tipo selecionado"
                          : `${closer.leadTypes.slice(0, 3).join(", ")}${closer.leadTypes.length > 3 ? ` +${closer.leadTypes.length - 3}` : ""}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {global.blockOnMultipleClients && (
                        <button type="button" onClick={() => toggleBlocked(closer.name)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)] transition-colors cursor-pointer">
                          {closer.blocked ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4 text-[var(--color-text-muted)]" />}
                        </button>
                      )}
                      <button type="button" onClick={() => toggleActive(closer.name)} className="cursor-pointer">
                        {closer.active ? <ToggleRight className="w-7 h-7 text-emerald-500" /> : <ToggleLeft className="w-7 h-7 text-[var(--color-text-muted)]" />}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setExpanded(isExpanded ? null : closer.name)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${isExpanded ? "bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"}`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-[var(--color-border-subtle)] overflow-hidden">
                        <div className="px-5 py-4 bg-[var(--color-surface-sunken)]/50 space-y-2">
                          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Tipos de Lead Habilitados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {LEAD_TYPES_DEFAULT.map(type => {
                              const selected = closer.leadTypes.includes(type);
                              return (
                                <button 
                                  key={type} 
                                  type="button"
                                  onClick={() => toggleLeadType(closer.name, type)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${selected ? "bg-[var(--color-primary-blue)]/15 text-[var(--color-primary-blue)] border-[var(--color-primary-blue)]/30" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border-default)] hover:text-[var(--color-text-primary)]"}`}
                                >
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
      </Card>
    </div>
  );
}
