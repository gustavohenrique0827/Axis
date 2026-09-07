-- "Suspender venda" no PDV guarda um snapshot inteiro do carrinho (itens,
-- desconto, vendedor etc.) que não mapeia limpo para vendas/venda_items sem
-- perder granularidade — por isso é uma tabela própria com o snapshot em
-- jsonb, em vez de reaproveitar `vendas`. Mesmo padrão de RLS do resto do schema.
CREATE TABLE vendas_em_espera (
  id text primary key,
  tenant_id uuid not null default current_tenant_id(),
  identificador text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
ALTER TABLE vendas_em_espera ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON vendas_em_espera FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));
revoke truncate on vendas_em_espera from anon;
revoke truncate on vendas_em_espera from authenticated;
