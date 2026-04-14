-- Migration 21: Standardize product condition values to:
--   - Neuf
--   - Comme neuf

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS condition VARCHAR(20);

-- Normalize all historical/legacy values.
UPDATE public.products
SET condition = CASE
  WHEN condition IS NULL OR btrim(condition) = '' THEN 'Neuf'
  WHEN lower(btrim(condition)) = 'neuf' THEN 'Neuf'
  WHEN lower(btrim(condition)) IN (
    'comme neuf',
    'like new',
    'excellent',
    'good',
    'fair',
    'reconditionne',
    'reconditionné',
    'reconditionnes',
    'reconditionnés'
  ) THEN 'Comme neuf'
  ELSE 'Comme neuf'
END;

ALTER TABLE public.products
  ALTER COLUMN condition SET DEFAULT 'Neuf',
  ALTER COLUMN condition SET NOT NULL;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_condition_allowed;

ALTER TABLE public.products
  ADD CONSTRAINT products_condition_allowed
  CHECK (condition IN ('Neuf', 'Comme neuf'));
