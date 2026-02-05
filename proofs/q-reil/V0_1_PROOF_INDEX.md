# V0.1 Core Loop Proof Index

**Mission:** QAG-QREIL-V0-1-CORE-LOOP-0029  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-31

---

## Deliverables

| Document | Purpose |
|----------|---------|
| [V0_1_QA_VERDICT.md](./V0_1_QA_VERDICT.md) | QA verdict and criteria verification for v0.1 core loop. |
| [V0_1_PROOF_INDEX.md](./V0_1_PROOF_INDEX.md) | This index: proofs, screenshots, and receipts. |
| [LINK_LEDGER_RECEIPT.md](./LINK_LEDGER_RECEIPT.md) | Receipt: linking thread to record writes ledger event. |
| [GMAIL_IDEMPOTENCY_RECEIPT.md](./GMAIL_IDEMPOTENCY_RECEIPT.md) | Receipt: Gmail ingestion rerun yields zero duplicates. |

---

## Proof Types

### 1. UI / Route proof

- **Live check:** Dev server http://localhost:5174 (or 5173). Navigated to `/reil`, `/reil/inbox`, `/reil/inbox/thr-001`, sidebar and content confirmed.
- **Screenshots (reference):** Existing Q REIL package proof pack in `../q-suite-qreil/`:
  - `qreil-03-reil-subnav.png` — REIL Overview and subnav (Overview, Inbox, Records, Deals, Documents, Ledger).
  - `qreil-05-inbox.png` — Inbox route and thread list.
  - `qreil-06-records.png` — Records route.
  - `qreil-07-deals.png` — Deals route.
  - `qreil-08-documents.png` — Documents route.
  - `qreil-09-ledger.png` — Ledger (Activity Ledger) route.
- **Thread detail:** Navigated to `/reil/inbox/thr-001`; page shows thread subject, messages, and Suggested Links panel with “Link to record” for Meridian Capital Partners (deal).

### 2. Link → ledger event receipt

- **Source:** `q-suite-ui/src/data/SeedLoopContext.tsx`, `q-suite-ui/src/data/seedLoop.ts`.
- **Flow:** ThreadDetail “Link to record” → `handleLinkRecord(match.recordId, match.type, match.name)` → `attachThreadToRecord(threadId, recordType, recordId, recordName, thread.subject)` → `createThreadAttachEvent(...)` → `setLedgerEvents(prev => [evt, ...prev])`.
- **Event:** `type: 'email'`, `title: 'Thread attached to record'`, `references: [threadId, recordId]`, `metadata: { action: 'manual-link' }`.

### 3. Record / Deal timelines from ledger

- **Source:** `q-suite-ui/src/pages/DealWorkspace.tsx`, `q-suite-ui/src/data/seedLoop.ts`.
- **Deal:** `getLedgerEventsForDealId(dealId)` → `getLedgerEventsForDeal(dealId, ledgerEvents)`; timeline shows events whose `references` include the dealId or matching dealName.
- **Record:** `getLedgerEventsForRecordId(recordId, recordType)` filters by `e.references.includes(recordId)`. New link event is in `ledgerEvents`, so Ledger page and Deal/Record timelines update.

### 4. Gmail ingestion zero-duplicates receipt

- **Source:** `connectors/gmail/lib/ingest.js`, `connectors/gmail/lib/ledger.js`.
- **Threads/messages:** `upsert` with `onConflict: 'mailbox_id,provider_thread_id'` (threads), `onConflict: 'mailbox_id,provider_message_id'` (messages). Rerun = update in place, no duplicate rows.
- **Events:** `emitEventIdempotent` reads `ledger_ingestion_idempotency` by `idempotency_key`; if present, returns existing `event_id` and does not insert. Keys: `gmail:thread:{mailboxId}:{providerThreadId}`, `gmail:message:{mailboxId}:{providerMessageId}`, etc. Rerun with same mailbox/threads = same keys = zero new events.

---

## Screenshot List (V0.1)

| # | Filename | Location | Purpose |
|---|----------|----------|---------|
| 1 | qreil-03-reil-subnav.png | ../q-suite-qreil/ | REIL routes / Overview + subnav. |
| 2 | qreil-05-inbox.png | ../q-suite-qreil/ | Inbox loads threads (20 seeded). |
| 3 | qreil-06-records.png | ../q-suite-qreil/ | Records route. |
| 4 | qreil-07-deals.png | ../q-suite-qreil/ | Deals route. |
| 5 | qreil-08-documents.png | ../q-suite-qreil/ | Documents route. |
| 6 | qreil-09-ledger.png | ../q-suite-qreil/ | Ledger route (timeline/table from ledger). |

Additional live verification: Thread detail (`/reil/inbox/thr-001`) and Suggested Links / “Link to record” confirmed via browser during QA run.

---

## Environment

- **App:** q-suite-ui (Vite + React), SeedLoopProvider.
- **Connector:** connectors/gmail (Node, Supabase, Gmail API).
- **Base URL:** http://localhost:5174/ (or 5173).
- **Date:** 2026-01-31.
