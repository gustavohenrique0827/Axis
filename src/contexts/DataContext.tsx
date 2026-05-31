import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendPushNotification } from "../lib/notifications";
import { supabase, isSupabaseReachable } from '../lib/supabase';
import { Lead, Task, Contract, CustomField, LeadScoreTrigger, Squad } from '../types';
import {
  defaultCustomLeadFields,
  defaultFinanceEntries,
  defaultGlobalWebhooks,
  defaultLeads,
  defaultTasks,
  defaultContracts,
  defaultActivitiesOnLoad,
  getDefaultAppointments,
  defaultSquads,
  defaultNotifications,
  defaultLeadScoreTriggers
} from './dataMocks';
import { DataContext, DataContextType, LeadActivity, Notification, Appointment, GlobalWebhook, FinanceEntry, useData } from './DataContextTypes';

export { useData };
export type { DataContextType, LeadActivity, Notification, Appointment, GlobalWebhook, FinanceEntry };

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
      const saved = localStorage.getItem('axis_custom_lead_fields_v2');
      if (saved) return JSON.parse(saved);
    }
    return defaultCustomLeadFields;
  });

  const updateCustomLeadFields = (fields: CustomField[]) => {
    setCustomLeadFields(fields);
    syncSetting('customLeadFields', fields);
  };

  const [leadScoreTriggers, setLeadScoreTriggers] = useState<LeadScoreTrigger[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_lead_score_triggers_v2');
      if (saved) return JSON.parse(saved);
    }
    return defaultLeadScoreTriggers;
  });

  const updateLeadScoreTriggers = (triggers: LeadScoreTrigger[]) => {
    setLeadScoreTriggers(triggers);
    syncSetting('leadScoreTriggers', triggers);
  };

  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);

  const syncSetting = async (key: string, value: any) => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('app_settings').select('id').eq('key', key).single();
      if (data) {
        await supabase.from('app_settings').update({ value }).eq('id', data.id);
      } else {
        await supabase.from('app_settings').insert({ key, value });
      }
    } catch (err) {
      console.error(`Supabase sync setting failed for ${key}:`, err);
    }
  };

  const [globalWebhooks, setGlobalWebhooks] = useState<GlobalWebhook[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axis_global_webhooks_v2');
      if (saved) return JSON.parse(saved);
    }
    return defaultGlobalWebhooks;
  });

  useEffect(() => {
    localStorage.setItem('axis_global_webhooks_v2', JSON.stringify(globalWebhooks));
  }, [globalWebhooks]);

  const addGlobalWebhook = (webhook: Omit<GlobalWebhook, 'id'>) => {
    const newVal = [{ ...webhook, id: `w${Math.random().toString(36).substring(2, 9)}` }, ...globalWebhooks];
    setGlobalWebhooks(newVal);
    syncSetting('globalWebhooks', newVal);
  };

  const deleteGlobalWebhook = (id: string) => {
    const newVal = globalWebhooks.filter(w => w.id !== id);
    setGlobalWebhooks(newVal);
    syncSetting('globalWebhooks', newVal);
  };

  const toggleGlobalWebhook = (id: string) => {
    const newVal = globalWebhooks.map(w => w.id === id ? { ...w, active: !w.active } : w);
    setGlobalWebhooks(newVal);
    syncSetting('globalWebhooks', newVal);
  };

  useEffect(() => {
    localStorage.setItem('axis_custom_lead_fields_v2', JSON.stringify(customLeadFields));
  }, [customLeadFields]);

  useEffect(() => {
    localStorage.setItem('axis_lead_score_triggers_v2', JSON.stringify(leadScoreTriggers));
  }, [leadScoreTriggers]);

  useEffect(() => {
    const applyBrandColors = () => {
      const primary = localStorage.getItem("axis_brand_primary_color") || "#2563EB";
      const secondary = localStorage.getItem("axis_brand_secondary_color") || "#0F172A";
      const accent = localStorage.getItem("axis_brand_accent_color") || "#06B6D4";

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

  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  const [evolutionWebhookUrl, setEvolutionWebhookUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("evolution_webhook_url") || "https://axis-crm.cloud/api/webhooks/whatsapp";
    }
    return "https://axis-crm.cloud/api/webhooks/whatsapp";
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [robotStatus, setRobotStatus] = useState<'executando' | 'pausado'>('executando');

  const [squads, setSquads] = useState<Squad[]>([]);

  useEffect(() => {
    if (!supabase) localStorage.setItem('axis_squads_v2', JSON.stringify(squads));
  }, [squads]);

  const addSquad = async (squad: Omit<Squad, 'id'>) => {
    const newSquad = { ...squad, id: `sq${Math.random().toString(36).substring(2, 9)}` };
    setSquads(prev => [...prev, newSquad]);
    toast.success('Novo squad comercial criado!');
    if (supabase) {
      try {
        const { id, nome, meta, orcamentoMensal, faturamentoAlcancado, sdrCount, closersCount, focoComercial, membros } = newSquad as any;
        await supabase.from('squads').insert({
          id, nome, meta, orcamento_mensal: orcamentoMensal, faturamento_alcancado: faturamentoAlcancado, sdr_count: sdrCount, closers_count: closersCount, foco_comercial: focoComercial, membros
        });
      } catch (err) {
        console.error("Supabase add squad failed:", err);
      }
    }
  };

  const updateSquad = async (id: string, updates: Partial<Squad>) => {
    setSquads(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (supabase) {
      try {
        const payload: any = { ...updates };
        if ('orcamentoMensal' in payload) payload.orcamento_mensal = payload.orcamentoMensal;
        if ('faturamentoAlcancado' in payload) payload.faturamento_alcancado = payload.faturamentoAlcancado;
        if ('sdrCount' in payload) payload.sdr_count = payload.sdrCount;
        if ('closersCount' in payload) payload.closers_count = payload.closersCount;
        if ('focoComercial' in payload) payload.foco_comercial = payload.focoComercial;
        delete payload.orcamentoMensal; delete payload.faturamentoAlcancado; delete payload.sdrCount; delete payload.closersCount; delete payload.focoComercial;
        await supabase.from('squads').update(payload).eq('id', id);
      } catch (err) {
        console.error("Supabase update squad failed:", err);
      }
    }
  };

  const deleteSquad = async (id: string) => {
    setSquads(prev => prev.filter(s => s.id !== id));
    toast.info('Squad removido.');
    if (supabase) {
      try {
        await supabase.from('squads').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete squad failed:", err);
      }
    }
  };

  const updateEvolutionWebhookUrl = (url: string) => {
    setEvolutionWebhookUrl(url);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("evolution_webhook_url", url);
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [marketingAutomations, setMarketingAutomations] = useState<any[]>([]);
  const [marketingContent, setMarketingContent] = useState<any[]>([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState<any[]>([]);
  const [marketingLandingPages, setMarketingLandingPages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [squadMetas, setSquadMetas] = useState<any[]>([]);

  const addStudent = async (student: any) => {
    const newStudent = { ...student, id: `st${Math.random().toString(36).substring(2, 9)}` };
    setStudents(prev => [...prev, newStudent]);
    if (supabase) await supabase.from('students').insert(newStudent);
  };

  const updateStudent = async (id: string, updates: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (supabase) await supabase.from('students').update(updates).eq('id', id);
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (supabase) await supabase.from('students').delete().eq('id', id);
  };

  // Persistence & Supabase Synchronization
  const fetchTableData = async (tableName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!supabase) return;
    const { data } = await supabase.from(tableName).select('*');
    if (data) setter(data);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      if (!supabase) return;
      const reachable = await isSupabaseReachable();
      if (!reachable) return;

      channel = supabase.channel('global-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [payload.new as Lead, ...prev]);
            toast.info(`Novo lead: ${payload.new.name}`, { description: 'Recebido via Realtime' });
          } else {
            fetchTableData('leads', setLeads);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTableData('tasks', setTasks))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => fetchTableData('contracts', setContracts))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_entries' }, () => fetchTableData('finance_entries', setFinanceEntries))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'squads' }, () => fetchTableData('squads', setSquads))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchTableData('appointments', setAppointments))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchTableData('products', setProducts))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, () => fetchTableData('proposals', setProposals))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'turmas' }, () => fetchTableData('turmas', setTurmas))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetchTableData('students', setStudents))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'colaboradores' }, () => fetchTableData('colaboradores', setColaboradores))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'squad_metas' }, () => fetchTableData('squad_metas', setSquadMetas))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => fetchTableData('certificates', setCertificates))
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      // Check if Supabase is configured AND actually reachable
      if (supabase) {
        const reachable = await isSupabaseReachable();

        if (!reachable) {
          console.warn('[Axis] Supabase não está acessível (projeto pausado ou URL inválida). Usando localStorage como fallback.');
          // Fall through to localStorage loading below
        } else {
          try {
            // Clear stale localStorage mock data so Supabase always wins
            ['axis_leads', 'axis_tasks', 'axis_contracts', 'axis_lead_activities',
              'axis_finance_entries', 'axis_appointments', 'axis_squads'].forEach(k => localStorage.removeItem(k));

            const [
              leadsRes, tasksRes, contractsRes, actsRes, financeRes, apptRes, squadsRes,
              notifRes, mktCampRes, mktContRes, mktLpRes, settingsRes,
              productsRes, proposalsRes, turmasRes, studentsRes, colabRes, squadMetasRes, certRes
            ] = await Promise.all([
              supabase.from('leads').select('*'),
              supabase.from('tasks').select('*'),
              supabase.from('contracts').select('*'),
              supabase.from('lead_activities').select('*'),
              supabase.from('finance_entries').select('*'),
              supabase.from('appointments').select('*'),
              supabase.from('squads').select('*'),
              supabase.from('notifications').select('*'),
              supabase.from('marketing_campaigns').select('*'),
              supabase.from('marketing_content').select('*'),
              supabase.from('marketing_landing_pages').select('*'),
              supabase.from('app_settings').select('*'),
              supabase.from('products').select('*'),
              supabase.from('proposals').select('*'),
              supabase.from('turmas').select('*'),
              supabase.from('students').select('*'),
              supabase.from('colaboradores').select('*'),
              supabase.from('squad_metas').select('*'),
              supabase.from('certificates').select('*')
            ]);

            if (!leadsRes.error && leadsRes.data !== null) setLeads(leadsRes.data as Lead[]);
            if (!tasksRes.error && tasksRes.data !== null) setTasks(tasksRes.data as Task[]);
            if (!contractsRes.error && contractsRes.data !== null) setContracts(contractsRes.data as Contract[]);
            if (!actsRes.error && actsRes.data !== null) setLeadActivities(actsRes.data as LeadActivity[]);
            if (!financeRes.error && financeRes.data !== null) setFinanceEntries(financeRes.data as FinanceEntry[]);
            if (!apptRes.error && apptRes.data !== null) setAppointments(apptRes.data as Appointment[]);
            if (!squadsRes.error && squadsRes.data !== null) setSquads(squadsRes.data as Squad[]);
            if (!notifRes.error && notifRes.data !== null && notifRes.data.length > 0) setNotifications(notifRes.data as Notification[]);
            if (!mktCampRes.error && mktCampRes.data !== null) setMarketingCampaigns(mktCampRes.data);
            if (!mktContRes.error && mktContRes.data !== null) setMarketingContent(mktContRes.data);
            if (!mktLpRes.error && mktLpRes.data !== null) setMarketingLandingPages(mktLpRes.data);

            if (!productsRes.error && productsRes.data !== null) setProducts(productsRes.data);
            if (!proposalsRes.error && proposalsRes.data !== null) setProposals(proposalsRes.data);
            if (!turmasRes.error && turmasRes.data !== null) setTurmas(turmasRes.data);
            if (!studentsRes.error && studentsRes.data !== null) setStudents(studentsRes.data);
            if (!colabRes.error && colabRes.data !== null) setColaboradores(colabRes.data);
            if (!squadMetasRes.error && squadMetasRes.data !== null) setSquadMetas(squadMetasRes.data);
            if (!certRes.error && certRes.data !== null) setCertificates(certRes.data);

            if (!settingsRes.error && settingsRes.data !== null) {
              settingsRes.data.forEach((setting: any) => {
                switch (setting.key) {
                  case 'globalWebhooks': setGlobalWebhooks(setting.value); break;
                  case 'customLeadFields': setCustomLeadFields(setting.value); break;
                  case 'leadScoreTriggers': setLeadScoreTriggers(setting.value); break;
                }
              });
            }
          } catch (err) {
            console.warn("Supabase fetch failed, keeping empty state.", err);
          }
          return; // exit early — Supabase loaded successfully
        }
      }

      // Fallback: no Supabase — use localStorage only
      const savedLeads = localStorage.getItem('axis_leads');
      const savedTasks = localStorage.getItem('axis_tasks');
      const savedContracts = localStorage.getItem('axis_contracts');
      const savedNotifications = localStorage.getItem('axis_notifications');
      const savedActivities = localStorage.getItem('axis_lead_activities');
      const savedFinance = localStorage.getItem('axis_finance_entries');
      const savedAppts = localStorage.getItem('axis_appointments');
      const savedSquads = localStorage.getItem('axis_squads_v2');

      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedContracts) setContracts(JSON.parse(savedContracts));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedActivities) setLeadActivities(JSON.parse(savedActivities));
      if (savedFinance) setFinanceEntries(JSON.parse(savedFinance));
      if (savedAppts) setAppointments(JSON.parse(savedAppts));
      if (savedSquads) setSquads(JSON.parse(savedSquads));
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (supabase) return; // Supabase is source of truth; skip localStorage persistence
    localStorage.setItem('axis_leads', JSON.stringify(leads));
    localStorage.setItem('axis_tasks', JSON.stringify(tasks));
    localStorage.setItem('axis_contracts', JSON.stringify(contracts));
    localStorage.setItem('axis_notifications', JSON.stringify(notifications));
    localStorage.setItem('axis_lead_activities', JSON.stringify(leadActivities));
    localStorage.setItem('axis_finance_entries', JSON.stringify(financeEntries));
    localStorage.setItem('axis_appointments', JSON.stringify(appointments));
  }, [leads, tasks, contracts, notifications, leadActivities, financeEntries, appointments]);

  useEffect(() => {
    localStorage.setItem('axis_marketing_automations', JSON.stringify(marketingAutomations));
    if (!supabase) {
      localStorage.setItem('axis_marketing_campaigns', JSON.stringify(marketingCampaigns));
      localStorage.setItem('axis_marketing_content', JSON.stringify(marketingContent));
      localStorage.setItem('axis_marketing_landing_pages', JSON.stringify(marketingLandingPages));
    }
  }, [marketingAutomations, marketingCampaigns, marketingContent, marketingLandingPages]);

  useEffect(() => {
    localStorage.setItem('axis_products', JSON.stringify(products));
    localStorage.setItem('axis_proposals', JSON.stringify(proposals));
    localStorage.setItem('axis_certificates', JSON.stringify(certificates));
    localStorage.setItem('axis_turmas', JSON.stringify(turmas));
    localStorage.setItem('axis_colaboradores', JSON.stringify(colaboradores));
    localStorage.setItem('axis_squad_metas_v2', JSON.stringify(squadMetas));
  }, [products, proposals, certificates, turmas, colaboradores, squadMetas]);

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

          if (diffMins >= 28 && diffMins <= 32 && !notifiedRemindersRef.current[apt.id]) {
            notifiedRemindersRef.current[apt.id] = true;
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

    const interval = setInterval(checkTeleconsultations, 30000);
    return () => clearInterval(interval);
  }, [appointments]);

  const notifsRef = React.useRef(notifications);
  useEffect(() => {
    notifsRef.current = notifications;
  }, [notifications]);

  // Automated real-time checking effect for critical events
  useEffect(() => {
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

    tasks.forEach(t => {
      if (t.status === "Atrasado") {
        const hasOverdueNotif = notifsRef.current.some(
          n => n.category === "Produtividade" &&
            n.title.toLowerCase().includes("atrasa") &&
            n.desc.includes(t.title)
        );

        if (!hasOverdueNotif) {
          console.log(`[DISPARO DE E-MAIL] Assunto: Alerta: Tarefa Atrasada - ${t.title}`);
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
          title: "Meta Próxima (90%+)",
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
        notifiedSquadsRef.current[sq.id] = false;
      }
    });
  }, [squads]);

  const simulateNewLeadAssignment = () => {
    const sellersList = ["Carlos Eduardo Mendes", "Ana Silva", "Roberto Ramos", "Juliana Costa"];
    const randomSeller = sellersList[Math.floor(Math.random() * sellersList.length)];
    if (leads.length === 0) return;
    const randomLead = leads[Math.floor(Math.random() * leads.length)];
    updateLead(randomLead.id, { seller: randomSeller });
  };

  const simulateOverdueTask = () => {
    const taskTitles = [
      "Retornar ligação de proposta comercial",
      "Validar orçamento com diretoria financeira",
      "Enviar cronograma de escopo e implantação"
    ];
    const clients = ["TechCorp Brasil", "Construtora RS", "Clínica Vida"];
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

  const parseTaskDate = (dateStr: string): Date => {
    const now = new Date();
    if (!dateStr) return now;
    const directDate = new Date(dateStr);
    if (!isNaN(directDate.getTime())) return directDate;

    const lower = dateStr.toLowerCase();
    if (lower.includes("hoje")) return now;
    if (lower.includes("amanhã") || lower.includes("amanha")) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;
    }
    return now;
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
        setLeads(prev => prev.map(l => l.id === leadId ? {
          ...l,
          scoreIA: result.scoreIA,
          temperature: result.temperature,
          iaSummary: result.iaSummary,
          stageId: (l.pipelineId === 'sdr' && (!l.stageId || l.stageId === 's1' || l.stageId === 's2')) ? 's_qual' : l.stageId
        } : l));

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
    setTimeout(() => { triggerScoreRecalculation(newLead.id); }, 400);
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
      setTimeout(() => { triggerScoreRecalculation(id); }, 400);
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
    setTimeout(() => { triggerScoreRecalculation(leadId); }, 400);
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
    triggerScoreRecalculation(leadId, leads, updatedActivities);
  };

  const getSmartInsight = async (context: string, data: any): Promise<string> => {
    try {
      const response = await fetch("/api/ai/generic-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, data })
      });
      if (!response.ok) throw new Error("IA offline");
      const result = await response.json();
      return result.insight || "Análise concluída com sucesso.";
    } catch (err) {
      return "Erro na conexão com o motor neural da Master IA.";
    }
  };

  const createCrudHelper = (tableName: string, stateSetter: React.Dispatch<React.SetStateAction<any[]>>) => {
    return {
      add: async (item: any) => {
        stateSetter(prev => [item, ...prev]);
        if (supabase) {
          try { await supabase.from(tableName).insert(item); }
          catch (err) { console.error(`Supabase add ${tableName} failed:`, err); }
        }
      },
      update: async (id: string, updates: any) => {
        stateSetter(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        if (supabase) {
          try { await supabase.from(tableName).update(updates).eq('id', id); }
          catch (err) { console.error(`Supabase update ${tableName} failed:`, err); }
        }
      },
      del: async (id: string) => {
        stateSetter(prev => prev.filter(item => item.id !== id));
        if (supabase) {
          try { await supabase.from(tableName).delete().eq('id', id); }
          catch (err) { console.error(`Supabase delete ${tableName} failed:`, err); }
        }
      }
    };
  };

  const productCrud = createCrudHelper('products', setProducts);
  const proposalCrud = createCrudHelper('proposals', setProposals);
  const turmaCrud = createCrudHelper('turmas', setTurmas);
  const studentCrud = createCrudHelper('students', setStudents);
  const colabCrud = createCrudHelper('colaboradores', setColaboradores);
  const mktCampCrud = createCrudHelper('marketing_campaigns', setMarketingCampaigns);
  const mktContCrud = createCrudHelper('marketing_content', setMarketingContent);
  const mktLpCrud = createCrudHelper('marketing_landing_pages', setMarketingLandingPages);
  const mktAutoCrud = createCrudHelper('marketing_automations', setMarketingAutomations);
  const squadMetaCrud = createCrudHelper('squad_metas', setSquadMetas);

  const addFinanceEntry = async (entry: Omit<FinanceEntry, 'id'>) => {
    const newEntry = { ...entry, id: `f${Math.random().toString(36).substring(2, 9)}` };
    setFinanceEntries(prev => [newEntry, ...prev]);
    toast.success(`${entry.type === 'Pagar' ? 'Despesa' : 'Receita'} registrada!`);
    if (supabase) {
      try {
        await supabase.from('finance_entries').insert(newEntry);
      } catch (err) {
        console.error("Supabase add finance_entries failed:", err);
      }
    }
  };

  const deleteFinanceEntry = async (id: string) => {
    setFinanceEntries(prev => prev.filter(f => f.id !== id));
    toast.info('Lançamento financeiro removido.');
    if (supabase) {
      try {
        await supabase.from('finance_entries').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete finance_entries failed:", err);
      }
    }
  };

  const updateFinanceEntry = async (id: string, updates: Partial<FinanceEntry>) => {
    setFinanceEntries(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    if (supabase) {
      try {
        await supabase.from('finance_entries').update(updates).eq('id', id);
      } catch (err) {
        console.error("Supabase update finance_entries failed:", err);
      }
    }
  };

  const addAppointment = async (apt: Omit<Appointment, 'id'>) => {
    const newApt = { ...apt, id: Math.random().toString(36).substr(2, 9) };
    setAppointments(prev => [newApt, ...prev]);
    toast.success('Agendamento realizado!');
    if (supabase) {
      try {
        const { id, patient, phone, drId, drName, specialty, room, type, status, date, time } = newApt as any;
        await supabase.from('appointments').insert({
          id, patient, phone, dr_id: drId, dr_name: drName, specialty, room, type, status, date, time
        });
      } catch (err) {
        console.error("Supabase add appointment failed:", err);
      }
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (supabase) {
      try {
        const payload: any = { ...updates };
        if ('drId' in payload) payload.dr_id = payload.drId;
        if ('drName' in payload) payload.dr_name = payload.drName;
        delete payload.drId; delete payload.drName;
        await supabase.from('appointments').update(payload).eq('id', id);
      } catch (err) {
        console.error("Supabase update appointment failed:", err);
      }
    }
  };

  const deleteAppointment = async (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    toast.info('Agendamento removido.');
    if (supabase) {
      try {
        await supabase.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.error("Supabase delete appointment failed:", err);
      }
    }
  };

  return (
    <DataContext.Provider value={{
      leads, tasks, contracts, notifications, leadActivities, financeEntries, appointments,
      theme, toggleTheme,
      addLead, updateLead, deleteLead, moveLead,
      addTask, updateTask, deleteTask, addContract, deleteContract,
      addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      addLeadActivity,
      getSmartInsight,
      addFinanceEntry, deleteFinanceEntry, updateFinanceEntry,
      addAppointment, updateAppointment, deleteAppointment,
      simulateNewLeadAssignment,
      simulateOverdueTask,
      evolutionWebhookUrl,
      setEvolutionWebhookUrl: updateEvolutionWebhookUrl,
      robotStatus,
      setRobotStatus,
      customLeadFields,
      setCustomLeadFields: updateCustomLeadFields,
      leadScoreTriggers,
      setLeadScoreTriggers: updateLeadScoreTriggers,
      globalWebhooks,
      addGlobalWebhook,
      deleteGlobalWebhook,
      toggleGlobalWebhook,
      squads,
      updateSquad,
      addSquad,
      deleteSquad,
      marketingAutomations,
      setMarketingAutomations,
      addMarketingAutomation: mktAutoCrud.add,
      updateMarketingAutomation: mktAutoCrud.update,
      deleteMarketingAutomation: mktAutoCrud.del,
      marketingContent,
      setMarketingContent,
      addMarketingContent: mktContCrud.add,
      updateMarketingContent: mktContCrud.update,
      deleteMarketingContent: mktContCrud.del,
      marketingCampaigns,
      setMarketingCampaigns,
      addMarketingCampaign: mktCampCrud.add,
      updateMarketingCampaign: mktCampCrud.update,
      deleteMarketingCampaign: mktCampCrud.del,
      marketingLandingPages,
      setMarketingLandingPages,
      addMarketingLandingPage: mktLpCrud.add,
      updateMarketingLandingPage: mktLpCrud.update,
      deleteMarketingLandingPage: mktLpCrud.del,
      products,
      setProducts,
      addProduct: productCrud.add,
      updateProduct: productCrud.update,
      deleteProduct: productCrud.del,
      proposals,
      setProposals,
      addProposal: proposalCrud.add,
      updateProposal: proposalCrud.update,
      deleteProposal: proposalCrud.del,
      certificates,
      setCertificates,
      turmas,
      setTurmas,
      addTurma: turmaCrud.add,
      updateTurma: turmaCrud.update,
      deleteTurma: turmaCrud.del,
      students,
      setStudents,
      addStudent: studentCrud.add,
      updateStudent: studentCrud.update,
      deleteStudent: studentCrud.del,
      colaboradores,
      setColaboradores,
      addColaborador: colabCrud.add,
      updateColaborador: colabCrud.update,
      deleteColaborador: colabCrud.del,
      squadMetas,
      setSquadMetas,
      addSquadMeta: squadMetaCrud.add,
      updateSquadMeta: squadMetaCrud.update,
      deleteSquadMeta: squadMetaCrud.del,
    }}>
      {children}
    </DataContext.Provider>
  );
}
