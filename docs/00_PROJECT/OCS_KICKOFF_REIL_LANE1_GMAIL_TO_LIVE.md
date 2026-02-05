# OCS Kickoff: Lane 1 — Gmail Ingestion to Live UI

**Mission:** OCS-REIL-LANE1-GMAIL-TO-LIVE-KICKOFF-0021  
**Owner:** OCS  
**Date:** 2026-02-02  
**Status:** ACTIVE  
**Lane 1 status:** **READY TO EXECUTE** (not PASS until execution proofs 0023–0028 have filled receipts with real run evidence).  
**Canonical directive:** [OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md](OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md)

---

## One-sentence Lane 1 action

**Lane 1: Unblock Gmail ingestion (hard dependency for real data).**

Defined in both places:

1. **[OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md](OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md)** — Section "Lane 1: Unblock Gmail Ingestion (hard dependency for real data)" and plain-text paste block "LANE 1 — Unblock Gmail ingestion (hard dependency for real data)".
2. **[OCS_KICKOFF_REIL_CORE_TWO_LANE.md](OCS_KICKOFF_REIL_CORE_TWO_LANE.md)** — Lane assignment table: Lane 1 owner focus "Unblock Gmail ingestion (PLATOPS 0008, ENGDEL Gmail ingest rerun, QAG ingest smoke)".

---

## Locked scope

Lane 1 unblocks **ingest only**; no extra gates. This kickoff locks scope and stop conditions for the Gmail-to-Live execution sequence (missions 0021–0030).

---

## Locked owners

| Mission range | Owners |
|---------------|--------|
| 0021, 0030 | OCS |
| 0022, 0023, 0024 | PLATOPS |
| 0025, 0027 | ENGDEL |
| 0026, 0029 | QAG |
| 0028 | RELOPS |

---

## Stop conditions

| # | Condition |
|---|-----------|
| 1 | **No Gmail ingest run** until OAuth validation passes. |
| 2 | **No UI live switch** until ingest smoke passes and idempotency is proven. |

---

## Lane 1 execution order (0021 → 0030)

| Mission ID | Owner | Outcome |
|------------|--------|---------|
| 0021 | OCS | Kickoff and lock scope *(this doc)* |
| 0022 | PLATOPS | Canonicalize OAuth env key names end-to-end |
| 0023 | PLATOPS | Mint refresh token with same OAuth client as runtime |
| 0024 | PLATOPS | Set Vercel Production env for q-reil (four Gmail keys) |
| 0025 | ENGDEL | Run Gmail ingest and write rows |
| 0026 | QAG | Ingest smoke and idempotency verdict |
| 0027 | ENGDEL | Switch UI from seed mode to live mode with safe fallback |
| 0028 | RELOPS | Redeploy after env change and confirm production truth |
| 0029 | QAG | Gmail message-id proof *(optional; only if send scope present)* |
| 0030 | OCS | Closeout update — link all receipts, mark Lane 1 PASS |

---

## Deliverables

- **This kickoff doc:** `docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md` — locked scope, owners, stop conditions, execution order 0021→0030, and pointer to the one-sentence Lane 1 action in both directive and two-lane kickoff.
- **Per-mission receipts:** Each mission 0022–0030 produces a receipt or proof in `proofs/reil-core/` or `proofs/q-reil/` as specified in the execution order table.
- **Closeout (0030):** Closeout link table complete, Lane 1 marked PASS, REIL marked Live Data Enabled.

---

## Acceptance (kickoff)

- [x] Directive says Lane 1 unblocks ingest only; no extra gates.
- [x] Stop conditions documented: no ingest until OAuth valid; no UI live until ingest smoke + idempotency.
- [x] Deliverable: `docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md` (this file).
- [x] Kickoff doc points to the one-sentence Lane 1 action in both places: [OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md](OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md) and [OCS_KICKOFF_REIL_CORE_TWO_LANE.md](OCS_KICKOFF_REIL_CORE_TWO_LANE.md).

---

## Evidence gate (Lane 1 → PASS)

Lane 1 is **READY TO EXECUTE**. Build artifacts and receipt templates exist for 0021–0030. Lane 1 is **PASS** only after filled receipts with real run evidence for:

| Mission | Evidence required |
|---------|--------------------|
| 0023 | OAuth consent mint: real timestamp, validation evidence (token present, scope list, redaction compliance) |
| 0024 | Vercel prod env: four keys verified by name; env inventory output redacted |
| 0025 | Ingest run: exit status, raw row count, attachment path if present |
| 0026 | Ingest smoke + idempotency: before/after counts, second run zero duplicates, verdict PASS |
| 0028 | Redeploy: Production READY, prod URL, commit SHA, Inbox behavior |

- **Audit verdict (0031):** [proofs/reil-core/OCS-REIL-LANE1-AUDIT-EXEC-0031-verdict.md](../../proofs/reil-core/OCS-REIL-LANE1-AUDIT-EXEC-0031-verdict.md) — Lane 1 BLOCKED until 0023–0028 have filled evidence.
- **Missing inputs:** [OCS_LANE1_MISSING_INPUTS_REGISTER.md](OCS_LANE1_MISSING_INPUTS_REGISTER.md)
- **Execution routing:** [OCS_LANE1_EXEC_ROUTING_0031_0038.md](OCS_LANE1_EXEC_ROUTING_0031_0038.md)

---

## References

- Mission index: [docs/reil-core/MISSION_INDEX.md](../reil-core/MISSION_INDEX.md)
- Proof pack: [proofs/reil-core/](../../proofs/reil-core/)
- OAuth contract: [docs/reil-core/OAUTH_ENV_CANON.md](../reil-core/OAUTH_ENV_CANON.md)
