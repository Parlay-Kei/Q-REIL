# OCS DIRECTIVE: REIL Core Build, Two-Lane Execution

**Date:** 2026-02-02  
**Status:** ACTIVE  
**Scope:** Start-to-finish team execution

---

## Lane 1: Unblock Gmail Ingestion (hard dependency for real data)

### PLATOPS 0008: Gmail OAuth Repair

| | |
|---|--|
| **Outcome** | Refresh token refresh succeeds using the same client as Q SUITE **"q-reil"**, and scopes include **gmail.send**. |
| **Acceptance** | Refresh-token validation PASS, then ingester can list messages. |

### ENGDEL 0009: Gmail Ingest Rerun

| | |
|---|--|
| **Outcome** | **source_items_raw** gets Gmail rows, **documents** gets attachment pointers when present. |
| **Acceptance** | Exit 0, at least 1 raw row, and rerun is idempotent. |

### QAG 0010: Ingest Smoke Rerun

| | |
|---|--|
| **Outcome** | Counts before/after first ingest/after second ingest show no duplicates. |
| **Acceptance** | PASS verdict in the ingest smoke proof. |

---

## Lane 2: Build the REIL Core with Seeded Data (no waiting on Gmail)

### ENGDEL 0004: Data Access Layer

| | |
|---|--|
| **Outcome** | Repo has a clean DB client layer for reads/writes used by UI and ledger engine. |
| **Acceptance** | Typed functions, no direct SQL scattered in UI. |

### ENGDEL 0007: Normalize and Match

| | |
|---|--|
| **Outcome** | Deterministic normalization pipeline from raw source items to normalized entities, plus matching heuristics. |
| **Acceptance** | Normalized records created from seed fixtures, rerun idempotent. |

### ENGDEL 0009: Ledger Engine

| | |
|---|--|
| **Outcome** | **ledger_events** append-only writes and timeline reads work from seed fixtures. |
| **Acceptance** | Invariants enforced, basic event types present in timeline. |

### QAG 0010: Ledger Invariants QA

| | |
|---|--|
| **Outcome** | Prove append-only, ordering, idempotency. |
| **Acceptance** | PASS. |

### ENGDEL 0011: Inbox UI

| | |
|---|--|
| **Outcome** | Inbox renders threads/items from DB and shows status, linked records, and timeline entry points. |
| **Acceptance** | Works on seeded rows, then switches to real Gmail rows when Lane 1 clears. |

### ENGDEL 0012: Records UI

| | |
|---|--|
| **Outcome** | Record detail view shows documents, links, and ledger timeline. |
| **Acceptance** | Renders from DB rows, creates updates that produce ledger events. |

### QAG 0013: E2E UI Smoke

| | |
|---|--|
| **Outcome** | User can navigate Inbox → Record → Timeline and see stable data. |
| **Acceptance** | PASS. |

### ENGDEL 0014: Exports

| | |
|---|--|
| **Outcome** | Export records and ledger events to CSV or JSON. |
| **Acceptance** | Export files include required fields, deterministic. |

### RELOPS 0015: Prod Deploy

| | |
|---|--|
| **Outcome** | Production **READY** on correct root directory and framework settings, release gate satisfied. |
| **Acceptance** | Deploy confirmed, final smoke coordinated. |

### OCS 0016: Closeout

| | |
|---|--|
| **Outcome** | Closeout doc links every receipt, proof pack, and deployment. |
| **Acceptance** | Mission index status maintained, closeout pack complete. |

---

## Stop Conditions

- **No new "pressure testing" gates.** Only ship blockers.
- **OAuth mismatch is a ship blocker for ingestion only** (does not block Lane 2 core build on seeded data).

---

## Plain-text paste block (Slack / email)

```
OCS DIRECTIVE: REIL Core Build, Two-Lane Execution — 2026-02-02

LANE 1 — Unblock Gmail ingestion (hard dependency for real data)
• PLATOPS 0008 Gmail OAuth Repair: refresh token under Q SUITE "q-reil", scopes include gmail.send. Accept: refresh-token validation PASS, ingester can list messages.
• ENGDEL 0009 Gmail Ingest Rerun: source_items_raw gets Gmail rows, documents gets attachment pointers. Accept: exit 0, ≥1 raw row, rerun idempotent.
• QAG 0010 Ingest Smoke Rerun: counts before/after first and second ingest show no duplicates. Accept: PASS in ingest smoke proof.

LANE 2 — Build REIL core with seeded data (no waiting on Gmail)
• ENGDEL 0004 Data Access Layer: clean DB client for UI and ledger. Accept: typed functions, no raw SQL in UI.
• ENGDEL 0007 Normalize and Match: raw → normalized + matching. Accept: seed fixtures, rerun idempotent.
• ENGDEL 0009 Ledger Engine: ledger_events append-only + timeline from seeds. Accept: invariants, event types in timeline.
• QAG 0010 Ledger Invariants QA: append-only, ordering, idempotency. Accept: PASS.
• ENGDEL 0011 Inbox UI: threads/items from DB, status, linked records, timeline. Accept: seeded then real when Lane 1 clears.
• ENGDEL 0012 Records UI: record detail = documents, links, ledger timeline. Accept: from DB, updates produce ledger events.
• QAG 0013 E2E UI Smoke: Inbox → Record → Timeline, stable data. Accept: PASS.
• ENGDEL 0014 Exports: records + ledger to CSV/JSON. Accept: required fields, deterministic.
• RELOPS 0015 Prod Deploy: READY, correct root/framework, release gate. Accept: deploy + final smoke.
• OCS 0016 Closeout: closeout doc links every receipt, proof pack, deployment.

STOP CONDITIONS: No new pressure-testing gates. Only ship blockers. OAuth mismatch = ship blocker for ingestion only.
```
