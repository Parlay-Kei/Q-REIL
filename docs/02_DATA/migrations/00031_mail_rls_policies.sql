-- Migration: 00031_mail_rls_policies
-- Description: RLS policies for Gmail inbox tables
-- Author: supabase-admin
-- Date: 2025-12-31

-- ============================================================================
-- ENABLE RLS ON ALL MAIL TABLES
-- ============================================================================

ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MAILBOXES POLICIES
-- Users can only see their own mailboxes within their org
-- Org admins can see all mailboxes in their org
-- ============================================================================

DROP POLICY IF EXISTS "mailboxes_select" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_insert" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_update" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_delete" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_service_role" ON mailboxes;

-- SELECT: Own mailbox or admin
CREATE POLICY "mailboxes_select" ON mailboxes
  FOR SELECT
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      user_id = auth.uid()
      OR public.has_role('admin')
    )
  );

-- INSERT: Users can connect their own mailbox
CREATE POLICY "mailboxes_insert" ON mailboxes
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND user_id = auth.uid()
  );

-- UPDATE: Own mailbox or admin
CREATE POLICY "mailboxes_update" ON mailboxes
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      user_id = auth.uid()
      OR public.has_role('admin')
    )
  );

-- DELETE: Own mailbox or admin
CREATE POLICY "mailboxes_delete" ON mailboxes
  FOR DELETE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      user_id = auth.uid()
      OR public.has_role('admin')
    )
  );

-- Service role bypass
CREATE POLICY "mailboxes_service_role" ON mailboxes
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MAIL_THREADS POLICIES
-- Visible to all org users (shared inbox concept)
-- ============================================================================

DROP POLICY IF EXISTS "mail_threads_select" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_insert_service" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_update" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_delete" ON mail_threads;

-- SELECT: All org users can view threads
CREATE POLICY "mail_threads_select" ON mail_threads
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- INSERT: Service role only (ingestion service)
CREATE POLICY "mail_threads_insert_service" ON mail_threads
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- UPDATE: Service role or admin
CREATE POLICY "mail_threads_update" ON mail_threads
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      auth.role() = 'service_role'
      OR public.has_role('admin')
    )
  );

-- DELETE: Admin only
CREATE POLICY "mail_threads_delete" ON mail_threads
  FOR DELETE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND public.has_role('admin')
  );

-- ============================================================================
-- MAIL_MESSAGES POLICIES
-- Same as threads - visible to org
-- ============================================================================

DROP POLICY IF EXISTS "mail_messages_select" ON mail_messages;
DROP POLICY IF EXISTS "mail_messages_insert_service" ON mail_messages;
DROP POLICY IF EXISTS "mail_messages_update_service" ON mail_messages;
DROP POLICY IF EXISTS "mail_messages_delete_admin" ON mail_messages;

CREATE POLICY "mail_messages_select" ON mail_messages
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "mail_messages_insert_service" ON mail_messages
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "mail_messages_delete_admin" ON mail_messages
  FOR DELETE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND public.has_role('admin')
  );

-- ============================================================================
-- MAIL_ATTACHMENTS POLICIES
-- Same as messages
-- ============================================================================

DROP POLICY IF EXISTS "mail_attachments_select" ON mail_attachments;
DROP POLICY IF EXISTS "mail_attachments_insert_service" ON mail_attachments;
DROP POLICY IF EXISTS "mail_attachments_update_service" ON mail_attachments;
DROP POLICY IF EXISTS "mail_attachments_delete_admin" ON mail_attachments;

CREATE POLICY "mail_attachments_select" ON mail_attachments
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "mail_attachments_insert_service" ON mail_attachments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "mail_attachments_delete_admin" ON mail_attachments
  FOR DELETE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND public.has_role('admin')
  );

-- ============================================================================
-- RECORD_LINKS POLICIES
-- All org users can view; users can create manual links
-- ============================================================================

DROP POLICY IF EXISTS "record_links_select" ON record_links;
DROP POLICY IF EXISTS "record_links_insert" ON record_links;
DROP POLICY IF EXISTS "record_links_update" ON record_links;
DROP POLICY IF EXISTS "record_links_delete" ON record_links;

-- SELECT: All org users
CREATE POLICY "record_links_select" ON record_links
  FOR SELECT
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- INSERT: Any authenticated org user (manual attach) or service role (auto-attach)
CREATE POLICY "record_links_insert" ON record_links
  FOR INSERT
  WITH CHECK (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    OR auth.role() = 'service_role'
  );

-- UPDATE: Only the user who created it or admin
CREATE POLICY "record_links_update" ON record_links
  FOR UPDATE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      linked_by = auth.uid()
      OR public.has_role('admin')
      OR auth.role() = 'service_role'
    )
  );

-- DELETE: Creator, admin, or service role
CREATE POLICY "record_links_delete" ON record_links
  FOR DELETE
  USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    AND (
      linked_by = auth.uid()
      OR public.has_role('admin')
      OR auth.role() = 'service_role'
    )
  );

-- ============================================================================
-- DOWN MIGRATION (for rollback)
-- ============================================================================
/*
DROP POLICY IF EXISTS "mailboxes_select" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_insert" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_update" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_delete" ON mailboxes;
DROP POLICY IF EXISTS "mailboxes_service_role" ON mailboxes;

DROP POLICY IF EXISTS "mail_threads_select" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_insert_service" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_update" ON mail_threads;
DROP POLICY IF EXISTS "mail_threads_delete" ON mail_threads;

DROP POLICY IF EXISTS "mail_messages_select" ON mail_messages;
DROP POLICY IF EXISTS "mail_messages_insert_service" ON mail_messages;
DROP POLICY IF EXISTS "mail_messages_delete_admin" ON mail_messages;

DROP POLICY IF EXISTS "mail_attachments_select" ON mail_attachments;
DROP POLICY IF EXISTS "mail_attachments_insert_service" ON mail_attachments;
DROP POLICY IF EXISTS "mail_attachments_delete_admin" ON mail_attachments;

DROP POLICY IF EXISTS "record_links_select" ON record_links;
DROP POLICY IF EXISTS "record_links_insert" ON record_links;
DROP POLICY IF EXISTS "record_links_update" ON record_links;
DROP POLICY IF EXISTS "record_links_delete" ON record_links;

ALTER TABLE mailboxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE record_links DISABLE ROW LEVEL SECURITY;
*/
