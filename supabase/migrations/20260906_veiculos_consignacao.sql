-- Veículos: consignação (venda de veículo de terceiro por comissão).
-- Antes só existia estoque próprio + financiamento de compra pelo cliente —
-- faltava o fluxo inverso, comum em revendas: alguém deixa o carro na loja
-- para vender por comissão. Sem isso o carro consignado não tinha onde ser
-- registrado (dono, telefone, % de comissão), e não existia como fechar o
-- repasse ao consignante quando o veículo era vendido.

ALTER TABLE public.imobiliario_veiculos
  ADD COLUMN IF NOT EXISTS is_consignado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consignante_nome TEXT,
  ADD COLUMN IF NOT EXISTS consignante_telefone TEXT,
  ADD COLUMN IF NOT EXISTS comissao_percentual NUMERIC,
  ADD COLUMN IF NOT EXISTS repasse_realizado BOOLEAN NOT NULL DEFAULT FALSE;

-- Registra o repasse ao consignante como uma despesa real no financeiro
-- (valor de venda menos a comissão da loja) e marca o veículo como já
-- repassado, para não gerar o lançamento duas vezes.
CREATE OR REPLACE FUNCTION public.registrar_repasse_consignacao(p_veiculo_id UUID)
RETURNS public.finance_entries
LANGUAGE plpgsql
AS $$
DECLARE
  v_veiculo RECORD;
  v_valor_repasse NUMERIC;
  v_entry public.finance_entries;
BEGIN
  SELECT * INTO v_veiculo FROM public.imobiliario_veiculos WHERE id = p_veiculo_id;
  IF v_veiculo IS NULL THEN
    RAISE EXCEPTION 'Veículo % não encontrado', p_veiculo_id;
  END IF;
  IF NOT v_veiculo.is_consignado THEN
    RAISE EXCEPTION 'Veículo % não é consignado', p_veiculo_id;
  END IF;
  IF v_veiculo.status <> 'Vendido' THEN
    RAISE EXCEPTION 'Só é possível repassar após o veículo ser marcado como Vendido';
  END IF;
  IF v_veiculo.repasse_realizado THEN
    RAISE EXCEPTION 'Repasse deste veículo já foi registrado';
  END IF;

  v_valor_repasse := v_veiculo.valor * (1 - COALESCE(v_veiculo.comissao_percentual, 0) / 100.0);

  INSERT INTO public.finance_entries (description, category, status, value, type, date, tenant_id)
  VALUES (
    format('Repasse consignação: %s %s — %s', v_veiculo.marca, v_veiculo.modelo, COALESCE(v_veiculo.consignante_nome, 'consignante')),
    'Consignação de Veículos', 'Pendente', v_valor_repasse, 'Pagar', to_char(CURRENT_DATE, 'YYYY-MM-DD'), v_veiculo.tenant_id
  )
  RETURNING * INTO v_entry;

  UPDATE public.imobiliario_veiculos SET repasse_realizado = TRUE WHERE id = p_veiculo_id;

  RETURN v_entry;
END;
$$;
