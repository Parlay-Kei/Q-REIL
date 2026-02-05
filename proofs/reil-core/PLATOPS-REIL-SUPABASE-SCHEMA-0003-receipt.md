# PLATOPS-REIL-SUPABASE-SCHEMA-0003 Receipt

**Ticket:** PLATOPS-REIL-SUPABASE-SCHEMA-0003  
**Owner:** Platform Ops  
**Status:** Implemented  
**Deliverables:** Migration files, schema inventory, constraints summary

---

## 1. Schema Inventory

| Table | Migration | Purpose |
|-------|-----------|---------|
| `source_items_raw` | 00034_reil_source_items_raw.sql | Raw connector payloads; append-only; idempotency key |
| `source_items_normalized` | 00035_reil_source_items_normalized.sql | Normalized ingestion; upsert by idempotency key |
| `records` | 00036_reil_records.sql | Canonical record container (property or deal) |
| `contacts` | 00033_create_record_tables.sql | Existing; canonical Contact entity |
| `documents` | 00037_reil_documents.sql | Document metadata and storage references |
| `ledger_events` | 00038_reil_ledger_events.sql | Append-only audit ledger |
| `record_links` | 00030_create_mail_tables.sql, 00040_reil_record_links_include_record.sql | Many-to-many source↔target; extended for target_type `record` |
| `audit_log` | 00039_reil_audit_log.sql | Minimal audit log for high-level actions |

---

## 2. Constraints Summary

### 2.1 Idempotency

- **source_items_raw:** `UNIQUE(org_id, idempotency_key)` — insert-only; duplicate key returns conflict.
- **source_items_normalized:** `UNIQUE(org_id, idempotency_key)` — upsert allowed for corrections.

### 2.2 Append-only

- **ledger_events:** No `updated_at`; triggers `prevent_ledger_events_update` and `prevent_ledger_events_delete` block UPDATE/DELETE.

### 2.3 Referential integrity

- All REIL Core tables: `org_id` → `public.orgs(id)` ON DELETE CASCADE.
- `records.owner_id` → `public.users(id)` ON DELETE SET NULL.
- `documents.created_by_user_id` → `public.users(id)` ON DELETE SET NULL.
- `ledger_events.actor_id` → `public.users(id)` ON DELETE SET NULL.
- `audit_log.actor_id` → `public.users(id)` ON DELETE SET NULL.

### 2.4 Check constraints

- **records:** `record_type IN ('property', 'deal')`.
- **record_links:** `target_type IN ('contact', 'company', 'deal', 'property', 'unit', 'leasing', 'record')` (after 00040).

---

## 3. Migration Files (in order)

1. `docs/02_DATA/migrations/00034_reil_source_items_raw.sql`
2. `docs/02_DATA/migrations/00035_reil_source_items_normalized.sql`
3. `docs/02_DATA/migrations/00036_reil_records.sql`
4. `docs/02_DATA/migrations/00037_reil_documents.sql`
5. `docs/02_DATA/migrations/00038_reil_ledger_events.sql`
6. `docs/02_DATA/migrations/00039_reil_audit_log.sql`
7. `docs/02_DATA/migrations/00040_reil_record_links_include_record.sql`

**Dependencies:** 00001 (orgs), 00002 (users), 00019 (update_updated_at_column), 00030 (record_links), 00033 (contacts, deals, properties).

---

## 4. Index Summary

- **source_items_raw:** org_id, source_type, created_at DESC.
- **source_items_normalized:** org_id, source_type, normalized_type.
- **records:** org_id, record_type, status, owner_id, GIN(tags).
- **documents:** org_id, created_by_user_id, document_type, GIN(tags).
- **ledger_events:** org_id, (entity_type, entity_id), event_type, created_at DESC, correlation_id.
- **audit_log:** org_id, actor_id, created_at DESC, (resource_type, resource_id).

---

## 5. Acceptance

- [x] source_items_raw with idempotency key, append-only semantics.
- [x] source_items_normalized with idempotency key, upsert semantics.
- [x] records (property or deal container).
- [x] contacts (existing table referenced).
- [x] documents table.
- [x] ledger_events append-only.
- [x] record_links many-to-many; target_type includes `record`.
- [x] audit_log minimal.
- [x] Receipt documents schema inventory and constraints.

---

## 6. Verification (Mission 0003 run — 2026-02-02)

- **Tables exist:** source_items_raw, source_items_normalized, records, documents, ledger_events, audit_log, record_links (extended) — migration files 00034–00040 present under `docs/02_DATA/migrations/`.
- **Constraints:** UNIQUE(org_id, idempotency_key) on raw and normalized; record_type check; target_type check on record_links; FKs to orgs/users.
- **Ledger append-only:** Enforced by triggers `prevent_ledger_events_update` and `prevent_ledger_events_delete` in 00038_reil_ledger_events.sql.
- **Idempotency keys:** source_items_raw and source_items_normalized both have idempotency_key with UNIQUE(org_id, idempotency_key).
- **Exit criteria:** Met.
