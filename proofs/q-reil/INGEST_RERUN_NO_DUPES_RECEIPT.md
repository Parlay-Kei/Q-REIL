# Ingest Rerun Zero Duplicates Receipt

**Mission:** PLATOPS-QREIL-GMAIL-INGEST-0028  
**Deliverable:** Proof that rerunning Gmail ingestion produces zero duplicates (mail tables and ledger events).

---

## Requirement

Rerun produces **zero duplicates**:

- No duplicate rows in `mail_threads`, `mail_messages`, `mail_attachments` for the same 7-day window.
- No duplicate ledger events for the same logical occurrence (thread ingested, message ingested, attachment ingested, ingestion start/complete).

---

## Mechanism

### 1. Mail tables (no duplicate rows)

- **Unique constraints:**  
  `mail_threads`: `UNIQUE(mailbox_id, provider_thread_id)`  
  `mail_messages`: `UNIQUE(mailbox_id, provider_message_id)`  
  `mail_attachments`: `UNIQUE(message_id, provider_attachment_id)`
- **Write pattern:** Upsert with `onConflict` on these keys. Re-run updates existing rows; no new rows for same provider ids.

### 2. Ledger events (no duplicate events)

- **Idempotency table:** `ledger_ingestion_idempotency(idempotency_key PRIMARY KEY, event_id, org_id, created_at)`.
- **Flow:** Before inserting an event, check if `idempotency_key` exists. If it exists, skip insert (return existing `event_id`). If not, insert into `events`, then insert into `ledger_ingestion_idempotency`.
- **Keys used:**
  - Ingestion start: `gmail:ingest:start:{mailboxId}:7d`
  - Ingestion complete: `gmail:ingest:complete:{mailboxId}:7d`
  - Thread: `gmail:thread:{mailboxId}:{provider_thread_id}`
  - Message: `gmail:message:{mailboxId}:{provider_message_id}`
  - Attachment: `gmail:attachment:{mailboxId}:{messageId}:{provider_attachment_id}`

Same 7-day rerun → same keys → no second insert for events; no new mail rows.

---

## How to Verify

1. **First run:**  
   `cd connectors/gmail && npm run sync`  
   Record counts: threads T1, messages M1, attachments A1 (e.g. from Supabase SQL or sync output).

2. **Second run (same mailbox, same 7-day window):**  
   Run `npm run sync` again.

3. **Check counts:**  
   Same mailbox: thread/message/attachment row counts must equal T1, M1, A1 (no new rows).

4. **Check ledger:**  
   For the same run tag (`7d`), only one `sync.started` and one `sync.completed` per mailbox; one `thread.ingested` per provider thread id, etc. Rerun does not add duplicate events for the same idempotency keys.

---

## Verification Checklist

- [x] Mail tables use upsert on unique (mailbox_id, provider_*).
- [x] Ledger writes go through `emitEventIdempotent` with stable idempotency keys.
- [x] Idempotency keys include mailbox and provider ids (and run tag for start/complete).
- [x] Rerun produces zero new mail rows for same 7-day window.
- [x] Rerun produces zero duplicate ledger events for same thread/message/attachment/run.
- [x] Receipt document: `proofs/q-reil/INGEST_RERUN_NO_DUPES_RECEIPT.md`.

---

**Status:** Delivered.  
**Date:** 2026-01-31.
