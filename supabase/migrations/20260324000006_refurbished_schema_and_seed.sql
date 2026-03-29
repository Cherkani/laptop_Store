-- Migration 6: Add refurbished-specific columns + comprehensive used laptop seed data

-- ── Add new columns ──────────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'Good',
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- ── Wipe existing seed data ───────────────────────────────────────────────────
DELETE FROM public.specifications;
DELETE FROM public.product_images;
DELETE FROM public.products;

-- ── Insert refurbished laptop catalogue ──────────────────────────────────────
INSERT INTO public.products
  (name, description, price, original_price, condition, brand,
   processor, ram, storage, graphics_card, screen_size, weight,
   stock_quantity, is_featured)
VALUES

  -- ── Apple ──────────────────────────────────────────────────────────────────
  (
    'MacBook Pro 14" M3 Pro',
    'Barely used MacBook Pro with the M3 Pro chip. Pristine condition with all original accessories. Up to 18 hours battery life. Perfect for developers, creatives and power users.',
    1299.00, 1999.00, 'Like New',
    'Apple', 'Apple M3 Pro', '18GB', '512GB SSD', 'Apple GPU', '14.2"', '1.61 kg',
    3, true
  ),
  (
    'MacBook Pro 16" M2 Pro',
    'Powerful 16-inch MacBook Pro with M2 Pro chip. Comes with Liquid Retina XDR display and all-day battery. Light cosmetic wear only.',
    1549.00, 2499.00, 'Excellent',
    'Apple', 'Apple M2 Pro', '16GB', '512GB SSD', 'Apple GPU', '16.2"', '2.15 kg',
    2, true
  ),
  (
    'MacBook Air 13" M2',
    'Thin, light and fanless. The MacBook Air with M2 chip is incredibly fast and silent. Perfect everyday machine in excellent used condition.',
    679.00, 1099.00, 'Excellent',
    'Apple', 'Apple M2', '8GB', '256GB SSD', 'Apple GPU', '13.6"', '1.24 kg',
    6, true
  ),
  (
    'MacBook Air 15" M2',
    'The large-screen MacBook Air with M2. Great display, silent fanless design, all-day battery. Cosmetically perfect with some light use.',
    749.00, 1299.00, 'Good',
    'Apple', 'Apple M2', '8GB', '256GB SSD', 'Apple GPU', '15.3"', '1.51 kg',
    4, false
  ),
  (
    'MacBook Pro 13" M2',
    'Compact and powerful M2 MacBook Pro with Touch Bar. Excellent speed for coding, photo editing and office work. Well maintained.',
    849.00, 1299.00, 'Excellent',
    'Apple', 'Apple M2', '16GB', '512GB SSD', 'Apple GPU', '13.3"', '1.4 kg',
    5, false
  ),

  -- ── Dell ───────────────────────────────────────────────────────────────────
  (
    'Dell XPS 15 9530 (2023)',
    'Premium Dell XPS with OLED display and RTX 4060 graphics. Like-new condition — minimal use, no scratches. Stunning visuals for creators.',
    999.00, 1799.00, 'Like New',
    'Dell', 'Intel Core i9', '32GB', '1TB SSD', 'NVIDIA RTX 4060', '15.6"', '1.86 kg',
    2, true
  ),
  (
    'Dell XPS 13 Plus (2022)',
    'Ultra-sleek XPS 13 Plus with edge-to-edge display and haptic touchpad. Some cosmetic wear, perfect internals. Great for travel.',
    649.00, 1299.00, 'Excellent',
    'Dell', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '13.4"', '1.27 kg',
    7, false
  ),
  (
    'Dell Inspiron 16 (2022)',
    'Versatile and affordable Inspiron 16 with large display. Ideal for students and everyday use. Minor scratches on lid, fully functional.',
    389.00, 799.00, 'Good',
    'Dell', 'Intel Core i5', '16GB', '512GB SSD', 'Intel Integrated', '16"', '1.98 kg',
    10, false
  ),

  -- ── Lenovo ─────────────────────────────────────────────────────────────────
  (
    'ThinkPad X1 Carbon Gen 11',
    'Business flagship ThinkPad in outstanding condition. MIL-SPEC tested chassis, excellent keyboard, ultra-light at just 1.12 kg.',
    749.00, 1599.00, 'Excellent',
    'Lenovo', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '14"', '1.12 kg',
    5, true
  ),
  (
    'ThinkPad X1 Yoga Gen 7',
    '2-in-1 convertible ThinkPad with OLED display and pen support. Good condition with minor lid wear. Best business convertible on the market.',
    599.00, 1499.00, 'Good',
    'Lenovo', 'Intel Core i5', '16GB', '512GB SSD', 'Intel Integrated', '14"', '1.38 kg',
    4, false
  ),
  (
    'Lenovo IdeaPad 5 Pro 14',
    'Excellent everyday laptop with IPS display and solid performance. Light use, great battery life. Perfect for students.',
    419.00, 799.00, 'Excellent',
    'Lenovo', 'AMD Ryzen 7', '16GB', '512GB SSD', 'AMD Integrated', '14"', '1.4 kg',
    12, false
  ),

  -- ── HP ─────────────────────────────────────────────────────────────────────
  (
    'HP Spectre x360 14 (2022)',
    'Premium HP 2-in-1 with OLED display and long battery life. Outstanding build quality in barely used condition. Comes with HP pen.',
    649.00, 1399.00, 'Excellent',
    'HP', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '13.5"', '1.36 kg',
    3, false
  ),
  (
    'HP EliteBook 840 G9 (2022)',
    'Corporate-grade HP EliteBook with excellent durability and security features. Good condition with minor marks. Ready for business.',
    529.00, 1199.00, 'Good',
    'HP', 'Intel Core i5', '16GB', '512GB SSD', 'Intel Integrated', '14"', '1.33 kg',
    8, false
  ),
  (
    'HP Pavilion 15 (2022)',
    'Reliable everyday HP laptop at a great price. Some wear on keyboard area but fully functional. Great value for budget shoppers.',
    289.00, 649.00, 'Fair',
    'HP', 'Intel Core i5', '8GB', '256GB SSD', 'Intel Integrated', '15.6"', '1.75 kg',
    15, false
  ),

  -- ── ASUS ───────────────────────────────────────────────────────────────────
  (
    'ROG Zephyrus G14 (2023)',
    'Compact and powerful gaming laptop with Ryzen 9 and RTX 4060. Barely used, no scratches. Best gaming laptop under $1000 refurbished.',
    979.00, 1599.00, 'Like New',
    'ASUS', 'AMD Ryzen 9', '16GB', '1TB SSD', 'NVIDIA RTX 4060', '14"', '1.72 kg',
    3, true
  ),
  (
    'ASUS ZenBook Pro 16X (2022)',
    'Creator-focused ZenBook Pro with OLED display and RTX 3060. Excellent condition, full accessories included. Perfect for video editing.',
    899.00, 1799.00, 'Excellent',
    'ASUS', 'Intel Core i9', '32GB', '1TB SSD', 'NVIDIA RTX 3060', '16"', '2.4 kg',
    2, false
  ),

  -- ── Razer ──────────────────────────────────────────────────────────────────
  (
    'Razer Blade 15 Advanced (2022)',
    'Premium gaming laptop with QHD 240Hz display and RTX 3080 Ti. Excellent condition for the discerning gamer who wants the best at a fair price.',
    1099.00, 2499.00, 'Excellent',
    'Razer', 'Intel Core i9', '32GB', '1TB SSD', 'NVIDIA RTX 3080', '15.6"', '2.01 kg',
    2, true
  ),

  -- ── MSI ────────────────────────────────────────────────────────────────────
  (
    'MSI Prestige 14 Evo (2022)',
    'Lightweight MSI business laptop with fast Intel processor. Good condition with light cosmetic wear. Great battery life and portability.',
    449.00, 999.00, 'Good',
    'MSI', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '14"', '1.29 kg',
    6, false
  ),

  -- ── Acer ───────────────────────────────────────────────────────────────────
  (
    'Acer Swift X 14 (2022)',
    'Slim creator laptop with dedicated NVIDIA graphics. Excellent condition, barely used. Punches well above its price for content creators.',
    479.00, 899.00, 'Excellent',
    'Acer', 'AMD Ryzen 7', '16GB', '512GB SSD', 'NVIDIA RTX 3050', '14"', '1.4 kg',
    9, false
  ),

  -- ── Samsung ────────────────────────────────────────────────────────────────
  (
    'Samsung Galaxy Book3 Pro 360',
    '2-in-1 AMOLED laptop with S Pen included. Like-new condition. Gorgeous display, ultra-thin, great for note-taking and creative work.',
    799.00, 1399.00, 'Like New',
    'Samsung', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '16"', '1.66 kg',
    3, false
  ),

  -- ── LG ─────────────────────────────────────────────────────────────────────
  (
    'LG Gram 16 (2022)',
    'Incredibly lightweight LG Gram at just 1.19 kg. MIL-SPEC durability in a beautiful 16-inch body. Excellent condition, long battery life.',
    699.00, 1399.00, 'Excellent',
    'LG', 'Intel Core i7', '16GB', '512GB SSD', 'Intel Integrated', '16"', '1.19 kg',
    4, false
  )

ON CONFLICT DO NOTHING;

-- ── Specifications for key products ──────────────────────────────────────────
DO $$
DECLARE
  v_id UUID;
BEGIN
  -- MacBook Pro 14" M3 Pro
  SELECT id INTO v_id FROM public.products WHERE name = 'MacBook Pro 14" M3 Pro' LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.specifications (product_id, spec_key, spec_value) VALUES
      (v_id, 'Battery Life', 'Up to 18 hours'),
      (v_id, 'Display', '14.2-inch Liquid Retina XDR, 3024×1964'),
      (v_id, 'Refresh Rate', '120Hz ProMotion'),
      (v_id, 'Ports', '3x Thunderbolt 4, HDMI 2.1, SD card, MagSafe 3'),
      (v_id, 'Operating System', 'macOS Sonoma'),
      (v_id, 'Condition Details', 'No scratches, all original accessories included, battery health 97%')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Dell XPS 15 9530
  SELECT id INTO v_id FROM public.products WHERE name = 'Dell XPS 15 9530 (2023)' LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.specifications (product_id, spec_key, spec_value) VALUES
      (v_id, 'Display', '15.6-inch OLED, 3456×2160, 60Hz'),
      (v_id, 'Battery', '86Wh, up to 13 hours'),
      (v_id, 'Ports', '2x Thunderbolt 4, USB-A, SD reader, 3.5mm'),
      (v_id, 'Operating System', 'Windows 11 Home'),
      (v_id, 'Condition Details', 'No cosmetic damage, battery health 98%, charger included')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ThinkPad X1 Carbon Gen 11
  SELECT id INTO v_id FROM public.products WHERE name = 'ThinkPad X1 Carbon Gen 11' LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.specifications (product_id, spec_key, spec_value) VALUES
      (v_id, 'Display', '14-inch IPS, 1920×1200, 400 nits'),
      (v_id, 'Battery', '57Wh, up to 15 hours'),
      (v_id, 'Certification', 'MIL-STD-810H military grade'),
      (v_id, 'Operating System', 'Windows 11 Pro'),
      (v_id, 'Condition Details', 'Light use marks on palmrest, battery health 91%')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ROG Zephyrus G14
  SELECT id INTO v_id FROM public.products WHERE name = 'ROG Zephyrus G14 (2023)' LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.specifications (product_id, spec_key, spec_value) VALUES
      (v_id, 'Display', '14-inch QHD+ 165Hz, 100% DCI-P3'),
      (v_id, 'Battery', '73Wh, gaming ~5h, office ~10h'),
      (v_id, 'GPU TGP', 'Up to 100W boost'),
      (v_id, 'Operating System', 'Windows 11 Home'),
      (v_id, 'Condition Details', 'No scratches, charger included, battery health 96%')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
