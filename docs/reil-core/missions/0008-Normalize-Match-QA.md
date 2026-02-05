# Mission 0008 — Normalize Match QA

**Mission ID:** REIL-CORE-0008  
**Title:** Normalize Match QA  
**Owner:** QA Gatekeeper (QAG)

---

## Inputs

- Mission 0007 (Normalize and Match) complete.
- Test data: populated `source_items_raw` and resulting `source_items_normalized` and record/contact links.

---

## Acceptance criteria

- [ ] Normalized rows exist for each raw message (and attachment where applicable); field mapping matches spec.
- [ ] Entity resolution: contacts matched by email/name; items linked to correct records per rules.
- [ ] No duplicate normalized rows for the same source item; keying is correct.
- [ ] Spot-check: sample raw payload → normalized row → linked record/contact is consistent with `docs/reil-core/NORMALIZATION_RULES.md` and `docs/reil-core/ENTITY_RESOLUTION.md`.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Normalize match QA proof | `proofs/reil-core/QAG-REIL-NORMALIZE-MATCH-QA-0009.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0009 | Normalize match QA | `proofs/reil-core/QAG-REIL-NORMALIZE-MATCH-QA-0009.md` |

---

## Notes

- No secrets in any deliverable or proof.
