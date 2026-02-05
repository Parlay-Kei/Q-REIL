# REIL Core Roadmap

**Owner:** OCS  
**Version:** 1.0  
**Status:** Active  

This document defines phases and milestones for REIL Core. No secrets are stored in this file.

---

## Phases

### Phase 1 — Foundation (Missions 0001–0003)

**Goal:** System green, canonical model agreed, database schema and migrations in place.

| Milestone | Mission | Description |
|-----------|---------|-------------|
| M1.1 | 0001 System Green Gate | CI green: lint, typecheck, migrations apply; no P0 security findings. |
| M1.2 | 0002 Canonical Data Model | Canonical objects and normalization rules documented. |
| M1.3 | 0003 DB Schema and Migrations | REIL tables and migrations (00034–00040) applied; RLS and storage documented. |

**Exit criteria:** All Phase 1 missions complete; proof pack 0003 (schema) signed.

---

### Phase 2 — Ingestion and Data (Missions 0004–0008)

**Goal:** Data access layer, Gmail ingestion, smoke test, normalize/match and QA.

| Milestone | Mission | Description |
|-----------|---------|-------------|
| M2.1 | 0004 Data Access Layer | DAL for raw/normalized upserts, documents, ledger. |
| M2.2 | 0005 Gmail Ingestion | Connector ingests threads/messages/attachments into REIL; idempotent. |
| M2.3 | 0006 Ingestion Smoke | QA proof: raw rows, storage, no duplicates on rerun. |
| M2.4 | 0007 Normalize and Match | Normalization and entity resolution pipeline. |
| M2.5 | 0008 Normalize Match QA | QA proof: normalized rows and links correct. |

**Exit criteria:** All Phase 2 missions complete; proof packs 0004–0009 signed.

---

### Phase 3 — Ledger and QA (Missions 0009–0010)

**Goal:** Ledger engine implemented and invariants verified.

| Milestone | Mission | Description |
|-----------|---------|-------------|
| M3.1 | 0009 Ledger Engine | All auditable actions write ledger events; spec and invariants documented. |
| M3.2 | 0010 Ledger Invariants QA | QA proof: event types, no PII in payload, invariants hold. |

**Exit criteria:** All Phase 3 missions complete; proof packs 0010–0011 signed.

---

### Phase 4 — UI and E2E (Missions 0011–0013)

**Goal:** Inbox and Records UI shipped; E2E smoke passed.

| Milestone | Mission | Description |
|-----------|---------|-------------|
| M4.1 | 0011 Inbox UI | Inbox list, thread/message detail, attach-to-record. |
| M4.2 | 0012 Records UI | Records list, record detail, timeline/linked items. |
| M4.3 | 0013 E2E UI Smoke | QA proof: Inbox and Records routes load and render; no P0 errors. |

**Exit criteria:** All Phase 4 missions complete; proof packs 0012–0014 signed.

---

### Phase 5 — Export and Release (Missions 0014–0016)

**Goal:** Audit export, production deploy, closeout.

| Milestone | Mission | Description |
|-----------|---------|-------------|
| M5.1 | 0014 Exports | Ledger/audit export by org and time range; spec and receipt. |
| M5.2 | 0015 Prod Deploy | REIL Core deployed to production; deployment receipt. |
| M5.3 | 0016 Closeout | All proofs and receipts linked; REIL Core stamped done. |

**Exit criteria:** All Phase 5 missions complete; proof packs 0015–0017 and closeout doc signed.

---

## Milestone summary

| Phase | Missions | Key proof packs |
|-------|----------|-----------------|
| 1 — Foundation | 0001–0003 | 0001 (green), 0002 (canonical), 0003 (schema) |
| 2 — Ingestion and Data | 0004–0008 | 0004–0009 |
| 3 — Ledger and QA | 0009–0010 | 0010–0011 |
| 4 — UI and E2E | 0011–0013 | 0012–0014 |
| 5 — Export and Release | 0014–0016 | 0015–0017, closeout |

---

## References

- **Mission index:** [MISSION_INDEX.md](MISSION_INDEX.md)
- **Missions folder:** [missions/](missions/)
- **Proof pack index:** [proofs/reil-core/README.md](../../proofs/reil-core/README.md)
- **Closeout:** [REIL_CORE_CLOSEOUT.md](REIL_CORE_CLOSEOUT.md)
