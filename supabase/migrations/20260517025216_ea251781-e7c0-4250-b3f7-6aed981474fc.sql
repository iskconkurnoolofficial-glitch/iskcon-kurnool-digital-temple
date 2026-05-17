
CREATE TABLE public.site_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site data"
  ON public.site_data FOR SELECT
  USING (true);

CREATE POLICY "Public can insert site data"
  ON public.site_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update site data"
  ON public.site_data FOR UPDATE
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_data;
ALTER TABLE public.site_data REPLICA IDENTITY FULL;
