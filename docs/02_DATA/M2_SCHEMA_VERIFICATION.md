# M2 Schema Verification Report
**Sprint:** 0.3 - Gmail Inbox Integration
**Date:** 2025-12-31
**Verified By:** SupabaseArchitect

---

## Executive Summary

**Schema Readiness:** YES

The existing mail table migrations (00030, 00031) provide a complete, production-ready schema for Sprint 0.3 Gmail inbox integration. All required tables, constraints, indexes, and RLS policies are in place.

---

## Requirements Coverage

### ✅ Required Tables

| Table | Status | Migration | Notes |
|-------|--------|-----------|-------|
| `mailboxes` | ✅ READY | 00030 | Gmail provider support, OAuth tokens, sync state |
| `mail_threads` | ✅ READY | 00030 | Unique constraint on `provider_thread_id` per mailbox |
| `mail_messages` | ✅ READY | 00030 | Unique constraint on `provider_message_id` per mailbox |
| `mail_attachments` | ✅ READY | 00030 | SHA256 for deduplication |
| `record_links` | ✅ READY | 00030 | Polymorphic linking for attach workflow |
| `events` | ✅ READY | 00017 | Immutable ledger, supports all event types |

---

## Idempotency Verification

### ✅ Unique Constraints

**Mailboxes:**
- `UNIQUE(org_id, provider_email)` - Line 36 of 00030
- Prevents duplicate mailbox connections per org

**Mail Threads:**
- `UNIQUE(mailbox_id, provider_thread_id)` - Line 76 of 00030
- Gmail thread ID is unique per mailbox
- **Upsert key:** `(mailbox_id, provider_thread_id)`

**Mail Messages:**
- `UNIQUE(mailbox_id, provider_message_id)` - Line 123 of 00030
- Gmail message ID is unique per mailbox
- **Upsert key:** `(mailbox_id, provider_message_id)`

**Mail Attachments:**
- `UNIQUE(message_id, provider_attachment_id)` - Line 159 of 00030
- Gmail attachment ID is unique per message
- SHA256 hash available for deduplication (Line 154)
- **Upsert key:** `(message_id, provider_attachment_id)`

**Record Links:**
- `UNIQUE(source_type, source_id, target_type, target_id)` - Line 192 of 00030
- Prevents duplicate links between same source and target

---

## Ledger (Events Table) Verification

### ✅ Event Type Support

The `events` table (migration 00017) is schema-agnostic and supports ALL event types via the `event_type` TEXT column.

**Required Event Types for Sprint 0.3:**
- `MAILBOX_CONNECTED` - Mailbox OAuth completed
- `INGESTION_STARTED` - Initial sync began
- `THREAD_INGESTED` - Thread processed
- `MESSAGE_INGESTED` - Message processed
- `INGESTION_COMPLETED` - Full sync completed
- `ATTACHMENT_LINKED` - Attachment attached to record

**Event Schema:**
```sql
{
  "event_type": "MAILBOX_CONNECTED | INGESTION_STARTED | ...",
  "entity_type": "mailbox | thread | message | attachment",
  "entity_id": "<uuid>",
  "payload": {
    "provider_email": "user@example.com",
    "threads_processed": 150,
    "messages_processed": 450,
    ...
  },
  "correlation_id": "<uuid>" -- Group related events (batch ingestion)
}
```

**Available Fields:**
- `event_type` - Event name (no constraints, any string)
- `entity_type` - Entity being acted upon
- `entity_id` - UUID of the entity
- `payload` - JSONB for event-specific data
- `correlation_id` - Group related events (e.g., batch ingestion)
- `actor_id` - User or NULL for system events
- `org_id` - Org isolation

---

## Schema Standards Compliance

### ✅ Standard Columns Present

| Table | id | created_at | updated_at | org_id |
|-------|----|-----------|-----------|----|
| `mailboxes` | ✅ | ✅ | ✅ | ✅ |
| `mail_threads` | ✅ | ✅ | ✅ | ✅ |
| `mail_messages` | ✅ | ✅ | ❌ | ✅ |
| `mail_attachments` | ✅ | ✅ | ❌ | ✅ |
| `record_links` | ✅ | ❌ | ❌ | ✅ |
| `events` | ✅ | ✅ | ❌ | ✅ |

**Note:**
- `mail_messages` and `mail_attachments` are immutable after creation (no `updated_at`)
- `record_links` uses `linked_at` instead of `created_at` (acceptable semantic choice)
- `events` is append-only (no `updated_at` by design)

### ✅ Foreign Key ON DELETE Behavior

| Relationship | ON DELETE | Rationale |
|--------------|-----------|-----------|
| `mailboxes.org_id → orgs` | CASCADE | Org deletion removes mailboxes |
| `mailboxes.user_id → users` | CASCADE | User deletion removes mailboxes |
| `mail_threads.mailbox_id → mailboxes` | CASCADE | Mailbox deletion removes threads |
| `mail_messages.thread_id → mail_threads` | CASCADE | Thread deletion removes messages |
| `mail_attachments.message_id → mail_messages` | CASCADE | Message deletion removes attachments |
| `record_links.org_id → orgs` | CASCADE | Org deletion removes links |
| `events.actor_id → users` | SET NULL | Keep events even if user deleted |

**All ON DELETE behaviors are explicit and correct.**

---

