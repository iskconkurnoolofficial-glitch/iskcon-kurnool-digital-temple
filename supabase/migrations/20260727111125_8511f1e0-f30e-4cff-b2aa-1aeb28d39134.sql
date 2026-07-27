CREATE TABLE public.preview_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.preview_leads TO anon;
GRANT INSERT, SELECT, DELETE ON public.preview_leads TO authenticated;
GRANT ALL ON public.preview_leads TO service_role;

ALTER TABLE public.preview_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a preview lead"
  ON public.preview_leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(phone)) BETWEEN 6 AND 20
  );

CREATE POLICY "Admins can read preview leads"
  ON public.preview_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete preview leads"
  ON public.preview_leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));