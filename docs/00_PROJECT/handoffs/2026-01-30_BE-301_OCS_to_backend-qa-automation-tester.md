# OCS: Manual tasks — Invoke backend-qa-automation-tester (BE-301)

**Dispatched:** 2026-01-30  
**From:** OCS (orchestrator)  
**To:** backend-qa-automation-tester  
**Mission ID:** QREIL BE-301  
**Type:** Manual / scripted (verify 7-day backfill and idempotency)

**PRD alignment:** PRD_Q_REIL_v0.1 §6 (MVP scope: Gmail ingestion), §10 (DoD #2, #3, #4, #7).

---

## Task

**Verify** the Gmail 7-day ingestion service (BE-301) per the receipt documents: 7-day backfill completes for a real mailbox, threads/messages/attachments persist and are referenced correctly, ledger events are emitted, and re-run produces zero duplicates for the same window.

### Prerequisites (must be done first)

- [BE-301_OCS_to_supabase-admin](2026-01-30_BE-301_OCS_to_supabase-admin.md): Storage bucket `mail-attachments` created; migration 00032 applied.
- AUTH-101 complete: at least one Gmail mailbox connected (status `connected`) for a test user/org.
- Env set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`.

### Verification steps

1. **7-day backfill**
   - With auth (session cookie or Bearer token for a user who has a connected mailbox), call:
     - `POST /api/connectors/gmail/sync` with body `{ "forceFullSync": true }` (or omit body to use first connected mailbox).
   - Confirm response: `ok: true`, and `threadsIngested`, `messagesIngested`, `attachmentsSaved` (counts ≥ 0).
   - In DB: confirm rows in `mail_threads`, `mail_messages`, `mail_attachments` for that mailbox; confirm `events` has `sync.started`, `thread.ingested`, `message.ingested`, `attachment.saved` (as applicable), `sync.completed`.
   - In Storage: confirm objects under bucket `mail-attachments` at paths `{org_id}/{mailbox_id}/{sha256}/...` for any ingested attachments.

2. **Idempotency (zero duplicates)**
   - Record counts for the mailbox:  
     `SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :id;`  
     Same for `mail_messages`, `mail_attachments`.
   - Call again: `POST /api/connectors/gmail/sync` with same `forceFullSync: true` (same mailbox/window).
   - Confirm counts are **unchanged** (no new duplicate rows for same 7-day window).
   - Optionally: assert no duplicate `(mailbox_id, provider_thread_id)` in `mail_threads`, etc., per [BE-301_IDEMPOTENCY_PROOF.md](../../q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md).

3. **Ledger and PII**
   - Spot-check `events` payloads for sync/thread/message/attachment: confirm **no** `body_plain`, `body_html`, or raw email body content in any payload.

### Authority

- **7-day proof:** [BE-301_INGEST_7DAY_PROOF.md](../../q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md)
- **Idempotency proof:** [BE-301_IDEMPOTENCY_PROOF.md](../../q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md)
- **Verification runbook + script:** [scripts/be-301-verify/README.md](../../scripts/be-301-verify/README.md), [scripts/be-301-verify/run-sync.sh](../../scripts/be-301-verify/run-sync.sh)

---

## Completion

- [ ] 7-day backfill run completed; response and DB/Storage state match receipt.
- [ ] Second run (same mailbox, same window) produced no duplicate threads/messages/attachments.
- [ ] Ledger events present; no raw email bodies in event payloads.
- [ ] Update receipt checkboxes in BE-301_INGEST_7DAY_PROOF.md and BE-301_IDEMPOTENCY_PROOF.md as satisfied; optionally update [RECEIPTS.md](../../q-reil/RECEIPTS.md) §8 BE-301 status.

---

**Receipts:** `docs/q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md`, `docs/q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md`, `docs/q-reil/RECEIPTS.md`.
