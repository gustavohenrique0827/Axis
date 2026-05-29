export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    type: "Serviço" | "Assinatura" | "Digital" | "Físico";
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
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  cnpj?: string;
  email: string;
  phone: string;
  status: string;
  value: string;
  date: string;
  seller: string;
  title: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  stageId: string;
  lead_interesse_cliente?: string;
  pipelineId?: 'sdr' | 'comercial';
  scoreIA?: number;
  temperature?: 'frio' | 'morno' | 'quente';
  iaSummary?: string;
  timeIdle?: number;
  customFields?: Record<string, string | number>;
  tenantName?: string;
}

export interface Task {
  id: string;
  title: string;
  related: string;
  type: string;
  date: string;
  status: 'Atrasado' | 'Em Aberto' | 'Concluída';
  priority: 'Alta' | 'Média' | 'Baixa';
  seller?: string;
  sellerId?: string;
  tags?: string[];
  relatedProductIds?: string[];
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
}

export interface Squad {
  id: string;
  nome: string;
  meta: number; // in R$
  orcamentoMensal: number; // in R$ - spend per month
  faturamentoAlcancado: number; // in R$
  sdrCount: number;
  closersCount: number;
  focoComercial: string;
  membros: string[];
}

export interface Contract {
  id: string;
  client: string;
  plan: string;
  mrr: string;
  status: string;
  date: string;
  progress: number;
}
