# BE-301 Verification — 7-Day Backfill & Idempotency

**Mission ID:** QREIL BE-301  
**Purpose:** Run 7-day Gmail sync and verify idempotency per [BE-301_INGEST_7DAY_PROOF.md](../../docs/q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md) and [BE-301_IDEMPOTENCY_PROOF.md](../../docs/q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md).

---

## Prerequisites

- [ ] Supabase: Storage bucket **`mail-attachments`** created (Dashboard or API).
- [ ] Migration **00032_mail_upsert_service_role.sql** applied.
- [ ] AUTH-101 complete: at least one Gmail mailbox **connected** for a test user.
- [ ] App running (e.g. `npm run dev` in `q-reil/`) with env set:
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`

---

## 1. Get auth (session cookie or Bearer token)

- **Option A:** Log in to the app in the browser, then copy the session cookie (e.g. `sb-<project>-auth-token`) for the sync request.
- **Option B:** Use Supabase Auth to get a session and pass `Authorization: Bearer <access_token>`.

---

## 2. Run 7-day backfill (first run)

```bash
# Replace BASE_URL (e.g. http://localhost:3000) and COOKIE or Bearer token.
BASE_URL=http://localhost:3000

# With session cookie (from browser after login):
curl -X POST "$BASE_URL/api/connectors/gmail/sync" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=YOUR_SESSION_COOKIE" \
  -d '{"forceFullSync": true}'

# Or with Bearer token:
# curl -X POST "$BASE_URL/api/connectors/gmail/sync" \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
#   -d '{"forceFullSync": true}'
```

**Expected:** `200` with JSON like `{ "ok": true, "threadsIngested": N, "messagesIngested": M, "attachmentsSaved": A, "errors": [] }`.

---

## 3. Record counts (for idempotency check)

In Supabase SQL editor (or `psql`), for your mailbox ID:

```sql
-- Replace :mailbox_id with the UUID of the connected mailbox
SELECT
  (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :mailbox_id) AS threads,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = :mailbox_id) AS messages,
  (SELECT COUNT(*) FROM mail_attachments WHERE mailbox_id = :mailbox_id) AS attachments;
```

Save these numbers (e.g. threads_1, messages_1, attachments_1).

---

## 4. Run sync again (same mailbox, same window)

Call the same `POST /api/connectors/gmail/sync` with `{ "forceFullSync": true }` again (same auth).

---

## 5. Verify zero duplicates

Run the same COUNT query again. **Counts must equal** the first run (no new rows for the same 7-day window).

---

## 6. Spot-check ledger and PII

In `events` table:

```sql
SELECT event_type, payload
FROM events
WHERE event_type IN ('sync.started', 'sync.completed', 'thread.ingested', 'message.ingested', 'attachment.saved')
ORDER BY created_at DESC
LIMIT 20;
```

Confirm **no** `body_plain`, `body_html`, or raw email body in any `payload`.

---

## Completion

- [ ] First sync returned 200 and counts increased (or stayed 0 if mailbox empty).
- [ ] Second sync returned 200; thread/message/attachment counts **unchanged**.
- [ ] Ledger events present; no raw bodies in payloads.
- [ ] Update receipt checkboxes in BE-301_INGEST_7DAY_PROOF.md and BE-301_IDEMPOTENCY_PROOF.md.
