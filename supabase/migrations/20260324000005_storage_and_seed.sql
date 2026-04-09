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
