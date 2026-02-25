
-- Table to store hashes of uploaded comprovantes to prevent duplicates
CREATE TABLE public.comprovante_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text NOT NULL UNIQUE,
  pedido_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.comprovante_hashes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (during order creation, no auth)
CREATE POLICY "Anyone can insert hashes"
ON public.comprovante_hashes FOR INSERT
WITH CHECK (true);

-- Only admins can read/delete
CREATE POLICY "Admins can read hashes"
ON public.comprovante_hashes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hashes"
ON public.comprovante_hashes FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
