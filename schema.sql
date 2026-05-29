-- ==============================================================================
--                       Axis CRM Enterprise SQL Schema
--  Highly Scalable Multi-tenant CRM Architecture for High-Volume Data Pipelines
--  Target Database: PostgreSQL 14+ (optimized for Supabase, AWS RDS, Cloud SQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 0. AUTOMATIC TIMESTAMPS ENGINE (Triggers)
-- ==========================================

-- Standard function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- ==========================================
-- 1. TENANTS & CORE CONFIGURATIONS
-- ==========================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    niche VARCHAR(100) NOT NULL, -- e.g., 'apple', 'solar', 'imobiliaria', 'clinica', 'educacao'
    plan VARCHAR(50) DEFAULT 'Standard', -- Standard, Premium, Enterprise
    status VARCHAR(50) DEFAULT 'Active', -- Active, Suspended, Past_Due, Inactive
    
    -- Global settings and API endpoints
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
    webhook_url VARCHAR(2048),
    evolution_api_url VARCHAR(2048), -- Base URL da Evolution API
    
    -- Custom Theme Configurations
    primary_color VARCHAR(50) DEFAULT '#2563EB',
    
    -- Feature Flags / Active SaaS Billing Modules
    module_crm BOOLEAN DEFAULT true,
    module_sdr_ia BOOLEAN DEFAULT false,
    module_adv_dashboard BOOLEAN DEFAULT false,
    module_education BOOLEAN DEFAULT false,
    module_finance BOOLEAN DEFAULT false,
    module_tasks BOOLEAN DEFAULT false,
    module_marketing BOOLEAN DEFAULT false,
    
    -- Audit & Logical Deletion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Index for searching active/suspended tenants
CREATE INDEX idx_tenants_status_active ON tenants (status) WHERE deleted_at IS NULL;


-- ==========================================
-- 2. WHATSAPP INSTANCES (Multi-Number Support)
-- ==========================================

CREATE TABLE whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ex: "Atendimento Geral", "SDR João", "Suporte"
    phone_number VARCHAR(50), -- O número de telefone conectado
    status VARCHAR(50) DEFAULT 'disconnected', -- connected, disconnected, qrcode, syncing
    evolution_api_instance_name VARCHAR(255) NOT NULL, -- Nome interno da instância na Evolution
    evolution_api_token VARCHAR(255), -- Token específico desta instância
    is_default BOOLEAN DEFAULT false, -- Número padrão para mensagens globais
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    UNIQUE(tenant_id, evolution_api_instance_name)
);

CREATE TRIGGER update_whatsapp_instances_modtime 
    BEFORE UPDATE ON whatsapp_instances 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- ==========================================
-- 3. USERS & ACCESS CONTROL (CRM Roles)
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    default_whatsapp_instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL, -- Número padrão q o usuário usa
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Agente', -- Master, Admin, Gerente, Operador/Closer, SDR IA
    is_master BOOLEAN DEFAULT false, -- Global superuser flag (G-Tech)
    avatar_url VARCHAR(1024),
    active BOOLEAN DEFAULT true,
    
    -- Audit & Timezones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    UNIQUE(tenant_id, email)
);

CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Partial index for active users lookup during logins or context builds
CREATE INDEX idx_users_active_lookup ON users (tenant_id, email) WHERE deleted_at IS NULL AND active = true;


-- ==========================================
-- 4. PIPELINES & WORKFLOWS (Kanban stages)
-- ==========================================

CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'comercial', -- comercial, sdr_ia, onboarding, support
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    "order" INTEGER NOT NULL,
    color VARCHAR(20) DEFAULT '#3B82F6',
    require_reason_on_loss BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pipeline_id, "order")
);

-- Indexes for pipeline performance (Kanban generation speed)
CREATE INDEX idx_stages_pipeline_order ON stages (pipeline_id, "order" ASC);


