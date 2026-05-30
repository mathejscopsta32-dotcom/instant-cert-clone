
-- 1) pedidos_public view: switch to SECURITY INVOKER so RLS of caller applies
ALTER VIEW public.pedidos_public SET (security_invoker = true);

-- 2) user_roles: add explicit admin-only INSERT/UPDATE/DELETE policies (prevent privilege escalation)
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) comprovantes bucket: legacy manual-receipt flow no longer used (PIX-only).
--    Restrict reads and writes to admins.
DROP POLICY IF EXISTS "Anyone can upload comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view comprovantes" ON storage.objects;
CREATE POLICY "Admins view comprovantes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'comprovantes' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins upload comprovantes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comprovantes' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 4) atestados bucket: keep anon uploads (anonymous customer flow after PIX)
--    but enforce PDF-only and 5MB size limit at policy level.
DROP POLICY IF EXISTS "Anyone can upload atestados" ON storage.objects;
CREATE POLICY "Anyone can upload atestados pdf" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'atestados'
    AND lower(right(name, 4)) = '.pdf'
    AND coalesce((metadata->>'size')::bigint, 0) < 5242880
  );

-- 5) comprovante_hashes: legacy table; restrict inserts to admins.
--    Edge functions use the service_role key which bypasses RLS, so they keep working.
DROP POLICY IF EXISTS "Anyone can insert hashes" ON public.comprovante_hashes;
CREATE POLICY "Admins can insert hashes" ON public.comprovante_hashes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6) submit_comprovante is part of the deprecated manual-receipt flow.
--    Revoke direct EXECUTE; only service_role (edge functions / admin code) can call it.
REVOKE EXECUTE ON FUNCTION public.submit_comprovante(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_comprovante(uuid, text) FROM anon, authenticated;
