# REIL Core Proof Pack

**Purpose:** How proofs are written and linked for REIL Core. No secrets in this file or in any proof.

---

## What goes here

This folder holds **proof pack** artifacts that verify REIL Core missions:

- **Engineering / Platform receipts:** Implementation complete (e.g. ENGDEL-REIL-DAL-0004-receipt.md, PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md).
- **QA proofs:** Verification steps, evidence table, and verdict (e.g. QAG-REIL-INGEST-SMOKE-0006.md, QAG-REIL-LEDGER-INVARIANTS-0011.md).
- **Release receipts:** Production deployment metadata (e.g. RELOPS-REIL-CORE-PROD-DEPLOY-0017.md).

---

## How proofs are written

1. **Naming**
   - Receipts: `{OWNER}-REIL-{TOPIC}-{MISSION_ID}-receipt.md` (e.g. ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md).
   - QA proofs: `QAG-REIL-{TOPIC}-{MISSION_ID}.md` (e.g. QAG-REIL-INGEST-SMOKE-0006.md).
   - Release: `RELOPS-REIL-CORE-PROD-DEPLOY-0017.md` (fixed ID for prod deploy).

2. **Required sections (receipt)**
   - Ticket / mission ID and owner.
   - Status (e.g. Implemented, Verified).
   - Implementation summary or run summary (what was done, key files).
   - Evidence: command run, query results, or link to CI; **no secrets, no tokens, no keys.**

3. **Required sections (QA proof)**
   - Ticket / mission ID and owner.
   - Prerequisites (env, data, no secrets in doc).
   - Verification steps (numbered).
   - Evidence table: check, query/action, expected, actual (fill after run).
   - Verdict: Pass / Fail / Blocked.

4. **Required sections (release receipt)**
   - Deployment id, commit SHA, timestamp, environment (e.g. production).
   - Status: READY or equivalent.
   - No secrets; only public URLs and metadata.

---

## How proofs are linked

- **From missions:** Each mission in `docs/reil-core/missions/` has a **Proof pack references** table with proof ID and path under `proofs/reil-core/`.
- **From closeout:** `docs/reil-core/REIL_CORE_CLOSEOUT.md` lists all proof packs with relative links to this folder.
- **From index:** `docs/reil-core/MISSION_INDEX.md` maps mission number → proof pack filename.

Use **relative paths** from repo root, e.g. `proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md`.

---

## Rules

- **No secrets:** Do not put API keys, tokens, passwords, or PII in any proof file.
- **Evidence only:** Queries, counts, and command output are fine; redact any accidental secrets.
- **Stable paths:** Mission deliverables and proof paths are exact; avoid moving files without updating mission index and closeout.

---

## Index of current proofs

| Proof file | Mission | Owner |
|------------|---------|-------|
| PLATOPS-REIL-SUPABASE-SCHEMA-0003-receipt.md | 0003 | PLATOPS |
| ENGDEL-REIL-DAL-0004-receipt.md | 0004 | ENGDEL |
| ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md | 0005 | ENGDEL |
| QAG-REIL-INGEST-SMOKE-0006.md | 0006 | QAG |
| ENGDEL-REIL-NORMALIZE-0007-receipt.md | 0007 | ENGDEL |
| ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md | 0007 | ENGDEL |
| QAG-REIL-NORMALIZE-MATCH-QA-0009.md | 0008 | QAG |
| ENGDEL-REIL-LEDGER-0010-receipt.md | 0009 | ENGDEL |
| QAG-REIL-LEDGER-INVARIANTS-0011.md | 0010 | QAG |
| ENGDEL-REIL-INBOX-UI-0012-receipt.md | 0011 | ENGDEL |
| ENGDEL-REIL-RECORDS-UI-0013-receipt.md | 0012 | ENGDEL |
| QAG-REIL-UI-SMOKE-0014.md | 0013 | QAG |
| ENGDEL-REIL-EXPORTS-0015-receipt.md | 0014 | ENGDEL |
| QAG-REIL-AUDIT-EXPORT-QA-0016.md | 0016 | QAG |
| RELOPS-REIL-CORE-PROD-DEPLOY-0017.md | 0015 | RELOPS |
| OCS-REIL-INGEST-BLOCKED-OAUTH-0007.md | OCS 0007 | OCS |
| PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008-receipt.md | 0008 | PLATOPS |
| ENGDEL-REIL-GMAIL-INGEST-RERUN-0009-receipt.md | 0009 | ENGDEL |
| QAG-REIL-INGEST-SMOKE-0006.md (RERUN-0010) | 0010 | QAG |
| ENGDEL-REIL-PARALLEL-BUILD-0011-receipt.md | 0011 | ENGDEL |

Proof to be created when gate is verified: `PLATOPS-REIL-SYSTEM-GREEN-0001-receipt.md` (Mission 0001).
