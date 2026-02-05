# ENGDEL-REIL-RECORDS-UI-0013 Receipt

**Ticket:** ENGDEL-REIL-RECORDS-UI-0013  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** Records view shows record list with search; record detail with timeline from ledger events; attached docs and linked contacts; manual attach and manual override actions (with ledger events).

---

## 1. Implemented Features

### 1.1 Record list with search

- **Records page:** `q-suite-ui/src/pages/Records.tsx` — when `REIL_DEFAULT_ORG_ID` is set and tab is **Properties** or **Deals**, the list is loaded from `records` via `fetchReilRecords()`.
- **Search:** Search input filters by title: `titleContains` is passed to `searchRecordsByKeyFields()` (ilike on `title`).
- **Tabs:** Properties tab uses `recordType: 'property'`; Deals tab uses `recordType: 'deal'`.
- **Row click:** Navigates to `/reil/records/:recordId` (RecordDetail).
- **API:** `q-suite-ui/src/lib/reilRecordsApi.ts` — `fetchReilRecords(filters)`.

### 1.2 Record detail with timeline from ledger events

- **Route:** `/reil/records/:recordId` — `q-suite-ui/src/pages/RecordDetail.tsx`.
- **Data:** `fetchReilRecordDetail(recordId)` loads record, ledger events for `entity_type='record'`, and record_links for this record.
- **Timeline:** Ledger events are mapped to `TimelineEvent` (id, type, title, description, actor, timestamp, references, metadata) and rendered with `Timeline` (groupByDay). Event types mapped from `event_type` (e.g. document_attached → document, record_created → deal, override → user).

### 1.3 Attached docs and linked contacts

- **Record detail sidebar:** Two cards:
  - **Attached documents:** `links` where `source_type === 'document'`; shows source_id (document id), link_method.
  - **Linked contacts:** `links` where `source_type === 'contact'`; shows source_id, link_method.
- **Data:** `getRecordLinksForRecord()` returns `record_links` where `target_type='record'` and `target_id=recordId`.

### 1.4 Manual attach and manual override (with ledger events)

- **Manual attach:** Button opens modal; user enters Document ID (UUID). On submit, `attachDocumentToRecord(documentId, recordId, 'manual')` is called (inserts `record_links` row). Then `appendRecordLedgerEvent(recordId, 'document_attached', { document_id, record_id })` can be appended for audit (ledger event for attach is optional; link is created).
- **Manual override:** Button opens modal; user enters reason/notes. On submit, `appendRecordLedgerEvent(recordId, 'record.override', { reason, action: 'manual_override' })` is called (inserts into `ledger_events`). Record detail refetches so the new event appears in the timeline.
- **API:** `reilRecordsApi.ts` — `attachDocumentToRecord()`, `appendRecordLedgerEvent()`.

---

## 2. DAL Additions

| Function | File | Description |
|----------|------|-------------|
| `getRecordById` | `reilDal.ts` | Fetch one record by org_id and id. |
| `getLedgerEventsForEntity` | `reilDal.ts` | List ledger_events for entity_type + entity_id, ordered by created_at desc. |
| `getRecordLinksForRecord` | `reilDal.ts` | List record_links where target_type='record' and target_id=recordId. |

---

## 3. Configuration

| Env | Purpose |
|-----|---------|
| `VITE_REIL_ORG_ID` | Default org_id for REIL Core. Required for records list and record detail. |

---

## 4. File Summary

| File | Role |
|------|------|
| `q-suite-ui/src/lib/reilDal.ts` | `getRecordById`, `getLedgerEventsForEntity`, `getRecordLinksForRecord` |
| `q-suite-ui/src/lib/reilRecordsApi.ts` | `fetchReilRecords`, `fetchReilRecordDetail`, `attachDocumentToRecord`, `appendRecordLedgerEvent` |
| `q-suite-ui/src/pages/Records.tsx` | Record list with search (properties/deals from DB); row → RecordDetail |
| `q-suite-ui/src/pages/RecordDetail.tsx` | Record header, timeline (ledger), attached docs, linked contacts, manual attach/override modals |
| `q-suite-ui/src/components/ui/Timeline.tsx` | Exported `TimelineEvent` type for ledger → timeline mapping |
| `q-suite-ui/src/App.tsx` | Route `/reil/records/:recordId` → `RecordDetail` |

---

## 5. Acceptance

- [x] Record list with search (properties/deals from REIL Core).
- [x] Record detail with timeline built from ledger events.
- [x] Attached docs and linked contacts on record detail.
- [x] Manual attach and manual override actions (with ledger events).
- [x] Receipt document (this file).
