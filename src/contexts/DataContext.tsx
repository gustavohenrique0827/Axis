import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendPushNotification } from "../lib/notifications";
import { isSupabaseReachable, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
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
import { DataContext, DataContextType, LeadActivity, Notification, Appointment, GlobalWebhook, FinanceEntry, Reuniao, useData } from './DataContextTypes';
import { apiFetch } from "../lib/apiClient";

export { useData };
export type { DataContextType, LeadActivity, Notification, Appointment, GlobalWebhook, FinanceEntry, Reuniao };

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAuth();
  const tenantId = user?.tenantId;

  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('axis_theme') as 'dark' | 'light') || 'light'
  );

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('axis_theme', next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const DEFAULT_SIDEBAR_MODULES = {
    crm: true,
    educacao: true,
    produtividade: true,
    financeiro: true,
    catalogo: true,
    marketing: true,
    engajamento: true,
    rh: true,
    bi: true,
    clinica: true,
  };

  const [sidebarModules, setSidebarModulesState] = useState<Record<string, boolean>>(DEFAULT_SIDEBAR_MODULES);

  const [customLeadFields, setCustomLeadFields] = useState<CustomField[]>(defaultCustomLeadFields);

  const updateCustomLeadFields = (fields: CustomField[]) => {
    setCustomLeadFields(fields);
    syncSetting('customLeadFields', fields);
  };

  const [leadScoreTriggers, setLeadScoreTriggers] = useState<LeadScoreTrigger[]>(defaultLeadScoreTriggers);

  const updateLeadScoreTriggers = (triggers: LeadScoreTrigger[]) => {
    setLeadScoreTriggers(triggers);
    syncSetting('leadScoreTriggers', triggers);
  };

  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);

  // Mapa genérico key -> value de app_settings, para telas de configuração
  // que não precisam de um campo dedicado no contexto (ver saveAppSetting).
  const [appSettings, setAppSettings] = useState<Record<string, any>>({});
  // Sinaliza que a busca inicial de app_settings já rodou (mesmo que não
  // exista nenhuma linha ainda) — telas que fazem auto-save de config
  // hidratada usam isso pra saber quando é seguro persistir, em vez de
  // inferir "carregou" só pela presença de uma chave específica (que nunca
  // existiria pra um tenant novo, travando o auto-save pra sempre).
  const [appSettingsLoaded, setAppSettingsLoaded] = useState(false);

  const syncSetting = async (key: string, value: any) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
    if (!supabase || !tenantId) return;
    try {
      // Escopado por tenant explicitamente — sem isso, duas empresas usando a
      // mesma "key" (ex.: "axis_sidebar_modules") acabariam lendo/sobrescrevendo
      // a configuração uma da outra.
      const { data } = await supabase.from('app_settings').select('id').eq('key', key).eq('tenant_id', tenantId).maybeSingle();
      if (data) {
        await supabase.from('app_settings').update({ value }).eq('id', data.id);
      } else {
        await supabase.from('app_settings').insert({ key, value, tenant_id: tenantId });
      }
    } catch (err) {
      console.error(`Supabase sync setting failed for ${key}:`, err);
    }
  };

  const saveAppSetting = async (key: string, value: any) => {
    if (supabase) {
      await syncSetting(key, value);
    }
  };

  const setSidebarModules = async (modules: Record<string, boolean>) => {
    setSidebarModulesState(modules);
    await saveAppSetting('axis_sidebar_modules', modules);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('axis_modules_changed', { detail: modules }));
    }
  };

  const [globalWebhooks, setGlobalWebhooks] = useState<GlobalWebhook[]>(defaultGlobalWebhooks);

  const addGlobalWebhook = (webhook: Omit<GlobalWebhook, 'id'>) => {
    const newVal = [{ ...webhook, id: `w${Math.random().toString(36).substring(2, 9)}` }, ...globalWebhooks];
    setGlobalWebhooks(newVal);
    syncSetting('globalWebhooks', newVal);
  };

  const updateGlobalWebhook = (id: string, updates: Partial<GlobalWebhook>) => {
    const newVal = globalWebhooks.map(w => w.id === id ? { ...w, ...updates } : w);
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
    const applyBrandColors = () => {
      const primary = "#2563EB";
      const secondary = "#0F172A";
      const accent = "#06B6D4";

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

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem("axis_leads");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultLeads;
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  const [evolutionWebhookUrl, setEvolutionWebhookUrl] = useState<string>("https://axis-crm.cloud/api/webhooks/whatsapp");

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [robotStatus, setRobotStatus] = useState<'executando' | 'pausado'>('executando');

  const [squads, setSquads] = useState<Squad[]>([]);

  const addSquad = async (squad: Omit<Squad, 'id'>) => {
    const newSquad = { ...squad, id: `sq${Math.random().toString(36).substring(2, 9)}` };
    setSquads(prev => [...prev, newSquad]);
    toast.success('Squad criado com sucesso!');
    if (supabase) {
      try {
        const { id, nome, departamento, focoComercial, membros, leader, cor, logo, membrosFuncoes, clientes } = newSquad as any;
        await supabase.from('squads').insert({
          id, nome,
          departamento: departamento || 'Geral',
          foco_comercial: focoComercial || '',
          membros: membros || [],
          leader: leader || '',
          cor: cor || '#6366f1',
          logo: logo || '',
          membros_funcoes: membrosFuncoes || {},
          clientes: clientes || [],
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
        if ('focoComercial' in payload) { payload.foco_comercial = payload.focoComercial; delete payload.focoComercial; }
        if ('membrosFuncoes' in payload) { payload.membros_funcoes = payload.membrosFuncoes; delete payload.membrosFuncoes; }
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
  };

  // ─── Funis do CRM (crm_funis) ────────────────────────────────────────────
  // Substitui o antigo "axis_funis_config" (localStorage + app_settings sem
  // filtro de tenant) pela tabela dedicada que já existia sem uso.
  const [funis, setFunis] = useState<any[]>([]);

  const rowToFunil = (r: any) => ({
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    etapas: r.etapas || [],
    etapasConfig: r.etapas_config?.length ? r.etapas_config : undefined,
    ativo: r.ativo,
    clientIds: r.client_ids || [],
    sdrEtapaEntrada: r.sdr_etapa_entrada || '',
    sdrEtapaHandoff: r.sdr_etapa_handoff || '',
    sdrScoreMinimo: r.sdr_score_minimo ?? 65,
    sdrDelayResposta: r.sdr_delay_resposta ?? 2,
    sdrMsgBoasVindas: r.sdr_msg_boas_vindas || '',
    sdrCriterioDesqualificacao: r.sdr_criterio_desqualificacao || 'sem_interesse',
  });

  const funilToRow = (f: any) => ({
    ...(f.id ? { id: f.id } : {}),
    ...(f.nome !== undefined ? { nome: f.nome } : {}),
    ...(f.tipo !== undefined ? { tipo: f.tipo } : {}),
    ...(f.etapas !== undefined ? { etapas: f.etapas } : {}),
    ...(f.etapasConfig !== undefined ? { etapas_config: f.etapasConfig || [] } : {}),
    ...(f.ativo !== undefined ? { ativo: f.ativo } : {}),
    ...(f.clientIds !== undefined ? { client_ids: f.clientIds || [] } : {}),
    ...(f.sdrEtapaEntrada !== undefined ? { sdr_etapa_entrada: f.sdrEtapaEntrada } : {}),
    ...(f.sdrEtapaHandoff !== undefined ? { sdr_etapa_handoff: f.sdrEtapaHandoff } : {}),
    ...(f.sdrScoreMinimo !== undefined ? { sdr_score_minimo: f.sdrScoreMinimo } : {}),
    ...(f.sdrDelayResposta !== undefined ? { sdr_delay_resposta: f.sdrDelayResposta } : {}),
    ...(f.sdrMsgBoasVindas !== undefined ? { sdr_msg_boas_vindas: f.sdrMsgBoasVindas } : {}),
    ...(f.sdrCriterioDesqualificacao !== undefined ? { sdr_criterio_desqualificacao: f.sdrCriterioDesqualificacao } : {}),
  });

  const fetchFunis = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('crm_funis').select('*');
    if (data) setFunis(data.map(rowToFunil));
  };

  const addFunil = async (f: any) => {
    const newFunil = { ...f, id: f.id || Math.random().toString(36).slice(2) };
    setFunis(prev => [...prev, newFunil]);
    if (supabase) {
      const { error } = await supabase.from('crm_funis').insert(funilToRow(newFunil));
      if (error) { console.error('[Supabase] insert crm_funis error:', error.message); toast.error(`Erro ao salvar funil: ${error.message}`); }
    }
  };

  const updateFunil = async (id: string, updates: any) => {
    setFunis(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    if (supabase) {
      const { error } = await supabase.from('crm_funis').update(funilToRow(updates)).eq('id', id);
      if (error) console.error('[Supabase] update crm_funis error:', error.message);
    }
  };

  const deleteFunil = async (id: string) => {
    setFunis(prev => prev.filter(f => f.id !== id));
    if (supabase) {
      const { error } = await supabase.from('crm_funis').delete().eq('id', id);
      if (error) console.error('[Supabase] delete crm_funis error:', error.message);
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
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [squadMetas, setSquadMetas] = useState<any[]>([]);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [empresaFiliais, setEmpresaFiliais] = useState<any[]>([]);
  const [financeCommissionEntries, setFinanceCommissionEntries] = useState<any[]>([]);
  const [financeCategories, setFinanceCategories] = useState<any[]>([]);
  const [scheduledExports, setScheduledExports] = useState<any[]>([]);
  const [educationContent, setEducationContent] = useState<any[]>([]);
  const [clienteBase, setClienteBase] = useState<any[]>([]);

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
    let channel: any = null;

    async function setupRealtime() {
      if (!supabase) return;

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_goals' }, () => fetchTableData('financial_goals', setFinancialGoals))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cargos' }, () => fetchTableData('cargos', setCargos))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => fetchTableData('certificates', setCertificates))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reunioes' }, () => fetchTableData('reunioes', setReunioes as any))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_funis' }, () => fetchFunis())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'empresa_filiais' }, () => fetchTableData('empresa_filiais', setEmpresaFiliais))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_commission_entries' }, () => fetchTableData('finance_commission_entries', setFinanceCommissionEntries))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_categories' }, () => fetchTableData('finance_categories', setFinanceCategories))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_exports' }, () => fetchTableData('scheduled_exports', setScheduledExports))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'education_content' }, () => fetchTableData('education_content', setEducationContent))
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      // Aguarda a sessão resolver e o tenant ser conhecido antes de buscar
      // dados — evita disparar a carga como "anon" (RLS devolveria tudo
      // vazio) numa corrida contra o login, já que este efeito não reroda
      // sozinho depois (dependências abaixo cobrem isso quando o tenant muda).
      if (supabase && !authLoading && tenantId) {
        console.log('[DataContext] 🔄 Carregando dados do Supabase (tenant ' + tenantId + ')...');
        try {
            const [
              leadsRes, tasksRes, contractsRes, actsRes, financeRes, apptRes, squadsRes,
              notifRes, mktCampRes, mktContRes, mktLpRes, settingsRes,
              productsRes, proposalsRes, turmasRes, studentsRes, colabRes, squadMetasRes, certRes, cargosRes,
              clienteBaseRes, reunioesRes, financialGoalsRes, funisRes, filiaisRes,
              commissionEntriesRes, financeCategoriesRes, scheduledExportsRes, educationContentRes
            ] = await Promise.all([
              supabase.from('leads').select('*').eq('tenant_id', tenantId),
              supabase.from('tasks').select('*').eq('tenant_id', tenantId),
              supabase.from('contracts').select('*').eq('tenant_id', tenantId),
              supabase.from('lead_activities').select('*').eq('tenant_id', tenantId),
              supabase.from('finance_entries').select('*').eq('tenant_id', tenantId),
              supabase.from('appointments').select('*').eq('tenant_id', tenantId),
              supabase.from('squads').select('*').eq('tenant_id', tenantId),
              supabase.from('notifications').select('*').eq('tenant_id', tenantId),
              supabase.from('marketing_campaigns').select('*').eq('tenant_id', tenantId),
              supabase.from('marketing_content').select('*').eq('tenant_id', tenantId),
              supabase.from('marketing_landing_pages').select('*').eq('tenant_id', tenantId),
              // app_settings inclui linhas globais (tenant_id IS NULL) por design — filtro fica só a cargo da RLS aqui.
              supabase.from('app_settings').select('*'),
              supabase.from('products').select('*').eq('tenant_id', tenantId),
              supabase.from('proposals').select('*').eq('tenant_id', tenantId),
              supabase.from('turmas').select('*').eq('tenant_id', tenantId),
              supabase.from('students').select('*').eq('tenant_id', tenantId),
              supabase.from('colaboradores').select('*').eq('tenant_id', tenantId),
              supabase.from('squad_metas').select('*').eq('tenant_id', tenantId),
              supabase.from('certificates').select('*').eq('tenant_id', tenantId),
              supabase.from('cargos').select('*').eq('tenant_id', tenantId),
              supabase.from('clientes').select('*').eq('tenant_id', tenantId),
              supabase.from('reunioes').select('*').eq('tenant_id', tenantId),
              supabase.from('financial_goals').select('*').eq('tenant_id', tenantId),
              supabase.from('crm_funis').select('*').eq('tenant_id', tenantId),
              supabase.from('empresa_filiais').select('*').eq('tenant_id', tenantId),
              supabase.from('finance_commission_entries').select('*').eq('tenant_id', tenantId),
              supabase.from('finance_categories').select('*').eq('tenant_id', tenantId),
              supabase.from('scheduled_exports').select('*').eq('tenant_id', tenantId),
              supabase.from('education_content').select('*').eq('tenant_id', tenantId),
            ]);

            if (!leadsRes.error && leadsRes.data && leadsRes.data.length > 0) setLeads(leadsRes.data as Lead[]);
            if (!tasksRes.error && tasksRes.data) setTasks(tasksRes.data as Task[]);
            if (!actsRes.error && actsRes.data) setLeadActivities(actsRes.data as LeadActivity[]);
            if (!financeRes.error && financeRes.data) setFinanceEntries(financeRes.data as FinanceEntry[]);
            if (!apptRes.error && apptRes.data) setAppointments(apptRes.data as Appointment[]);
            if (!squadsRes.error && squadsRes.data) setSquads(squadsRes.data.map((r: any): Squad => ({
              id: r.id, nome: r.nome,
              departamento: r.departamento || 'Geral',
              focoComercial: r.foco_comercial || '',
              membros: r.membros || [],
              leader: r.leader || '',
              cor: r.cor || '#6366f1',
              logo: r.logo || '',
              membrosFuncoes: r.membros_funcoes || {},
              clientes: r.clientes || [],
            })));
            if (!notifRes.error && notifRes.data) setNotifications(notifRes.data as Notification[]);
            if (!mktCampRes.error && mktCampRes.data) setMarketingCampaigns(mktCampRes.data);
            if (!mktContRes.error && mktContRes.data) setMarketingContent(mktContRes.data);
            if (!mktLpRes.error && mktLpRes.data) setMarketingLandingPages(mktLpRes.data);
            if (!productsRes.error && productsRes.data) setProducts(productsRes.data);
            if (!proposalsRes.error && proposalsRes.data) setProposals(proposalsRes.data);
            if (!turmasRes.error && turmasRes.data) setTurmas(turmasRes.data);
            if (!studentsRes.error && studentsRes.data) setStudents(studentsRes.data);
            if (colabRes.error) console.error('[Supabase] colaboradores load error:', colabRes.error.message);
            else if (colabRes.data) setColaboradores(colabRes.data);
            if (!squadMetasRes.error && squadMetasRes.data) setSquadMetas(squadMetasRes.data);
            if (!financialGoalsRes.error && financialGoalsRes.data) setFinancialGoals(financialGoalsRes.data);
            if (!certRes.error && certRes.data) setCertificates(certRes.data);
            if (!cargosRes.error && cargosRes.data) setCargos(cargosRes.data);
            if (!clienteBaseRes.error && clienteBaseRes.data) setClienteBase(clienteBaseRes.data);
            if (!reunioesRes.error && reunioesRes.data) setReunioes(reunioesRes.data as Reuniao[]);
            if (!funisRes.error && funisRes.data) setFunis(funisRes.data.map(rowToFunil));
            if (!filiaisRes.error && filiaisRes.data) setEmpresaFiliais(filiaisRes.data);
            if (!commissionEntriesRes.error && commissionEntriesRes.data) setFinanceCommissionEntries(commissionEntriesRes.data);
            if (!financeCategoriesRes.error && financeCategoriesRes.data) setFinanceCategories(financeCategoriesRes.data);
            if (!scheduledExportsRes.error && scheduledExportsRes.data) setScheduledExports(scheduledExportsRes.data);
            if (!educationContentRes.error && educationContentRes.data) setEducationContent(educationContentRes.data);

            if (!settingsRes.error && settingsRes.data) {
              const settingsMap: Record<string, any> = {};
              settingsRes.data.forEach((setting: any) => {
                settingsMap[setting.key] = setting.value;
                switch (setting.key) {
                  case 'globalWebhooks': setGlobalWebhooks(setting.value); break;
                  case 'customLeadFields': setCustomLeadFields(setting.value); break;
                  case 'leadScoreTriggers': setLeadScoreTriggers(setting.value); break;
                  case 'axis_sidebar_modules': setSidebarModulesState(setting.value); break;
                }
              });
              setAppSettings(settingsMap);
              setAppSettingsLoaded(true);
            }
            console.log('[DataContext] ✅ Dados carregados do Supabase.');
        } catch (err) {
          console.error('[DataContext] ❌ Erro ao fetch Supabase:', err);
        }
      }
    }
    loadInitialData();
  }, [authLoading, tenantId]);

  useEffect(() => {
    if (leads && leads.length > 0) {
      localStorage.setItem("axis_leads", JSON.stringify(leads));
    }
  }, [leads]);

  useEffect(() => {
    if (colaboradores && colaboradores.length > 0) {
      localStorage.setItem("axis_colaboradores", JSON.stringify(colaboradores));
    }
  }, [colaboradores]);

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
              seller: lead.seller || "",
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
      if (!sq.meta || !sq.faturamentoAlcancado) return;
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
    const uniqueSellers = Array.from(new Set(leads.map(l => l.seller).filter(Boolean)));
    if (leads.length === 0 || uniqueSellers.length === 0) return;
    const randomSeller = uniqueSellers[Math.floor(Math.random() * uniqueSellers.length)];
    const randomLead = leads[Math.floor(Math.random() * leads.length)];
    updateLead(randomLead.id, { seller: randomSeller });
  };

  const simulateOverdueTask = () => {
    if (leads.length === 0) return;
    const randomLead = leads[Math.floor(Math.random() * leads.length)];
    const uniqueSellers = Array.from(new Set(leads.map(l => l.seller).filter(Boolean)));
    const randomSeller = uniqueSellers.length > 0
      ? uniqueSellers[Math.floor(Math.random() * uniqueSellers.length)]
      : "";

    const newTask: Omit<Task, 'id'> = {
      title: "Retornar contato com lead",
      related: randomLead.company || randomLead.name,
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
      const response = await apiFetch("/api/leads/calculate-score", {
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
    if (!tenantId) {
      toast.error('Sessão não identificou um tenant — recarregue a página e tente novamente.');
      return;
    }
    const newId = crypto.randomUUID();
    const newLead = { ...lead, id: newId, scoreIA: 50 };
    setLeads(prev => [newLead, ...prev]);
    toast.success('Novo lead adicionado com sucesso!');
    addNotification({
      title: "Novo Lead",
      desc: `${lead.name} da empresa ${lead.company} foi adicionado.`,
      type: "success"
    });

    if (supabase) {
      try {
        // Parse numeric value: strip "R$ " prefix before saving
        const rawValue = typeof lead.value === 'string'
          ? parseFloat(lead.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          : (lead.value ?? 0);

        const dbPayload = {
          id: newId,
          name: lead.name,
          company: lead.company ?? '',
          email: lead.email ?? '',
          phone: lead.phone ?? '',
          cnpj: lead.cnpj ?? '',
          seller: lead.seller ?? '',
          title: lead.title ?? '',
          date: lead.date ?? '',
          status: lead.status ?? 'Novo',
          priority: lead.priority ?? 'Média',
          temperature: lead.temperature ?? undefined,
          value: rawValue,
          stageId: lead.stageId ?? '1',
          pipelineId: lead.pipelineId ?? 'comercial',
          scoreIA: 50,
          // Vem da sessão autenticada, nunca do caller — nunca null (ver guarda no início da função).
          tenant_id: tenantId,
          tenantName: lead.tenantName ?? '',
          lead_interesse_cliente: lead.lead_interesse_cliente ?? '',
          customFields: lead.customFields ?? {},
          clientId: lead.clientId ?? '',
          clientName: lead.clientName ?? '',
          source: lead.source ?? '',
          productIds: lead.productIds ?? [],
        };

        const { error } = await supabase.from('leads').insert(dbPayload);
        if (error) {
          console.error("Supabase add lead failed:", error.message, error.details);
        }
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
        // Strip unknown / non-DB fields and fix value type
        const { customTags, ...safeUpdates } = updates as any;
        if (safeUpdates.value !== undefined && typeof safeUpdates.value === 'string') {
          safeUpdates.value = parseFloat(safeUpdates.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        }
        const { error } = await supabase.from('leads').update(safeUpdates).eq('id', id);
        if (error) console.error("Supabase update lead failed:", error.message);
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
      const response = await apiFetch("/api/ai/generic-insight", {
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
          const { error } = await supabase.from(tableName).insert(item);
          if (error) {
            console.error(`[Supabase] insert ${tableName} error:`, error.message, error.details);
            toast.error(`Erro ao salvar: ${error.message}`);
          }
        }
      },
      update: async (id: string, updates: any) => {
        // Atualiza estado local imediatamente (optimistic update)
        stateSetter(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        if (supabase) {
          // Remove campos que podem causar conflito com triggers do banco
          const safeUpdates = { ...updates };
          delete safeUpdates.updated_at;
          const { error } = await supabase.from(tableName).update(safeUpdates).eq('id', id);
          if (error) {
            console.error(`[Supabase] update ${tableName} error:`, error.message);
            if (error.message?.includes('updated_at')) {
              console.warn(`[Supabase] Trigger issue on ${tableName} — execute a migration 20260827_fix_colaboradores_updated_at.sql no Supabase SQL Editor`);
            }
          }
        }
      },
      del: async (id: string) => {
        stateSetter(prev => prev.filter(item => item.id !== id));
        if (supabase) {
          const { error } = await supabase.from(tableName).delete().eq('id', id);
          if (error) console.error(`[Supabase] delete ${tableName} error:`, error.message);
        }
      }
    };
  };

  const productCrud = createCrudHelper('products', setProducts);
  const proposalCrud = createCrudHelper('proposals', setProposals);
  const turmaCrud = createCrudHelper('turmas', setTurmas);
  const reuniaoCrud = createCrudHelper('reunioes', setReunioes as any);
  const studentCrud = createCrudHelper('students', setStudents);
  const colabCrud = createCrudHelper('colaboradores', setColaboradores);
  const mktCampCrud = createCrudHelper('marketing_campaigns', setMarketingCampaigns);
  const mktContCrud = createCrudHelper('marketing_content', setMarketingContent);
  const mktLpCrud = createCrudHelper('marketing_landing_pages', setMarketingLandingPages);
  const mktAutoCrud = createCrudHelper('marketing_automations', setMarketingAutomations);
  const squadMetaCrud = createCrudHelper('squad_metas', setSquadMetas);
  const cargoCrud = createCrudHelper('cargos', setCargos);
  const empresaFilialCrud = createCrudHelper('empresa_filiais', setEmpresaFiliais);
  const commissionEntryCrud = createCrudHelper('finance_commission_entries', setFinanceCommissionEntries);
  const financeCategoryCrud = createCrudHelper('finance_categories', setFinanceCategories);
  const scheduledExportCrud = createCrudHelper('scheduled_exports', setScheduledExports);
  const educationContentCrud = createCrudHelper('education_content', setEducationContent);
  const certCrud = createCrudHelper('certificates', setCertificates);

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
      sidebarModules,
      setSidebarModules,
      saveAppSetting,
      appSettings,
      appSettingsLoaded,
      globalWebhooks,
      addGlobalWebhook,
      updateGlobalWebhook,
      deleteGlobalWebhook,
      toggleGlobalWebhook,
      squads,
      updateSquad,
      addSquad,
      deleteSquad,
      funis,
      addFunil,
      updateFunil,
      deleteFunil,
      empresaFiliais,
      addEmpresaFilial: empresaFilialCrud.add,
      updateEmpresaFilial: empresaFilialCrud.update,
      deleteEmpresaFilial: empresaFilialCrud.del,
      financeCommissionEntries,
      addFinanceCommissionEntry: commissionEntryCrud.add,
      updateFinanceCommissionEntry: commissionEntryCrud.update,
      deleteFinanceCommissionEntry: commissionEntryCrud.del,
      financeCategories,
      addFinanceCategory: financeCategoryCrud.add,
      updateFinanceCategory: financeCategoryCrud.update,
      deleteFinanceCategory: financeCategoryCrud.del,
      scheduledExports,
      addScheduledExport: scheduledExportCrud.add,
      updateScheduledExport: scheduledExportCrud.update,
      deleteScheduledExport: scheduledExportCrud.del,
      educationContent,
      addEducationContent: educationContentCrud.add,
      updateEducationContent: educationContentCrud.update,
      deleteEducationContent: educationContentCrud.del,
      addCertificate: certCrud.add,
      updateCertificate: certCrud.update,
      deleteCertificate: certCrud.del,
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
      reunioes,
      addReuniao: (r: Omit<Reuniao, 'id' | 'createdAt'>) => reuniaoCrud.add({ ...r, createdAt: new Date().toISOString() }),
      updateReuniao: reuniaoCrud.update,
      deleteReuniao: reuniaoCrud.del,
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
      financialGoals,
      cargos,
      setCargos,
      addCargo: cargoCrud.add,
      updateCargo: cargoCrud.update,
      deleteCargo: cargoCrud.del,
      clienteBase,
      setClienteBase,
    }}>
      {children}
    </DataContext.Provider>
  );
}
