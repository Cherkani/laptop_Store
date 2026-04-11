-- Migration 15: Add daily availability check tracking to products
-- No new table needed — we extend the products table directly.
-- last_checked_at: when the admin last verified the source listing is still live
-- availability_note: why the product was marked unavailable (e.g. "Vendu sur Jumia")

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS last_checked_at  timestamptz,
  ADD COLUMN IF NOT EXISTS availability_note text;

CREATE INDEX IF NOT EXISTS idx_products_last_checked ON public.products(last_checked_at);

COMMENT ON COLUMN public.products.last_checked_at   IS 'Timestamp of last admin check that source listing is still live. Null = never checked. Warning shown if older than 24h.';
COMMENT ON COLUMN public.products.availability_note IS 'Admin note explaining why product is unavailable (e.g. "Vendu chez la source"). Cleared when re-enabled.';
