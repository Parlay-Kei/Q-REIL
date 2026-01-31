# REIL Ledger Event Types

**Mission:** PLATOPS-REIL-LEDGER-CONTRACT-0013  
**Version:** 1.0.0  
**Status:** Active  
**Last Updated:** 2025-01-30

---

## 1. Overview

This document defines the **minimal** ledger event contract required for REIL UI and dashboard metrics. The ledger is **append-only** and **references-only payload**: payloads contain IDs and references only—no full entity data, tokens, secrets, or PII.

### 1.1 Minimal Event Set (UI / Dashboard)

| Category | Event | Backend event_type |
|----------|--------|---------------------|
| Ingestion sync | ingestion started | `sync.started` |
| Ingestion sync | ingestion completed | `sync.completed` |
| Ingestion sync | ingestion failed | `sync.failed` |
| Ingested | thread ingested | `thread.ingested` |
| Ingested | attachment ingested | `attachment.saved` |
| Linking | thread linked to record | `link.manual_attach` / `link.auto_attach` (source_type=thread) |
| Linking | attachment linked to deal | `link.manual_attach` / `link.auto_attach` (source_type=attachment, target_type=deal) |
| Records | record created | `record.created` |

### 1.2 Principles

| Principle | Description |
|-----------|-------------|
| **Append-only** | Events are never modified or deleted once written |
| **References-only** | Payloads contain entity IDs, UUIDs, and references—not full entity data |
| **Immutability** | Enforced by DB triggers; no UPDATE or DELETE on `events` table |
| **Correlation** | Related events share `correlation_id` for workflow tracing |

---

## 2. Event Types for REIL UI

### 2.1 Ingestion Events

| Event Type | Description | Entity Type | Payload (References Only) |
|------------|-------------|-------------|----------------------------|
| `email.ingested` | Email/thread ingested from mailbox | `mail_thread` or `mail_message` | `thread_id`, `mailbox_id`, `provider_thread_id`, `message_count`, `has_attachments`, `first_message_at`, `last_message_at` |
| `attachment.ingested` | Attachment saved to storage | `mail_attachment` | `attachment_id`, `message_id`, `thread_id`, `mailbox_id`, `filename`, `mime_type`, `size_bytes`, `storage_path`, `sha256` |

**Implementation mapping:**
- `email.ingested` → emitted as `thread.ingested` (thread-level) and `message.ingested` (message-level)
- `attachment.ingested` → emitted as `attachment.saved`

### 2.2 Linking Events

| Event Type | Description | Entity Type | Payload (References Only) |
|------------|-------------|-------------|----------------------------|
| `thread.linked_to_record` | Thread linked to a record (contact, deal, property, etc.) | `record_link` | `link_id`, `source_type: "thread"`, `source_id`, `target_type`, `target_id`, `link_method`, `rule_name?` |
| `attachment.linked_to_deal` | Attachment linked to a deal | `record_link` | `link_id`, `source_type: "attachment"`, `source_id`, `target_type: "deal"`, `target_id`, `link_method`, `rule_name?` |

**Implementation mapping:**
- Both emitted via `link.manual_attach` or `link.auto_attach` with appropriate `source_type` and `target_type`

### 2.3 Record Events

| Event Type | Description | Entity Type | Payload (References Only) |
|------------|-------------|-------------|----------------------------|
| `record.created` | Record (contact, company, property, deal) created | `contact` \| `company` \| `property` \| `deal` | `record_id`, `record_type`, `created_by` |

### 2.4 Ingestion Sync Events

| Event Type | Description | Entity Type | Payload (References Only) |
|------------|-------------|-------------|----------------------------|
| `ingestion.sync_started` | Sync run started | `mailbox` | `mailbox_id`, `sync_type`, `history_id_start?`, `backfill_days?` |
| `ingestion.sync_completed` | Sync run completed successfully | `mailbox` | `mailbox_id`, `sync_type`, `threads_synced`, `messages_synced`, `attachments_saved`, `history_id_end?`, `duration_ms` |
| `ingestion.sync_failed` | Sync run failed | `mailbox` | `mailbox_id`, `sync_type`, `error_type`, `error_message`, `http_status?`, `threads_synced_before_failure`, `messages_synced_before_failure`, `will_retry`, `duration_ms` |

