# REIL Core Mission Index

**Owner:** OCS  
**Purpose:** Ordered checklist of REIL Core missions. No secrets in this file.

**Canonical directive (this sprint):** [OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md](../00_PROJECT/OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md) — Two-lane execution; Lane 2 (REIL core with seed fixtures) starts first; Lane 1 (Gmail/OAuth) runs in parallel and does not block Lane 2.

---

## Checklist (in order)

| # | Mission | Owner | Mission file | Status |
|---|---------|-------|--------------|--------|
| 0001 | System Green Gate | PLATOPS | [0001-System-Green-Gate.md](missions/0001-System-Green-Gate.md) | [ ] |
| 0002 | Canonical Data Model | PRODOPS | [0002-Canonical-Data-Model.md](missions/0002-Canonical-Data-Model.md) | [ ] |
| 0003 | DB Schema and Migrations | PLATOPS | [0003-DB-Schema-and-Migrations.md](missions/0003-DB-Schema-and-Migrations.md) | [ ] |
| 0004 | Data Access Layer | ENGDEL | [0004-Data-Access-Layer.md](missions/0004-Data-Access-Layer.md) | [ ] |
| 0005 | Gmail Ingestion | ENGDEL | [0005-Gmail-Ingestion.md](missions/0005-Gmail-Ingestion.md) | [ ] |
| 0006 | Ingestion Smoke | QAG | [0006-Ingestion-Smoke.md](missions/0006-Ingestion-Smoke.md) | [ ] |
| 0007 | Normalize and Match | ENGDEL | [0007-Normalize-and-Match.md](missions/0007-Normalize-and-Match.md) | [ ] |
| 0008 | Normalize Match QA | QAG | [0008-Normalize-Match-QA.md](missions/0008-Normalize-Match-QA.md) | [ ] |
| 0009 | Ledger Engine | ENGDEL | [0009-Ledger-Engine.md](missions/0009-Ledger-Engine.md) | [ ] |
| 0010 | Ledger Invariants QA | QAG | [0010-Ledger-Invariants-QA.md](missions/0010-Ledger-Invariants-QA.md) | [ ] |
| 0011 | Inbox UI | ENGDEL | [0011-Inbox-UI.md](missions/0011-Inbox-UI.md) | [ ] |
| 0012 | Records UI | ENGDEL | [0012-Records-UI.md](missions/0012-Records-UI.md) | [ ] |
| 0013 | E2E UI Smoke | QAG | [0013-E2E-UI-Smoke.md](missions/0013-E2E-UI-Smoke.md) | [ ] |
| 0014 | Exports | ENGDEL | [0014-Exports.md](missions/0014-Exports.md) | [ ] |
| 0015 | Prod Deploy | RELOPS | [0015-Prod-Deploy.md](missions/0015-Prod-Deploy.md) | [ ] |
| 0016 | Closeout | OCS | [0016-Closeout.md](missions/0016-Closeout.md) | [ ] |
| 0017 | OAuth env canon kickoff | OCS | — | [OAUTH_ENV_CANON.md](OAUTH_ENV_CANON.md) |
| 0018 | OAuth env canon implementation | PLATOPS | — | proofs/reil-core/PLATOPS-REIL-OAUTH-ENV-CANON-IMPLEMENT-0018-receipt.md |
| 0019 | Vercel env assert canon update | PLATOPS | — | proofs/reil-core/PLATOPS-REIL-VERCEL-ENV-ASSERT-CANON-0019-receipt.md |
| 0020 | OAuth env canon verify | QAG | — | proofs/reil-core/QAG-REIL-OAUTH-ENV-CANON-VERIFY-0020.md |
| **Lane 1: Gmail Ingestion to Live UI** | | | | [OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE](../00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md) |
| 0021 | Lane 1 Kickoff | OCS | — | docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md |
| 0022 | OAuth env canon end-to-end | PLATOPS | — | proofs/reil-core/PLATOPS-REIL-OAUTH-ENV-CANON-0022-receipt.md |
| 0023 | OAuth refresh token mint | PLATOPS | — | proofs/reil-core/PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md |
| 0024 | Vercel Production env set Gmail | PLATOPS | — | proofs/reil-core/PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024-receipt.md |
| 0025 | Gmail ingest run | ENGDEL | — | proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md |
| 0026 | Ingest smoke and idempotency | QAG | — | proofs/reil-core/QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md |
| 0027 | UI live switch with fallback | ENGDEL | — | proofs/reil-core/ENGDEL-REIL-UI-LIVE-SWITCH-0027-receipt.md |
| 0028 | Prod redeploy after Gmail env | RELOPS | — | proofs/reil-core/RELOPS-REIL-PROD-REDEPLOY-AFTER-GMAIL-0028-receipt.md |
| 0029 | Gmail send proof (optional) | QAG | — | proofs/reil-core/QAG-REIL-GMAIL-SEND-PROOF-0029.md |
| 0030 | Lane 1 Closeout | OCS | — | docs/reil-core/REIL_CORE_CLOSEOUT.md (Lane 1 link table) |

