REVOKE EXECUTE ON FUNCTION public.check_pix_rate_limit(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_pix_rate_limit(text, int) TO service_role;