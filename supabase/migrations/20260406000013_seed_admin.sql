-- Seed a default admin user (email/password auth)
-- Email: admin@laptopstore.ma
-- Password: Admin!234

create extension if not exists pgcrypto with schema extensions;

set local search_path = public, auth, extensions;

do $$
declare
  v_user_id uuid;
begin
  -- Insert user if missing
  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new,
    phone
  )
  values (
    extensions.gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@laptopstore.ma',
    extensions.crypt('Admin!234', extensions.gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{}'::jsonb,
    now(),
    now(),
    '', '', '', '', ''
  )
  on conflict (instance_id, email) do nothing
  returning id into v_user_id;

  if v_user_id is null then
    select id into v_user_id
    from auth.users
    where instance_id = '00000000-0000-0000-0000-000000000000'
      and email = 'admin@laptopstore.ma'
    limit 1;
  else
    -- refresh password and metadata if user already existed
    update auth.users
    set encrypted_password     = extensions.crypt('Admin!234', extensions.gen_salt('bf')),
        email_confirmed_at     = now(),
        role                   = 'authenticated',
        raw_app_meta_data      = '{"provider":"email","providers":["email"]}',
        raw_user_meta_data     = '{}'::jsonb,
        updated_at             = now()
    where id = v_user_id;
  end if;

  -- Insert identity if missing (unique on provider_id, provider)
  insert into auth.identities (
    id,
    provider,
    provider_id,
    user_id,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    extensions.gen_random_uuid(),
    'email',
    'admin@laptopstore.ma',
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'admin@laptopstore.ma'),
    now(), now(), now()
  )
  on conflict (provider_id, provider) do
    update set user_id = excluded.user_id,
              identity_data = excluded.identity_data,
              updated_at = now();

  -- Ensure profile marked admin
  insert into public.profiles (id, full_name, avatar_url, is_admin, created_at, updated_at)
  values (v_user_id, 'Admin', null, true, now(), now())
  on conflict (id) do update set is_admin = true;
end$$;
