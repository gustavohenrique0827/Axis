import React, { useState, useEffect, useRef } from "react";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import { motion } from "motion/react";
import { 
  Search, MoreVertical, MessageCircle, Instagram, Mail, 
  ArrowLeft, Phone, Paperclip, Send, Camera, Mic,
  X, CheckCheck, Sparkles, User, Tag, Trash2, 
  ShieldCheck, Zap, ChevronRight, CheckCircle2,
  Clock, Info, Calendar, PlusCircle
} from "lucide-react";

// Web Audio API Sound Utility
const playIncomingMessageSound = () => {
  const soundEnabled = localStorage.getItem("axis_whatsapp_sound") !== "false";
  if (!soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch(e) {
    console.warn("AudioContext init failed", e);
  }
};

// Mock Data
type Channel = "WhatsApp" | "Instagram" | "Email";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  channel: Channel;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string;
  email?: string;
  tags?: string[];
  slaStatus?: string;
  purchaseHistory?: { item: string; date: string; value: string; }[];
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "read";
}

const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "João Silva", avatar: "JS", channel: "WhatsApp", lastMessage: "Obrigado! Aguardo o retorno.", time: "10:30", unread: 2, online: true, phone: "+55 11 98888-7777", tags: ["vip", "suporte"], slaStatus: "No Prazo - 2h restantes", purchaseHistory: [{ item: "Plano Premium Anual", date: "15/04/2026", value: "R$ 499,00" }] },
  { id: "2", name: "Maria Oliveira", avatar: "MO", channel: "Instagram", lastMessage: "Qual o valor do frete?", time: "09:15", unread: 1, online: false, phone: "+55 21 97777-6666", tags: ["vendas"], slaStatus: "Atrasado - Passou do SLA", purchaseHistory: [{ item: "Camiseta Básica", date: "10/05/2026", value: "R$ 89,90" }] },
  { id: "3", name: "Carlos Empresa", avatar: "CE", channel: "Email", lastMessage: "Segue em anexo a nota fiscal.", time: "Ontem", unread: 0, online: false, email: "carlos@empresa.com", tags: ["financeiro"], slaStatus: "Dentro do Prazo", purchaseHistory: [] },
  { id: "4", name: "Ana Souza", avatar: "AS", channel: "WhatsApp", lastMessage: "Sim, concordo.", time: "Ontem", unread: 0, online: true, phone: "+55 11 91111-2222", tags: ["contrato"] },
  { id: "5", name: "Marcos Pereira", avatar: "MP", channel: "WhatsApp", lastMessage: "Pode me enviar o catálogo?", time: "Segunda", unread: 5, online: false, phone: "+55 41 95555-5555", tags: ["lead"] },
];

const MOCK_CHAT_HISTORY: Record<string, Message[]> = {
  "1": [
    { id: "101", text: "Olá João, tudo bem? Seu pedido foi atualizado.", sender: "me", time: "10:00", status: "read" },
    { id: "102", text: "Excelente! Quando deve chegar?", sender: "them", time: "10:05" },
    { id: "103", text: "A previsão é até o final da semana.", sender: "me", time: "10:07", status: "read" },
    { id: "104", text: "Perfeito.", sender: "them", time: "10:29" },
    { id: "105", text: "Obrigado! Aguardo o retorno.", sender: "them", time: "10:30" }
  ],
  "2": [
    { id: "201", text: "Boa tarde, vi o anúncio na página.", sender: "them", time: "09:10" },
    { id: "202", text: "Boa tarde! Como posso ajudar?", sender: "me", time: "09:12", status: "read" },
    { id: "203", text: "Qual o valor do frete?", sender: "them", time: "09:15" },
  ]
};

const getChannelIcon = (channel: Channel, className = "w-4 h-4") => {
  switch (channel) {
    case "WhatsApp": return <MessageCircle className={`${className} text-emerald-400`} />;
    case "Instagram": return <Instagram className={`${className} text-pink-400`} />;
    case "Email": return <Mail className={`${className} text-blue-400`} />;
  }
};

type RightPanelState = "none" | "info" | "ai";

