-- Zenitech Seed Data
-- Version: 001_seed_data
-- Date: 2026-05-20
-- Description: Sample data for categories, products, variants, and images

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
    'iPhone 16 Pro Max',
    'iphone-16-pro-max',
    'iPhone terbaru dengan chip A18 Pro, kamera 48MP, layar Super Retina XDR 6.9 inci, dan baterai tahan lama sepanjang hari.',
    21999000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 16',
    'iphone-16',
    'iPhone dengan chip A18, kamera ganda 48MP, Dynamic Island, dan desain aluminium premium dengan pilihan warna cerah.',
    15999000,
    true
  ),
  (
    'a1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'iPhone 15',
    'iphone-15',
    'iPhone dengan chip A16 Bionic, kamera utama 48MP, USB-C, dan Dynamic Island untuk pengalaman yang lebih immersive.',
    13999000,
    true
  ),

  -- Mac Products
  (
    'a2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'MacBook Air M3 13"',
    'macbook-air-m3-13',
    'Laptop tipis dan ringan dengan chip M3 yang powerful, layar Liquid Retina 13.6 inci, dan baterai hingga 18 jam.',
    18499000,
    true
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'MacBook Pro M4 14"',
    'macbook-pro-m4-14',
    'Laptop profesional dengan chip M4 Pro, layar Liquid Retina XDR 14 inci, dan performa luar biasa untuk creative work.',
    29999000,
    true
  ),

  -- iPad Products
  (
    'a3333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333333',
    'iPad Pro M4 11"',
    'ipad-pro-m4-11',
    'iPad paling powerful dengan chip M4, layar Ultra Retina XDR 11 inci, dan mendukung Apple Pencil Pro.',
    17499000,
    true
  ),

  -- Apple Watch Products
  (
    'a4444444-4444-4444-4444-444444444441',
    '44444444-4444-4444-4444-444444444444',
    'Apple Watch Series 10',
    'apple-watch-series-10',
    'Smartwatch dengan layar Always-On Retina yang lebih besar, sensor kesehatan lengkap, dan tahan air hingga 50 meter.',
    6499000,
    true
  ),

  -- Aksesoris Products
  (
    'a5555555-5555-5555-5555-555555555551',
    '55555555-5555-5555-5555-555555555555',
    'AirPods Pro 2',
    'airpods-pro-2',
    'Earbuds dengan Active Noise Cancellation, Adaptive Audio, dan charging case USB-C dengan speaker untuk Find My.',
    4299000,
    true
  ),
  (
    'a5555555-5555-5555-5555-555555555552',
    '55555555-5555-5555-5555-555555555555',
    'Apple Pencil Pro',
    'apple-pencil-pro',
    'Stylus presisi tinggi dengan sensor squeeze, barrel roll, dan haptic feedback untuk pengalaman menggambar profesional.',
    1999000,
    true
  );

-- ============================================================================
-- PRODUCT VARIANTS
-- ============================================================================

-- iPhone 16 Pro Max Variants (Storage + Color combinations)
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  -- Natural Titanium
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'Natural Titanium', 0, 15, 'IP16PM-256-NAT'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'Natural Titanium', 3000000, 12, 'IP16PM-512-NAT'),
  ('a1111111-1111-1111-1111-111111111111', '1TB', 'Natural Titanium', 6000000, 8, 'IP16PM-1TB-NAT'),
  -- Black Titanium
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'Black Titanium', 0, 18, 'IP16PM-256-BLK'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'Black Titanium', 3000000, 10, 'IP16PM-512-BLK'),
  ('a1111111-1111-1111-1111-111111111111', '1TB', 'Black Titanium', 6000000, 5, 'IP16PM-1TB-BLK'),
  -- White Titanium
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'White Titanium', 0, 14, 'IP16PM-256-WHT'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'White Titanium', 3000000, 9, 'IP16PM-512-WHT'),
  -- Blue Titanium
  ('a1111111-1111-1111-1111-111111111111', '256GB', 'Blue Titanium', 0, 11, 'IP16PM-256-BLU'),
  ('a1111111-1111-1111-1111-111111111111', '512GB', 'Blue Titanium', 3000000, 7, 'IP16PM-512-BLU');

-- iPhone 16 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  -- Black
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'Black', 0, 20, 'IP16-128-BLK'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'Black', 2000000, 18, 'IP16-256-BLK'),
  ('a1111111-1111-1111-1111-111111111112', '512GB', 'Black', 4000000, 12, 'IP16-512-BLK'),
  -- Pink
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'Pink', 0, 15, 'IP16-128-PNK'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'Pink', 2000000, 14, 'IP16-256-PNK'),
  -- Blue
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'Blue', 0, 17, 'IP16-128-BLU'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'Blue', 2000000, 13, 'IP16-256-BLU'),
  -- White
  ('a1111111-1111-1111-1111-111111111112', '128GB', 'White', 0, 19, 'IP16-128-WHT'),
  ('a1111111-1111-1111-1111-111111111112', '256GB', 'White', 2000000, 16, 'IP16-256-WHT');

