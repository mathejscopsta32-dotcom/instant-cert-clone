
-- Restrict base table SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view orders by id" ON public.pedidos;

CREATE POLICY "Admins can view all orders"
ON public.pedidos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create a public view with only safe fields
CREATE VIEW public.pedidos_public
WITH (security_invoker = off) AS
SELECT id, nome_completo, valor_total, status, created_at
FROM public.pedidos;

-- Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.pedidos_public TO anon, authenticated;
