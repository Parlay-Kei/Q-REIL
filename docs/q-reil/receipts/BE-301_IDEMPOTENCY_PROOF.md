# BE-301 — Idempotency Proof

**Mission ID:** QREIL BE-301  
**Owner:** backend-dev  
**Brief:** Re-run produces zero duplicates for same window. Idempotent upserts; no duplicates allowed.

---

## Acceptance

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Re-run (same mailbox, same 7-day window) produces zero new duplicate rows for threads, messages, attachments | ☐ |
| 2 | Upserts use unique constraints; conflict updates existing row | ☐ |

---

## Implementation Summary

### Unique Constraints (schema)

- **mailboxes:** `UNIQUE(org_id, provider_email)` — not used for ingestion; mailbox is pre-created by OAuth.
- **mail_threads:** `UNIQUE(mailbox_id, provider_thread_id)`.
- **mail_messages:** `UNIQUE(mailbox_id, provider_message_id)`.
- **mail_attachments:** `UNIQUE(message_id, provider_attachment_id)`.

All ingestion inserts use **upsert** with `onConflict` on these columns.

### Upsert Patterns (in code)

1. **Threads** (`gmail-ingest-service.ts` → `ingestThread`)  
   - `supabase.from('mail_threads').upsert({ ... }, { onConflict: 'mailbox_id,provider_thread_id' })`.  
   - Re-run: same `mailbox_id` + `provider_thread_id` → UPDATE existing row (e.g. snippet, message_count, dates); no duplicate.

2. **Messages** (`gmail-ingest-service.ts` → `ingestMessage`)  
   - `supabase.from('mail_messages').upsert({ ... }, { onConflict: 'mailbox_id,provider_message_id' })`.  
   - Re-run: same message → UPDATE; no duplicate.

3. **Attachments** (`attachment-downloader.ts` → `downloadAndStore`)  
   - Before insert: select by `message_id` + `provider_attachment_id`; if row exists, return existing id (skip download/upload).  
   - If not exists: download, upload to storage, then `upsert(..., { onConflict: 'message_id,provider_attachment_id' })`.  
   - Re-run: same message + attachment id → existing row found or upsert updates; storage path includes `sha256` and `upsert: true` on upload, so same content overwrites same path; no duplicate rows.

### Storage Idempotency

- Path: `{org_id}/{mailbox_id}/{sha256}/{filename}`.  
- Supabase Storage `upload(..., { upsert: true })`: same path overwrites; no duplicate objects for same hash/filename.

### Ledger

- Ledger events are append-only. Re-run will emit **new** `sync.started`, `thread.ingested`, `message.ingested`, `attachment.saved`, `sync.completed` for the same sync (by design). Event count increases; **data** (threads, messages, attachments) does not duplicate.

---

## Code References

| Location | Idempotency mechanism |
|----------|------------------------|
| `lib/inbox/gmail-ingestion/gmail-ingest-service.ts` | Thread upsert `onConflict: 'mailbox_id,provider_thread_id'` |
| `lib/inbox/gmail-ingestion/gmail-ingest-service.ts` | Message upsert `onConflict: 'mailbox_id,provider_message_id'` |
| `lib/inbox/gmail-ingestion/attachment-downloader.ts` | Check existing by `message_id` + `provider_attachment_id`; upsert `onConflict: 'message_id,provider_attachment_id'`; storage `upsert: true` |

---

## How to Verify

1. Run 7-day backfill once: `POST /api/connectors/gmail/sync` with `forceFullSync: true`.
2. Record counts:  
   `SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :id;`  
   Same for `mail_messages`, `mail_attachments` for that mailbox.
3. Run again with same parameters (same mailbox, same window).
4. Assert counts unchanged (or only increased if new mail arrived and incremental ran; for strict 7-day re-run use backfill only and ensure no new mail in window, or compare by `provider_*` id sets).
5. Optionally: assert no duplicate `(mailbox_id, provider_thread_id)` in `mail_threads`, no duplicate `(mailbox_id, provider_message_id)` in `mail_messages`, no duplicate `(message_id, provider_attachment_id)` in `mail_attachments`.

---

## RLS and Upsert

- Migration `00032_mail_upsert_service_role.sql` grants service role UPDATE on `mail_messages` and `mail_attachments` so that upsert’s ON CONFLICT DO UPDATE succeeds when run with the service client.
