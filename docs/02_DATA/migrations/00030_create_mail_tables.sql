-- Migration: 00030_create_mail_tables
-- Description: Gmail inbox integration tables for REIL/Q Sprint 0.2
-- Author: supabase-admin
-- Date: 2025-12-31

-- ============================================================================
-- MAILBOXES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mailboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Provider info
  provider TEXT NOT NULL DEFAULT 'gmail' CHECK (provider IN ('gmail', 'microsoft')),
  provider_email TEXT NOT NULL,
  provider_subject_id TEXT, -- Google sub claim / Azure oid

  -- OAuth tokens (encrypted at rest)
  oauth_scopes TEXT[],
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync state
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
  last_history_id TEXT, -- Gmail historyId cursor for incremental sync
  last_synced_at TIMESTAMPTZ,
  sync_error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(org_id, provider_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mailboxes_org_id ON mailboxes(org_id);
CREATE INDEX IF NOT EXISTS idx_mailboxes_user_id ON mailboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_mailboxes_status ON mailboxes(status);

-- ============================================================================
-- MAIL_THREADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mail_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,

  -- Gmail identifiers
  provider_thread_id TEXT NOT NULL,

  -- Thread metadata
  subject TEXT,
  snippet TEXT,
  participant_emails TEXT[],
  message_count INT DEFAULT 0,
  has_attachments BOOLEAN DEFAULT false,

  -- Timestamps
  last_message_at TIMESTAMPTZ,
  first_message_at TIMESTAMPTZ,

  -- State
  is_read BOOLEAN DEFAULT true,
  needs_routing BOOLEAN DEFAULT false, -- flagged when auto-attach ambiguous
  label_ids TEXT[],

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(mailbox_id, provider_thread_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mail_threads_org_id ON mail_threads(org_id);
CREATE INDEX IF NOT EXISTS idx_mail_threads_mailbox_id ON mail_threads(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_mail_threads_last_message_at ON mail_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_threads_needs_routing ON mail_threads(org_id, needs_routing) WHERE needs_routing = true;
CREATE INDEX IF NOT EXISTS idx_mail_threads_participant_emails ON mail_threads USING GIN(participant_emails);

-- ============================================================================
-- MAIL_MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mail_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES mail_threads(id) ON DELETE CASCADE,

  -- Gmail identifiers
  provider_message_id TEXT NOT NULL,

  -- Sender/recipients
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[],
  cc_emails TEXT[],
  bcc_emails TEXT[],

  -- Content
  subject TEXT,
  snippet TEXT,
  body_plain TEXT, -- full body, stored but not logged
  body_html TEXT,  -- full body, stored but not logged

  -- Metadata
  sent_at TIMESTAMPTZ,
  internal_date BIGINT, -- Gmail internal timestamp (epoch ms)
  raw_headers JSONB,
  label_ids TEXT[],
  has_attachments BOOLEAN DEFAULT false,
  size_estimate INT,

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(mailbox_id, provider_message_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mail_messages_org_id ON mail_messages(org_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_mailbox_id ON mail_messages(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_thread_id ON mail_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_mail_messages_sent_at ON mail_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_messages_from_email ON mail_messages(from_email);
CREATE INDEX IF NOT EXISTS idx_mail_messages_to_emails ON mail_messages USING GIN(to_emails);

-- ============================================================================
-- MAIL_ATTACHMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mail_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,

  -- Gmail identifiers
  provider_attachment_id TEXT NOT NULL,

  -- File info
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,

  -- Storage
  storage_path TEXT, -- Supabase storage bucket path
  sha256 TEXT, -- content hash for deduplication

  -- System timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(message_id, provider_attachment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mail_attachments_org_id ON mail_attachments(org_id);
CREATE INDEX IF NOT EXISTS idx_mail_attachments_message_id ON mail_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_mail_attachments_sha256 ON mail_attachments(sha256);

-- ============================================================================
-- RECORD_LINKS TABLE (polymorphic linking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS record_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,

  -- Source (what is being linked)
  source_type TEXT NOT NULL CHECK (source_type IN ('message', 'thread', 'attachment', 'document')),
  source_id UUID NOT NULL,

  -- Target (what it's linked to)
  target_type TEXT NOT NULL CHECK (target_type IN ('contact', 'company', 'deal', 'property', 'unit', 'leasing')),
  target_id UUID NOT NULL,

  -- Linking metadata
  confidence INT DEFAULT 100 CHECK (confidence BETWEEN 0 AND 100),
  link_method TEXT NOT NULL CHECK (link_method IN ('rule', 'manual', 'system')),
  rule_name TEXT, -- which rule matched (for debugging)

  -- Actor
  linked_by UUID REFERENCES users(id), -- NULL for system/rule
  linked_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(source_type, source_id, target_type, target_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_record_links_org_id ON record_links(org_id);
CREATE INDEX IF NOT EXISTS idx_record_links_source ON record_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_record_links_target ON record_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_record_links_link_method ON record_links(link_method);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mailboxes_updated_at ON mailboxes;
CREATE TRIGGER update_mailboxes_updated_at
  BEFORE UPDATE ON mailboxes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mail_threads_updated_at ON mail_threads;
CREATE TRIGGER update_mail_threads_updated_at
  BEFORE UPDATE ON mail_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DOWN MIGRATION (for rollback)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS update_mail_threads_updated_at ON mail_threads;
DROP TRIGGER IF EXISTS update_mailboxes_updated_at ON mailboxes;
DROP TABLE IF EXISTS record_links;
DROP TABLE IF EXISTS mail_attachments;
DROP TABLE IF EXISTS mail_messages;
DROP TABLE IF EXISTS mail_threads;
DROP TABLE IF EXISTS mailboxes;
*/
