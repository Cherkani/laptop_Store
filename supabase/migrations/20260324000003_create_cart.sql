-- Migration 3: Shopping cart

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);

comment on table public.cart_items is 'Persistent shopping cart items per user';
