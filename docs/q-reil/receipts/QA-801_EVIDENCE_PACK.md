# QA-801 — Evidence Pack

**Mission ID:** QREIL QA-801  
**Owner:** backend-qa-automation-tester  
**Purpose:** Evidence for each PRD §10 criterion. Binary PASS/FAIL per criterion in [QA-801_DOD_MATRIX.md](QA-801_DOD_MATRIX.md). No coverage chasing; only truth.

---

## E1 — Gmail OAuth works end to end (DoD #1)

**Verdict:** PASS

**Evidence:**

- **Receipts:** [AUTH-101_CONNECT_PROOF.md](AUTH-101_CONNECT_PROOF.md), [AUTH-101_REFRESH_PROOF.md](AUTH-101_REFRESH_PROOF.md), [OPS-901_OAUTH_PROOF.md](OPS-901_OAUTH_PROOF.md).
- **Code:** OAuth authorize/callback and token refresh in `q-reil/app/api/connectors/gmail/oauth/`, `q-reil/lib/oauth/` (token-exchange, token-refresh, gmail-auth). Mailbox record created/updated on connect.
- **Runtime:** E2E OAuth flow verified per OPS-901 and AUTH-101 receipts.

---

## E2 — Initial 7-day ingestion completes successfully (DoD #2)

**Verdict:** PASS

**Evidence:**

- **Receipt:** [BE-301_INGEST_7DAY_PROOF.md](BE-301_INGEST_7DAY_PROOF.md).
- **Code:** `q-reil/lib/inbox/gmail-ingestion/gmail-ingest-service.ts` — `BACKFILL_DAYS = 7`, `performBackfill()` with Gmail `threads.list` `q: after:<unix_7_days_ago>`, paginated. Trigger: `POST /api/connectors/gmail/sync` with `forceFullSync: true`.
- **Runtime:** Verification runbook: [scripts/be-301-verify/README.md](../../scripts/be-301-verify/README.md). Requires connected mailbox and env (AUTH-101, BE-301 handoff).

---

## E3 — Threads, messages, and attachments persist correctly (DoD #3)

**Verdict:** PASS

**Evidence:**

- **Receipt:** [BE-301_INGEST_7DAY_PROOF.md](BE-301_INGEST_7DAY_PROOF.md).
- **Schema:** `docs/02_DATA/migrations/00030_create_mail_tables.sql` — `mail_threads`, `mail_messages`, `mail_attachments` with `mailbox_id`, provider ids, storage path for attachments.
- **Code:** `gmail-ingest-service.ts` — `ingestThread` upserts threads then messages; `attachment-downloader.ts` — download, upload to bucket `mail-attachments`, upsert `mail_attachments`. Path: `{org_id}/{mailbox_id}/{sha256}/{filename}`.

---

## E4 — Ledger events are written in code for ingestion and linking (DoD #4)

**Verdict:** PASS

**Evidence:**

- **Ingestion:** `q-reil/lib/inbox/gmail-ingestion/ledger.ts` — `emitSyncStarted`, `emitSyncCompleted`, `emitSyncFailed`, `emitThreadIngested`, `emitMessageIngested`; `attachment-downloader.ts` uses `emitAttachmentSaved` (or equivalent from ledger). Events: `sync.started`, `thread.ingested`, `message.ingested`, `attachment.saved`, `sync.completed`, `sync.failed`.
- **Linking:** [BE-302_LINKING_PROOF.md](BE-302_LINKING_PROOF.md), `q-reil/lib/ledger/linking.ts` — `emitManualAttach`; auto-link emits `link.auto_attach`. Events: `link.manual_attach`, `link.auto_attach`.
- **Receipt:** [AUD-401_LEDGER_ENFORCEMENT_PROOF.md](AUD-401_LEDGER_ENFORCEMENT_PROOF.md). Payloads: references only; no raw email bodies.

---

## E5 — Inbox UI displays real data from the database (DoD #5)

**Verdict:** PASS

**Evidence:**

- **Receipt:** [IMPL-900_UI_REALDATA_PROOF.md](IMPL-900_UI_REALDATA_PROOF.md).
- **Code:** `q-reil/app/q-reil/inbox/page.tsx` (inbox), `q-reil/app/api/q-reil/inbox/threads/route.ts`, `q-reil/app/q-reil/inbox/thread/[id]/page.tsx` (thread detail). No mock data; data from Supabase.

---

## E6 — Manual attach links an email to a record (DoD #6)

**Verdict:** PASS

**Evidence:**

- **Receipt:** [BE-302_LINKING_PROOF.md](BE-302_LINKING_PROOF.md).
- **Code:** `q-reil/app/api/q-reil/link/attach/route.ts` — POST body `sourceType`, `sourceId`, `targetType`, `targetId`; validates thread/message and target record in org; inserts `record_links` with `link_method: "manual"`; calls `emitManualAttach`. **Duplication:** Unique constraint `(source_type, source_id, target_type, target_id)` on `record_links` (migration `00030_create_mail_tables.sql`). On conflict `23505`, returns **409** with `{ "error": "Link already exists" }` (lines 150–156).
- **Linking idempotency:** Second attach with same (source, target) → 409; no duplicate row.

---

## E7 — Re-running ingestion produces zero duplicates (DoD #7)

**Verdict:** **FAIL** (until runtime proof)

**Why:** PRD §10 #7 is binary. PASS requires proof that it happened against a real run, not only that the code looks idempotent. Schema constraints and upserts are good engineering; they are not the same as proof.

**Evidence (design only — does not satisfy DoD):**

- **Receipt:** [BE-301_IDEMPOTENCY_PROOF.md](BE-301_IDEMPOTENCY_PROOF.md) (implementation proof, not runtime proof).
- **Schema:** `mail_threads` / `mail_messages` / `mail_attachments` unique constraints; **Code:** upserts with `onConflict` in `gmail-ingest-service.ts` and `attachment-downloader.ts`.

**Required for PASS:** Runtime receipt showing Sync A and Sync B (same mailbox, same 7-day window), with correlation IDs, timestamps, and row counts proving no increase after run B. See **[QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md](QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md)**. E7 flips to PASS only when that receipt exists and shows zero duplicates.

---

## Idempotency and duplication test summary

| Area | Test | Evidence |
|------|------|----------|
| Ingestion | Re-run same 7-day sync → no new duplicate threads/messages/attachments | E7 **FAIL** until [QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md](QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md) shows real run proof |
| Linking | Same (source, target) attach twice → 409, no duplicate link row | E6 (attach route 23505 → 409, unique on record_links) |
