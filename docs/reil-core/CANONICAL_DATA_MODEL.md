# REIL Core Canonical Data Model

**Ticket:** PRODOPS-REIL-CORE-SCHEMA-0002  
**Owner:** Product Ops  
**Status:** Defined  
**Version:** 1.0.0

---

## 1. Overview

This document defines the canonical objects and fields for REIL Core. All ingestion, storage, and API layers align to this model. Non-canonical or connector-specific fields are normalized into these shapes.

---

## 2. Canonical Objects

### 2.1 Record (property or deal container)

The **Record** is the primary container for a transaction or asset. It can represent a **property** or a **deal**.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `record_type` | enum | Yes | `property` \| `deal` |
| `record_type_id` | UUID | Yes | FK to properties.id or deals.id |
| `title` | text | Yes | Display name |
| `status` | text | Yes | Lifecycle status (e.g. active, closed, draft) |
| `owner_id` | UUID | No | Assigned user |
| `tags` | text[] | No | Labels for filtering/search |
| `created_at` | timestamptz | Yes | System |
| `updated_at` | timestamptz | Yes | System |

**Rules:** One Record row per property or deal; `record_type` + `record_type_id` unique per org.

---

### 2.2 Contact

A person (buyer, seller, agent, tenant, etc.).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `name` | text | Yes | Full or display name |
| `email` | text | No | Primary email |
| `phone` | text | No | Primary phone |
| `contact_type` | text | No | buyer, seller, tenant, landlord, agent, etc. |
| `tags` | text[] | No | Labels |
| `owner_id` | UUID | No | Assigned user |
| `created_at` | timestamptz | Yes | System |
| `updated_at` | timestamptz | Yes | System |

---

### 2.3 Organization

Root tenant. One org per customer.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | text | Yes | Display name |
| `slug` | text | Yes | URL-safe unique identifier |
| `settings` | jsonb | No | Org-wide config |
| `created_at` | timestamptz | Yes | System |
| `updated_at` | timestamptz | Yes | System |

---

### 2.4 Document

File or document metadata linked to records/contacts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `name` | text | Yes | File or document name |
| `document_type` | text | No | contract, disclosure, photo, etc. |
| `storage_path` | text | Yes | Path in storage bucket |
| `storage_bucket` | text | No | Bucket name (default documents) |
| `mime_type` | text | No | MIME type |
| `file_size` | int | No | Size in bytes |
| `tags` | text[] | No | Labels |
| `created_at` | timestamptz | Yes | System |
| `updated_at` | timestamptz | Yes | System |

Document-to-record linkage is via **record_links** (many-to-many).

---

### 2.5 Source item (raw ingestion)

Raw payload from a connector before normalization. Append-only; idempotency by key.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `idempotency_key` | text | Yes | Unique per source (e.g. provider:mailbox:external_id) |
| `source_type` | text | Yes | gmail, mls, skyslope, etc. |
| `payload` | jsonb | Yes | Raw payload |
| `created_at` | timestamptz | Yes | System |

**Rules:** Unique constraint on `(org_id, idempotency_key)`. No updates; insert only.

---

### 2.6 Ledger event (append only)

Immutable audit trail entry. No updates or deletes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `actor_id` | UUID | No | User or system |
| `actor_type` | text | No | user, system, integration |
| `event_type` | text | Yes | e.g. record.created, sync.completed |
| `entity_type` | text | Yes | record, contact, document, etc. |
| `entity_id` | UUID | Yes | Target entity |
| `payload` | jsonb | No | Event data |
| `correlation_id` | UUID | No | Group related events |
| `created_at` | timestamptz | Yes | System |

**Rules:** Append-only; no `updated_at`. Triggers/rules prevent UPDATE/DELETE. Canonical event types and invariants: `docs/reil-core/LEDGER_EVENT_SPEC.md`.

---

### 2.7 Tag, status, owner, timestamps

- **Tag:** Array of text labels on Record, Contact, Document (e.g. `tags text[]`).
- **Status:** Single text field per entity for lifecycle (e.g. active, closed, draft).
- **Owner:** `owner_id` UUID referencing users where applicable (Record, Contact).
- **Timestamps:** `created_at`, `updated_at` timestamptz on all mutable entities; ledger and raw source items have `created_at` only where appropriate.

---

## 3. Supporting Structures

### 3.1 Record links (many-to-many)

Links between source items (e.g. message, document) and targets (record, contact, etc.).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `source_type` | text | Yes | message, thread, document, attachment |
| `source_id` | UUID | Yes | Source entity id |
| `target_type` | text | Yes | record, contact, deal, property, etc. |
| `target_id` | UUID | Yes | Target entity id |
| `link_method` | text | Yes | rule, manual, system |
| `linked_at` | timestamptz | Yes | System |

---

### 3.2 Source item normalized

Normalized view of raw ingestion; one row per logical item; upsert by idempotency key.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `org_id` | UUID | Yes | Tenant isolation |
| `idempotency_key` | text | Yes | Same key as raw or derived |
| `source_type` | text | Yes | Connector type |
| `normalized_type` | text | Yes | message, thread, contact, etc. |
| `payload` | jsonb | Yes | Normalized fields |
| `created_at` | timestamptz | Yes | System |
| `updated_at` | timestamptz | Yes | System |

**Rules:** Unique on `(org_id, idempotency_key)`; upsert allowed for corrections.

---

## 4. Acceptance Criteria (PRODOPS-REIL-CORE-SCHEMA-0002)

- [ ] **AC1** Record object is defined with record_type (property | deal), title, status, owner_id, tags, and timestamps.
- [ ] **AC2** Contact object is defined with name, email, phone, contact_type, tags, owner_id, and timestamps.
- [ ] **AC3** Organization object is defined with name, slug, settings, and timestamps.
- [ ] **AC4** Document object is defined with name, document_type, storage_path, storage_bucket, mime_type, file_size, tags, and timestamps.
- [ ] **AC5** Source item (raw) is defined with idempotency_key, source_type, payload, and created_at; insert-only.
- [ ] **AC6** Ledger event is defined as append-only with event_type, entity_type, entity_id, payload, correlation_id, actor fields, and created_at.
- [ ] **AC7** Tag, status, owner, and timestamps are specified for entities that support them.
- [ ] **AC8** Record links (many-to-many) are defined with source_type, source_id, target_type, target_id, link_method, linked_at.
- [ ] **AC9** Source item normalized is defined with idempotency_key and upsert semantics.
- [ ] **AC10** Canonical model is documented in `docs/reil-core/CANONICAL_DATA_MODEL.md` and this acceptance list is included.

---

## 5. Entity Relationship Summary

```
Organization (orgs)
  └── Record (records) ← record_type → property | deal
  └── Contact (contacts)
  └── Document (documents)
  └── Source item raw (source_items_raw)   [idempotency_key, append-only]
  └── Source item normalized (source_items_normalized) [idempotency_key, upsert]
  └── Ledger event (ledger_events)         [append-only]
  └── Record links (record_links)          [source ↔ target many-to-many]
```

---

## 6. References

- Schema design: `docs/02_DATA/schema-design.md`
- REIL ledger rules: `docs/01_SPEC/reil-ledger-rules.md`
- Migrations: `docs/02_DATA/migrations/` and REIL Core migrations (00034+)
