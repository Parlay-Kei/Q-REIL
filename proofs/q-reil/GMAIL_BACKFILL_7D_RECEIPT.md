# Gmail 7-Day Backfill Receipt

**Mission:** BEQA-OPS-901-TOKEN-MINT-AND-VERIFY-0054 (Backfill deliverable)  
**Date:** 2026-02-01  
**Deliverable:** Proof that 7-day backfill runs and Supabase writes are validated (mail_threads, mail_messages, attachments bucket references, ledger).

---

## Requirement

- **7-day backfill** runs successfully: connector fetches Gmail threads from the last 7 days, persists threads/messages/attachments, and emits ledger events.
- **Supabase writes validated:**
  - **mail_threads** — One row per thread per mailbox; unique on `(mailbox_id, provider_thread_id)`.
  - **mail_messages** — One row per message; unique on `(mailbox_id, provider_message_id)`; `thread_id` FK to `mail_threads`.
  - **mail_attachments** — One row per attachment; unique on `(message_id, provider_attachment_id)`; `storage_path` references bucket or reference-only.
  - **Attachments bucket** — Bucket `mail-attachments`; objects at `{org_id}/{mailbox_id}/{sha256}/{filename}` for stored blobs (≤25MB); reference-only for >25MB (`storage_path` = `gmail:ref:messageId:attachmentId`).
  - **Ledger (events)** — Rows for `sync.started`, `sync.completed`, `thread.ingested`, `message.ingested`, `attachment.saved`; payloads metadata-only (no `body_plain`, `body_html`, or raw body).

---

## How to Run 7-Day Backfill

1. **Prerequisites**
   - Supabase: bucket `mail-attachments` created; migration 00032 applied.
   - Env (repo root `.env.local` or env): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.
   - Token: `scripts/oauth-proof/.tokens.json` (from `proof-gmail-oauth.mjs`) or `GMAIL_REFRESH_TOKEN` in env; client_id in file must match env.

2. **Command (from repo root)**
   ```bash
   node connectors/gmail/run-sync.mjs
   ```
   Optional: `node connectors/gmail/run-sync.mjs --mailbox-id=UUID --org-id=UUID` when mailbox already exists.

3. **Expected output**
   ```json
   {
     "ok": true,
     "threadsIngested": N,
     "messagesIngested": M,
     "attachmentsSaved": A,
     "errors": []
   }
   ```
   Exit code 0. Any per-thread errors appear in `errors[]`; sync still completes.

---

## Validation Queries (Supabase)

After a successful run, use the mailbox `id` from `mailboxes` (or from sync context):

```sql
-- Counts for mailbox
SELECT
  (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :mailbox_id) AS threads,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = :mailbox_id) AS messages,
  (SELECT COUNT(*) FROM mail_attachments WHERE mailbox_id = :mailbox_id) AS attachments;

-- Sample thread/message
SELECT id, provider_thread_id, subject, first_message_at, last_message_at
FROM mail_threads WHERE mailbox_id = :mailbox_id ORDER BY last_message_at DESC LIMIT 5;

SELECT id, thread_id, provider_message_id, from_email, subject, sent_at
FROM mail_messages WHERE mailbox_id = :mailbox_id ORDER BY sent_at DESC LIMIT 5;

-- Attachment storage_path (bucket refs)
SELECT id, message_id, provider_attachment_id, storage_path, sha256, filename
FROM mail_attachments WHERE mailbox_id = :mailbox_id LIMIT 10;

-- Ledger events (no PII in payload)
SELECT event_type, entity_type, entity_id, payload, created_at
FROM events
WHERE event_type IN ('sync.started', 'sync.completed', 'thread.ingested', 'message.ingested', 'attachment.saved')
ORDER BY created_at DESC
LIMIT 20;
```

**Storage:** In Dashboard → Storage → bucket `mail-attachments`, confirm objects under `{org_id}/{mailbox_id}/{sha256}/` when attachments were ingested.

---

## Run Result (2026-02-01)

- **Backfill execution:** Not completed in this run. Sync failed at OAuth token refresh (`unauthorized_client`, 401). No rows written.
- **Next step:** Mint a fresh refresh token via `scripts/oauth-proof/one-time-auth.mjs` (auth URL has `access_type=offline` and `prompt=consent`), store as `GMAIL_REFRESH_TOKEN` in vault (repo root `.env.local`), then re-run `node connectors/gmail/run-sync.mjs` and run the validation queries above.

---

## Checklist

- [ ] `run-sync.mjs` completes with `ok: true`.
- [ ] DB: rows in `mail_threads`, `mail_messages`, `mail_attachments` for the mailbox.
- [ ] Bucket `mail-attachments`: objects at expected paths when attachments are present.
- [ ] Ledger: `events` contains sync/thread/message/attachment types; payloads free of body/PII.

---

**Status:** Procedure and validation queries documented. Backfill run pending valid OAuth credentials and token.
