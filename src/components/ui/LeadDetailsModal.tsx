import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Card } from "./card";
import { ConfirmModal } from "./ConfirmModal";
import { 
  Phone, Edit, Trash2, Plus, Star, Copy, Trophy, ThumbsDown, 
  Flame, PhoneOff, Mail, Calendar, MessageSquare, Trash, 
  Paperclip, FileText, Check, Sparkles, Brain, Clock, ShieldCheck, 
  ArrowRight, ShieldAlert, BadgeCent, CheckCircle2, Send, Tag, 
  User, Building2, Landmark, AlertTriangle, RefreshCw, FileCheck
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";

export function LeadDetailsModal({ isOpen, onClose, lead }: { isOpen: boolean, onClose: () => void, lead: any }) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [reportContextOverride, setReportContextOverride] = useState<'auto' | 'normal' | 'educacao' | 'posvenda'>('auto');
  const { leadActivities, addLeadActivity, updateLead, deleteLead, tasks, addTask, customLeadFields } = useData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customFieldsState, setCustomFieldsState] = useState<Record<string, string | number>>(lead?.customFields || {});
  
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
  const [availableProducts, setAvailableProducts] = useState([
    { id: 'p1', name: "Consultoria Enterprise", price: 4500, recurrence: true, category: "Serviços" },
    { id: 'p2', name: "Setup PRO", price: 2000, recurrence: false, category: "Implantação" },
    { id: 'p3', name: "Licença Usuário Adicional", price: 150, recurrence: true, category: "Software" },
    { id: 'p4', name: "Treinamento Presencial", price: 3500, recurrence: false, category: "Serviços" }
  ]);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(['p1', 'p2']);

  // Custom metadata editable state (persistent inside standard updateLead)
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [seller, setSeller] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');

  // Elite CRM states (dynamic simulation)
  const [score, setScore] = useState(85);
  const [temperature, setTemperature] = useState<'Quente' | 'Morno' | 'Frio'>('Quente');
  const [probability, setProbability] = useState(75);
  const [slaStatus, setSlaStatus] = useState<'Em Dia' | 'Crítico' | 'Atrasado'>('Em Dia');
  const [timeIdle, setTimeIdle] = useState('1 dia, 4 horas');
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

      // Random generate scores and temperatures to give different feel per lead
      const computedScore = lead.id === 't1' ? 95 : lead.id === 't2' ? 88 : lead.id === 't3' ? 62 : 45;
      const computedTemp = computedScore > 80 ? 'Quente' : computedScore > 50 ? 'Morno' : 'Frio';
      const computedProb = computedScore > 80 ? 80 : computedScore > 50 ? 50 : 25;
      setScore(computedScore);
      setTemperature(computedTemp);
      setProbability(computedProb);
      setSlaStatus(lead.status === 'Atrasado' ? 'Atrasado' : computedScore > 85 ? 'Em Dia' : 'Crítico');
      setTimeIdle(lead.id === 't1' ? '2 horas' : lead.id === 't3' ? '4 dias' : '1 dia, 8 horas');
      
      const computedTags = lead.id === 't1' ? ["Inbound", "SaaS", "Alta Prioridade"] : ["Outbound", "Consultoria"];
      setCustomTags(computedTags);
    }
  }, [lead]);

  // Calculate estimated budget
  const estimatedSum = availableProducts
    .filter(p => linkedProductIds.includes(p.id))
    .reduce((acc, current) => acc + current.price, 0);

  // Auto synchronise the primary value from calculation
  useEffect(() => {
    if (linkedProductIds.length > 0) {
      setValue(`R$ ${estimatedSum.toLocaleString('pt-BR')}`);
    }
  }, [linkedProductIds]);

  if (!lead) return null;

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
        return `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}, ${timeStr}`;
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
    toast.success('Lead removido do sistema.');
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

  const currentStageIndex = stagesDef.findIndex(s => s.id === lead.stageId);
  const progressPercent = currentStageIndex !== -1 ? ((currentStageIndex + 1) / stagesDef.length) * 100 : 20;

  // Custom visual states for Temperature
  const tempColors = {
    Quente: "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold",
    Morno: "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold",
    Frio: "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
  };

  // Header quick win/loss status button bar
  const headerActionPill = (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => {
          updateLead(lead.id, { stageId: '5', status: 'Fechado' });
          toast.success('Parabéns! Lead fechado com status GANHO! 🏆');
          setAlterationLogs(prev => [
            { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "MARCOU COMO GANHO - Negócio concluído", time: "Agora" },
            ...prev
          ]);
        }}
        className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all"
      >
        <Trophy className="w-4 h-4 animate-bounce" /> Ganho
      </Button>
      <Button 
        variant="outline"
        onClick={() => {
          updateLead(lead.id, { status: 'Perdido' });
          toast.warning('Negócio marcado como Perdido. Fica para a próxima.');
          setAlterationLogs(prev => [
            { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "MARCOU COMO PERDIDO - Motivo: Preço/timing do cliente", time: "Agora" },
            ...prev
          ]);
        }}
        className="text-rose-400 border-rose-400/20 bg-rose-400/10 hover:bg-rose-400/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all"
      >
        <ThumbsDown className="w-4 h-4" /> Perdido
      </Button>
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={headerActionPill}
        maxWidth="max-w-xl"
        position="right"
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="border-white/5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 gap-1.5 h-10 px-4"
            >
              <Trash className="w-4 h-4" /> Excluir Lead
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="text-slate-400 font-bold px-4">Fechar</Button>
              {isEditingInline ? (
                <Button onClick={handleSaveAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6">Salvar</Button>
              ) : (
                <Button onClick={() => setIsEditingInline(true)} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6">Editar</Button>
              )}
            </div>
          </div>
        }
      >
        {/* Dynamic Funnel Stages Navigation */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-3 scrollbar-none shrink-0 border-b border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mr-1.5">Mudar Etapa Funil:</span>
          {stagesDef.map(stg => {
            const isActive = lead.stageId === stg.id;
            return (
              <button 
                key={stg.id} 
                onClick={() => {
                  updateLead(lead.id, { stageId: stg.id, status: stg.status });
                  toast.success(`Encaminhado no funil: ${stg.name}`);
                  setAlterationLogs(prev => [
                    { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: `Moveu o lead para a etapa de '${stg.name}'`, time: "Agora" },
                    ...prev
                  ]);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isActive 
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20' 
                    : 'bg-[#111827] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {stg.name}
              </button>
            );
          })}
        </div>

        {/* Progress Bar indicator */}
        <div className="h-1 w-full bg-slate-800 rounded-full mb-6 overflow-hidden shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic Section Grid */}
        <div className="grid grid-cols-1 gap-6 items-start">
          
          {/* PROFILE CARD & FAST ACTIONS SECTION */}
          <div className="space-y-6">
            
            {/* Header Block with Avatar, Score & Temperature indicators */}
            <Card className="p-5 border-white/10 bg-[#111827]/70 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${tempColors[temperature]}`}>
                  🔥 {temperature}
                </span>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                  slaStatus === 'Em Dia' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  slaStatus === 'Atendimento Crítico' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  🕔 SLA: {slaStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 py-2 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-black font-mono">
                  {(companyName || leadName || "LD").substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white leading-tight truncate">
                      {companyName || leadName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Contato: {leadName}</p>
                  <p className="text-xs font-semibold text-emerald-400 mt-1 font-mono">Orçamento: {value || 'R$ 0'}</p>
                </div>
              </div>

              {/* Advanced Indicators (Score, Probability & Idle time) */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-white/5">
                <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lead Score</span>
                  <div className="flex items-center gap-1 mt-1 text-cyan-400 font-black text-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{score}</span><span className="text-[9px] text-slate-600">/100</span>
                  </div>
                </div>
                <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Conversão %</span>
                  <div className="flex items-center gap-1 mt-1 text-emerald-400 font-mono font-black text-sm">
                    <span>{probability}%</span>
                  </div>
                </div>
                <div className="bg-[#0B1120] p-2.5 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tempo Parado</span>
                  <span className="text-[10px] text-slate-300 font-bold mt-1 text-center truncate w-full">{timeIdle}</span>
                </div>
              </div>
            </Card>

            {/* Quick Interactive Actions Panel */}
            <Card className="p-4 border-white/10 bg-[#111827]/70 backdrop-blur-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] mb-3">Atalhos e Ações Rápidas</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const numberOnly = phone.replace(/\D/g, '');
                    window.open(`https://wa.me/55${numberOnly}`, '_blank');
                    toast.success("Abriu WhatsApp para canal direto");
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" /> Abrir WhatsApp
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://instagram.com`, '_blank');
                    toast.success("Redirecionando para Direct do Instagram");
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4 shrink-0" /> Instagram Direct
                </button>
                <button 
                  onClick={() => {
                    addLeadActivity(lead.id, 'Ligação', 'Tentativa de Ligação Direta', 'Executou discagem virtual e enviou notificação do contato.', seller || 'Carlos');
                    toast.success("Iniciando discagem VoIP integrada...");
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4 shrink-0" /> Ligação VoIP
                </button>
                <button 
                  onClick={() => {
                    window.location.href = `mailto:${email}`;
                    toast.success("Direcionando para e-mail profissional");
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Mail className="w-4 h-4 shrink-0" /> Enviar E-mail
                </button>
                <button 
                  onClick={() => {
                    toast.success("Contrato G-Tech gerado! Enviado para o e-mail do cliente.");
                    setAlterationLogs(prev => [
                      { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: "Contrato de Prestação de Serviços criado e enviado via DocuSign", time: "Agora" },
                      ...prev
                    ]);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <FileCheck className="w-4 h-4 shrink-0" /> Criar Contrato
                </button>
                <button 
                  onClick={handleConvertLead}
                  className="flex items-center gap-2 px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Trophy className="w-4 h-4 shrink-0" /> Converter Lead
                </button>
              </div>
            </Card>

            {/* Smart AI suggested next action */}
            <Card className="p-4 border-cyan-500/20 bg-cyan-950/20 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-2 right-2 animate-pulse flex items-center gap-1.5 bg-[#06B6D4]/20 px-2 py-0.5 rounded-full border border-[#06B6D4]/30 text-[#06B6D4] text-[8px] font-black uppercase">
                <Sparkles className="w-2.5 h-2.5" /> IA Copilot
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Recomendação Axis CoPilot
              </h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed mt-2.5">
                &ldquo;O lead de pontuação <strong className="text-cyan-300">{score}</strong> demonstrou alto interesse em produtos recorrentes. Sugiro enviar o template de proposta <strong className="text-white">Consultoria Enterprise + Licença Usuário</strong> hoje mesmo para antecipar o fechamento.&rdquo;
              </p>
              <div className="mt-3.5 bg-[#0B1120]/45 p-2 rounded-lg border border-[#06B6D4]/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Sugestão:</span>
                <button 
                  onClick={() => {
                    setActiveTab('whatsapp');
                    setChatChannel('whatsapp');
                    applyMessageTemplate("Olá {client}! Preparei a proposta oficial para a {company}. Inclui a {seller} no loop. Segue anexo com nosso cronograma.");
                  }}
                  className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  Aplicar Proposta <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>

            {/* Editable Attributes Panel */}
            <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados Principais</h4>
                <button 
                  onClick={() => setIsEditingInline(!isEditingInline)}
                  className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> {isEditingInline ? 'Bloquear' : 'Editar Inline'}
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-500 font-bold block">Empresa/Lead</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-semibold mt-0.5 block">{companyName || 'Nenhuma'}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 font-bold block">Contato Principal</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-semibold mt-0.5 block">{leadName}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 font-bold block">CNPJ</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      maxLength={18}
                      value={lead.cnpj || ''}
                      onChange={(e) => {
                        import('../../lib/utils').then(({ formatCNPJ }) => {
                          const val = formatCNPJ(e.target.value);
                          updateLead(lead.id, { cnpj: val });
                        });
                      }}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-mono mt-0.5 block">{lead.cnpj || '-'}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 font-bold block">E-mail</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-mono mt-0.5 block">{email || '-'}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 font-bold block">Telefone</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-mono mt-0.5 block">{phone || '-'}</span>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 font-bold block">Iniciativa / Produto</label>
                  {isEditingInline ? (
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                    />
                  ) : (
                    <span className="text-white font-medium mt-0.5 block">{title || '-'}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 font-bold block">Responsável</label>
                    {isEditingInline ? (
                      <select 
                        value={seller} 
                        onChange={(e) => setSeller(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-white mt-1 text-xs"
                      >
                        <option value="">Não Atribuído</option>
                        <option value="Carlos Eduardo Mendes">Carlos Eduardo Mendes</option>
                        <option value="Ana Silva">Ana Silva</option>
                        <option value="Roberto Ramos">Roberto Ramos</option>
                        <option value="Juliana Costa">Juliana Costa</option>
                      </select>
                    ) : (
                      <span className="text-[#06B6D4] font-bold mt-0.5 block">{seller || 'Não Atribuído'}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block">Prioridade</label>
                    {isEditingInline ? (
                      <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-1.5 text-white mt-1 text-xs"
                      >
                        <option value="Alta">Alta</option>
                        <option value="Média">Média</option>
                        <option value="Baixa">Baixa</option>
                      </select>
                    ) : (
                      <span className={`font-bold mt-0.5 block ${
                        priority === 'Alta' ? 'text-rose-400' : priority === 'Média' ? 'text-amber-400' : 'text-slate-400'
                      }`}>{priority}</span>
                    )}
                  </div>
                </div>
              </div>

              {customLeadFields.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Campos Personalizados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {customLeadFields.map((field) => (
                      <div key={field.id}>
                        <label className="text-slate-500 font-bold block">{field.name}</label>
                        {isEditingInline ? (
                          <input 
                            type={field.type === 'Data' ? 'date' : field.type === 'Número' ? 'number' : 'text'}
                            value={customFieldsState[field.id] || ''}
                            onChange={(e) => setCustomFieldsState(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-white mt-1 text-xs" 
                          />
                        ) : (
                          <span className="text-white font-medium mt-0.5 block">{lead.customFields?.[field.id] || '-'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Custom tags list */}
            <Card className="p-4 border-white/10 bg-[#111827]/70 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Tags Corporativas</h4>
              <div className="flex flex-wrap gap-1.5">
                {customTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="group flex items-center gap-1.5 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                    title="Clique para excluir tag"
                  >
                    <Tag className="w-3 h-3" /> {tag}
                    <span className="text-[8px] font-black opacity-0 group-hover:opacity-100">&times;</span>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="Nova tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <Button size="sm" onClick={handleAddTag} className="bg-slate-800 text-white hover:bg-slate-750 px-3 font-bold block shrink-0">+</Button>
              </div>
            </Card>

          </div>

          {/* INTERACTIVE FEATURE TABS CONSOLE SECTION */}
          <div className="space-y-6">
            
            {/* Elegant Tab Headers */}
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-none shrink-0 pb-1.5">
              {[
                { id: 'timeline', label: 'TIMELINE & HISTÓRICO', icon: Calendar },
                { id: 'sdrReport', label: '⚡ RELATÓRIO IA CLOSER', icon: Brain },
                { id: 'whatsapp', label: 'DIRECT MESSAGING', icon: MessageSquare },
                { id: 'products', label: 'METAS & PRODUTOS', icon: BadgeCent },
                { id: 'logs', label: 'RBAC AUDITOR & LOGS', icon: ShieldCheck }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-2.5 pt-1.5 px-3 font-bold text-[10px] tracking-widest border-b-2 transition-all shrink-0 whitespace-nowrap ${
                      isActive 
                        ? 'border-[#06B6D4] text-[#06B6D4]' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Advanced Form for Adding Interaction */}
                <Card className="p-4 border-white/5 bg-[#0B1120]/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Registrar Nova Interação</h4>
                  </div>

                  {/* Channel selectors */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { type: 'Ligação', label: 'Telefonou', color: 'text-cyan-400 bg-cyan-450/10' },
                      { type: 'E-mail', label: 'E-mail', color: 'text-amber-400 bg-amber-450/10' },
                      { type: 'Reunião', label: 'Reunião', color: 'text-purple-400 bg-purple-450/10' },
                      { type: 'Outro', label: 'Nota Interna', color: 'text-slate-400 bg-slate-450/10' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setActivityType(item.type as any)}
                        className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border text-center transition-colors cursor-pointer ${
                          activityType === item.type 
                            ? `${item.color} border-[#06B6D4]/30 shadow-inner scale-[1.01]` 
                            : 'bg-[#111827] border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom fields (Title & datetime) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Título curto (Ex: Follow-up inicial)"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      className="bg-[#111827] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="date" 
                        value={activityDate}
                        onChange={(e) => setActivityDate(e.target.value)}
                        className="bg-[#111827] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
                      />
                      <input 
                        type="time" 
                        value={activityTime}
                        onChange={(e) => setActivityTime(e.target.value)}
                        className="bg-[#111827] border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Descriptive textarea */}
                  <div className="space-y-1">
                    <textarea 
                      placeholder="Relate detalhadamente como correu o contato para que outros membros saibam..."
                      value={activityDesc}
                      rows={3}
                      onChange={(e) => {
                        setActivityDesc(e.target.value);
                        if (e.target.value) setActivityError('');
                      }}
                      className="w-full bg-[#111827] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-slate-650"
                    />
                    {activityError && <p className="text-[10.5px] text-rose-400 font-bold font-sans">⚠️ {activityError}</p>}
                  </div>

                  {/* File Simulator Uploader */}
                  <div className="relative border border-dashed border-white/10 hover:border-[#06B6D4]/30 rounded-xl bg-[#0B1120] p-4 text-center cursor-pointer transition-colors"
                       onClick={() => {
                         const demoDocs = [
                           { name: "Proposta_Plano_AxisEnterprise.pdf", size: "380 KB" },
                           { name: "Orcamento_GTech.xlsx", size: "120 KB" },
                           { name: "Cronograma_Execucao.docx", size: "450 KB" }
                         ];
                         const randomPick = demoDocs[Math.floor(Math.random() * demoDocs.length)];
                         if (!selectedFiles.some(f => f.name === randomPick.name)) {
                           setSelectedFiles(prev => [...prev, randomPick]);
                           toast.success(`Anexou rascunho com sucesso: ${randomPick.name}`);
                         }
                       }}>
                    <Paperclip className="w-5 h-5 mx-auto text-slate-500 mb-1" />
                    <p className="text-[11px] text-slate-400 font-bold">Simular Anexo de Documentos</p>
                    <p className="text-[9px] text-slate-500">Clique para anexar arquivo de proposta técnica fictícia em PDF / Excel</p>
                  </div>

                  {/* Attachment pills if exists */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedFiles.map((file, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-[#06B6D4] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {file.name} ({file.size})
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                          }} className="hover:text-red-400 font-bold ml-1 text-xs">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button onClick={handleRegisterActivity} className="bg-[#06B6D4] text-white hover:bg-cyan-600 font-bold shadow-lg shadow-cyan-500/10">
                      Registrar Atividade
                    </Button>
                  </div>
                </Card>

                {/* Main Activity Timeline */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Histórico Completo de Atividades</h4>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {leadActivities.filter(act => act.leadId === lead.id).length > 0 ? (
                      leadActivities.filter(act => act.leadId === lead.id).map((act) => {
                        const getIcon = () => {
                          const iconClass = "w-4 h-4 text-[#06B6D4]";
                          switch (act.type) {
                            case 'Ligação': return <Phone className={iconClass} />;
                            case 'E-mail': return <Mail className={iconClass} />;
                            case 'Reunião': return <Calendar className={iconClass} />;
                            default: return <MessageSquare className={iconClass} />;
                          }
                        };

                        return (
                          <div key={act.id} className="p-4 bg-[#0B1120] rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex gap-4">
                            <div className="w-9 h-9 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-xl flex items-center justify-center shrink-0">
                              {getIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-white">{act.title}</p>
                                <span className="text-[9.5px] text-slate-500 font-medium">{act.date}</span>
                              </div>
                              <p className="text-[9.5px] font-black text-cyan-400 uppercase mt-0.5">{act.seller || 'Consultor'}</p>
                              <p className="text-xs text-slate-300 mt-2 bg-white/[0.015] border border-white/[0.04] p-2.5 rounded-lg leading-relaxed">{act.description}</p>
                              
                              {/* Render attached files lists */}
                              {act.files && act.files.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1 border-t border-white/5 pt-2">
                                  {act.files.map((file: any, fIdx: number) => (
                                    <span key={fIdx} className="bg-white/5 border border-white/15 px-2 py-0.5 rounded text-[9.5px] font-mono text-slate-400 flex items-center gap-1">
                                      <FileText className="w-3.5 h-3.5 text-[#06B6D4]" />
                                      {file.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico Limpo</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Nenhum evento registrado. Insira uma nova ação comercial acima.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: DIRECT MESSAGING & QUICK CHAT TEMPLATES */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="p-4 border-white/10 bg-[#0B1120]/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Omnichannel Integrado</h4>
                    <div className="flex gap-2">
                      {['whatsapp', 'email', 'instagram'].map(ch => (
                        <button 
                          key={ch}
                          onClick={() => setChatChannel(ch as any)}
                          className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-md transition-colors ${
                            chatChannel === ch ? 'bg-cyan-500/15 text-[#06B6D4] font-bold border border-cyan-400/20' : 'bg-[#111827] text-slate-500'
                          }`}
                        >
                          {ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'E-mail' : 'Instagram'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messaging Live Simulator Sandbox */}
                  <div className="h-64 overflow-y-auto bg-[#111827] border border-white/5 rounded-2xl p-4 space-y-3">
                    {chatLog.filter(m => m.channel === chatChannel).map(msg => {
                      const isMe = msg.sender === 'me';
                      const isAi = msg.sender === 'ai';
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                            isMe ? 'bg-blue-600 text-white rounded-tr-none' : 
                            isAi ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 rounded-tl-none font-medium' :
                            'bg-[#0B1120] border border-white/5 text-slate-350 rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className="text-[8px] opacity-50 block mt-1 text-right">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat message composer */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={`Digite uma resposta para enviar via ${chatChannel.toUpperCase()}...`}
                      value={quickMessageText}
                      onChange={(e) => setQuickMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendQuickMessage()}
                      className="flex-1 bg-[#111827] border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <Button onClick={handleSendQuickMessage} className="bg-[#2563EB] text-white hover:bg-blue-600 px-4 font-bold shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Templates pre-sales templates shortcuts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Modelos de Resposta Rápida</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      { title: "Apresentação de Solução", text: "Olá {client}! Vi seu interesse na Consultoria Enterprise. Sou a(o) {seller}, consultor principal. Podemos agendar uma chamada rápida de 10 min amanhã?" },
                      { title: "SLA Follow-up (3 dias parado)", text: "Oi {client}, tudo bom? Estou reavaliando nosso cronograma de implantação da {company}. Conseguiram analisar nossa minuta?" },
                      { title: "Proposta Comercial Direta", text: "Prezado {client}, segue em anexo a proposta oficial do escopo de serviços contratado pela {company} no valor de {value}." },
                      { title: "Link de Agendamento Cal", text: "Para facilitar nosso alinhamento, {client}, segue meu link de agendamento: calendly.com/{seller}-axis" }
                    ].map((tpl, i) => (
                      <Card 
                        key={i} 
                        onClick={() => applyMessageTemplate(tpl.text)}
                        className="p-3 bg-[#0B1120] border-white/5 hover:border-cyan-500/20 rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
                      >
                        <h5 className="text-xs font-black text-[#06B6D4]">{tpl.title}</h5>
                        <p className="text-[10.5px] text-slate-400 truncate mt-1 leading-normal">{tpl.text.replace("{client}", leadName)}</p>
                        <span className="text-[8px] text-slate-500 block mt-1.5 uppercase font-bold">Injetar no editor &rarr;</span>
                      </Card>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: PRODUCTS BUDGET & COMMISSIONS */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="p-4 border-white/10 bg-[#0B1120]/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Estrutura de Orçamento & Produtos Vinculados</h4>
                    <span className="text-xs font-mono font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      Total: R$ {estimatedSum.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">Vincule serviços ou planos de SaaS diretamente para formalizar o orçamento comercial do lead:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                      {availableProducts.map(prod => {
                        const isLinked = linkedProductIds.includes(prod.id);
                        return (
                          <div 
                            key={prod.id}
                            onClick={() => toggleProductLink(prod.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isLinked 
                                ? 'bg-[#2563EB]/15 border-blue-500/60 text-white shadow-md' 
                                : 'bg-[#111827] border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold leading-snug">{prod.name}</p>
                              <span className="text-[9px] text-[#06B6D4] uppercase tracking-wider font-bold">{prod.category} {prod.recurrence && '(Recorrente/mês)'}</span>
                            </div>
                            <span className="text-xs font-mono font-black text-emerald-400">
                              R$ {prod.price.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profit Margin & Commission calculations simulator */}
                  <div className="bg-[#111827] p-4 rounded-2xl border border-white/5 space-y-3">
                    <h5 className="text-[10px] font-black uppercase text-[#06B6D4] tracking-wider">Detalhamento Financeiro & Comissionamento</h5>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span className="text-slate-500">Lucro Estimado (82%):</span>
                        <span className="text-emerald-400 font-bold">R$ {(estimatedSum * 0.82).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span className="text-slate-500">Custo Infra (18%):</span>
                        <span className="text-rose-400 font-bold">R$ {(estimatedSum * 0.18).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span className="text-slate-500">Comissão de Venda (2.5%):</span>
                        <span className="text-amber-400 font-bold">R$ {(estimatedSum * 0.025).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span className="text-slate-500">Consultor responsável:</span>
                        <span className="text-cyan-400 font-bold truncate max-w-[120px]">{seller || 'Carlos Eduardo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Proposal generator action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        toast.success("Documento em formato PDF gerado no servidor!");
                        setAlterationLogs(prev => [
                          { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: `Proposta comercial eletrônica criada de R$ ${estimatedSum.toLocaleString('pt-BR')}`, time: "Agora" },
                          ...prev
                        ]);
                      }}
                      className="flex-1 bg-slate-800 text-white hover:bg-slate-750 text-xs font-bold gap-1.5 h-10"
                    >
                      <FileText className="w-4 h-4" /> Visualizar PDF da Proposta
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB CONTENT: SDR IA REPORT BLUEPRINT FOR CLOSER */}
            {activeTab === 'sdrReport' && (() => {
              // Auto detect context
              const computedIsEdu = lead.company?.toLowerCase().includes("turma") || 
                                   lead.company?.toLowerCase().includes("curso") || 
                                   lead.company?.toLowerCase().includes("escola") || 
                                   lead.company?.toLowerCase().includes("inscrição") || 
                                   lead.company?.toLowerCase().includes("graduação") || 
                                   lead.company?.toLowerCase().includes("educação") || 
                                   lead.name?.toLowerCase().includes("educação") || 
                                   (lead.id === 'sdr1' || lead.id === 'sdr2') || false;

              const computedIsCS = lead.company?.toLowerCase().includes("licença") || 
                                  lead.company?.toLowerCase().includes("saas") || 
                                  lead.company?.toLowerCase().includes("contrato") || 
                                  lead.name?.toLowerCase().includes("suporte") || false;

              const activeMode = reportContextOverride === 'auto' 
                ? (computedIsEdu ? 'educacao' : computedIsCS ? 'posvenda' : 'normal')
                : reportContextOverride;

              const mockEducacao = {
                statusTurma: lead.id === 'sdr1' ? "CONFIRMADO NA TURMA" : "PENDENTE DE MATRÍCULA",
                classChoice: lead.id === 'sdr1' ? "Engenharia de Software (Sábado - Integração)" : "MBA Gestão Escolar (On-line EAD)",
                presenceInaugural: lead.id === 'sdr1' ? "Sim - Confirmou que participará" : "Pendente - Falta responder WhatsApp",
                onboardingGroup: lead.id === 'sdr1' ? "Sim - Adicionado no Discord" : "Não - Link enviado por WhatsApp",
                primaryAim: "Elevação profissional para assumir cargo de Staff Engineer ou Coordenador de Projetos.",
                blockersSolved: "Medo de não conciliar com o trabalho solucionado explicando acesso assíncrono.",
                playbook: "Destacar urgência! Ficam poucas vagas remanescentes para manter os bônus corporativos. Focar na mentoria ao vivo de networking.",
                nextStep: "Confirmar escolha definitiva do horário do laboratório prático por WhatsApp.",
                template: `Olá, ${lead.name}! Aqui é o consultor de admissão da Axis. Nossa IA mapeou que você já confirmou presença para a aula magna da turma de ${lead.id === 'sdr1' ? 'Engenharia de Software' : 'Gestão Escolar MBA'}. Vamos finalizar sua reserva oficial de vaga e liberar suas credenciais de acesso ao portal para você já iniciar suas aulas amanhã?`
              };

              const mockCS = {
                npsScore: lead.id === 'sdr1' ? "NPS 10/10 (Promotor)" : "NPS 7/10 (Morno)",
                activeUsers: lead.id === 'sdr1' ? "85% (Forte engajamento)" : "42% (Uso instável)",
                growthPotential: "Excelente. Cliente em fase de expansão de time comercial com abertura para 5 novas licenças.",
                criticalObjection: "Dúvidas no setup inicial com APIs de terceiros. Resolvido com consultoria express de 15 minutos.",
                playbook: "Parabenizar o cliente pelos ótimos KPIs com agentes inteligentes nos últimos 30 dias e oferecer o Upgrade para plano anual com 20% desc.",
                nextStep: "Agendar videochamada de alinhamento estratégico de CS de 15 minutos.",
                template: `Olá, ${lead.name}! Como estão os resultados comerciais aí na ${lead.company || 'sua empresa'}? Vi que seu time acelerou o SDR IA de forma incrível essa semana. Gostaríamos de marcar uma breve conversa de 15 minutos para fazer uma revisão estratégica de CS e apresentar novas automações exclusivas liberadas no seu plano. Qual o melhor horário amanhã?`
              };

              const mockNormal = {
                leadScore: lead.scoreIA || 85,
                cargo: "Diretor Comercial / Head de Operações",
                potencialComercial: "R$ 15.000 (Consultoria Enterprise + Licenças)",
                mainDores: "Baixo retorno em outbound, tempo de resposta a inbound lento (> 3 horas), vendedores perdidos em planilhas.",
                decididorStatus: "Sim, contato direto é o principal tomador de decisão técnica.",
                playbook: "Focar em ROI, automação de SLA de 5 minutos, e redução de churn de leads inativos. Demonstrar o painel SDR operando em tempo real.",
                nextStep: "Apresentar demonstração prática e enviar proposta de contratação de licenças.",
                template: `Olá, ${lead.name}! Tudo bem? Nossa IA inteligente de qualificação realizou a triagem na ${lead.company || 'sua empresa'} e identificou que vocês têm o fit exato para reduzir o tempo de primeiro contato a inbound de horas para minutos. Podemos marcar uma chamada rápida amanhã às 14h para apresentar a estrutura rodando com seus dados?`
              };

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <Card className="p-6 border-white/10 bg-[#0B1120]/80 space-y-6 relative overflow-hidden">
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    {/* Report Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Relatório Master SDR IA
                          </h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">MIA-6 Algorítmico Axis Engine</span>
                        </div>
                      </div>

                      {/* Selector and filters inside details view */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1 self-start sm:self-auto">
                        <span className="text-[9px] font-black uppercase text-slate-500 px-2 tracking-wider">Filtro Pipeline:</span>
                        {[
                          { id: 'auto', label: '🤖 Auto' },
                          { id: 'normal', label: '🌐 Sales' },
                          { id: 'educacao', label: '🎓 Edu' },
                          { id: 'posvenda', label: '🔄 CS' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setReportContextOverride(m.id as any)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                              activeMode === m.id || (m.id === 'auto' && reportContextOverride === 'auto')
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MODE WATERMARK BANNER */}
                    <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl relative z-10 select-none">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <div className="text-xs truncate">
                          <span className="text-slate-400 font-bold">Foco do Pipeline: </span>
                          <span className="text-white font-black uppercase font-mono tracking-widest">
                            {activeMode === 'educacao' ? '🎓 SDR Inteligente de Educação' : 
                             activeMode === 'posvenda' ? '🔄 SDR Pós-Venda (CS & Onboarding)' : 
                             '🌐 SDR Comercial Padrão (Corporate)'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2.5 py-1 rounded-md uppercase tracking-widest font-mono shrink-0">
                        Hand-off Closer Ativo
                      </span>
                    </div>

                    {/* DYNAMIC CONTENT PANELS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {/* Left Column: SDR qualification inputs */}
                      <div className="space-y-4">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] block border-b border-white/5 pb-1.5">Perfil & Percepção do Lead</span>
                          
                          {activeMode === 'educacao' ? (
                            <>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Turma Pretendida:</span>
                                <span className="text-white font-bold">{mockEducacao.classChoice}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Confirmou que vai na turma?</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${lead.id === 'sdr1' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {mockEducacao.statusTurma}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Presença Inaugural:</span>
                                <span className="text-white font-bold">{mockEducacao.presenceInaugural}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Grupo Alunos (Discord):</span>
                                <span className="text-white font-bold">{mockEducacao.onboardingGroup}</span>
                              </div>
                              <div className="text-xs pt-2">
                                <span className="text-slate-500 font-semibold block mb-1">Desejo de Carreira:</span>
                                <p className="text-slate-300 italic font-medium">"{mockEducacao.primaryAim}"</p>
                              </div>
                            </>
                          ) : activeMode === 'posvenda' ? (
                            <>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Status NPS:</span>
                                <span className="text-emerald-400 font-mono font-black">{mockCS.npsScore}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Engajamento Usuários:</span>
                                <span className="text-white font-bold">{mockCS.activeUsers}</span>
                              </div>
                              <div className="text-xs pt-2">
                                <span className="text-slate-500 font-semibold block mb-1">Oportunidade de Expansão:</span>
                                <p className="text-slate-300 italic font-medium">"{mockCS.growthPotential}"</p>
                              </div>
                              <div className="text-xs pt-1">
                                <span className="text-slate-500 font-semibold block mb-1">Objeção Crítica Mitigada:</span>
                                <p className="text-slate-300 italic font-medium">"{mockCS.criticalObjection}"</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Score IA Axis:</span>
                                <span className="text-blue-400 font-mono font-black">{mockNormal.leadScore}/100</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Cargo Contato:</span>
                                <span className="text-white font-bold">{mockNormal.cargo}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Potencial Estimado:</span>
                                <span className="text-emerald-400 font-bold">{mockNormal.potencialComercial}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Decididor Final?</span>
                                <span className="text-white font-bold">{mockNormal.decididorStatus}</span>
                              </div>
                              <div className="text-xs pt-2">
                                <span className="text-slate-500 font-semibold block mb-1">Principais Dores Comercial:</span>
                                <p className="text-slate-300 italic font-medium">"{mockNormal.mainDores}"</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Dynamic Playbook Closer & Automation */}
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block border-b border-blue-500/10 pb-1.5 font-sans">Estratégia e Playbook de Fechamento</span>
                          
                          <div className="text-xs space-y-3">
                            <div>
                              <span className="text-blue-400/80 font-bold block uppercase tracking-wide text-[9px] mb-1">Playbook do Closer:</span>
                              <p className="text-slate-200 leading-relaxed font-semibold">
                                {activeMode === 'educacao' ? mockEducacao.playbook : 
                                 activeMode === 'posvenda' ? mockCS.playbook : 
                                 mockNormal.playbook}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-blue-400/80 font-bold block uppercase tracking-wide text-[9px] mb-1">Próxima Ação Clave:</span>
                              <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate">
                                  {activeMode === 'educacao' ? mockEducacao.nextStep : 
                                   activeMode === 'posvenda' ? mockCS.nextStep : 
                                   mockNormal.nextStep}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ONE CLICK CLOSER COPYABLE MESSAGE */}
                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#EC4899] flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-pink-400" /> Mensagem de Abordagem Sugerida (1-Click)
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const txt = activeMode === 'educacao' ? mockEducacao.template : 
                                        activeMode === 'posvenda' ? mockCS.template : 
                                        mockNormal.template;
                            navigator.clipboard.writeText(txt);
                            toast.success("Mensagem copiada para a área de transferência!");
                          }}
                          className="bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] h-7 px-2.5 rounded-lg border border-white/10"
                        >
                          <Copy className="w-3 h-3 mr-1 inline" /> COPIAR SCRIPT
                        </Button>
                      </div>
                      <p className="text-xs text-slate-300 italic font-medium leading-relaxed bg-black/25 p-3 rounded-xl border border-white/5">
                        "{activeMode === 'educacao' ? mockEducacao.template : 
                          activeMode === 'posvenda' ? mockCS.template : 
                          mockNormal.template}"
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })()}

            {/* TAB CONTENT: AUDITOR TRACE & ALTERATION LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Card className="p-4 border-white/10 bg-[#0B1120]/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Auditoria de Operação (RBAC Trace)
                    </h4>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">LGPD Standard</span>
                  </div>

                  {/* Alterations lists */}
                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    {alterationLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Bullets */}
                        <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border border-[#06B6D4] bg-[#0B1120] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-white font-bold leading-normal">{log.desc}</p>
                            <span className="text-[10px] text-slate-500 mt-1 font-semibold block">Operador: <strong className="text-slate-400">{log.author}</strong></span>
                          </div>
                          <span className="text-[9px] text-[#06B6D4] font-mono whitespace-nowrap">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

          </div>

        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Lead Permanentemente?"
        message={`Você tem certeza ABSOLUTA de que deseja deletar o lead "${companyName || leadName}"? Todos os relatórios de alteração, e-mails de interações e produtos vinculados no faturamento serão destruídos.`}
      />
    </>
  );
}
