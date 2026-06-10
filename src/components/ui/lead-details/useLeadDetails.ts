import { useState, useEffect, useMemo } from "react";
import { useData } from "../../../contexts/DataContext";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

// ─── Helpers para carregar stages do funisConfig ──────────────────────────────
function getStageId(funilId: string, idx: number): string {
  if (funilId === "funil-comercial-default") return String(idx + 1);
  if (funilId === "funil-sdr-ia-default") return `sdr-${idx + 1}`;
  return `${funilId}-${idx}`;
}

function buildStages(funis: any[], isSDR: boolean): Array<{ id: string; name: string; status: string }> {
  const matching = funis.filter((f: any) =>
    f.ativo !== false && (isSDR ? f.tipo === "sdr_ia" : f.tipo === "comercial")
  );
  if (matching.length === 0) return [];
  const funil = matching[0];
  const etapas: string[] = funil.etapas || [];
  return etapas.map((nome: string, idx: number) => ({
    id: getStageId(funil.id, idx),
    name: nome,
    status: idx === 0 ? "Novo" : idx === etapas.length - 1 ? "Fechado" : "Em Negociação",
  }));
}

function loadStagesSync(isSDR: boolean): Array<{ id: string; name: string; status: string }> | null {
  try {
    const saved = localStorage.getItem("axis_funis_config");
    if (!saved) return null;
    const stages = buildStages(JSON.parse(saved), isSDR);
    return stages.length > 0 ? stages : null;
  } catch {
    return null;
  }
}

