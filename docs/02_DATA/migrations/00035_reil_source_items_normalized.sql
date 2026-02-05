-- Migration: 00035_reil_source_items_normalized
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Normalized ingestion table - upsert by idempotency key
-- Dependencies: 00001_create_orgs.sql

CREATE TABLE IF NOT EXISTS public.source_items_normalized (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  normalized_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_source_items_normalized_org_id ON public.source_items_normalized(org_id);
CREATE INDEX IF NOT EXISTS idx_source_items_normalized_source_type ON public.source_items_normalized(source_type);
CREATE INDEX IF NOT EXISTS idx_source_items_normalized_normalized_type ON public.source_items_normalized(normalized_type);

DROP TRIGGER IF EXISTS update_source_items_normalized_updated_at ON public.source_items_normalized;
CREATE TRIGGER update_source_items_normalized_updated_at
  BEFORE UPDATE ON public.source_items_normalized
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.source_items_normalized IS 'REIL Core: normalized connector data; upsert by (org_id, idempotency_key)';
