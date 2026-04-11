-- Migration 16: Add image_source_url to products
-- Admin-only field: stores where the product image was sourced from.
-- Never exposed to customers.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_source_url text;

COMMENT ON COLUMN public.products.image_source_url IS 'URL of the website/page where the product image was sourced. Admin-only, never shown to customers.';