**Implementation mapping:**
- `ingestion.sync_*` → emitted as `sync.started`, `sync.completed`, `sync.failed`

---

## 3. Event Type Constants (REIL UI Contract)

```typescript
// Canonical event type strings for REIL UI consumption
export const LEDGER_EVENT_TYPES = {
  // Ingestion
  EMAIL_INGESTED: "email.ingested",           // alias: thread.ingested, message.ingested
  ATTACHMENT_INGESTED: "attachment.ingested", // alias: attachment.saved

  // Linking
  THREAD_LINKED_TO_RECORD: "thread.linked_to_record",   // via link.manual_attach | link.auto_attach
  ATTACHMENT_LINKED_TO_DEAL: "attachment.linked_to_deal", // via link.manual_attach | link.auto_attach

  // Records
  RECORD_CREATED: "record.created",

  // Ingestion sync
  INGESTION_SYNC_STARTED: "ingestion.sync_started",   // alias: sync.started
  INGESTION_SYNC_COMPLETED: "ingestion.sync_completed", // alias: sync.completed
  INGESTION_SYNC_FAILED: "ingestion.sync_failed",     // alias: sync.failed
} as const;
```

---

## 4. Payload Schemas (References-Only)

### 4.1 Email Ingested

```typescript
interface EmailIngestedPayload {
  thread_id: string;       // UUID
  mailbox_id: string;      // UUID
  provider_thread_id: string;
  message_count: number;
  has_attachments: boolean;
  first_message_at: string; // ISO 8601
  last_message_at: string;  // ISO 8601
}
```

### 4.2 Attachment Ingested

```typescript
interface AttachmentIngestedPayload {
  attachment_id: string;
  message_id: string;
  thread_id: string;
  mailbox_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  sha256: string;
}
```

### 4.3 Thread Linked to Record

```typescript
interface ThreadLinkedToRecordPayload {
  link_id: string;
  source_type: "thread";
  source_id: string;       // mail_threads.id
  target_type: "contact" | "company" | "deal" | "property" | "unit" | "leasing";
  target_id: string;
  link_method: "manual" | "rule" | "system";
  rule_name?: string | null;
}
```

### 4.4 Attachment Linked to Deal

```typescript
interface AttachmentLinkedToDealPayload {
  link_id: string;
  source_type: "attachment";
  source_id: string;       // mail_attachments.id
  target_type: "deal";
  target_id: string;       // deals.id
  link_method: "manual" | "rule" | "system";
  rule_name?: string | null;
}
```

### 4.5 Record Created

```typescript
interface RecordCreatedPayload {
  record_id: string;
  record_type: "contact" | "company" | "property" | "deal";
  created_by: string;      // users.id
}
```

### 4.6 Ingestion Sync Started

```typescript
interface IngestionSyncStartedPayload {
  mailbox_id: string;
  sync_type: "backfill" | "incremental";
  history_id_start?: string | null;
  backfill_days?: number | null;
}
```

### 4.7 Ingestion Sync Completed

```typescript
interface IngestionSyncCompletedPayload {
  mailbox_id: string;
  sync_type: "backfill" | "incremental";
  threads_synced: number;
  messages_synced: number;
  attachments_saved: number;
  history_id_end?: string | null;
  duration_ms: number;
}
```

### 4.8 Ingestion Sync Failed

```typescript
interface IngestionSyncFailedPayload {
  mailbox_id: string;
  sync_type: "backfill" | "incremental";
  error_type: string;
  error_message: string;
  http_status?: number | null;
  threads_synced_before_failure: number;
  messages_synced_before_failure: number;
  will_retry: boolean;
  duration_ms: number;
}
```

---

## 5. Implementation → UI Event Mapping

