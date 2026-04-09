-- Migration 14: Add sourcing / dropshipping columns to products
-- These columns are ADMIN-ONLY and must NEVER be exposed to the public API.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS source_url     text,
  ADD COLUMN IF NOT EXISTS source_price   numeric(10, 2),
  ADD COLUMN IF NOT EXISTS margin_amount  numeric(10, 2),
  ADD COLUMN IF NOT EXISTS is_available   boolean not null default true;

-- Index so the public catalog query (is_available = true) is fast
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);

COMMENT ON COLUMN public.products.source_url    IS 'Private: URL of the external store where this product is sourced from. Never returned to the public API.';
COMMENT ON COLUMN public.products.source_price  IS 'Private: purchase price from the source store (MAD). Never returned to the public API.';
COMMENT ON COLUMN public.products.margin_amount IS 'Private: margin added on top of source price (MAD). Selling price = source_price + margin_amount.';
COMMENT ON COLUMN public.products.is_available  IS 'When false the product is hidden from the public catalog and excluded from sales statistics.';
