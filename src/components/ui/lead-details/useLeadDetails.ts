import { useState, useEffect, useMemo } from "react";
import { useData } from "../../../contexts/DataContext";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

// ─── Stage helpers ────────────────────────────────────────────────────────────

function getStageId(funilId: string, idx: number): string {
  if (funilId === "funil-comercial-default") return String(idx + 1);
  if (funilId === "funil-sdr-ia-default") return `sdr-${idx + 1}`;
  return `${funilId}-${idx}`;
}

function buildStages(funis: any[], isSDR: boolean) {
  const funil = funis.find(
    (f: any) => f.ativo !== false && (isSDR ? f.tipo === "sdr_ia" : f.tipo === "comercial")
  );
  if (!funil) return [];
  return (funil.etapas as string[]).map((name, idx) => ({
    id: getStageId(funil.id, idx),
    name,
    status: idx === 0 ? "Novo" : idx === funil.etapas.length - 1 ? "Fechado" : "Em Negociação",
  }));
}

function loadStagesFromLocalStorage(isSDR: boolean) {
  try {
    const saved = localStorage.getItem("axis_funis_config");
    if (!saved) return null;
    const stages = buildStages(JSON.parse(saved), isSDR);
    return stages.length > 0 ? stages : null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLeadDetails(lead: any, onClose: () => void) {
  const { leadActivities, addLeadActivity, updateLead, deleteLead, customLeadFields, products } = useData();

  // ── Exclusão ─────────────────────────────────────────────────────────────────
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // ── Campos customizados ──────────────────────────────────────────────────────
  const [customFieldsState, setCustomFieldsState] = useState<Record<string, string | number>>({});

  // ── Formulário de atividade (aba Histórico) ───────────────────────────────────
  const [activityType, setActivityType]   = useState<"Ligação" | "E-mail" | "Reunião" | "Outro">("Ligação");
  const [activityDesc, setActivityDesc]   = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate]   = useState(() => {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - offset).toISOString().slice(0, 10);
  });
  const [activityTime, setActivityTime]   = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [activityError, setActivityError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string }[]>([]);

  // ── Campos editáveis do lead ──────────────────────────────────────────────────
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [leadName, setLeadName]       = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [title, setTitle]             = useState("");
  const [value, setValue]             = useState("");
  const [seller, setSeller]           = useState("");
  const [priority, setPriority]       = useState<"Alta" | "Média" | "Baixa">("Média");

  // ── Inteligência do lead ─────────────────────────────────────────────────────
  const [score, setScore]             = useState(0);
  const [temperature, setTemperature] = useState<"Quente" | "Morno" | "Frio">("Frio");
  const [probability, setProbability] = useState(0);
  const [slaStatus]                   = useState<"Em Dia" | "Crítico" | "Atrasado">("Em Dia");
  const [timeIdle]                    = useState("");

  // ── Tags personalizadas ───────────────────────────────────────────────────────
  const [customTags, setCustomTags]   = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // ── Log de alterações ─────────────────────────────────────────────────────────
  const [alterationLogs, setAlterationLogs] = useState<
    Array<{ id: string; author: string; desc: string; time: string }>
  >([]);

  // ── Contexto do relatório IA ──────────────────────────────────────────────────
  const [reportContextOverride, setReportContextOverride] =
    useState<"auto" | "normal" | "educacao" | "posvenda">("auto");

  // ── Produtos vinculados ──────────────────────────────────────────────────────
  const availableProducts = useMemo(
    () =>
      (products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: typeof p.price === "number" ? p.price : parseFloat(String(p.price || "0")),
        recurrence: p.type === "Assinatura",
        category: p.category || "Geral",
      })),
    [products]
  );

  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);

  const estimatedSum = useMemo(
    () =>
      linkedProductIds.reduce((sum, id) => {
        const p = availableProducts.find(prod => prod.id === id);
        return sum + (p ? p.price : 0);
      }, 0),
    [linkedProductIds, availableProducts]
  );

  // Sincroniza o campo value com o total dos produtos enquanto edita
  useEffect(() => {
    if (linkedProductIds.length > 0 && isEditingInline) {
      setValue(`R$ ${estimatedSum.toLocaleString("pt-BR")}`);
    }
  }, [linkedProductIds, estimatedSum, isEditingInline]);

  // ── Estágios do funil ─────────────────────────────────────────────────────────
  const isSDR = lead?.pipelineId === "sdr";
  const [stagesDef, setStagesDef] = useState(() => loadStagesFromLocalStorage(isSDR) ?? []);
  const [currentStageId, setCurrentStageId] = useState<string>(lead?.stageId ?? "");

  useEffect(() => {
    const fromStorage = loadStagesFromLocalStorage(isSDR);
    if (fromStorage) { setStagesDef(fromStorage); return; }
    if (!supabase) return;
    supabase
      .from("app_settings").select("value").eq("key", "axis_funis_config").maybeSingle()
      .then(({ data }) => {
        if (!data?.value) return;
        try {
          const funis = Array.isArray(data.value) ? data.value : JSON.parse(data.value);
          localStorage.setItem("axis_funis_config", JSON.stringify(funis));
          const stages = buildStages(funis, isSDR);
          if (stages.length > 0) setStagesDef(stages);
        } catch {}
      });
  }, [lead?.id, isSDR]);

  // Sincroniza campos ao abrir/trocar lead
  useEffect(() => {
    if (!lead) return;
    setLeadName(lead.name || "");
    setCompanyName(lead.company || "");
    setPhone(lead.phone || "");
    setEmail(lead.email || "");
    setTitle(lead.title || "");
    setValue(lead.value || "");
    setSeller(lead.seller || "");
    setPriority(lead.priority || "Média");
    setCustomFieldsState(lead.customFields || {});
    setLinkedProductIds(Array.isArray(lead.productIds) ? lead.productIds : []);
    setCustomTags(Array.isArray(lead.tags) ? lead.tags : []);

    const rawScore = lead.scoreIA ?? 45;
    const t = (lead.temperature ?? "").toLowerCase();
    const derivedTemp: "Quente" | "Morno" | "Frio" =
      t === "quente" ? "Quente"
      : t === "morno" ? "Morno"
      : rawScore > 80 ? "Quente"
      : rawScore > 50 ? "Morno"
      : "Frio";

    setScore(rawScore);
    setTemperature(derivedTemp);
    setProbability(rawScore > 80 ? 80 : rawScore > 50 ? 50 : 25);
  }, [lead]);

  // Reseta stageId e modo de edição quando muda de lead
  useEffect(() => {
    setCurrentStageId(lead?.stageId ?? "");
    setIsEditingInline(false);
  }, [lead?.id]);

  // Popula log de alterações com atividades reais
  useEffect(() => {
    if (!lead?.id || !leadActivities) return;
    setAlterationLogs(
      (leadActivities as any[])
        .filter(a => a.leadId === lead.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map(a => ({
          id: a.id,
          author: a.seller || "Sistema",
          desc: a.title || a.description || "Atividade registrada",
          time: a.date || "Recente",
        }))
    );
  }, [lead?.id, leadActivities]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;
    if (customTags.includes(tag)) { toast.error("Tag já adicionada."); return; }
    const next = [...customTags, tag];
    setCustomTags(next);
    setNewTagInput("");
    if (supabase) supabase.from("leads").update({ tags: next }).eq("id", lead.id).then(() => {});
    toast.success("Tag adicionada!");
  };

  const handleRemoveTag = (tag: string) => {
    const next = customTags.filter(t => t !== tag);
    setCustomTags(next);
    if (supabase) supabase.from("leads").update({ tags: next }).eq("id", lead.id).then(() => {});
    toast.info("Tag removida.");
  };

  const handleConvertLead = () => {
    const lastStage = stagesDef[stagesDef.length - 1];
    updateLead(lead.id, { stageId: lastStage?.id ?? "5", status: "Fechado" });
    toast.success(`Lead ${leadName} convertido para Cliente Fechado!`);
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: "Lead convertido em Cliente Ativo", time: "Agora" },
      ...prev,
    ]);
  };

  const handleRegisterActivity = () => {
    if (!activityDesc.trim()) {
      setActivityError("A descrição da atividade é obrigatória.");
      toast.error("Insira uma descrição para registrar a atividade!");
      return;
    }
    const titleMap: Record<string, string> = {
      Ligação: "Ligação Telefônica realizada",
      "E-mail": "E-mail Comercial enviado",
      Reunião: "Apresentação/Reunião executada",
      Outro: "Observação Geral do Consultor",
    };
    const finalTitle = activityTitle.trim() || titleMap[activityType];

    let finalDate = `${activityDate} ${activityTime}`;
    try {
      const [y, m, d] = activityDate.split("-").map(Number);
      const [h, min] = activityTime.split(":").map(Number);
      const dt = new Date(y, m - 1, d, h, min);
      const today = new Date();
      const isToday =
        dt.getDate() === today.getDate() &&
        dt.getMonth() === today.getMonth() &&
        dt.getFullYear() === today.getFullYear();
      const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      finalDate = isToday ? `Hoje, ${activityTime}` : `${dt.getDate()} ${months[dt.getMonth()]} às ${activityTime}`;
    } catch {}

    addLeadActivity(
      lead.id, activityType, finalTitle, activityDesc,
      seller || "Sistema", finalDate,
      selectedFiles.length > 0 ? selectedFiles : undefined
    );
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: `Registrou: ${finalTitle}`, time: "Agora" },
      ...prev,
    ]);
    setActivityDesc("");
    setActivityTitle("");
    setActivityError("");
    setSelectedFiles([]);
    toast.success("Histórico atualizado com sucesso!");
  };

  const handleSaveAll = () => {
    updateLead(lead.id, {
      name: leadName, company: companyName, phone, email, title, value, seller, priority,
      customFields: customFieldsState, productIds: linkedProductIds,
    });
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: "Informações do lead atualizadas", time: "Agora" },
      ...prev,
    ]);
    toast.success("Alterações salvas!");
    setIsEditingInline(false);
  };

  const handleConfirmDelete = () => {
    deleteLead(lead.id);
    toast.success("Lead removido.");
    onClose();
  };

  const applyMessageTemplate = (tpl: string) =>
    tpl
      .replace("{client}", leadName)
      .replace("{company}", companyName)
      .replace("{seller}", seller || "Consultor");

  const toggleProductLink = (prodId: string) => {
    const newIds = linkedProductIds.includes(prodId)
      ? linkedProductIds.filter(id => id !== prodId)
      : [...linkedProductIds, prodId];
    setLinkedProductIds(newIds);
    updateLead(lead.id, { productIds: newIds });
    toast[newIds.includes(prodId) ? "success" : "info"](
      newIds.includes(prodId) ? "Produto adicionado ao orçamento!" : "Produto removido do orçamento."
    );
  };

  // ─── Visual helpers ───────────────────────────────────────────────────────────

  const tempColors = {
    Quente: "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold",
    Morno:  "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold",
    Frio:   "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold",
  };

  // ─── Return ───────────────────────────────────────────────────────────────────

  return {
    // Delete
    isConfirmDeleteOpen, setIsConfirmDeleteOpen,
    // Custom fields
    customFieldsState, setCustomFieldsState,
    // Activity form
    activityType, setActivityType,
    activityDesc, setActivityDesc,
    activityTitle, setActivityTitle,
    activityDate, setActivityDate,
    activityTime, setActivityTime,
    activityError, setActivityError,
    selectedFiles, setSelectedFiles,
    // Products
    availableProducts,
    linkedProductIds, setLinkedProductIds,
    estimatedSum,
    toggleProductLink,
    // Lead editable fields
    isEditingInline, setIsEditingInline,
    leadName, setLeadName,
    companyName, setCompanyName,
    phone, setPhone,
    email, setEmail,
    title, setTitle,
    value, setValue,
    seller, setSeller,
    priority, setPriority,
    // Intelligence
    score, temperature, probability, slaStatus, timeIdle,
    // Tags
    customTags, newTagInput, setNewTagInput,
    // Logs
    alterationLogs, setAlterationLogs,
    // Stages
    stagesDef,
    currentStageId, setCurrentStageId,
    // Report
    reportContextOverride, setReportContextOverride,
    // Custom fields config
    customLeadFields,
    // Visual
    tempColors,
    // Handlers
    handleAddTag,
    handleRemoveTag,
    handleConvertLead,
    handleRegisterActivity,
    handleSaveAll,
    handleConfirmDelete,
    applyMessageTemplate,
  };
}