-- ==========================================
-- 5. PRODUCTS / CATÁLOGO 
-- ==========================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    price NUMERIC(15, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'BRL',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_products_modtime 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- ==========================================
-- 6. LEADS & CAPTURES (Pipeline Core)
-- ==========================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    
    -- Demographics
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile_wa VARCHAR(50), -- Parsed/Validated WhatsApp target phone
    document_id VARCHAR(50), -- CPF/CNPJ standard indexing
    
    -- High Performance Metrics
    value NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Open', -- Open, Won, Lost
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Urgent
    temperature VARCHAR(50) DEFAULT 'Warm', -- Cold, Warm, Hot
    score_ia INTEGER DEFAULT NULL, -- AI Lead Score calculation 0-100
    
    -- Responsible Assignment (Closers vs SDRs)
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sdr_ia_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Marketing origin and lost deal analysis
    source VARCHAR(100), -- Meta Ads, Google Ads, Indicação, Organico, etc
    loss_reason VARCHAR(255),
    
    -- Date targets
    last_contact_at TIMESTAMP WITH TIME ZONE,
    next_action_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_leads_modtime 
    BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Performance Indexes optimized for high-volume reads (e.g. Kanban boards and tables)
CREATE INDEX idx_leads_composite_kanban ON leads (tenant_id, pipeline_id, stage_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_primary_filters ON leads (tenant_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_sdr_ia_lookup ON leads (sdr_ia_id, tenant_id) WHERE deleted_at IS NULL AND status = 'Open';
CREATE INDEX idx_leads_seller_lookup ON leads (seller_id, tenant_id) WHERE deleted_at IS NULL AND status = 'Open';
CREATE INDEX idx_leads_document_search ON leads (tenant_id, document_id) WHERE deleted_at IS NULL AND document_id IS NOT NULL;


-- ==========================================
-- 7. SEGMENTATIONS & AD-HOC DATA
-- ==========================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6B7280',
    UNIQUE(tenant_id, name)
);

CREATE TABLE lead_tags (
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY(lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_tag_id ON lead_tags (tag_id);

CREATE TABLE custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) DEFAULT 'lead', -- lead, contract, user, product
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) DEFAULT 'text', -- text, number, date, boolean
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_custom_values (
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    value TEXT,
    PRIMARY KEY(lead_id, custom_field_id)
);


-- ==========================================
-- 8. INTERACTIONS, ACTIVITY LOGS & MESSAGES
-- ==========================================

CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- Call, Email, WhatsApp, Meeting, Note, System
    description TEXT NOT NULL,
    duration_seconds INTEGER,
    outcome VARCHAR(100), -- Success, No Answer, Rescheduled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast lookup index for historic chronologies of a lead
CREATE INDEX idx_interactions_chronology ON interactions (lead_id, created_at DESC);

-- Real-time WhatsApp Chat History (Multi-instance aware)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    whatsapp_instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL, -- Qual numero enviou/recebeu
    
    channel VARCHAR(50) DEFAULT 'whatsapp',
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, audio, video, document
    media_url VARCHAR(2048),
    status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, read, failed
    external_id VARCHAR(255), -- Evolution API message ID reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance tuning indices for real-time mobile messaging logs and loads
CREATE INDEX idx_messages_lead_feed ON messages (lead_id, created_at DESC);
CREATE INDEX idx_messages_external_sync ON messages (tenant_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_messages_instance_lookup ON messages (whatsapp_instance_id, created_at DESC);


-- ==========================================
-- 9. CONTRATOS, VENDAS & METAS FINANCEIRAS
-- ==========================================

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Responsible agent/closer
    
    title VARCHAR(255) NOT NULL,
    value NUMERIC(15, 2) NOT NULL,
    mrr_value NUMERIC(15, 2) DEFAULT 0.00, -- SaaS MRR calculation
    
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Sent, Signed, Active, Cancelled
    
    signed_date DATE,
    start_date DATE,
    end_date DATE,
    
    file_url VARCHAR(2048),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_contracts_modtime 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Metrics and Finance performance indexes
CREATE INDEX idx_contracts_revenue_dashboard ON contracts (tenant_id, status, mrr_value) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_agent_lookup ON contracts (user_id, status) WHERE deleted_at IS NULL;

-- Monthly Business and Squad targets
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    squad_name VARCHAR(255) NOT NULL,
    monthly_goal NUMERIC(15, 2) NOT NULL,
    commission_percent NUMERIC(5, 2) DEFAULT 0.00,
    bonus_superador NUMERIC(15, 2) DEFAULT 0.00,
    valid_month DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_goals_lookup ON financial_goals (tenant_id, valid_month DESC);


-- ==========================================
-- 10. TASKS, SLA & ALERTS
-- ==========================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'To Do', -- To Do, In Progress, Review, Done
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Urgent
    
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_tasks_modtime 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Indexing for agents pending task lists
CREATE INDEX idx_tasks_pending_schedule ON tasks (assigned_to, status, due_date ASC) WHERE deleted_at IS NULL AND status != 'Done';


-- ==========================================
-- 11. API INTEGRATIONS, WEBHOOKS & TELEMETRY
-- ==========================================

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL, -- lead_created, deal_won, lead_score_low, etc.
    endpoint_url VARCHAR(2048) NOT NULL,
    active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_active_triggers ON webhooks (tenant_id, event) WHERE active = true;

-- Telemetry log table (Fast accumulation, self-purging database target)
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status_code INTEGER,
    payload TEXT,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_logs_lookup ON webhook_logs (tenant_id, created_at DESC);

-- Real-time user alert inboxes
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, alert
    link_url VARCHAR(1024),
    
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- ==========================================
-- 12. AI KNOWLEDGE BASE (RAG & Context)
-- ==========================================

CREATE TABLE ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general', -- sales_script, product_info, objection_handling, success_case
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_ai_knowledge_modtime 
    BEFORE UPDATE ON ai_knowledge_base 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- 13. MARKETING MODULE
-- ==========================================

-- Traffic Campaigns (Ads)
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- Meta, Google, TikTok, LinkedIn
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Active, Paused, Completed
    budget NUMERIC(15, 2) DEFAULT 0.00,
    amount_spent NUMERIC(15, 2) DEFAULT 0.00,
    leads_generated INTEGER DEFAULT 0,
    cpl NUMERIC(10, 2) DEFAULT 0.00,
    roi_percent NUMERIC(5, 2) DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_marketing_campaigns_modtime 
    BEFORE UPDATE ON marketing_campaigns 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE INDEX idx_marketing_campaigns_lookup ON marketing_campaigns (tenant_id, status) WHERE deleted_at IS NULL;

-- Content Production
CREATE TABLE marketing_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    platform VARCHAR(50) DEFAULT 'Instagram', -- Instagram, Blog, YouTube
    status VARCHAR(50) DEFAULT 'Ideation', -- Ideation, Production, Review, Scheduled, Published
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    publish_date TIMESTAMP WITH TIME ZONE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_marketing_content_modtime 
    BEFORE UPDATE ON marketing_content 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE INDEX idx_marketing_content_status ON marketing_content (tenant_id, status) WHERE deleted_at IS NULL;

-- Landing Pages
CREATE TABLE marketing_landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Published
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
    meta_pixel_id VARCHAR(100),
    google_analytics_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TRIGGER update_marketing_landing_pages_modtime 
    BEFORE UPDATE ON marketing_landing_pages 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE INDEX idx_marketing_landing_pages_lookup ON marketing_landing_pages (tenant_id, status) WHERE deleted_at IS NULL;