| REIL UI Event | Backend Event Type | Source |
|---------------|--------------------|--------|
| email ingested | `thread.ingested`, `message.ingested` | `lib/inbox/gmail-ingestion/ledger.ts` |
| attachment ingested | `attachment.saved` | `lib/inbox/gmail-ingestion/ledger.ts` |
| thread linked to record | `link.manual_attach`, `link.auto_attach` (source_type=thread) | `lib/ledger/linking.ts` |
| attachment linked to deal | `link.manual_attach`, `link.auto_attach` (source_type=attachment, target_type=deal) | `lib/ledger/linking.ts` |
| record created | `record.created` | `lib/ledger/records.ts` |
| ingestion sync started | `sync.started` | `lib/inbox/gmail-ingestion/ledger.ts` |
| ingestion sync completed | `sync.completed` | `lib/inbox/gmail-ingestion/ledger.ts` |
| ingestion sync failed | `sync.failed` | `lib/inbox/gmail-ingestion/ledger.ts` |

---

## 6. Query Patterns for REIL UI

### 6.1 Sync Status for Mailbox

```sql
SELECT event_type, payload, created_at
FROM events
WHERE org_id = :orgId
  AND entity_id = :mailboxId
  AND event_type IN ('sync.started', 'sync.completed', 'sync.failed')
ORDER BY created_at DESC
LIMIT 20;
```

### 6.2 Thread Audit Trail

```sql
SELECT event_type, payload, created_at
FROM events
WHERE org_id = :orgId
  AND (entity_id = :threadId OR payload->>'thread_id' = :threadId OR payload->>'source_id' = :threadId)
ORDER BY created_at ASC;
```

### 6.3 Deal Linking History

```sql
SELECT event_type, payload, created_at
FROM events
WHERE org_id = :orgId
  AND event_type IN ('link.manual_attach', 'link.auto_attach')
  AND payload->>'target_type' = 'deal'
  AND payload->>'target_id' = :dealId
ORDER BY created_at DESC;
```

---

## 7. DB and Interface Stubs (Contract Implementation)

### 7.1 DB Stub

The ledger is stored in `public.events` (append-only). Schema from `docs/02_DATA/migrations/00017_create_events.sql`:

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type TEXT DEFAULT 'user',
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  correlation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Immutability:** Triggers in `00018_create_event_triggers.sql` prevent UPDATE and DELETE.

### 7.2 Interface Stubs

TypeScript contract and emitters (see `q-reil/lib/ledger/`):

| Stub | Purpose |
|------|---------|
| `contract.ts` | `LedgerEventRow`, payload types, `LEDGER_EVENT_TYPES`, `BACKEND_EVENT_TYPES`, `UI_TO_BACKEND_EVENT_MAP` |
| `records.ts` | `emitRecordCreated` — record.created |
| `linking.ts` | `emitManualAttach`, `emitAutoAttach` — thread/attachment linked to record/deal |
| `ingestion.ts` | Re-exports ingestion emitters (sync started/completed/failed, thread ingested, attachment ingested) |

**TypeScript interface** (see `lib/ledger/contract.ts`):

```typescript
interface LedgerEventRow {
  id: string;
  org_id: string;
  actor_id: string | null;
  actor_type: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  correlation_id: string | null;
  created_at: string;
}
```

---

## 8. Related Documents

- `docs/01_SPEC/reil-ledger-rules.md` — Ledger principles and rules
- `docs/06_QA/LEDGER_EVENT_SPEC.md` — Base audit ledger specification
- `docs/06_QA/GMAIL_LEDGER_EVENTS.md` — Gmail-specific event schemas
- `docs/02_DATA/migrations/00017_create_events.sql` — Events table schema (DB stub)
- `docs/02_DATA/migrations/00018_create_event_triggers.sql` — Immutability triggers
- `q-reil/lib/ledger/contract.ts` — TypeScript interface stubs (payload types, LedgerEventRow)
- `q-reil/lib/ledger/records.ts` — record.created emitter
- `q-reil/lib/ledger/linking.ts` — thread/attachment link emitters
- `q-reil/lib/inbox/gmail-ingestion/ledger.ts` — ingestion (sync/thread/attachment) emitters
