# Mission 0014 — Exports

**Mission ID:** REIL-CORE-0014  
**Title:** Exports  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0009 (Ledger Engine) and 0010 (Ledger Invariants QA) complete.
- Audit/compliance requirement: export ledger events and/or audit log for a scope (org, time range, entity).

---

## Acceptance criteria

- [ ] Export path exists for ledger events (and optionally audit log): by org, time range, and optionally entity id.
- [ ] Export format is documented (e.g. JSON lines or CSV); no PII in export beyond what is allowed by policy.
- [ ] Export is read-only and respects RLS; only authorized roles can trigger.
- [ ] No secrets in export output or in code paths that generate it.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Export implementation | Repo-specific (e.g. `scripts/` or API route); primary receipt: `proofs/reil-core/ENGDEL-REIL-EXPORTS-0015-receipt.md` |
| Export spec or runbook | `docs/reil-core/` or `docs/06_QA/` (audit export); exact path per project |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0015 | Exports receipt | `proofs/reil-core/ENGDEL-REIL-EXPORTS-0015-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof.