---

## Owner legend

| Code | Role |
|------|------|
| OCS | Orchestrator |
| PLATOPS | Platform Ops |
| PRODOPS | Product Ops |
| ENGDEL | Engineering Delivery |
| QAG | QA Gatekeeper |
| RELOPS | Release Ops |

---

## Proof pack index (by mission)

| Mission | Proof pack | Location |
|---------|------------|----------|
| 0001 | PLATOPS-REIL-SYSTEM-GREEN-0001 | `proofs/reil-core/PLATOPS-REIL-SYSTEM-GREEN-0001-receipt.md` (to be created) |
| 0002 | PRODOPS-REIL-CANONICAL-0002 | Optional receipt |
| 0003 | PLATOPS-REIL-SUPABASE-SCHEMA-0003 | `proofs/reil-core/PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md` |
| 0004 | ENGDEL-REIL-DAL-0004 | `proofs/reil-core/ENGDEL-REIL-DAL-0004-receipt.md` |
| 0005 | ENGDEL-REIL-GMAIL-INGEST-0005 | `proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md` |
| 0006 | QAG-REIL-INGEST-SMOKE-0006 | `proofs/reil-core/QAG-REIL-INGEST-SMOKE-0006.md` |
| 0007 | ENGDEL-REIL-NORMALIZE-0007, ENGDEL-REIL-ENTITY-RESOLUTION-0008 | `proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md`, `proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md` |
| 0008 | QAG-REIL-NORMALIZE-MATCH-QA-0009 | `proofs/reil-core/QAG-REIL-NORMALIZE-MATCH-QA-0009.md` |
| 0009 | ENGDEL-REIL-LEDGER-0010 | `proofs/reil-core/ENGDEL-REIL-LEDGER-0010-receipt.md` |
| 0010 | QAG-REIL-LEDGER-INVARIANTS-0011 | `proofs/reil-core/QAG-REIL-LEDGER-INVARIANTS-0011.md` |
| 0011 | ENGDEL-REIL-INBOX-UI-0012 | `proofs/reil-core/ENGDEL-REIL-INBOX-UI-0012-receipt.md` |
| 0012 | ENGDEL-REIL-RECORDS-UI-0013 | `proofs/reil-core/ENGDEL-REIL-RECORDS-UI-0013-receipt.md` |
| 0013 | QAG-REIL-UI-SMOKE-0014 | `proofs/reil-core/QAG-REIL-UI-SMOKE-0014.md` |
| 0014 | ENGDEL-REIL-EXPORTS-0015 | `proofs/reil-core/ENGDEL-REIL-EXPORTS-0015-receipt.md` |
| 0015 | RELOPS-REIL-CORE-PROD-DEPLOY-0017 | `proofs/reil-core/RELOPS-REIL-CORE-PROD-DEPLOY-0017.md` |
| 0016 | QAG-REIL-AUDIT-EXPORT-QA-0016, closeout | `proofs/reil-core/QAG-REIL-AUDIT-EXPORT-QA-0016.md`, `docs/reil-core/REIL_CORE_CLOSEOUT.md` |

---

## References

- **Execution order (canonical run list):** [EXECUTION_ORDER.md](EXECUTION_ORDER.md) — REIL Core execution list, beginning to end; use for future modules and handoffs.
- **OAuth env canon (contract):** [OAUTH_ENV_CANON.md](OAUTH_ENV_CANON.md) — canonical keys and legacy aliases; all downstream reference this.
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Missions:** [missions/](missions/)
- **Proofs:** [proofs/reil-core/README.md](../../proofs/reil-core/README.md)
