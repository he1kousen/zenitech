-- Zenitech — Fix RLS (Simple Version)
-- Drop semua policy admin yang reference public.users (penyebab infinite recursion).
-- Untuk MVP: katalog public, user-data per-owner, admin lewat service_role/dashboard.
-- Jalankan di Supabase Dashboard → SQL Editor.

BEGIN;

-- Drop helper function dari fix sebelumnya berikut policy-policy yang depend padanya
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Drop SEMUA policy admin yang punya pola EXISTS(SELECT FROM users WHERE role='admin')
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;

DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

-- Re-create policy SELECT untuk products (yang sebelumnya di-drop)
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (is_active = true);

COMMIT;

-- Verifikasi: harus return 9
SELECT COUNT(*) AS active_products FROM public.products WHERE is_active = true;

-- Verifikasi: list policy yang masih ada
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
