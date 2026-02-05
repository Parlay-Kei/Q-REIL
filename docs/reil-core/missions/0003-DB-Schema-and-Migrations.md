# Mission 0003 — DB Schema and Migrations

**Mission ID:** REIL-CORE-0003  
**Title:** DB Schema and Migrations  
**Owner:** Platform Ops (PLATOPS)

---

## Inputs

- Mission 0002 (Canonical Data Model) complete: `docs/reil-core/CANONICAL_DATA_MODEL.md`, `docs/reil-core/NORMALIZATION_RULES.md`.
- Existing base migrations: `docs/02_DATA/migrations/` (orgs, users, RLS, mail tables, etc.).
- Supabase project for REIL (connection details via env; no secrets in mission docs).

---

## Acceptance criteria

- [ ] REIL tables exist and match canonical model: `source_items_raw`, `source_items_normalized`, `reil_records`, `reil_documents`, `reil_ledger_events`, `reil_audit_log`, and any supporting tables (e.g. record_links).
- [ ] Migrations are additive, ordered, and idempotent where applicable (e.g. CREATE TABLE IF NOT EXISTS or guarded).
- [ ] RLS policies and service-role bypass are defined per REIL security baseline; no PII in logs.
- [ ] All migrations under `docs/02_DATA/migrations/` apply in order without errors.
- [ ] Storage bucket(s) required for REIL (e.g. mail-attachments) are documented or created via migration/script.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| REIL source items raw | `docs/02_DATA/migrations/00034_reil_source_items_raw.sql` |
| REIL source items normalized | `docs/02_DATA/migrations/00035_reil_source_items_normalized.sql` |
| REIL records | `docs/02_DATA/migrations/00036_reil_records.sql` |
| REIL documents | `docs/02_DATA/migrations/00037_reil_documents.sql` |
| REIL ledger events | `docs/02_DATA/migrations/00038_reil_ledger_events.sql` |
| REIL audit log | `docs/02_DATA/migrations/00039_reil_audit_log.sql` |
| REIL record links (include record) | `docs/02_DATA/migrations/00040_reil_record_links_include_record.sql` |
| Schema design (reference) | `docs/02_DATA/schema-design.md` |
| RLS policies (reference) | `docs/02_DATA/rls-policies.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0003 | Supabase schema receipt | `proofs/reil-core/PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof.
