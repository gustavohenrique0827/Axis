import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendPushNotification } from "../lib/notifications";
import { supabase } from '../lib/supabase';
import { Lead, Task, Contract, CustomField, LeadScoreTrigger, Squad, Colaborador } from '../types';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro';
  title: string;
  description: string;
  date: string;
  seller: string;
  files?: { name: string; size: string; }[];
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  link?: string;
  time: string;
  date: string; // Dynamic date for grouping (e.g., "20 Mai 2026")
  type: 'success' | 'error' | 'info' | 'warning';
  category?: string; // e.g., CRM, Produtividade, Financeiro
  read: boolean;
}

export interface GlobalWebhook {
  id: string;
  endpoint: string;
  event: string;
  active: boolean;
}

export interface FinanceEntry {
  id: string;
  description: string;
  category: string;
  status: 'Pago' | 'A Vencer' | 'Atrasado';
  value: number;
  type: 'Pagar' | 'Receber';
  date: string;
}

export type Appointment = {
  id: string;
  time: string;
  patient: string;
  drId: string;
  drName: string;
  status: 'Confirmado' | 'Aguardando' | 'Atrasado' | 'Em Atendimento' | 'Finalizado';
  type: 'Consulta' | 'Check-up' | 'Procedimento' | 'Retorno' | 'Teleconsulta';
  room: string;
  specialty: string;
  phone?: string;
  date: string; // YYYY-MM-DD
};

