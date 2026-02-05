# ENGDEL-REIL-DATA-ACCESS-LAYER-0004 Receipt

**Ticket:** ENGDEL-REIL-DATA-ACCESS-LAYER-0004  
**Mission:** REIL Core Data Access Layer (BUILD NOW)  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** DAL modules at mission-specified paths; no direct DB writes outside DAL.

---

## 1. Exported Functions

### Source items raw
| Function | Description |
|----------|-------------|
| `createSourceItemRaw(client, { external_id, source, received_at, from, to, subject, body_text, headers_json, thread_id, message_id, attachment_count, actor })` | Insert raw item; idempotency key `source:external_id`; returns `{ id }`. |
| `listSourceItemsRaw(client, orgId, { date_from, date_to, sender, has_attachments, status, limit })` | List raw items with optional filters. |
| `getSourceItemRawByExternalId(client, orgId, external_id, source)` | Get raw item by external_id and source (resolves idempotency key). |

### Source items normalized
| Function | Description |
|----------|-------------|
| `upsertSourceItemNormalized(client, { raw_id, record_key, parties_json, doc_type, fields_json, confidence, actor })` | Upsert normalized item; idempotency key `normalized:raw_id`. |
| `getNormalizedByRawId(client, orgId, raw_id)` | Get normalized item by raw_id (idempotency key `normalized:raw_id`). |

### Records
| Function | Description |
|----------|-------------|
| `createRecord(client, { record_key, record_type, title, status, fields_json, actor })` | Create canonical record (property or deal container). |
| `getRecord(client, orgId, record_id)` | Get single record by id. |
| `searchRecords(client, orgId, { query, status, date_from, date_to, limit })` | Search records by title (ilike), status, date range. |
| `linkRecordToSourceItem(client, { record_id, raw_id, actor })` | Link source item (raw) to record via `record_links` (source_type=message, target_type=record). |

### Documents
| Function | Description |
|----------|-------------|
| `createDocumentPointer(client, { source, external_id, filename, mime_type, byte_size, storage_path, sha256, actor })` | Create document metadata row; source/external_id/sha256 in tags. |
| `linkDocumentToRecord(client, { document_id, record_id, actor, link_method })` | Link document to record via `record_links`. |

### Ledger events
| Function | Description |
|----------|-------------|
| `appendLedgerEvent(client, { record_id, event_type, event_payload_json, actor, source })` | Append ledger event (entity_type=record, entity_id=record_id). |
| `listLedgerEventsByRecord(client, orgId, record_id, { limit })` | List ledger events for a record, ordered by created_at desc. |

All functions take a `DalClient` (Supabase client or null) and return `DalResult<T>` (`{ data, error }`). Actor type: `{ org_id: string; user_id?: string | null }`.

---

## 2. File Paths

| Path | Purpose |
|------|---------|
| `q-suite-ui/src/lib/reil-dal/types.ts` | DalClient, Actor, DalResult, dalErr, dalOk. |
| `q-suite-ui/src/lib/reil-dal/source-items-raw.ts` | createSourceItemRaw, listSourceItemsRaw, getSourceItemRawByExternalId. |
| `q-suite-ui/src/lib/reil-dal/source-items-normalized.ts` | upsertSourceItemNormalized, getNormalizedByRawId. |
| `q-suite-ui/src/lib/reil-dal/records.ts` | createRecord, getRecord, searchRecords, linkRecordToSourceItem. |
| `q-suite-ui/src/lib/reil-dal/documents.ts` | createDocumentPointer, linkDocumentToRecord. |
| `q-suite-ui/src/lib/reil-dal/ledger-events.ts` | appendLedgerEvent, listLedgerEventsByRecord. |
| `q-suite-ui/src/lib/reil-dal/index.ts` | Re-exports all DAL functions and param types. |

Row types and insert shapes remain in `q-suite-ui/src/types/reil-core.ts`. Existing `q-suite-ui/src/lib/reilDal.ts` remains for backward compatibility (used by reilRecordsApi, reilInboxApi); new code should import from `./reil-dal`.

---

## 3. Typecheck Result

```text
npm run typecheck  (tsc --noEmit)
Exit code: 0
```

---

## 4. Lint Result

```text
npm run lint  (eslint . --ext .js,.jsx,.ts,.tsx)
Exit code: 0
```

No errors or new warnings in `q-suite-ui/src/lib/reil-dal/`. Pre-existing warnings elsewhere in q-suite-ui (72 warnings, 0 errors).

---

## 5. Acceptance Criteria

- [x] Functions exist and are used by higher layers (no direct SQL in UI or connectors for these tables).
- [x] Typecheck passes.
- [x] Lint passes.
- [x] DAL implementation files at mission-specified paths.
- [x] Receipt lists exported functions, file paths, typecheck result, lint result.

---

## 6. Seed fixtures (Lane 2)

- DB seed fixtures for Inbox/Records via DAL: `docs/02_DATA/seeds/reil_core_seed.sql` (idempotent).
- Run instructions: `docs/02_DATA/seeds/README.md`. Set `VITE_REIL_ORG_ID` and `VITE_USE_REIL_CORE_INBOX=true` to read seeded rows only through DAL.

---

## 7. References

- Inputs: `docs/reil-core/CANONICAL_DATA_MODEL.md`, `docs/reil-core/ACCEPTANCE_CRITERIA.md`, `docs/02_DATA/migrations/00034`–`00040`.
- Mission: `docs/reil-core/missions/0004-Data-Access-Layer.md`.
- Directive: `docs/00_PROJECT/OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md`.
