-- Clínica: cadastro real de pacientes e prontuário eletrônico (EHR).
-- Antes, "Pacientes" e "Prontuários" só derivavam da tabela genérica
-- `appointments` (nome do paciente como texto solto) — não existia nenhum
-- cadastro de paciente de verdade (CPF, convênio, alergias, histórico
-- clínico). Isso impedia qualquer prontuário real: não havia onde gravar
-- diagnóstico, prescrição ou exames por paciente.

CREATE TABLE IF NOT EXISTS public.pacientes (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id      UUID NOT NULL DEFAULT current_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  telefone       TEXT DEFAULT '',
  email          TEXT DEFAULT '',
  cpf            TEXT DEFAULT '',
  data_nascimento DATE,
  convenio       TEXT DEFAULT 'Particular',
  alergias       TEXT DEFAULT '',
  observacoes    TEXT DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'Ativo',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON public.pacientes
  USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE INDEX IF NOT EXISTS idx_pacientes_tenant ON public.pacientes(tenant_id);

CREATE TABLE IF NOT EXISTS public.prontuarios (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id           UUID NOT NULL DEFAULT current_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  paciente_id         TEXT NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  appointment_id      TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
  data                DATE NOT NULL DEFAULT CURRENT_DATE,
  profissional        TEXT DEFAULT '',
  queixa_principal    TEXT DEFAULT '',
  historico           TEXT DEFAULT '',
  diagnostico         TEXT DEFAULT '',
  prescricao          TEXT DEFAULT '',
  exames_solicitados  TEXT DEFAULT '',
  observacoes         TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON public.prontuarios
  USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE INDEX IF NOT EXISTS idx_prontuarios_tenant ON public.prontuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente ON public.prontuarios(paciente_id);
