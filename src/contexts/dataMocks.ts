import { Lead, Task, Contract, CustomField, LeadScoreTrigger, Squad, LeadActivity, FinanceEntry, GlobalWebhook, Notification, Appointment } from '../types';

export const defaultCustomLeadFields: CustomField[] = [
  { id: 'f1', name: 'Cargo', type: 'Texto', required: false },
  { id: 'f2', name: 'Número de Funcionários', type: 'Número', required: false }
];

export const defaultLeadScoreTriggers: LeadScoreTrigger[] = [];

export const defaultFinanceEntries: FinanceEntry[] = [
  { id: 'f1', description: 'Aluguel AWS SaaS', category: 'Infraestrutura', status: 'A Vencer', value: 3200, type: 'Pagar', date: '25/05/2026' },
  { id: 'f2', description: 'Resend / Emails', category: 'Ferramentas', status: 'Pago', value: 420, type: 'Pagar', date: '20/05/2026' },
  { id: 'f3', description: 'Impostos NFS-e', category: 'Tributos', status: 'A Vencer', value: 1840, type: 'Pagar', date: '28/05/2026' },
  { id: 'f4', description: 'Mensalidade TechCorp', category: 'Serviços', status: 'Pago', value: 4500, type: 'Receber', date: '10/05/2026' },
  { id: 'f5', description: 'Consultoria RS Setp', category: 'Projetos', status: 'A Vencer', value: 1200, type: 'Receber', date: '12/05/2026' },
];

export const defaultGlobalWebhooks: GlobalWebhook[] = [
  { id: "w1", endpoint: "https://api.rdstation.com.br/v2/webhooks/leads", event: "Novo Lead Criado", active: true },
  { id: "w2", endpoint: "https://automacoes.make.com/sc/830219-crm", event: "Negócio Ganho", active: true },
];

export const defaultLeads: Lead[] = [
  { id: 't1', name: "Maria Silva", company: "TechCorp Brasil", email: "maria@techcorp.com", phone: "(11) 98888-7777", status: "Novo", value: "R$ 15.000", date: "Hoje, 10:30", seller: "Carlos Eduardo Mendes", title: "Site Institucional", priority: "Média", stageId: '1', pipelineId: 'comercial', timeIdle: 12, tenantName: "TechCorp Brasil" },
  { id: 't2', name: "Roberto Santos", company: "Construtora RS", email: "roberto@crs.com.br", phone: "(11) 97777-6666", status: "Qualificado", value: "R$ 45.000", date: "Ontem, 15:45", seller: "Ana Silva", title: "CRM Imobiliário", priority: "Alta", stageId: '1', pipelineId: 'comercial', timeIdle: 30, tenantName: "Construtora RS" },
  { id: 't3', name: "Ana Costa", company: "Clínica Vida", email: "ana.costa@vida.med.br", phone: "(21) 99999-0000", status: "Em Negociação", value: "R$ 8.500", date: "15 Mai, 09:12", seller: "Carlos Eduardo Mendes", title: "Gestão Clínica", priority: "Baixa", stageId: '2', pipelineId: 'comercial', timeIdle: 80, tenantName: "Clínica Vida" },
  { id: 't4', name: "Carlos Oliveira", company: "Solar Solutions", email: "carlos@solarsol.com", phone: "(31) 98888-1111", status: "Prospecção", value: "R$ 90.000", date: "10 Mai, 14:20", seller: "João Pedro", title: "App Solar", priority: "Alta", stageId: '3', pipelineId: 'comercial', timeIdle: 48, tenantName: "Solar Solutions" },
  { id: 't5', name: "Juliana Mendes", company: "Mendes Consultoria", email: "juliana@mendes.com", phone: "(41) 97777-2222", status: "Fechado", value: "R$ 22.000", date: "05 Mai, 11:10", seller: "Carlos Eduardo Mendes", title: "ERP Consultoria", priority: "Média", stageId: '3', pipelineId: 'comercial', timeIdle: 55, tenantName: "Mendes Consultoria" },
  { id: 't6', name: "Admin G-Tech", company: "G-Tech Internal", email: "admin@gtech.com", phone: "-", status: "Fechado", value: "R$ 120.000", date: "01 Mai", seller: "João Pedro", title: "Infra Estrutura", priority: "Alta", stageId: '5', pipelineId: 'comercial', timeIdle: 1, tenantName: "G-Tech Master" },
  { id: 'sdr1', name: "Lucas Almeida", company: "Almeida Logistics", email: "lucas@alogistics.com", phone: "(81) 98888-4444", status: "Novo", value: "R$ 0", date: "Hoje, 09:00", seller: "Roberto Ramos", title: "Automação Comercial", priority: "Alta", stageId: 'sdr-3', pipelineId: 'sdr', scoreIA: 91, temperature: 'quente', iaSummary: 'Empresa com 12 funcionários, demonstrou interesse em automação comercial e CRM. Possível ticket de R$ 5k/mês.', timeIdle: 4, tenantName: "G-Tech Master" },
  { id: 'sdr2', name: "Fernanda Souza", company: "FS Consultores", email: "fernanda@fscons.com", phone: "(85) 99999-1111", status: "Em Nutrição", value: "R$ 0", date: "Ontem, 16:30", seller: "Roberto Ramos", title: "Consultoria CRM", priority: "Média", stageId: 'sdr-2', pipelineId: 'sdr', scoreIA: 65, temperature: 'morno', iaSummary: 'Quer entender melhor como o CRM pode ajudar a estruturar o processo comercial.', timeIdle: 26, tenantName: "Solar Solutions" },
  { id: 'sdr3', name: "Eduardo Lima", company: "Eduarda Doceria", email: "edu@doceria.com", phone: "(11) 97777-5555", status: "IA Analisando", value: "R$ 0", date: "Hoje, 11:20", seller: "Roberto Ramos", title: "Varejo", priority: "Baixa", stageId: 'sdr-1', pipelineId: 'sdr', scoreIA: 42, temperature: 'frio', iaSummary: 'Perfil Muito PME, talvez ticket baixo mas alta chance de fechar self-service.', timeIdle: 74, tenantName: "Imobiliária Prime" }
];

