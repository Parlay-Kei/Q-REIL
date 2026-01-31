# QA-801-E7 — Idempotency Runtime Proof (PRD §10 #7)

**Mission ID:** QREIL QA-801-E7  
**Owner:** backend-qa-automation-tester  
**Brief (PRD_Q_REIL_v0.1 §6 §10):** Execute the idempotency runtime verification for PRD §10 criterion #7 using a real connected mailbox. Run two consecutive 7-day sync runs. Capture correlation IDs, timestamps, and row counts for threads, messages, attachments before and after run B. Produce a receipt that proves zero duplicates were created. Update QA-801 DOD matrix E7 to PASS only if evidence shows no row count increases attributable to duplicates.

---

## Status: BLOCKED

**Missing dependency:** A **connected Gmail mailbox** (table `mailboxes`, `status = 'connected'`) and an **authenticated session** (session cookie or Bearer token) for a user in that mailbox’s org. Sync endpoint `POST /api/connectors/gmail/sync` requires both; it returns 400 "No connected mailbox; connect Gmail first" if no mailbox is connected.

**To unblock:**

1. **Connect a Gmail mailbox and obtain a session for QA:** Follow [QA-801-E7_UNBLOCK_MAILBOX_RECEIPT.md](QA-801-E7_UNBLOCK_MAILBOX_RECEIPT.md). Fill that receipt with a connected mailbox and successful **200** on inbox threads (and session for API calls).
2. Ensure app is running (`npm run dev` in `q-reil/`) with env from `q-reil/.env.local`.
3. **Execute this runbook:** Sync A → Sync B → counts unchanged, correlation IDs recorded. Fill the **Proof** section below.
4. **Flip E7 to PASS:** Update [QA-801_DOD_MATRIX.md](QA-801_DOD_MATRIX.md) and [QA-801_EVIDENCE_PACK.md](QA-801_EVIDENCE_PACK.md). Then and only then is PRD §10 eligible for full PASS. See **What happens next** in the unblock receipt.

---

## Required proof (when run)

One receipt showing:

| Item | Required |
|------|----------|
| **Sync run A** | Completed for same mailbox and same 7-day window |
| **Sync run B** | Completed immediately after, same mailbox, same window |
| **Row counts** | Threads, messages, attachments for that `mailbox_id` did **not** increase after run B |
| **Optional but strong** | No new ledger events of type `thread.ingested` / `message.ingested` beyond “already exists” behavior, or counts show zero new inserts |
| **Evidence** | Timestamps and correlation IDs for both runs |

---

## Proof (fill when verification is executed)

### Environment

- **Mailbox ID:** *(fill after run)*
- **Org ID:** *(fill)*
- **App URL:** e.g. `http://localhost:3000`

### Sync run A

- **Request:** `POST /api/connectors/gmail/sync` with body `{ "forceFullSync": true }` (auth: session cookie or Bearer).
- **Timestamp (UTC):** *(fill)*
- **Response:** `ok`, `threadsIngested`, `messagesIngested`, `attachmentsSaved` *(fill)*
- **Correlation ID:** *(from `events` table: `SELECT correlation_id, event_type, created_at FROM events WHERE event_type IN ('sync.started','sync.completed') ORDER BY created_at DESC LIMIT 2` after run A)*

### Row counts after run A

```sql
-- mailbox_id = :mailbox_id
SELECT
  (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = :mailbox_id) AS threads,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = :mailbox_id) AS messages,
  (SELECT COUNT(*) FROM mail_attachments WHERE mailbox_id = :mailbox_id) AS attachments;
```

- **Threads:** *(fill)*  
- **Messages:** *(fill)*  
- **Attachments:** *(fill)*  

### Sync run B

- **Request:** Same as run A (same mailbox, same 7-day window).
- **Timestamp (UTC):** *(fill)*
- **Response:** *(fill)*
- **Correlation ID:** *(from `events` after run B)*

### Row counts after run B

- **Threads:** *(fill)*  
- **Messages:** *(fill)*  
- **Attachments:** *(fill)*  

### Assertion

- [ ] Thread count after B ≤ count after A (no duplicates).
- [ ] Message count after B ≤ count after A (no duplicates).
- [ ] Attachment count after B ≤ count after A (no duplicates).

If all three hold and run B used the same mailbox and 7-day window, **PRD §10 #7 runtime proof is satisfied.** Update QA-801 DOD matrix E7 to PASS and Evidence Pack to reference this receipt.

---

## How to capture correlation IDs

After each sync, query the ledger:

```sql
SELECT id, event_type, correlation_id, created_at, payload
FROM events
WHERE event_type IN ('sync.started', 'sync.completed')
ORDER BY created_at DESC
LIMIT 4;
```

Use the two most recent rows for run A, then the two next for run B (or run A then B and take the two pairs by time).

---

## Runbook (when unblocked)

1. Start app: `cd q-reil && npm run dev`.
2. With auth (cookie or Bearer), call `POST /api/connectors/gmail/sync` with `{ "forceFullSync": true }` → **Sync A**.
3. Record response and timestamp; query `events` for correlation_id(s) for this run; query DB for thread/message/attachment counts for the mailbox.
4. Call same endpoint again with same body → **Sync B**.
5. Record response and timestamp; query `events` for correlation_id(s); query DB for counts again.
6. Assert counts unchanged (or optionally that new thread.ingested / message.ingested events for run B reflect no new rows).
7. Fill the **Proof** section above and check the assertion checkboxes.
8. Update [QA-801_DOD_MATRIX.md](QA-801_DOD_MATRIX.md): set E7 to PASS. Update [QA-801_EVIDENCE_PACK.md](QA-801_EVIDENCE_PACK.md): E7 verdict PASS, evidence = this receipt.