interface DataContextType {
  leads: Lead[];
  tasks: Task[];
  contracts: Contract[];
  notifications: Notification[];
  leadActivities: LeadActivity[];
  financeEntries: FinanceEntry[];
  appointments: Appointment[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // ... rest of methods
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (leadId: string, destStageId: string, index: number) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addContract: (contract: Omit<Contract, 'id'>) => void;
  deleteContract: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'date' | 'read'>, push?: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addLeadActivity: (leadId: string, type: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro', title: string, description: string, seller: string, customDate?: string, files?: { name: string; size: string; }[]) => void;
  addFinanceEntry: (entry: Omit<FinanceEntry, 'id'>) => void;
  deleteFinanceEntry: (id: string) => void;
  updateFinanceEntry: (id: string, updates: Partial<FinanceEntry>) => void;
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  simulateNewLeadAssignment: () => void;
  simulateOverdueTask: () => void;
  evolutionWebhookUrl: string;
  setEvolutionWebhookUrl: (url: string) => void;
  robotStatus: 'executando' | 'pausado';
  setRobotStatus: (status: 'executando' | 'pausado') => void;
  customLeadFields: CustomField[];
  setCustomLeadFields: (fields: CustomField[]) => void;
  leadScoreTriggers: LeadScoreTrigger[];
  setLeadScoreTriggers: (triggers: LeadScoreTrigger[]) => void;
  globalWebhooks: GlobalWebhook[];
  addGlobalWebhook: (webhook: Omit<GlobalWebhook, 'id'>) => void;
  deleteGlobalWebhook: (id: string) => void;
  toggleGlobalWebhook: (id: string) => void;
  squads: Squad[];
  updateSquad: (id: string, updates: Partial<Squad>) => void;
  addSquad: (squad: Omit<Squad, 'id'>) => void;
  deleteSquad: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_theme');
      if (saved) return saved as 'dark' | 'light';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('axis_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [customLeadFields, setCustomLeadFields] = useState<CustomField[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_custom_lead_fields');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'f1', name: 'Cargo', type: 'Texto', required: false },
      { id: 'f2', name: 'Número de Funcionários', type: 'Número', required: false }
    ];
  });

  const [leadScoreTriggers, setLeadScoreTriggers] = useState<LeadScoreTrigger[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_lead_score_triggers');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_finance_entries');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'f1', description: 'Aluguel AWS SaaS', category: 'Infraestrutura', status: 'A Vencer', value: 3200, type: 'Pagar', date: '25/05/2026' },
      { id: 'f2', description: 'Resend / Emails', category: 'Ferramentas', status: 'Pago', value: 420, type: 'Pagar', date: '20/05/2026' },
      { id: 'f3', description: 'Impostos NFS-e', category: 'Tributos', status: 'A Vencer', value: 1840, type: 'Pagar', date: '28/05/2026' },
      { id: 'f4', description: 'Mensalidade TechCorp', category: 'Serviços', status: 'Pago', value: 4500, type: 'Receber', date: '10/05/2026' },
      { id: 'f5', description: 'Consultoria RS Setp', category: 'Projetos', status: 'A Vencer', value: 1200, type: 'Receber', date: '12/05/2026' },
    ];
  });

  const [globalWebhooks, setGlobalWebhooks] = useState<GlobalWebhook[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_global_webhooks');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: "w1", endpoint: "https://api.rdstation.com.br/v2/webhooks/leads", event: "Novo Lead Criado", active: true },
      { id: "w2", endpoint: "https://automacoes.make.com/sc/830219-crm", event: "Negócio Ganho", active: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('axis_global_webhooks', JSON.stringify(globalWebhooks));
  }, [globalWebhooks]);

  const addGlobalWebhook = (webhook: Omit<GlobalWebhook, 'id'>) => {
    setGlobalWebhooks(prev => [{ ...webhook, id: `w${Math.random().toString(36).substring(2, 9)}` }, ...prev]);
  };

  const deleteGlobalWebhook = (id: string) => {
    setGlobalWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const toggleGlobalWebhook = (id: string) => {
    setGlobalWebhooks(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  useEffect(() => {
    localStorage.setItem('axis_custom_lead_fields', JSON.stringify(customLeadFields));
  }, [customLeadFields]);

  useEffect(() => {
    localStorage.setItem('axis_lead_score_triggers', JSON.stringify(leadScoreTriggers));
  }, [leadScoreTriggers]);

  useEffect(() => {
    const applyBrandColors = () => {
      const primary = localStorage.getItem("axis_brand_primary_color") || "#2563EB";
      const secondary = localStorage.getItem("axis_brand_secondary_color") || "#0F172A";
      const accent = localStorage.getItem("axis_brand_accent_color") || "#06B6D4";
      const success = localStorage.getItem("axis_brand_success_color") || "#10B981";
      const danger = localStorage.getItem("axis_brand_danger_color") || "#EF4444";

      document.documentElement.style.setProperty('--color-primary-blue', primary);
      document.documentElement.style.setProperty('--primary', primary);
      document.documentElement.style.setProperty('--color-tech-cyan', accent);
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--secondary', secondary);
      document.documentElement.style.setProperty('--color-dark-bg', secondary);
    };

    applyBrandColors();

    window.addEventListener("axis_brand_changed", applyBrandColors);
    return () => window.removeEventListener("axis_brand_changed", applyBrandColors);
  }, []);

  const [leads, setLeads] = useState<Lead[]>([
    { id: 't1', name: "Maria Silva", company: "TechCorp Brasil", email: "maria@techcorp.com", phone: "(11) 98888-7777", status: "Novo", value: "R$ 15.000", date: "Hoje, 10:30", seller: "Carlos Eduardo Mendes", title: "Site Institucional", priority: "Média", stageId: '1', pipelineId: 'comercial', timeIdle: 12, tenantName: "TechCorp Brasil" },
    { id: 't2', name: "Roberto Santos", company: "Construtora RS", email: "roberto@crs.com.br", phone: "(11) 97777-6666", status: "Qualificado", value: "R$ 45.000", date: "Ontem, 15:45", seller: "Ana Silva", title: "CRM Imobiliário", priority: "Alta", stageId: '1', pipelineId: 'comercial', timeIdle: 30, tenantName: "Construtora RS" },
    { id: 't3', name: "Ana Costa", company: "Clínica Vida", email: "ana.costa@vida.med.br", phone: "(21) 99999-0000", status: "Em Negociação", value: "R$ 8.500", date: "15 Mai, 09:12", seller: "Carlos Eduardo Mendes", title: "Gestão Clínica", priority: "Baixa", stageId: '2', pipelineId: 'comercial', timeIdle: 80, tenantName: "Clínica Vida" },
    { id: 't4', name: "Carlos Oliveira", company: "Solar Solutions", email: "carlos@solarsol.com", phone: "(31) 98888-1111", status: "Prospecção", value: "R$ 90.000", date: "10 Mai, 14:20", seller: "João Pedro", title: "App Solar", priority: "Alta", stageId: '3', pipelineId: 'comercial', timeIdle: 48, tenantName: "Solar Solutions" },
    { id: 't5', name: "Juliana Mendes", company: "Mendes Consultoria", email: "juliana@mendes.com", phone: "(41) 97777-2222", status: "Fechado", value: "R$ 22.000", date: "05 Mai, 11:10", seller: "Carlos Eduardo Mendes", title: "ERP Consultoria", priority: "Média", stageId: '3', pipelineId: 'comercial', timeIdle: 55, tenantName: "Mendes Consultoria" },
    { id: 't6', name: "Admin G-Tech", company: "G-Tech Internal", email: "admin@gtech.com", phone: "-", status: "Fechado", value: "R$ 120.000", date: "01 Mai", seller: "João Pedro", title: "Infra Estrutura", priority: "Alta", stageId: '5', pipelineId: 'comercial', timeIdle: 1, tenantName: "G-Tech Master" },
    { id: 'sdr1', name: "Lucas Almeida", company: "Almeida Logistics", email: "lucas@alogistics.com", phone: "(81) 98888-4444", status: "Novo", value: "R$ 0", date: "Hoje, 09:00", seller: "Roberto Ramos", title: "Automação Comercial", priority: "Alta", stageId: 'sdr-3', pipelineId: 'sdr', scoreIA: 91, temperature: 'quente', iaSummary: 'Empresa com 12 funcionários, demonstrou interesse em automação comercial e CRM. Possível ticket de R$ 5k/mês.', timeIdle: 4, tenantName: "G-Tech Master" },
    { id: 'sdr2', name: "Fernanda Souza", company: "FS Consultores", email: "fernanda@fscons.com", phone: "(85) 99999-1111", status: "Em Nutrição", value: "R$ 0", date: "Ontem, 16:30", seller: "Roberto Ramos", title: "Consultoria CRM", priority: "Média", stageId: 'sdr-2', pipelineId: 'sdr', scoreIA: 65, temperature: 'morno', iaSummary: 'Quer entender melhor como o CRM pode ajudar a estruturar o processo comercial.', timeIdle: 26, tenantName: "Solar Solutions" },
    { id: 'sdr3', name: "Eduardo Lima", company: "Eduarda Doceria", email: "edu@doceria.com", phone: "(11) 97777-5555", status: "IA Analisando", value: "R$ 0", date: "Hoje, 11:20", seller: "Roberto Ramos", title: "Varejo", priority: "Baixa", stageId: 'sdr-1', pipelineId: 'sdr', scoreIA: 42, temperature: 'frio', iaSummary: 'Perfil Muito PME, talvez ticket baixo mas alta chance de fechar self-service.', timeIdle: 74, tenantName: "Imobiliária Prime" }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: "Reunião de Follow-up TechCorp", related: "TechCorp Brasil", type: "Reunião", date: "Hoje, 14:00", status: "Em Aberto", priority: "Alta", seller: "Carlos Eduardo Mendes" },
    { id: '2', title: "Envio de Minuta Contratual", related: "Construtora RS", type: "Docs", date: "Amanhã, 10:00", status: "Em Aberto", priority: "Média", seller: "Ana Silva" },
    { id: '3', title: "Qualificação de Lead", related: "Juliana Mendes", type: "Call", date: "Ontem", status: "Concluída", priority: "Alta", seller: "Carlos Eduardo Mendes" },
    { id: '4', title: "Análise de Proposta", related: "Clínica Vida", type: "Docs", date: "Hoje, 17:00", status: "Atrasado", priority: "Alta", seller: "Roberto Ramos" },
  ]);

  const [contracts, setContracts] = useState<Contract[]>([
    { id: '1', client: "TechCorp Brasil", plan: "Enterprise", mrr: "R$ 4.500", status: "Ativo", date: "10/05/2026", progress: 100 },
    { id: '2', client: "Construtora RS", plan: "Pro", mrr: "R$ 1.200", status: "Ativo", date: "12/04/2026", progress: 100 },
    { id: '3', client: "Clínica Vida", plan: "Starter", mrr: "R$ 550", status: "Inadimplente", date: "01/02/2026", progress: 65 },
  ]);

  const defaultActivitiesOnLoad: LeadActivity[] = [
    { id: 'act1', leadId: 't1', type: 'Ligação', title: 'Primeiro Contato Telefônico', description: 'Cliente atendeu e demonstrou forte interesse em site institucional. Agendado follow-up.', date: 'Hoje, 10:30', seller: 'Carlos Eduardo Mendes' },
    { id: 'act2', leadId: 't2', type: 'Reunião', title: 'Reunião de Diagnóstico', description: 'Realizada reunião via Teams. Mapeamos escopo completo de CRM Imobiliário.', date: 'Ontem, 15:45', seller: 'Ana Silva' },
    { id: 'act3', leadId: 't3', type: 'E-mail', title: 'Envio de Proposta Comercial', description: 'Proposta de R$ 8.500 enviada por e-mail com detalhes da gestão de clínica.', date: '15 Mai, 09:12', seller: 'Carlos Eduardo Mendes' },
    { id: 'act4', leadId: 't5', type: 'Reunião', title: 'Apresentação de Demostração ERP', description: 'Apresentação realizada com sucesso. Negociação de prazos.', date: '05 Mai, 11:10', seller: 'Carlos Eduardo Mendes' },
  ];

  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  const [evolutionWebhookUrl, setEvolutionWebhookUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("evolution_webhook_url") || "https://axis-crm.cloud/api/webhooks/whatsapp";
    }
    return "https://axis-crm.cloud/api/webhooks/whatsapp";
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_appointments');
      if (saved) return JSON.parse(saved);
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: '1', time: '08:00', patient: 'Ricardo Oliveira', drId: '1', drName: 'Dr. Lucas Ferro', status: 'Finalizado', type: 'Check-up', room: 'Consultório 01', specialty: 'Cardiologia', phone: '5511988887777', date: today },
      { id: '2', time: '09:30', patient: 'Beatriz Santos', drId: '2', drName: 'Dra. Ana Costa', status: 'Em Atendimento', type: 'Procedimento', room: 'Sala de Estética', specialty: 'Dermatologia', phone: '5511977776666', date: today },
      { id: '3', time: '11:00', patient: 'Marcelo Dias', drId: '1', drName: 'Dr. Lucas Ferro', status: 'Atrasado', type: 'Teleconsulta', room: 'Virtual (Meet)', specialty: 'Cardiologia', phone: '5511999990000', date: today },
      { id: '4', time: '14:30', patient: 'Fátima Lima', drId: '3', drName: 'Dra. Elena Ramos', status: 'Confirmado', type: 'Retorno', room: 'Consultório 03', specialty: 'Ginecologia', phone: '5511988881111', date: today },
    ];
  });

  const [robotStatus, setRobotStatus] = useState<'executando' | 'pausado'>('executando');

  const [squads, setSquads] = useState<Squad[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_squads');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "sq1",
        nome: "Squad Apple Palmas Elite",
        meta: 300000,
        orcamentoMensal: 15000,
        faturamentoAlcancado: 265000,
        sdrCount: 1,
        closersCount: 2,
        focoComercial: "Revendedores de iPhones, Vendas de Altas Margens e Prospecção Palmas/TO",
        membros: ["Roberto Ramos (SDR)", "Carlos Mendes (Closer)", "Ana Silva (Closer)"]
      },
      {
        id: "sq2",
        nome: "Squad G-Tech Admissões",
        meta: 120000,
        orcamentoMensal: 8000,
        faturamentoAlcancado: 89000,
        sdrCount: 1,
        closersCount: 1,
        focoComercial: "Inscrições e funis educacionais, captação de turmas e matrículas SaaS",
        membros: ["Roberto Ramos (SDR)", "Carlos Mendes (Closer)"]
      },
      {
        id: "sq3",
        nome: "Squad Outbound Enterprise",
        meta: 150000,
        orcamentoMensal: 12000,
        faturamentoAlcancado: 35000,
        sdrCount: 1,
        closersCount: 1,
        focoComercial: "Contratos corporativos de volume e suporte consultivo",
        membros: ["Roberto Ramos (SDR)", "Ana Silva (Closer)"]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('axis_squads', JSON.stringify(squads));
  }, [squads]);

  const addSquad = (squad: Omit<Squad, 'id'>) => {
    const newSquad = { ...squad, id: `sq${Math.random().toString(36).substring(2, 9)}` };
    setSquads(prev => [...prev, newSquad]);
    toast.success('Novo squad comercial criado!');
  };

  const updateSquad = (id: string, updates: Partial<Squad>) => {
    setSquads(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSquad = (id: string) => {
    setSquads(prev => prev.filter(s => s.id !== id));
    toast.info('Squad removido.');
  };

  const updateEvolutionWebhookUrl = (url: string) => {
    setEvolutionWebhookUrl(url);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("evolution_webhook_url", url);
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: "Novo Lead Qualificado", desc: "A empresa TechCorp Brasil acaba de passar para a etapa de qualificação. Responsável: Carlos Eduardo.", time: "10:30", date: "Hoje", type: "success", category: "CRM", read: false },
    { id: '2', title: "Tarefa Atrasada", desc: "A tarefa 'Reunião de Diagnóstico de Processos' com Construtora RS passou do prazo limite acordado.", time: "09:00", date: "Hoje", type: "error", category: "Produtividade", read: false },
    { id: '3', title: "E-mail de Proposta Visualizado", desc: "Ana Costa da Clínica Vida abriu e leu o e-mail contendo os detalhes técnicos da proposta comercial.", time: "17:45", date: "Ontem", type: "info", category: "Engajamento", read: true },
    { id: '4', title: "Contrato Assinado e Ativo", desc: "O contrato Pro de R$ 1.200/mês da Construtora RS foi devidamente assinado e ativado no sistema.", time: "14:20", date: "Ontem", type: "success", category: "Financeiro", read: true },
    { id: '5', title: "Configurações Globais Alteradas", desc: "Parâmetros gerais do tenant e políticas de faturamento automático SMTP foram reconfigurados pelo administrador.", time: "11:15", date: "15 Mai", type: "warning", category: "Sistema", read: true }
  ]);

  // Persistence & Supabase Synchronization
  useEffect(() => {
    async function loadInitialData() {
      // 1. Initial fallbacks from localStorage
      const savedLeads = localStorage.getItem('axis_leads');
      const savedTasks = localStorage.getItem('axis_tasks');
      const savedContracts = localStorage.getItem('axis_contracts');
      const savedNotifications = localStorage.getItem('axis_notifications');
      const savedActivities = localStorage.getItem('axis_lead_activities');
      
      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedContracts) setContracts(JSON.parse(savedContracts));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedActivities) {
        setLeadActivities(JSON.parse(savedActivities));
      } else {
        setLeadActivities(defaultActivitiesOnLoad);
      }

      // 2. Try to fetch real-time data from Supabase if client is initialized
      if (!supabase) return;
      try {
        const { data: dbLeads, error: lErr } = await supabase.from('leads').select('*');
        if (!lErr && dbLeads && dbLeads.length > 0) {
          setLeads(dbLeads as Lead[]);
        }

        const { data: dbTasks, error: tErr } = await supabase.from('tasks').select('*');
        if (!tErr && dbTasks && dbTasks.length > 0) {
          setTasks(dbTasks as Task[]);
        }

        const { data: dbContracts, error: cErr } = await supabase.from('contracts').select('*');
        if (!cErr && dbContracts && dbContracts.length > 0) {
          setContracts(dbContracts as Contract[]);
        }

        const { data: dbActs, error: aErr } = await supabase.from('lead_activities').select('*');
        if (!aErr && dbActs && dbActs.length > 0) {
          setLeadActivities(dbActs as LeadActivity[]);
        }
      } catch (err) {
        console.warn("Supabase fetch failed (possibly missing tables), using local storage instead.", err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('axis_leads', JSON.stringify(leads));
    localStorage.setItem('axis_tasks', JSON.stringify(tasks));
    localStorage.setItem('axis_contracts', JSON.stringify(contracts));
    localStorage.setItem('axis_notifications', JSON.stringify(notifications));
    localStorage.setItem('axis_lead_activities', JSON.stringify(leadActivities));
    localStorage.setItem('axis_finance_entries', JSON.stringify(financeEntries));
    localStorage.setItem('axis_appointments', JSON.stringify(appointments));
  }, [leads, tasks, contracts, notifications, leadActivities, financeEntries, appointments]);

  // WhatsApp Reminder Engine (30 mins before teleconsultation)
  const notifiedRemindersRef = React.useRef<Record<string, boolean>>({});
  useEffect(() => {
    const checkTeleconsultations = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      appointments.forEach(apt => {
        if (apt.type === 'Teleconsulta' && apt.date === todayStr && apt.status !== 'Finalizado') {
          const [hour, minute] = apt.time.split(':').map(Number);
          const aptTime = new Date();
          aptTime.setHours(hour, minute, 0, 0);
          
          const diffMs = aptTime.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          
          // Trigger if within 29-31 minutes and not notified yet
          if (diffMins >= 28 && diffMins <= 32 && !notifiedRemindersRef.current[apt.id]) {
            notifiedRemindersRef.current[apt.id] = true;
            
            // Logic to simulate WhatsApp send
            const message = `Olá ${apt.patient}, aqui é da Axis Telemedicina. Lembramos que sua teleconsulta com ${apt.drName} inicia em 30 minutos. Prepare sua conexão!`;
            
            console.log(`[WHATSAPP AUTOMÁTICO] Enviando para ${apt.phone || 'N/A'}: ${message}`);
            
            toast.info(`Lembrete WhatsApp enviado para ${apt.patient}`, {
              description: "Teleconsulta em 30 minutos.",
              icon: "📱"
            });

            addNotification({
              title: "Lembrete de Teleconsulta Enviado",
              desc: `Mensagem de WhatsApp disparada para ${apt.patient} (${apt.phone}).`,
              type: "info",
              category: "Telemedicina"
            });
          }
        }
      });
    };

    const interval = setInterval(checkTeleconsultations, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [appointments]);

  // Synchronized ref to read notifications in the effect without causing infinite loops
  const notifsRef = React.useRef(notifications);
  useEffect(() => {
    notifsRef.current = notifications;
  }, [notifications]);

  // Automated real-time checking effect for critical events (lead assignments & overdue tasks)
  useEffect(() => {
    // 1. Check for assigned leads that do not have their assignment notification yet
    leads.forEach(l => {
      if (l.seller && l.seller !== "Não Atribuído") {
        const hasAssignmentNotif = notifsRef.current.some(
          n => n.category === "CRM" && 
               n.desc.includes(l.name) && 
               n.desc.includes(l.seller) && 
               (n.title.toLowerCase().includes("atribu") || n.title.toLowerCase().includes("responsável"))
        );

        if (!hasAssignmentNotif) {
          addNotification({
            title: "Lead Atribuído",
            desc: `O lead '${l.name}' (${l.company}) foi direcionado ao responsável '${l.seller}'.`,
            type: "info",
            category: "CRM"
          }, true);
          toast.success(`Encaminhado: ${l.name} direcionado à(ao) ${l.seller}`);
        }
      }
    });

    // 2. Check for overdue tasks
    tasks.forEach(t => {
      if (t.status === "Atrasado") {
        const hasOverdueNotif = notifsRef.current.some(
          n => n.category === "Produtividade" && 
               n.title.toLowerCase().includes("atrasa") && 
               n.desc.includes(t.title)
        );

        if (!hasOverdueNotif) {
          // Send HTML Email Simulation
          console.log(`
[DISPARO DE E-MAIL]
De: no-reply@axis-crm.cloud
Para: ${t.seller || 'admin'}@axis-crm.cloud
Assunto: Alerta: Tarefa Atrasada - ${t.title}

Template HTML:
<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #e53e3e;">Atenção! Tarefa Atrasada</h2>
  <p>A tarefa <strong>${t.title}</strong> passou do prazo limite.</p>
  <p>Essa tarefa está relacionada ao lead/cliente: <strong>${t.related}</strong></p>
  <a href="/app/pipeline" style="display: inline-block; padding: 10px 15px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">Visualizar Lead</a>
</div>
          `);

          addNotification({
            title: "Tarefa Crítica Atrasada",
            desc: `A tarefa '${t.title}' (relacionada com: ${t.related}) está atrasada e necessita de atenção imediata!`,
            type: "error",
            category: "Produtividade"
          }, true);
          toast.error(`Alerta de Atraso: '${t.title}'`, {
            duration: 5000,
          });
        }
      }
    });
  }, [leads, tasks]);

  // Automated background checker for cold leads (Score IA < 40)
  useEffect(() => {
    const checkColdLeads = () => {
      leads.forEach(lead => {
        if (lead.scoreIA !== undefined && lead.scoreIA < 40) {
          // Check if nurturing task with the 'reengajamento' tag already exists for this lead/company
          const hasNurturingTask = tasks.some(t => 
            (t.related === lead.company || t.related === lead.name) && 
            t.tags?.includes("reengajamento")
          );

          if (!hasNurturingTask) {
            const newTask: Omit<Task, 'id'> = {
              title: `Nutrição de Reengajamento: ${lead.name}`,
              related: lead.company || lead.name,
              type: "E-mail",
              date: "Amanhã, 09:00",
              status: "Em Aberto",
              priority: "Média",
              seller: lead.seller || "Roberto Ramos",
              tags: ["reengajamento", "Frio", "Automação"]
            };

            addTask(newTask);

            addNotification({
              title: "Reengajamento Iniciado",
              desc: `Automação detectou o lead frio '${lead.name}' (Score IA: ${lead.scoreIA}) e gerou uma tarefa de Nutrição.`,
              type: "info",
              category: "Automação"
            });

            toast.info(`Nutrição automática iniciada para: ${lead.name}`, {
              description: "Tarefa com tag de reengajamento foi criada com sucesso."
            });
          }
        }
      });
    };

    // Run check after mount, then every 20 seconds
    const timer = setTimeout(checkColdLeads, 4000);
    const interval = setInterval(checkColdLeads, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [leads, tasks]);

  // Automated background checker for squad goals (90% threshold)
  const notifiedSquadsRef = React.useRef<Record<string, boolean>>({});
  useEffect(() => {
    squads.forEach(sq => {
      const percentage = (sq.faturamentoAlcancado / sq.meta) * 100;
      if (percentage >= 90 && !notifiedSquadsRef.current[sq.id]) {
        addNotification({
          title: "🚀 Meta Próxima (90%+)",
          desc: `O ${sq.nome} atingiu 90% da meta mensal! Faturamento atual: R$ ${sq.faturamentoAlcancado.toLocaleString()}`,
          type: "success",
          category: "Performance"
        }, true);
        toast.success(`Alerta de Meta: ${sq.nome} atingiu 90%!`, {
          description: "Excelente desempenho do time.",
          duration: 10000
        });
        notifiedSquadsRef.current[sq.id] = true;
      } else if (percentage < 90) {
        // Reset if it somehow goes below (e.g. goal adjustment or refund simulation)
        notifiedSquadsRef.current[sq.id] = false;
      }
    });
  }, [squads]);

  const simulateNewLeadAssignment = () => {
    const sellersList = ["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos", "Juliana Costa"];
    const randomSeller = sellersList[Math.floor(Math.random() * sellersList.length)];
    
    if (leads.length === 0) {
      toast.error("Nenhum lead ativo disponível no momento.");
      return;
    }
    const randomLead = leads[Math.floor(Math.random() * leads.length)];
    
    updateLead(randomLead.id, { seller: randomSeller });
  };

  const simulateOverdueTask = () => {
    const taskTitles = [
      "Retornar ligação de proposta comercial",
      "Validar orçamento com diretoria financeira",
      "Enviar cronograma de escopo e implantação",
      "Reunião de alinhamento com engenharia"
    ];
    const clients = ["TechCorp Brasil", "Construtora RS", "Clínica Vida", "Solar Solutions"];
    const sellersList = ["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos"];
    
    const randomTitle = taskTitles[Math.floor(Math.random() * taskTitles.length)];
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomSeller = sellersList[Math.floor(Math.random() * sellersList.length)];

    const newTask: Omit<Task, 'id'> = {
      title: randomTitle,
      related: randomClient,
      type: "Call",
      date: "Hoje, 09:00",
      status: "Atrasado",
      priority: "Alta",
      seller: randomSeller
    };
    
    addTask(newTask);
  };

  const triggerScoreRecalculation = async (leadId: string, currentLeadsList?: Lead[], currentActivitiesList?: LeadActivity[]) => {
    const listLeads = currentLeadsList || leads;
    const listActivities = currentActivitiesList || leadActivities;
    const targetLead = listLeads.find(l => l.id === leadId);
    if (!targetLead) return;

    try {
      const response = await fetch("/api/leads/calculate-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: targetLead, activities: listActivities })
      });
      if (response.ok) {
        const result = await response.json();
        
        // Update local state with calculation result
        setLeads(prev => prev.map(l => l.id === leadId ? {
          ...l,
          scoreIA: result.scoreIA,
          temperature: result.temperature,
          iaSummary: result.iaSummary,
          stageId: (l.pipelineId === 'sdr' && (!l.stageId || l.stageId === 's1' || l.stageId === 's2')) ? 's_qual' : l.stageId
        } : l));

        // Update database if using Supabase
        if (supabase) {
          const updatedStage = (targetLead.pipelineId === 'sdr' && (!targetLead.stageId || targetLead.stageId === 's1' || targetLead.stageId === 's2')) ? 's_qual' : targetLead.stageId;
          await supabase.from('leads').update({
            scoreIA: result.scoreIA,
            temperature: result.temperature,
            iaSummary: result.iaSummary,
            stageId: updatedStage
          }).eq('id', leadId);
        }
      }
    } catch (err) {
      console.error("Failed to run AI score calculation service:", err);
    }
  };

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    const newLead = { ...lead, id: Math.random().toString(36).substr(2, 9), scoreIA: 50 };
    setLeads(prev => [newLead, ...prev]);
    toast.success('Novo lead adicionado com sucesso!');
    addNotification({
      title: "Novo Lead",
      desc: `${lead.name} da empresa ${lead.company} foi adicionado.`,
      type: "success"
    });

    if (supabase) {
      try {
        await supabase.from('leads').insert(newLead);
      } catch (err) {
        console.error("Supabase add lead failed:", err);
      }
    }

    // Trigger initial calculation
    setTimeout(() => {
      triggerScoreRecalculation(newLead.id);
    }, 400);
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    let hasStatusOrStageChange = false;
    
    setLeads(prev => {
      const target = prev.find(l => l.id === id);
      if (target && (
        (updates.status !== undefined && updates.status !== target.status) || 
        (updates.stageId !== undefined && updates.stageId !== target.stageId)
      )) {
        hasStatusOrStageChange = true;
      }

      return prev.map(l => {
        if (l.id === id) {
            const updatedLead = { ...l, ...updates };

            // Transition from SDR to Comercial
            if (l.pipelineId === 'sdr' && updates.pipelineId === 'comercial') {
                const tempLabel = updatedLead.temperature ? updatedLead.temperature.toUpperCase() : 'Não avaliada';
                
                toast.success('Lead Qualificado!', {
                    description: `${updatedLead.name} foi movido para o Comercial com temperatura ${tempLabel}.`
                });

                addNotification({
                    title: "Lead Qualificado (SDR -> Comercial)",
                    desc: `O lead ${updatedLead.name} foi qualificado pela Master AI com temperatura ${tempLabel} e enviado ao pipeline comercial.`,
                    link: "/app/pipeline",
                    type: "success",
                    category: "CRM & Vendas"
                });
            }

            // Automation for 'Won' leads
            if (updates.status === 'Fechado' && l.status !== 'Fechado') {
                addNotification({
                    title: "Automação: E-mail de Boas Vindas",
                    desc: `Boas vindas enviadas para ${updatedLead.name} por ter se tornado cliente!`,
                    type: "success",
                    category: "Engajamento"
                });
                toast.success("E-mail de Boas Vindas enviado!");
            }

            return updatedLead;
        }
        return l;
      });
    });

    if (supabase) {
      try {
        await supabase.from('leads').update(updates).eq('id', id);
      } catch (err) {
        console.error("Supabase update lead failed:", err);
      }
    }

    if (hasStatusOrStageChange) {
      setTimeout(() => {
        triggerScoreRecalculation(id);
      }, 400);
    }
  };

  const deleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.info('Lead removido.');

    if (supabase) {
      try {
        await supabase.from('leads').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete lead failed:", err);
      }
    }
  };

  const moveLead = async (leadId: string, destStageId: string, index: number) => {
    setLeads(prev => {
        const lead = prev.find(l => l.id === leadId);
        if (!lead) return prev;
        
        const otherLeads = prev.filter(l => l.id !== leadId);
        const updatedLead = { ...lead, stageId: destStageId };

        // Notification for SDR 'Qualificação IA'
        if (destStageId === 's_qual' && lead.pipelineId === 'sdr') {
          addNotification({
            title: "Análise Master AI Concluída",
            desc: `O lead ${lead.name} foi movido para Qualificação IA. A análise estrutural da Master AI foi finalizada.`,
            type: "success",
            category: "SDR",
            link: `/app/pipeline?search=${encodeURIComponent(lead.name)}`
          });
        }
        
        return [...otherLeads, updatedLead]; 
    });

    if (supabase) {
      try {
        await supabase.from('leads').update({ stageId: destStageId }).eq('id', leadId);
      } catch (err) {
        console.error("Supabase move lead failed:", err);
      }
    }

    // Move counts as stageId status update, trigger recalculation
    setTimeout(() => {
      triggerScoreRecalculation(leadId);
    }, 400);
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9) };
    setTasks(prev => [newTask, ...prev]);
    toast.success('Tarefa agendada!');
    addNotification({
      title: "Nova Tarefa",
      desc: `Agendada: ${task.title}`,
      type: "info"
    }, true);

    if (supabase) {
      try {
        await supabase.from('tasks').insert(newTask);
      } catch (err) {
        console.error("Supabase add task failed:", err);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    if (supabase) {
      try {
        await supabase.from('tasks').update(updates).eq('id', id);
      } catch (err) {
        console.error("Supabase update task failed:", err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.info('Tarefa removida.');

    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete task failed:", err);
      }
    }
  };

  const addContract = async (contract: Omit<Contract, 'id'>) => {
    const newContract = { ...contract, id: Math.random().toString(36).substr(2, 9) };
    setContracts(prev => [...prev, newContract]);
    toast.success('Contrato registrado!');
    addNotification({
      title: "Novo Contrato",
      desc: `Cliente: ${contract.client}`,
      type: "success"
    });

    if (supabase) {
      try {
        await supabase.from('contracts').insert(newContract);
      } catch (err) {
        console.error("Supabase add contract failed:", err);
      }
    }
  };

  const deleteContract = async (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    toast.info('Contrato removido.');

    if (supabase) {
      try {
        await supabase.from('contracts').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete contract failed:", err);
      }
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'date' | 'read'>, push?: boolean) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: "Hoje",
      read: false
    };
    if (push) {
      sendPushNotification(newNotification.title, newNotification.desc);
    }
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addLeadActivity = async (leadId: string, type: 'Ligação' | 'E-mail' | 'Reunião' | 'Outro', title: string, description: string, seller: string, customDate?: string, files?: { name: string; size: string; }[]) => {
    const newActivity: LeadActivity = {
      id: Math.random().toString(36).substr(2, 9),
      leadId,
      type,
      title,
      description,
      date: customDate || `Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      seller,
      files
    };
    const updatedActivities = [newActivity, ...leadActivities];
    setLeadActivities(updatedActivities);

    if (supabase) {
      try {
        await supabase.from('lead_activities').insert(newActivity);
      } catch (err) {
        console.error("Supabase add lead activity failed:", err);
      }
    }

    // Trigger score calculation after activity logger saved
    triggerScoreRecalculation(leadId, leads, updatedActivities);
  };

  const addFinanceEntry = (entry: Omit<FinanceEntry, 'id'>) => {
    const newEntry = { ...entry, id: `f${Math.random().toString(36).substring(2, 9)}` };
    setFinanceEntries(prev => [newEntry, ...prev]);
    toast.success(`${entry.type === 'Pagar' ? 'Despesa' : 'Receita'} registrada!`);
  };

  const deleteFinanceEntry = (id: string) => {
    setFinanceEntries(prev => prev.filter(f => f.id !== id));
    toast.info('Lançamento financeiro removido.');
  };

  const updateFinanceEntry = (id: string, updates: Partial<FinanceEntry>) => {
    setFinanceEntries(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt = { ...apt, id: Math.random().toString(36).substr(2, 9) };
    setAppointments(prev => [newApt, ...prev]);
    toast.success('Agendamento realizado!');
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    toast.info('Agendamento removido.');
  };

  return (
    <DataContext.Provider value={{ 
      leads, tasks, contracts, notifications, leadActivities, financeEntries, appointments,
      theme, toggleTheme,
      addLead, updateLead, deleteLead, moveLead,
      addTask, updateTask, deleteTask, addContract, deleteContract,
      addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      addLeadActivity,
      addFinanceEntry, deleteFinanceEntry, updateFinanceEntry,
      addAppointment, updateAppointment, deleteAppointment,
      simulateNewLeadAssignment,
      simulateOverdueTask,
      evolutionWebhookUrl,
      setEvolutionWebhookUrl: updateEvolutionWebhookUrl,
      robotStatus,
      setRobotStatus,
      customLeadFields,
      setCustomLeadFields,
      leadScoreTriggers,
      setLeadScoreTriggers,
      globalWebhooks,
      addGlobalWebhook,
      deleteGlobalWebhook,
      toggleGlobalWebhook,
      squads,
      updateSquad,
      addSquad,
      deleteSquad
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
