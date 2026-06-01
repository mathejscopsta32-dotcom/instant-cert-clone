
ALTER TABLE public.pix_attempts
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS nome text;

CREATE INDEX IF NOT EXISTS idx_pix_attempts_cpf_created ON public.pix_attempts (cpf, created_at);
CREATE INDEX IF NOT EXISTS idx_pix_attempts_nome_created ON public.pix_attempts (lower(nome), created_at);

CREATE OR REPLACE FUNCTION public.check_cpf_nome_rate_limit(p_cpf text, p_nome text, p_limit integer DEFAULT 2)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_cpf_digits text;
  v_nome_norm text;
  v_count int;
BEGIN
  v_cpf_digits := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  v_nome_norm := lower(trim(coalesce(p_nome, '')));

  IF v_cpf_digits = '' AND v_nome_norm = '' THEN
    RETURN jsonb_build_object('allowed', true, 'count', 0);
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.pix_attempts
  WHERE created_at > now() - interval '24 hours'
    AND (
      (v_cpf_digits <> '' AND regexp_replace(coalesce(cpf, ''), '\D', '', 'g') = v_cpf_digits)
      OR
      (v_nome_norm <> '' AND lower(trim(coalesce(nome, ''))) = v_nome_norm)
    );

  IF v_count >= p_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'cpf_nome_rate_limit', 'count', v_count);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'count', v_count);
END;
$$;

REVOKE ALL ON FUNCTION public.check_cpf_nome_rate_limit(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_cpf_nome_rate_limit(text, text, integer) TO service_role;
