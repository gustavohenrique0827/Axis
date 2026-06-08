import { createContext, useContext } from 'react';
import { Lead, Task, Contract, CustomField, LeadScoreTrigger, Squad } from '../types';

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
  date: string;
  type: 'success' | 'error' | 'info' | 'warning';
  category?: string;
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
  date: string;
};

export interface DataContextType {
  leads: Lead[];
  tasks: Task[];
  contracts: Contract[];
  notifications: Notification[];
  leadActivities: LeadActivity[];
  financeEntries: FinanceEntry[];
  appointments: Appointment[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
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
  sidebarModules: Record<string, boolean>;
  setSidebarModules: (modules: Record<string, boolean>) => void;
  saveAppSetting: (key: string, value: any) => Promise<void>;
  getSmartInsight: (context: string, data: any) => Promise<string>;
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
  updateGlobalWebhook: (id: string, updates: Partial<GlobalWebhook>) => void;
  deleteGlobalWebhook: (id: string) => void;
  toggleGlobalWebhook: (id: string) => void;
  squads: Squad[];
  updateSquad: (id: string, updates: Partial<Squad>) => void;
  addSquad: (squad: Omit<Squad, 'id'>) => void;
  deleteSquad: (id: string) => void;

  marketingAutomations: any[];
  setMarketingAutomations: (v: any[]) => void;
  addMarketingAutomation: (v: any) => void;
  updateMarketingAutomation: (id: string, updates: any) => void;
  deleteMarketingAutomation: (id: string) => void;

  marketingContent: any[];
  setMarketingContent: (v: any[]) => void;
  addMarketingContent: (c: any) => void;
  updateMarketingContent: (id: string, updates: any) => void;
  deleteMarketingContent: (id: string) => void;
  marketingCampaigns: any[];
  setMarketingCampaigns: (v: any[]) => void;
  addMarketingCampaign: (c: any) => void;
  updateMarketingCampaign: (id: string, updates: any) => void;
  deleteMarketingCampaign: (id: string) => void;
  marketingLandingPages: any[];
  setMarketingLandingPages: (v: any[]) => void;
  addMarketingLandingPage: (p: any) => void;
  updateMarketingLandingPage: (id: string, updates: any) => void;
  deleteMarketingLandingPage: (id: string) => void;
  products: any[];
  setProducts: (v: any[]) => void;
  addProduct: (p: any) => void;
  updateProduct: (id: string, updates: any) => void;
  deleteProduct: (id: string) => void;
  proposals: any[];
  setProposals: (v: any[]) => void;
  addProposal: (p: any) => void;
  updateProposal: (id: string, updates: any) => void;
  deleteProposal: (id: string) => void;
  certificates: any[];
  setCertificates: (v: any[]) => void;
  turmas: any[];
  setTurmas: (v: any[]) => void;
  addTurma: (t: any) => void;
  updateTurma: (id: string, updates: any) => void;
  deleteTurma: (id: string) => void;
  students: any[];
  setStudents: (v: any[]) => void;
  addStudent: (s: any) => void;
  updateStudent: (id: string, updates: any) => void;
  deleteStudent: (id: string) => void;
  colaboradores: any[];
  setColaboradores: (v: any[]) => void;
  addColaborador: (c: any) => void;
  updateColaborador: (id: string, updates: any) => void;
  deleteColaborador: (id: string) => void;
  squadMetas: any[];
  setSquadMetas: (v: any[]) => void;
  addSquadMeta: (v: any) => void;
  updateSquadMeta: (id: string, updates: any) => void;
  deleteSquadMeta: (id: string) => void;
  cargos: any[];
  setCargos: (v: any[]) => void;
  addCargo: (c: any) => void;
  updateCargo: (id: string, updates: any) => void;
  deleteCargo: (id: string) => void;
  clienteBase: any[];
  setClienteBase: (v: any[]) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
