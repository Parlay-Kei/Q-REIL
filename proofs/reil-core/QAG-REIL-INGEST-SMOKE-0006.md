# QAG-REIL-INGEST-SMOKE-0006 Proof

**Ticket:** QAG-REIL-INGEST-SMOKE-0006  
**Owner:** QA Gatekeeper  
**Status:** Evidence summary (ingestion run blocked by OAuth; DB verification script executed)  
**Deliverable:** Evidence that ingestion against the test mailbox creates raw rows, stores and links attachments, and does not duplicate on rerun.

---

## 1. Prerequisites

- Supabase project with migrations applied (including `source_items_raw`, `documents`, `mail_*`, `orgs`, `mailboxes`, etc.).
- Test mailbox with valid Gmail OAuth (refresh token in `.tokens.json` or `GMAIL_REFRESH_TOKEN`).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`.

---

## 2. Verification Steps and Evidence

### 2.1 Raw rows created

**Step:** Run ingestion once against the test mailbox.

```bash
cd connectors/gmail
node run-sync.mjs
```

**Schema note:** Current implementation writes `source_items_raw` only for **messages** (idempotency_key = `gmail:<messageId>`). There are no attachment rows in `source_items_raw`; attachment pointers live in `documents` with `document_type = 'gmail'`.

**Evidence (DB queries):**

- **source_items_raw (messages):** `SELECT COUNT(*) FROM source_items_raw WHERE source_type = 'gmail';` — count should match number of messages in the 7-day window after a successful run.
- **Quick verification script:** `node connectors/gmail/verify-ingest-smoke.mjs` outputs `counts.source_items_raw_gmail` and `counts.documents_gmail`.

| Check | Query / action | Expected | Actual |
|-------|----------------|----------|--------|
| Raw message rows | `SELECT COUNT(*) FROM source_items_raw WHERE source_type = 'gmail'` | > 0, matches message count in window | **0** (baseline before run; ingest run failed) |
| Payload shape (message) | Sample from `source_items_raw` where `source_type = 'gmail'` | Contains `received_at`, `from`, `to`, `subject`, `body_text`, `message_id`, `attachment_count` | N/A (no rows) |

---

### 2.2 Documents (attachment pointers)

**Step:** After a successful run, verify document rows for attachments.

**Evidence:** `documents` table uses `document_type = 'gmail'` (see `connectors/gmail/lib/ingest.js`). Rows are created per stored attachment; idempotency is by `org_id` + tags containing `ext:<attachmentId>`.

| Check | Query / action | Expected | Actual |
|-------|----------------|----------|--------|
| Document rows for attachments | `SELECT COUNT(*) FROM documents WHERE document_type = 'gmail'` | Matches number of stored attachments | **0** (baseline; no successful ingest) |
| Sample document | `SELECT id, name, storage_path, storage_bucket FROM documents WHERE document_type = 'gmail' LIMIT 1` | `storage_path` like `{org_id}/{mailbox_id}/{sha256}/{filename}` | N/A |

---

### 2.3 No duplicate inserts on rerun

**Step:** Record counts after first run; run `node run-sync.mjs` again (same window); compare counts.

| Check | Before rerun | After rerun | Pass? |
|-------|--------------|-------------|-------|
| `SELECT COUNT(*) FROM source_items_raw WHERE source_type = 'gmail'` | — | — | **N/A** (ingest not run successfully) |
| `SELECT COUNT(*) FROM documents WHERE document_type = 'gmail'` | — | — | **N/A** |
| Run output `sourceItemsRawMessages` / `documentsCreated` | First run: — | Second run: same totals, `documentsCreated` 0 | **N/A** |

---

## 3. Run Output (Evidence Snippet)

**First run attempt (2026-02-02):** Ingestion did not complete. OAuth refresh failed:

```text
oauth_env_sanity: client_id present, client_secret present, load_env from .env.local
oauth_refresh_failure: error=unauthorized_client, error_description=Unauthorized
GaxiosError: unauthorized_client
```

No JSON result body; exit code 1.

**DB verification script (same session):** Ran `node connectors/gmail/verify-ingest-smoke.mjs`:

```json
{
  "at": "2026-02-02T22:18:52.173Z",
  "counts": {
    "source_items_raw_gmail": 0,
    "documents_gmail": 0
  },
  "sample": {}
}
```

Supabase connection and tables are reachable; counts are zero because no successful ingestion has run against this project with the current OAuth state.

---

## 4. Verdict

- **Raw rows created:** **Blocked** — Ingestion run failed (OAuth `unauthorized_client`). Re-run with valid Gmail refresh token / OAuth client to obtain evidence.
- **Documents (attachment pointers):** **Blocked** — Same; no ingest run succeeded.
- **No duplicate inserts on rerun:** **Blocked** — Requires at least one successful run and a second run to compare counts.

**Overall:** **Blocked** (OAuth invalid for test mailbox; DB and verification script are in place.)

---

## 5. How to complete this proof (when OAuth is valid)

1. Ensure valid Gmail OAuth (e.g. run `scripts/oauth-proof/proof-gmail-oauth.mjs` and have refresh token in `.tokens.json` or `GMAIL_REFRESH_TOKEN` in repo root `.env.local`).
2. **First run:** `cd connectors/gmail && node run-sync.mjs` → capture full JSON output.
3. **DB snapshot:** `node connectors/gmail/verify-ingest-smoke.mjs` → record `counts.source_items_raw_gmail` and `counts.documents_gmail`.
4. **Second run:** `node run-sync.mjs` again → capture JSON output.
5. **DB again:** `node verify-ingest-smoke.mjs` → counts must be unchanged.
6. Update this file: fill “Actual” columns and set verdicts to Pass/Fail; set Overall to **Pass** if all three checks pass.

---

## 6. QAG-REIL-INGEST-SMOKE-RERUN-0010 (Rerun and PASS)

**Mission:** QAG-REIL-INGEST-SMOKE-RERUN-0010  
**Goal:** Convert current “Blocked” into “PASS” after PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008.

**Steps:**

1. Run `node connectors/gmail/verify-ingest-smoke.mjs` **before** ingest → record counts.
2. Run ingest: `node connectors/gmail/run-sync.mjs`.
3. Run `verify-ingest-smoke.mjs` **after** first ingest → record counts.
4. Run ingest **twice** more to confirm idempotency (second run must add no duplicate rows).
5. Update verdicts below and set **Overall** to **PASS** if all criteria pass.

**Evidence (fill after rerun):**

| Check | Before ingest | After first ingest | After second ingest (idempotency) |
|-------|---------------|--------------------|-----------------------------------|
| source_items_raw (Gmail) | *(count)* | *(count, must increase)* | *(unchanged)* |
| documents (Gmail) | *(count)* | *(count, increase if attachments)* | *(unchanged)* |

**RERUN-0010 Verdict:** *(Blocked until OAuth repair; then fill Pass/Fail after running steps above.)*

---

*Evidence summary for QAG-REIL-INGEST-SMOKE-0006. Verification script: `connectors/gmail/verify-ingest-smoke.mjs`.*
