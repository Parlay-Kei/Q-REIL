# QAG-REIL-AUDIT-EXPORT-QA-0016 Proof

**Ticket:** QAG-REIL-AUDIT-EXPORT-QA-0016  
**Owner:** QA Gatekeeper  
**Status:** Verification criteria and evidence template  
**Deliverable:** Confirm exports are consistent with ledger and record state.

---

## 1. Scope

Exports implemented under ENGDEL-REIL-EXPORTS-0015 must reflect the same data as the canonical tables:

- **Records CSV** ↔ `public.records` (for the org and filters applied).
- **Ledger events by record CSV** ↔ `public.ledger_events` where `entity_type = 'record'` and `entity_id = recordId`.
- **Documents list CSV** ↔ `public.documents` (for the org).

Consistency means: row counts and key fields in the CSV match the database at the time of export; no extra or missing rows due to export logic.

---

## 2. Prerequisites

- Supabase project with migrations applied: `records` (00036), `documents` (00037), `ledger_events` (00038).
- q-suite-ui env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_REIL_ORG_ID`.
- At least one record and optionally ledger events and documents for the org (for non-empty export checks).

---

## 3. Verification Steps

### 3.1 Records export consistency

| Step | Action | Expected |
|------|--------|----------|
| 1 | In DB: note count and ids of `records` for org where `record_type = 'deal'` (or `'property'`). | e.g. `SELECT id, title, status, updated_at FROM records WHERE org_id = :org_id AND record_type = 'deal' ORDER BY updated_at DESC;` |
| 2 | In UI: open **Records**, tab **Deals** (or **Properties**), click **Export CSV**. | CSV downloads; filename like `reil-records-deal-YYYY-MM-DD.csv`. |
| 3 | Open CSV; check header row. | Header is: `id`, `org_id`, `record_type`, `record_type_id`, `title`, `status`, `owner_id`, `tags`, `created_at`, `updated_at`. |
| 4 | Compare CSV row count to DB. | Number of data rows in CSV = number of rows returned by the same query (org + record_type; UI uses same filters: title search if applied). |
| 5 | Spot-check one record: pick id from DB, find row in CSV. | Same `id`, `title`, `status`, `updated_at` (and other columns) as in DB. |

**Evidence:**

| Check | Expected | Actual |
|-------|----------|--------|
| CSV row count matches DB (Deals) | _N_ rows | _fill_ |
| Spot-check record id _uuid_ | Same title, status, updated_at | _fill_ |

---

### 3.2 Ledger events by record export consistency

| Step | Action | Expected |
|------|--------|----------|
| 1 | In DB: pick a record id that has ledger events. Query: `SELECT id, event_type, entity_id, created_at FROM ledger_events WHERE org_id = :org_id AND entity_type = 'record' AND entity_id = :record_id ORDER BY created_at DESC;` | Note count and one event id. |
| 2 | In UI: open **Records** → click that record → **Export ledger CSV**. | CSV downloads; filename like `reil-ledger-events-{recordId}-YYYY-MM-DD.csv`. |
| 3 | Open CSV; check header. | Header includes: `record_id`, `record_title`, `id`, `event_type`, `entity_type`, `entity_id`, `created_at`, `payload_json`. |
| 4 | Compare CSV row count to DB. | Number of data rows = count of ledger_events for that record (entity_type='record', entity_id=record_id). |
| 5 | Spot-check one event: find event id in CSV. | `record_id` = record id; `entity_id` = same record id; `event_type`, `created_at` match DB; `payload_json` is JSON string of payload. |

**Evidence:**

| Check | Expected | Actual |
|-------|----------|--------|
| CSV row count matches DB for record _uuid_ | _N_ events | _fill_ |
| Spot-check event id _uuid_ | Same event_type, entity_id, created_at | _fill_ |

---

### 3.3 Documents list export consistency

| Step | Action | Expected |
|------|--------|----------|
| 1 | In DB: `SELECT id, name, document_type, storage_path, created_at FROM documents WHERE org_id = :org_id ORDER BY updated_at DESC LIMIT 500;` | Note count. |
| 2 | In UI: open **Documents**, click **Export CSV** (button visible when `VITE_REIL_ORG_ID` is set). | CSV downloads; filename like `reil-documents-YYYY-MM-DD.csv`. |
| 3 | Open CSV; check header. | Header includes: `id`, `org_id`, `name`, `document_type`, `storage_path`, `storage_bucket`, `mime_type`, `file_size`, `tags`, `created_at`, `updated_at`. |
| 4 | Compare CSV row count to DB. | Number of data rows = number of documents for org (up to limit 500). |
| 5 | Spot-check one document id. | Same `id`, `name`, `storage_path`, `created_at` in CSV as in DB. |

**Evidence:**

| Check | Expected | Actual |
|-------|----------|--------|
| CSV row count matches DB (documents) | _N_ rows | _fill_ |
| Spot-check document id _uuid_ | Same name, storage_path, created_at | _fill_ |

---

## 4. Consistency Invariants

| Invariant | How to confirm |
|-----------|-----------------|
| Records export uses same org and filters as list | Records tab shows same records as list; export runs on that list. |
| Ledger export uses same record and events as detail | Record detail timeline and export both use `fetchReilRecordDetail(recordId)` → same `ledgerEvents`. |
| Documents export uses same org and table | Documents export calls `fetchReilDocuments()` → `listDocuments(supabase, org_id)` → same `documents` table. |
| No transformation that drops or invents rows | CSV builders iterate over fetched arrays; no filtering beyond what API returns. |
| Timestamps and IDs preserved | CSV columns include `id`, `created_at`, `updated_at` (where applicable); payload as JSON string. |

---

## 5. Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| QA Gatekeeper | _fill_ | _fill_ | PASS / FAIL |

**Notes:** _fill after run._
