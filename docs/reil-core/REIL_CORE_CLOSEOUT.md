# REIL Core closeout — OCS-REIL-CORE-CLOSEOUT-0018

**Ticket:** OCS-REIL-CORE-CLOSEOUT-0018  
**Owner:** OCS  
**Date:** 2026-02-02  
**Condition:** Stamp REIL Core as done only when the QA proofs and production receipts exist.

---

## Closeout status

REIL Core is stamped **done** for Phase 7 Production release. All required QA proofs and production receipts are present. **Lane 1 (Gmail Ingestion to Live UI)** link table is complete; Lane 1 is marked **PASS** when all receipts 0021–0030 are executed and verified. **REIL Live Data Enabled** when Lane 1 PASS.

---

## Proof packs (links)

### Production deployment

| ID | Receipt | Description |
|----|---------|-------------|
| 0015 | [RELOPS-REIL-PROD-DEPLOY-0015-receipt](../../proofs/reil-core/RELOPS-REIL-PROD-DEPLOY-0015-receipt.md) | Prod deploy truth check: READY, commit, root dir, Supabase env, Inbox/Records on seeded data |
| 0017 | [RELOPS-REIL-CORE-PROD-DEPLOY-0017](../../proofs/reil-core/RELOPS-REIL-CORE-PROD-DEPLOY-0017.md) | Release Ops — REIL Core prod deploy: deployment id, commit sha, READY |

### Platform Ops

| ID | Receipt | Description |
|----|---------|-------------|
| 0003 | [PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt](../../proofs/reil-core/PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md) | Supabase schema for REIL Core |

### Engineering delivery

| ID | Receipt | Description |
|----|---------|-------------|
| 0004 | [ENGDEL-REIL-DAL-0004-receipt](../../proofs/reil-core/ENGDEL-REIL-DAL-0004-receipt.md) | REIL DAL |
| 0005 | [ENGDEL-REIL-GMAIL-INGEST-0005-receipt](../../proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md) | Gmail ingest |
| 0007 | [ENGDEL-REIL-NORMALIZE-0007-receipt](../../proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md) | Normalization |
| 0008 | [ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt](../../proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md) | Entity resolution |
| 0010 | [ENGDEL-REIL-LEDGER-0010-receipt](../../proofs/reil-core/ENGDEL-REIL-LEDGER-0010-receipt.md) | Ledger |
| 0011 | [ENGDEL-REIL-INBOX-UI-0011-receipt](../../proofs/reil-core/ENGDEL-REIL-INBOX-UI-0011-receipt.md) | Inbox UI finish (DAL join, match_status, Link to record) |
| 0012 | [ENGDEL-REIL-INBOX-UI-0012-receipt](../../proofs/reil-core/ENGDEL-REIL-INBOX-UI-0012-receipt.md) | Inbox UI (raw + normalized) |
| 0012 | [ENGDEL-REIL-RECORDS-UI-0012-receipt](../../proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0012-receipt.md) | Records UI finish (documents, links, timeline) |
| 0013 | [ENGDEL-REIL-RECORDS-UI-0013-receipt](../../proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0013-receipt.md) | Records UI (list, detail, attach, override) |
| 0014 | [ENGDEL-REIL-EXPORTS-0014-receipt](../../proofs/reil-core/ENGDEL-REIL-EXPORTS-0014-receipt.md) | Exports (CSV + JSON, deterministic) |
| 0015 | [ENGDEL-REIL-EXPORTS-0015-receipt](../../proofs/reil-core/ENGDEL-REIL-EXPORTS-0015-receipt.md) | Exports (CSV) |

### QA proofs

| ID | Proof | Description |
|----|-------|-------------|
| 0006 | [QAG-REIL-INGEST-SMOKE-0006](../../proofs/reil-core/QAG-REIL-INGEST-SMOKE-0006.md) | Ingest smoke |
| 0009 | [QAG-REIL-NORMALIZE-MATCH-QA-0009](../../proofs/reil-core/QAG-REIL-NORMALIZE-MATCH-QA-0009.md) | Normalize match QA |
| 0011 | [QAG-REIL-LEDGER-INVARIANTS-0011](../../proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0011.md) | Ledger invariants |
| 0013 | [QAG-REIL-E2E-UI-SMOKE-0013](../../proofs/reil-core/QAG-REIL-E2E-UI-SMOKE-0013.md) | E2E UI smoke (Inbox → Link to record → Record timeline) |
| 0014 | [QAG-REIL-UI-SMOKE-0014](../../proofs/reil-core/QAG-REIL-UI-SMOKE-0014.md) | UI smoke |
| 0016 | [QAG-REIL-AUDIT-EXPORT-QA-0016](../../proofs/reil-core/QAG-REIL-AUDIT-EXPORT-QA-0016.md) | Audit export QA |