export function useLeadDetails(lead: any, onClose: () => void) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [reportContextOverride, setReportContextOverride] = useState<"auto" | "normal" | "educacao" | "posvenda">("auto");
  const { leadActivities, addLeadActivity, updateLead, deleteLead, customLeadFields, products } = useData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customFieldsState, setCustomFieldsState] = useState<Record<string, string | number>>({});

  // Tab timeline states
  const [activityType, setActivityType] = useState<"Ligação" | "E-mail" | "Reunião" | "Outro">("Ligação");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDate, setActivityDate] = useState(() => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
  });
  const [activityTime, setActivityTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [activityError, setActivityError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string }[]>([]);

  // Chat states (session-only, not persisted)
  const [chatChannel, setChatChannel] = useState<"whatsapp" | "email" | "instagram">("whatsapp");
  const [quickMessageText, setQuickMessageText] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ id: string; sender: "me" | "client" | "ai"; text: string; time: string; channel: string }>>([]);

  // Products from DataContext (real DB)
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

  // Editable fields
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [seller, setSeller] = useState("");
  const [priority, setPriority] = useState<"Alta" | "Média" | "Baixa">("Média");

  // CRM intelligence states
  const [score, setScore] = useState(0);
  const [temperature, setTemperature] = useState<"Quente" | "Morno" | "Frio">("Frio");
  const [probability, setProbability] = useState(0);
  const [slaStatus] = useState<"Em Dia" | "Crítico" | "Atrasado">("Em Dia");
  const [timeIdle] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Alteration logs - populated from real lead activities
  const [alterationLogs, setAlterationLogs] = useState<Array<{ id: string; author: string; desc: string; time: string }>>([]);

  // ─── Stage definitions from funisConfig ──────────────────────────────────────
  const isSDR = lead?.pipelineId === "sdr";
  const [stagesDef, setStagesDef] = useState<Array<{ id: string; name: string; status: string }>>(() => {
    return loadStagesSync(isSDR) || [];
  });

  useEffect(() => {
    const stages = loadStagesSync(isSDR);
    if (stages && stages.length > 0) {
      setStagesDef(stages);
      return;
    }
    if (!supabase) return;
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "axis_funis_config")
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.value) return;
        try {
          const funis = Array.isArray(data.value) ? data.value : JSON.parse(data.value);
          localStorage.setItem("axis_funis_config", JSON.stringify(funis));
          const s = buildStages(funis, isSDR);
          if (s.length > 0) setStagesDef(s);
        } catch {}
      });
  }, [lead?.id, isSDR]);

  // Sync fields when lead changes
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

    // Use real scoreIA and temperature from lead
    const realScore = lead.scoreIA ?? 45;
    let realTemp: "Quente" | "Morno" | "Frio" = "Frio";
    if (lead.temperature) {
      const t = lead.temperature.toLowerCase();
      realTemp = t === "quente" ? "Quente" : t === "morno" ? "Morno" : "Frio";
    } else {
      realTemp = realScore > 80 ? "Quente" : realScore > 50 ? "Morno" : "Frio";
    }
    setScore(realScore);
    setTemperature(realTemp);
    setProbability(realScore > 80 ? 80 : realScore > 50 ? 50 : 25);
  }, [lead]);

  // Populate alteration logs from real lead activities
  useEffect(() => {
    if (!lead?.id || !leadActivities) return;
    const relevant = (leadActivities as any[])
      .filter((a) => a.leadId === lead.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((a) => ({
        id: a.id,
        author: a.seller || "Sistema",
        desc: a.title || a.description || "Atividade registrada",
        time: a.date || "Recente",
      }));
    setAlterationLogs(relevant);
  }, [lead?.id, leadActivities]);

  // Estimated sum of linked products
  const estimatedSum = useMemo(
    () =>
      linkedProductIds.reduce((sum, id) => {
        const p = availableProducts.find((prod) => prod.id === id);
        return sum + (p ? p.price : 0);
      }, 0),
    [linkedProductIds, availableProducts]
  );

  useEffect(() => {
    if (linkedProductIds.length > 0 && isEditingInline) {
      setValue(`R$ ${estimatedSum.toLocaleString("pt-BR")}`);
    }
  }, [linkedProductIds, estimatedSum, isEditingInline]);

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (customTags.includes(newTagInput.trim())) {
      toast.error("Tag já adicionada.");
      return;
    }
    setCustomTags((prev) => [...prev, newTagInput.trim()]);
    setNewTagInput("");
    toast.success("Nova tag adicionada!");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tagToRemove));
    toast.info("Tag removida.");
  };

  const handleConvertLead = () => {
    const lastStage = stagesDef[stagesDef.length - 1];
    updateLead(lead.id, { stageId: lastStage?.id ?? "5", status: "Fechado" });
    toast.success(`Lead ${leadName} convertido para Cliente Fechado!`);
    setAlterationLogs((prev) => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: "Lead convertido em Cliente Ativo", time: "Agora" },
      ...prev,
    ]);
  };

  const getFormattedActivityDate = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = timeStr.split(":").map(Number);
      const selectedDate = new Date(year, month - 1, day, hours, minutes);
      const today = new Date();
      const isToday =
        selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear();
      if (isToday) return `Hoje, ${timeStr}`;
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return `${selectedDate.getDate()} ${months[selectedDate.getMonth()]} às ${timeStr}`;
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  const handleRegisterActivity = () => {
    if (!activityDesc.trim()) {
      setActivityError("A descrição detalhada da atividade é obrigatória.");
      toast.error("Insira uma descrição para registrar a atividade!");
      return;
    }
    const titlesMap = {
      Ligação: "Ligação Telefônica realizada",
      "E-mail": "E-mail Comercial enviado",
      Reunião: "Apresentação/Reunião executada",
      Outro: "Observação Geral do Consultor",
    };
    const finalTitle = activityTitle.trim() || titlesMap[activityType];
    const finalDate = getFormattedActivityDate(activityDate, activityTime);

    addLeadActivity(lead.id, activityType, finalTitle, activityDesc, seller || "Sistema", finalDate, selectedFiles.length > 0 ? selectedFiles : undefined);

    setAlterationLogs((prev) => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: `Registrou atividade: ${finalTitle}`, time: "Agora" },
      ...prev,
    ]);

    setActivityDesc("");
    setActivityTitle("");
    setActivityError("");
    setSelectedFiles([]);
    toast.success("Histórico comercial atualizado com sucesso!");
  };

  const handleSaveAll = () => {
    updateLead(lead.id, { name: leadName, company: companyName, phone, email, title, value, seller, priority, customFields: customFieldsState });
    setAlterationLogs((prev) => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: "Informações do lead atualizadas", time: "Agora" },
      ...prev,
    ]);
    toast.success("Alterações salvas com sucesso!");
    setIsEditingInline(false);
  };

  const handleConfirmDelete = () => {
    deleteLead(lead.id);
    toast.success("Lead removido do sistema.");
    onClose();
  };

  const handleSendQuickMessage = () => {
    if (!quickMessageText.trim()) return;
    setChatLog((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "me", text: quickMessageText, time: "Agora", channel: chatChannel },
    ]);
    setQuickMessageText("");
    toast.success(`Mensagem enviada via simulador de ${chatChannel.toUpperCase()}`);
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "💡 [IA Resposta Sugerida] Gostaria de agendar uma demonstração completa para amanhã às 14:00 ou prefere às 16:30?",
          time: "Agora mesmo",
          channel: chatChannel,
        },
      ]);
    }, 1000);
  };

  const applyMessageTemplate = (tpl: string) => {
    const formatted = tpl
      .replace("{client}", leadName)
      .replace("{company}", companyName)
      .replace("{seller}", seller || "Consultor");
    setQuickMessageText(formatted);
    toast.info("Template aplicado! Você pode editar antes de simular o envio.");
  };

  const toggleProductLink = (prodId: string) => {
    if (linkedProductIds.includes(prodId)) {
      setLinkedProductIds((prev) => prev.filter((id) => id !== prodId));
      toast.info("Produto removido do orçamento do lead.");
    } else {
      setLinkedProductIds((prev) => [...prev, prodId]);
      toast.success("Produto adicionado ao orçamento!");
    }
  };

  const currentStageIndex = stagesDef.findIndex((s) => s.id === lead?.stageId);
  const progressPercent =
    currentStageIndex !== -1 && stagesDef.length > 0 ? ((currentStageIndex + 1) / stagesDef.length) * 100 : 10;

  const tempColors = {
    Quente: "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold",
    Morno: "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold",
    Frio: "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold",
  };

  return {
    activeTab, setActiveTab,
    reportContextOverride, setReportContextOverride,
    isConfirmDeleteOpen, setIsConfirmDeleteOpen,
    customFieldsState, setCustomFieldsState,
    activityType, setActivityType,
    activityDesc, setActivityDesc,
    activityTitle, setActivityTitle,
    activityDate, setActivityDate,
    activityTime, setActivityTime,
    activityError, setActivityError,
    selectedFiles, setSelectedFiles,
    chatChannel, setChatChannel,
    quickMessageText, setQuickMessageText,
    chatLog, setChatLog,
    availableProducts,
    linkedProductIds, setLinkedProductIds,
    isEditingInline, setIsEditingInline,
    leadName, setLeadName,
    companyName, setCompanyName,
    phone, setPhone,
    email, setEmail,
    title, setTitle,
    value, setValue,
    seller, setSeller,
    priority, setPriority,
    score, setScore,
    temperature, setTemperature,
    probability, setProbability,
    slaStatus,
    timeIdle,
    customTags, setCustomTags,
    newTagInput, setNewTagInput,
    alterationLogs, setAlterationLogs,
    estimatedSum,
    handleAddTag,
    handleRemoveTag,
    handleConvertLead,
    handleRegisterActivity,
    handleSaveAll,
    handleConfirmDelete,
    handleSendQuickMessage,
    applyMessageTemplate,
    toggleProductLink,
    stagesDef,
    progressPercent,
    tempColors,
    customLeadFields,
  };
}
