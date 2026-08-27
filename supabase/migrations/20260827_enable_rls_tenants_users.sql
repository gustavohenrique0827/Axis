-- =============================================================
-- AXIS — tenants e users tinham policies criadas (pela migration
-- rls_tenant_isolation_phase1), mas o RLS nunca havia sido
-- habilitado nas tabelas em si: qualquer request com a anon key
-- (pública, embutida no bundle do frontend) lia/escrevia
-- livremente em TODAS as empresas e usuários, incluindo poder
-- setar is_master em qualquer linha — bypassando por completo as
-- policies "tenant_select/insert/update/delete" e "tenant_isolation"
-- que já existiam, mas nunca chegavam a ser avaliadas.
--
-- O auto-cadastro público (/register) já está desativado no
-- front-end (App.tsx redireciona pra /login) — a própria migration
-- rls_tenant_isolation_phase1 documenta a decisão: "criar/apagar um
-- tenant novo fica restrito a super admin". Então aqui só religamos
-- RLS nas duas tabelas e restauramos a única leitura anônima que o
-- app realmente usa hoje: o AuthContext carrega a lista de tenants
-- ativos "sempre" (mesmo deslogado) pra popular os módulos da tela
-- de login. Nenhuma escrita anônima é reaberta.
-- =============================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Login (AuthContext "carrega tenants sempre") e módulos ativos: leitura
-- pública só de tenants ativos, igual ao que fetchTenants()/fetchTenantIdMap()
-- já esperam.
CREATE POLICY "anon_read_active_tenants" ON public.tenants
  FOR SELECT TO anon
  USING (status = 'Active');

-- Checagem pontual de e-mail duplicado (usada por registerPartner, hoje
-- inacessível via UI mas mantida funcional): expõe só um true/false em vez
-- de abrir SELECT geral em users pra anon.
CREATE OR REPLACE FUNCTION public.email_taken(check_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE email = check_email);
$$;

GRANT EXECUTE ON FUNCTION public.email_taken(text) TO anon, authenticated;
