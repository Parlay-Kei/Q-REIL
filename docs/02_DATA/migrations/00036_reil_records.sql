-- Migration: 00036_reil_records
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Canonical Record (property or deal container)
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql, 00033_create_record_tables.sql

CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('property', 'deal')),
  record_type_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, record_type, record_type_id)
);

CREATE INDEX IF NOT EXISTS idx_records_org_id ON public.records(org_id);
CREATE INDEX IF NOT EXISTS idx_records_record_type ON public.records(record_type);
CREATE INDEX IF NOT EXISTS idx_records_status ON public.records(status);
CREATE INDEX IF NOT EXISTS idx_records_owner_id ON public.records(owner_id);
CREATE INDEX IF NOT EXISTS idx_records_tags ON public.records USING GIN(tags);

DROP TRIGGER IF EXISTS update_records_updated_at ON public.records;
CREATE TRIGGER update_records_updated_at
  BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.records IS 'REIL Core: canonical record container (property or deal)';
