# QA-801 — Idempotency & Duplication Verification

**Mission ID:** QREIL QA-801  
**Purpose:** Run idempotency and duplication tests for ingestion and linking; verify PRD §10 seven criteria. Evidence feeds `docs/q-reil/receipts/QA-801_EVIDENCE_PACK.md`.

---

## Ingestion idempotency (DoD #7)

1. **First run:** `POST /api/connectors/gmail/sync` with `{ "forceFullSync": true }` (auth required).
2. **Record counts** for the mailbox (replace `:mailbox_id`):

```sql
SELECT
  (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :mailbox_id) AS threads,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = :mailbox_id) AS messages,
  (SELECT COUNT(*) FROM mail_attachments WHERE mailbox_id = :mailbox_id) AS attachments;
```

3. **Second run:** Same `POST` again (same mailbox, same 7-day window).
4. **Assert:** Counts unchanged (zero new duplicate rows).

See `scripts/be-301-verify/README.md` for full runbook (auth, env, Storage bucket).

---

## Linking duplication (DoD #6, no duplicate links)

1. **Manual attach once:** `POST /api/q-reil/link/attach` with `sourceType`, `sourceId`, `targetType`, `targetId` → expect 201.
2. **Same attach again:** Same body → expect **409** and body `{ "error": "Link already exists" }`.
3. **Assert:** No duplicate row in `record_links`; unique constraint `(source_type, source_id, target_type, target_id)` enforced.

---

## Run sync (reuse BE-301)

```bash
BASE_URL=http://localhost:3000 COOKIE="sb-xxx-auth-token=..." ./scripts/be-301-verify/run-sync.sh
# Or: BEARER_TOKEN=eyJ... ./scripts/be-301-verify/run-sync.sh
```

Record response and DB counts before/after second run for Evidence E7.
