
CREATE OR REPLACE FUNCTION public.submit_comprovante(
  p_pedido_id uuid,
  p_comprovante_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.pedidos
  SET comprovante_url = p_comprovante_url,
      status = 'aprovado',
      updated_at = now()
  WHERE id = p_pedido_id;
END;
$$;
