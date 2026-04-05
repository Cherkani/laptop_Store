-- Migration 10: add OS column for Windows/macOS filtering

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS os text DEFAULT 'Windows' CHECK (os in ('Windows', 'macOS'));

-- Backfill existing catalogue
UPDATE public.products
SET os = CASE
  WHEN brand = 'Apple' THEN 'macOS'
  ELSE 'Windows'
END
WHERE os IS NULL OR os NOT IN ('Windows', 'macOS');

CREATE INDEX IF NOT EXISTS idx_products_os ON public.products(os);
