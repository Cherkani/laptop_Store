-- Migration 9: Contacts (clients/companies/suppliers) + cash sales & ledger
-- Adds backoffice data model to mirror missing modules from inspiration set

-- ================================
-- CORE REFERENCE TABLES
-- ================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cin text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ice text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists companies_updated_at on public.companies;
create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.handle_updated_at();

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists suppliers_updated_at on public.suppliers;
create trigger suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.handle_updated_at();

-- ================================
-- CASH SALES (no Stripe)
-- ================================
create table if not exists public.cash_sales (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  description text,
  amount_ht numeric(12,2) not null default 0 check (amount_ht >= 0),
  tva numeric(12,2) not null default 0 check (tva >= 0),
  amount_ttc numeric(12,2) not null default 0 check (amount_ttc >= 0),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cash_sales_updated_at on public.cash_sales;
create trigger cash_sales_updated_at
  before update on public.cash_sales
  for each row execute function public.handle_updated_at();

create index if not exists idx_cash_sales_occurred_at on public.cash_sales(occurred_at desc);
create index if not exists idx_cash_sales_client on public.cash_sales(client_id);
create index if not exists idx_cash_sales_company on public.cash_sales(company_id);

-- ================================
-- PURCHASES (stock intake)
-- ================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  qty integer not null default 1 check (qty > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  additional_expenses numeric(12,2) not null default 0 check (additional_expenses >= 0),
  total_spent numeric(14,2) generated always as ((qty * unit_price) + additional_expenses) stored,
  purchase_price_per_unit numeric(14,4) generated always as (
    case when qty > 0 then ((qty * unit_price) + additional_expenses) / qty else 0 end
  ) stored,
  purchased_at timestamptz not null default now(),
  has_invoice boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists purchases_updated_at on public.purchases;
create trigger purchases_updated_at
  before update on public.purchases
  for each row execute function public.handle_updated_at();

create index if not exists idx_purchases_product on public.purchases(product_id);
create index if not exists idx_purchases_supplier on public.purchases(supplier_id);
create index if not exists idx_purchases_date on public.purchases(purchased_at desc);

-- ================================
-- CASH LEDGER / BALANCE ENTRIES
-- ================================
create table if not exists public.balance_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('income','expense','adjustment')),
  description text,
  amount numeric(12,2) not null default 0,
  running_balance numeric(14,2) not null default 0,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists balance_entries_updated_at on public.balance_entries;
create trigger balance_entries_updated_at
  before update on public.balance_entries
  for each row execute function public.handle_updated_at();

create index if not exists idx_balance_entries_date on public.balance_entries(occurred_at desc);
create index if not exists idx_balance_entries_type on public.balance_entries(entry_type);

-- ================================
-- RLS & POLICIES (admin only)
-- ================================
alter table public.clients enable row level security;
alter table public.companies enable row level security;
alter table public.suppliers enable row level security;
alter table public.cash_sales enable row level security;
alter table public.purchases enable row level security;
alter table public.balance_entries enable row level security;

-- Drop existing policies then recreate (Postgres <=14 has no IF NOT EXISTS for policies)
drop policy if exists "clients_select_admin" on public.clients;
drop policy if exists "clients_insert_admin" on public.clients;
drop policy if exists "clients_update_admin" on public.clients;
drop policy if exists "clients_delete_admin" on public.clients;
drop policy if exists "companies_select_admin" on public.companies;
drop policy if exists "companies_insert_admin" on public.companies;
drop policy if exists "companies_update_admin" on public.companies;
drop policy if exists "companies_delete_admin" on public.companies;
drop policy if exists "suppliers_select_admin" on public.suppliers;
drop policy if exists "suppliers_insert_admin" on public.suppliers;
drop policy if exists "suppliers_update_admin" on public.suppliers;
drop policy if exists "suppliers_delete_admin" on public.suppliers;
drop policy if exists "cash_sales_select_admin" on public.cash_sales;
drop policy if exists "cash_sales_insert_admin" on public.cash_sales;
drop policy if exists "cash_sales_update_admin" on public.cash_sales;
drop policy if exists "cash_sales_delete_admin" on public.cash_sales;
drop policy if exists "purchases_select_admin" on public.purchases;
drop policy if exists "purchases_insert_admin" on public.purchases;
drop policy if exists "purchases_update_admin" on public.purchases;
drop policy if exists "purchases_delete_admin" on public.purchases;
drop policy if exists "balance_entries_select_admin" on public.balance_entries;
drop policy if exists "balance_entries_insert_admin" on public.balance_entries;
drop policy if exists "balance_entries_update_admin" on public.balance_entries;
drop policy if exists "balance_entries_delete_admin" on public.balance_entries;

create policy "clients_select_admin" on public.clients for select using (public.is_admin());
create policy "clients_insert_admin" on public.clients for insert with check (public.is_admin());
create policy "clients_update_admin" on public.clients for update using (public.is_admin()) with check (public.is_admin());
create policy "clients_delete_admin" on public.clients for delete using (public.is_admin());

create policy "companies_select_admin" on public.companies for select using (public.is_admin());
create policy "companies_insert_admin" on public.companies for insert with check (public.is_admin());
create policy "companies_update_admin" on public.companies for update using (public.is_admin()) with check (public.is_admin());
create policy "companies_delete_admin" on public.companies for delete using (public.is_admin());

create policy "suppliers_select_admin" on public.suppliers for select using (public.is_admin());
create policy "suppliers_insert_admin" on public.suppliers for insert with check (public.is_admin());
create policy "suppliers_update_admin" on public.suppliers for update using (public.is_admin()) with check (public.is_admin());
create policy "suppliers_delete_admin" on public.suppliers for delete using (public.is_admin());

create policy "cash_sales_select_admin" on public.cash_sales for select using (public.is_admin());
create policy "cash_sales_insert_admin" on public.cash_sales for insert with check (public.is_admin());
create policy "cash_sales_update_admin" on public.cash_sales for update using (public.is_admin()) with check (public.is_admin());
create policy "cash_sales_delete_admin" on public.cash_sales for delete using (public.is_admin());

create policy "purchases_select_admin" on public.purchases for select using (public.is_admin());
create policy "purchases_insert_admin" on public.purchases for insert with check (public.is_admin());
create policy "purchases_update_admin" on public.purchases for update using (public.is_admin()) with check (public.is_admin());
create policy "purchases_delete_admin" on public.purchases for delete using (public.is_admin());

create policy "balance_entries_select_admin" on public.balance_entries for select using (public.is_admin());
create policy "balance_entries_insert_admin" on public.balance_entries for insert with check (public.is_admin());
create policy "balance_entries_update_admin" on public.balance_entries for update using (public.is_admin()) with check (public.is_admin());
create policy "balance_entries_delete_admin" on public.balance_entries for delete using (public.is_admin());

comment on table public.clients is 'CRM contacts (individuals)';
comment on table public.companies is 'B2B accounts / companies';
comment on table public.suppliers is 'Vendors supplying inventory';
comment on table public.cash_sales is 'Cash/terminal sales without Stripe';
comment on table public.purchases is 'Stock intake records linked to suppliers';
comment on table public.balance_entries is 'Simple cash ledger for manual reconciliation';
