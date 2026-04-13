-- Analytics events for product/user interaction monitoring

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  page_path text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at desc);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);
create index if not exists idx_analytics_events_product on public.analytics_events(product_id);

alter table public.analytics_events enable row level security;

-- Public can write anonymous tracking events
create policy "analytics_events_insert_public"
  on public.analytics_events for insert
  with check (true);

-- Only admins can read analytics
create policy "analytics_events_select_admin"
  on public.analytics_events for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );
