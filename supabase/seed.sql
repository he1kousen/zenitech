-- Zenitech Seed Data
-- Version: 002_saintech_data
-- Date: 2026-05-23
-- Description: Sample data for categories, products, variants, and images using Saintech data

-- ============================================================================
-- CATEGORIES
-- ============================================================================

INSERT INTO public.categories (id, name, slug, icon_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'iPhone', 'iphone', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Mac', 'mac', NULL),
  ('33333333-3333-3333-3333-333333333333', 'iPad', 'ipad', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Apple Watch', 'apple-watch', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Aksesoris', 'aksesoris', NULL);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO public.products (id, category_id, name, slug, description, base_price, is_active) VALUES
  -- iPhone Products
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 15 Pro Max',
    'iphone-15-pro-max',
    'iPhone dengan titanium, chip A17 Pro yang membawa inovasi performa grafis, dan tombol Tindakan yang bisa disesuaikan.',
    22999000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 14 Pro Max',
    'iphone-14-pro-max',
    'iPhone dengan Dynamic Island, kamera Utama 48 MP untuk detail memukau, dan layar Always-On.',
    16999000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 13',
    'iphone-13',
    'Sistem kamera ganda canggih. Chip A15 Bionic secepat kilat. Lompatan besar dalam kekuatan baterai.',
    9999000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111114',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 12',
    'iphone-12',
    'Chip A14 Bionic. Layar Super Retina XDR memukau. Ceramic Shield dengan ketahanan jatuh empat kali lebih baik.',
    7999000,
    true
  ),

  -- Mac Products
  (
    'a2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'MacBook Air 15.3" M2',
    'macbook-air-m2',
    'MacBook Air 15 inci tertipis di dunia. Dengan chip M2 yang andal, baterai tahan hingga 18 jam, dan layar Liquid Retina yang luas.',
    22999000,
    true
  ),

  -- Apple Watch Products
  (
    'a4444444-4444-4444-4444-444444444441',
    '44444444-4444-4444-4444-444444444444',
    'Apple Watch Nike Series 3',
    'apple-watch-nike-s3',
    'Pantau aktivitas Anda. Ukur olahraga Anda. Tali jam Nike Sport yang eksklusif untuk gaya yang dinamis.',
    3299000,
    true
  ),

  -- Aksesoris Products
  (
    'a5555555-5555-5555-5555-555555555551',
    '55555555-5555-5555-5555-555555555555',
    'Beats Studio Elite Headphone Wireless',
    'beats-studio-elite',
    'Headphone over-ear nirkabel dengan Active Noise Cancelling dan kualitas suara premium.',
    12499000,
    true
  ),
  (
    'a5555555-5555-5555-5555-555555555552',
    '55555555-5555-5555-5555-555555555555',
    'PlayStation DualSense Wireless Controller',
    'playstation-dualsense',
    'Pengontrol nirkabel DualSense dengan haptic feedback dan adaptive triggers.',
    429000,
    true
  );

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

-- iPhone 15 Pro Max Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'Natural Titanium', 0, 15, 'IP15PM-256-NAT'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'Natural Titanium', 3000000, 12, 'IP15PM-512-NAT'),
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'Blue Titanium', 0, 18, 'IP15PM-256-BLU'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'Blue Titanium', 3000000, 10, 'IP15PM-512-BLU');

-- iPhone 14 Pro Max Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'Deep Purple', 0, 20, 'IP14PM-128-PRP'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'Deep Purple', 2000000, 18, 'IP14PM-256-PRP'),
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'Space Black', 0, 15, 'IP14PM-128-BLK'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'Space Black', 2000000, 14, 'IP14PM-256-BLK');

-- iPhone 13 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a1111111-1111-1111-1111-111111111113', '128GB', 'Midnight', 0, 25, 'IP13-128-MID'),
  ('a1111111-1111-1111-1111-111111111113', '256GB', 'Midnight', 2000000, 20, 'IP13-256-MID'),
  ('a1111111-1111-1111-1111-111111111113', '128GB', 'Blue', 0, 22, 'IP13-128-BLU'),
  ('a1111111-1111-1111-1111-111111111113', '256GB', 'Blue', 2000000, 18, 'IP13-256-BLU');

-- iPhone 12 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a1111111-1111-1111-1111-111111111114', '64GB', 'Black', 0, 25, 'IP12-64-BLK'),
  ('a1111111-1111-1111-1111-111111111114', '128GB', 'Black', 1000000, 20, 'IP12-128-BLK');

-- MacBook Air M2 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a2222222-2222-2222-2222-222222222221', '256GB SSD / 8GB RAM', 'Midnight', 0, 10, 'MBA15M2-256-8-MID'),
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 8GB RAM', 'Midnight', 3000000, 8, 'MBA15M2-512-8-MID');

-- Apple Watch Nike S3 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a4444444-4444-4444-4444-444444444441', '42mm', 'Space Gray', 0, 15, 'AWNS3-42-GRY'),
  ('a4444444-4444-4444-4444-444444444441', '38mm', 'Space Gray', 0, 12, 'AWNS3-38-GRY');

-- Beats Studio Elite Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a5555555-5555-5555-5555-555555555551', NULL, 'Black', 0, 30, 'BEATS-ELITE-BLK');

-- PlayStation DualSense Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a5555555-5555-5555-5555-555555555552', NULL, 'White', 0, 25, 'PS5-CTRL-WHT');

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  -- iPhone 15 Pro Max
  ('a1111111-1111-1111-1111-111111111111', '/images/products/iphone-15-pro-max-1.webp', true, 0),
  ('a1111111-1111-1111-1111-111111111111', '/images/products/iphone-15-pro-max-2.webp', false, 1),
  ('a1111111-1111-1111-1111-111111111111', '/images/products/iphone-15-pro-max-3.webp', false, 2),
  ('a1111111-1111-1111-1111-111111111111', '/images/products/iphone-15-pro-max-4.webp', false, 3),

  -- iPhone 14 Pro Max
  ('a1111111-1111-1111-1111-111111111112', '/images/products/iphone-14-pro-max-1.webp', true, 0),
  ('a1111111-1111-1111-1111-111111111112', '/images/products/iphone-14-pro-max-2.webp', false, 1),
  ('a1111111-1111-1111-1111-111111111112', '/images/products/iphone-14-pro-max-3.webp', false, 2),
  ('a1111111-1111-1111-1111-111111111112', '/images/products/iphone-14-pro-max-4.webp', false, 3),

  -- iPhone 13
  ('a1111111-1111-1111-1111-111111111113', '/images/products/iphone-13-1.webp', true, 0),
  ('a1111111-1111-1111-1111-111111111113', '/images/products/iphone-13-2.webp', false, 1),
  ('a1111111-1111-1111-1111-111111111113', '/images/products/iphone-13-3.webp', false, 2),
  ('a1111111-1111-1111-1111-111111111113', '/images/products/iphone-13-4.webp', false, 3),

  -- iPhone 12
  ('a1111111-1111-1111-1111-111111111114', '/images/products/iphone-12-1.webp', true, 0),
  ('a1111111-1111-1111-1111-111111111114', '/images/products/iphone-12-2.webp', false, 1),
  ('a1111111-1111-1111-1111-111111111114', '/images/products/iphone-12-3.webp', false, 2),
  ('a1111111-1111-1111-1111-111111111114', '/images/products/iphone-12-4.webp', false, 3),

  -- MacBook Air M2
  ('a2222222-2222-2222-2222-222222222221', '/images/products/macbook-air-m2-1.webp', true, 0),
  ('a2222222-2222-2222-2222-222222222221', '/images/products/macbook-air-m2-2.webp', false, 1),
  ('a2222222-2222-2222-2222-222222222221', '/images/products/macbook-air-m2-3.webp', false, 2),
  ('a2222222-2222-2222-2222-222222222221', '/images/products/macbook-air-m2-4.webp', false, 3),

  -- Apple Watch Nike S3
  ('a4444444-4444-4444-4444-444444444441', '/images/products/apple-watch-nike-s3-1.webp', true, 0),
  ('a4444444-4444-4444-4444-444444444441', '/images/products/apple-watch-nike-s3-2.webp', false, 1),

  -- Beats Studio Elite
  ('a5555555-5555-5555-5555-555555555551', '/images/products/beats-studio-elite-1.webp', true, 0),

  -- PlayStation DualSense
  ('a5555555-5555-5555-5555-555555555552', '/images/products/playstation-dualsense-1.webp', true, 0);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
