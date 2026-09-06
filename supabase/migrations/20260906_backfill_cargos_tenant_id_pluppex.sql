-- Os cargos SDR/ADMINISTRADOR/CLOSER/VIDEOMAKER/CRIADOR DE CONTEUDO foram
-- criados com tenant_id NULL, o que os torna invisíveis via RLS
-- (has_tenant_access(NULL) nunca é true pra usuário não-super-admin) para
-- qualquer tenant, inclusive o dono real deles. Os nomes dos cargos batem
-- exatamente com o `role` de 7 usuários ativos da PLUPPEX DIGITAL MACHINES
-- LTDA — backfill de dado, não mudança de schema. O cargo órfão "Israel"
-- (modulos=[], nenhum usuário com esse role) foi deixado como está,
-- por decisão explícita do usuário.
UPDATE cargos
SET tenant_id = (SELECT id FROM tenants WHERE name = 'PLUPPEX DIGITAL MACHINES LTDA')
WHERE nome IN ('SDR', 'ADMINISTRADOR', 'CLOSER', 'VIDEOMAKER', 'CRIADOR DE CONTEUDO')
  AND tenant_id IS NULL;
