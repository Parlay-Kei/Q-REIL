# REIL Core Execution Order

**Purpose:** Canonical execution list for REIL Core, beginning to end. Use this as the reference for future modules and for handoffs.

**Owner:** OCS  
**No secrets in this file.**

---

## Phase 0 — Foundation

| Step | Owner | Mission | Outcome | Proof / Docs |
|------|-------|---------|---------|--------------|
| 1 | PLATOPS | **0001 System Green Gate** | Typecheck and lint pass; baseline project sanity. | `proofs/reil-core/PLATOPS-REIL-SYSTEM-GREEN-0001-receipt.md` |
| 2 | PRODOPS | **0002 Canonical Data Model** | Canonical objects and relationships defined; acceptance criteria written. | `docs/reil-core/CANONICAL_DATA_MODEL.md`, `docs/reil-core/ACCEPTANCE_CRITERIA.md` |
| 3 | PLATOPS | **0003 DB Schema and Migrations** | Tables, constraints, triggers, idempotency, append-only ledger. | `proofs/reil-core/PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md` |
| 4 | ENGDEL | **0004 Data Access Layer** | Typed DAL; UI uses DAL only. | `proofs/reil-core/ENGDEL-REIL-DAL-0004-receipt.md` |
| 5 | ENGDEL | **Seed fixtures (deterministic build lane)** | Seeded org, raw items, normalized items, record links, ledger events. | `docs/02_DATA/seeds/reil_core_seed.sql`, `docs/02_DATA/seeds/README.md` |

---

## Phase 1 — Core pipeline

| Step | Owner | Mission | Outcome | Proof / Docs |
|------|-------|---------|---------|--------------|
| 6 | ENGDEL | **0007 Normalize and Match** | Raw → normalized, deterministic, idempotent; record link stub. | `proofs/reil-core/ENGDEL-REIL-NORMALIZE-MATCH-0007-receipt.md` |
| 7 | ENGDEL | **0009 Ledger Engine** | Append-only ledger events, timeline; UI actions produce events. | `proofs/reil-core/ENGDEL-REIL-LEDGER-ENGINE-0009-receipt.md` |
| 8 | QAG | **0010 Ledger Invariants QA** | Append-only enforcement, deterministic ordering, idempotency. | `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0010.md` PASS |

---

## Phase 2 — UI and E2E

| Step | Owner | Mission | Outcome | Proof / Docs |
|------|-------|---------|---------|--------------|
| 9 | ENGDEL | **0011 Inbox UI** | Inbox list and item detail render from DAL; normalized status; link-to-record writes `record_links` and ledger event. | `proofs/reil-core/ENGDEL-REIL-INBOX-UI-0011-receipt.md` |
| 10 | ENGDEL | **0012 Records UI** | Record detail shows documents, links, timeline; ledger types mapped; actions append events. | `proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0012-receipt.md` |
| 11 | QAG | **0013 E2E UI Smoke** | Inbox → record workflow passes end to end. | `proofs/reil-core/QAG-REIL-E2E-UI-SMOKE-0013.md` PASS |

---

## Phase 3 — Export and Release

| Step | Owner | Mission | Outcome | Proof / Docs |
|------|-------|---------|---------|--------------|
| 12 | ENGDEL | **0014 Exports** | Deterministic CSV and JSON export flows from UI. | `proofs/reil-core/ENGDEL-REIL-EXPORTS-0014-receipt.md` |
| 13 | RELOPS | **0015 Prod Deploy truth** | Production READY; correct commit; correct build config; seeded UI works. | `proofs/reil-core/RELOPS-REIL-PROD-DEPLOY-0015-receipt.md` |
| 14 | OCS | **0016 Closeout** | Closeout links every receipt and proof; Lane 2 complete; Lane 1 next action documented. | `docs/reil-core/REIL_CORE_CLOSEOUT.md` |

---

## Summary (run order)

1. PLATOPS 0001 — System Green Gate  
2. PRODOPS 0002 — Canonical Data Model  
3. PLATOPS 0003 — DB Schema and Migrations  
4. ENGDEL 0004 — Data Access Layer  
5. ENGDEL — Seed fixtures (deterministic build lane)  
6. ENGDEL 0007 — Normalize and Match  
7. ENGDEL 0009 — Ledger Engine  
8. QAG 0010 — Ledger Invariants QA  
9. ENGDEL 0011 — Inbox UI  
10. ENGDEL 0012 — Records UI  
11. QAG 0013 — E2E UI Smoke  
12. ENGDEL 0014 — Exports  
13. RELOPS 0015 — Prod Deploy truth  
14. OCS 0016 — Closeout  

---

## References

- **Mission index:** [MISSION_INDEX.md](MISSION_INDEX.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Missions:** [missions/](missions/)
- **Closeout:** [REIL_CORE_CLOSEOUT.md](REIL_CORE_CLOSEOUT.md)
- **Lane 1 next action (one sentence):** Canonicalize OAuth env names to `GMAIL_*` everywhere, mint a refresh token with the same client id and secret the runtime uses, and ensure scopes include Gmail read plus Gmail send if you are testing send. (See closeout doc.)
