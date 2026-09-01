-- =============================================================
-- AXIS — ConfigModulosDemos.tsx (tela de admin master pra
-- cadastrar/editar QUALQUER empresa da plataforma) tinha a lista de
-- nichos disponíveis hardcoded no frontend (const NICHES = [...]).
-- Isso classifica o tipo de negócio do TENANT em si (usado por
-- DashboardStatsByNiche.tsx pra trocar os cards do dashboard), então
-- é um catálogo GLOBAL da plataforma — não de um tenant específico.
--
-- Semeia esses mesmos 8 valores como nichos globais (tenant_id NULL)
-- em public.nichos, pra que a tela passe a ler do banco em vez de um
-- array fixo no código. Só super admin (is_super_admin(), via a
-- policy nichos_write já existente) pode alterar essa lista depois.
-- =============================================================

insert into public.nichos (tenant_id, nome)
values
  (null, 'Parceira'),
  (null, 'Solar'),
  (null, 'Imobiliária'),
  (null, 'Clínica'),
  (null, 'Tecnologia'),
  (null, 'Educação'),
  (null, 'Agronegócio'),
  (null, 'Varejo')
on conflict do nothing;
