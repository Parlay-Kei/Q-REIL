-- Migration: 00002_create_users
-- Description: Create users table - user accounts within organizations
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00001_create_orgs.sql

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_org_email UNIQUE(org_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status) WHERE status = 'active';

-- Add comments
COMMENT ON TABLE public.users IS 'User accounts within organizations';
COMMENT ON COLUMN public.users.id IS 'References auth.users(id) - synced via trigger on signup';
COMMENT ON COLUMN public.users.status IS 'User status: active, inactive, suspended';

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.users CASCADE;
