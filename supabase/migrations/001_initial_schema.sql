-- Zenitech Database Schema Migration
-- Version: 001_initial_schema
-- Date: 2026-05-20
-- Description: Initial database schema for Zenitech e-commerce platform

-- ============================================================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price NUMERIC(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. PRODUCT_IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. PRODUCT_VARIANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  storage TEXT,
  color TEXT,
  price_modifier NUMERIC(12,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(12,2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. ORDER_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  price_snapshot NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 8. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) UNIQUE,
  midtrans_token TEXT,
  midtrans_order_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 9. SHIPPING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) UNIQUE,
  courier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Everyone can read categories (public read)
CREATE POLICY "Anyone can read categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update categories
CREATE POLICY "Admins can update categories"
  ON public.categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON public.categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Everyone can read active products (public read)
CREATE POLICY "Anyone can read active products"
  ON public.products
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update products
CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PRODUCT_IMAGES TABLE POLICIES
-- ============================================================================

-- Everyone can read product images
CREATE POLICY "Anyone can read product images"
  ON public.product_images
  FOR SELECT
  USING (true);

-- Only admins can manage product images
CREATE POLICY "Admins can manage product images"
  ON public.product_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PRODUCT_VARIANTS TABLE POLICIES
-- ============================================================================

-- Everyone can read product variants
CREATE POLICY "Anyone can read product variants"
  ON public.product_variants
  FOR SELECT
  USING (true);

-- Only admins can manage product variants
CREATE POLICY "Admins can manage product variants"
  ON public.product_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================

-- Users can read their own order items
CREATE POLICY "Users can read own order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all order items
CREATE POLICY "Admins can read all order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create payments for their own orders
CREATE POLICY "Users can create own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SHIPPING TABLE POLICIES
-- ============================================================================

-- Users can read their own shipping info
CREATE POLICY "Users can read own shipping"
  ON public.shipping
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = shipping.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all shipping
CREATE POLICY "Admins can manage all shipping"
  ON public.shipping
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 11. TRIGGER: Auto-create user profile on signup
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'buyer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES for better query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_midtrans_order_id ON public.payments(midtrans_order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_order_id ON public.shipping(order_id);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
