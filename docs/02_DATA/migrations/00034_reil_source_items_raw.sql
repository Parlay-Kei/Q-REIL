-- Migration: 00034_reil_source_items_raw
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Raw ingestion table - append-only, idempotency key
-- Dependencies: 00001_create_orgs.sql

CREATE TABLE IF NOT EXISTS public.source_items_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_source_items_raw_org_id ON public.source_items_raw(org_id);
CREATE INDEX IF NOT EXISTS idx_source_items_raw_source_type ON public.source_items_raw(source_type);
CREATE INDEX IF NOT EXISTS idx_source_items_raw_created_at ON public.source_items_raw(created_at DESC);

COMMENT ON TABLE public.source_items_raw IS 'REIL Core: raw connector payloads; append-only; idempotency by (org_id, idempotency_key)';
