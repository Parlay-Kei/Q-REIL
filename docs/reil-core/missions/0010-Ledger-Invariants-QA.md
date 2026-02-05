# Mission 0010 — Ledger Invariants QA

**Mission ID:** REIL-CORE-0010  
**Title:** Ledger Invariants QA  
**Owner:** QA Gatekeeper (QAG)

---

## Inputs

- Mission 0009 (Ledger Engine) complete.
- Ledger spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`.
- Test run with ingestion and optional normalize/match producing ledger events.

---

## Acceptance criteria

- [ ] For a full sync + normalize run, expected event types are present (e.g. sync.started, sync.completed, message.ingested, attachment.saved, item.normalized, record.linked).
- [ ] No ledger payload contains raw email body, PII beyond allowed identifiers, or secrets.
- [ ] Invariants from spec hold: e.g. every message.ingested has a corresponding source row; ordering or sequence id is consistent where required.
- [ ] Evidence: query results or export sample attached to proof; no secrets in proof.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Ledger invariants QA proof | `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0011.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0011 | Ledger invariants QA | `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0011.md` |

---

## Notes

- No secrets in any deliverable or proof.