export default function Messaging() {
  const { leads, leadActivities, addLeadActivity } = useData();

  // Helper functions for unified view chronology
  const parseMessageTimeToTimestamp = (timeStr: string): number => {
    const now = new Date();
    if (timeStr === "Ontem") {
      return now.getTime() - 24 * 3600 * 1000;
    }
    if (["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].includes(timeStr)) {
      return now.getTime() - 3 * 24 * 3600 * 1000;
    }
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      return d.getTime();
    }
    return now.getTime();
  };

  const parseActivityDateToTimestamp = (dateStr: string): number => {
    const now = new Date();
    if (dateStr.startsWith("Hoje")) {
      const timePart = dateStr.split(",")[1]?.trim() || "12:00";
      const [h, m] = timePart.split(":").map(Number);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      return d.getTime();
    }
    if (dateStr.startsWith("Ontem")) {
      const timePart = dateStr.split(",")[1]?.trim() || "12:00";
      const [h, m] = timePart.split(":").map(Number);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, h, m);
      return d.getTime();
    }
    const match = dateStr.match(/(\d+)\s+(\w+),\s*(\d+):(\d+)/);
    if (match) {
      const day = parseInt(match[1]);
      const monthStr = match[2];
      const hour = parseInt(match[3]);
      const minute = parseInt(match[4]);
      
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mai': 4, 'Jun': 5,
        'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11,
        'Mgo': 7
      };
      const month = months[monthStr] || now.getMonth();
      const d = new Date(now.getFullYear(), month, day, hour, minute);
      return d.getTime();
    }
    return now.getTime() - 12 * 3600 * 1000;
  };

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem("axis_activeTab") || "Todas";
    }
    return "Todas";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return window.sessionStorage.getItem("axis_searchQuery") || "";
    }
    return "";
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("axis_activeTab", activeTab);
      window.sessionStorage.setItem("axis_searchQuery", searchQuery);
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [previousChat, setPreviousChat] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanelState>("none");
  const [previousPanel, setPreviousPanel] = useState<RightPanelState>("info");
  
  // Dynamic Webhooks Sync Contacts & Messages (pre-loaded with MOCKs)
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_CHAT_HISTORY);
  const [inputText, setInputText] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  
  // Sentiment classification with Axis Copilot AI
  const [sentiment, setSentiment] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");

  // Customer journey view mode: standard chat vs integrated unified crm activity timeline
  const [viewMode, setViewMode] = useState<"chat" | "unified">("chat");

  // Inline activity addition form
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActivityType, setNewActivityType] = useState<'Ligação' | 'E-mail' | 'Reunião' | 'Outro'>('Reunião');
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDesc, setNewActivityDesc] = useState("");

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState<{id: string, text: string, type: 'user'|'system'}[]>([
    {id: 'sys-1', text: 'Olá! Sou a Master AI. Posso te ajudar a analisar a conversa, sugerir respostas ou verificar o histórico do cliente. Como posso ajudar agora?', type: 'system'}
  ]);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  const prevUnreadCountRef = useRef<number>(0);

  // Poll contacts & messages to support real-time webhooks incoming notifications
  const fetchContacts = () => {
    fetch("/api/whatsapp/contacts")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setContacts(data);
          const currentUnread = data.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
          if (currentUnread > prevUnreadCountRef.current) {
            playIncomingMessageSound();
          }
          prevUnreadCountRef.current = currentUnread;
        }
        setIsOffline(false);
      })
      .catch(err => {
        // Treat transient network connection errors softly as warnings
        console.warn("Could not fetch live contacts (backend might be offline/initializing):", err.message || err);
        setIsOffline(true);
      });
  };

  const handleManualRetry = () => {
    toast.info("Tentando reconectar...", { id: "retry-fetch" });
    fetch("/api/whatsapp/contacts")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setContacts(data);
        }
        setIsOffline(false);
        toast.success("Conexão restabelecida!", { id: "retry-fetch" });
      })
      .catch(err => {
        setIsOffline(true);
        toast.error("Falha ao reconectar. O backend ainda está offline.", { id: "retry-fetch" });
      });

    if (activeChat) {
      fetch(`/api/whatsapp/messages/${activeChat}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setMessages(prev => ({ ...prev, [activeChat]: data }));
          }
          setIsOffline(false);
        })
        .catch(() => {
          setIsOffline(true);
        });
    }
  };

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchChatMessages = () => {
      fetch(`/api/whatsapp/messages/${activeChat}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setMessages(prev => ({ ...prev, [activeChat]: data }));
          }
          setIsOffline(false);
        })
        .catch(err => {
          // Treat transient network connection errors softly as warnings
          console.warn("Could not fetch live messages (backend might be offline/initializing):", err.message || err);
          setIsOffline(true);
        });
    };
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  // Perform Copilot Sentiment Analysis on actual interactions
  useEffect(() => {
    if (!activeChat) {
      setSentiment("");
      setAiAnalysis("");
      setAiSuggestion("");
      return;
    }

    setSentiment("Analisando...");
    fetch("/api/whatsapp/copilot/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: activeChat })
    })
      .then(res => res.json())
      .then(data => {
        setSentiment(data.sentiment || "Neutro");
        setAiAnalysis(data.analysis || "Conversa em andamento.");
        setAiSuggestion(data.suggestion || "");
      })
      .catch(err => {
        console.warn("Could not retrieve Copilot analysis (backend might be offline/initializing):", err.message || err);
        setSentiment("Neutro");
      });
  }, [activeChat, messages[activeChat]?.length]);

  const handleAiAsk = () => {
    if (!aiPrompt.trim() || aiTyping) return;
    const userPrompt = aiPrompt.trim();
    setAiMessages(prev => [...prev, {id: Date.now().toString(), text: userPrompt, type: 'user'}]);
    setAiPrompt("");
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      setAiMessages(prev => [...prev, {id: Date.now().toString(), text: "Com base no contexto atual, sugiro oferecer frete grátis para acelerar a conversão. Quer que eu escreva a mensagem para você?", type: 'system'}]);
    }, 1500);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat) setPreviousChat(activeChat);
  }, [activeChat]);

  useEffect(() => {
    if (rightPanel !== "none") setPreviousPanel(rightPanel);
  }, [rightPanel]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs = ["Todas", "Não lidas", "WhatsApp", "Instagram", "E-mail"];

  const filteredContacts = contacts.filter(c => {
    if (activeTab === "Não lidas" && c.unread === 0) return false;
    if (activeTab === "WhatsApp" && c.channel !== "WhatsApp") return false;
    if (activeTab === "Instagram" && c.channel !== "Instagram") return false;
    if (activeTab === "E-mail" && c.channel !== "Email") return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = c.name.toLowerCase().includes(query);
      const matchesTag = c.tags ? c.tags.some(t => t.toLowerCase().includes(query)) : false;
      return matchesName || matchesTag;
    }
    return true;
  });

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText.trim();
    setInputText("");

    // Simulate optimistic local insert for instant feedback
    const optMessage: Message = {
      id: "opt-" + Date.now().toString(),
      text: textToSend,
      sender: "me",
      status: "sent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), optMessage]
    }));

    fetch("/api/whatsapp/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: activeChat, text: textToSend })
    })
    .then(res => res.json())
    .then(() => {
      // Refresh to fetch actual stored version
      fetch(`/api/whatsapp/messages/${activeChat}`)
        .then(res => res.json())
        .then(data => {
          setMessages(prev => ({ ...prev, [activeChat]: data }));
        })
        .catch(err => {
          console.warn("Could not reload messages after sending:", err.message || err);
        });
      fetchContacts();
    })
    .catch(err => {
      console.warn("Error sending message:", err);
      toast.error("Erro ao enviar mensagem.");
    });
  };

  const viewChatId = isMobile ? (activeChat || previousChat) : activeChat;
  const currentContact = contacts.find(c => c.id === viewChatId);
  const currentMessages = currentContact ? (messages[currentContact.id] || []) : [];

  // Match contact with CRM Lead from useData context
  const cleanNumber = (num?: string) => {
    if (!num) return "";
    return num.replace(/\D/g, "").replace(/^55/, "");
  };

  const matchingLead = leads.find(l => {
    if (!currentContact) return false;
    const phoneMatch = cleanNumber(l.phone) === cleanNumber(currentContact.phone);
    const nameMatch = l.name.toLowerCase().includes(currentContact.name.toLowerCase()) || 
                      currentContact.name.toLowerCase().includes(l.name.toLowerCase());
    return phoneMatch || nameMatch;
  });

  const relatedActivities = matchingLead 
    ? leadActivities.filter(act => act.leadId === matchingLead.id)
    : [];

  const handleCreateActivity = () => {
    if (!matchingLead) return;
    if (!newActivityTitle.trim() || !newActivityDesc.trim()) {
      toast.error("Preencha o título e a descrição do evento.");
      return;
    }

    addLeadActivity(
      matchingLead.id,
      newActivityType,
      newActivityTitle.trim(),
      newActivityDesc.trim(),
      "Carlos Eduardo Mendes" // Sales rep name matching lead rep
    );

    toast.success("Evento registrado com sucesso no histórico do Lead!");
    setShowAddActivityModal(false);
    setNewActivityTitle("");
    setNewActivityDesc("");
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages, activeChat, rightPanel, viewMode]);

  const handleChatSelect = (id: string) => {
    setActiveChat(id);
    setRightPanel("none");
  };

  return (
    <div className={`flex bg-[#0B1120] overflow-hidden ${isMobile ? "min-h-[100dvh] justify-center relative" : "h-full w-full"}`}>
      <div className={`${isMobile ? "w-full max-w-[768px] h-[100dvh] flex flex-col relative bg-[#0B1120] overflow-hidden" : "w-full h-full rounded-2xl flex border border-white/10 bg-[#0F172A]/85 shadow-2xl backdrop-blur-xl overflow-hidden relative"}`}>
        
        {/* Main List View (Sidebar on Desktop, Full on Mobile) */}
        <div className={`${
            isMobile 
              ? `absolute inset-0 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] z-10 ${activeChat ? '-translate-x-1/4 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}` 
              : 'w-[320px] lg:w-[380px] h-full flex flex-col shrink-0 border-r border-white/5 z-10'
          } bg-[#0B1120]`}>
          
          {/* Header */}
          <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-white/5">
            <h1 className="text-xl font-bold text-white tracking-tight">Mensagens</h1>
            <div className="flex items-center gap-3 text-slate-400">
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"><Search className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex overflow-x-auto scrollbar-none border-b border-white/5 px-3 py-3 gap-2 bg-[#0B1120]/50 backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-1.5 text-[13px] font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="shrink-0 px-5 py-3 border-b border-white/5 bg-[#0B1120]/40">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou tag..."
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className="scrollbar-none flex-1 overflow-y-auto pb-20">
            <motion.div
              key={`${searchQuery}-${activeTab}-${isSearching}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full flex flex-col"
            >
              {isSearching ? (
                /* Skeleton Loader to prevent layout jumps */
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="w-full flex items-center gap-4 pl-[16px] pr-5 py-4 border-b border-white/5 border-l-4 border-transparent animate-pulse">
                    {/* Avatar Skeleton */}
                    <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0" />
                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-800 rounded w-10" />
                      </div>
                      <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                ))
              ) : (
                /* Real contacts list */
                <>
                  {filteredContacts.map(contact => {
                    const isActive = !isMobile && activeChat === contact.id;
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleChatSelect(contact.id)}
                        className={`w-full flex items-center gap-4 py-4 transition-all border-b border-white/5 text-left cursor-pointer group border-l-4 ${
                          isActive 
                            ? 'selecao-ativa border-l-blue-500 bg-blue-500/10 pl-[16px] pr-5 shadow-[inset_4px_0_15px_rgba(59,130,246,0.15),0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20 text-white' 
                            : 'border-transparent pl-[16px] pr-5 hover:bg-white/5'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner ${
                            contact.channel === 'WhatsApp' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                            contact.channel === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-700' :
                            'bg-gradient-to-br from-blue-500 to-indigo-700'
                          }`}>
                            {contact.avatar}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-[#0F172A] rounded-full p-[3px] shadow-sm ring-2 ring-[#0B1120]">
                            {getChannelIcon(contact.channel, "w-[14px] h-[14px]")}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex justify-between items-center">
                            <h3 className={`font-semibold text-[15px] truncate ${contact.unread > 0 ? "text-white" : "text-slate-200"}`}>
                              {contact.name}
                            </h3>
                            <span className={`text-[11px] font-medium ${contact.unread > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                              {contact.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <p className={`text-[13px] truncate flex-1 leading-snug ${contact.unread > 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                              {contact.lastMessage}
                            </p>
                            {contact.unread > 0 && (
                              <span className="bg-blue-600 text-white text-[11px] font-bold h-[22px] min-w-[22px] rounded-full flex items-center justify-center px-1.5 shrink-0 shadow-sm animate-pulse">
                                {contact.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  
                  {filteredContacts.length === 0 && (
                    <div className="p-10 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shadow-lg">
                        <Search className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Nenhum resultado encontrado</h4>
                        <p className="text-xs text-slate-400 max-w-[220px]">
                          Não encontramos nenhuma conversa que corresponda ao termo buscando ou aos filtros aplicados.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Active Chat View Wrapper */}
        <div className={`${
            isMobile
              ? `absolute inset-0 flex flex-col bg-[#0B1120] transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 shadow-[0_0_40px_rgba(0,0,0,0.8)] ${activeChat ? 'translate-x-[0%]' : 'translate-x-[100%]'}`
              : 'flex-1 h-full flex flex-col bg-[#0F172A]/50 z-0 relative'
          }`}>
          {currentContact ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 h-[64px] px-2 md:px-6 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-10 w-full shadow-sm">
                <div className="flex items-center gap-1.5 md:gap-3 max-w-[75%] cursor-pointer" onClick={() => { if(isMobile) setRightPanel("info"); }}>
                  {isMobile && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveChat(null); setRightPanel("none"); }}
                      className="p-2 -ml-1 text-slate-400 hover:text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                  )}
                  <div 
                    className="relative shrink-0 flex items-center gap-2.5 md:gap-3 group"
                  >
                     <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-sm md:text-base font-bold text-white shadow-inner transition-transform group-hover:scale-105 ${
                        currentContact.channel === 'WhatsApp' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                        currentContact.channel === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-700' :
                        'bg-gradient-to-br from-blue-500 to-indigo-700'
                      }`}>
                        {currentContact.avatar}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h2 className="text-white font-semibold text-[15px] md:text-[16px] truncate tracking-tight group-hover:text-blue-400 transition-colors leading-tight flex items-center">
                          {currentContact.name}
                          {sentiment && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                              sentiment === "Positivo" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]" :
                              sentiment === "Negativo" ? "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]" :
                              sentiment === "Analisando..." ? "bg-blue-500/15 border-blue-500/30 text-blue-400 animate-pulse" :
                              "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_5px_12px_rgba(245,158,11,0.15)]"
                            }`}>
                              {sentiment}
                            </span>
                          )}
                        </h2>
                        <span className="text-[12px] text-slate-400 truncate mt-0.5 flex items-center gap-1 animate-in fade-in duration-200">
                          {isOffline ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManualRetry();
                              }}
                              className="text-rose-400 font-bold uppercase text-[10px] bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 hover:bg-rose-500/20 active:scale-95 transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                            >
                              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span> Offline - Reconectar ↻
                            </button>
                          ) : currentContact.online ? (
                            <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-0.5"></span> Online</>
                          ) : (
                           'visto por último hoje'
                          )}
                        </span>
                      </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <button 
                    onClick={() => setRightPanel(p => p === "ai" ? "none" : "ai")}
                    title="Assistente de IA"
                    className={`p-2 rounded-full cursor-pointer transition-all ${rightPanel === "ai" ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50' : 'hover:bg-white/10 hover:text-white'}`}
                  >
                    <Sparkles className={`w-5 h-5 ${rightPanel === "ai" ? 'animate-pulse' : ''}`} />
                  </button>
                  <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
                  <button className="p-2 hover:bg-white/10 hover:text-white rounded-full cursor-pointer transition-colors hidden sm:flex"><Search className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-white/10 hover:text-white rounded-full cursor-pointer transition-colors"><Phone className="w-5 h-5" /></button>
                  <button 
                    onClick={() => setRightPanel(p => p === "info" ? "none" : "info")}
                    title="Info do Contato"
                    className={`p-2 rounded-full cursor-pointer transition-colors ${rightPanel === "info" ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* View Mode Switcher and Binding Status header */}
              <div className="shrink-0 bg-[#0F172A]/40 border-b border-white/5 py-2 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 w-fit">
                  <button 
                    onClick={() => setViewMode("chat")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                      viewMode === "chat" 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    💬 Apenas Chat
                  </button>
                  <button 
                    onClick={() => setViewMode("unified")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                      viewMode === "unified" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ Visão Unificada
                  </button>
                </div>

                {matchingLead ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      Vínculo CRM ativo: <strong className="text-white font-medium">{matchingLead.name}</strong>
                    </span>
                    <button 
                      onClick={() => setShowAddActivityModal(true)}
                      className="px-2.5 py-1 bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all"
                    >
                      + Novo Evento CRM
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Nenhum Lead CRM correspondente a este telefone.</span>
                )}
              </div>

              {/* Chat Messages / Live Timeline Content */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#0B1120]"
              >
                {viewMode === "chat" ? (
                  /* Simple Chat History Flow */
                  currentMessages.length > 0 ? (
                    <>
                      <div className="flex justify-center mb-6">
                        <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                          Hoje
                        </span>
                      </div>
                      
                      {currentMessages.map((msg) => {
                        const isMe = msg.sender === "me";
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2 ease-out`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 relative shadow-sm ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                  : 'bg-white/5 text-slate-100 rounded-2xl rounded-tl-sm border border-white/5'
                              }`}>
                               <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">
                                 {msg.text}
                                 <span className="inline-block w-[65px]"></span>
                               </p>
                               <span className={`text-[10px] font-medium absolute bottom-1.5 right-3 flex items-center gap-1 ${isMe ? 'text-blue-200/80' : 'text-slate-500'}`}>
                                 {msg.time}
                                 {isMe && (
                                   <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-emerald-400' : 'opacity-70'}`} strokeWidth={2.5}/>
                                 )}
                               </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-50 flex-col gap-4">
                      <div className="bg-white/5 p-6 rounded-full shadow-lg ring-1 ring-white/10">
                        {getChannelIcon(currentContact.channel, "w-10 h-10")}
                      </div>
                      <p className="text-sm text-slate-400 font-medium font-sans">Inicie a conversa no {currentContact.channel}</p>
                    </div>
                  )
                ) : (
                  /* Unified Linear CRM Timeline Flow */
                  (() => {
                    // Sorting helpers
                    const timelineItems: any[] = [];
                    currentMessages.forEach(msg => {
                      timelineItems.push({
                        type: "message",
                        timestamp: parseMessageTimeToTimestamp(msg.time),
                        data: msg
                      });
                    });
                    relatedActivities.forEach(act => {
                      timelineItems.push({
                        type: "activity",
                        timestamp: parseActivityDateToTimestamp(act.date),
                        data: act
                      });
                    });
                    timelineItems.sort((a, b) => a.timestamp - b.timestamp);

                    if (timelineItems.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 py-16 gap-3">
                          <Clock className="w-10 h-10 text-slate-500" strokeWidth={1} />
                          <p className="text-sm text-slate-400">Nenhuma interação registrada na jornada deste cliente.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-6 relative border-l border-white/5 pl-4 md:pl-6 ml-2 md:ml-4 py-2 font-sans">
                        {timelineItems.map((item, idx) => {
                          if (item.type === "message") {
                            const msg = item.data;
                            const isMe = msg.sender === "me";
                            return (
                              <div key={`msg-${msg.id}-${idx}`} className="relative group animate-in fade-in slide-in-from-left-4 duration-350">
                                <span className={`absolute -left-[25px] md:-left-[33px] w-4 h-4 rounded-full border-2 ${isMe ? 'bg-blue-600 border-[#0B1120]' : 'bg-emerald-500 border-[#0B1120]'} flex items-center justify-center z-10 shadow`}>
                                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                </span>
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 relative shadow-md ${
                                      isMe 
                                        ? 'bg-blue-600/90 text-white rounded-2xl rounded-tr-sm' 
                                        : 'bg-white/5 text-slate-100 rounded-2xl rounded-tl-sm border border-white/5'
                                    }`}>
                                    <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-bold">
                                      {isMe ? "Canal SAÍDA" : "Cliente WhatsApp ENTRADA"}
                                    </div>
                                    <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                                      {msg.text}
                                    </p>
                                    <div className="text-[10px] text-slate-400 mt-1.5 text-right flex items-center justify-end gap-1 font-medium">
                                      <span>{msg.time}</span>
                                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            const act = item.data;
                            return (
                              <div key={`act-${act.id}-${idx}`} className="relative pl-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
                                <span className="absolute -left-[27px] md:-left-[35px] w-5 h-5 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center z-10 shadow-lg">
                                  {act.type === 'Ligação' && <Phone className="w-2.5 h-2.5 text-amber-400" />}
                                  {act.type === 'E-mail' && <Mail className="w-2.5 h-2.5 text-blue-400" />}
                                  {act.type === 'Reunião' && <Calendar className="w-2.5 h-2.5 text-pink-400" />}
                                  {act.type === 'Outro' && <Info className="w-2.5 h-2.5 text-purple-400" />}
                                </span>
                                <div className="bg-[#1E293B]/60 border border-white/10 rounded-2xl p-4 space-y-2 hover:border-amber-500/20 transition-all shadow-md">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px] uppercase tracking-wider">
                                      🏛️ {act.type} (CRM)
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">{act.date}</span>
                                  </div>
                                  <h4 className="text-white text-xs md:text-sm font-bold tracking-tight">
                                    {act.title}
                                  </h4>
                                  <p className="text-slate-350 text-xs md:text-xs leading-relaxed">
                                    {act.description}
                                  </p>
                                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Agente: <strong className="text-slate-300 font-medium">{act.seller}</strong></span>
                                    <span className="text-emerald-400">Registrado no CRM ✓</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 sm:p-4 shrink-0 relative bg-[#0F172A]/80 border-t border-white/5 backdrop-blur-md z-10 w-full box-border">
                <div className="flex items-end gap-2 sm:gap-3 mx-auto w-full max-w-4xl">
                  <div className="flex-1 bg-[#1E293B] border border-white/5 rounded-2xl flex items-end min-h-[50px] shadow-inner transition-colors focus-within:border-blue-500/50 min-w-0">
                    <button className="p-3 sm:p-3.5 text-slate-400 hover:text-white shrink-0 cursor-pointer transition-colors">
                       <SmileIcon className="w-5 h-5" />
                    </button>
                    
                    <textarea 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Mensagem..."
                      className="flex-1 min-w-0 w-full max-h-[120px] bg-transparent text-white border-0 focus:ring-0 resize-none py-[14px] px-1 text-[15px] outline-none placeholder-slate-500 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent block"
                      rows={1}
                    />
                    
                    <button 
                      onClick={() => setRightPanel(p => p === "ai" ? "none" : "ai")}
                      className="p-3.5 text-blue-400 hover:text-blue-300 shrink-0 cursor-pointer transition-colors hidden sm:block"
                      title="Sugestão com IA"
                    >
                       <Sparkles className="w-5 h-5" />
                    </button>

                    <button className="p-3 sm:p-3.5 text-slate-400 hover:text-white shrink-0 cursor-pointer transition-colors">
                       <Paperclip className="w-5 h-5 -rotate-45" />
                    </button>
                    {!inputText && (
                      <button className="p-3 sm:p-3.5 pl-1 pr-3 sm:pr-4 text-slate-400 hover:text-white shrink-0 cursor-pointer transition-colors">
                         <Camera className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleSendMessage}
                    className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
                  >
                    {inputText.trim() ? (
                      <Send className="w-5 h-5 sm:w-5 sm:h-5 translate-x-[2px] translate-y-[-1px] text-white" />
                    ) : (
                      <Mic className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Desktop Empty State */
            !isMobile && (
              <div className="flex-1 flex items-center justify-center relative bg-[#0F172A]/30">
                <div className="flex flex-col items-center justify-center max-w-[420px] text-center relative z-10 px-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/30 mb-8 transform -rotate-12 ring-4 ring-white/5">
                    <MessageCircle className="w-10 h-10 text-white transform rotate-12" strokeWidth={2} />
                  </div>
                  <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Central de Mensagens</h2>
                  <p className="text-slate-400 text-[15px] leading-relaxed mb-8 font-medium">
                    Omnichannel inteligente. Gerencie WhatsApp, Instagram e E-mail em um só lugar.
                  </p>
                  <div className="bg-white/5 border border-white/5 rounded-full px-5 py-2 flex items-center gap-2 text-slate-300 text-[12px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Criptografado
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Panel Layout (Overlay over Chat) */}
        {currentContact && (
          <>
            {/* Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${rightPanel !== 'none' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
              onClick={() => setRightPanel("none")}
            />
            
            {/* Drawer */}
            <div className={`absolute top-0 right-0 bottom-0 w-[90%] sm:w-[380px] bg-[#0B1120] flex flex-col border-l border-white/10 shadow-2xl shadow-black z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${rightPanel !== 'none' ? 'translate-x-0' : 'translate-x-[100%]'}`}>
              
              {/* Panel Header */}
              <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
                <h2 className="text-[16px] text-white font-semibold flex items-center gap-2.5">
                  {(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? <Info className="w-5 h-5 text-slate-400"/> : <Sparkles className="w-5 h-5 text-blue-400"/>}
                  {(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? "Dados do Contato" : "Axis Copilot"}
                </h2>
                <button onClick={() => setRightPanel("none")} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Content: Info */}
              <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-6 space-y-6 ${(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? 'block' : 'hidden'}`}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl text-white ${
                      currentContact.channel === 'WhatsApp' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                      currentContact.channel === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-700' :
                      'bg-gradient-to-br from-blue-500 to-indigo-700'
                    }`}>
                      {currentContact.avatar}
                    </div>
                    <h2 className="text-xl text-white font-bold tracking-tight">{currentContact.name}</h2>
                    <p className="text-slate-400 text-[13px] font-medium mt-2 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                      {getChannelIcon(currentContact.channel, "w-4 h-4")} {currentContact.channel}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                    <Phone className="w-4 h-4"/> Ligar
                  </button>
                  <button className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors cursor-pointer">
                    <Mail className="w-4 h-4"/> E-mail
                  </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Telefone</h4>
                      <p className="text-slate-200 text-[14px] font-medium">{currentContact.phone || "Não cadastrado"}</p>
                    </div>
                    {currentContact.email && (
                      <div>
                        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">E-mail</h4>
                        <p className="text-slate-200 text-[14px] font-medium break-all">{currentContact.email}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> SLA de Resposta</h4>
                      <p className={`text-[14px] font-bold flex items-center gap-1.5 ${currentContact.slaStatus?.includes('Atrasado') ? 'text-rose-400' : 'text-emerald-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${currentContact.slaStatus?.includes('Atrasado') ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                        {currentContact.slaStatus || "Dentro do Prazo"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tags / Estágio</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentContact.tags?.map((tag, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-[#1E293B] border border-white/10 rounded-md text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                        <button className="px-2.5 py-1 border border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/5 rounded-md text-[11px] font-medium transition-colors cursor-pointer uppercase tracking-wider">
                          + Tag
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Histórico de Compras</h4>
                      <div className="space-y-2">
                        {currentContact.purchaseHistory && currentContact.purchaseHistory.length > 0 ? currentContact.purchaseHistory.map((ph, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 bg-[#1E293B] p-2.5 rounded-xl border border-white/5">
                            <div className="flex items-start justify-between">
                              <p className="text-[13px] text-slate-200 font-medium leading-tight">{ph.item}</p>
                              <span className="text-[12px] text-emerald-400 font-bold shrink-0 ml-2">{ph.value}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{ph.date}</p>
                          </div>
                        )) : (
                          <p className="text-[12px] text-slate-500 italic">Nenhuma compra registrada.</p>
                        )}
                      </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5 mb-8">
                    <button className="w-full text-left text-rose-400 bg-rose-500/10 border border-rose-500/20 text-[14px] p-3.5 hover:bg-rose-500/20 rounded-xl transition-colors flex items-center gap-3 font-medium cursor-pointer">
                      <Trash2 className="w-4 h-4"/> Apagar Conversa
                    </button>
                    <button className="w-full text-left text-slate-400 bg-white/5 border border-white/5 text-[14px] p-3.5 hover:bg-white/10 hover:text-slate-200 rounded-xl transition-colors flex items-center gap-3 font-medium cursor-pointer">
                      <ShieldCheck className="w-4 h-4"/> Bloquear Contato
                    </button>
                </div>
              </div>

              {/* Panel Content: AI */}
              <div className={`flex-1 flex flex-col ${(rightPanel === "ai" || (rightPanel === "none" && previousPanel === "ai")) ? 'block' : 'hidden'}`}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      
                      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-4 md:p-5 border border-blue-500/20 relative overflow-hidden group">
                        <Sparkles className="absolute -bottom-2 -right-2 w-24 h-24 text-blue-500/10 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                          <Zap className="w-4 h-4 fill-blue-500/50"/> Análise da Conversa (Master AI)
                        </h4>
                        <p className="text-slate-200 text-[13.5px] leading-relaxed relative z-10">
                          {aiAnalysis || "O Axis Copilot está analisando as interações da conversa para sintetizar insights comerciais em tempo real..."}
                        </p>
                        {aiSuggestion && (
                          <div className="mt-3.5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed">
                            <strong className="text-blue-400 block mb-0.5">💡 Sugestão de Abordagem:</strong>
                            {aiSuggestion}
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-2 relative z-10">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sentimento:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            sentiment === "Positivo" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            sentiment === "Negativo" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                            sentiment === "Analisando..." ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse" :
                            "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>{sentiment || "Pendente"}</span>
                        </div>
                      </div>

                      {/* AI Conversation List */}
                      <div className="space-y-4">
                        {aiMessages.map((aimsg) => (
                          <div key={aimsg.id} className={`flex w-full ${aimsg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                            {aimsg.type === 'system' && (
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              </div>
                            )}
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] sm:text-[14px] leading-snug shadow-sm ${
                              aimsg.type === 'user' 
                                ? 'bg-[#1E293B] text-white rounded-br-sm border border-white/5' 
                                : 'bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-bl-sm'
                            }`}>
                              {aimsg.text}
                            </div>
                          </div>
                        ))}
                        
                        {aiTyping && (
                          <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-blue-500/50" />
                              </div>
                             <div className="px-4 py-3.5 bg-blue-600/5 border border-blue-500/10 text-blue-300/70 rounded-2xl rounded-bl-sm text-[13px] font-medium flex items-center gap-1.5 shadow-sm">
                               Gerando resposta<span className="flex gap-0.5 ml-1"><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span></span>
                             </div>
                          </div>
                        )}
                      </div>
                  </div>

                  {/* AI Chat Input */}
                  <div className="p-3 sm:p-4 border-t border-white/5 bg-[#0F172A]/90 shrink-0 backdrop-blur-md">
                    <div className="flex gap-2 items-end">
                      <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Pergunte à Master AI..." 
                        rows={1}
                        className="flex-1 bg-[#1E293B] border border-white/5 rounded-xl px-3.5 py-3 text-[14px] text-slate-200 outline-none focus:border-blue-500/50 resize-none max-h-[100px] overflow-y-auto shadow-inner w-full min-w-0 placeholder-slate-500" 
                        onKeyDown={(e) => {
                          if(e.key === 'Enter' && !e.shiftKey) { 
                            e.preventDefault(); 
                            handleAiAsk(); 
                          }
                        }}
                      />
                      <button 
                        className={`p-3 rounded-xl shadow-md transition-all shrink-0 ${aiPrompt.trim() && !aiTyping ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95' : 'bg-[#1E293B] text-slate-500 pointer-events-none'}`}
                        onClick={handleAiAsk}
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 translate-x-[1px] translate-y-[-1px]"/>
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </>
        )}

        {/* Inline Dialog Modal for Logging New CRM Activities */}
        {showAddActivityModal && matchingLead && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/15 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-450 text-emerald-400" />
                  Registrar Atividade no CRM
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adicione uma nova nota, ligação ou reunião diretamente na jornada linear do lead <strong className="text-white font-medium">{matchingLead.name}</strong>.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Tipo de Interação</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Reunião', 'Ligação', 'E-mail', 'Outro'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewActivityType(t)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                          newActivityType === t
                            ? 'bg-[#2563EB]/15 border-[#2563EB] text-blue-400'
                            : 'bg-[#0B1120] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {t === 'Reunião' && '📅 REU'}
                        {t === 'Ligação' && '📞 CALL'}
                        {t === 'E-mail' && '📧 MAIL'}
                        {t === 'Outro' && '✏️ NOTA'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Título / Resumo curto</label>
                  <input
                    type="text"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    placeholder="Ex: Alinhamento de SLA comercial"
                    className="w-full bg-[#0B1120] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Detalhes do Evento</label>
                  <textarea
                    value={newActivityDesc}
                    onChange={(e) => setNewActivityDesc(e.target.value)}
                    rows={4}
                    placeholder="Escreva anotações detalhadas sobre as decisões tomadas ou a ligação efetuada..."
                    className="w-full bg-[#0B1120] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-end gap-3.5 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 font-bold hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateActivity}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
                >
                  Salvar Histórico
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper icon component
const SmileIcon = ({className}: {className?: string}) => (
  <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-2-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2 5c2.327 0 4.316-1.42 5.092-3.411a.999.999 0 0 0-.916-1.391H7.824a1 1 0 0 0-.916 1.391C7.684 14.58 9.673 16 12 16z"></path>
  </svg>
);
