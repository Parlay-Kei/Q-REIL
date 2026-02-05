-- Migration: 00038_reil_ledger_events
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Append-only ledger events (canonical name for audit trail)
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql

CREATE TABLE IF NOT EXISTS public.ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type TEXT DEFAULT 'user',
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB DEFAULT '{}',
  correlation_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_events_org_id ON public.ledger_events(org_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_entity_type_id ON public.ledger_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_events_event_type ON public.ledger_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_events_created_at ON public.ledger_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_events_correlation_id ON public.ledger_events(correlation_id);

COMMENT ON TABLE public.ledger_events IS 'REIL Core: append-only audit ledger; no UPDATE/DELETE';

CREATE OR REPLACE FUNCTION prevent_ledger_events_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'ledger_events is append-only. UPDATE and DELETE are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_ledger_events_update ON public.ledger_events;
CREATE TRIGGER prevent_ledger_events_update
  BEFORE UPDATE ON public.ledger_events
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_events_mutation();

DROP TRIGGER IF EXISTS prevent_ledger_events_delete ON public.ledger_events;
CREATE TRIGGER prevent_ledger_events_delete
  BEFORE DELETE ON public.ledger_events
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_events_mutation();
