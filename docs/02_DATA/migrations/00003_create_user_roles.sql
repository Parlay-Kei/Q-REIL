-- Migration: 00003_create_user_roles
-- Description: Create user_roles table - role assignments within organizations
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  scope TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON public.user_roles(org_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_deleted_at ON public.user_roles(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE public.user_roles IS 'Role assignments for users within organizations';
COMMENT ON COLUMN public.user_roles.role IS 'Role name: admin, member, viewer, etc.';
COMMENT ON COLUMN public.user_roles.scope IS 'Scope of the role: org, team, self';

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.user_roles CASCADE;
