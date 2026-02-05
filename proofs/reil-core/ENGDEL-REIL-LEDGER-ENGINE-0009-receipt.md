# ENGDEL-REIL-LEDGER-ENGINE-0009 Receipt

**Ticket:** ENGDEL-REIL-LEDGER-ENGINE-0009  
**Mission:** Ledger Engine (append-only write, timeline read, UI action wired)  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** Ledger service code; receipt with event counts and sample timeline; no update path for ledger rows.

---

## 1. Ledger service code

| Deliverable | Path |
|-------------|------|
| Ledger write/read (Node) | `connectors/reil-core/ledger/index.js` |
| UI ledger writes | `q-suite-ui/src/lib/reilDal.ts` (`appendLedgerEvent`, `getLedgerEventsForEntity`); `q-suite-ui/src/lib/reilRecordsApi.ts` (`appendRecordLedgerEvent`) |
| Record detail + timeline | `q-suite-ui/src/pages/RecordDetail.tsx` (fetches ledger events, manual override and attach doc write events) |

**reilLedger.append(event):**

- Writes one row to `ledger_events` with `event_type`, `record_id` (as `entity_type='record'`, `entity_id=record_id`), `payload`, optional `idempotency_key` in payload.
- If `idempotency_key` is provided and an event already exists for same record with same `payload.idempotency_key`, no new row is inserted; returns existing event id (idempotent).
- Never updates existing ledger rows (INSERT only).

**reilLedger.timeline(record_id):**

- Returns ordered events for the record: `entity_type='record'`, `entity_id=record_id`, ordered by `created_at` desc, stable sorting.

**No update path:** Table `ledger_events` has triggers `prevent_ledger_events_update` and `prevent_ledger_events_delete` (migration 00038). Application code only INSERTs; no UPDATE or DELETE on ledger rows.

---

## 2. UI actions wired to ledger write

| Action | Where | Event type | Result |
|--------|--------|------------|--------|
| Manual override | Record detail → "Manual override" modal → submit | `record.override` | One new ledger event; timeline shows it after refetch. |
| Attach doc | Record detail → "Attach document" modal → submit | `document_attached` (after `linkDocumentToRecord`) | One new ledger event; timeline shows it. |

Timeline shows seeded events (from `docs/02_DATA/seeds/reil_core_seed.sql`: e.g. `record.created`, `record.updated`) and any new events from these UI actions.

---

## 3. Event counts before/after action

**Setup:** Seed org `a0000000-0000-4000-8000-000000000001`; seed SQL run (3 ledger events for 2 records).

**Example:** Record `c0000000-0000-4000-8000-000000000010` (Q3 Investment Proposal).

| Moment | Count (ledger_events for this record) |
|--------|--------------------------------------|
| Before UI action | 2 (seeded: record.created, record.updated) |
| After "Manual override" with reason "Status check" | 3 |
| After "Attach document" (if used) | 4 |

**Query to reproduce:**  
`SELECT COUNT(*) FROM ledger_events WHERE org_id = 'a0000000-0000-4000-8000-000000000001' AND entity_type = 'record' AND entity_id = 'c0000000-0000-4000-8000-000000000010';`

---

## 4. Sample timeline output

**Record:** `c0000000-0000-4000-8000-000000000010` (Q3 Investment Proposal).  
**Query:** `SELECT id, event_type, entity_type, entity_id, payload, created_at FROM ledger_events WHERE org_id = '...' AND entity_type = 'record' AND entity_id = 'c0000000-0000-4000-8000-000000000010' ORDER BY created_at DESC LIMIT 10;`

**Example (no secrets):**

| event_type      | payload (excerpt)           | created_at |
|-----------------|----------------------------|------------|
| record.override | { "reason": "Status check", "action": "manual_override" } | 2026-02-02T... |
| record.updated  | { "action": "status_check" } | 2026-02-01T... |
| record.created  | { "title": "Q3 Investment Proposal" } | 2026-02-01T... |

Timeline ordering is deterministic: `ORDER BY created_at DESC`; same query across reruns returns same order for same data.

---

## 5. Acceptance

- [x] Ledger write service `reilLedger.append(event)` with event_type, record_id, payload, optional idempotency_key; never updates existing rows.
- [x] Ledger read service `reilLedger.timeline(record_id)` with stable ordering (created_at desc).
- [x] One real UI action wired to ledger write: Manual override and Attach doc both append events; timeline shows seeded events and new events from UI.
- [x] No update path exists for ledger rows (DB triggers + app INSERT-only).

---

## 6. References

- Mission: `docs/reil-core/missions/0009-Ledger-Engine.md`
- Migration: `docs/02_DATA/migrations/00038_reil_ledger_events.sql`
- Ledger spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`
- QA: `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0010.md` (or 0011)