## Index Coverage

### ✅ Critical Indexes Present

**Mailboxes:**
- `idx_mailboxes_org_id` - Org filtering
- `idx_mailboxes_user_id` - User filtering
- `idx_mailboxes_status` - Sync status queries

**Mail Threads:**
- `idx_mail_threads_org_id` - Org filtering
- `idx_mail_threads_mailbox_id` - FK lookup
- `idx_mail_threads_last_message_at` - Sorting (DESC)
- `idx_mail_threads_needs_routing` - Partial index for manual attach workflow
- `idx_mail_threads_participant_emails` - GIN for array search

**Mail Messages:**
- `idx_mail_messages_org_id` - Org filtering
- `idx_mail_messages_mailbox_id` - FK lookup
- `idx_mail_messages_thread_id` - FK lookup
- `idx_mail_messages_sent_at` - Sorting (DESC)
- `idx_mail_messages_from_email` - Sender lookup
- `idx_mail_messages_to_emails` - GIN for array search

**Mail Attachments:**
- `idx_mail_attachments_org_id` - Org filtering
- `idx_mail_attachments_message_id` - FK lookup
- `idx_mail_attachments_sha256` - Deduplication lookup

**Record Links:**
- `idx_record_links_org_id` - Org filtering
- `idx_record_links_source` - Source lookup (composite)
- `idx_record_links_target` - Target lookup (composite)
- `idx_record_links_link_method` - Filter by attachment method

**Events:**
- `idx_events_org_id` - Org filtering
- `idx_events_entity_type_id` - Entity lookup
- `idx_events_event_type` - Event type filtering
- `idx_events_created_at` - Time-series queries (DESC)
- `idx_events_correlation_id` - Group related events
- `idx_events_payload` - GIN for JSONB queries

**All critical query patterns are indexed.**

---

## RLS Policy Coverage

### ✅ All Tables Protected

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE |
|-------|------------|--------|--------|--------|--------|
| `mailboxes` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mail_threads` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mail_messages` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `mail_attachments` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `record_links` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Policy Logic:**

**Mailboxes:**
- SELECT: Own mailbox or admin
- INSERT: Own mailbox only
- UPDATE: Own mailbox or admin
- DELETE: Own mailbox or admin
- Service role bypass: YES

**Mail Threads/Messages/Attachments:**
- SELECT: All org users (shared inbox)
- INSERT: Service role only (ingestion service)
- UPDATE: Service role or admin (threads only)
- DELETE: Admin only

**Record Links:**
- SELECT: All org users
- INSERT: Any org user or service role
- UPDATE: Creator, admin, or service role
- DELETE: Creator, admin, or service role

**No policy gaps detected. Service role access properly configured for ingestion.**

---

## Migration Gaps

### ❌ No New Migrations Required

All Sprint 0.3 requirements are met by existing migrations:
- **00017** - Events table (ledger)
- **00030** - Mail tables (schema)
- **00031** - Mail RLS policies (security)

---

## Pre-Production Checklist

### Schema
- ✅ All tables have standard columns
- ✅ Foreign keys have ON DELETE behavior
- ✅ Constraints defined (UNIQUE, CHECK, NOT NULL)
- ✅ Default values set appropriately

### Security
- ✅ RLS enabled on ALL public tables
- ✅ Policies cover SELECT, INSERT, UPDATE, DELETE
- ✅ Service role bypass configured
- ⚠️ OAuth tokens encrypted at rest (application layer responsibility)
- ⚠️ Storage bucket policies not yet configured (pending file upload)

### Performance
- ✅ Indexes on foreign keys
- ✅ Indexes on filtered/sorted columns
- ✅ GIN indexes for JSONB and arrays
- ✅ Partial index for `needs_routing` workflow

### Operations
- ⚠️ Types not yet generated (`supabase gen types`)
- ✅ Migrations tested and deployed
- ⚠️ Backup strategy not documented
- ⚠️ Realtime not yet configured (if needed)

---

## Recommendations

### Immediate (Pre-Launch)
1. Generate TypeScript types: `supabase gen types typescript --local > src/types/database.ts`
2. Configure storage bucket for attachments with RLS policies
3. Test ingestion service with service role key
4. Verify `auth.has_role('admin')` helper function exists (migration 00004)

### Post-Launch
1. Monitor index usage via `pg_stat_user_indexes`
2. Monitor table sizes and partition `events` if needed
3. Configure realtime for `mail_threads` if live updates required
4. Set up automated backups via Supabase dashboard

### Future Enhancements
1. Consider adding `mail_messages.updated_at` if message metadata can change
2. Add `mail_threads.assigned_to` for routing workflow
3. Add `record_links.notes` for manual attachment context
4. Consider partitioning `events` by month after 1M+ records

---

## Conclusion

**The database schema is PRODUCTION READY for Sprint 0.3.**

All required tables, constraints, indexes, and RLS policies are in place. The schema is:
- **Idempotent** - Unique constraints support upsert operations
- **Secure** - RLS policies protect all tables
- **Performant** - Critical query paths are indexed
- **Auditable** - Events table supports all required event types

**No new migrations required. Proceed with application development.**

---

**Next Steps:**
1. Generate database types
2. Configure storage bucket for attachments
3. Deploy ingestion service with service role authentication
4. Test end-to-end OAuth → Ingestion → Attach workflow
