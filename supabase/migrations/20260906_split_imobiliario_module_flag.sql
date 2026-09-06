-- O módulo "Imobiliário & Concessionárias" foi separado em dois módulos
-- independentes (Imobiliária e Concessionária), cada um com seu próprio
-- toggle em Configurações e sua própria seção de menu. A antiga flag única
-- `modules.imobiliario` deixou de ser lida pelo frontend.
--
-- 3 tenants reais já tinham `imobiliario: true` (G-Tech Master, Nicolas
-- Rocha, Nicolas) — como a flag antiga liberava os dois catálogos de uma vez,
-- a migração ativa AMBAS as novas flags pra esses tenants, preservando o
-- acesso que já tinham (nada é revogado silenciosamente). Quem quiser separar
-- de fato pode desativar um dos dois em Configurações > Módulos.

update public.tenants
set modules = (modules - 'imobiliario') || jsonb_build_object('imobiliaria', true, 'concessionaria', true)
where modules->>'imobiliario' = 'true';

update public.tenants
set modules = modules - 'imobiliario'
where modules ? 'imobiliario' and modules->>'imobiliario' = 'false';
