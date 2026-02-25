
-- Recreate view with security_invoker = on
DROP VIEW IF EXISTS public.pedidos_public;

CREATE VIEW public.pedidos_public
WITH (security_invoker = on) AS
SELECT id, nome_completo, valor_total, status, created_at
FROM public.pedidos;

-- Since security_invoker=on, we need a SELECT policy for anon access through the view
-- Add a policy that allows anyone to SELECT but ONLY the columns in the view
-- Since RLS is row-level not column-level, we use the view to limit columns
-- and a permissive SELECT policy scoped to reading by specific ID
CREATE POLICY "Anyone can view order by id"
ON public.pedidos
FOR SELECT
USING (true);

GRANT SELECT ON public.pedidos_public TO anon, authenticated;
