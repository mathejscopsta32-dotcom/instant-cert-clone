
-- Allow anyone to update pedido status (admin panel - no auth)
CREATE POLICY "Anyone can update orders" ON public.pedidos
  FOR UPDATE USING (true) WITH CHECK (true);
