# Mission 0007 — Normalize and Match

**Mission ID:** REIL-CORE-0007  
**Title:** Normalize and Match  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0006 (Ingestion Smoke) complete; raw data in `source_items_raw`.
- Canonical model and normalization rules: `docs/reil-core/CANONICAL_DATA_MODEL.md`, `docs/reil-core/NORMALIZATION_RULES.md`, `docs/reil-core/ENTITY_RESOLUTION.md`.

---

## Acceptance criteria

- [ ] Pipeline or job reads from `source_items_raw` and writes canonical shapes to `source_items_normalized`.
- [ ] Normalization covers at least: message/thread → normalized item with standard field names; attachment → document link and normalized item where specified.
- [ ] Entity resolution (contact match, record link) runs per spec: match contacts by email/name, link items to records per rules.
- [ ] Idempotent: re-run does not duplicate normalized rows; updates in place or keyed upsert.
- [ ] Ledger or audit events emitted for normalize/match actions where specified.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Normalization implementation | Repo-specific (e.g. `connectors/gmail/lib/normalize.js` or pipeline in `connectors/gmail/lib/`); primary receipt references: `proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md`, `proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md` |
| Normalization rules (reference) | `docs/reil-core/NORMALIZATION_RULES.md` |
| Entity resolution (reference) | `docs/reil-core/ENTITY_RESOLUTION.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0007 | Normalize receipt | `proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md` |
| 0008 | Entity resolution receipt | `proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md` |

---

## Notes

- Mission 0007 covers both normalization and entity resolution (match). No secrets in any deliverable or proof.
