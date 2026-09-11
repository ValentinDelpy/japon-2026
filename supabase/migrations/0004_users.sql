-- ════════════════════════════════════════════════════════════════
-- Gestion des comptes (réservée aux administrateurs)
-- Création/suppression d'utilisateurs Auth + statut admin.
-- Exécutée en SECURITY DEFINER : la clé service_role n'est jamais exposée.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Crée un compte (email + mot de passe), confirmé d'emblée.
create or replace function admin_create_user(p_email text, p_password text, p_is_admin boolean default false)
returns uuid
language plpgsql security definer set search_path = public, auth, extensions
as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Email invalide'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'Mot de passe trop court (8 caractères minimum)'; end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then raise exception 'Cet email est déjà utilisé'; end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', false, false
  );

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_email), 'email', now(), now(), now());

  if p_is_admin then insert into admin_users (user_id) values (v_id) on conflict do nothing; end if;
  return v_id;
end $$;

-- Liste les comptes.
create or replace function admin_list_users()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, is_admin boolean)
language plpgsql security definer set search_path = public, auth
as $$
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at,
           exists (select 1 from admin_users a where a.user_id = u.id)
    from auth.users u
    where u.deleted_at is null
    order by u.created_at;
end $$;

-- Donne ou retire le rôle administrateur.
create or replace function admin_set_admin(p_user uuid, p_is_admin boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  if p_is_admin then
    insert into admin_users (user_id) values (p_user) on conflict do nothing;
  else
    if exists (select 1 from admin_users where user_id = p_user) and (select count(*) from admin_users) <= 1 then
      raise exception 'Impossible de retirer le dernier administrateur';
    end if;
    delete from admin_users where user_id = p_user;
  end if;
end $$;

-- Supprime un compte.
create or replace function admin_delete_user(p_user uuid)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not is_admin() then raise exception 'Accès refusé'; end if;
  if p_user = auth.uid() then raise exception 'Impossible de supprimer votre propre compte'; end if;
  if exists (select 1 from admin_users where user_id = p_user) and (select count(*) from admin_users) <= 1 then
    raise exception 'Impossible de supprimer le dernier administrateur';
  end if;
  delete from admin_users where user_id = p_user;
  delete from auth.users where id = p_user;
end $$;

grant execute on function admin_create_user(text, text, boolean) to authenticated;
grant execute on function admin_list_users() to authenticated;
grant execute on function admin_set_admin(uuid, boolean) to authenticated;
grant execute on function admin_delete_user(uuid) to authenticated;
