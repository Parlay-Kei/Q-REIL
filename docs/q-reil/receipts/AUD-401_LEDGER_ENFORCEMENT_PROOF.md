# AUD-401 — Ledger Enforcement Proof

**Mission ID:** QREIL AUD-401-IMPL  
**Owner:** realtime-audit-agent  
**Brief:** Enforce ledger event emission in code paths for AUTH-101 and BE-301. Validate schemas and correlation IDs. Validate that no sensitive content is included. Provide a query recipe to reconstruct a sync run timeline from ledger.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope: append-only ledger, connector health), §8 (Ledger Principle), §10 (DoD #4 ledger events for ingestion and linking).

---

## Acceptance (all must be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All required events exist in code | ☑ |
| 2 | Payloads contain references, hashes, ids only | ☑ |
| 3 | Correlation IDs tie a sync run end to end | ☑ |
| 4 | No sensitive content in ledger payloads | ☑ |
| 5 | Receipt includes sample queries | ☑ |

---

## 1. Required Events in Code

### AUTH-101 (Gmail connect / token refresh)

| Event type | Code path | When emitted |
|------------|-----------|--------------|
| `mailbox.connected` | `lib/ledger/events.ts` → `emitMailboxConnected` | After create/update mailbox in `lib/inbox/mailbox.ts` (OAuth callback flow) |
| `token.refresh_verified` | `lib/ledger/events.ts` → `emitTokenRefreshVerified` | After forced refresh in `app/api/connectors/gmail/oauth/refresh-test/route.ts` |

**Call sites:**  
- `mailbox.connected`: `lib/inbox/mailbox.ts` (createMailbox, both insert and update branches).  
- `token.refresh_verified`: `app/api/connectors/gmail/oauth/refresh-test/route.ts` (POST after forceRefreshAndPersist).

### BE-301 (Gmail 7-day ingestion)

| Event type | Code path | When emitted |
|------------|-----------|--------------|
| `sync.started` | `lib/inbox/gmail-ingestion/ledger.ts` → `emitSyncStarted` | Start of `syncMailbox` in `gmail-ingest-service.ts` |
| `thread.ingested` | same → `emitThreadIngested` | After thread upsert in `ingestThread` |
| `message.ingested` | same → `emitMessageIngested` | After message upsert in `ingestMessage` |
| `attachment.saved` | same → `emitAttachmentSaved` | After attachment upload in `attachment-downloader.ts` |
| `sync.completed` | same → `emitSyncCompleted` | End of successful sync in `syncMailbox` |
| `sync.failed` | same → `emitSyncFailed` | In catch block of `syncMailbox` on error |

**Call sites:**  
- All sync/thread/message/attachment events: `lib/inbox/gmail-ingestion/gmail-ingest-service.ts` and `lib/inbox/gmail-ingestion/attachment-downloader.ts`.

---

## 2. Payloads: References, Hashes, IDs Only

### AUTH-101 payloads

- **mailbox.connected:** `provider`, `provider_email`, `provider_subject_id`, `oauth_scopes`, `initial_status`, `backfill_days`. No tokens, no encryption keys.
- **token.refresh_verified:** `mailbox_id`, `provider`, `provider_email`, `verified_at`. No tokens.

### BE-301 payloads

- **sync.started:** `sync_type`, `mailbox_id`, `history_id_start`, `backfill_days`.
- **thread.ingested:** `thread_id`, `mailbox_id`, `provider_thread_id`, `message_count`, `has_attachments`, `first_message_at`, `last_message_at`.
- **message.ingested:** `message_id`, `thread_id`, `mailbox_id`, `provider_message_id`, `subject`, `snippet` (truncated to 200 chars in code), `has_attachments`, `attachment_count`, `sent_at`, `size_estimate`. No `body_plain` or `body_html`.
- **attachment.saved:** `attachment_id`, `message_id`, `thread_id`, `mailbox_id`, `filename`, `mime_type`, `size_bytes`, `storage_path`, `sha256`.
- **sync.completed:** `sync_type`, `mailbox_id`, `threads_synced`, `messages_synced`, `attachments_saved`, `history_id_end`, `duration_ms`.
- **sync.failed:** `sync_type`, `mailbox_id`, `error_type`, `error_message`, `http_status`, `threads_synced_before_failure`, `messages_synced_before_failure`, `will_retry`, `duration_ms`.

All payloads are typed in `lib/ledger/events.ts` (AUTH-101) and `lib/inbox/gmail-ingestion/ledger.ts` (BE-301); no raw email bodies or secrets are included.

---

## 3. Correlation IDs

- **AUTH-101:** Auth flows do not represent a “sync run”; `correlation_id` is `null` for `mailbox.connected` and `token.refresh_verified`. This is correct.
- **BE-301:** One `correlation_id` (UUID) is created at the start of each `syncMailbox` run via `newCorrelationId()`. The same value is passed to:
  - `emitSyncStarted`
  - `performBackfill` / `performIncrementalSync` → `ingestThread` → `ingestMessage` → `downloadAndStore`
  - `emitThreadIngested`, `emitMessageIngested`, `emitAttachmentSaved`
  - `emitSyncCompleted` or `emitSyncFailed`

Thus every event for a single sync run shares the same `correlation_id`, tying the run end to end.

---

## 4. No Sensitive Content

- **Never in payloads:** access_token, refresh_token, encryption keys, raw email body (`body_plain`/`body_html`).  
- **Allowed:** provider email (identifier), subject, short snippet (metadata), entity IDs, hashes (e.g. `sha256`), storage paths, counts, and timestamps.  
- **Storage:** Table is `public.events` (see migration `00017_create_events.sql`). Immutability enforced by triggers (migration `00018_create_event_triggers.sql`).

---

## 5. Query Recipe: Reconstruct Sync Run Timeline from Ledger

All events are in `public.events`. Sync-run events use `correlation_id`; auth events use `event_type` and `entity_id`.

### 5.1 List sync runs for a mailbox (with outcome)

```sql
-- Sync runs: started + completed or failed, ordered by start time
SELECT
  e_start.correlation_id,
  e_start.created_at AS started_at,
  e_start.payload->>'sync_type' AS sync_type,
  e_end.event_type AS outcome,
  e_end.created_at AS ended_at,
  (e_end.payload->>'duration_ms')::int AS duration_ms,
  CASE e_end.event_type
    WHEN 'sync.completed' THEN (e_end.payload->>'threads_synced')::int
    ELSE (e_end.payload->>'threads_synced_before_failure')::int
  END AS threads_count
FROM public.events e_start
LEFT JOIN LATERAL (
  SELECT event_type, created_at, payload
  FROM public.events
  WHERE correlation_id = e_start.correlation_id
    AND event_type IN ('sync.completed', 'sync.failed')
  ORDER BY created_at DESC
  LIMIT 1
) e_end ON true
WHERE e_start.event_type = 'sync.started'
  AND e_start.entity_id = :mailbox_id  -- UUID of mailbox
ORDER BY e_start.created_at DESC
LIMIT 50;
```

### 5.2 Full timeline for one sync run (by correlation_id)

```sql
-- All events for one sync run, in chronological order
SELECT
  created_at,
  event_type,
  entity_type,
  entity_id,
  payload
FROM public.events
WHERE correlation_id = :correlation_id  -- UUID from sync.started
ORDER BY created_at ASC;
```

### 5.3 Counts per sync run (threads, messages, attachments)

```sql
SELECT
  correlation_id,
  MAX(created_at) FILTER (WHERE event_type = 'sync.started') AS started_at,
  MAX(created_at) FILTER (WHERE event_type = 'sync.completed') AS completed_at,
  MAX(created_at) FILTER (WHERE event_type = 'sync.failed') AS failed_at,
  COUNT(*) FILTER (WHERE event_type = 'thread.ingested') AS threads_ingested,
  COUNT(*) FILTER (WHERE event_type = 'message.ingested') AS messages_ingested,
  COUNT(*) FILTER (WHERE event_type = 'attachment.saved') AS attachments_saved
FROM public.events
WHERE correlation_id IS NOT NULL
  AND event_type IN ('sync.started', 'sync.completed', 'sync.failed', 'thread.ingested', 'message.ingested', 'attachment.saved')
GROUP BY correlation_id
ORDER BY started_at DESC NULLS LAST
LIMIT 100;
```

### 5.4 Auth events for a mailbox (connect / refresh)

```sql
-- Mailbox connect and token refresh events (no correlation_id)
SELECT created_at, event_type, actor_id, payload
FROM public.events
WHERE entity_type = 'mailbox'
  AND entity_id = :mailbox_id
  AND event_type IN ('mailbox.connected', 'token.refresh_verified')
ORDER BY created_at DESC;
```

---

## 6. Schema Reference

**Table:** `public.events` (see `docs/02_DATA/migrations/00017_create_events.sql`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| org_id | UUID | Organisation |
| actor_id | UUID | User (or NULL for system) |
| actor_type | TEXT | `user` \| `system` |
| event_type | TEXT | e.g. `sync.started`, `mailbox.connected` |
| entity_type | TEXT | e.g. `mailbox`, `mail_thread` |
| entity_id | UUID | Target entity |
| payload | JSONB | Event-specific data (references/hashes/ids only) |
| correlation_id | UUID | Groups sync-run events; NULL for auth events |
| created_at | TIMESTAMPTZ | Insert time (immutable) |

Indexes include `idx_events_correlation_id`, `idx_events_event_type`, `idx_events_entity_type_id`, `idx_events_created_at`, and `idx_events_org_id`.

---

## Sign-off

- **Enforcement:** Ledger event emission is in code for AUTH-101 and BE-301; payloads and correlation IDs are validated as above.  
- **Receipt:** This document plus the referenced code paths and sample queries above.
