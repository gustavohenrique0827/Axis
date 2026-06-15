import { useState, useMemo, useEffect } from "react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// Matches ETAPA_CORES in SettingsCRM
const ETAPA_DOT_COLORS: Record<string, string> = {
  slate: "#64748b", blue: "#3b82f6", orange: "#f97316",
  cyan: "#06b6d4", emerald: "#10b981", purple: "#a855f7",
  rose: "#f43f5e", amber: "#f59e0b", indigo: "#6366f1", pink: "#ec4899",
};

// Produces stable stageIds backward-compatible with existing lead data
function getStageId(funilId: string, idx: number): string {
  if (funilId === "funil-comercial-default") return String(idx + 1);
  if (funilId === "funil-sdr-ia-default") return `sdr-${idx + 1}`;
  return `${funilId}-${idx}`;
}

const SDR_DEFAULT_STAGES = ["Triagem SDR", "Contato Efetuado", "Qualificação SDR", "Reunião Agendada", "Promovido Closer"];

function migrateParsed(parsed: any[]): { result: any[]; changed: boolean } {
  let changed = false;
  const result = parsed.map((f: any) => {
    if (f.id === "funil-sdr-ia-default") {
      const isCurrent = JSON.stringify(f.etapas) === JSON.stringify(SDR_DEFAULT_STAGES);
      if (!isCurrent) {
        changed = true;
        return { ...f, etapas: SDR_DEFAULT_STAGES, etapasConfig: undefined, sdrEtapaEntrada: "Triagem SDR", sdrEtapaHandoff: "Promovido Closer" };
      }
    }
    return f;
  });
  return { result, changed };
}

function loadFunis(): any[] {
  try {
    const saved = localStorage.getItem("axis_funis_config");
    if (!saved) return [];
    const { result, changed } = migrateParsed(JSON.parse(saved));
    if (changed) localStorage.setItem("axis_funis_config", JSON.stringify(result));
    return result;
  } catch {}
  return [];
}

async function loadFunisFromDB(): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "axis_funis_config")
      .maybeSingle();
    if (!data?.value) return null;
    const parsed: any[] = Array.isArray(data.value) ? data.value : JSON.parse(data.value);
    const { result, changed } = migrateParsed(parsed);
    // Write back to localStorage so next load is fast
    localStorage.setItem("axis_funis_config", JSON.stringify(result));
    if (changed) {
      // Also update DB to migrated version
      await supabase.from("app_settings").update({ value: result }).eq("key", "axis_funis_config");
    }
    return result;
  } catch {
    return null;
  }
}

