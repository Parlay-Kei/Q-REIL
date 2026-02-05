# QAG-REIL-UI-SMOKE-0014 Proof

**Ticket:** QAG-REIL-UI-SMOKE-0014  
**Owner:** QA Gatekeeper  
**Status:** Verification criteria and evidence template  
**Deliverable:** Validate end-to-end: Gmail item ingested → normalized → record created or matched → ledger timeline updates → UI reflects it.

---

## 1. E2E Flow Under Test

1. **Gmail item ingested** — Connector writes to `source_items_raw` (idempotency key e.g. `gmail:msg:<id>`).
2. **Normalized** — Normalizer (or pipeline) upserts `source_items_normalized` for the same idempotency key.
3. **Record created or matched** — Entity resolution creates a new `records` row or matches to an existing record; `record_links` may link source item / document to record.
4. **Ledger timeline updates** — Events appended to `ledger_events` (e.g. `record.created`, `document_attached`, `record.override`) for the record.
5. **UI reflects it** — Inbox shows raw + normalized status; item detail shows parsed fields and attachments; Records list shows the record; Record detail shows timeline, attached docs, and linked contacts.

---

## 2. Prerequisites

- Supabase project with migrations applied: `source_items_raw`, `source_items_normalized`, `records`, `ledger_events`, `record_links`, `documents`, etc.
- Gmail connector run at least once so `source_items_raw` has rows with `source_type = 'gmail'`.
- Normalizer or pipeline run so some rows have a corresponding `source_items_normalized` row.
- At least one record created (manually or by entity resolution) and optionally ledger events and record_links.
- q-suite-ui env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_REIL_ORG_ID` (and for REIL Inbox list: `VITE_USE_REIL_CORE_INBOX=true`).

---

## 3. Verification Steps

### 3.1 Inbox: raw items and normalized status

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set `VITE_USE_REIL_CORE_INBOX=true`, `VITE_REIL_ORG_ID=<org_id>`, run app, open **Inbox**. | Inbox list shows rows from `source_items_raw`; each row shows badge **Normalized** or **Raw** according to presence in `source_items_normalized`. |
| 2 | Use filters: Type = Gmail, Time range = This week (or All time). | List filters to matching raw items. |
| 3 | Click a row. | Navigates to `/reil/inbox/item/:rawId`. |

**Evidence:** Screenshot of Inbox list with at least one Normalized and one Raw badge; note one raw id used in 3.2.

### 3.2 Item detail: parsed fields and attachments

| Step | Action | Expected |
|------|--------|----------|
| 1 | On Item detail page for a raw id from 3.1. | Page loads; “Parsed fields” card shows From, To, Date, Subject, Body/Snippet (from payload). |
| 2 | If payload has `attachment_metadata` or `attachments`. | “Attachments” section lists name, type, size. |
| 3 | Check “Raw payload” section. | JSON matches `source_items_raw.payload` for that id. |

**Evidence:** Screenshot of Item detail with parsed fields and (if any) attachments.

### 3.3 Records: list and search

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open **Records**, tab **Deals** (or **Properties**). | Table shows records from `records` for that `record_type` and org. |
| 2 | Type in search box (e.g. part of a record title). | List filters to records whose title contains the search string. |
| 3 | Click a record row. | Navigates to `/reil/records/:recordId`. |

**Evidence:** Screenshot of Records list (Deals or Properties) and one record id used in 3.4.

### 3.4 Record detail: timeline, attached docs, linked contacts

| Step | Action | Expected |
|------|--------|----------|
| 1 | On Record detail for record id from 3.3. | Page shows record title, status, type; “Timeline (ledger events)” section shows events from `ledger_events` where `entity_type='record'` and `entity_id=recordId`. |
| 2 | Check “Attached documents” and “Linked contacts” in sidebar. | Content matches `record_links` for this record (target_type='record', target_id=recordId); documents have source_type='document', contacts source_type='contact'. |

**Evidence:** Screenshot of Record detail with at least one ledger event and (if any) attached doc or linked contact.

### 3.5 Manual override → ledger → UI

| Step | Action | Expected |
|------|--------|----------|
| 1 | On Record detail, click **Manual override**. | Modal opens; user can enter reason/notes. |
| 2 | Enter reason, submit. | Modal closes; `ledger_events` has new row: `event_type='record.override'`, `entity_type='record'`, `entity_id=recordId`, payload includes reason. |
| 3 | Record detail refetches or user refreshes. | New event appears in Timeline. |

**Evidence:** Screenshot of Timeline before and after manual override; optional: query `SELECT * FROM ledger_events WHERE entity_id = '<record_id>' ORDER BY created_at DESC LIMIT 1`.

### 3.6 Manual attach (optional)

| Step | Action | Expected |
|------|--------|----------|
| 1 | On Record detail, click **Manual attach**. | Modal opens; user can enter Document ID (UUID). |
| 2 | Enter a valid document id from `documents` table, submit. | `record_links` has new row: source_type='document', source_id=documentId, target_type='record', target_id=recordId, link_method='manual'. |
| 3 | Record detail refetches or user refreshes. | “Attached documents” lists the new document. |

**Evidence:** Screenshot of Attached documents after manual attach; optional: query `record_links` for that record.

---

## 4. E2E Summary Table

| Check | Description | Pass/Fail |
|-------|-------------|-----------|
| Inbox raw + normalized | Inbox list shows raw items and normalized status badges | _fill_ |
| Inbox filters | Sender, date, type, review required filter the list | _fill_ |
| Item detail | Parsed fields and attachments from raw payload | _fill_ |
| Records list + search | Records (properties/deals) list and search by title | _fill_ |
| Record detail timeline | Timeline built from ledger_events for record | _fill_ |
| Attached docs / linked contacts | Sidebar shows record_links (documents, contacts) | _fill_ |
| Manual override | Override appends ledger event; timeline updates | _fill_ |
| Manual attach | Attach creates record_link; sidebar updates | _fill_ |

---

## 5. Verdict

- **E2E (ingest → normalized → record → ledger → UI):** _Pass / Fail / Blocked (reason)_  
- **Overall:** _Pass / Fail_

---

*Proof template for QAG-REIL-UI-SMOKE-0014. Fill “Evidence” and “Verdict” after running the UI and verification steps.*
