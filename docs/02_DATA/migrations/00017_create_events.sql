-- Migration: 00017_create_events
-- Description: Create events table - immutable append-only audit ledger
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  -- Actor
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type TEXT DEFAULT 'user',

  -- Event classification
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Event data
  payload JSONB NOT NULL DEFAULT '{}',

  -- Correlation
  correlation_id UUID,

  -- Immutable - only created_at (no updated_at)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_org_id ON public.events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_entity_type_id ON public.events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_actor_id ON public.events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_correlation_id ON public.events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_events_payload ON public.events USING GIN(payload);

-- Add comments
COMMENT ON TABLE public.events IS 'Immutable append-only audit trail for all entity changes';
COMMENT ON COLUMN public.events.actor_type IS 'Type of actor: user, system, integration';
COMMENT ON COLUMN public.events.event_type IS 'Event type: created, updated, deleted, status_changed, etc.';
COMMENT ON COLUMN public.events.entity_type IS 'Entity type: deal, contact, property, etc.';
COMMENT ON COLUMN public.events.payload IS 'Event data: before/after state, changes, metadata';
COMMENT ON COLUMN public.events.correlation_id IS 'Group related events (bulk operations, workflows)';

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.events CASCADE;
