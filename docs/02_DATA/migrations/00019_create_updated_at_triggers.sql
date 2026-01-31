-- Migration: 00019_create_updated_at_triggers
-- Description: Create triggers to auto-update updated_at column on all tables
-- Author: SupabaseArchitect
-- Date: 2025-12-31
-- Dependencies: All table creation migrations

-- ============================================
-- UP MIGRATION
-- ============================================

-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Auto-updates updated_at column on UPDATE';

-- Apply trigger to all tables (except events which has no updated_at)

-- Organization layer
DROP TRIGGER IF EXISTS update_orgs_updated_at ON public.orgs;
CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact layer
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_relationships_updated_at ON public.contact_relationships;
CREATE TRIGGER update_contact_relationships_updated_at
  BEFORE UPDATE ON public.contact_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Property layer
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_units_updated_at ON public.units;
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Transaction layer
DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leasing_updated_at ON public.leasing;
CREATE TRIGGER update_leasing_updated_at
  BEFORE UPDATE ON public.leasing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deal_parties_updated_at ON public.deal_parties;
CREATE TRIGGER update_deal_parties_updated_at
  BEFORE UPDATE ON public.deal_parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Document layer
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_versions_updated_at ON public.document_versions;
CREATE TRIGGER update_document_versions_updated_at
  BEFORE UPDATE ON public.document_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Communication layer
DROP TRIGGER IF EXISTS update_message_threads_updated_at ON public.message_threads;
CREATE TRIGGER update_message_threads_updated_at
  BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: events table does NOT have updated_at column (append-only)

-- ============================================
-- DOWN MIGRATION (for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS update_orgs_updated_at ON public.orgs;
-- DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
-- ... (drop all triggers)
-- DROP FUNCTION IF EXISTS update_updated_at_column();
