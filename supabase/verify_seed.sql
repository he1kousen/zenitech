-- Zenitech — Verify Seed Data
-- Jalankan di Supabase SQL Editor untuk cek apakah data sudah ada.
-- Jika hasil count = 0 di mana-mana, berarti seed.sql belum di-run.

SELECT 'categories' AS table_name, COUNT(*)::int AS row_count FROM public.categories
UNION ALL
SELECT 'products',         COUNT(*)::int FROM public.products
UNION ALL
SELECT 'product_variants', COUNT(*)::int FROM public.product_variants
UNION ALL
SELECT 'product_images',   COUNT(*)::int FROM public.product_images
ORDER BY table_name;

-- Cek apakah RLS aktif (harusnya t / true untuk 4 tabel di atas)
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'products', 'product_variants', 'product_images')
ORDER BY tablename;

-- Cek policy SELECT untuk public read
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'products', 'product_variants', 'product_images')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
