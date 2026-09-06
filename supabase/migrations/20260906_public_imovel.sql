-- Imoveis.tsx tem dois botões "Copiar link do imóvel" que geram
-- `${origin}/imovel/${id}` — mas essa rota nunca existiu no App.tsx, então
-- todo link copiado levava a uma tela em branco/404. Cria a rota pública de
-- verdade, no mesmo padrão de segurança do get_public_proposal e do
-- get_public_corretor_portfolio: função SECURITY DEFINER como único ponto de
-- acesso anônimo, sem grant de SELECT pra anon nas tabelas de verdade.
--
-- Aproveita pra também corrigir `visitas`: a coluna já existe e é exibida
-- na tela interna ("Total Visitas"), mas nunca era incrementada em lugar
-- nenhum — ficava travada em 0 pra sempre. Agora cada acesso à página
-- pública conta como visita de verdade.
create or replace function public.get_public_imovel(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_imovel record;
  v_corretor record;
begin
  if p_id is null then
    return null;
  end if;

  update public.imobiliario_imoveis
  set visitas = visitas + 1
  where id = p_id
  returning id, tenant_id, titulo, tipo, operacao, status, valor, bairro, cidade, area, quartos, banheiros, vagas, corretor, descricao
  into v_imovel;

  if v_imovel.id is null then
    return null;
  end if;

  select nome, telefone, email, creci, slug
  into v_corretor
  from public.imobiliario_corretores
  where tenant_id = v_imovel.tenant_id and nome = v_imovel.corretor
  limit 1;

  return jsonb_build_object(
    'id', v_imovel.id,
    'titulo', v_imovel.titulo,
    'tipo', v_imovel.tipo,
    'operacao', v_imovel.operacao,
    'status', v_imovel.status,
    'valor', v_imovel.valor,
    'bairro', v_imovel.bairro,
    'cidade', v_imovel.cidade,
    'area', v_imovel.area,
    'quartos', v_imovel.quartos,
    'banheiros', v_imovel.banheiros,
    'vagas', v_imovel.vagas,
    'descricao', v_imovel.descricao,
    'corretorNome', v_imovel.corretor,
    'corretorTelefone', v_corretor.telefone,
    'corretorEmail', v_corretor.email,
    'corretorCreci', v_corretor.creci,
    'corretorSlug', v_corretor.slug
  );
end;
$$;

revoke all on function public.get_public_imovel(uuid) from public;
grant execute on function public.get_public_imovel(uuid) to anon, authenticated;
