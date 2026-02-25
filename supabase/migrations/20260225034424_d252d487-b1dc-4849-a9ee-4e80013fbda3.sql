
-- Fix: recreate INSERT policy as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create orders" ON public.pedidos;

CREATE POLICY "Anyone can create orders"
ON public.pedidos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
