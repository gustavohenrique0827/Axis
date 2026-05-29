# Arquitetura Backend - Axis CRM

## 1. Visão Geral Administrativa
Stack: **Supabase**, **PostgreSQL**, **TypeScript**, **Node.js (API REST)**.

## 2. Modelagem Relacional (Supabase / PostgreSQL)

```sql
-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ESTRUTURA MULTIEMPRESA & USUÁRIOS
-- ==========================================
CREATE TABLE saas_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_users INT,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  saas_plan_id UUID REFERENCES saas_plans(id),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  branding JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  permissions JSONB
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- FKSupabase Auth
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Exemplo RLS Policy (Empresas isoladas)
CREATE POLICY "Isolamento_Empresa_Users" ON users
  FOR ALL
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ==========================================
-- 2. CRM INTELIGENTE
-- ==========================================
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  order_index INT NOT NULL,
  color VARCHAR(20)
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  stage_id UUID REFERENCES pipeline_stages(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  score INT DEFAULT 0,
  value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'open', -- open, won, lost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- note, call, email, meeting
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. FINANCEIRO
-- ==========================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID, -- ref customers(id)
  value DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) -- active, canceled, expired
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' -- pending, paid, overdue
);

-- ==========================================
-- 4. MENSAGERIA / AUTOMAÇÕES
-- ==========================================
CREATE TABLE message_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  status VARCHAR(50),
  sent_count INT DEFAULT 0
);
```

## 3. Estrutura de API e Services

```typescript
// /server/services/LeadService.ts
export class LeadService {
  async createLead(data: CreateLeadDTO, companyId: string) {
    // 1. Validar Zod Schema
    const validatedData = leadSchema.parse(data);
    
    // 2. Inserir no DB Garantindo Multiempresa
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({ ...validatedData, company_id: companyId })
      .select()
      .single();
      
    if (error) throw new ApiError(error.message);
    
    // 3. Disparar Automações de Evento (Filas)
    await EventQueue.publish('lead.created', lead);
    
    return lead;
  }
}
```

## 4. Segurança e Multi-Tenancy
*   **RLS (Row Level Security):** O banco de dados do Supabase validará o token JWT (Supabase Auth) e filtrará nativamente todas as queries com base no `company_id`. Nenhuma falha no backend permitirá vazamento de dados de outro tenant.
*   **Controle de Acesso (RBAC):** Middleware Node.js validando `user.role_id` contra o array de permissões da rota solicitada.
