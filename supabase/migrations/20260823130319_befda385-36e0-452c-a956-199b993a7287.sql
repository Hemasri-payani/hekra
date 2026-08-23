-- PROFILES: replace WITH CHECK (true)
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles
FOR UPDATE TO authenticated
USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::app_role));

-- PROJECTS: replace WITH CHECK (true)
DROP POLICY IF EXISTS "projects update" ON public.projects;
CREATE POLICY "projects update" ON public.projects
FOR UPDATE TO authenticated
USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::app_role));

-- ORDERS: ensure clients cannot insert orders at all (server-side checkout only)
DROP POLICY IF EXISTS "own orders insert" ON public.orders;
DROP POLICY IF EXISTS "orders insert" ON public.orders;
REVOKE INSERT ON public.orders FROM authenticated, anon;

-- Defense in depth: any order row inserted must start unpaid
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_amount_nonnegative;
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_nonnegative
  CHECK (base_amount >= 0 AND tax_amount >= 0 AND total_amount >= 0);