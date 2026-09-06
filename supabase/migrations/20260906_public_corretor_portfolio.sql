-- A página pública /corretor/:slug (PortfolioCorretor.tsx) renderizava dados
-- 100% inventados (CORRETORES_DB hardcoded: "Ana Lima", "Carlos Matos" etc.)
-- para QUALQUER slug que não fosse um dos 3 fixos — enquanto isso, a tela
-- interna de Corretores.tsx já cadastra corretores reais em
-- imobiliario_corretores e gera/copia esse mesmo link público. Resultado:
-- todo corretor real cadastrado por um tenant caía em "corretor não
-- encontrado" ao abrir o próprio link que o sistema disse pra ele copiar.
--
-- Mesma solução de segurança do get_public_proposal: uma função
-- SECURITY DEFINER é o único ponto de acesso anônimo, buscando pelo slug
-- (que já tem UNIQUE constraint) — não há grant de SELECT para anon em
-- imobiliario_corretores/imobiliario_imoveis.
create or replace function public.get_public_corretor_portfolio(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_corretor record;
  v_imoveis jsonb;
begin
  if p_slug is null or length(p_slug) = 0 then
    return null;
  end if;

  select id, tenant_id, nome, creci, telefone, email, especialidade, bio, avaliacao, total_vendas
  into v_corretor
  from public.imobiliario_corretores
  where slug = p_slug and status = 'Ativo';

  if v_corretor.id is null then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', i.id,
           'titulo', i.titulo,
           'tipo', i.tipo,
           'operacao', i.operacao,
           'status', i.status,
           'valor', i.valor,
           'bairro', i.bairro,
           'cidade', i.cidade,
           'area', i.area,
           'quartos', i.quartos,
           'banheiros', i.banheiros,
           'vagas', i.vagas,
           'descricao', i.descricao
         ) order by i.created_at desc), '[]'::jsonb)
  into v_imoveis
  from public.imobiliario_imoveis i
  where i.tenant_id = v_corretor.tenant_id and i.corretor = v_corretor.nome;

  return jsonb_build_object(
    'nome', v_corretor.nome,
    'creci', v_corretor.creci,
    'telefone', v_corretor.telefone,
    'email', v_corretor.email,
    'especialidade', v_corretor.especialidade,
    'bio', v_corretor.bio,
    'avaliacao', v_corretor.avaliacao,
    'totalVendas', v_corretor.total_vendas,
    'imoveis', v_imoveis
  );
end;
$$;

revoke all on function public.get_public_corretor_portfolio(text) from public;
grant execute on function public.get_public_corretor_portfolio(text) to anon, authenticated;
