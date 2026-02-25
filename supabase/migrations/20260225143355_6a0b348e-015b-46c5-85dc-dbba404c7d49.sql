
-- Create storage bucket for atestado PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('atestados', 'atestados', false);

-- Allow anyone to upload atestados (order creation flow, no auth required)
CREATE POLICY "Anyone can upload atestados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'atestados');

-- Admins can view/download atestados
CREATE POLICY "Admins can view atestados"
ON storage.objects FOR SELECT
USING (bucket_id = 'atestados' AND public.has_role(auth.uid(), 'admin'));

-- Add pdf_url column to pedidos
ALTER TABLE public.pedidos ADD COLUMN pdf_url text;
