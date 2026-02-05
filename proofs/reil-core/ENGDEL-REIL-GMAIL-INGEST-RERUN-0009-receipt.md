# ENGDEL-REIL-GMAIL-INGEST-RERUN-0009 Receipt

**Mission:** ENGDEL-REIL-GMAIL-INGEST-RERUN-0009  
**Owner:** ENGDEL  
**Goal:** Run ingestion end-to-end into Supabase and produce counts (first real unblock after OAuth repair).

---

## 1. Run Summary

| Field | Value |
|-------|--------|
| Run timestamp | *(ISO timestamp)* |
| Exit code | *(0 = success)* |
| Command | `node connectors/gmail/run-sync.mjs` (from repo root or `connectors/gmail`) |

---

## 2. Counts

| Check | Query / source | Expected | Actual |
|-------|----------------|----------|--------|
| source_items_raw (Gmail) | `SELECT COUNT(*) FROM source_items_raw WHERE source_type = 'gmail'` | ≥ 1 | *(fill)* |
| documents (Gmail) | `SELECT COUNT(*) FROM documents WHERE document_type = 'gmail'` | ≥ 1 if attachments exist | *(fill)* |

Optional: `node connectors/gmail/verify-ingest-smoke.mjs` → `counts.source_items_raw_gmail`, `counts.documents_gmail`.

---

## 3. Acceptance Criteria

- [ ] Ingest run exits 0.
- [ ] At least 1 row in `source_items_raw` where source is Gmail.
- [ ] At least 1 row in `documents` where `document_type` is Gmail (if mailbox has attachments).

---

*Receipt for ENGDEL-REIL-GMAIL-INGEST-RERUN-0009. Fill counts and timestamps after a successful run.*
