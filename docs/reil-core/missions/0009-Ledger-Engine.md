# Mission 0009 — Ledger Engine

**Mission ID:** REIL-CORE-0009  
**Title:** Ledger Engine  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0003 (DB Schema and Migrations) complete; `reil_ledger_events` table exists.
- Mission 0004 (DAL) and 0005 (Gmail Ingestion) complete; ledger writes from connector.
- Ledger spec: `docs/reil-core/LEDGER_EVENT_SPEC.md`, `docs/06_QA/LEDGER_EVENT_SPEC.md` or equivalent.

---

## Acceptance criteria

- [ ] Every ingestion and attachment action that must be auditable writes a ledger event (event type, actor, entity refs, payload shape per spec).
- [ ] Events are append-only; no PII (e.g. raw body) in payload.
- [ ] Ledger event schema and types are documented; invariants (e.g. ordering, no gaps for critical flows) are stated.
- [ ] Connector and any normalize/match pipeline call DAL to append ledger events.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Ledger event spec | `docs/reil-core/LEDGER_EVENT_SPEC.md` |
| Ledger writes (connector) | `connectors/gmail/lib/ledger.js` |
| Migration (ledger table) | `docs/02_DATA/migrations/00038_reil_ledger_events.sql` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0010 | Ledger receipt | `proofs/reil-core/ENGDEL-REIL-LEDGER-0010-receipt.md` |

---

## Notes

- Mission number 0009 = Ledger Engine; proof pack ID 0010 aligns with existing receipt numbering. No secrets in any deliverable or proof.
