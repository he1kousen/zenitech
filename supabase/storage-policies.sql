-- Zenitech — Supabase Storage policies untuk bucket "product-images"
-- Jalankan di Supabase SQL Editor satu kali. Idempotent (DROP IF EXISTS dulu).
--
-- Strategi:
-- - Bucket public = true → URL bisa diakses tanpa token (cocok untuk foto produk).
-- - Insert/Update/Delete: hanya user dengan app_metadata.role = 'admin'.
-- - Select: tidak perlu policy karena bucket public, tapi tetap kita izinkan
--   eksplisit untuk anon + authenticated agar query langsung lewat REST tetap jalan.
--
-- Catatan: Pengecekan role mengikuti pola di useAuth.js (app_metadata.role),
-- konsisten dengan fix_rls_jwt.sql.

-- 1. Buat bucket public bila belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Drop existing policies (kalau pernah dijalankan sebelumnya)
DROP POLICY IF EXISTS "product-images public read" ON storage.objects;
DROP POLICY IF EXISTS "product-images admin insert" ON storage.objects;
DROP POLICY IF EXISTS "product-images admin update" ON storage.objects;
DROP POLICY IF EXISTS "product-images admin delete" ON storage.objects;

-- 3. Policy SELECT — semua orang boleh lihat (read public)
CREATE POLICY "product-images public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- 4. Policy INSERT — hanya admin
CREATE POLICY "product-images admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 5. Policy UPDATE — hanya admin (untuk overwrite/upsert)
CREATE POLICY "product-images admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 6. Policy DELETE — hanya admin
CREATE POLICY "product-images admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Verifikasi cepat (jalankan manual jika perlu):
--   SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';
--   SELECT polname, polcmd FROM pg_policy
--     WHERE polrelid = 'storage.objects'::regclass
--     AND polname LIKE 'product-images%';
