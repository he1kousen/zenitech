-- Zenitech — Fix RLS via JWT Claims (Proper Pattern)
-- Solusi: cek role admin dari auth.jwt() (token claims), bukan query public.users.
-- Tidak ada recursion karena tidak ada query ke public.users di policy mana pun.
--
-- Cara set user jadi admin (jalankan terpisah, ganti USER_ID):
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   WHERE id = 'USER_ID_DI_SINI';
--
-- Jalankan di Supabase Dashboard → SQL Editor.

BEGIN;

-- ============================================================================
-- 1. Helper function: cek admin dari JWT (tidak query users)
-- ============================================================================
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================================
-- 2. Drop semua policy admin lama yang reference public.users
-- ============================================================================

-- USERS
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- CATEGORIES
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- PRODUCT_IMAGES
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;

-- PRODUCT_VARIANTS
DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;

-- ORDERS
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- ORDER_ITEMS
DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;

-- PAYMENTS
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

-- ============================================================================
-- 3. Re-create policy pakai is_admin() (JWT-based, no recursion)
-- ============================================================================

-- USERS
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- CATEGORIES
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- PRODUCTS
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- PRODUCT_IMAGES
CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- PRODUCT_VARIANTS
CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

-- ORDERS
CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ORDER_ITEMS
CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- PAYMENTS
CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

COMMIT;

-- ============================================================================
-- 4. Verifikasi
-- ============================================================================
-- Cek policy yang aktif
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Cek produk aktif (harus return 9)
SELECT COUNT(*) AS active_products FROM public.products WHERE is_active = true;
