-- Educação: mensalidades e controle de inadimplência.
-- Antes, uma matrícula não tinha nenhum campo financeiro — o módulo de
-- Educação vendia "gestão de mensalidades" na landing page sem nenhuma
-- estrutura de cobrança por trás. Esta migration cria o ledger de
-- mensalidades por aluno e uma function que gera as parcelas no ato da
-- matrícula.

CREATE TABLE IF NOT EXISTS public.mensalidades (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       UUID NOT NULL DEFAULT current_tenant_id() REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id      TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  turma_id        TEXT REFERENCES public.turmas(id) ON DELETE SET NULL,
  competencia     TEXT NOT NULL, -- 'YYYY-MM'
  parcela         INTEGER NOT NULL DEFAULT 1,
  valor           NUMERIC NOT NULL DEFAULT 0,
  vencimento      DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Pendente', -- Pendente | Pago | Atrasado | Cancelado
  data_pagamento  DATE,
  forma_pagamento TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON public.mensalidades
  USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE INDEX IF NOT EXISTS idx_mensalidades_tenant ON public.mensalidades(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_student ON public.mensalidades(student_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_vencimento ON public.mensalidades(vencimento);

-- Gera as parcelas de mensalidade de uma matrícula recém-criada.
-- SECURITY INVOKER (padrão): roda com o RLS do usuário chamador, então só
-- funciona para tenants aos quais o usuário já tem acesso — nada de bypass.
CREATE OR REPLACE FUNCTION public.gerar_mensalidades_matricula(
  p_student_id TEXT,
  p_turma_id TEXT,
  p_valor_mensalidade NUMERIC,
  p_dia_vencimento INTEGER,
  p_quantidade_parcelas INTEGER
) RETURNS SETOF public.mensalidades
LANGUAGE plpgsql
AS $$
DECLARE
  v_tenant_id UUID;
  v_mes DATE;
  v_dia INTEGER := GREATEST(1, LEAST(28, COALESCE(p_dia_vencimento, 10)));
  i INTEGER;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.students WHERE id = p_student_id;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Aluno % não encontrado', p_student_id;
  END IF;

  FOR i IN 0..GREATEST(0, COALESCE(p_quantidade_parcelas, 1) - 1) LOOP
    v_mes := (date_trunc('month', CURRENT_DATE) + (i || ' months')::interval)::date;
    RETURN QUERY
      INSERT INTO public.mensalidades (
        tenant_id, student_id, turma_id, competencia, parcela, valor, vencimento, status
      ) VALUES (
        v_tenant_id, p_student_id, p_turma_id,
        to_char(v_mes, 'YYYY-MM'), i + 1, COALESCE(p_valor_mensalidade, 0),
        v_mes + (v_dia - 1),
        'Pendente'
      )
      RETURNING *;
  END LOOP;
END;
$$;

-- Marca como "Atrasado" toda mensalidade pendente cujo vencimento já passou.
-- Chamada sob demanda pela tela de Mensalidades (não há cron neste projeto).
CREATE OR REPLACE FUNCTION public.atualizar_inadimplencia_mensalidades()
RETURNS INTEGER
LANGUAGE sql
AS $$
  WITH atualizadas AS (
    UPDATE public.mensalidades
    SET status = 'Atrasado'
    WHERE status = 'Pendente' AND vencimento < CURRENT_DATE AND has_tenant_access(tenant_id)
    RETURNING 1
  )
  SELECT count(*)::int FROM atualizadas;
$$;
