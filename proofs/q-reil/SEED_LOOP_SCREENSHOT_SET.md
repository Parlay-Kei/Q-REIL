# Seed Loop Screenshot Set

**Mission:** ENGDEL-QREIL-SEED-LOOP-UI-0027  
**Deliverable:** Seeded loop working in UI + proof screenshot set  
**Date:** 2026-01-31

---

## Overview

The seed loop populates the REIL UI with a deterministic dataset and wires all REIL pages to render from it via data contracts. This document defines the screenshot set used to prove the seed loop works end-to-end.

---

## Dataset Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Threads | 20 | With messages and attachments |
| Records | 25 | 8 contacts, 6 companies, 4 properties, 8 deals |
| Deals | 8 | Linked to properties and companies |
| Ledger events | 6+ | Seed set; grows when thread attached to record |

---

## Screenshot Set

Capture the following views to verify the seed loop and data flow.

### 1. Inbox (`/reil/inbox`)

- **File:** `seed-loop-01-inbox.png`
- **Content:** Thread list showing 20 threads; mix of linked (e.g. Deal: Apex Holdings, Contact: David Kim) and Unlinked; attachment counts and labels visible.
- **Proof:** Threads and linked status from seed dataset.

### 2. Thread detail – messages and attachments (`/reil/inbox/thr-001`)

- **File:** `seed-loop-02-thread-detail.png`
- **Content:** Single thread with message stack and attachments; Suggested Links panel on the right.
- **Proof:** Thread detail shows messages and attachments from seed; panel shows suggested records.

### 3. Thread attached to record – ledger + UI update (`/reil/inbox/thr-001`)

- **File:** `seed-loop-03-thread-linked.png`
- **Content:** Same thread after clicking “Link to record” on a suggested match; badge shows linked record (e.g. Deal: Meridian Capital Partners); Audit Trail status shows linked.
- **Proof:** Attach thread to record writes ledger event and updates UI (thread shows linked).

### 4. Ledger – events table (`/reil/ledger`)

- **File:** `seed-loop-04-ledger-table.png`
- **Content:** Activity Ledger table view with seed events; newest “Thread attached to record” event at top if step 3 was performed.
- **Proof:** Ledger events table renders from seed + appended attach events.

### 5. Ledger – event detail (`/reil/ledger`)

- **File:** `seed-loop-05-ledger-detail.png`
- **Content:** Event detail drawer open for one event (e.g. “Thread attached to record” or “Document linked to Deal”); metadata and references visible.
- **Proof:** Event detail shows structured data and references.

### 6. Records – 25 across types (`/reil/records`)

- **File:** `seed-loop-06-records.png`
- **Content:** Records page with tabs Contacts (8), Companies (6), Properties (4), Deals (8); one tab selected with table populated.
- **Proof:** 25 records across types from seed.

### 7. Deals list and deal detail (`/reil/deals`, `/reil/deals/deal-001`)

- **File:** `seed-loop-07-deals.png`, `seed-loop-08-deal-workspace.png`
- **Content:** Deals tab with 8 deals; deal detail for one deal (e.g. Meridian Capital Partners) with Activity Timeline built from ledger events.
- **Proof:** Deal list and deal detail with timeline from ledger.

---

## How to Capture

1. Start the app with seed loop enabled (default: `SeedLoopProvider` wraps the app).
2. Navigate in order: Inbox → open thread → link to record → Ledger → Records → Deals → open a deal.
3. Capture each view as listed; name files as in the table.
4. Place screenshots in `proofs/q-reil/` (e.g. `seed-loop-01-inbox.png`).

---

## Data Contracts (reference)

- **Inbox:** `ThreadSummary[]` – id, subject, from, preview, timestamp, isUnread, hasAttachments, attachmentCount, linkedRecord, labels.
- **Thread detail:** `ThreadDetailData` – extends ThreadSummary with `messages: ThreadMessage[]`; each message has attachments.
- **Attach action:** `attachThreadToRecord(threadId, recordType, recordId, recordName, threadSubject)` → updates thread link state and appends `LedgerEvent` (type `email`, title “Thread attached to record”).
- **Ledger:** `LedgerEvent[]` – id, type, title, description, actor, timestamp, references, metadata.
- **Records:** `RecordSummary[]` (Contact | Company | Property | Deal) – 25 total.
- **Deal detail:** `DealDetail` + timeline = `getLedgerEventsForDealId(dealId)`.

---

## Status

- [x] Seeded dataset loader (20 threads, 25 records, 8 deals, ledger events)
- [x] REIL pages wired to data contracts
- [x] `/reil/inbox` – threads and linked status
- [x] Thread detail – messages and attachments
- [x] Attach thread to record – ledger event + UI update
- [x] `/reil/ledger` – events table and event detail
- [x] Record and deal list – 25 records, 8 deals
- [x] Deal detail – timeline from ledger events
- [ ] Screenshots captured and committed (manual step)
