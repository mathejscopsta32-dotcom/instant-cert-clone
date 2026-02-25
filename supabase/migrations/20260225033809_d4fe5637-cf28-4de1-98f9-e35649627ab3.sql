
-- Remove the permissive SELECT policy we just re-added
DROP POLICY IF EXISTS "Anyone can view order by id" ON public.pedidos;

-- Recreate view as security definer (intentional - view limits columns, base table is locked)
DROP VIEW IF EXISTS public.pedidos_public;

CREATE VIEW public.pedidos_public
WITH (security_invoker = off) AS
SELECT id, nome_completo, valor_total, status, created_at
FROM public.pedidos;

GRANT SELECT ON public.pedidos_public TO anon, authenticated;
