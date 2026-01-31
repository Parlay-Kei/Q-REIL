-- Migration: 00004_create_helper_functions
-- Description: Create RLS helper functions in public schema (secure, hardened)
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00002_create_users.sql, 00003_create_user_roles.sql
--
-- Best practice: In RLS policies, wrap auth.uid() in SELECT when calling helpers
--   e.g. (SELECT public.user_org_id()) to avoid repeated evaluation.

-- ============================================
-- UP MIGRATION
-- ============================================

-- Function: Get current user's org_id
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.user_org_id IS 'Returns the org_id for the current authenticated user (for RLS)';

REVOKE EXECUTE ON FUNCTION public.user_org_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_org_id() TO authenticated;

-- Function: Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
      AND deleted_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.has_role IS 'Check if current user has a specific role (for RLS)';

REVOKE EXECUTE ON FUNCTION public.has_role(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated;

-- Function: Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY(required_roles)
      AND deleted_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.has_any_role IS 'Check if current user has any of the specified roles (for RLS)';

REVOKE EXECUTE ON FUNCTION public.has_any_role(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(TEXT[]) TO authenticated;

-- Function: Get user's role scope
CREATE OR REPLACE FUNCTION public.user_role_scope(user_role TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT scope FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role = user_role
    AND deleted_at IS NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.user_role_scope IS 'Get scope (org/team/self) for user role (for RLS)';

REVOKE EXECUTE ON FUNCTION public.user_role_scope(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_role_scope(TEXT) TO authenticated;

-- ============================================
-- Performance indexes for RLS lookups
-- (00002/00003 may already create some; IF NOT EXISTS keeps idempotent)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_deleted_at ON public.user_roles(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- REVOKE EXECUTE ON FUNCTION public.user_org_id() FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION public.has_role(TEXT) FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION public.has_any_role(TEXT[]) FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION public.user_role_scope(TEXT) FROM authenticated;
-- DROP FUNCTION IF EXISTS public.user_org_id();
-- DROP FUNCTION IF EXISTS public.has_role(TEXT);
-- DROP FUNCTION IF EXISTS public.has_any_role(TEXT[]);
-- DROP FUNCTION IF EXISTS public.user_role_scope(TEXT);
-- (Indexes created above are redundant with 00002/00003; leave them or drop if desired)
