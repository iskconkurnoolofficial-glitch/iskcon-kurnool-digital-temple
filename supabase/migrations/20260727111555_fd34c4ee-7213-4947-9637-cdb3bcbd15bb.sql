CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 200
    AND length(btrim(phone)) BETWEEN 5 AND 20
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.donation_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pan text,
  purpose text,
  seva_title text NOT NULL,
  option_label text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'initiated',
  payment_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.donation_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_enquiries TO authenticated;
GRANT ALL ON public.donation_enquiries TO service_role;

ALTER TABLE public.donation_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a donation enquiry"
  ON public.donation_enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(donor_name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 200
    AND length(btrim(phone)) BETWEEN 5 AND 20
    AND length(btrim(seva_title)) BETWEEN 1 AND 200
    AND amount >= 0
    AND status IN ('initiated','paid','failed')
  );

CREATE POLICY "Admins can read donation enquiries"
  ON public.donation_enquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update donation enquiries"
  ON public.donation_enquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete donation enquiries"
  ON public.donation_enquiries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));