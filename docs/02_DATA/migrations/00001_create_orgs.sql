-- Migration: 00001_create_orgs
-- Description: Create orgs (organizations) table - root tenant entity
-- Author: SupabaseArchitect
-- Date: 2025-12-31

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create orgs table
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  max_users INTEGER DEFAULT 5,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON public.orgs(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_deleted_at ON public.orgs(deleted_at) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON TABLE public.orgs IS 'Root tenant entity for multi-tenant isolation';
COMMENT ON COLUMN public.orgs.slug IS 'URL-safe identifier for org (e.g., "acme-realty")';
COMMENT ON COLUMN public.orgs.settings IS 'Org-wide configuration: branding, defaults, feature flags';
COMMENT ON COLUMN public.orgs.subscription_tier IS 'Subscription level: free, pro, enterprise';
COMMENT ON COLUMN public.orgs.max_users IS 'Maximum users allowed for this org based on subscription';

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.orgs CASCADE;
