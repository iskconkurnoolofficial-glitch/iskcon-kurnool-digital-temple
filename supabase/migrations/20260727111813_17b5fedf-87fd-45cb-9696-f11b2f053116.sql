CREATE POLICY "Donor can finalize their fresh enquiry"
  ON public.donation_enquiries FOR UPDATE TO anon, authenticated
  USING (status = 'initiated' AND created_at > now() - interval '2 hours')
  WITH CHECK (status IN ('paid','failed'));

GRANT UPDATE ON public.donation_enquiries TO anon;