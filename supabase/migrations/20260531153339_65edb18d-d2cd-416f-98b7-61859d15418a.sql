-- Blocked IPs table
CREATE TABLE public.blocked_ips (
  ip text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_ips TO authenticated;
GRANT ALL ON public.blocked_ips TO service_role;

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage blocked_ips" ON public.blocked_ips
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- PIX attempts table for per-IP daily rate limiting
CREATE TABLE public.pix_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  pedido_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pix_attempts_ip_created ON public.pix_attempts (ip, created_at DESC);

GRANT SELECT, DELETE ON public.pix_attempts TO authenticated;
GRANT ALL ON public.pix_attempts TO service_role;

ALTER TABLE public.pix_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read pix_attempts" ON public.pix_attempts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete pix_attempts" ON public.pix_attempts
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Rate limit check function (called from edge function via service role)
CREATE OR REPLACE FUNCTION public.check_pix_rate_limit(p_ip text, p_limit int DEFAULT 2)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
  v_count int;
BEGIN
  IF p_ip IS NULL OR p_ip = '' THEN
    RETURN jsonb_build_object('allowed', true, 'count', 0);
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.blocked_ips WHERE ip = p_ip) INTO v_blocked;
  IF v_blocked THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'blocked');
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.pix_attempts
  WHERE ip = p_ip AND created_at > now() - interval '24 hours';

  IF v_count >= p_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'rate_limit', 'count', v_count);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'count', v_count);
END;
$$;