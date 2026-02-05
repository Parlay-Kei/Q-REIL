# REIL Core Ledger Event Specification

**Ticket:** ENGDEL-REIL-LEDGER-EVENTS-0010  
**Owner:** Engineering Delivery  
**Status:** Defined  
**Version:** 1.0.0

---

## 1. Overview

The REIL ledger is an **append-only** audit trail. All state changes that affect records, contacts, documents, or source items are recorded as immutable events in `public.ledger_events`. No updates or deletes are allowed on ledger rows.

---

## 2. Event Types (Canonical)

The following event types are defined and must be used by all writers (connectors, API, UI).

| Event type | Description | Typical entity_type | Typical payload |
|------------|-------------|----------------------|-----------------|
| `source_item_ingested` | Raw item from a connector was written to `source_items_raw`. | `source_item` | `idempotency_key`, `source_type`, optional `document_id` |
| `document_attached` | A document was linked to a record or contact (e.g. via record_links). | `document` or `record` | `document_id`, `record_id`, `link_method` |
| `record_created` | A new record (property or deal) was created. | `record` | `record_type`, `record_type_id`, `title` |
| `record_updated` | An existing record was updated (title, status, owner, tags). | `record` | Changed fields or diff |
| `contact_linked` | A contact was linked to a record (or vice versa). | `contact` or `record` | `contact_id`, `record_id`, `link_method` |
| `status_changed` | Entity lifecycle status changed (e.g. active → closed). | `record`, `contact`, or `document` | `from_status`, `to_status` |
| `manual_override_applied` | A user or admin applied an override (e.g. match, link, status). | Varies | `override_type`, `target_id`, `reason` |

**Rules:**

- `event_type` must be one of the values above (or future-approved extensions).
- `entity_type` identifies the primary entity affected (e.g. `record`, `contact`, `document`, `source_item`).
- `entity_id` is the UUID of that entity.
- `payload` is JSONB; structure is event-type-specific but should be stable for querying.

---

## 3. Append-Only Rules

### 3.1 No deletes, only new events

- **Invariant:** Rows in `ledger_events` are never updated or deleted.
- **Enforcement:** Database triggers `prevent_ledger_events_update` and `prevent_ledger_events_delete` raise an exception on UPDATE or DELETE.
- **Migration:** `docs/02_DATA/migrations/00038_reil_ledger_events.sql`.

### 3.2 Every event references actor and timestamp

- **Invariant:** Every event has:
  - **Actor:** `actor_id` (UUID, nullable for system) and `actor_type` (e.g. `user`, `system`, `integration`). At least one of `actor_id` or `actor_type` must be set; `actor_type` defaults to `user` when `actor_id` is set.
  - **Timestamp:** `created_at` TIMESTAMPTZ NOT NULL, set at insert time (default `now()`).
- **Schema:** See table definition below; `actor_id` and `actor_type` are columns; `created_at` is required.

---

## 4. Table Definition (Reference)

Table: `public.ledger_events`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key (default `gen_random_uuid()`) |
| `org_id` | UUID | Yes | Tenant isolation; FK to `orgs(id)` |
| `actor_id` | UUID | No | User or system actor; FK to `users(id)` when user |
| `actor_type` | TEXT | No | `user`, `system`, `integration` (default `user`) |
| `event_type` | TEXT | Yes | One of the canonical event types above |
| `entity_type` | TEXT | Yes | record, contact, document, source_item, etc. |
| `entity_id` | UUID | Yes | Target entity id |
| `payload` | JSONB | No | Event-specific data (default `{}`) |
| `correlation_id` | UUID | No | Group related events (e.g. one sync run) |
| `created_at` | TIMESTAMPTZ | Yes | Event time (default `now()`) |

**Indexes:** `org_id`, `(entity_type, entity_id)`, `event_type`, `created_at DESC`, `correlation_id`.

---

## 5. Idempotency (Ingestion Path)

For connector or API ingestion that may retry the same logical action:

- **Option A:** Use a separate idempotency table (e.g. `ledger_ingestion_idempotency`) keyed by `idempotency_key` → `event_id`. Before inserting into `ledger_events`, look up by key; if found, return existing event id and do not insert. See `proofs/q-reil/IDEMPOTENCY_STRATEGY_RECEIPT.md`.
- **Option B:** Store `idempotency_key` in `payload` and enforce at application level (e.g. unique constraint on `(org_id, event_type, entity_type, entity_id, payload->>'idempotency_key')` if desired, or application-level check before insert).

Writers that are inherently single-shot (e.g. UI “link” button) may omit idempotency keys.

---

## 6. References

- Canonical data model: `docs/reil-core/CANONICAL_DATA_MODEL.md` (§2.6 Ledger event)
- Migration: `docs/02_DATA/migrations/00038_reil_ledger_events.sql`
- Idempotency strategy: `proofs/q-reil/IDEMPOTENCY_STRATEGY_RECEIPT.md`
- Receipt: `proofs/reil-core/ENGDEL-REIL-LEDGER-0010-receipt.md`
- QA invariants: `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0011.md`
