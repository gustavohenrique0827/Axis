-- =============================================================
-- Produtos: upload de arquivos real (hoje só vivia em estado local do
-- componente e sumia ao recarregar a página) + campos condicionais por
-- tipo de negócio (Serviço/Assinatura/Digital/Imóvel/Curso), pra não
-- forçar o mesmo formulário de "produto físico com estoque" em todo
-- tipo de negócio.
--
-- Bucket + policies seguem exatamente o mesmo padrão já usado em
-- `avatars` e `proposals` (público, escopado por tenant via o primeiro
-- segmento do path = current_tenant_id()) — confirmado via pg_policies
-- antes de escrever esta migration.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  26214400, -- 25MB
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy products_bucket_read on storage.objects for select to public
  using (bucket_id = 'products');

create policy products_bucket_write on storage.objects for insert to public
  with check (bucket_id = 'products' and ((storage.foldername(name))[1] = (current_tenant_id())::text or is_super_admin()));

create policy products_bucket_update on storage.objects for update to public
  using (bucket_id = 'products' and ((storage.foldername(name))[1] = (current_tenant_id())::text or is_super_admin()));

create policy products_bucket_delete on storage.objects for delete to public
  using (bucket_id = 'products' and ((storage.foldername(name))[1] = (current_tenant_id())::text or is_super_admin()));

alter table public.products
  add column if not exists attachments jsonb not null default '[]',
  add column if not exists type_attributes jsonb not null default '{}';
