import { Lead, Task, Contract, CustomField, LeadScoreTrigger, Squad, LeadActivity, FinanceEntry, GlobalWebhook, Notification, Appointment, Product } from '../types';

export const defaultCustomLeadFields: CustomField[] = [];
export const defaultLeadScoreTriggers: LeadScoreTrigger[] = [];
export const defaultFinanceEntries: FinanceEntry[] = [];
export const defaultGlobalWebhooks: GlobalWebhook[] = [];
export const defaultLeads: Lead[] = [];
export const defaultTasks: Task[] = [];
export const defaultContracts: Contract[] = [];
export const defaultActivitiesOnLoad: LeadActivity[] = [];
export const getDefaultAppointments = (): Appointment[] => [];
export const defaultSquads: Squad[] = [];
export const defaultNotifications: Notification[] = [];
export const defaultProducts: Product[] = [];
