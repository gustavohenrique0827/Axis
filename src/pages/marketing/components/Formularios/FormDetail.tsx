import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  FileText, Users, TrendingUp, Eye, RefreshCw, ExternalLink,
  CheckCircle2, RotateCcw, ToggleRight, ToggleLeft, Smartphone,
  AlertCircle, Settings, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { FormStepsEditor } from "./FormStepsEditor";

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  source: string;
  active: boolean;
}

interface SdrInfo { id: string; nome: string; phone: string; }
interface FormRodizioConfig { current_index: number; active_sdr_ids: string[] | null; }
interface LeadStat { total: number; today: number; thisWeek: number; }
type Tab = "visualizar" | "rodizio" | "leads" | "perguntas";

export function FormDetail({ form, tenantId }: { form: FormDefinition; tenantId: string }) {
  const [tab,         setTab]       = useState<Tab>("visualizar");
  const [sdrs,        setSdrs]      = useState<SdrInfo[]>([]);
  const [config,      setConfig]    = useState<FormRodizioConfig>({ current_index: 0, active_sdr_ids: null });
  const [stats,       setStats]     = useState<LeadStat>({ total: 0, today: 0, thisWeek: 0 });
  const [recentLeads, setRecent]    = useState<any[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [saving,      setSaving]    = useState(false);
  const [iframeKey,   setIframeKey] = useState(0);

  useEffect(() => { loadAll(); }, [form.id]);

  async function loadAll() {
    setLoading(true);
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    const [sdrRes, cfgRes, totalRes, todayRes, weekRes, recentRes] = await Promise.all([
      supabase.from("colaboradores").select("id, nome, phone")
        .eq("tenant_id", tenantId).eq("cargo", "SDR").eq("status", "Ativo").order("nome"),
      supabase.from("app_settings").select("value")
        .eq("tenant_id", tenantId).eq("key", `form_rodizio_${form.id}`).maybeSingle(),
      supabase.from("leads").select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId).eq("source", form.source),
      supabase.from("leads").select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId).eq("source", form.source).gte("created_at", today.toISOString()),
      supabase.from("leads").select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId).eq("source", form.source).gte("created_at", weekAgo.toISOString()),
      supabase.from("leads").select("name, email, created_at")
        .eq("tenant_id", tenantId).eq("source", form.source)
        .order("created_at", { ascending: false }).limit(10),
    ]);

    if (sdrRes.data)        setSdrs(sdrRes.data as SdrInfo[]);
    if (cfgRes.data?.value) setConfig(cfgRes.data.value as FormRodizioConfig);
    setStats({ total: totalRes.count ?? 0, today: todayRes.count ?? 0, thisWeek: weekRes.count ?? 0 });
    if (recentRes.data)     setRecent(recentRes.data);
    setLoading(false);
  }

  async function saveConfig(newConfig: FormRodizioConfig) {
    setSaving(true);
    const { error } = await supabase.from("app_settings").upsert({
      id:         `${tenantId}_form_rodizio_${form.id}`,
      tenant_id:  tenantId,
      key:        `form_rodizio_${form.id}`,
      value:      newConfig,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar."); return; }
    setConfig(newConfig);
    toast.success("Rodízio atualizado.");
  }

  function toggleSdr(id: string) {
    const active = config.active_sdr_ids ?? sdrs.map(s => s.id);
    const newIds = active.includes(id) ? active.filter(x => x !== id) : [...active, id];
    saveConfig({ ...config, active_sdr_ids: newIds.length === sdrs.length ? null : newIds });
  }

  const activeSdrIds = config.active_sdr_ids ?? sdrs.map(s => s.id);
  const activeSDRs   = sdrs.filter(s => activeSdrIds.includes(s.id));
  const nextSdr      = activeSDRs[config.current_index % Math.max(activeSDRs.length, 1)];

  const TABS: { key: Tab; label: string; icon: ReactNode }[] = [
    { key: "visualizar", label: "Visualizar",      icon: <Eye        className="w-3.5 h-3.5" /> },
    { key: "perguntas",  label: "Editar Perguntas", icon: <Pencil     className="w-3.5 h-3.5" /> },
    { key: "rodizio",    label: "Rodízio SDR",     icon: <Users      className="w-3.5 h-3.5" /> },
    { key: "leads",      label: "Leads",           icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",      value: stats.total,    color: "text-indigo-500",  icon: <FileText     className="w-5 h-5" /> },
          { label: "Hoje",       value: stats.today,    color: "text-emerald-500", icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: "Últimos 7d", value: stats.thisWeek, color: "text-blue-500",    icon: <TrendingUp   className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.label} className="bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all rounded-2xl p-6">
            <div className={`mb-4 ${s.color}`}>{s.icon}</div>
            <div className="text-2xl font-display font-black text-white mb-1 italic">{loading ? "—" : s.value}</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${tab === t.key ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>

          {tab === "visualizar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <a href={form.previewUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] font-bold text-orange-400 hover:underline inline-flex items-center gap-1">
                  {form.previewUrl} <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => setIframeKey(k => k + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                  <RefreshCw className="w-3 h-3" /> Recarregar
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/8 bg-[var(--color-surface)]">
                <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md">
                      <Smartphone className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-medium">{form.previewUrl}</span>
                    </div>
                  </div>
                </div>
                <iframe key={iframeKey} src={form.previewUrl} title={form.name}
                  className="w-full" style={{ height: "540px", border: "none" }}
                  sandbox="allow-scripts allow-same-origin allow-forms" />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/70 font-medium leading-relaxed">
                  Para editar perguntas e opções, altere{" "}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">src/pages/Inscricao/index.tsx</code>{" "}
                  no projeto E-EMPREENDA+.
                </p>
              </div>
            </div>
          )}

          {tab === "perguntas" && <FormStepsEditor />}

          {tab === "rodizio" && (
            <div className="space-y-5">
              {nextSdr && (
                <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs font-black text-white shrink-0">
                    {nextSdr.nome.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Próximo na fila</p>
                    <p className="text-sm font-black text-white">{nextSdr.nome}</p>
                    <p className="text-[10px] text-slate-500">{nextSdr.phone} · Lead #{config.current_index + 1}</p>
                  </div>
                  <button onClick={() => saveConfig({ ...config, current_index: 0 })} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest disabled:opacity-50">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              )}

              <div className="bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-white/5">
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">SDRs no Rodízio</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Round-robin entre os SDRs ativos abaixo.</p>
                  </div>
                  {saving && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />}
                </div>
                {loading ? (
                  <div className="p-10 flex justify-center"><RefreshCw className="w-5 h-5 text-slate-600 animate-spin" /></div>
                ) : sdrs.length === 0 ? (
                  <div className="p-10 flex flex-col items-center gap-2 opacity-40">
                    <Users className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-black text-slate-500 uppercase">Nenhum SDR ativo</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {sdrs.map(sdr => {
                      const isActive = activeSdrIds.includes(sdr.id);
                      const isNext   = nextSdr?.id === sdr.id;
                      const initials = sdr.nome.split(" ").map((n: string) => n[0]).join("").substring(0, 2);
                      return (
                        <div key={sdr.id} className={`flex items-center gap-4 px-5 py-4 transition-opacity ${isActive ? "" : "opacity-40"}`}>
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">{initials}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{sdr.nome}</span>
                              {isNext && isActive && (
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Próximo
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sdr.phone}</p>
                          </div>
                          <button onClick={() => toggleSdr(sdr.id)} disabled={saving}>
                            {isActive ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-600">Salvo no Supabase · Sincronizado em tempo real.</p>
                <Link to="/app/configuracoes/crm/rodizio"
                  className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest transition-colors">
                  <Settings className="w-3 h-3" /> Config. Avançada
                </Link>
              </div>
            </div>
          )}

          {tab === "leads" && (
            <div className="space-y-4">
              <div className="bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-white/5">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Últimas Inscrições</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">source = {form.source}</p>
                  </div>
                  <button onClick={loadAll} disabled={loading} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                {loading ? (
                  <div className="p-10 flex justify-center"><RefreshCw className="w-5 h-5 text-slate-600 animate-spin" /></div>
                ) : recentLeads.length === 0 ? (
                  <div className="p-10 flex flex-col items-center gap-2 opacity-40">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="text-xs font-black text-slate-500 uppercase">Nenhuma inscrição ainda</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {recentLeads.map((lead, i) => {
                      const initials = (lead.name as string).split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                      const dt = new Date(lead.created_at);
                      return (
                        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{initials}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">{lead.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{lead.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] font-bold text-white">{dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                            <p className="text-[10px] text-slate-500">{dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <Link to="/app/pipeline"
                className="flex items-center justify-center gap-2 w-full p-3 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] font-black text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all uppercase tracking-widest">
                Ver todos no Pipeline <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
