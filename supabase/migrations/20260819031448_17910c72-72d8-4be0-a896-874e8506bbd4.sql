CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- audit_logs
DROP POLICY IF EXISTS "admin audit read" ON public.audit_logs;
CREATE POLICY "admin audit read" ON public.audit_logs FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- orders
DROP POLICY IF EXISTS "admin orders update" ON public.orders;
CREATE POLICY "admin orders update" ON public.orders FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "own orders read" ON public.orders;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- packages
DROP POLICY IF EXISTS "admin manage packages" ON public.packages;
CREATE POLICY "admin manage packages" ON public.packages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "public read active packages" ON public.packages;
CREATE POLICY "public read active packages" ON public.packages FOR SELECT TO anon, authenticated
  USING (is_active OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- payments
DROP POLICY IF EXISTS "own payments read" ON public.payments;
CREATE POLICY "own payments read" ON public.payments FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (true);

-- projects
DROP POLICY IF EXISTS "own projects read" ON public.projects;
CREATE POLICY "own projects read" ON public.projects FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "projects update" ON public.projects;
CREATE POLICY "projects update" ON public.projects FOR UPDATE TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (true);

-- user_roles
DROP POLICY IF EXISTS "roles read own" ON public.user_roles;
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);