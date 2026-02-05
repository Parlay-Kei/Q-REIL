# ENGDEL-REIL-RECORDS-UI-0012 Receipt

**Mission:** ENGDEL-REIL-RECORDS-UI-0012  
**Owner:** ENGDEL  
**Status:** Implemented  
**Deliverable:** Record detail shows documents, links, and timeline. Any change produces ledger events.

---

## 1. Acceptance

- [x] **Records list and record detail render from DB rows**  
  Records list (Deals / Properties tabs) loads via `fetchReilRecords()` → `searchRecordsByKeyFields()` (DAL). Record detail loads via `fetchReilRecordDetail(recordId)` → `getRecordById`, `getLedgerEventsForEntity`, `getRecordLinksForRecord` (DAL). No mock data for records list when `VITE_REIL_ORG_ID` is set.

- [x] **Document attach creates a documents row and appends document_attached**  
  Manual attach uses `attachDocumentToRecord()` (inserts `record_links` with source_type=document, target_type=record) and `appendRecordLedgerEvent(recordId, 'document_attached', { document_id, record_id, link_method })`. Record detail refetches so timeline and documents panel update.

- [x] **Manual override appends record.override and shows in timeline**  
  Manual override modal calls `appendRecordLedgerEvent(recordId, 'record.override', { reason, action: 'manual_override' })`. Timeline reads ledger via `getLedgerEventsForEntity(..., 'record', recordId)` and includes `record.override`; `ledgerToTimelineEvent` maps it to timeline type `user`. Refetch after override so the new event appears.

- [x] **Documents panel reads documents; links panel reads record_links**  
  Record detail sidebar: **Attached documents** card shows `record_links` where `source_type === 'document'`; document names resolved via `getDocumentById()` from `documents` table when available (fallback: source_id). **Linked contacts** (and other link types) show `record_links` where target is this record (source_type contact, message, etc.).

- [x] **Timeline reads ledger timeline service and refreshes after actions**  
  Timeline is built from `detail.ledgerEvents` (DAL `getLedgerEventsForEntity`). After manual attach, manual override, or Inbox “Link to record” (record_linked), record detail calls `refetch()` so `fetchReilRecordDetail` runs again and the new ledger event appears. Event types mapped: `record_linked` → link, `record.override` → user, `document_attached` → document, etc.

---

## 2. Implemented Changes (this pass)

- **reilDal.ts:** Added `getDocumentById(client, orgId, documentId)` for resolving document names in the documents panel.
- **RecordDetail.tsx:** Documents panel now resolves document names via `getDocumentById` for each attached document link; timeline type map extended with `record_linked` (→ link) and `record.override` (→ user) so Inbox “Link to record” and manual override events display correctly. Timeline refreshes after attach and override via existing `refetch()`.

---

## 3. File Summary

| File | Role |
|------|------|
| `q-suite-ui/src/lib/reilDal.ts` | `getDocumentById`; `getRecordLinksForRecord`, `getLedgerEventsForEntity`, `listDocuments` (existing) |
| `q-suite-ui/src/lib/reilRecordsApi.ts` | `fetchReilRecordDetail`, `attachDocumentToRecord`, `appendRecordLedgerEvent` |
| `q-suite-ui/src/pages/Records.tsx` | Records list from `fetchReilRecords` (Deals/Properties); row click → RecordDetail |
| `q-suite-ui/src/pages/RecordDetail.tsx` | Record header; timeline from ledger; documents panel (record_links + document names); links panel (record_links); manual attach/override modals; refetch after actions |

---

## 4. Configuration

| Env | Purpose |
|-----|---------|
| `VITE_REIL_ORG_ID` | Default org_id for REIL Core. Required for records list and record detail. |

---

**Receipt:** proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0012-receipt.md
