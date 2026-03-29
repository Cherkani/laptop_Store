-- Migration 7: Backoffice CRM/ERP-style module for WhatsApp-first sales

-- ============================================================
-- SALES RECORDS (Ventes pipeline)
-- ============================================================
create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  client_phone text,
  client_whatsapp text,
  source text not null default 'whatsapp',
  lead_title text not null default '',
  lead_message text,
  status text not null default 'new'
    check (status in ('new', 'qualified', 'quoted', 'invoiced', 'delivery', 'sold', 'paid', 'cancelled', 'lost')),
  currency text not null default 'MAD',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  product_snapshot jsonb not null default '[]'::jsonb,
  image_url text,
  external_google_id text,
  external_payload jsonb not null default '{}'::jsonb,
  notes text,
  stock_deducted boolean not null default false,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sales_records_updated_at
  before update on public.sales_records
  for each row execute function public.handle_updated_at();

create index if not exists idx_sales_records_status on public.sales_records(status);
create index if not exists idx_sales_records_source on public.sales_records(source);
create index if not exists idx_sales_records_created_at on public.sales_records(created_at desc);

comment on table public.sales_records is 'Main sales pipeline records (WhatsApp leads, quotes, sold, paid)';

-- ============================================================
-- SALES RECORD ITEMS
-- ============================================================
create table if not exists public.sales_record_items (
  id uuid primary key default gen_random_uuid(),
  sales_record_id uuid not null references public.sales_records(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  image_url text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  line_total numeric(12, 2) generated always as (quantity * unit_price) stored,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_record_items_record on public.sales_record_items(sales_record_id);
create index if not exists idx_sales_record_items_product on public.sales_record_items(product_id);

comment on table public.sales_record_items is 'Line items for a sales record';

-- ============================================================
-- SALES DOCUMENTS (Devis, Factures, Bons de livraison)
-- ============================================================
create table if not exists public.sales_documents (
  id uuid primary key default gen_random_uuid(),
  sales_record_id uuid not null references public.sales_records(id) on delete cascade,
  doc_type text not null check (doc_type in ('quote', 'invoice', 'delivery_note')),
  doc_number text unique,
  title text not null default '',
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'validated', 'paid', 'cancelled')),
  amount_total numeric(12, 2) not null default 0 check (amount_total >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger sales_documents_updated_at
  before update on public.sales_documents
  for each row execute function public.handle_updated_at();

create index if not exists idx_sales_documents_type on public.sales_documents(doc_type);
create index if not exists idx_sales_documents_record on public.sales_documents(sales_record_id);

comment on table public.sales_documents is 'Commercial documents (quotes, invoices, delivery notes)';

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  sales_record_id uuid references public.sales_records(id) on delete cascade,
  sales_document_id uuid references public.sales_documents(id) on delete set null,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  method text not null default 'cash',
  status text not null default 'pending' check (status in ('pending', 'received', 'failed', 'refunded')),
  reference text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

create index if not exists idx_payments_record on public.payments(sales_record_id);
create index if not exists idx_payments_status on public.payments(status);

comment on table public.payments is 'Payments linked to a sale and/or invoice';

-- ============================================================
-- APP SETTINGS (Système / Paramètres)
-- ============================================================
create table if not exists public.app_settings (
  key text primary key,
  value text,
  json_value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.handle_updated_at();

insert into public.app_settings(key, value, description)
values
  ('company_name', 'LaptopStore', 'Displayed company name in docs and exports'),
  ('company_phone', '', 'Company contact phone number'),
  ('whatsapp_number', '', 'WhatsApp number in international format (no +)'),
  ('google_webhook_url', '', 'Apps Script/Webhook URL for Google sync')
on conflict (key) do nothing;

comment on table public.app_settings is 'Global application configuration values';

-- ============================================================
-- AUTO DEDUCT STOCK WHEN MARKED SOLD
-- ============================================================
create or replace function public.handle_sales_record_sold()
returns trigger as $$
begin
  if new.status = 'sold'
     and coalesce(old.status, '') <> 'sold'
     and new.stock_deducted = false then

    update public.products p
      set stock_quantity = greatest(0, p.stock_quantity - i.quantity),
          updated_at = now()
    from public.sales_record_items i
    where i.sales_record_id = new.id
      and i.product_id = p.id;

    new.stock_deducted = true;
    new.sold_at = coalesce(new.sold_at, now());
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists sales_records_apply_stock on public.sales_records;
create trigger sales_records_apply_stock
  before update of status on public.sales_records
  for each row
  execute function public.handle_sales_record_sold();

-- ============================================================
-- RLS + POLICIES
-- ============================================================
alter table public.sales_records enable row level security;
alter table public.sales_record_items enable row level security;
alter table public.sales_documents enable row level security;
alter table public.payments enable row level security;
alter table public.app_settings enable row level security;

-- Sales records: public insert (lead capture), admin full management
create policy "sales_records_insert_public"
  on public.sales_records for insert
  with check (true);

create policy "sales_records_select_admin"
  on public.sales_records for select
  using (public.is_admin());

create policy "sales_records_update_admin"
  on public.sales_records for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "sales_records_delete_admin"
  on public.sales_records for delete
  using (public.is_admin());

-- Sales items: public insert to attach product lines to lead, admin management
create policy "sales_record_items_insert_public"
  on public.sales_record_items for insert
  with check (true);

create policy "sales_record_items_select_admin"
  on public.sales_record_items for select
  using (public.is_admin());

create policy "sales_record_items_update_admin"
  on public.sales_record_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "sales_record_items_delete_admin"
  on public.sales_record_items for delete
  using (public.is_admin());

-- Documents: admin only
create policy "sales_documents_select_admin"
  on public.sales_documents for select
  using (public.is_admin());

create policy "sales_documents_insert_admin"
  on public.sales_documents for insert
  with check (public.is_admin());

create policy "sales_documents_update_admin"
  on public.sales_documents for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "sales_documents_delete_admin"
  on public.sales_documents for delete
  using (public.is_admin());

-- Payments: admin only
create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

create policy "payments_insert_admin"
  on public.payments for insert
  with check (public.is_admin());

create policy "payments_update_admin"
  on public.payments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "payments_delete_admin"
  on public.payments for delete
  using (public.is_admin());

-- App settings: admin only
create policy "app_settings_select_admin"
  on public.app_settings for select
  using (public.is_admin());

create policy "app_settings_insert_admin"
  on public.app_settings for insert
  with check (public.is_admin());

create policy "app_settings_update_admin"
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_settings_delete_admin"
  on public.app_settings for delete
  using (public.is_admin());
