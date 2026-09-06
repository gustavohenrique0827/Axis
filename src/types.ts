export type ProductType = "Serviço" | "Assinatura" | "Digital" | "Físico" | "Imóvel" | "Curso/Turma";

export interface ProductAttachment {
    name: string;
    size: string;
    date: string;
    type: string;
    url: string;
    path: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    type: ProductType;
    price: number;
    cost: number;
    margin: number;
    commission: number;
    active: boolean;
    stockMin: number;
    stockMax: number;
    currentStock: number;
    dimensions?: string;
    weight?: number;
    material?: string;
    description?: string;
    provider: string;
    isBestSeller?: boolean;
    tags: string[];
    attachments?: ProductAttachment[];
    /** Campos que variam por `type` (ex.: endereço/área pra Imóvel, ciclo de
     * cobrança pra Assinatura) — ver src/pages/operative/produtos/produto-modal/ProdutoTabInfo.tsx. */
    typeAttributes?: Record<string, string | number | boolean>;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'Texto' | 'Número' | 'Data';
  required: boolean;
  validationRegex?: string;
}

export interface LeadScoreTrigger {
  id: string;
  scoreThreshold: number;
  condition: 'greater' | 'less';
  targetStageId: string;
  autoMessage: boolean;
}

export interface Lead {
  createdAt?: string;
  id: string;
  name: string;
  company: string;
  cnpj?: string;
  email: string;
  phone: string;
  status: string;
  value: any;
  date: string;
  seller: string;
  source?: string;
  title: string;
  priority?: 'Alta' | 'Média' | 'Baixa';
  stageId: string;
  lead_interesse_cliente?: string;
  pipelineId?: 'sdr' | 'comercial';
  scoreIA?: number;
  temperature?: 'frio' | 'morno' | 'quente';
  iaSummary?: string;
  timeIdle?: number;
  customFields?: Record<string, string | number>;
  tenantName?: string;
  tenantId?: string;
  clientId?: string;
  clientName?: string;
  productIds?: string[];
  notes?: string;
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  related: string;
  type?: string;
  date?: string;

  // compat: algumas telas usam `desc`, outras usam `description`
  description?: string;
  desc?: string;
  status: 'Atrasado' | 'Cancelado' | 'Em Aberto' | 'Concluída' | 'A Fazer' | 'Aguardando';
  priority?: 'Alta' | 'Média' | 'Baixa';
  seller?: string;
  sellerId?: string;
  tags?: string[];
  relatedProductIds?: string[];
  responsible?: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  status: 'Ativo' | 'Férias' | 'Afastado' | 'Desligado';
  dataAdmissao: string;
  email: string;
  avatar?: string;
  desempenho: number; // 0-100
  rotationActive?: boolean;
  rotationBlocked?: boolean;
  rotationLeadTypes?: string[];
}

export interface Squad {
  id: string;
  nome: string;
  departamento?: string;
  leader?: string;
  cor?: string;
  logo?: string;
  focoComercial: string;
  membros: string[];
  membrosFuncoes?: Record<string, string>;
  clientes?: string[];
  meta?: number;
  orcamentoMensal?: number;
  faturamentoAlcancado?: number;
  sdrCount?: number;
  closersCount?: number;
}

export interface Contract {
  id: string;
  client: string;
  plan: string;
  mrr: string | number;
  status: string;
  date: string;
  progress: number;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  title: string;
  description: string;
  seller: string;
  date: string;
  files?: any[];
}

export interface FinanceEntry {
  id: string;
  description: string;
  category: string;
  status: string;
  value: number;
  type: 'Pagar' | 'Receber';
  date: string;
}

export interface GlobalWebhook {
  id: string;
  endpoint: string;
  event: string;
  active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  date: string;
  type: 'success' | 'error' | 'info' | 'warning';
  category: string;
  read: boolean;
}

export interface Appointment {
  id: string;
  time: string;
  patient: string;
  drId: string;
  drName: string;
  status: string;
  type: string;
  room: string;
  specialty: string;
  phone: string;
  date: string;
  notes?: string;
}
