# QAG-REIL-LEDGER-INVARIANTS-0010 Proof

**Ticket:** QAG-REIL-LEDGER-INVARIANTS-0010  
**Owner:** QA Gatekeeper  
**Mission:** Ledger Invariants QA (append-only, ordering, idempotency)  
**Status:** Verification complete  

---

## 1. Acceptance checks

| Check | Description |
|-------|-------------|
| **Append-only** | Attempts to update or delete existing event are impossible or rejected. |
| **Ordering** | Timeline ordering is deterministic across reruns (same query, same order). |
| **Idempotency** | Same idempotency_key does not create duplicate ledger rows when enforced by application. |

---

## 2. Append-only: UPDATE rejected

**Step:** Attempt to UPDATE any row in `ledger_events`.

**SQL (run as service role):**
```sql
UPDATE public.ledger_events SET payload = '{"test": true}' WHERE id = (SELECT id FROM public.ledger_events LIMIT 1);
```

**Expected:** Exception raised by trigger `prevent_ledger_events_update`: e.g. "ledger_events is append-only. UPDATE and DELETE are not allowed." No row is modified.

**Evidence:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| UPDATE rejected | `UPDATE ledger_events SET payload = '{}' WHERE id = :id` | Exception, no row updated | Exception raised; 0 rows updated |

---

## 3. Append-only: DELETE rejected

**Step:** Attempt to DELETE any row in `ledger_events`.

**SQL:**
```sql
DELETE FROM public.ledger_events WHERE id = (SELECT id FROM public.ledger_events LIMIT 1);
```

**Expected:** Exception raised by trigger `prevent_ledger_events_delete`. No row is removed.

**Evidence:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| DELETE rejected | `DELETE FROM ledger_events WHERE id = :id` | Exception, no row deleted | Exception raised; 0 rows deleted |

---

## 4. Ordering: timeline deterministic

**Step:** Query ledger_events for a record with `ORDER BY created_at DESC`. Run twice; compare order.

**SQL:**
```sql
SELECT id, event_type, created_at FROM public.ledger_events
WHERE org_id = 'a0000000-0000-4000-8000-000000000001' AND entity_type = 'record' AND entity_id = 'c0000000-0000-4000-8000-000000000010'
ORDER BY created_at DESC;
```

**Expected:** Same row order across reruns (deterministic). No gaps for critical flows when inserts are sequential.

**Evidence:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| Ordering deterministic | Same SELECT ... ORDER BY created_at DESC run twice | Same order both runs | Same order; stable sort |

---

## 5. Idempotency: same key no duplicates

**Step:** Call ledger append twice with same `idempotency_key` (e.g. via `connectors/reil-core/ledger/index.js` `append()` with `idempotency_key` in event). Count rows before and after.

**Expected:** First call inserts one row; second call does not insert a second row (returns existing event id). `SELECT COUNT(*) FROM ledger_events` unchanged after second call.

**Evidence:**

| Check | Action | Expected | Actual |
|-------|--------|----------|--------|
| First write with key K | append(event with idempotency_key K) | 1 new row | 1 new row |
| Second write with same K | append(event with same idempotency_key K) | No new row; returns existing id | No new row; existing id returned |
| Count unchanged | COUNT(*) before and after second write | Same count | Same count |

---

## 6. Invariants summary

| Invariant | Validation | Pass/Fail |
|-----------|------------|-----------|
| No deletes, only new events | §2, §3: UPDATE and DELETE rejected by DB triggers | **PASS** |
| Every event has timestamp | `created_at` NOT NULL on insert (migration 00038) | **PASS** |
| Ordering deterministic | §4: Same query, same order across reruns | **PASS** |
| Idempotency when used | §5: Same idempotency_key → no duplicate row | **PASS** |

---

## 7. Verdict

**PASS**

Append-only behavior is enforced by database triggers. Timeline ordering is deterministic (ORDER BY created_at DESC). Idempotency is enforced by application in `connectors/reil-core/ledger/index.js` when `idempotency_key` is supplied; duplicate key returns existing event id and does not insert.

---

## 8. References

- Migration: `docs/02_DATA/migrations/00038_reil_ledger_events.sql`
- Ledger service: `connectors/reil-core/ledger/index.js`
- Engineering receipt: `proofs/reil-core/ENGDEL-REIL-LEDGER-ENGINE-0009-receipt.md`
- Ledger spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`
