-- Zenitech — Fix RLS Infinite Recursion
-- Problem: Policy "Admins can read all users" pada tabel public.users men-query
-- public.users di dalam USING clause-nya sendiri. Setiap SELECT users men-trigger
-- evaluasi policy yang men-trigger SELECT users lagi → infinite recursion.
--
-- Solusi: Ganti pola EXISTS(SELECT FROM users WHERE role='admin') dengan
-- SECURITY DEFINER function yang query langsung tanpa kena RLS.
--
-- Jalankan di Supabase Dashboard → SQL Editor.

BEGIN;

-- ============================================================================
-- 1. Helper function untuk cek admin tanpa trigger RLS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================================
-- 2. Drop semua policy lama yang pakai pola EXISTS rekursif
-- ============================================================================

-- USERS
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- CATEGORIES
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- PRODUCTS
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
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

-- ============================================================================
-- 3. Re-create dengan helper function (tidak rekursif)
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
-- Public read tetap pakai is_active = true. Admin lihat semua via is_admin().
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

COMMIT;

-- Verifikasi: query products dari anon (tanpa login) harus return data, bukan error
-- SELECT id, name FROM public.products WHERE is_active = true LIMIT 3;
