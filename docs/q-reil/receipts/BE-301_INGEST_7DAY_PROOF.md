# BE-301 — 7-Day Ingest Proof

**Mission ID:** QREIL BE-301  
**Owner:** backend-dev  
**Brief:** Build Gmail ingestion service for 7-day backfill. Store threads, messages, attachments metadata. Store attachments in object storage. Emit ledger events. (PRD §6 §10.)

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | 7-day backfill completes for a real mailbox | ☐ |
| 2 | Threads and messages persist correctly | ☐ |
| 3 | Attachments stored and referenced correctly | ☐ |
| 4 | Ledger events emitted in code | ☐ |
| 5 | No raw email bodies in logs or ledger payloads | ☐ |

---

## Implementation Summary

### 7-Day Backfill

- **Window:** Last 7 days (configurable constant `BACKFILL_DAYS = 7` in `gmail-ingest-service.ts`).
- **Trigger:** `POST /api/connectors/gmail/sync` (authenticated). Optional body: `{ "mailboxId": "<uuid>", "forceFullSync": true }`. If `mailboxId` omitted, uses first connected mailbox for the user’s org.
- **Algorithm:**
  1. Resolve mailbox (user’s org, optionally specified `mailboxId`).
  2. Set mailbox status to `syncing`; emit `sync.started` with `sync_type: "backfill"`, `backfill_days: 7`.
  3. Gmail API: `threads.list` with `q: after:<unix_7_days_ago>`, paginated (batch 100, 1s delay).
  4. For each thread: `threads.get` (full), then idempotent upsert thread → messages → attachments (see BE-301_IDEMPOTENCY_PROOF.md).
  5. Attachments: download from Gmail, SHA-256 hash, upload to Supabase Storage bucket `mail-attachments`, path `{org_id}/{mailbox_id}/{sha256}/{filename}`; upsert `mail_attachments`.
  6. On success: update mailbox `last_synced_at`, `last_history_id`; emit `sync.completed`.
  7. On failure: set mailbox status `error`, `sync_error_message`; emit `sync.failed`.

### Code Locations

| Item | Location |
|------|----------|
| Backfill / sync orchestration | `q-reil/lib/inbox/gmail-ingestion/gmail-ingest-service.ts` |
| 7-day constant | `BACKFILL_DAYS = 7` in same file |
| Message parsing (no body in logs) | `q-reil/lib/inbox/gmail-ingestion/message-parser.ts` |
| Attachment download + storage | `q-reil/lib/inbox/gmail-ingestion/attachment-downloader.ts` |
| Ledger events | `q-reil/lib/inbox/gmail-ingestion/ledger.ts` |
| Sync API route | `q-reil/app/api/connectors/gmail/sync/route.ts` |
| Service client (RLS bypass for ingestion) | `q-reil/lib/supabase/service.ts` |

### Ledger Events (all in code)

- **Table:** `public.events`.
- **Events:**  
  - `sync.started` — payload: `sync_type`, `mailbox_id`, `history_id_start`, `backfill_days`.  
  - `thread.ingested` — payload: `thread_id`, `mailbox_id`, `provider_thread_id`, `message_count`, `has_attachments`, `first_message_at`, `last_message_at` (no body).  
  - `message.ingested` — payload: `message_id`, `thread_id`, `mailbox_id`, `provider_message_id`, `subject`, `snippet`, `has_attachments`, `attachment_count`, `sent_at`, `size_estimate` (no body_plain/body_html).  
  - `attachment.saved` — payload: `attachment_id`, `message_id`, `thread_id`, `mailbox_id`, `filename`, `mime_type`, `size_bytes`, `storage_path`, `sha256`.  
  - `sync.completed` — payload: `sync_type`, `mailbox_id`, `threads_synced`, `messages_synced`, `attachments_saved`, `history_id_end`, `duration_ms`.  
  - `sync.failed` — payload: `sync_type`, `mailbox_id`, `error_type`, `error_message`, `http_status`, `threads_synced_before_failure`, `messages_synced_before_failure`, `will_retry`, `duration_ms`.

### Object Storage

- **Bucket:** `mail-attachments` (Supabase Storage). Must be created in project (e.g. via Dashboard or migration).
- **Path:** `{org_id}/{mailbox_id}/{sha256}/{safe_filename}`.
- **Metadata:** `mail_attachments.storage_path`, `sha256` for deduplication.

### No Raw Bodies in Logs or Ledger

- Email bodies (`body_plain`, `body_html`) are stored only in `mail_messages` table.
- They are never included in `events.payload` or in any `console.log`/logger output in the ingestion path.

---

## How to Verify

1. Connect Gmail (AUTH-101) so a mailbox exists and is `connected`.
2. Create Supabase Storage bucket `mail-attachments` if not present.
3. Apply migration `00032_mail_upsert_service_role.sql` so service role can upsert mail_messages and mail_attachments.
4. Call `POST /api/connectors/gmail/sync` with auth cookie (or `Authorization: Bearer <session>`). Optionally `{ "forceFullSync": true }` for a full 7-day run.
5. Check response: `threadsIngested`, `messagesIngested`, `attachmentsSaved`; and `events` table for `sync.started`, `thread.ingested`, `message.ingested`, `attachment.saved`, `sync.completed`.
6. Confirm `mail_threads`, `mail_messages`, `mail_attachments` rows and that attachment files exist in `mail-attachments` at the expected paths.

---

## Dependencies

- AUTH-101 complete (OAuth connect, tokens encrypted, mailbox record).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL` (for redirect URI).
