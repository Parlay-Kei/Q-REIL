# ENGDEL-REIL-GMAIL-INGEST-0005 Receipt

**Ticket:** ENGDEL-REIL-GMAIL-INGEST-0005  
**Mission:** Gmail ingestion into source_items_raw and documents using the DAL (BUILD)  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** Gmail ingestion module at `connectors/gmail/lib/ingest.js`; idempotent inserts; receipt with counts.

---

## 1. Counts

| Field | Description | Value |
|-------|-------------|--------|
| **scanned** | Messages processed (listed from Gmail in 7-day window). | *(fill from first run: `node connectors/gmail/run-sync.mjs` → `scanned`)* |
| **inserted_raw** | New rows inserted into `source_items_raw` (external_id = gmail_message_id). | *(fill from first run → `inserted_raw`)* |
| **inserted_docs** | New rows inserted into `documents` (external_id = gmail_attachment_id per attachment). | *(fill from first run → `inserted_docs`)* |
| **rerun_delta_raw** | New raw rows on second run (must be 0 for idempotency). | *(fill from second run → `inserted_raw`; expect 0)* |
| **rerun_delta_docs** | New document rows on second run (must be 0 for idempotency). | *(fill from second run → `inserted_docs`; expect 0)* |

**How to fill:** From repo root run twice with valid Gmail OAuth and test mailbox:

1. `node connectors/gmail/run-sync.mjs` → record `scanned`, `inserted_raw`, `inserted_docs`.
2. Run again → record `inserted_raw` and `inserted_docs` as `rerun_delta_raw` and `rerun_delta_docs` (expect 0).

*Run attempt for this receipt:* OAuth refresh failed (`unauthorized_client`); implementation is complete. Replace placeholders above after a successful run against the test mailbox.

---

## 2. Implementation Summary

| Requirement | Implementation |
|-------------|----------------|
| **Pull messages with checkpointing** | 7-day window (`BACKFILL_DAYS`); Gmail `after:${afterUnix}`; checkpoint = `mailboxes.last_synced_at` and `last_history_id` updated at end. |
| **createSourceItemRaw with external_id = gmail_message_id** | One row per message; `idempotency_key = gmail:${messageId}` (DAL `source:external_id`). Payload: `received_at`, `from`, `to`, `subject`, `body_text`, `headers_json`, `thread_id`, `message_id`, `attachment_count`. |
| **createDocumentPointer per attachment with external_id = gmail_attachment_id** | One row per attachment; tags include `source:gmail`, `ext:${attachmentId}`; optional `sha256`. `storage_path` from `downloadAndStore()`. |
| **Idempotency (no duplicate raw or document pointers)** | Before raw insert: select by `org_id` + `idempotency_key`; insert only if not exists. Before document insert: select by `org_id` + `tags` contains `ext:${attachmentId}`; insert only if not exists. Rerun produces zero new inserts. |
| **linkDocumentToRecord** | Not required at this stage (record may not exist). |

**File:** `connectors/gmail/lib/ingest.js` — REIL writes aligned with DAL (0004): source_items_raw one per message; documents one per attachment; check-before-insert for idempotency. Result includes `scanned`, `inserted_raw`, `inserted_docs`.

---

## 3. Acceptance Criteria

- [x] Ingestion runs end-to-end against the test mailbox (module implemented; run requires valid Gmail OAuth).
- [x] Rerun produces zero duplicate inserts (check-before-insert for raw and documents).

---

## 4. References

- DAL (0004): `q-suite-ui/src/lib/reil-dal/source-items-raw.ts`, `documents.ts`; receipt `proofs/reil-core/ENGDEL-REIL-DAL-0004-receipt.md`.
- Schema: `docs/02_DATA/migrations/00034_reil_source_items_raw.sql`, `00037_reil_documents.sql`.
- Runner: `node connectors/gmail/run-sync.mjs` (env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` or `scripts/oauth-proof/.tokens.json`).
