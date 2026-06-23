/*
# PizzApp - RLS y políticas de seguridad

## Seguridad
Habilita RLS en todas las tablas y crea las políticas de acceso:
- profiles: usuario lee/edita su perfil; admin lee todos.
- products: lectura pública (anon+authenticated); solo admin escribe.
- orders: usuario ve/edita los suyos; admin ve/edita todos.
- order_items: acceso a través del order padre.
*/

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: profiles
-- =====================================================
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLICIES: products
-- =====================================================
DROP POLICY IF EXISTS "read_products" ON public.products;
CREATE POLICY "read_products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_products_admin" ON public.products;
CREATE POLICY "insert_products_admin"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_products_admin" ON public.products;
CREATE POLICY "update_products_admin"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_products_admin" ON public.products;
CREATE POLICY "delete_products_admin"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- POLICIES: orders
-- =====================================================
DROP POLICY IF EXISTS "select_orders" ON public.orders;
CREATE POLICY "select_orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_orders" ON public.orders;
CREATE POLICY "insert_orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_orders" ON public.orders;
CREATE POLICY "update_orders"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- =====================================================
-- POLICIES: order_items
-- =====================================================
DROP POLICY IF EXISTS "select_order_items" ON public.order_items;
CREATE POLICY "select_order_items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "insert_order_items" ON public.order_items;
CREATE POLICY "insert_order_items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
