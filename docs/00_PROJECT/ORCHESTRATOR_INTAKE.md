# Orchestrator intake template — Q REIL v0.1

**Use this template when accepting or drafting missions for Q REIL v0.1.**  
**OCS rule:** Any mission that does not explicitly reference PRD §6 (scope) and §10 (DoD) is **rejected**.

---

## Mission intake checklist

Before accepting or dispatching a mission:

- [ ] **PRD reference:** Mission explicitly references [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md).
- [ ] **Section 6 (MVP Scope):** Mission states how it aligns with in-scope items in §6, or explicitly defers out-of-scope work.
- [ ] **Section 10 (Definition of Done):** Mission states which of the seven DoD criteria it supports (or that it is prep work for them).
- [ ] **Header validator:** The mission brief text **contains** all three literals: `PRD_Q_REIL_v0.1`, `§6`, `§10` (prevents "referenced in name only"). See [OCS_RULES](../q-reil/OCS_RULES.md#mission-header-validator-binding).

If any of the above is missing, the mission is **rejected** until updated. See [OCS_RULES](../q-reil/OCS_RULES.md).

**Optional (ops):** To validate a mission brief file contains all three required strings, run:  
`./docs/00_PROJECT/validate-mission-brief.sh <path-to-brief.md>`

---

## Template: mission brief

```
**Mission:** [One-line title]

**PRD alignment:**
- §6 (Scope): [Which in-scope item(s) this supports, or "Out of scope — deferred per §6"]
- §10 (DoD): [Which of the 7 success criteria this supports, e.g. "DoD #1 Gmail OAuth", "DoD #5 Inbox UI"]

**Deliverable:** [What "done" looks like]
**Owner:** [Agent or role]
**Blocked by:** [If any]
```

---

## PRD quick ref

- **PRD:** `docs/q-reil/PRD_Q_REIL_v0.1.md` — **LOCKED**
- **§6** — MVP Scope (in scope: Gmail OAuth, ingestion, ledger, record types, linking, Inbox UI, record timeline, connector health; out of scope: sending email, docs, CRM, MLS/SkySlope/Yardi, bulk import, mobile).
- **§10** — Definition of Done: (1) Gmail OAuth E2E, (2) 7-day ingestion, (3) threads/messages/attachments persist, (4) ledger events for ingestion + linking, (5) Inbox UI real data, (6) manual attach works, (7) re-run = zero duplicates.
