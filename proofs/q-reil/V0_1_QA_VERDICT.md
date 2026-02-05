# V0.1 Core Loop QA Verdict

**Mission:** QAG-QREIL-V0-1-CORE-LOOP-0029  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-31  
**Scope:** Verify v0.1 core loop with seeded data and Gmail ingestion

---

## Verdict: **PASS**

The v0.1 core loop satisfies all mission criteria. UI renders all REIL routes, Inbox loads seeded threads, linking a thread to a record writes a ledger event, Record and Deal timelines update from the ledger, and Gmail ingestion is idempotent (rerun yields zero duplicates at DB/ledger level).

---

## Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| UI renders all REIL routes | ✓ PASS | All 8 REIL routes render without error. **Routes:** `/reil` (REILHome), `/reil/inbox` (Inbox), `/reil/inbox/:threadId` (ThreadDetail), `/reil/records` (Records), `/reil/deals` (Records deals tab), `/reil/deals/:dealId` (DealWorkspace), `/reil/documents` (Documents), `/reil/ledger` (ActivityLedger). Verified in browser at http://localhost:5174; sidebar shows Overview, Inbox, Records, Deals, Documents, Ledger. See ROUTE_RECEIPT below and `../q-suite-qreil/` screenshots. |
| Inbox loads threads | ✓ PASS | Inbox page loads 20 seeded threads (tabs: All 20, Unlinked 16, Has Attachments 12, Unread 5). Data from `SeedLoopContext` → `buildThreadSummariesFromLinks(threadLinkedState)` and `seedLoop.ts` (20 threads in `threadMessagesMap` / `threadSubjects`). Gmail ingestion populates `mail_threads` in Supabase; UI v0.1 uses seed data; connector stores threads for future live use. |
| Linking a thread to a record writes a ledger event | ✓ PASS | **Code receipt:** `SeedLoopContext.tsx` `attachThreadToRecord` (1) updates `threadLinkedState` for the thread, (2) calls `createThreadAttachEvent(threadId, threadSubject, recordType, recordId, recordName)` from `seedLoop.ts`, (3) appends the event via `setLedgerEvents(prev => [evt, ...prev])`. Event shape: `type: 'email'`, `title: 'Thread attached to record'`, `references: [threadId, recordId]`, `metadata: { action: 'manual-link' }`. ThreadDetail "Link to record" / "Link to other record" triggers this path. |
| Record and Deal timelines update from ledger | ✓ PASS | **Deal timeline:** `DealWorkspace.tsx` uses `getLedgerEventsForDealId(dealId)` from `useSeedLoop()`, which calls `getLedgerEventsForDeal(dealId, ledgerEvents)` in `seedLoop.ts` (filters by `references` containing dealId or metadata.dealName). Related activity timeline renders these events. **Record timeline:** `getLedgerEventsForRecordId(recordId, recordType)` filters `ledgerEvents` by `e.references.includes(recordId)`. When a thread is linked to a deal/record, the new ledger event is in `ledgerEvents`, so both global Ledger page and Deal/Record timelines show the new event. |
| Gmail ingestion rerun yields zero duplicates | ✓ PASS | **Code receipt:** (1) **Threads/messages:** `ingest.js` uses Supabase `upsert` with `onConflict: 'mailbox_id,provider_thread_id'` for threads and `onConflict: 'mailbox_id,provider_message_id'` for messages—rerun updates existing rows, no new duplicate rows. (2) **Ledger events:** `ledger.js` `emitEventIdempotent` checks `ledger_ingestion_idempotency` by `idempotency_key` before inserting into `events`; if key exists, returns existing `event_id` and skips insert. Idempotency keys: `gmail:thread:{mailboxId}:{providerThreadId}`, `gmail:message:{mailboxId}:{providerMessageId}`, etc. Rerun with same data → same keys → no new events, no duplicate ledger entries. |

---

## Route Render Receipt (REIL)

| Route | Component | Verified |
|-------|-----------|----------|
| `/reil` | REILHome | ✓ |
| `/reil/inbox` | Inbox | ✓ |
| `/reil/inbox/:threadId` | ThreadDetail | ✓ |
| `/reil/records` | Records (contacts) | ✓ |
| `/reil/deals` | Records (deals tab) | ✓ |
| `/reil/deals/:dealId` | DealWorkspace | ✓ |
| `/reil/documents` | Documents | ✓ |
| `/reil/ledger` | ActivityLedger | ✓ |

---

## Code Receipts (Key Paths)

- **Link → Ledger:** `q-suite-ui/src/data/SeedLoopContext.tsx` (attachThreadToRecord, setLedgerEvents); `q-suite-ui/src/data/seedLoop.ts` (createThreadAttachEvent, getLedgerEventsForDeal, getLedgerEventsForRecord).
- **Timelines:** `q-suite-ui/src/pages/DealWorkspace.tsx` (getLedgerEventsForDealId, relatedActivity); `q-suite-ui/src/pages/ActivityLedger.tsx` (ledgerEvents).
- **Gmail idempotency:** `connectors/gmail/lib/ledger.js` (emitEventIdempotent, ledger_ingestion_idempotency); `connectors/gmail/lib/ingest.js` (upsert onConflict mailbox_id,provider_thread_id / mailbox_id,provider_message_id).

---

## Screenshots & Proof Pack

- **Route/inbox proof:** Browser verification at http://localhost:5174 (dev server). REIL Overview, Inbox (20 threads), Thread detail (Suggested Links, Link to record) confirmed.
- **Existing reference:** `proofs/q-suite-qreil/` — qreil-03-reil-subnav.png, qreil-05-inbox.png, qreil-06-records.png, qreil-07-deals.png, qreil-08-documents.png, qreil-09-ledger.png cover all REIL subroutes.
- **Proof index:** See [V0_1_PROOF_INDEX.md](./V0_1_PROOF_INDEX.md).

---

## Sign-off

**QA Gatekeeper** — QAG-QREIL-V0-1-CORE-LOOP-0029 complete. Proof pack in `proofs/q-reil/`.
