-- Migration: 00032_mail_upsert_service_role
-- Description: Allow service role to UPDATE mail_messages and mail_attachments for idempotent upserts (BE-301)
-- Author: backend-dev
-- Date: 2026-01-30

-- mail_messages: upsert requires UPDATE (on conflict)
DROP POLICY IF EXISTS "mail_messages_update_service" ON mail_messages;
CREATE POLICY "mail_messages_update_service" ON mail_messages
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- mail_attachments: upsert requires UPDATE (on conflict)
DROP POLICY IF EXISTS "mail_attachments_update_service" ON mail_attachments;
CREATE POLICY "mail_attachments_update_service" ON mail_attachments
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
