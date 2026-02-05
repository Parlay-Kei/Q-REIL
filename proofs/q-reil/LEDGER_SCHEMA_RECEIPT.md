# Q REIL Ledger Schema Receipt

**Mission:** PLATOPS-QREIL-LEDGER-DB-0026  
**Owner:** Platform Ops  
**Date:** 2026-01-30  
**Scope:** Append-only ledger store and indexes for UI queries; tables/collections for threads, messages, attachments, records, deals

---

## 1. Ledger Store (Append-Only)

**Source:** `docs/02_DATA/migrations/00017_create_events.sql`, `00034_ledger_store_and_idempotency.sql`

The ledger is implemented as the **`public.events`** table: append-only, immutable (UPDATE/DELETE blocked by triggers from `00018_create_event_triggers.sql`).

| Column           | Type      | Purpose                                      |
|------------------|-----------|----------------------------------------------|
| id               | UUID      | Primary key                                  |
| org_id           | UUID      | Tenant isolation                             |
| actor_id         | UUID      | Who performed the action                     |
| actor_type       | TEXT      | user, system, integration                    |
| event_type       | TEXT      | e.g. deal.created, message.ingested          |
| entity_type      | TEXT      | deal, contact, mail_thread, message, etc.    |
| entity_id         | UUID      | Affected entity id                           |
| payload          | JSONB     | Event-specific data                          |
| correlation_id   | UUID      | Groups related events                        |
| created_at       | TIMESTAMPTZ | Immutable event time                       |

---

## 2. Indexes for UI Queries

**Source:** `docs/02_DATA/migrations/00017_create_events.sql`, `00034_ledger_store_and_idempotency.sql`

| Query / UI Need           | Index                         | Usage |
|---------------------------|-------------------------------|--------|
| **Recent ledger events**  | `idx_events_recent`            | `(org_id, created_at DESC)` — paginated recent activity |
| **Events by record id**   | `idx_events_by_record`         | `(org_id, entity_type, entity_id, created_at DESC)` — record-scoped timeline (contact, company, property, deal) |
| **Events by deal id**     | `idx_events_by_deal_id`        | Partial index `(entity_id, created_at DESC) WHERE entity_type = 'deal'` — deal workspace activity |
| **Events by thread id**   | `idx_events_by_thread_id`      | Partial index `(entity_id, created_at DESC) WHERE entity_type IN ('mail_thread', 'thread')` — inbox thread activity |

Additional existing indexes on `events`: `idx_events_org_id`, `idx_events_entity_type_id`, `idx_events_event_type`, `idx_events_actor_id`, `idx_events_created_at`, `idx_events_correlation_id`, `idx_events_payload` (GIN).

---

## 3. Tables / Collections for Domain Entities

| Entity       | Table(s) / View   | Migration(s) | Notes |
|-------------|-------------------|--------------|--------|
| **Threads** | `mail_threads`    | 00030        | Gmail threads; org_id, mailbox_id, provider_thread_id |
| **Messages**| `mail_messages`   | 00030        | Messages in threads; thread_id, provider_message_id |
| **Attachments** | `mail_attachments` | 00030     | Per-message attachments; message_id, storage_path |
| **Records** | `records` (view)   | 00034        | Union of contacts, companies, properties, deals (id, org_id, record_type, display_name) |
| **Deals**   | `deals`           | 00033        | Sales transactions; org_id, name |

Linking: `record_links` (00030) links source (message, thread, attachment, document) to target (contact, company, deal, property, unit, leasing).

---

## 4. Migration Checklist

- [x] Append-only ledger store: `events` (00017) + immutability triggers (00018)
- [x] Index: recent ledger events
- [x] Index: events by record id
- [x] Index: events by deal id
- [x] Index: events by thread id
- [x] Tables: threads (`mail_threads`), messages (`mail_messages`), attachments (`mail_attachments`)
- [x] Tables: records (view `records`), deals (`deals`)
- [x] Idempotency table: `ledger_ingestion_idempotency` (00034)

---

## 5. Reference

- Ledger event spec: `docs/06_QA/LEDGER_EVENT_SPEC.md`
- REIL ledger rules: `docs/01_SPEC/reil-ledger-rules.md`
- Gmail ledger events: `docs/06_QA/GMAIL_LEDGER_EVENTS.md`
- Idempotency: `proofs/q-reil/IDEMPOTENCY_STRATEGY_RECEIPT.md`
