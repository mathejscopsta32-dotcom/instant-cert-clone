
CREATE OR REPLACE FUNCTION public.upsert_pedido(
  p_cpf text,
  p_tipo text,
  p_nome_completo text,
  p_email text,
  p_telefone text,
  p_data_nascimento text DEFAULT NULL,
  p_cidade text DEFAULT NULL,
  p_estado text DEFAULT NULL,
  p_valor_total numeric DEFAULT 0,
  p_sintomas text[] DEFAULT NULL,
  p_outros_sintomas text DEFAULT NULL,
  p_inicio_sintomas text DEFAULT NULL,
  p_inicio_sintomas_data timestamptz DEFAULT NULL,
  p_dias_afastamento text DEFAULT NULL,
  p_observacoes text DEFAULT NULL,
  p_hospital_preferencia text DEFAULT NULL,
  p_addon_cid boolean DEFAULT false,
  p_addon_qr_code boolean DEFAULT false,
  p_addon_pacote3 boolean DEFAULT false,
  p_pdf_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Check for existing pending order with same CPF and tipo
  SELECT id INTO v_id
  FROM public.pedidos
  WHERE cpf = p_cpf
    AND tipo = p_tipo
    AND status = 'pendente'
    AND comprovante_url IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    -- Update existing order
    UPDATE public.pedidos SET
      nome_completo = p_nome_completo,
      email = p_email,
      telefone = p_telefone,
      data_nascimento = p_data_nascimento,
      cidade = p_cidade,
      estado = p_estado,
      valor_total = p_valor_total,
      sintomas = p_sintomas,
      outros_sintomas = p_outros_sintomas,
      inicio_sintomas = p_inicio_sintomas,
      inicio_sintomas_data = p_inicio_sintomas_data,
      dias_afastamento = p_dias_afastamento,
      observacoes = p_observacoes,
      hospital_preferencia = p_hospital_preferencia,
      addon_cid = p_addon_cid,
      addon_qr_code = p_addon_qr_code,
      addon_pacote3 = p_addon_pacote3,
      pdf_url = COALESCE(p_pdf_url, pdf_url),
      updated_at = now()
    WHERE id = v_id;
  ELSE
    -- Create new order
    v_id := gen_random_uuid();
    INSERT INTO public.pedidos (
      id, cpf, tipo, nome_completo, email, telefone, data_nascimento,
      cidade, estado, valor_total, sintomas, outros_sintomas,
      inicio_sintomas, inicio_sintomas_data, dias_afastamento, observacoes,
      hospital_preferencia, addon_cid, addon_qr_code, addon_pacote3,
      pdf_url, status
    ) VALUES (
      v_id, p_cpf, p_tipo, p_nome_completo, p_email, p_telefone, p_data_nascimento,
      p_cidade, p_estado, p_valor_total, p_sintomas, p_outros_sintomas,
      p_inicio_sintomas, p_inicio_sintomas_data, p_dias_afastamento, p_observacoes,
      p_hospital_preferencia, p_addon_cid, p_addon_qr_code, p_addon_pacote3,
      p_pdf_url, 'pendente'
    );
  END IF;

  RETURN v_id;
END;
$$;
