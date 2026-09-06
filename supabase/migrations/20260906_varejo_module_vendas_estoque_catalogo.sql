-- Fase 9 do plano de nichos: módulo Varejo real (não existia — auditoria
-- confirmou zero fluxo de venda, sem carrinho, sem baixa de estoque, sem
-- catálogo público). Reaproveita a tabela `products` já existente (SKU,
-- estoque, preço/custo/margem já reais) e adiciona: histórico de
-- movimentação de estoque, venda com múltiplos itens (carrinho), baixa
-- atômica de estoque + lançamento financeiro na finalização da venda, e um
-- catálogo público read-only (mesmo padrão SECURITY DEFINER já usado em
-- get_public_imovel/get_public_proposal/get_public_corretor_portfolio).

CREATE TABLE estoque_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  product_id uuid not null references products(id) on delete cascade,
  tipo text not null check (tipo in ('entrada','saida','ajuste','venda')),
  quantidade integer not null,
  motivo text,
  referencia_venda_id uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);
ALTER TABLE estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON estoque_movimentacoes FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));
CREATE INDEX idx_estoque_movimentacoes_product ON estoque_movimentacoes(product_id, created_at desc);

CREATE TABLE vendas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  cliente_id uuid,
  cliente_nome text,
  vendedor_id uuid,
  status text not null default 'aberta' check (status in ('aberta','paga','cancelada')),
  forma_pagamento text,
  valor_total numeric not null default 0,
  finance_entry_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON vendas FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));

CREATE TABLE venda_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  venda_id uuid not null references vendas(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric not null,
  created_at timestamptz not null default now()
);
ALTER TABLE venda_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON venda_items FOR ALL USING (has_tenant_access(tenant_id)) WITH CHECK (has_tenant_access(tenant_id));
CREATE INDEX idx_venda_items_venda ON venda_items(venda_id);

-- Finaliza uma venda "aberta": para cada item, valida estoque suficiente
-- (senão levanta exceção e desfaz tudo — é uma função só, então a transação
-- inteira do chamador aborta), decrementa o estoque, registra a movimentação
-- e cria o lançamento financeiro (Receita) correspondente. Tudo atômico.
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

-- Movimentação manual de estoque (entrada/saída/ajuste), fora do fluxo de venda.
CREATE OR REPLACE FUNCTION registrar_movimentacao_estoque(p_product_id uuid, p_tipo text, p_quantidade integer, p_motivo text default null)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_product record;
  v_delta integer;
BEGIN
  IF p_tipo NOT IN ('entrada','saida','ajuste') THEN
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', p_tipo;
  END IF;
  SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
  IF v_product.id IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado.';
  END IF;
  IF NOT has_tenant_access(v_product.tenant_id) THEN
    RAISE EXCEPTION 'Sem permissão para este produto.';
  END IF;

  IF p_tipo = 'entrada' THEN
    v_delta := p_quantidade;
  ELSIF p_tipo = 'saida' THEN
    IF v_product."currentStock" < p_quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente.';
    END IF;
    v_delta := -p_quantidade;
  ELSE
    -- ajuste: p_quantidade é o novo valor absoluto do estoque
    v_delta := p_quantidade - v_product."currentStock";
  END IF;

  UPDATE products SET "currentStock" = "currentStock" + v_delta WHERE id = p_product_id;
  INSERT INTO estoque_movimentacoes (tenant_id, product_id, tipo, quantidade, motivo, created_by)
  VALUES (v_product.tenant_id, p_product_id, p_tipo, v_delta, p_motivo, auth.uid());

  RETURN jsonb_build_object('success', true, 'novo_estoque', v_product."currentStock" + v_delta);
END;
$fn$;

-- Catálogo público read-only (mesmo padrão SECURITY DEFINER das outras
-- páginas públicas do produto) — nunca expõe estoque exato, só disponibilidade.
CREATE OR REPLACE FUNCTION get_public_catalog(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_tenant_name text;
  v_products jsonb;
BEGIN
  SELECT name INTO v_tenant_name FROM tenants WHERE id = p_tenant_id AND deleted_at IS NULL;
  IF v_tenant_name IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'sku', sku, 'description', description,
    'price', price, 'category', category, 'emEstoque', ("currentStock" > 0)
  ) ORDER BY name)
  INTO v_products
  FROM products
  WHERE tenant_id = p_tenant_id AND active = true;

  RETURN jsonb_build_object('tenantName', v_tenant_name, 'products', COALESCE(v_products, '[]'::jsonb));
END;
$fn$;
