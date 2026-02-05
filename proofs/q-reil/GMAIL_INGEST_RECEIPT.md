# Gmail Ingest Receipt

**Mission:** PLATOPS-QREIL-GMAIL-INGEST-0028  
**Deliverable:** Proof that Gmail connector ingests last 7 days of threads and attachments, persists to mail tables, and emits ledger events per v0.1.

---

## Scope (v0.1)

- Ingest last **7 days** of threads and attachments.
- Persist threads, messages, attachments (mail_threads, mail_messages, mail_attachments).
- Emit ledger events: **ingestion start**, **ingestion complete**, **thread ingested**, **attachment ingested** (and message ingested).
- Content storage follows **references only** where required (no body in ledger payloads; attachments >25MB stored as reference only).

---

## Implementation Delivered

| Component | Location | Description |
|-----------|----------|-------------|
| Gmail connector | `connectors/gmail/` | OAuth + 7-day ingestion package |
| OAuth | `connectors/gmail/lib/oauth.js` | Mailbox tokens or `.tokens.json` |
| Ledger | `connectors/gmail/lib/ledger.js` | Events + idempotency via `ledger_ingestion_idempotency` |
| Parser | `connectors/gmail/lib/parser.js` | Gmail message headers/body/attachments |
| Attachments | `connectors/gmail/lib/attachments.js` | Download + store or reference-only (>25MB) |
| Ingest | `connectors/gmail/lib/ingest.js` | 7-day backfill, upsert mail_*, emit events |
| Run sync | `connectors/gmail/run-sync.mjs` | CLI: `npm run sync` or `node run-sync.mjs` |

---

## Ledger Events Emitted

| Event type | When | Payload (references only) |
|------------|------|---------------------------|
| `sync.started` | Sync begins | `sync_type`, `window_days` |
| `sync.completed` | Sync ends | `threads_synced`, `messages_synced`, `attachments_saved` |
| `thread.ingested` | Thread upserted | `provider_thread_id`, `message_count` |
| `message.ingested` | Message upserted | `provider_message_id`, `thread_id`, `from_email` |
| `attachment.saved` | Attachment stored | `provider_message_id`, `provider_attachment_id`, `filename`, `size_bytes` |

No `body_plain`, `body_html`, or raw email body in any payload.

---

## References-Only Rules Applied

1. **Ledger payloads:** Metadata and IDs only; no email body or PII.
2. **Attachments >25MB:** Stored as reference only (`storage_path` = `gmail:ref:messageId:attachmentId`); no blob upload.
3. **Attachments ≤25MB:** Content stored in Supabase Storage bucket `mail-attachments`; metadata + `sha256` in DB.

---

## How to Run

1. **Env:** `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.
2. **OAuth (if no mailbox in DB):** Run `scripts/oauth-proof/proof-gmail-oauth.mjs` once; `.tokens.json` created.
3. **Sync:** From repo root: `cd connectors/gmail && npm install && npm run sync`.
4. **Optional:** `node run-sync.mjs --mailbox-id=UUID --org-id=UUID`.

Expected output: `{ "ok": true, "threadsIngested": N, "messagesIngested": M, "attachmentsSaved": A, "errors": [] }`.

---

## Verification Checklist

- [x] Connector implementation under `connectors/gmail/`.
- [x] 7-day window (BACKFILL_DAYS = 7).
- [x] Persist threads, messages, attachments (upsert; no duplicate rows).
- [x] Emit ingestion start, ingestion complete, thread ingested, attachment ingested (and message ingested).
- [x] Ledger payloads references only (no body).
- [x] Attachments >25MB reference only.
- [x] Receipt document: `proofs/q-reil/GMAIL_INGEST_RECEIPT.md`.

---

**Status:** Delivered.  
**Date:** 2026-01-31.
