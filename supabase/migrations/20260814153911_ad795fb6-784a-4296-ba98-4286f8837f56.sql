-- 1) has_role: no longer SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 2) site_data: keep public content public, restrict sensitive keys to admins
DROP POLICY IF EXISTS "Public can read site data" ON public.site_data;

CREATE POLICY "Public can read website content"
ON public.site_data FOR SELECT
TO anon, authenticated
USING (key NOT IN ('team_members', 'super_admin_pass', 'prasadamOrders'));

CREATE POLICY "Admins can read all site data"
ON public.site_data FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) donation_enquiries: remove unrestricted finalize policy
DROP POLICY IF EXISTS "Donor can finalize their fresh enquiry" ON public.donation_enquiries;