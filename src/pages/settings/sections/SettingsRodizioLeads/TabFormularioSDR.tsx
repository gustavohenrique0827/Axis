import { useState, useEffect } from "react";
import { FileText, RefreshCw, Users, CheckCircle2, ToggleLeft, ToggleRight, RotateCcw } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";

interface SdrColaborador { id: string; nome: string; phone: string; cargo: string; status: string; }
interface FormRodizioConfig { current_index: number; active_sdr_ids: string[] | null; }

export function TabFormularioSDR({ tenantId }: { tenantId: string }) {
  const [sdrs, setSdrs] = useState<SdrColaborador[]>([]);
  const [config, setConfig] = useState<FormRodizioConfig>({ current_index: 0, active_sdr_ids: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [tenantId]);

  async function loadData() {
    setLoading(true);
    const [{ data: sdrData }, { data: cfgData }] = await Promise.all([
      supabase.from("colaboradores").select("id, nome, phone, cargo, status").eq("tenant_id", tenantId).eq("cargo", "SDR").eq("status", "Ativo").order("nome"),
      supabase.from("app_settings").select("value").eq("tenant_id", tenantId).eq("key", "form_rodizio_empreenda").maybeSingle(),
    ]);
    if (sdrData) setSdrs(sdrData as SdrColaborador[]);
    if (cfgData?.value) setConfig(cfgData.value as FormRodizioConfig);
    setLoading(false);
  }

  async function saveConfig(newConfig: FormRodizioConfig) {
    setSaving(true);
    const { error } = await supabase.from("app_settings").upsert({
      id: `${tenantId}_form_rodizio`, tenant_id: tenantId,
      key: "form_rodizio_empreenda", value: newConfig,
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

  async function resetCounter() {
    await saveConfig({ ...config, current_index: 0 });
    toast.success("Contador resetado. O próximo lead vai para o primeiro SDR na fila.");
  }

  const activeSdrIds = config.active_sdr_ids ?? sdrs.map(s => s.id);
  const activeSDRs = sdrs.filter(s => activeSdrIds.includes(s.id));
  const nextSdr = activeSDRs[config.current_index % Math.max(activeSDRs.length, 1)];

  return (
    <div className="space-y-6">
      {nextSdr && (
        <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs font-black text-white shrink-0">
            {nextSdr.nome.split(" ").map(n => n[0]).join("").substring(0, 2)}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Próximo na fila</p>
            <p className="text-sm font-black text-white">{nextSdr.nome}</p>
            <p className="text-[10px] text-slate-500 font-medium">{nextSdr.phone} · Lead #{config.current_index + 1}</p>
          </div>
          <button onClick={resetCounter} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}

      <div className="bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-5 border-b border-white/5">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-0.5"><FileText className="w-3.5 h-3.5 text-orange-400" /></div>
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">SDRs no Formulário</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Leads via landing page E-EMPREENDA+ são distribuídos em round-robin entre os SDRs ativos abaixo.</p>
          </div>
          {saving && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin shrink-0 mt-0.5" />}
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3 opacity-40">
            <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
            <p className="text-xs font-black text-slate-500 uppercase">Carregando...</p>
          </div>
        ) : sdrs.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 opacity-40">
            <Users className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Nenhum SDR ativo cadastrado</p>
            <p className="text-[10px] text-slate-600 text-center max-w-xs">Cadastre colaboradores com cargo "SDR" no módulo Equipe.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {sdrs.map(sdr => {
              const isActive = activeSdrIds.includes(sdr.id);
              const isNext = nextSdr?.id === sdr.id;
              const initials = sdr.nome.split(" ").map(n => n[0]).join("").substring(0, 2);
              return (
                <div key={sdr.id} className={`flex items-center gap-4 px-5 py-4 transition-opacity ${isActive ? "" : "opacity-40"}`}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{sdr.nome}</span>
                      {isNext && isActive && (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Próximo
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{sdr.phone}</p>
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
      <p className="text-[10px] text-slate-600 text-center font-medium">Configuração salva no Supabase · Sincronizada com a landing page em tempo real.</p>
    </div>
  );
}
