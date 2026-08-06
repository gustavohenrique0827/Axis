import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Layers, Link2, RefreshCw, Unlink } from "lucide-react";
import { apiFetch } from "../../../../lib/apiClient";
import { supabase } from "../../../../lib/supabase";
import { Funil } from "../crm/funisTypes";

interface HubspotStatus {
  status: "disconnected" | "connected" | "error";
  hub_id?: string | null;
  hub_domain?: string | null;
  last_synced_at?: string | null;
  last_error?: string | null;
}

interface HubspotPipeline {
  id: string;
  label: string;
  stages: { id: string; label: string }[];
}

interface StageMappingRow {
  pipelineId: string;
  stageId: string;
  externalPipelineId: string;
  externalStageId: string;
}

function loadLocalFunis(): Funil[] {
  try {
    const saved = localStorage.getItem("axis_funis_config");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function HubspotIntegrationSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<HubspotStatus>({ status: "disconnected" });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pipelines, setPipelines] = useState<HubspotPipeline[]>([]);
  const [mappings, setMappings] = useState<Record<string, StageMappingRow>>({});
  const [savingMappingKey, setSavingMappingKey] = useState<string | null>(null);

  const funis = loadLocalFunis();

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await apiFetch("/api/integrations/hubspot/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch HubSpot status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const res = await apiFetch("/api/integrations/hubspot/pipelines");
      if (!res.ok) return;
      const data = await res.json();
      setPipelines(
        (data.pipelines || []).map((p: any) => ({
          id: p.id,
          label: p.label,
          stages: (p.stages || []).map((s: any) => ({ id: s.id, label: s.label })),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch HubSpot pipelines:", err);
    }
  };

  const fetchMappings = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("crm_stage_mappings")
      .select("pipeline_id, stage_id, external_pipeline_id, external_stage_id")
      .eq("provider", "hubspot");
    if (!data) return;
    const next: Record<string, StageMappingRow> = {};
    for (const row of data) {
      next[`${row.pipeline_id}::${row.stage_id}`] = {
        pipelineId: row.pipeline_id,
        stageId: row.stage_id,
        externalPipelineId: row.external_pipeline_id,
        externalStageId: row.external_stage_id,
      };
    }
    setMappings(next);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const hubspotParam = searchParams.get("hubspot");
    if (!hubspotParam) return;
    if (hubspotParam === "connected") toast.success("HubSpot conectado com sucesso!");
    if (hubspotParam === "error") toast.error("Não foi possível conectar ao HubSpot. Tente novamente.");
    const next = new URLSearchParams(searchParams);
    next.delete("hubspot");
    setSearchParams(next, { replace: true });
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (status.status === "connected") {
      fetchPipelines();
      fetchMappings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.status]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await apiFetch("/api/integrations/hubspot/connect");
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Integração com HubSpot não configurada.");
        setConnecting(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("Failed to start HubSpot connect flow:", err);
      toast.error("Falha ao iniciar conexão com o HubSpot.");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await apiFetch("/api/integrations/hubspot/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("disconnect failed");
      toast.success("HubSpot desconectado.");
      await fetchStatus();
    } catch (err) {
      console.error("Failed to disconnect HubSpot:", err);
      toast.error("Falha ao desconectar o HubSpot.");
    }
  };

  const handlePullNow = async () => {
    setPulling(true);
    try {
      const res = await apiFetch("/api/integrations/hubspot/pull", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "pull failed");
      toast.success(`${data.synced ?? 0} negócio(s) sincronizado(s) do HubSpot.`);
      await fetchStatus();
    } catch (err) {
      console.error("Failed to pull from HubSpot:", err);
      toast.error("Falha ao sincronizar dados do HubSpot.");
    } finally {
      setPulling(false);
    }
  };

  const handleMappingChange = async (pipelineId: string, stageId: string, externalPipelineId: string, externalStageId: string) => {
    if (!supabase || !externalStageId) return;
    const key = `${pipelineId}::${stageId}`;
    setSavingMappingKey(key);
    try {
      const { error } = await supabase
        .from("crm_stage_mappings")
        .upsert(
          { provider: "hubspot", pipeline_id: pipelineId, stage_id: stageId, external_pipeline_id: externalPipelineId, external_stage_id: externalStageId },
          { onConflict: "tenant_id,provider,pipeline_id,stage_id" }
        );
      if (error) throw error;
      setMappings(prev => ({ ...prev, [key]: { pipelineId, stageId, externalPipelineId, externalStageId } }));
      toast.success("Mapeamento de etapa salvo.");
    } catch (err) {
      console.error("Failed to save stage mapping:", err);
      toast.error("Falha ao salvar mapeamento de etapa.");
    } finally {
      setSavingMappingKey(null);
    }
  };

  const isConnected = status.status === "connected";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg sm:text-xl font-bold text-white">Integração com HubSpot</h2>
      </div>

      <Card className="p-4 sm:p-6 bg-[var(--color-surface-elevated)]/80 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : status.status === "error"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-white/5 text-slate-500 border-white/10"
              }`}
            >
              {loadingStatus ? "Carregando..." : isConnected ? "Conectado" : status.status === "error" ? "Erro" : "Desconectado"}
            </span>
            {isConnected && status.hub_domain && (
              <p className="text-sm text-slate-300 mt-2">Conta HubSpot: <span className="font-bold text-white">{status.hub_domain}</span></p>
            )}
            {status.last_synced_at && (
              <p className="text-xs text-slate-500 mt-1">Última sincronização: {new Date(status.last_synced_at).toLocaleString("pt-BR")}</p>
            )}
            {status.last_error && <p className="text-xs text-rose-400 mt-1">{status.last_error}</p>}
            {!isConnected && (
              <p className="text-xs text-slate-400 mt-2 max-w-md">
                Conecte sua conta HubSpot para sincronizar negócios e contatos automaticamente com o Axis, nos dois sentidos.
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {isConnected ? (
              <>
                <Button onClick={handlePullNow} disabled={pulling} variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 text-white gap-2">
                  <RefreshCw className={`w-4 h-4 ${pulling ? "animate-spin" : ""}`} /> {pulling ? "Sincronizando..." : "Sincronizar agora"}
                </Button>
                <Button onClick={handleDisconnect} variant="outline" className="border-rose-500/25 bg-transparent hover:bg-rose-500/10 text-rose-400 gap-2">
                  <Unlink className="w-4 h-4" /> Desconectar
                </Button>
              </>
            ) : (
              <Button onClick={handleConnect} disabled={connecting} className="bg-orange-600 hover:bg-orange-500 font-bold gap-2">
                <Link2 className="w-4 h-4" /> {connecting ? "Conectando..." : "Conectar com HubSpot"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isConnected && pipelines.length > 0 && funis.length > 0 && (
        <Card className="p-4 sm:p-6 bg-[var(--color-surface-elevated)]/60 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Mapeamento de Etapas</h3>
          </div>
          <p className="text-xs text-slate-400">Associe cada etapa do seu funil no Axis a uma etapa (dealstage) do HubSpot, para que negócios sincronizados caiam na coluna certa.</p>
          <div className="space-y-3">
            {funis.map(funil => (
              <div key={funil.id} className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{funil.nome}</p>
                {funil.etapas.map(etapa => {
                  const key = `${funil.id}::${etapa}`;
                  const current = mappings[key];
                  return (
                    <div key={key} className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <span className="text-xs text-slate-300 w-40 shrink-0 truncate">{etapa}</span>
                      <select
                        value={current ? `${current.externalPipelineId}::${current.externalStageId}` : ""}
                        onChange={e => {
                          const [extPipelineId, extStageId] = e.target.value.split("::");
                          if (extPipelineId && extStageId) handleMappingChange(funil.id, etapa, extPipelineId, extStageId);
                        }}
                        disabled={savingMappingKey === key}
                        className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="">Não mapeado</option>
                        {pipelines.map(p => (
                          <optgroup key={p.id} label={p.label}>
                            {p.stages.map(s => (
                              <option key={s.id} value={`${p.id}::${s.id}`}>{s.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
