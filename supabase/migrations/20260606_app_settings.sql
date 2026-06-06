-- Tabela de configurações globais da aplicação (webhooks, módulos, campos, etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key       TEXT NOT NULL UNIQUE,
  value     JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: leitura pública (anon), escrita apenas autenticado
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_app_settings"
  ON public.app_settings FOR SELECT TO anon USING (true);

CREATE POLICY "auth_all_app_settings"
  ON public.app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
