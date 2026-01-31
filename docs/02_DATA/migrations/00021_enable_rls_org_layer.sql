-- Migration: 00021_enable_rls_org_layer
-- Description: Enable Row Level Security policies for organization layer (orgs, users, user_roles)
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql, 00003_create_user_roles.sql, 00004_create_helper_functions.sql

-- ============================================
-- UP MIGRATION
-- ============================================

-- ============================================
-- 1. ORGS TABLE
-- ============================================

ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own org" ON public.orgs;
DROP POLICY IF EXISTS "Admins can update own org" ON public.orgs;
DROP POLICY IF EXISTS "Service role bypass" ON public.orgs;

-- Users can view their own org
CREATE POLICY "Users can view own org"
  ON public.orgs FOR SELECT
  USING (id = public.user_org_id());

-- Admins can update their own org
CREATE POLICY "Admins can update own org"
  ON public.orgs FOR UPDATE
  USING (id = public.user_org_id() AND public.has_role('admin'))
  WITH CHECK (id = public.user_org_id() AND public.has_role('admin'));

-- Service role can do anything (backend only)
CREATE POLICY "Service role bypass"
  ON public.orgs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. USERS TABLE
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view org members" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Service role bypass" ON public.users;

-- Users can view users in their org
CREATE POLICY "Users can view org members"
  ON public.users FOR SELECT
  USING (org_id = public.user_org_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    org_id = public.user_org_id() -- Prevent org_id change
  );

-- Admins can insert new users in their org
CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    org_id = public.user_org_id() AND
    public.has_role('admin')
  );

-- Admins can update users in their org
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (org_id = public.user_org_id() AND public.has_role('admin'))
  WITH CHECK (org_id = public.user_org_id() AND public.has_role('admin'));

-- Admins can soft-delete users in their org
CREATE POLICY "Admins can delete users"
  ON public.users FOR UPDATE
  USING (org_id = public.user_org_id() AND public.has_role('admin'))
  WITH CHECK (org_id = public.user_org_id() AND public.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. USER_ROLES TABLE
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view org roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role bypass" ON public.user_roles;

-- Users can view roles in their org
CREATE POLICY "Users can view org roles"
  ON public.user_roles FOR SELECT
  USING (org_id = public.user_org_id());

-- Admins can manage roles in their org
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (org_id = public.user_org_id() AND public.has_role('admin'))
  WITH CHECK (org_id = public.user_org_id() AND public.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.user_roles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
--
-- -- Disable RLS
-- ALTER TABLE public.orgs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
--
-- -- Drop policies
-- DROP POLICY IF EXISTS "Users can view own org" ON public.orgs;
-- DROP POLICY IF EXISTS "Admins can update own org" ON public.orgs;
-- DROP POLICY IF EXISTS "Service role bypass" ON public.orgs;
--
-- DROP POLICY IF EXISTS "Users can view org members" ON public.users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
-- DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
-- DROP POLICY IF EXISTS "Admins can update users" ON public.users;
-- DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
-- DROP POLICY IF EXISTS "Service role bypass" ON public.users;
--
-- DROP POLICY IF EXISTS "Users can view org roles" ON public.user_roles;
-- DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
-- DROP POLICY IF EXISTS "Service role bypass" ON public.user_roles;
