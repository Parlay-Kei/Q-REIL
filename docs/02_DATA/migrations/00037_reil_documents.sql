-- Migration: 00037_reil_documents
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Document metadata and storage references
-- Dependencies: 00001_create_orgs.sql, 00002_create_users.sql

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  document_type TEXT,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'documents',
  mime_type TEXT,
  file_size INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_org_id ON public.documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by_user_id ON public.documents(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN(tags);

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.documents IS 'REIL Core: document metadata; link to records via record_links';
