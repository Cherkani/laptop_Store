-- Migration 22: Allow multiple daily checks per product by storing check logs

create table if not exists public.product_check_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  checked_at timestamptz not null default now(),
  checked_by uuid references public.profiles(id) on delete set null,
  status text not null default 'online' check (status in ('online', 'unavailable')),
  note text
);

create index if not exists idx_product_check_logs_product_time
  on public.product_check_logs(product_id, checked_at desc);

create index if not exists idx_product_check_logs_checked_at
  on public.product_check_logs(checked_at desc);

comment on table public.product_check_logs is 'Each availability verification action done by admin (multiple per day allowed).';
comment on column public.product_check_logs.status is 'Result of the verification action.';

-- Backfill one log from existing last_checked_at per product
insert into public.product_check_logs (product_id, checked_at, status, note)
select
  p.id,
  p.last_checked_at,
  case when p.is_available = false then 'unavailable' else 'online' end,
  p.availability_note
from public.products p
where p.last_checked_at is not null
  and not exists (
    select 1
    from public.product_check_logs l
    where l.product_id = p.id
      and l.checked_at = p.last_checked_at
  );

alter table public.product_check_logs enable row level security;

drop policy if exists "product_check_logs_select_admin" on public.product_check_logs;
create policy "product_check_logs_select_admin"
  on public.product_check_logs for select
  using (public.is_admin());

drop policy if exists "product_check_logs_insert_admin" on public.product_check_logs;
create policy "product_check_logs_insert_admin"
  on public.product_check_logs for insert
  with check (public.is_admin());

drop policy if exists "product_check_logs_update_admin" on public.product_check_logs;
create policy "product_check_logs_update_admin"
  on public.product_check_logs for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_check_logs_delete_admin" on public.product_check_logs;
create policy "product_check_logs_delete_admin"
  on public.product_check_logs for delete
  using (public.is_admin());
