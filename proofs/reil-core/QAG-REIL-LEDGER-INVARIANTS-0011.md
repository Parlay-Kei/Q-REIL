# QAG-REIL-LEDGER-INVARIANTS-0011 Proof

**Ticket:** QAG-REIL-LEDGER-INVARIANTS-0011  
**Owner:** QA Gatekeeper  
**Status:** Verification criteria and evidence template  
**Deliverable:** Validation of append-only behavior and idempotency keys for the REIL ledger.

---

## 1. Prerequisites

- Supabase project with migration `00038_reil_ledger_events.sql` applied.
- Table `public.ledger_events` exists with triggers `prevent_ledger_events_update` and `prevent_ledger_events_delete`.
- Spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`.
- For idempotency validation: either table `ledger_ingestion_idempotency` (if present) or application code that uses idempotency keys (e.g. in payload or side table) when writing ledger events from ingestion.

---

## 2. Append-Only Behavior

### 2.1 UPDATE is rejected

**Step:** Attempt to UPDATE any row in `ledger_events`.

**Example (run as service role or role that can write):**

```sql
-- Insert one row to get a valid id
INSERT INTO public.ledger_events (org_id, actor_type, event_type, entity_type, entity_id)
SELECT id, 'system', 'record_created', 'record', gen_random_uuid() FROM public.orgs LIMIT 1
RETURNING id;
-- Then (replace :id with returned id):
UPDATE public.ledger_events SET payload = '{"test": true}' WHERE id = :id;
```

**Expected:** The UPDATE raises an exception (e.g. "ledger_events is append-only. UPDATE and DELETE are not allowed."). No row is modified.

**Evidence table:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| UPDATE rejected | `UPDATE ledger_events SET payload = '{}' WHERE id = :id` | Exception, no row updated | _fill after run_ |

---

### 2.2 DELETE is rejected

**Step:** Attempt to DELETE any row in `ledger_events`.

**Example:**

```sql
DELETE FROM public.ledger_events WHERE id = :id;
```

**Expected:** The DELETE raises an exception. No row is removed.

**Evidence table:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| DELETE rejected | `DELETE FROM ledger_events WHERE id = :id` | Exception, no row deleted | _fill after run_ |

---

### 2.3 INSERT succeeds and sets timestamp

**Step:** INSERT a new row. Verify `created_at` is set and row is readable.

**Example:**

```sql
INSERT INTO public.ledger_events (org_id, actor_type, event_type, entity_type, entity_id)
SELECT id, 'system', 'source_item_ingested', 'source_item', gen_random_uuid() FROM public.orgs LIMIT 1
RETURNING id, created_at, event_type;
```

**Expected:** One row inserted; `created_at` is NOT NULL and `event_type` is one of the canonical types.

**Evidence table:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| INSERT succeeds | Insert one event row | 1 row, `created_at` NOT NULL | _fill after run_ |
| Actor/timestamp invariant | Same row | `actor_type` or `actor_id` set; `created_at` set | _fill after run_ |

---

## 3. Idempotency Keys (When Used)

Applicable when ingestion or API uses idempotency (e.g. `ledger_ingestion_idempotency` table or payload `idempotency_key` with application-level deduplication).

### 3.1 Same key returns same event (no duplicate row)

**Step:** If using a side table (e.g. `ledger_ingestion_idempotency`): first request with key K inserts event E and maps K → E; second request with same K must not insert a new event and must return E (or E’s id).

**Expected:**

- At most one row in `ledger_events` per logical idempotency key when the key is enforced.
- Second write with same key does not create a second event row; caller receives existing event id.

**Evidence table:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| First write with key K | Insert event with idempotency_key K | 1 new row in ledger_events; K → event_id stored | _fill after run_ |
| Second write with same K | Same insert (or API call) with key K | No new row; returns existing event_id | _fill after run_ |
| Count unchanged | `SELECT COUNT(*) FROM ledger_events` before and after second write | Same count | _fill after run_ |

---

### 3.2 Idempotency key format (if applicable)

**Step:** If connectors or API document idempotency key format (e.g. `gmail:msg:<id>`), verify that keys are unique per logical event and consistent across retries.

**Reference:** `proofs/q-reil/IDEMPOTENCY_STRATEGY_RECEIPT.md`; Gmail keys in `connectors/gmail/lib/ledger.js` (`idempotencyKeys()`).

**Evidence table:**

| Check | Query / inspection | Expected | Actual |
|-------|--------------------|----------|--------|
| Key format | Inspect keys in payload or idempotency table | Unique per logical event; stable for same event | _fill after run_ |

---

## 4. Invariants Summary

| Invariant | Validation | Pass/Fail |
|-----------|------------|-----------|
| No deletes, only new events | §2.1, §2.2: UPDATE and DELETE rejected by DB | _fill after run_ |
| Every event has timestamp | §2.3: `created_at` NOT NULL on insert | _fill after run_ |
| Every event has actor | §2.3: `actor_id` or `actor_type` set | _fill after run_ |
| Idempotency when used | §3: Same key → same event, no duplicate | _fill after run_ |

---

## 5. References

- Ledger event spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`
- Migration: `docs/02_DATA/migrations/00038_reil_ledger_events.sql`
- Idempotency strategy: `proofs/q-reil/IDEMPOTENCY_STRATEGY_RECEIPT.md`
- Engineering receipt: `proofs/reil-core/ENGDEL-REIL-LEDGER-0010-receipt.md`
