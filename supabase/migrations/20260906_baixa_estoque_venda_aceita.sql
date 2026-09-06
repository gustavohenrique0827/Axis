-- Auditoria do nicho Varejo encontrou a promessa "Integração de pedidos e
-- controle simplificado de saída" sem nenhuma funcionalidade por trás:
-- `products.currentStock` é preenchido no cadastro e nunca mais alterado —
-- vender um produto (via Produtos.tsx > "Vender" > cria proposta com
-- proposal_items.product_id) não dá baixa nenhuma no estoque.
--
-- Corrigido com um trigger: quando uma proposta muda de status PARA
-- 'Aceita' (e não estava 'Aceita' antes — evita baixa dupla se o status
-- oscilar), dá baixa em `products.currentStock` pela quantidade de cada
-- item vinculado a um product_id real. `proposals`/`proposal_items`/
-- `products` estão todas vazias em produção — aditivo, sem dado a migrar.

create or replace function public.baixar_estoque_proposta_aceita()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if NEW.status = 'Aceita' and (OLD.status is distinct from 'Aceita') then
    update public.products p
    set "currentStock" = p."currentStock" - pi.quantidade
    from public.proposal_items pi
    where pi.proposal_id = NEW.id
      and pi.product_id is not null
      and p.id = pi.product_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_baixar_estoque_proposta_aceita on public.proposals;
create trigger trg_baixar_estoque_proposta_aceita
  after update on public.proposals
  for each row
  execute function public.baixar_estoque_proposta_aceita();
