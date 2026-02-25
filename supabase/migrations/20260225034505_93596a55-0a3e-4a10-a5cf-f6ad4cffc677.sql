
-- Fix: recreate UPDATE policy as PERMISSIVE
DROP POLICY IF EXISTS "Admins can update orders" ON public.pedidos;

CREATE POLICY "Admins can update orders"
ON public.pedidos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix: recreate SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all orders" ON public.pedidos;

CREATE POLICY "Admins can view all orders"
ON public.pedidos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
