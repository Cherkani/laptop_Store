-- Migration 4: Row Level Security policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.specifications enable row level security;
alter table public.cart_items enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Anyone can view profiles
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Users can update only their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Only admins can update is_admin column (handled via service role)
-- Inserts are handled by the trigger (service definer context)

-- ============================================================
-- PRODUCTS policies
-- ============================================================

-- Anyone can view products (public catalog)
create policy "products_select_public"
  on public.products for select
  using (true);

-- Only admins can create products
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

-- Only admins can update products
create policy "products_update_admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins can delete products
create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- ============================================================
-- PRODUCT IMAGES policies
-- ============================================================

-- Anyone can view product images
create policy "product_images_select_public"
  on public.product_images for select
  using (true);

-- Only admins can manage product images
create policy "product_images_insert_admin"
  on public.product_images for insert
  with check (public.is_admin());

create policy "product_images_update_admin"
  on public.product_images for update
  using (public.is_admin());

create policy "product_images_delete_admin"
  on public.product_images for delete
  using (public.is_admin());

-- ============================================================
-- SPECIFICATIONS policies
-- ============================================================

-- Anyone can view specifications
create policy "specifications_select_public"
  on public.specifications for select
  using (true);

-- Only admins can manage specifications
create policy "specifications_insert_admin"
  on public.specifications for insert
  with check (public.is_admin());

create policy "specifications_update_admin"
  on public.specifications for update
  using (public.is_admin());

create policy "specifications_delete_admin"
  on public.specifications for delete
  using (public.is_admin());

-- ============================================================
-- CART ITEMS policies
-- ============================================================

-- Users can only see their own cart
create policy "cart_items_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

-- Users can add to their own cart only
create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

-- Users can update their own cart
create policy "cart_items_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can remove from their own cart
create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);
