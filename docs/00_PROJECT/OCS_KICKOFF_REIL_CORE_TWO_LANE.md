# OCS Kickoff: REIL Core Two-Lane Execution

**Date:** 2026-02-02  
**Status:** ACTIVE  
**Canonical directive:** [OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md](OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md)

---

## Locked directive

This sprint uses **docs/00_PROJECT/OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md** as the single source of truth. No new gates outside the directive.

---

## Lane assignment

| Lane | Owner focus | Blocks |
|------|-------------|--------|
| **Lane 1** | Unblock Gmail ingestion (PLATOPS 0008, ENGDEL Gmail ingest rerun, QAG ingest smoke) | Real data only; does not block Lane 2. |
| **Lane 2** | Build REIL core with seeded data (DAL, Normalize/Match, Ledger, Inbox UI, Records UI, E2E smoke, Exports, Prod deploy, Closeout) | None; OAuth does not block Lane 2. |

**Lane 2 starts first.** Seed fixtures drive deterministic results; no Gmail dependency for core build.

---

## Acceptance (kickoff)

- [x] Directive locked as canonical.
- [ ] Lane owners acknowledge assignments (ENGDEL, QAG, PLATOPS, RELOPS, OCS).
- [ ] No new gates added outside the directive.

**Data path (Lane 2):** Inbox and Records pages read **only through DAL** — no direct Supabase calls in UI. Data flow: `reilInboxApi` / `reilRecordsApi` → `reilDal` / `reil-dal` → Supabase. Seeded rows are read when `VITE_USE_REIL_CORE_INBOX=true` and `VITE_REIL_ORG_ID` is set to the seed org; seed SQL: `docs/02_DATA/seeds/reil_core_seed.sql`.

---

## Merge point

When Lane 1 clears: **Flip UI data source** from seed fixtures to live DB rows populated by ingestion; keep seed fixtures as fallback only (Owner: ENGDEL).

---

## References

- Mission index: [docs/reil-core/MISSION_INDEX.md](../reil-core/MISSION_INDEX.md)
- Proof pack: [proofs/reil-core/README.md](../../proofs/reil-core/README.md)
