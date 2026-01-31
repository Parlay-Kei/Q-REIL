-- Migration: 00018_create_event_triggers
-- Description: Create triggers to enforce events table immutability
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: 00017_create_events.sql

-- ============================================
-- UP MIGRATION
-- ============================================

-- Function to prevent UPDATE and DELETE on events table
CREATE OR REPLACE FUNCTION prevent_events_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Events table is append-only. UPDATE and DELETE operations are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_events_mutation IS 'Prevents UPDATE and DELETE on events table to maintain immutability';

-- Trigger to prevent UPDATE
DROP TRIGGER IF EXISTS prevent_events_update ON public.events;
CREATE TRIGGER prevent_events_update
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION prevent_events_mutation();

-- Trigger to prevent DELETE
DROP TRIGGER IF EXISTS prevent_events_delete ON public.events;
CREATE TRIGGER prevent_events_delete
  BEFORE DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION prevent_events_mutation();

-- Alternative: Use PostgreSQL rules (more restrictive)
-- CREATE RULE events_no_update AS ON UPDATE TO public.events DO INSTEAD NOTHING;
-- CREATE RULE events_no_delete AS ON DELETE TO public.events DO INSTEAD NOTHING;

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS prevent_events_update ON public.events;
-- DROP TRIGGER IF EXISTS prevent_events_delete ON public.events;
-- DROP FUNCTION IF EXISTS prevent_events_mutation();
