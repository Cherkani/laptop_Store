-- Migration 2: Products, product_images, and specifications tables

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  brand text not null,
  processor text not null default '',
  ram text not null default '',
  storage text not null default '',
  graphics_card text not null default '',
  screen_size text not null default '',
  weight text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false,
  category text not null default 'laptop',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Indexes for common filter operations
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_processor on public.products(processor);
create index if not exists idx_products_ram on public.products(ram);
create index if not exists idx_products_storage on public.products(storage);
create index if not exists idx_products_graphics on public.products(graphics_card);
create index if not exists idx_products_screen_size on public.products(screen_size);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_products_stock on public.products(stock_quantity);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- Full text search index
create index if not exists idx_products_search on public.products
  using gin(to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || brand));

-- Product images table
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_order on public.product_images(product_id, display_order);

-- Specifications table (flexible key-value pairs for extra specs)
create table if not exists public.specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  spec_key text not null,
  spec_value text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_specifications_product_id on public.specifications(product_id);

comment on table public.products is 'Laptop products catalog';
comment on table public.product_images is 'Product image gallery';
comment on table public.specifications is 'Flexible key-value specifications for products';