-- iPhone 15 Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a1111111-1111-1111-1111-111111111113', '128GB', 'Black', 0, 25, 'IP15-128-BLK'),
  ('a1111111-1111-1111-1111-111111111113', '256GB', 'Black', 2000000, 20, 'IP15-256-BLK'),
  ('a1111111-1111-1111-1111-111111111113', '128GB', 'Blue', 0, 22, 'IP15-128-BLU'),
  ('a1111111-1111-1111-1111-111111111113', '256GB', 'Blue', 2000000, 18, 'IP15-256-BLU'),
  ('a1111111-1111-1111-1111-111111111113', '128GB', 'Pink', 0, 20, 'IP15-128-PNK'),
  ('a1111111-1111-1111-1111-111111111113', '256GB', 'Pink', 2000000, 15, 'IP15-256-PNK');

-- MacBook Air M3 13" Variants (RAM + Storage)
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  -- 8GB RAM variants
  ('a2222222-2222-2222-2222-222222222221', '256GB SSD / 8GB RAM', 'Midnight', 0, 10, 'MBA13M3-256-8-MID'),
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 8GB RAM', 'Midnight', 3000000, 8, 'MBA13M3-512-8-MID'),
  ('a2222222-2222-2222-2222-222222222221', '256GB SSD / 8GB RAM', 'Starlight', 0, 12, 'MBA13M3-256-8-STR'),
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 8GB RAM', 'Starlight', 3000000, 9, 'MBA13M3-512-8-STR'),
  -- 16GB RAM variants
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 16GB RAM', 'Midnight', 5000000, 6, 'MBA13M3-512-16-MID'),
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 16GB RAM', 'Starlight', 5000000, 7, 'MBA13M3-512-16-STR'),
  ('a2222222-2222-2222-2222-222222222221', '256GB SSD / 8GB RAM', 'Space Gray', 0, 11, 'MBA13M3-256-8-GRY'),
  ('a2222222-2222-2222-2222-222222222221', '512GB SSD / 8GB RAM', 'Space Gray', 3000000, 8, 'MBA13M3-512-8-GRY');

-- MacBook Pro M4 14" Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a2222222-2222-2222-2222-222222222222', '512GB SSD / 16GB RAM', 'Space Black', 0, 8, 'MBP14M4-512-16-BLK'),
  ('a2222222-2222-2222-2222-222222222222', '1TB SSD / 16GB RAM', 'Space Black', 4000000, 6, 'MBP14M4-1TB-16-BLK'),
  ('a2222222-2222-2222-2222-222222222222', '512GB SSD / 16GB RAM', 'Silver', 0, 7, 'MBP14M4-512-16-SLV'),
  ('a2222222-2222-2222-2222-222222222222', '1TB SSD / 16GB RAM', 'Silver', 4000000, 5, 'MBP14M4-1TB-16-SLV'),
  ('a2222222-2222-2222-2222-222222222222', '1TB SSD / 24GB RAM', 'Space Black', 7000000, 4, 'MBP14M4-1TB-24-BLK');

-- iPad Pro M4 11" Variants
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a3333333-3333-3333-3333-333333333331', '256GB', 'Space Gray', 0, 12, 'IPADPRO11M4-256-GRY'),
  ('a3333333-3333-3333-3333-333333333331', '512GB', 'Space Gray', 3000000, 10, 'IPADPRO11M4-512-GRY'),
  ('a3333333-3333-3333-3333-333333333331', '1TB', 'Space Gray', 6000000, 6, 'IPADPRO11M4-1TB-GRY'),
  ('a3333333-3333-3333-3333-333333333331', '256GB', 'Silver', 0, 11, 'IPADPRO11M4-256-SLV'),
  ('a3333333-3333-3333-3333-333333333331', '512GB', 'Silver', 3000000, 9, 'IPADPRO11M4-512-SLV'),
  ('a3333333-3333-3333-3333-333333333331', '1TB', 'Silver', 6000000, 5, 'IPADPRO11M4-1TB-SLV');

-- Apple Watch Series 10 Variants (Size + Color)
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a4444444-4444-4444-4444-444444444441', '42mm', 'Midnight Aluminum', 0, 15, 'AWS10-42-MID'),
  ('a4444444-4444-4444-4444-444444444441', '46mm', 'Midnight Aluminum', 1000000, 12, 'AWS10-46-MID'),
  ('a4444444-4444-4444-4444-444444444441', '42mm', 'Starlight Aluminum', 0, 14, 'AWS10-42-STR'),
  ('a4444444-4444-4444-4444-444444444441', '46mm', 'Starlight Aluminum', 1000000, 11, 'AWS10-46-STR'),
  ('a4444444-4444-4444-4444-444444444441', '42mm', 'Silver Aluminum', 0, 13, 'AWS10-42-SLV'),
  ('a4444444-4444-4444-4444-444444444441', '46mm', 'Silver Aluminum', 1000000, 10, 'AWS10-46-SLV');