export const defaultTasks: Task[] = [
  { id: '1', title: "Reunião de Follow-up TechCorp", related: "TechCorp Brasil", type: "Reunião", date: "Hoje, 14:00", status: "Em Aberto", priority: "Alta", seller: "Carlos Eduardo Mendes" },
  { id: '2', title: "Envio de Minuta Contratual", related: "Construtora RS", type: "Docs", date: "Amanhã, 10:00", status: "Em Aberto", priority: "Média", seller: "Ana Silva" },
  { id: '3', title: "Qualificação de Lead", related: "Juliana Mendes", type: "Call", date: "Ontem", status: "Concluída", priority: "Alta", seller: "Carlos Eduardo Mendes" },
  { id: '4', title: "Análise de Proposta", related: "Clínica Vida", type: "Docs", date: "Hoje, 17:00", status: "Atrasado", priority: "Alta", seller: "Roberto Ramos" },
];

export const defaultContracts: Contract[] = [
  { id: '1', client: "TechCorp Brasil", plan: "Enterprise", mrr: "R$ 4.500", status: "Ativo", date: "10/05/2026", progress: 100 },
  { id: '2', client: "Construtora RS", plan: "Pro", mrr: "R$ 1.200", status: "Ativo", date: "12/04/2026", progress: 100 },
  { id: '3', client: "Clínica Vida", plan: "Starter", mrr: "R$ 550", status: "Inadimplente", date: "01/02/2026", progress: 65 },
];

export const defaultActivitiesOnLoad: LeadActivity[] = [
  { id: 'act1', leadId: 't1', type: 'Ligação', title: 'Primeiro Contato Telefônico', description: 'Cliente atendeu e demonstrou forte interesse em site institucional. Agendado follow-up.', date: 'Hoje, 10:30', seller: 'Carlos Eduardo Mendes' },
  { id: 'act2', leadId: 't2', type: 'Reunião', title: 'Reunião de Diagnóstico', description: 'Realizada reunião via Teams. Mapeamos escopo completo de CRM Imobiliário.', date: 'Ontem, 15:45', seller: 'Ana Silva' },
  { id: 'act3', leadId: 't3', type: 'E-mail', title: 'Envio de Proposta Comercial', description: 'Proposta de R$ 8.500 enviada por e-mail com detalhes da gestão de clínica.', date: '15 Mai, 09:12', seller: 'Carlos Eduardo Mendes' },
  { id: 'act4', leadId: 't5', type: 'Reunião', title: 'Apresentação de Demostração ERP', description: 'Apresentação realizada com sucesso. Negociação de prazos.', date: '05 Mai, 11:10', seller: 'Carlos Eduardo Mendes' },
];

export const getDefaultAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: '1', time: '08:00', patient: 'Ricardo Oliveira', drId: '1', drName: 'Dr. Lucas Ferro', status: 'Finalizado', type: 'Check-up', room: 'Consultório 01', specialty: 'Cardiologia', phone: '5511988887777', date: today },
    { id: '2', time: '09:30', patient: 'Beatriz Santos', drId: '2', drName: 'Dra. Ana Costa', status: 'Em Atendimento', type: 'Procedimento', room: 'Sala de Estética', specialty: 'Dermatologia', phone: '5511977776666', date: today },
    { id: '3', time: '11:00', patient: 'Marcelo Dias', drId: '1', drName: 'Dr. Lucas Ferro', status: 'Atrasado', type: 'Teleconsulta', room: 'Virtual (Meet)', specialty: 'Cardiologia', phone: '5511999990000', date: today },
    { id: '4', time: '14:30', patient: 'Fátima Lima', drId: '3', drName: 'Dra. Elena Ramos', status: 'Confirmado', type: 'Retorno', room: 'Consultório 03', specialty: 'Ginecologia', phone: '5511988881111', date: today },
  ];
};

export const defaultSquads: Squad[] = [
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

export const defaultNotifications: Notification[] = [
  { id: '1', title: "Novo Lead Qualificado", desc: "A empresa TechCorp Brasil acaba de passar para a etapa de qualificação. Responsável: Carlos Eduardo.", time: "10:30", date: "Hoje", type: "success", category: "CRM", read: false },
  { id: '2', title: "Tarefa Atrasada", desc: "A tarefa 'Reunião de Diagnóstico de Processos' com Construtora RS passou do prazo limite acordado.", time: "09:00", date: "Hoje", type: "error", category: "Produtividade", read: false },
  { id: '3', title: "E-mail de Proposta Visualizado", desc: "Ana Costa da Clínica Vida abriu e leu o e-mail contendo os detalhes técnicos da proposta comercial.", time: "17:45", date: "Ontem", type: "info", category: "Engajamento", read: true },
  { id: '4', title: "Contrato Assinado e Ativo", desc: "O contrato Pro de R$ 1.200/mês da Construtora RS foi devidamente assinado e ativado no sistema.", time: "14:20", date: "Ontem", type: "success", category: "Financeiro", read: true },
  { id: '5', title: "Configurações Globais Alteradas", desc: "Parâmetros gerais do tenant e políticas de faturamento automático SMTP foram reconfigurados pelo administrador.", time: "11:15", date: "15 Mai", type: "warning", category: "Sistema", read: true }
];
