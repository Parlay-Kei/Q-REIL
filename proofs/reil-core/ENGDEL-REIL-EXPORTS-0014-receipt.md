# ENGDEL-REIL-EXPORTS-0014 Receipt

**Mission:** ENGDEL-REIL-EXPORTS-0014  
**Owner:** ENGDEL  
**Status:** Implemented  
**Deliverable:** Deterministic export for records and ledger (CSV and JSON); required fields present; deterministic ordering.

---

## 1. Acceptance

- [x] **Export CSV and JSON**  
  Records list: Export CSV and Export JSON buttons (Records page, Deals/Properties tabs). Record detail: Export ledger CSV and Export ledger JSON. Documents page: Export CSV and Export JSON. All use `reilExport.ts` helpers.

- [x] **Required fields present**  
  Records: id, org_id, record_type, record_type_id, title, status, owner_id, tags, created_at, updated_at. Ledger events: id, org_id, actor_id, actor_type, event_type, entity_type, entity_id, payload, correlation_id, created_at. Documents: id, org_id, created_by_user_id, name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, created_at, updated_at.

- [x] **Deterministic ordering**  
  All export functions sort rows by `id` (localeCompare) before building CSV or JSON so the same data produces the same file every time.

---

## 2. Implemented Changes

- **reilExport.ts:** Added `sortById()` helper; applied to `recordsToCsv`, `ledgerEventsByRecordToCsv`, `documentsToCsv` before iterating. Added `recordsToJson`, `ledgerEventsToJson`, `documentsToJson` (sorted by id) and `downloadJson()`.
- **Records.tsx:** Export JSON button next to Export CSV (Deals/Properties).
- **RecordDetail.tsx:** Export ledger JSON button next to Export ledger CSV.
- **Documents.tsx:** Export JSON button next to Export CSV (when REIL org set).

---

## 3. File Summary

| File | Role |
|------|------|
| `q-suite-ui/src/lib/reilExport.ts` | sortById; recordsToCsv/recordsToJson; ledgerEventsByRecordToCsv, ledgerEventsToJson; documentsToCsv/documentsToJson; downloadCsv, downloadJson |
| `q-suite-ui/src/pages/Records.tsx` | Export CSV + Export JSON (records) |
| `q-suite-ui/src/pages/RecordDetail.tsx` | Export ledger CSV + Export ledger JSON |
| `q-suite-ui/src/pages/Documents.tsx` | Export CSV + Export JSON (documents) |

---

**Receipt:** proofs/reil-core/ENGDEL-REIL-EXPORTS-0014-receipt.md
