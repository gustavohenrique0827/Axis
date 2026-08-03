-- Fase 0 do plano multi-tenant: migrar autenticação de "public.users.password_hash"
-- (Base64 reversível, comparado via query do cliente com a chave anon) para o
-- Supabase Auth real (auth.users/auth.identities), sem forçar troca de senha.
--
-- public.users deixa de guardar a senha e passa a ser o "perfil" (tenant, role,
-- is_master) ligado 1:1 a auth.users pelo mesmo id (auth.uid()).

create extension if not exists pgcrypto;

-- 1) Caso especial: pluppex.dev@gmail.com já possuía uma conta órfã em auth.users
--    (criada em teste anterior, com um id diferente do usado em public.users).
--    Realinhamos public.users.id (e as FKs que apontam para ele) para o id já
--    existente em auth.users, e atualizamos a senha dessa conta para a senha
--    atual usada no app — login do usuário continua igual, sem reset.
do $$
declare
  old_id uuid := 'd4ace446-fac2-411f-9f67-ff1960b7c4c9';
  new_id uuid := 'e59d4d8f-33ae-4489-8b1e-4332eaa9cfe7';
  pw text;
begin
  if exists (select 1 from public.users where id = old_id)
     and exists (select 1 from auth.users where id = new_id) then

    select convert_from(decode(password_hash, 'base64'), 'utf8') into pw
    from public.users where id = old_id;

    update auth.users
    set encrypted_password = crypt(pw, gen_salt('bf')),
        updated_at = now()
    where id = new_id;

    -- As FKs abaixo não são deferráveis, e o remapeamento de id troca o valor
    -- do lado "pai" (public.users) e dos lados "filho" ao mesmo tempo — não há
    -- ordem de UPDATE que satisfaça a constraint nos dois lados simultaneamente.
    -- Solução: soltar as FKs, fazer os UPDATEs, recriar as FKs no final.
    alter table public.colaboradores drop constraint colaboradores_user_id_fkey;
    alter table public.contracts drop constraint contracts_user_id_fkey;
    alter table public.interactions drop constraint interactions_user_id_fkey;
    alter table public.leads drop constraint leads_sdr_ia_id_fkey;
    alter table public.leads drop constraint leads_seller_id_fkey;
    alter table public.marketing_content drop constraint marketing_content_author_id_fkey;
    alter table public.notifications drop constraint notifications_user_id_fkey;
    alter table public.tasks drop constraint tasks_assigned_to_fkey;
    alter table public.tasks drop constraint tasks_creator_id_fkey;

    -- colaboradores tem um trigger de updated_at pré-existente sem a coluna
    -- correspondente (bug preexistente, fora do escopo desta migration);
    -- desabilitado só durante este UPDATE administrativo pontual.
    alter table public.colaboradores disable trigger update_colaboradores_modtime;
    update public.colaboradores set user_id = new_id where user_id = old_id;
    alter table public.colaboradores enable trigger update_colaboradores_modtime;

    update public.contracts set user_id = new_id where user_id = old_id;
    update public.interactions set user_id = new_id where user_id = old_id;
    update public.leads set sdr_ia_id = new_id where sdr_ia_id = old_id;
    update public.leads set seller_id = new_id where seller_id = old_id;
    update public.marketing_content set author_id = new_id where author_id = old_id;
    update public.notifications set user_id = new_id where user_id = old_id;
    update public.tasks set assigned_to = new_id where assigned_to = old_id;
    update public.tasks set creator_id = new_id where creator_id = old_id;

    update public.users set id = new_id where id = old_id;

    alter table public.colaboradores add constraint colaboradores_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;
    alter table public.contracts add constraint contracts_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;
    alter table public.interactions add constraint interactions_user_id_fkey foreign key (user_id) references public.users(id) on delete set null;
    alter table public.leads add constraint leads_sdr_ia_id_fkey foreign key (sdr_ia_id) references public.users(id) on delete set null;
    alter table public.leads add constraint leads_seller_id_fkey foreign key (seller_id) references public.users(id) on delete set null;
    alter table public.marketing_content add constraint marketing_content_author_id_fkey foreign key (author_id) references public.users(id) on delete set null;
    alter table public.notifications add constraint notifications_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;
    alter table public.tasks add constraint tasks_assigned_to_fkey foreign key (assigned_to) references public.users(id) on delete set null;
    alter table public.tasks add constraint tasks_creator_id_fkey foreign key (creator_id) references public.users(id) on delete set null;
  end if;
end $$;

-- 2) Demais usuários de public.users sem conta em auth.users: cria a conta
--    com o MESMO id, preservando a senha atual (decodificada do Base64 legado).
do $$
declare
  r record;
begin
  for r in
    select id, email, password_hash from public.users
    where password_hash is not null
      and not exists (select 1 from auth.users au where au.id = public.users.id)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000', r.id, 'authenticated', 'authenticated', r.email,
      crypt(convert_from(decode(r.password_hash, 'base64'), 'utf8'), gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now()
    );

    insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (
      gen_random_uuid(), r.email, r.id,
      jsonb_build_object('sub', r.id::text, 'email', r.email),
      'email', now(), now()
    );
  end loop;
end $$;

-- 3) Funções auxiliares para as policies de RLS (Fase 1) e para o front-end
--    resolverem tenant/role a partir da sessão autenticada do Supabase.
--    SECURITY DEFINER: leem public.users independentemente da RLS da tabela,
--    evitando recursão quando a própria tabela users ganhar policy real.
create or replace function public.current_tenant_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select tenant_id from public.users where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_master from public.users where id = auth.uid()), false);
$$;

grant execute on function public.current_tenant_id() to authenticated, anon;
grant execute on function public.is_super_admin() to authenticated, anon;
