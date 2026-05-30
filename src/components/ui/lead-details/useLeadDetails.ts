import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";

export function useLeadDetails(lead: any, onClose: () => void) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [reportContextOverride, setReportContextOverride] = useState<'auto' | 'normal' | 'educacao' | 'posvenda'>('auto');
  const { leadActivities, addLeadActivity, updateLead, deleteLead, customLeadFields } = useData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customFieldsState, setCustomFieldsState] = useState<Record<string, string | number>>({});
  
  // Tab timeline states
  const [activityType, setActivityType] = useState<'Ligação' | 'E-mail' | 'Reunião' | 'Outro'>('Ligação');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDate, setActivityDate] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
  });
  const [activityTime, setActivityTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [activityError, setActivityError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; }[]>([]);

  // Direct chat simulation states
  const [chatChannel, setChatChannel] = useState<'whatsapp' | 'email' | 'instagram'>('whatsapp');
  const [quickMessageText, setQuickMessageText] = useState("");
  const [chatLog, setChatLog] = useState<Array<{ id: string; sender: 'me' | 'client' | 'ai'; text: string; time: string; channel: string }>>([
    { id: '1', sender: 'client', text: "Olá! Vi o anúncio de vocês e queria saber mais sobre a Consultoria Enterprise e as licenças SaaS.", time: "Hoje, 10:25", channel: "whatsapp" },
    { id: '2', sender: 'ai', text: "Olá! Seja bem-vindo à Axis. Nossos especialistas já receberam seu contato. Em instantes, nosso consultor irá te chamar. Aqui estão algumas opções de planos: ...", time: "Hoje, 10:26", channel: "whatsapp" }
  ]);

  // Product linkage states
  const [availableProducts] = useState([
    { id: 'p1', name: "Consultoria Enterprise", price: 4500, recurrence: true, category: "Serviços" },
    { id: 'p2', name: "Setup PRO", price: 2000, recurrence: false, category: "Implantação" },
    { id: 'p3', name: "Licença Usuário Adicional", price: 150, recurrence: true, category: "Software" },
    { id: 'p4', name: "Treinamento Presencial", price: 3500, recurrence: false, category: "Serviços" }
  ]);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(['p1', 'p2']);

  // Custom metadata editable state
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [seller, setSeller] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');

  // Elite CRM states
  const [score, setScore] = useState(85);
  const [temperature, setTemperature] = useState<'Quente' | 'Morno' | 'Frio'>('Quente');
  const [probability, setProbability] = useState(75);
  const [slaStatus] = useState<'Em Dia' | 'Crítico' | 'Atrasado'>('Em Dia');
  const [timeIdle] = useState('1 dia, 4 horas');
  const [customTags, setCustomTags] = useState<string[]>(["Inbound", "Enterprise", "Alta Conversão"]);
  const [newTagInput, setNewTagInput] = useState("");

  // Static / simulated log of alterations
  const [alterationLogs, setAlterationLogs] = useState([
    { id: 'l1', author: "Sistema", desc: "Lead importado via formulário de contato do site principal", time: "18 Mai, 09:00" },
    { id: 'l2', author: "Distribuição Inteligente", desc: "Atribuído automaticamente ao consultor Carlos Eduardo Mendes", time: "18 Mai, 09:02" },
    { id: 'l3', author: "Carlos Eduardo Mendes", desc: "Etapa alterada de 'Prospecção' para 'Qualificação'", time: "19 Mai, 11:30" },
    { id: 'l4', author: "Sistema (Automação)", desc: "Status de SLA analisado: Em dia com meta de resposta rápida", time: "Hoje, 10:30" }
  ]);

  // Sync state when lead changes
  useEffect(() => {
    if (lead) {
      setLeadName(lead.name || '');
      setCompanyName(lead.company || '');
      setPhone(lead.phone || '');
      setEmail(lead.email || '');
      setTitle(lead.title || '');
      setValue(lead.value || '');
      setSeller(lead.seller || '');
      setPriority(lead.priority || 'Média');
      setCustomFieldsState(lead.customFields || {});

      const computedScore = lead.id === 't1' ? 95 : lead.id === 't2' ? 88 : lead.id === 't3' ? 62 : 45;
      const computedTemp = computedScore > 80 ? 'Quente' : computedScore > 50 ? 'Morno' : 'Frio';
      const computedProb = computedScore > 80 ? 80 : computedScore > 50 ? 50 : 25;
      setScore(computedScore);
      setTemperature(computedTemp);
      setProbability(computedProb);
    }
  }, [lead]);

  // Dynamic calculations for Estimated Sum of Linked Products
  const estimatedSum = useMemo(() => {
    return linkedProductIds.reduce((sum, id) => {
      const p = availableProducts.find(prod => prod.id === id);
      return sum + (p ? p.price : 0);
    }, 0);
  }, [linkedProductIds, availableProducts]);

  // Sync the estimatedSum to value input
  useEffect(() => {
    if (linkedProductIds.length > 0 && isEditingInline) {
      setValue(`R$ ${estimatedSum.toLocaleString('pt-BR')}`);
    }
  }, [linkedProductIds, estimatedSum, isEditingInline]);

  // Add tag
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (customTags.includes(newTagInput.trim())) {
      toast.error("Tag já adicionada.");
      return;
    }
    setCustomTags(prev => [...prev, newTagInput.trim()]);
    setNewTagInput("");
    toast.success("Nova tag adicionada!");
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(prev => prev.filter(t => t !== tagToRemove));
    toast.info("Tag removida.");
  };

  // Convert/Issue Contract quick simulation
  const handleConvertLead = () => {
    toast.success(`Convertendo Lead ${leadName} para Cliente Fechado!`);
    updateLead(lead.id, { stageId: '5', status: 'Fechado' });
    
    // Add log
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "Lead convertido com sucesso em Cliente Ativo via dashboard de Atallhos Inteligentes", time: "Agora" },
      ...prev
    ]);
  };

  // Form helpers
  const getFormattedActivityDate = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const selectedDate = new Date(year, month - 1, day, hours, minutes);
      const today = new Date();
      
      const isToday = selectedDate.getDate() === today.getDate() &&
                      selectedDate.getMonth() === today.getMonth() &&
                      selectedDate.getFullYear() === today.getFullYear();
                      
      if (isToday) {
        return `Hoje, ${timeStr}`;
      } else {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${selectedDate.getDate()} ${months[selectedDate.getMonth()]} às ${timeStr}`;
      }
    } catch {
      return `Gravado em ${dateStr} ${timeStr}`;
    }
  };

  const handleRegisterActivity = () => {
    if (!activityDesc.trim()) {
      setActivityError("A descrição detalhada da atividade é obrigatória.");
      toast.error("Erro: Insira uma descrição para registrar a atividade!");
      return;
    }

    const titlesMap = {
      'Ligação': 'Ligação Telefônica realizada',
      'E-mail': 'E-mail Comercial enviado',
      'Reunião': 'Apresentação/Reunião executada',
      'Outro': 'Observação Geral do Consultor'
    };
    
    const finalTitle = activityTitle.trim() || titlesMap[activityType];
    const finalDate = getFormattedActivityDate(activityDate, activityTime);

    addLeadActivity(
      lead.id,
      activityType,
      finalTitle,
      activityDesc,
      seller || "Consultor G-Tech",
      finalDate,
      selectedFiles.length > 0 ? selectedFiles : undefined
    );
    
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: seller || "Consultor G-Tech", desc: `Registrou nova atividade comercial: ${finalTitle}`, time: "Agora" },
      ...prev
    ]);

    setActivityDesc('');
    setActivityTitle('');
    setActivityError('');
    setSelectedFiles([]);
    toast.success('Histórico comercial atualizado com sucesso!');
  };

  const handleSaveAll = () => {
    updateLead(lead.id, {
      name: leadName,
      company: companyName,
      phone,
      email,
      title,
      value,
      seller,
      priority,
      customFields: customFieldsState,
    });
    setAlterationLogs(prev => [
      { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "Informações principais do lead atualizadas via edição inline", time: "Agora" },
      ...prev
    ]);
    toast.success('Alterações salvas com sucesso!');
    setIsEditingInline(false);
  };

  const handleConfirmDelete = () => {
    deleteLead(lead.id);
    toast.success('Lead removido do system.');
    onClose();
  };

  const handleSendQuickMessage = () => {
    if (!quickMessageText.trim()) return;
    const newMsgObj = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: quickMessageText,
      time: "Agora",
      channel: chatChannel
    };
    setChatLog(prev => [...prev, newMsgObj]);
    setQuickMessageText("");
    toast.success(`Mensagem enviada via simulador de ${chatChannel.toUpperCase()}`);

    // AI automatic response suggestion simulation
    setTimeout(() => {
      setChatLog(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "💡 [IA Resposta Sugerida] Gostaria de agendar uma demonstração completa para amanhã às 14:00 ou prefere às 16:30?",
        time: "Agora mesmo",
        channel: chatChannel
      }]);
    }, 1000);
  };

  // Quick message template inject customizer
  const applyMessageTemplate = (tpl: string) => {
    const formatted = tpl
      .replace("{client}", leadName)
      .replace("{company}", companyName)
      .replace("{seller}", seller || "Carlos");
    setQuickMessageText(formatted);
    toast.info("Template aplicado! Você pode editar antes de simular o envio.");
  };

  // Toggle products
  const toggleProductLink = (prodId: string) => {
    if (linkedProductIds.includes(prodId)) {
      setLinkedProductIds(prev => prev.filter(id => id !== prodId));
      toast.info("Produto removido do orçamento do lead.");
    } else {
      setLinkedProductIds(prev => [...prev, prodId]);
      toast.success("Produto adicionado ao orçamento!");
    }
  };

  const stagesDef = [
    { id: '1', name: "Prospecção", status: 'Novo' },
    { id: '2', name: "Qualificação", status: 'Qualificado' },
    { id: '3', name: "Apresentação", status: 'Em Negociação' },
    { id: '4', name: "Negociação", status: 'Em Negociação' },
    { id: '5', name: "Fechamento", status: 'Fechado' },
  ];

  const currentStageIndex = stagesDef.findIndex(s => s.id === lead?.stageId);
  const progressPercent = currentStageIndex !== -1 ? ((currentStageIndex + 1) / stagesDef.length) * 100 : 20;

  const tempColors = {
    Quente: "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold",
    Morno: "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold",
    Frio: "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
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
    customLeadFields
  };
}
