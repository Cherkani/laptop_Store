-- Seed a default admin user (email/password auth)
-- Email: admin@laptopstore.ma
-- Password: Admin!234

create extension if not exists pgcrypto;

with existing_user as (
  select id from auth.users where email = 'admin@laptopstore.ma'
),
created_user as (
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
    public.crypt('Admin!234', extensions.gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{}'::jsonb,
    now(),
    now(),
    '', '', '', '', ''
  )
  on conflict (email) do update set email = excluded.email
  returning id, email
),
user_row as (
  select id, email from created_user
  union all
  select id, 'admin@laptopstore.ma' from existing_user
)
insert into auth.identities (id, provider, user_id, identity_data, last_sign_in_at, created_at, updated_at)
select
  extensions.gen_random_uuid(),
  'email',
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  now(), now(), now()
from user_row u
on conflict (user_id, provider) do nothing;

insert into public.profiles (id, full_name, avatar_url, is_admin, created_at, updated_at)
select u.id, 'Admin', null, true, now(), now()
from user_row u
on conflict (id) do update set is_admin = true;
