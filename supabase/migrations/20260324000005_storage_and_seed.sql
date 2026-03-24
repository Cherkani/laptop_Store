-- Migration 5: Storage bucket setup and sample seed data

-- Create product-images storage bucket (run this in Supabase dashboard OR via CLI)
-- Note: Storage bucket creation via SQL requires superuser or use the Supabase dashboard

-- Storage policies for product-images bucket
-- (These policies are applied after creating the bucket in the dashboard)

-- Allow public read access to product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS: Anyone can read
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Storage RLS: Only authenticated admins can upload
create policy "product_images_admin_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and public.is_admin()
  );

-- Storage RLS: Only admins can delete
create policy "product_images_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and public.is_admin()
  );

-- ============================================================
-- Seed sample data (optional - remove in production)
-- ============================================================

-- Sample products for testing (no images, add via admin dashboard)
insert into public.products (name, description, price, brand, processor, ram, storage, graphics_card, screen_size, weight, stock_quantity, is_featured)
values
  (
    'MacBook Pro 16-inch M4 Pro',
    'The most powerful MacBook Pro ever. With M4 Pro chip, it delivers groundbreaking performance for the most demanding workflows.',
    3499.00,
    'Apple',
    'Apple M4 Pro',
    '24GB',
    '512GB SSD',
    'Apple GPU',
    '16"',
    '2.14 kg',
    15,
    true
  ),
  (
    'Dell XPS 15 9530',
    'Premium performance laptop with stunning OLED display and powerful 13th Gen Intel processor.',
    1999.00,
    'Dell',
    'Intel Core i9',
    '32GB',
    '1TB SSD',
    'NVIDIA RTX 4060',
    '15.6"',
    '1.86 kg',
    8,
    true
  ),
  (
    'ASUS ROG Zephyrus G16',
    'Ultra-slim gaming laptop with AMD Ryzen 9 and NVIDIA RTX 4070. Built for gamers who demand the best.',
    1799.00,
    'ASUS',
    'AMD Ryzen 9',
    '32GB',
    '1TB SSD',
    'NVIDIA RTX 4070',
    '16"',
    '2.1 kg',
    12,
    true
  ),
  (
    'Lenovo ThinkPad X1 Carbon Gen 12',
    'Ultra-lightweight business laptop with Intel Core Ultra processor and legendary ThinkPad reliability.',
    1599.00,
    'Lenovo',
    'Intel Core i7',
    '16GB',
    '512GB SSD',
    'Intel Integrated',
    '14"',
    '1.12 kg',
    20,
    false
  ),
  (
    'HP Spectre x360 14',
    'Versatile 2-in-1 laptop with OLED display and Intel Evo platform for premium performance.',
    1399.00,
    'HP',
    'Intel Core i7',
    '16GB',
    '512GB SSD',
    'Intel Integrated',
    '14"',
    '1.41 kg',
    10,
    true
  ),
  (
    'Acer Swift X 14',
    'Creator laptop with AMD Ryzen 7 and dedicated NVIDIA graphics at an affordable price point.',
    999.00,
    'Acer',
    'AMD Ryzen 7',
    '16GB',
    '512GB SSD',
    'NVIDIA RTX 3050',
    '14"',
    '1.4 kg',
    25,
    false
  ),
  (
    'MSI Raider GE78 HX',
    'Top-tier gaming beast with Intel Core i9 and RTX 4090 for uncompromising 4K gaming performance.',
    3999.00,
    'MSI',
    'Intel Core i9',
    '64GB',
    '2TB SSD',
    'NVIDIA RTX 4090',
    '17"',
    '2.9 kg',
    5,
    true
  ),
  (
    'MacBook Air 13-inch M3',
    'Impossibly thin and light with all-day battery life. M3 chip delivers up to 60% faster performance.',
    1299.00,
    'Apple',
    'Apple M3',
    '8GB',
    '256GB SSD',
    'Apple GPU',
    '13.6"',
    '1.24 kg',
    30,
    false
  )
on conflict do nothing;

-- Add some specifications for the first product
do $$
declare
  v_product_id uuid;
begin
  select id into v_product_id from public.products where name = 'MacBook Pro 16-inch M4 Pro' limit 1;
  if v_product_id is not null then
    insert into public.specifications (product_id, spec_key, spec_value)
    values
      (v_product_id, 'Battery Life', 'Up to 24 hours'),
      (v_product_id, 'Operating System', 'macOS Sequoia'),
      (v_product_id, 'Ports', '3x Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3'),
      (v_product_id, 'Display', '16.2-inch Liquid Retina XDR, 3456×2234'),
      (v_product_id, 'Refresh Rate', '120Hz ProMotion')
    on conflict do nothing;
  end if;
end;
$$;
