-- Remove overly-permissive public write policies
DROP POLICY IF EXISTS "Public can insert site data" ON public.site_data;
DROP POLICY IF EXISTS "Public can update site data" ON public.site_data;

-- Keep public read (website needs to render content)
-- (existing "Public can read site data" SELECT policy remains)

-- Only authenticated admins may write
CREATE POLICY "Authenticated can insert site data"
  ON public.site_data FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update site data"
  ON public.site_data FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete site data"
  ON public.site_data FOR DELETE TO authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_data TO authenticated;
GRANT SELECT ON public.site_data TO anon;