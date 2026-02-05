# Mission 0002 — Canonical Data Model

**Mission ID:** REIL-CORE-0002  
**Title:** Canonical Data Model  
**Owner:** Product Ops (PRODOPS)

---

## Inputs

- Mission 0001 (System Green Gate) complete.
- Product requirements for REIL: records (property/deal), contacts, source items (raw/normalized), documents, ledger events, audit log.
- Existing schema design and naming registry: `docs/02_DATA/schema-design.md`, `docs/NAMING_REGISTRY.md`.

---

## Acceptance criteria

- [ ] Canonical objects are defined: Record, Contact, Organization, Source Item (raw and normalized), Document, Ledger Event, Audit Log.
- [ ] Field names, types, and required/optional are specified for each canonical object.
- [ ] Normalization rules (connector payload → canonical shape) are documented or referenced.
- [ ] Entity resolution boundaries (e.g. contact matching, record linking) are described.
- [ ] Document is versioned and owned; no secrets in the doc.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Canonical data model | `docs/reil-core/CANONICAL_DATA_MODEL.md` |
| Normalization rules (reference) | `docs/reil-core/NORMALIZATION_RULES.md` |
| Entity resolution (reference) | `docs/reil-core/ENTITY_RESOLUTION.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0002 | Canonical model acceptance | Proof is the approved doc at `docs/reil-core/CANONICAL_DATA_MODEL.md`; optional receipt at `proofs/reil-core/PRODOPS-REIL-CANONICAL-0002-receipt.md` (to be created if needed) |

---

## Notes

- No secrets in any deliverable or proof.