---

## Checklist (OCS)

- [x] QA proofs exist (0006, 0009, 0011, 0014, 0016).
- [x] Production receipt exists (0017 — deployment id, commit sha, READY).
- [x] Engineering and platform receipts exist for REIL Core scope.
- [x] Closeout document created with links to proof packs.

---

---

## Lane 2 (mission index)

Lane 2 items (REIL Core with seed fixtures) are marked complete for this closeout: 0011 Inbox UI finish, 0012 Records UI finish, 0013 E2E UI Smoke, 0014 Exports, 0015 Prod Deploy truth, 0016 Closeout. Receipts and proofs linked above.

---

## Lane 1: Gmail Ingestion to Live UI (missions 0021–0030)

**Kickoff:** [docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md](../00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md)

| Mission ID | Owner | Receipt / Proof |
|------------|--------|------------------|
| 0021 | OCS | Kickoff — scope locked (OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md) |
| 0022 | PLATOPS | [PLATOPS-REIL-OAUTH-ENV-CANON-0022-receipt](../../proofs/reil-core/PLATOPS-REIL-OAUTH-ENV-CANON-0022-receipt.md) |
| 0023 | PLATOPS | [PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt](../../proofs/reil-core/PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md) |
| 0024 | PLATOPS | [PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024-receipt](../../proofs/reil-core/PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024-receipt.md) |
| 0025 | ENGDEL | [ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt](../../proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md) |
| 0026 | QAG | [QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026](../../proofs/reil-core/QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md) |
| 0027 | ENGDEL | [ENGDEL-REIL-UI-LIVE-SWITCH-0027-receipt](../../proofs/reil-core/ENGDEL-REIL-UI-LIVE-SWITCH-0027-receipt.md) |
| 0028 | RELOPS | [RELOPS-REIL-PROD-REDEPLOY-AFTER-GMAIL-0028-receipt](../../proofs/reil-core/RELOPS-REIL-PROD-REDEPLOY-AFTER-GMAIL-0028-receipt.md) |
| 0029 | QAG | [QAG-REIL-GMAIL-SEND-PROOF-0029](../../proofs/reil-core/QAG-REIL-GMAIL-SEND-PROOF-0029.md) *(optional; only if send scope present)* |
| 0030 | OCS | Closeout update — this section |

**Lane 1 status:** **READY TO EXECUTE** (not PASS). Build artifacts and receipt templates exist for 0021–0030. Lane 1 is **PASS** only when receipts 0023–0028 are filled with real run evidence and audit 0031 verdict is VERIFIED. **REIL Live Data Enabled** when Lane 1 PASS. See [OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md](../00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md) (Evidence gate) and [OCS_LANE1_EXEC_ROUTING_0031_0038.md](../00_PROJECT/OCS_LANE1_EXEC_ROUTING_0031_0038.md).

---

## Lane 1 next action (without dragging Lane 2)

**One sentence:** Canonicalize OAuth env names to `GMAIL_*` everywhere, mint a refresh token with the same client id and secret the runtime uses, and ensure scopes include Gmail read plus Gmail send if you are testing send.

**OAuth failure is not because keys are "not labeled identically."** Env screenshots show two naming schemes: one uses `GMAIL_CLIENT_ID`, another uses `GOOGLE_OAUTH_CLIENT_ID`. That mismatch can cause a token minted under one client to be validated against another → `unauthorized_client` every time.

**Do in Lane 1 only:**

1. **Canonicalize to one naming scheme end-to-end.**  
   Pick one: e.g. `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` everywhere, or `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` everywhere. Update Vercel env, Supabase env (if used), OAuth scripts (`scripts/oauth-proof`), and any docs so the same names are used in every environment.

2. **Ensure the refresh token is minted by the same client id and secret that the runtime uses.**  
   Run the OAuth flow (e.g. `scripts/oauth-proof`) with the same client id/secret that the ingest or UI runtime reads from env. Do not mint with one set of vars and run with another.

3. **Ensure scopes include Gmail read for ingest and Gmail send if testing send via the endpoint.**  
   OAuth consent: `https://www.googleapis.com/auth/gmail.readonly` (ingest); add `https://www.googleapis.com/auth/gmail.send` if testing send.

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Closeout** | `docs/reil-core/REIL_CORE_CLOSEOUT.md` |
| **Lane 1 OAuth canonicalize** | See "Lane 1 next action" above; doc as needed in `docs/q-suite/OAUTH_CANON.md` or env map |
