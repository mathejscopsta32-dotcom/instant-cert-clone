
CREATE TABLE public.medicos_por_estado (
  uf char(2) PRIMARY KEY,
  nome text NOT NULL,
  crm text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.medicos_por_estado TO anon;
GRANT SELECT ON public.medicos_por_estado TO authenticated;
GRANT ALL ON public.medicos_por_estado TO service_role;

ALTER TABLE public.medicos_por_estado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read medicos"
  ON public.medicos_por_estado
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage medicos"
  ON public.medicos_por_estado
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.medicos_por_estado (uf, nome, crm) VALUES
  ('AC', 'Dr. Lucas Almeida Rocha',          'CRM/AC 2.184'),
  ('AL', 'Dra. Camila Tavares Lima',          'CRM/AL 8.327'),
  ('AP', 'Dr. Henrique Barbosa Cunha',        'CRM/AP 1.642'),
  ('AM', 'Dra. Patrícia Nogueira Silva',      'CRM/AM 12.495'),
  ('BA', 'Dr. Ricardo Andrade Souza',         'CRM/BA 28.731'),
  ('CE', 'Dra. Mariana Vasconcelos Pinto',    'CRM/CE 19.058'),
  ('DF', 'Dr. Eduardo Marques Ferreira',      'CRM/DF 22.416'),
  ('ES', 'Dra. Larissa Carvalho Monteiro',    'CRM/ES 10.873'),
  ('GO', 'Dr. Bruno Henrique Oliveira',       'CRM/GO 21.654'),
  ('MA', 'Dra. Beatriz Soares Ribeiro',       'CRM/MA 9.342'),
  ('MT', 'Dr. Felipe Augusto Martins',        'CRM/MT 11.207'),
  ('MS', 'Dra. Renata Figueiredo Alves',      'CRM/MS 8.964'),
  ('MG', 'Dr. Roberto Mendes Silva',          'CRM/MG 165.291'),
  ('PA', 'Dra. Aline Cordeiro Maia',          'CRM/PA 14.738'),
  ('PB', 'Dr. Gustavo Lemos Cavalcanti',      'CRM/PB 9.815'),
  ('PR', 'Dra. Fernanda Schmidt Bianchi',     'CRM/PR 38.472'),
  ('PE', 'Dr. André Luiz Pereira',            'CRM/PE 27.183'),
  ('PI', 'Dra. Juliana Moreira Castro',       'CRM/PI 7.546'),
  ('RJ', 'Dra. Ana Beatriz de Souza',         'CRM/RJ 198.432'),
  ('RN', 'Dr. Thiago Bezerra Câmara',         'CRM/RN 10.291'),
  ('RS', 'Dra. Carolina Hoffmann Becker',     'CRM/RS 41.358'),
  ('RO', 'Dr. Marcelo Antunes Borges',        'CRM/RO 5.624'),
  ('RR', 'Dra. Vanessa Lopes Teixeira',       'CRM/RR 2.917'),
  ('SC', 'Dr. Eduardo Klein Werner',          'CRM/SC 22.749'),
  ('SP', 'Dr. Rodrigo V. Vasconcelos',        'CRM/SP 158.743'),
  ('SE', 'Dra. Priscila Andrade Nascimento',  'CRM/SE 6.832'),
  ('TO', 'Dr. Leonardo Freitas Aragão',       'CRM/TO 4.158');
