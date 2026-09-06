-- Proposta Pública + tracking de visualização.
--
-- proposals.id é gerado no frontend com Math.random().toString(36) (~36 bits,
-- não-criptográfico) — nunca deve ser usado como link público. Este migration
-- adiciona um token dedicado, gerado no banco com gen_random_bytes (CSPRNG),
-- e uma função SECURITY DEFINER que é o ÚNICO ponto de acesso anônimo aos
-- dados da proposta: não há grant de SELECT para anon em `proposals` nem em
-- `proposal_items` — a função devolve só os campos necessários, buscando
-- pelo token (parâmetro da função, não filtro do cliente), então não há como
-- um visitante anônimo enumerar ou listar propostas de outros tenants.

alter table public.proposals
  add column if not exists view_token text,
  add column if not exists first_viewed_at timestamptz,
  add column if not exists last_viewed_at timestamptz,
  add column if not exists view_count integer not null default 0;

update public.proposals
set view_token = encode(gen_random_bytes(24), 'hex')
where view_token is null;

alter table public.proposals
  alter column view_token set default encode(gen_random_bytes(24), 'hex'),
  alter column view_token set not null;

create unique index if not exists proposals_view_token_key on public.proposals (view_token);

create or replace function public.get_public_proposal(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_proposal record;
  v_items jsonb;
begin
  if p_token is null or length(p_token) < 32 then
    return null;
  end if;

  update public.proposals
  set
    first_viewed_at = coalesce(first_viewed_at, now()),
    last_viewed_at = now(),
    view_count = view_count + 1
  where view_token = p_token
  returning id, titulo, cliente, valor, status, validade, tipo, conteudo_texto, created_at
  into v_proposal;

  if v_proposal.id is null then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'productName', pi.product_name,
           'quantidade', pi.quantidade,
           'precoUnitario', pi.preco_unitario
         ) order by pi.created_at), '[]'::jsonb)
  into v_items
  from public.proposal_items pi
  where pi.proposal_id = v_proposal.id;

  return jsonb_build_object(
    'titulo', v_proposal.titulo,
    'cliente', v_proposal.cliente,
    'valor', v_proposal.valor,
    'status', v_proposal.status,
    'validade', v_proposal.validade,
    'tipo', v_proposal.tipo,
    'conteudoTexto', v_proposal.conteudo_texto,
    'criadaEm', v_proposal.created_at,
    'itens', v_items
  );
end;
$$;

revoke all on function public.get_public_proposal(text) from public;
grant execute on function public.get_public_proposal(text) to anon, authenticated;
