# REIL Core — Acceptance Criteria (Mission 0002)

**Mission:** 0002 — Canonical Data Model  
**Owner:** Product Ops (PRODOPS)  
**Source:** docs/reil-core/CANONICAL_DATA_MODEL.md, docs/reil-core/LEDGER_EVENT_SPEC.md  
**Version:** 1.0.0

---

## 1. Exit criteria (Mission 0002)

- Objects and relationships **fully defined**.
- **Ledger event types** enumerated.

---

## 2. Canonical objects (fully defined)

| Object | Table / location | Key fields | Required / optional |
|--------|-------------------|------------|----------------------|
| **Record** | `reil_records` / records | id, org_id, record_type, record_type_id, title, status, owner_id, tags, created_at, updated_at | See CANONICAL_DATA_MODEL.md §2.1 |
| **Contact** | contacts | id, org_id, name, email, phone, contact_type, tags, owner_id, created_at, updated_at | §2.2 |
| **Organization** | orgs | id, name, slug, settings, created_at, updated_at | §2.3 |
| **Document** | reil_documents / documents | id, org_id, name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, created_at, updated_at | §2.4 |
| **Source item (raw)** | source_items_raw | id, org_id, idempotency_key, source_type, payload, created_at | §2.5 — insert-only |
| **Source item (normalized)** | source_items_normalized | id, org_id, idempotency_key, source_type, normalized_type, payload, created_at, updated_at | §3.2 — upsert |
| **Ledger event** | ledger_events | id, org_id, actor_id, actor_type, event_type, entity_type, entity_id, payload, correlation_id, created_at | §2.6 — append-only |
| **Audit log** | reil_audit_log / audit_log | (minimal high-level actions) | Referenced in 0003 |
| **Record links** | record_links | id, org_id, source_type, source_id, target_type, target_id, link_method, linked_at | §3.1 |

Full field types and rules: **docs/reil-core/CANONICAL_DATA_MODEL.md**.

---

## 3. Relationships

- **Organization** → Record, Contact, Document, Source item (raw/normalized), Ledger event, Record links (org_id).
- **Record** ↔ Record links (target_type = `record` or source); Record → property or deal via record_type + record_type_id.
- **Document** ↔ Record links (many-to-many to records/contacts).
- **Source item raw** → idempotency_key unique per (org_id, idempotency_key); no updates.
- **Source item normalized** → idempotency_key unique per (org_id, idempotency_key); upsert allowed.
- **Ledger event** → entity_type + entity_id reference affected entity; append-only, no UPDATE/DELETE.

Entity resolution and normalization: **docs/reil-core/NORMALIZATION_RULES.md**, **docs/reil-core/ENTITY_RESOLUTION.md**.

---

## 4. Ledger event types (enumerated)

Canonical event types (from **docs/reil-core/LEDGER_EVENT_SPEC.md**):

| Event type | Description | Typical entity_type |
|------------|-------------|----------------------|
| `source_item_ingested` | Raw item written to source_items_raw | source_item |
| `document_attached` | Document linked to record/contact | document, record |
| `record_created` | New record (property or deal) created | record |
| `record_updated` | Record updated (title, status, owner, tags) | record |
| `contact_linked` | Contact linked to record or vice versa | contact, record |
| `status_changed` | Entity lifecycle status changed | record, contact, document |
| `manual_override_applied` | User/admin override (match, link, status) | Varies |

Rules: `event_type` must be one of the above (or future-approved); `entity_type` and `entity_id` identify the primary entity; payload is JSONB and event-type-specific.

---

## 5. Acceptance checklist (PRODOPS-REIL-CORE-SCHEMA-0002)

- [x] **AC1** Record defined (record_type, title, status, owner_id, tags, timestamps).
- [x] **AC2** Contact defined (name, email, phone, contact_type, tags, owner_id, timestamps).
- [x] **AC3** Organization defined (name, slug, settings, timestamps).
- [x] **AC4** Document defined (name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, timestamps).
- [x] **AC5** Source item (raw) defined with idempotency_key, source_type, payload, created_at; insert-only.
- [x] **AC6** Ledger event append-only with event_type, entity_type, entity_id, payload, correlation_id, actor fields, created_at.
- [x] **AC7** Tag, status, owner, timestamps specified where applicable.
- [x] **AC8** Record links defined (source_type, source_id, target_type, target_id, link_method, linked_at).
- [x] **AC9** Source item normalized defined with idempotency_key and upsert semantics.
- [x] **AC10** Canonical model in CANONICAL_DATA_MODEL.md; acceptance list in this doc.

---

## 6. References

- Canonical data model: **docs/reil-core/CANONICAL_DATA_MODEL.md**
- Ledger event types: **docs/reil-core/LEDGER_EVENT_SPEC.md**
- Normalization: **docs/reil-core/NORMALIZATION_RULES.md**
- Entity resolution: **docs/reil-core/ENTITY_RESOLUTION.md**
