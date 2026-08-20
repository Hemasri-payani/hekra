-- 1. Orders are created server-side only (service role bypasses RLS)
DROP POLICY IF EXISTS "own orders insert" ON public.orders;
REVOKE INSERT ON public.orders FROM authenticated;

-- 2. Protect admin-controlled profile flags
CREATE OR REPLACE FUNCTION public.protect_profile_flags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.phone_verified := OLD.phone_verified;
  NEW.is_active := OLD.is_active;
  NEW.id := OLD.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_flags ON public.profiles;
CREATE TRIGGER protect_profile_flags
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_flags();

-- 3. Protect admin-only project fields
CREATE OR REPLACE FUNCTION public.protect_project_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.admin_notes := OLD.admin_notes;
  NEW.progress := OLD.progress;
  NEW.user_id := OLD.user_id;
  NEW.package_id := OLD.package_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_project_admin_fields ON public.projects;
CREATE TRIGGER protect_project_admin_fields
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.protect_project_admin_fields();