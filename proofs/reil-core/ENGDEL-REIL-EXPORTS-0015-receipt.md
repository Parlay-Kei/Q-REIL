# ENGDEL-REIL-EXPORTS-0015 Receipt

**Ticket:** ENGDEL-REIL-EXPORTS-0015  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** CSV export for records, ledger events by record, and documents list.

---

## 1. Implemented Exports

### 1.1 Records CSV export

- **Location:** Records page (`q-suite-ui/src/pages/Records.tsx`) when tab is **Properties** or **Deals** and REIL records are loaded.
- **Trigger:** "Export CSV" button in the header; exports the current filtered list of records for the active tab.
- **Columns:** `id`, `org_id`, `record_type`, `record_type_id`, `title`, `status`, `owner_id`, `tags` (semicolon-separated), `created_at`, `updated_at`.
- **Implementation:** `recordsToCsv(records)` and `downloadCsv(csv, filename)` in `q-suite-ui/src/lib/reilExport.ts`; filename pattern `reil-records-{property|deal}-{date}.csv`.

### 1.2 Ledger events by record CSV export

- **Location:** Record detail page (`q-suite-ui/src/pages/RecordDetail.tsx`).
- **Trigger:** "Export ledger CSV" button in the header; exports ledger events for the current record.
- **Columns:** `record_id`, `record_title`, `id`, `org_id`, `actor_id`, `actor_type`, `event_type`, `entity_type`, `entity_id`, `payload_json`, `correlation_id`, `created_at`.
- **Implementation:** `ledgerEventsByRecordToCsv(recordId, recordTitle, events)` in `reilExport.ts`; filename pattern `reil-ledger-events-{recordId}-{date}.csv`. Data comes from `fetchReilRecordDetail(recordId)` (same source as the timeline).

### 1.3 Documents list CSV export

- **Location:** Documents page (`q-suite-ui/src/pages/Documents.tsx`) when `VITE_REIL_ORG_ID` is set.
- **Trigger:** "Export CSV" button in the header; fetches documents from the API and downloads CSV.
- **Columns:** `id`, `org_id`, `created_by_user_id`, `name`, `document_type`, `storage_path`, `storage_bucket`, `mime_type`, `file_size`, `tags` (semicolon-separated), `created_at`, `updated_at`.
- **Implementation:** `fetchReilDocuments()` in `reilRecordsApi.ts` (uses new DAL `listDocuments()`), `documentsToCsv(documents)` and `downloadCsv()` in `reilExport.ts`; filename pattern `reil-documents-{date}.csv`.

---

## 2. DAL and API Additions

| Function | File | Description |
|----------|------|-------------|
| `listDocuments` | `reilDal.ts` | List documents for org; optional `documentType`, `limit` (default 500). |
| `fetchReilDocuments` | `reilRecordsApi.ts` | Fetch documents list for default org; optional filters. |

---

## 3. Export Library

| File | Functions |
|------|-----------|
| `q-suite-ui/src/lib/reilExport.ts` | `recordsToCsv`, `ledgerEventsByRecordToCsv`, `documentsToCsv`, `downloadCsv` |

- CSV escaping: cells containing `"`, `\r`, or `\n` are quoted; internal `"` doubled.
- All exports use UTF-8 and `\r\n` line endings for compatibility.

---

## 4. Configuration

| Env | Purpose |
|-----|---------|
| `VITE_REIL_ORG_ID` | Required for records and documents export; ledger export uses record detail (same org). |

---

## 5. File Summary

| File | Role |
|------|------|
| `q-suite-ui/src/lib/reilDal.ts` | `listDocuments` added |
| `q-suite-ui/src/lib/reilRecordsApi.ts` | `fetchReilDocuments` added |
| `q-suite-ui/src/lib/reilExport.ts` | CSV builders and download helper |
| `q-suite-ui/src/pages/Records.tsx` | Export CSV button (properties/deals) |
| `q-suite-ui/src/pages/RecordDetail.tsx` | Export ledger CSV button |
| `q-suite-ui/src/pages/Documents.tsx` | Export CSV button (when org set) |

---

## 6. Acceptance

- [x] CSV export for records (current tab list).
- [x] CSV export for ledger events by record (current record’s events).
- [x] CSV export for documents list (from `documents` table).
- [x] Exports consistent with canonical data model (records, ledger_events, documents).
- [x] Receipt document (this file).
