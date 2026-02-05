# Mission 0004 — Data Access Layer

**Mission ID:** REIL-CORE-0004  
**Title:** Data Access Layer  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0003 (DB Schema and Migrations) complete; migrations applied.
- Canonical model: `docs/reil-core/CANONICAL_DATA_MODEL.md`.
- Connector and app need: upsert raw items, upsert normalized items, link documents, write ledger events, read records/documents.

---

## Acceptance criteria

- [ ] DAL exposes functions for: upsert `source_items_raw`, upsert `source_items_normalized`, create/update `documents`, append `reil_ledger_events`, read `reil_records` and related.
- [ ] All access uses service role or RLS-safe patterns; no raw SQL with user input string concatenation.
- [ ] Idempotency keys (e.g. `org_id` + `idempotency_key`) are used for upserts where specified.
- [ ] DAL is covered by tests or integration run; no secrets in code or docs.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Gmail connector ingest (uses DAL) | `connectors/gmail/lib/ingest.js` |
| Gmail connector ledger writes | `connectors/gmail/lib/ledger.js` |
| Optional shared DAL module | Repo-specific (e.g. `connectors/gmail/lib/` or shared `lib/reil-dal/`); exact path per repo layout. If all logic lives in connector, list primary file: `connectors/gmail/lib/ingest.js`, `connectors/gmail/lib/ledger.js` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0004 | DAL receipt | `proofs/reil-core/ENGDEL-REIL-DAL-0004-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof.
