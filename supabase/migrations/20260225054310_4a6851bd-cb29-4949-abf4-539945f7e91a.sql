
CREATE POLICY "Admins can delete clicks"
ON public.click_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete orders"
ON public.pedidos
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
