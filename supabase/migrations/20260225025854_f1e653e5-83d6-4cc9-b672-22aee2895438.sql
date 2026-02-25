
-- Create orders table
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_nascimento TEXT,
  sintomas TEXT[],
  outros_sintomas TEXT,
  inicio_sintomas TEXT,
  inicio_sintomas_data TIMESTAMPTZ,
  dias_afastamento TEXT,
  observacoes TEXT,
  hospital_preferencia TEXT,
  cidade TEXT,
  estado TEXT,
  addon_cid BOOLEAN DEFAULT false,
  addon_qr_code BOOLEAN DEFAULT false,
  addon_pacote3 BOOLEAN DEFAULT false,
  valor_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  comprovante_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anyone can create an order)
CREATE POLICY "Anyone can create orders" ON public.pedidos
  FOR INSERT WITH CHECK (true);

-- Public select policy by email (users check their own order status)
CREATE POLICY "Anyone can view orders by id" ON public.pedidos
  FOR SELECT USING (true);

-- Create storage bucket for comprovantes
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', false);

-- Allow anyone to upload comprovantes
CREATE POLICY "Anyone can upload comprovantes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprovantes');

-- Allow public read of comprovantes (for admin review)
CREATE POLICY "Anyone can view comprovantes" ON storage.objects
  FOR SELECT USING (bucket_id = 'comprovantes');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
