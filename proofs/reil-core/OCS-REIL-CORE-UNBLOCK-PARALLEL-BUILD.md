# OCS: REIL Core unblocks + parallel build

**Paste-ready OCS directive to coordinate all owners.**

---

OCS RUN: REIL Core unblocks + parallel build

Priority lane A (OAuth unblock)
1) PLATOPS execute PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008 now. Do not hand off until acceptance is PASS for:
   a) token validation
   b) ingester can list messages
   Update proofs/reil-core/PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008-receipt.md with PASS/FAIL and timestamp.

2) When PLATOPS PASS is recorded, ENGDEL runs ENGDEL-REIL-GMAIL-INGEST-RERUN-0009 immediately and fills:
   proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-RERUN-0009-receipt.md (exit code, counts, timestamp).

3) When ENGDEL receipt shows successful ingest, QAG completes the rerun steps in §6 of:
   proofs/reil-core/QAG-REIL-INGEST-SMOKE-0006.md and sets Overall verdict to PASS.

Priority lane B (Build now on seeded data)
ENGDEL continues executing parallel build and updates:
proofs/reil-core/ENGDEL-REIL-PARALLEL-BUILD-0011-receipt.md
Ship order: 0007 Normalize/Match → 0009 Ledger Engine → 0011 Inbox UI → 0012 Records UI.
Stop only when all four are implemented and UI is reading from DB rows and ledger_events.

OCS monitors both lanes. No additional documentation tasks beyond receipts already defined.
