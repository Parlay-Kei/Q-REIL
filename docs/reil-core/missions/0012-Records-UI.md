# Mission 0012 — Records UI

**Mission ID:** REIL-CORE-0012  
**Title:** Records UI  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0011 (Inbox UI) complete; record linking from Inbox available.
- Canonical model: `docs/reil-core/CANONICAL_DATA_MODEL.md`.
- UI shell and nav: `docs/03_UI/ui-shell-design.md`, `docs/q-suite/SCREEN_INDEX.md`.

---

## Acceptance criteria

- [ ] Records screen lists records (property/deal) for the org with key fields (title, status, type).
- [ ] Record detail shows timeline or activity: linked source items (e.g. emails), documents, and ledger events where specified.
- [ ] User can open linked items (e.g. thread/message) from record detail; navigation consistent with Inbox.
- [ ] RLS / tenant isolation enforced; no cross-org data.
- [ ] No secrets in frontend code or config.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Records page | `q-suite-ui/src/pages/Records.tsx` |
| Record detail | `q-suite-ui/src/pages/RecordDetail.tsx` |
| Records UI spec (reference) | `docs/03_UI/` (component-library, ui-shell-design as needed) |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0013 | Records UI receipt | `proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0013-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof.
