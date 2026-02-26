-- Add tipo column to pedidos to distinguish atestado vs consulta
ALTER TABLE public.pedidos ADD COLUMN tipo text NOT NULL DEFAULT 'atestado';

-- Update the public view to include tipo
DROP VIEW IF EXISTS public.pedidos_public;
CREATE VIEW public.pedidos_public AS
  SELECT id, nome_completo, status, valor_total, created_at, tipo
  FROM public.pedidos;