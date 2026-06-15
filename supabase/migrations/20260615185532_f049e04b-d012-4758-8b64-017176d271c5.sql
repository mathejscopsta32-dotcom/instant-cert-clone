ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS medico_nome text,
  ADD COLUMN IF NOT EXISTS medico_crm text,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS hospital_endereco text,
  ADD COLUMN IF NOT EXISTS data_emissao timestamptz,
  ADD COLUMN IF NOT EXISTS data_inicio_atestado timestamptz,
  ADD COLUMN IF NOT EXISTS cid_code text,
  ADD COLUMN IF NOT EXISTS cid_description text;

CREATE OR REPLACE FUNCTION public.get_pedido_validacao(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'nome_completo', nome_completo,
    'cpf', cpf,
    'data_nascimento', data_nascimento,
    'cidade', cidade,
    'estado', estado,
    'endereco', endereco,
    'hospital_preferencia', hospital_preferencia,
    'hospital_endereco', hospital_endereco,
    'dias_afastamento', dias_afastamento,
    'inicio_sintomas_data', inicio_sintomas_data,
    'data_emissao', data_emissao,
    'data_inicio_atestado', data_inicio_atestado,
    'medico_nome', medico_nome,
    'medico_crm', medico_crm,
    'cid_code', cid_code,
    'cid_description', cid_description,
    'addon_cid', addon_cid,
    'status', status,
    'created_at', created_at
  )
  INTO v
  FROM public.pedidos
  WHERE id = p_id;
  RETURN v;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pedido_validacao(uuid) TO anon, authenticated;

UPDATE public.pedidos
SET pdf_url = NULL
WHERE lower(nome_completo) LIKE '%eduardo%silva%sanches%';