export function usePipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sellerFilter, setSellerFilter] = useState("Todos");
  const [companyFilter, setCompanyFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [tempDropdownId, setTempDropdownId] = useState<string | null>(null);
  const [webhookModalLead, setWebhookModalLead] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const { leads, updateLead, tasks, addTask, products } = useData();
  const { user, allTenantModules, tenantIdMap } = useAuth();

  const isMaster = user?.isMaster || user?.tenantName?.includes("G-Tech");
  const [tenantFilter, setTenantFilter] = useState(user?.tenantId || "");

  const [clientFilter, setClientFilter] = useState("Todos");
  const [clientsList, setClientsList] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("clientes").select("name").order("name", { ascending: true }).then(({ data }) => {
      if (data) setClientsList(data.map((c: any) => c.name).filter(Boolean));
    });
  }, []);

  const [currentPipeline, setCurrentPipeline] = useState<"comercial" | "sdr">("comercial");
  const [selectedFunilId, setSelectedFunilId] = useState<string>("");

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [draggedOverStageId, setDraggedOverStageId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  // ─── Funis config from settings (axis_funis_config) ─────────────────────────
  const [funisConfig, setFunisConfig] = useState<any[]>(loadFunis);

  // On mount: load from DB (source of truth) and merge into state
  useEffect(() => {
    loadFunisFromDB().then(dbFunis => {
      if (dbFunis && dbFunis.length > 0) {
        setFunisConfig(dbFunis);
      }
    });
  }, []);

  // Sync when settings page saves (same-tab won't fire StorageEvent, so also poll on focus)
  useEffect(() => {
    const syncFromStorage = () => setFunisConfig(loadFunis());
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, []);

  const allActiveFunis = useMemo(() => {
    const active = funisConfig.filter((f) => f.ativo !== false);
    if (clientFilter === "Todos") return active;

    // Prefer client-specific funnels; fall back to globals if none exist for this client
    const clientSpecific = active.filter((f) => f.clientIds?.includes(clientFilter));
    if (clientSpecific.length > 0) return clientSpecific;
    return active.filter((f) => !f.clientIds || f.clientIds.length === 0);
  }, [funisConfig, clientFilter]);
  const comercialFunis = useMemo(() => allActiveFunis.filter((f) => f.tipo === "comercial"), [allActiveFunis]);
  const sdrFunis      = useMemo(() => allActiveFunis.filter((f) => f.tipo === "sdr_ia"),   [allActiveFunis]);
  const isSdrEnabled  = sdrFunis.length > 0;

  // Keep selectedFunilId pointing to a valid funil when the pool changes
  useEffect(() => {
    const pool = currentPipeline === "sdr" ? sdrFunis : comercialFunis;
    if (pool.length > 0 && !pool.find((f) => f.id === selectedFunilId)) {
      setSelectedFunilId(pool[0].id);
    }
  }, [currentPipeline, sdrFunis, comercialFunis]);

  // Reset filters when switching pipeline type so stale filters don't hide leads
  useEffect(() => {
    setSellerFilter("Todos");
    setCompanyFilter("Todos");
    setClientFilter("Todos");
    setSearchQuery("");
  }, [currentPipeline]);

  const activeFunil = useMemo(() => {
    const pool = currentPipeline === "sdr" ? sdrFunis : comercialFunis;
    return pool.find((f) => f.id === selectedFunilId) ?? pool[0] ?? null;
  }, [currentPipeline, selectedFunilId, sdrFunis, comercialFunis]);

  // Build stages from the active funil's etapasConfig
  const activePipelineStages = useMemo(() => {
    if (!activeFunil) return [];
    const configs: any[] = activeFunil.etapasConfig ??
      activeFunil.etapas.map((nome: string, i: number) => ({
        nome,
        cor: ["cyan","indigo","purple","amber","emerald","pink","rose","blue","orange","slate"][i % 10],
        iniciarMinimizado: false,
      }));
    return configs.map((s: any, idx: number) => ({
      id: getStageId(activeFunil.id, idx),
      name: s.nome,
      color: ETAPA_DOT_COLORS[s.cor] ?? "#64748b",
      iniciarMinimizado: s.iniciarMinimizado ?? false,
    }));
  }, [activeFunil]);

  // ─── Lists for dropdowns ──────────────────────────────────────────────────────
  // tenantsList: { id: UUID, name: string }[] — used by Pipeline.tsx dropdown
  const tenantsList = useMemo(() => {
    if (!isMaster) {
      return user?.tenantId ? [{ id: user.tenantId, name: user.tenantName }] : [];
    }
    // Build from tenantIdMap (DB source), falling back to allTenantModules names
    const mapEntries = Object.entries(tenantIdMap).map(([name, id]) => ({ id, name }));
    if (mapEntries.length > 0) return mapEntries;
    return Object.keys(allTenantModules)
      .filter(n => !n.includes("G-Tech"))
      .map(name => ({ id: name, name }));
  }, [isMaster, tenantIdMap, allTenantModules, user]);

  const sellers      = useMemo(() => ["Todos", ...Array.from(new Set(leads.map((l: any) => l.seller).filter(Boolean)))], [leads]);
  const companiesList = useMemo(() => [
    "Todos",
    ...Array.from(new Set(leads.map((l: any) => l.company).filter(Boolean))).sort() as string[],
  ], [leads]);

  // ─── Filtered leads ───────────────────────────────────────────────────────────
  const filteredItemsList = useMemo(() => leads
    .filter((item: any) => {
      const matchesTenant   = !isMaster || !tenantFilter || item.tenantId === tenantFilter;
      const matchesPipeline = currentPipeline === "sdr"
        ? item.pipelineId === "sdr"
        : !item.pipelineId || item.pipelineId === "comercial";
      const matchesSeller  = sellerFilter  === "Todos" || item.seller  === sellerFilter;
      const matchesCompany = companyFilter === "Todos" || item.company === companyFilter;
      const matchesClient  = clientFilter  === "Todos" || item.clientName === clientFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch  =
        (item.name   ?? "").toLowerCase().includes(q) ||
        (item.company ?? "").toLowerCase().includes(q) ||
        (item.title   ?? "").toLowerCase().includes(q);
      return matchesTenant && matchesPipeline && matchesSeller && matchesCompany && matchesClient && matchesSearch;
    })
    // Newest leads first — uses Supabase's auto-set created_at
    .sort((a: any, b: any) => {
      const da: string = a.created_at ?? a.createdAt ?? "";
      const db: string = b.created_at ?? b.createdAt ?? "";
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db > da ? 1 : db < da ? -1 : 0;
    }),
  [leads, currentPipeline, sellerFilter, searchQuery, tenantFilter, isMaster, companyFilter, clientFilter]);

  // ─── Metrics ─────────────────────────────────────────────────────────────────
  const analyticsData = useMemo(() =>
    activePipelineStages.map((s) => ({
      name: s.name,
      value: filteredItemsList.filter((l: any) => l.stageId === s.id).length,
      color: s.color,
    })),
    [activePipelineStages, filteredItemsList]
  );

  const totalValueSum = filteredItemsList.reduce((sum, item) => {
    const ids: string[] = Array.isArray(item.productIds) ? item.productIds : [];
    if (ids.length > 0) {
      const productTotal = (products as any[]).reduce(
        (s: number, p: any) => ids.includes(p.id) ? s + (Number(p.price) || 0) : s,
        0
      );
      if (productTotal > 0) return sum + productTotal;
    }
    return sum + (parseFloat(String(item.value ?? "").replace(/[^\d,]/g, "").replace(",", ".")) || 0);
  }, 0);

  const formattedTotalValue = new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(totalValueSum);

  const totalLeadsCount = filteredItemsList.length;
  const lastStageId = activePipelineStages.length > 0
    ? activePipelineStages[activePipelineStages.length - 1].id
    : null;

  const firstComercialStageId = useMemo(() => {
    const f = comercialFunis[0];
    if (!f) return "1";
    return getStageId(f.id, 0);
  }, [comercialFunis]);

  const firstSdrStageId = useMemo(() => {
    const f = sdrFunis[0];
    if (!f) return "sdr-1";
    return getStageId(f.id, 0);
  }, [sdrFunis]);
  const closedWonCount  = filteredItemsList.filter(
    (l: any) => (lastStageId && l.stageId === lastStageId) || l.status === "Fechado"
  ).length;
  const winRate = totalLeadsCount > 0 ? Math.round((closedWonCount / totalLeadsCount) * 100) : 0;

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const triggerCelebration = () => {
    confetti({
      particleCount: 150, spread: 70, origin: { y: 0.6 },
      colors: ["#10B981", "#34D399", "#60A5FA"],
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Relatório de Pipeline — ${activeFunil?.nome ?? currentPipeline}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

    const tableData: string[][] = filteredItemsList.map((l: any) => [
      String(l.name ?? ""),
      String(l.company ?? ""),
      String(activePipelineStages.find((s) => s.id === l.stageId)?.name ?? "Sem Fase"),
      String(l.value ?? ""),
      String(l.seller ?? ""),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Nome", "Empresa", "Fase", "Valor", "Responsável"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: "#1E293B", textColor: "#FFFFFF" },
    });

    doc.save(`pipeline_${currentPipeline}_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const handleExportIAResume = (e: any, lead: any) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`Resumo de IA - ${lead.name}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Empresa: ${lead.company} | Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Resumo de Qualificação:", 14, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(
      lead.iaSummary || "Nenhuma análise de IA disponível para este lead.", 170
    );
    doc.text(splitSummary, 14, 50);

    let nextY = 50 + splitSummary.length * 6 + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Últimas 5 Atividades do CRM:", 14, nextY);
    nextY += 8;

    const leadTasks = tasks
      .filter((t: any) => t.related === lead.name || t.related === lead.company)
      .slice(0, 5);

    if (leadTasks.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Nenhuma atividade recente encontrada.", 14, nextY);
    } else {
      autoTable(doc, {
        startY: nextY,
        head: [["Data", "Atividade", "Status"]],
        body: leadTasks.map((t: any) => [String(t.date ?? "Recente"), String(t.desc ?? ""), String(t.status ?? "")]),
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`Resumo_IA_${lead.name.replace(/\s+/g, "_")}.pdf`);
    setOpenDropdownId(null);
  };

  const handleTransferToComercial = (e: any, lead: any) => {
    e.stopPropagation();
    updateLead(lead.id, { pipelineId: "comercial", stageId: "1" });
    addTask({
      title: "Bem-vindo ao Comercial",
      desc: `Apresentação recebida do SDR. Lead: ${lead.name}`,
      status: "A Fazer",
      related: lead.name,
      responsible: lead.seller || user?.name || "Closer",
    });
    toast.success("Transferência Inteligente: Lead movido para o Comercial e tarefa criada!");
    setOpenDropdownId(null);
  };

  return {
    isModalOpen, setIsModalOpen,
    selectedLead, setSelectedLead,
    sellerFilter, setSellerFilter,
    companyFilter, setCompanyFilter,
    searchQuery, setSearchQuery,
    showAnalytics, setShowAnalytics,
    openDropdownId, setOpenDropdownId,
    tempDropdownId, setTempDropdownId,
    webhookModalLead, setWebhookModalLead,
    webhookUrl, setWebhookUrl,
    leads, updateLead, tasks, addTask,
    isMaster, tenantFilter, setTenantFilter,
    clientFilter, setClientFilter, clientsList,
    currentPipeline, setCurrentPipeline,
    selectedFunilId, setSelectedFunilId,
    activeFunil,
    comercialFunis, sdrFunis,
    isSdrEnabled,
    firstComercialStageId,
    firstSdrStageId,
    draggedLeadId, setDraggedLeadId,
    draggedOverStageId, setDraggedOverStageId,
    draggedColumnId, setDraggedColumnId,
    tenantsList,
    companiesList,
    activePipelineStages,
    sellers,
    allSellersFullList: sellers.filter((s) => s !== "Todos"),
    filteredItemsList,
    analyticsData,
    formattedTotalValue,
    winRate,
    triggerCelebration,
    exportPDF,
    handleExportIAResume,
    handleTransferToComercial,
  };
}
