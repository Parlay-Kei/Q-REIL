# Q REIL Idempotency Strategy Receipt

**Mission:** PLATOPS-QREIL-LEDGER-DB-0026  
**Owner:** Platform Ops  
**Date:** 2026-01-30  
**Scope:** Idempotency strategy for ingestion writes to the ledger

---

## 1. Goal

Ingestion (connectors, sync jobs, API) may retry or resend the same logical event. Writes to the ledger must be **idempotent**: one logical event results in exactly one row in `events`, and duplicate requests return the existing event without inserting again.

---

## 2. Storage

**Table:** `public.ledger_ingestion_idempotency`  
**Migration:** `docs/02_DATA/migrations/00034_ledger_store_and_idempotency.sql`

| Column           | Type        | Purpose |
|------------------|-------------|--------|
| idempotency_key  | TEXT (PK)   | Client-provided key; must be unique per logical event |
| event_id         | UUID        | FK to `events.id` — the ingested event |
| org_id           | UUID        | Tenant; supports cleanup and RLS |
| created_at       | TIMESTAMPTZ | When the key was first used |

---

## 3. Key Design

- **Who generates the key:** The **ingestion client** (connector, sync worker, or API caller) generates a stable key for each logical event (e.g. `{connector_id}:{source_message_id}` or `{sync_batch_id}:{entity_type}:{entity_id}`).
- **Uniqueness:** One idempotency key maps to exactly one `event_id`. Same key on a retry must return that same `event_id` and must not insert a second event.
- **Key lifetime:** Keys are stored indefinitely unless a retention policy is added later. Optional: periodic delete of keys older than N days after `events.created_at`.

---

## 4. Write Flow (Recommended)

1. **Input:** Payload for one ledger event + `idempotency_key` (required for ingestion path).
2. **Lookup:** `SELECT event_id FROM ledger_ingestion_idempotency WHERE idempotency_key = $1`.
3. **If row exists:** Return existing `event_id` (and optionally the event row); **do not** insert into `events`. Success, idempotent.
4. **If no row:**  
   - In a single transaction:  
     a. `INSERT INTO events (...) VALUES (...) RETURNING id`  
     b. `INSERT INTO ledger_ingestion_idempotency (idempotency_key, event_id, org_id) VALUES ($key, $event_id, $org_id)`  
   - If step (b) fails with unique violation (key already inserted by concurrent request), re-run lookup and return the existing `event_id`.
5. **Return:** The `event_id` (and optionally the event) to the client.

---

## 5. Concurrency

- Two requests with the same key: first insert wins; second gets unique violation on `ledger_ingestion_idempotency`, then selects and returns the first writer’s `event_id`.
- Use a single transaction for “insert event + insert idempotency row” so that we never leave an event without a key, and never accept a key without an event (application must not commit event without committing idempotency row).

---

## 6. API Contract (Suggested)

- **Request:** `POST /api/ledger/ingest` with body: `{ "idempotency_key": "...", "event": { org_id, actor_id, event_type, entity_type, entity_id, payload, ... } }`.
- **Response:**  
  - `201 Created` + event (including `id`) when a new event was written.  
  - `200 OK` + same event (by `id`) when key was already used (idempotent).
- **Validation:** Reject requests without `idempotency_key` for this ingestion endpoint.

---

## 7. Summary

| Aspect        | Choice |
|---------------|--------|
| Key storage   | Table `ledger_ingestion_idempotency` |
| Key owner     | Client (connector/API) |
| Deduplication| Lookup by key first; insert event + key only when key missing |
| Concurrency  | Unique constraint on key; on conflict, return existing event_id |
| Scope        | Ingestion writes only; UI or internal app writes may omit key |

This satisfies the mission requirement for an idempotency strategy for ingestion writes.
