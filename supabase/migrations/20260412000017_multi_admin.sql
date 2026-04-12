-- Migration 17: Multi-admin support
-- Creates aymen@casabystore.ma and adam@casabystore.ma
-- Adds created_by / updated_by on products, sales_records, payments
-- Adds display_name to profiles

-- ============================================================
-- 1. ADD display_name TO profiles
-- ============================================================
alter table public.profiles
  add column if not exists display_name text;

comment on column public.profiles.display_name is 'Short name shown in backoffice (e.g. Aymen, Adam)';

-- ============================================================
-- 2. ADD created_by / updated_by TO products
-- ============================================================
alter table public.products
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

comment on column public.products.created_by is 'Admin who added this product';
comment on column public.products.updated_by is 'Admin who last updated this product';

create index if not exists idx_products_created_by on public.products(created_by);

-- ============================================================
-- 3. ADD created_by / delivered_by TO sales_records
-- ============================================================
alter table public.sales_records
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists delivered_by uuid references public.profiles(id) on delete set null,
  add column if not exists delivered_at timestamptz;

comment on column public.sales_records.created_by  is 'Admin who created this sales record';
comment on column public.sales_records.delivered_by is 'Admin who performed the delivery';
comment on column public.sales_records.delivered_at is 'Timestamp of delivery';

create index if not exists idx_sales_records_created_by on public.sales_records(created_by);

-- ============================================================
-- 4. ADD created_by TO payments
-- ============================================================
alter table public.payments
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

comment on column public.payments.created_by is 'Admin who registered this payment';

-- ============================================================
-- 5. SEED ADMIN USERS: aymen@casabystore.ma + adam@casabystore.ma
-- ============================================================

create extension if not exists pgcrypto with schema extensions;
set local search_path = public, auth, extensions;

-- NOTE: Aymen and Adam accounts must be created manually via the Supabase dashboard
-- (Authentication → Users → Create user), then their profiles will be auto-created
-- by the handle_new_user trigger. The profile rows below are upserted as a safety net
-- in case the trigger already ran or the users were pre-created.
--
-- If the users don't exist yet, this block is a no-op (no rows inserted into profiles
-- because there are no matching auth.users rows to reference).

do $$
declare
  v_aymen_id uuid;
  v_adam_id   uuid;
begin

  select id into v_aymen_id from auth.users where email = 'aymen@casabystore.ma' limit 1;
  select id into v_adam_id   from auth.users where email = 'adam@casabystore.ma'  limit 1;

  if v_aymen_id is not null then
    insert into public.profiles (id, full_name, display_name, is_admin, created_at, updated_at)
    values (v_aymen_id, 'Aymen', 'Aymen', true, now(), now())
    on conflict (id) do update
      set full_name    = 'Aymen',
          display_name = 'Aymen',
          is_admin     = true,
          updated_at   = now();
  end if;

  if v_adam_id is not null then
    insert into public.profiles (id, full_name, display_name, is_admin, created_at, updated_at)
    values (v_adam_id, 'Adam', 'Adam', true, now(), now())
    on conflict (id) do update
      set full_name    = 'Adam',
          display_name = 'Adam',
          is_admin     = true,
          updated_at   = now();
  end if;

end$$;

-- ============================================================
-- 6. AUTO-STAMP created_by FROM auth.uid() ON INSERT
-- ============================================================

create or replace function public.handle_created_by()
returns trigger as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- products
drop trigger if exists products_stamp_created_by on public.products;
create trigger products_stamp_created_by
  before insert on public.products
  for each row execute function public.handle_created_by();

-- sales_records
drop trigger if exists sales_records_stamp_created_by on public.sales_records;
create trigger sales_records_stamp_created_by
  before insert on public.sales_records
  for each row execute function public.handle_created_by();

-- payments
drop trigger if exists payments_stamp_created_by on public.payments;
create trigger payments_stamp_created_by
  before insert on public.payments
  for each row execute function public.handle_created_by();

-- ============================================================
-- 7. AUTO-STAMP updated_by ON products UPDATE
-- ============================================================

create or replace function public.handle_updated_by()
returns trigger as $$
begin
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists products_stamp_updated_by on public.products;
create trigger products_stamp_updated_by
  before update on public.products
  for each row execute function public.handle_updated_by();

-- ============================================================
-- 8. RLS: allow admins to read all profiles (for name display)
-- ============================================================
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin() or auth.uid() = id);
