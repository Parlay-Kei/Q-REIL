# Gmail Rerun Zero Duplicates Receipt

**Mission:** BEQA-OPS-901-TOKEN-MINT-AND-VERIFY-0054 (Rerun no-dupes deliverable)  
**Date:** 2026-02-01  
**Deliverable:** Proof that idempotency rerun yields zero duplicates (mail_threads, mail_messages, mail_attachments; ledger behavior).

---

## Requirement

- **Idempotency rerun:** Running the Gmail sync again for the **same mailbox** and **same 7-day window** must **not** create duplicate rows in `mail_threads`, `mail_messages`, or `mail_attachments`.
- **Ledger:** Events table may receive additional `sync.started` / `sync.completed` rows per run (current implementation inserts into `events` each run); mail-table idempotency is the critical guarantee (no duplicate threads/messages/attachments).

---

## Mechanism

### Mail tables (zero duplicate rows)

| Table | Unique constraint | Upsert conflict | Result on rerun |
|-------|-------------------|-----------------|------------------|
| mail_threads | `(mailbox_id, provider_thread_id)` | `onConflict: 'mailbox_id,provider_thread_id'` | Existing row updated; no new row. |
| mail_messages | `(mailbox_id, provider_message_id)` | `onConflict: 'mailbox_id,provider_message_id'` | Existing row updated; no new row. |
| mail_attachments | `(message_id, provider_attachment_id)` | `onConflict: 'message_id,provider_attachment_id'` | Existing row updated; no new row. |

**Code:** `connectors/gmail/lib/ingest.js` (thread/message upserts), `connectors/gmail/lib/attachments.js` (attachment upsert).

Same 7-day rerun → same provider ids → upsert updates in place → **counts unchanged**.

### Ledger idempotency

- **Events table:** `public.events` stores sync/thread/message/attachment events. Current connector inserts one `sync.started` and one `sync.completed` per run; rerun adds a second pair of start/complete events (one per run). Thread/message/attachment events are emitted per entity; rerun re-upserts the same entities, so the same entity ids get events again (event rows may increase; entity rows do not).
- **Idempotency keys:** `connectors/gmail/lib/ledger.js` defines `idempotencyKeys(mailboxId, runTag)` for optional use with a `ledger_ingestion_idempotency` table; current flow uses direct `events` inserts. Mail-table idempotency is what guarantees **zero duplicates** for threads, messages, and attachments.

---

## Verification Procedure

1. **First run**
   - Run: `node connectors/gmail/run-sync.mjs` (from repo root).
   - Record counts for the mailbox (replace `:mailbox_id` with actual UUID):
     ```sql
     SELECT
       (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :mailbox_id) AS threads,
       (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = :mailbox_id) AS messages,
       (SELECT COUNT(*) FROM mail_attachments WHERE mailbox_id = :mailbox_id) AS attachments;
     ```
   - Save as T1, M1, A1.

2. **Second run (same mailbox, same 7-day window)**
   - Run: `node connectors/gmail/run-sync.mjs` again (no change to mailbox or window).

3. **Check zero duplicates**
   - Run the same COUNT query. **Required:** thread count = T1, message count = M1, attachment count = A1 (no new rows).
   - Optional duplicate check (should return 0 rows):
     ```sql
     SELECT mailbox_id, provider_thread_id, COUNT(*)
     FROM mail_threads
     GROUP BY mailbox_id, provider_thread_id
     HAVING COUNT(*) > 1;
     ```
     Same pattern for `mail_messages` (group by `mailbox_id`, `provider_message_id`) and `mail_attachments` (group by `message_id`, `provider_attachment_id`).

---

## Run Result (2026-02-01)

- **First run:** Not completed; sync failed at OAuth token refresh (`unauthorized_client`, 401). No baseline counts recorded.
- **Second run / idempotency check:** Deferred until first run succeeds.
- **Next step:** After minting fresh token (one-time-auth.mjs), storing `GMAIL_REFRESH_TOKEN` in vault, and completing first sync, run `node connectors/gmail/run-sync.mjs` again and confirm counts unchanged (zero duplicates).

---

## Checklist

- [ ] First sync completed; baseline counts T1, M1, A1 recorded.
- [ ] Second sync (same mailbox, same window) completed.
- [ ] Counts after second run equal T1, M1, A1 (zero new rows).
- [ ] Optional: duplicate-check queries return 0 rows for mail_threads, mail_messages, mail_attachments.

---

**Status:** Idempotency mechanism (upsert on unique constraints) documented and verified in code. Rerun zero-duplicates verification pending successful OAuth and two completed sync runs.
