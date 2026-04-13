-- Migration 19: Tracker livraison + Instagram + unavailable_reason

-- ============================================================
-- 1. PRODUCTS — instagram_posted_at + unavailable_reason
-- ============================================================
alter table public.products
  add column if not exists instagram_posted_at timestamptz,
  add column if not exists unavailable_reason  text;

comment on column public.products.instagram_posted_at is 'Timestamp du post Instagram pour ce produit';
comment on column public.products.unavailable_reason  is 'Raison du masquage : vendu_source | prix_change | retire | autre';

-- ============================================================
-- 2. DELIVERIES — tracker livraison indépendant
-- ============================================================
create table if not exists public.deliveries (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,
  client_name   text,
  client_phone  text,
  address       text,
  notes         text,
  status        text not null default 'pending',   -- pending | delivered | failed
  delivered_by  uuid references public.profiles(id) on delete set null,
  delivered_at  timestamptz,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.deliveries is 'Tracker de livraisons — indépendant des ventes';
comment on column public.deliveries.status        is 'pending | delivered | failed';
comment on column public.deliveries.delivered_by  is 'Profil admin qui a effectué la livraison';

create index if not exists idx_deliveries_status     on public.deliveries(status);
create index if not exists idx_deliveries_created_at on public.deliveries(created_at);
create index if not exists idx_deliveries_created_by on public.deliveries(created_by);

-- updated_at auto-stamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists deliveries_set_updated_at on public.deliveries;
create trigger deliveries_set_updated_at
  before update on public.deliveries
  for each row execute function public.set_updated_at();

-- created_by auto-stamp from auth.uid()
create or replace function public.stamp_created_by()
returns trigger as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists deliveries_stamp_created_by on public.deliveries;
create trigger deliveries_stamp_created_by
  before insert on public.deliveries
  for each row execute function public.stamp_created_by();

-- ============================================================
-- 3. RLS
-- ============================================================
alter table public.deliveries enable row level security;

drop policy if exists "deliveries_admin_all" on public.deliveries;
create policy "deliveries_admin_all"
  on public.deliveries
  using (public.is_admin())
  with check (public.is_admin());
