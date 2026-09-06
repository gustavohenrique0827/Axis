-- Duas lacunas encontradas ao remover dados fake do módulo Varejo:
--
-- 1) `venda_items.product_id` era NOT NULL, mas o PDV (Vendas.tsx) sempre
--    ofereceu "Item Avulso" (produto sem cadastro no catálogo) — não dava
--    pra gravar esse item na venda real. E `finalizar_venda` também não
--    sabia lidar com item sem product_id. Agora product_id é opcional e a
--    função soma o item ao total sem tentar baixar estoque/produto que não
--    existe.
--
-- 2) Não existia nenhuma tabela para "Compras & Reposição" (ordens de
--    compra com fornecedor) — ComprasVarejo.tsx e o Painel Executivo de
--    Varejo viviam 100% de localStorage com fallback de dados fictícios.

ALTER TABLE venda_items ALTER COLUMN product_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION finalizar_venda(p_venda_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_venda record;
  v_item record;
  v_estoque_atual integer;
  v_total numeric := 0;
  v_finance_id text;
BEGIN
  SELECT * INTO v_venda FROM vendas WHERE id = p_venda_id FOR UPDATE;
  IF v_venda.id IS NULL THEN
    RAISE EXCEPTION 'Venda não encontrada.';
  END IF;
  IF NOT has_tenant_access(v_venda.tenant_id) THEN
    RAISE EXCEPTION 'Sem permissão para esta venda.';
  END IF;
  IF v_venda.status <> 'aberta' THEN
    RAISE EXCEPTION 'Venda já processada ou cancelada.';
  END IF;

  FOR v_item IN SELECT * FROM venda_items WHERE venda_id = p_venda_id LOOP
    IF v_item.product_id IS NULL THEN
      -- Item avulso (sem cadastro no catálogo): entra no total, sem baixa de estoque.
      v_total := v_total + (v_item.quantidade * v_item.preco_unitario);
      CONTINUE;
    END IF;

    SELECT "currentStock" INTO v_estoque_atual FROM products WHERE id = v_item.product_id FOR UPDATE;
    IF v_estoque_atual IS NULL OR v_estoque_atual < v_item.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para o produto %.', v_item.product_name;
    END IF;
    UPDATE products SET "currentStock" = "currentStock" - v_item.quantidade WHERE id = v_item.product_id;
    INSERT INTO estoque_movimentacoes (tenant_id, product_id, tipo, quantidade, motivo, referencia_venda_id, created_by)
    VALUES (v_venda.tenant_id, v_item.product_id, 'venda', -v_item.quantidade, 'Baixa automática por venda', p_venda_id, auth.uid());
    v_total := v_total + (v_item.quantidade * v_item.preco_unitario);
  END LOOP;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Venda sem itens — nada a finalizar.';
  END IF;

  v_finance_id := 'venda_' || replace(p_venda_id::text, '-', '');
  INSERT INTO finance_entries (id, tenant_id, description, category, status, value, type, date, created_at)
  VALUES (v_finance_id, v_venda.tenant_id, 'Venda #' || substr(p_venda_id::text, 1, 8), 'Vendas', 'Recebido', v_total, 'Receita', to_char(now(), 'YYYY-MM-DD'), now());

  UPDATE vendas SET status = 'paga', valor_total = v_total, paid_at = now(), finance_entry_id = v_finance_id WHERE id = p_venda_id;

  RETURN jsonb_build_object('success', true, 'venda_id', p_venda_id, 'valor_total', v_total);
END;
$fn$;

CREATE TABLE compras (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default current_tenant_id(),
  fornecedor text not null,
  valor numeric not null default 0,
  data date not null default current_date,
  status text not null default 'Pendente' check (status in ('Pendente','Em Transporte','Recebido no Estoque','Cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON compras FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));
CREATE INDEX idx_compras_tenant_data ON compras(tenant_id, data desc);

revoke truncate on compras from anon;
revoke truncate on compras from authenticated;
