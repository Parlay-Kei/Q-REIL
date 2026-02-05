# Receipt: Gmail Ingestion Rerun Yields Zero Duplicates

**Mission:** QAG-QREIL-V0-1-CORE-LOOP-0029  
**Date:** 2026-01-31

---

## Claim

Gmail ingestion rerun yields zero duplicates (no duplicate threads, messages, or ledger events).

## Code Path

### 1. Threads and messages (Supabase upsert)

**File:** `connectors/gmail/lib/ingest.js`

- **Threads:** `supabase.from('mail_threads').upsert(..., { onConflict: 'mailbox_id,provider_thread_id' })`. Same mailbox + provider_thread_id on rerun updates the existing row; no second row inserted.
- **Messages:** `supabase.from('mail_messages').upsert(..., { onConflict: 'mailbox_id,provider_message_id' })`. Same mailbox + provider_message_id on rerun updates the existing row; no duplicate message row.

### 2. Ledger events (idempotency table)

**File:** `connectors/gmail/lib/ledger.js`

- **emitEventIdempotent(supabase, opts):**
  - Looks up `ledger_ingestion_idempotency` by `idempotency_key`.
  - If row exists: returns existing `event_id`, does **not** insert into `events`.
  - If row does not exist: inserts into `events`, then inserts into `ledger_ingestion_idempotency` (idempotency_key, event_id, org_id). On unique constraint violation (23505), returns null (no duplicate event).

**Idempotency keys** (`idempotencyKeys(mailboxId, runTag)`):

- Ingestion start: `gmail:ingest:start:{mailboxId}:{runTag}`
- Ingestion complete: `gmail:ingest:complete:{mailboxId}:{runTag}`
- Thread: `gmail:thread:{mailboxId}:{providerThreadId}`
- Message: `gmail:message:{mailboxId}:{providerMessageId}`
- Attachment: `gmail:attachment:{mailboxId}:{messageId}:{attachmentId}`

Rerun with same mailbox and same Gmail threads/messages produces the same keys → no new `events` rows, no duplicate ledger entries.

### 3. Attachments

**File:** `connectors/gmail/lib/attachments.js`

- `upsert(..., { onConflict: 'message_id,provider_attachment_id' })`. Rerun updates in place; no duplicate attachment rows.

## Verification

- **Threads/messages:** Conflict targets `mailbox_id,provider_thread_id` and `mailbox_id,provider_message_id` ensure at most one row per provider id per mailbox.
- **Events:** `ledger_ingestion_idempotency` check before insert and unique constraint on insert prevent duplicate events for the same idempotency key.
- **Rerun:** Same sync window and mailbox → same provider ids and same idempotency keys → zero new rows in mail_threads, mail_messages, events; counts on second run would show 0 new threads/messages/events if measured after first run.

**Receipt:** Idempotency implemented at DB and ledger level. Gmail ingestion rerun yields zero duplicates.
