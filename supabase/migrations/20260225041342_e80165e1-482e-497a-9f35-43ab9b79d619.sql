-- Create settings table for app configuration (like PIX key)
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for PIX key on frontend)
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default PIX key
INSERT INTO public.app_settings (key, value) VALUES ('pix_key', '566a023b-14b4-4306-aed5-a05f4ec92d26');