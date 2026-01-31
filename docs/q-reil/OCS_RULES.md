# OCS Rules — Q REIL v0.1

**Operational Control Standard.** These rules govern mission intake and scope for Q REIL v0.1. **PRD landing file:** [PRD_POINTER.md](PRD_POINTER.md) (canonical path, status, version, enforcement rule—stable, never changes).

---

## Mission intake rule (binding)

**Any mission that does not explicitly reference [PRD_Q_REIL_v0.1](PRD_Q_REIL_v0.1.md) Section 6 (MVP Scope) and Section 10 (Definition of Done) is rejected.**

- **Section 6** — Scope: in-scope vs out-of-scope for v0.1.
- **Section 10** — DoD: seven success criteria; all must be true for v0.1 complete.

Missions must state how they align with §6 and which §10 criteria they support (or that they are out of scope and deferred).

---

## Mission header validator (binding)

To prevent "referenced in name only," every mission brief **must contain** these three literals in the brief text:

| Required | Purpose |
|----------|--------|
| `PRD_Q_REIL_v0.1` | Names the governing PRD |
| `§6` | MVP Scope (in/out of scope) |
| `§10` | Definition of Done (seven criteria) |

**Rule:** If any of the three is missing from the mission brief, the mission is **rejected**. No exception. Use the [orchestrator intake template](../00_PROJECT/ORCHESTRATOR_INTAKE.md) when drafting or accepting missions. If you have an automated mission validator in your ops toolchain, add a check that the brief includes all three strings above.

---

## PRD status

| Item | Value |
|------|--------|
| File | `docs/q-reil/PRD_Q_REIL_v0.1.md` |
| Status | **LOCKED** |
| Governance | Changes require version bump, rationale, stakeholder acknowledgment (PRD §14). |

Receipt recorded: `docs/q-reil/RECEIPTS.md` (PRD LOCKED).