-- AirPods Pro 2 Variants (Single variant, no storage)
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a5555555-5555-5555-5555-555555555551', NULL, 'White', 0, 30, 'AIRPODSPRO2-WHT');

-- Apple Pencil Pro Variants (Single variant)
INSERT INTO public.product_variants (product_id, storage, color, price_modifier, stock, sku) VALUES
  ('a5555555-5555-5555-5555-555555555552', NULL, 'White', 0, 25, 'APPLEPENCILPRO-WHT');

-- ============================================================================
-- PRODUCT IMAGES
-- ============================================================================

-- iPhone 16 Pro Max Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'https://placehold.co/800x600/1d1d1f/ffffff?text=iPhone+16+Pro+Max', true, 0),
  ('a1111111-1111-1111-1111-111111111111', 'https://placehold.co/800x600/1d1d1f/ffffff?text=iPhone+16+Pro+Max+Side', false, 1),
  ('a1111111-1111-1111-1111-111111111111', 'https://placehold.co/800x600/1d1d1f/ffffff?text=iPhone+16+Pro+Max+Back', false, 2);

-- iPhone 16 Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111112', 'https://placehold.co/800x600/0066cc/ffffff?text=iPhone+16', true, 0),
  ('a1111111-1111-1111-1111-111111111112', 'https://placehold.co/800x600/0066cc/ffffff?text=iPhone+16+Colors', false, 1);

-- iPhone 15 Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111113', 'https://placehold.co/800x600/2997ff/ffffff?text=iPhone+15', true, 0),
  ('a1111111-1111-1111-1111-111111111113', 'https://placehold.co/800x600/2997ff/ffffff?text=iPhone+15+Dynamic+Island', false, 1);

-- MacBook Air M3 13" Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a2222222-2222-2222-2222-222222222221', 'https://placehold.co/800x600/f5f5f7/1d1d1f?text=MacBook+Air+M3+13', true, 0),
  ('a2222222-2222-2222-2222-222222222221', 'https://placehold.co/800x600/f5f5f7/1d1d1f?text=MacBook+Air+M3+Side', false, 1),
  ('a2222222-2222-2222-2222-222222222221', 'https://placehold.co/800x600/f5f5f7/1d1d1f?text=MacBook+Air+M3+Open', false, 2);

-- MacBook Pro M4 14" Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a2222222-2222-2222-2222-222222222222', 'https://placehold.co/800x600/1d1d1f/ffffff?text=MacBook+Pro+M4+14', true, 0),
  ('a2222222-2222-2222-2222-222222222222', 'https://placehold.co/800x600/1d1d1f/ffffff?text=MacBook+Pro+M4+Display', false, 1);

-- iPad Pro M4 11" Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a3333333-3333-3333-3333-333333333331', 'https://placehold.co/800x600/ffffff/1d1d1f?text=iPad+Pro+M4+11', true, 0),
  ('a3333333-3333-3333-3333-333333333331', 'https://placehold.co/800x600/ffffff/1d1d1f?text=iPad+Pro+M4+Pencil', false, 1),
  ('a3333333-3333-3333-3333-333333333331', 'https://placehold.co/800x600/ffffff/1d1d1f?text=iPad+Pro+M4+Keyboard', false, 2);

-- Apple Watch Series 10 Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a4444444-4444-4444-4444-444444444441', 'https://placehold.co/800x600/1d1d1f/ffffff?text=Apple+Watch+Series+10', true, 0),
  ('a4444444-4444-4444-4444-444444444441', 'https://placehold.co/800x600/1d1d1f/ffffff?text=Apple+Watch+Faces', false, 1);

-- AirPods Pro 2 Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a5555555-5555-5555-5555-555555555551', 'https://placehold.co/800x600/ffffff/1d1d1f?text=AirPods+Pro+2', true, 0),
  ('a5555555-5555-5555-5555-555555555551', 'https://placehold.co/800x600/ffffff/1d1d1f?text=AirPods+Pro+2+Case', false, 1);

-- Apple Pencil Pro Images
INSERT INTO public.product_images (product_id, url, is_primary, sort_order) VALUES
  ('a5555555-5555-5555-5555-555555555552', 'https://placehold.co/800x600/ffffff/1d1d1f?text=Apple+Pencil+Pro', true, 0),
  ('a5555555-5555-5555-5555-555555555552', 'https://placehold.co/800x600/ffffff/1d1d1f?text=Apple+Pencil+Pro+Features', false, 1);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
