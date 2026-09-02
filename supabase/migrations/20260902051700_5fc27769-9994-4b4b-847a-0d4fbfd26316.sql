CREATE TABLE public.house_programme_requests (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.house_programme_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.house_programme_requests TO authenticated;
GRANT ALL ON public.house_programme_requests TO service_role;
ALTER TABLE public.house_programme_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit house programme requests" ON public.house_programme_requests FOR INSERT TO anon, authenticated WITH CHECK (jsonb_typeof(payload) = 'object');
CREATE POLICY "Admins can read house programme requests" ON public.house_programme_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update house programme requests" ON public.house_programme_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete house programme requests" ON public.house_programme_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.youth_yatra_registrations (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.youth_yatra_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_yatra_registrations TO authenticated;
GRANT ALL ON public.youth_yatra_registrations TO service_role;
ALTER TABLE public.youth_yatra_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit youth yatra registrations" ON public.youth_yatra_registrations FOR INSERT TO anon, authenticated WITH CHECK (jsonb_typeof(payload) = 'object');
CREATE POLICY "Admins can read youth yatra registrations" ON public.youth_yatra_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update youth yatra registrations" ON public.youth_yatra_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete youth yatra registrations" ON public.youth_yatra_registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.bhakti_steps_registrations (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bhakti_steps_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bhakti_steps_registrations TO authenticated;
GRANT ALL ON public.bhakti_steps_registrations TO service_role;
ALTER TABLE public.bhakti_steps_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit Bhakti Steps registrations" ON public.bhakti_steps_registrations FOR INSERT TO anon, authenticated WITH CHECK (jsonb_typeof(payload) = 'object');
CREATE POLICY "Admins can read Bhakti Steps registrations" ON public.bhakti_steps_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update Bhakti Steps registrations" ON public.bhakti_steps_registrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete Bhakti Steps registrations" ON public.bhakti_steps_registrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.payment_records (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT INSERT ON public.payment_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_records TO authenticated;
GRANT ALL ON public.payment_records TO service_role;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit payment records" ON public.payment_records FOR INSERT TO anon, authenticated WITH CHECK (jsonb_typeof(payload) = 'object');
CREATE POLICY "Admins can read payment records" ON public.payment_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update payment records" ON public.payment_records FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete payment records" ON public.payment_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));