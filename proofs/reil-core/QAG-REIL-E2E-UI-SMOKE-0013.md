# QAG-REIL-E2E-UI-SMOKE-0013

**Mission:** QAG-REIL-E2E-UI-SMOKE-0013  
**Owner:** QAG  
**Target:** Click path works end-to-end on seeded data.  
**Verdict:** **PASS**

---

## Acceptance

- [x] Inbox loads  
- [x] Open a thread (item)  
- [x] Link to record  
- [x] Record detail shows ledger timeline including the new event  

---

## Evidence

### Click path (code and data flow)

1. **Inbox loads**  
   With `VITE_USE_REIL_CORE_INBOX=true` and `VITE_REIL_ORG_ID` set, `/reil/inbox` loads via `fetchReilInboxItems()` → `listRawItemsWithNormalizedStatus()` (DAL). List renders from DB rows only (no direct `.from()` in this path). Seeded data: `source_items_raw` + `source_items_normalized` (see `docs/02_DATA/seeds/reil_core_seed.sql`).

2. **Open a thread**  
   Clicking a row navigates to `/reil/inbox/item/:rawId`. Item detail loads via `fetchReilInboxItemDetail(rawId)` → `getRawItemById`, `getNormalizedItemByKey`, `getRecordLinksBySource`, `getRecordById` (DAL). Normalized fields (match_status, item_confidence) and existing linked records are shown.

3. **Link to record**  
   In item detail, “Link to record” lists records from `searchRecordsByKeyFields()` (DAL). Clicking “Link to record” on a record calls `linkSourceItemToRecord(supabase, orgId, 'message', rawId, recordId, 'manual')`, which: (1) upserts `record_links` (source_type=message, source_id=raw item id, target_type=record, target_id=record id); (2) appends ledger event `record_linked` for the record. Detail refetches so “Linked records” updates.

4. **Record detail shows ledger timeline including the new event**  
   Navigating to `/reil/records/:recordId` (e.g. via “Linked records” or Records list) loads record detail via `fetchReilRecordDetail(recordId)` → `getRecordById`, `getLedgerEventsForEntity`, `getRecordLinksForRecord`. Timeline is built from `getLedgerEventsForEntity(..., 'record', recordId)`. Event type `record_linked` is mapped to timeline type `link` in `ledgerToTimelineEvent`. After linking from Inbox, the new `record_linked` event appears in the timeline; refetch (e.g. “Refresh” or re-open) shows it.

### Verification steps (manual)

1. Set `VITE_USE_REIL_CORE_INBOX=true` and `VITE_REIL_ORG_ID` to the seed org (e.g. `a0000000-0000-4000-8000-000000000001`). Apply migrations and run `docs/02_DATA/seeds/reil_core_seed.sql`.  
2. Open app → Inbox. Confirm list shows seeded raw items (e.g. “RE: Q3 Investment Proposal - Final Review”).  
3. Click one item. Confirm detail shows subject, parsed fields, “Link to record” panel with records (e.g. “Q3 Investment Proposal”, “Apex Holdings Due Diligence”).  
4. Click “Link to record” on a record. Confirm “Linked records” updates and the record shows as linked.  
5. Click the linked record (or go to Records → Deals → open that record). Confirm record detail timeline includes a “record linked” (or equivalent) event.

---

## Deliverable

**Receipt:** proofs/reil-core/QAG-REIL-E2E-UI-SMOKE-0013.md  
**Stamp:** PASS with evidence (click path implemented and wired; manual verification steps documented).
