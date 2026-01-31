# QA-801 — Definition of Done Matrix

**Mission ID:** QREIL QA-801  
**Owner:** backend-qa-automation-tester  
**Brief (PRD_Q_REIL_v0.1 §6 §10):** Run idempotency and duplication tests for ingestion and linking. Verify the seven Section 10 criteria. Produce a binary PASS or FAIL for each criterion with evidence. No coverage chasing. Only truth.

**Dependencies:** AUTH-101, BE-301, IMPL-900, BE-302.

---

## Section 10 — Seven Success Criteria

| # | Criterion (PRD §10) | PASS / FAIL | Evidence ID |
|---|----------------------|-------------|-------------|
| 1 | Gmail OAuth works end to end | PASS | E1 |
| 2 | Initial 7-day ingestion completes successfully | PASS | E2 |
| 3 | Threads, messages, and attachments persist correctly | PASS | E3 |
| 4 | Ledger events are written in code for ingestion and linking | PASS | E4 |
| 5 | Inbox UI displays real data from the database | PASS | E5 |
| 6 | Manual attach links an email to a record | PASS | E6 |
| 7 | Re-running ingestion produces zero duplicates | **FAIL** | E7 |

---

## Summary

- **Criteria 1–6:** PASS per receipts and code (Evidence Pack E1–E6).
- **Criterion 7:** **FAIL** until runtime proof. PRD §10 #7 is binary: PASS requires evidence from a real run (two sync runs, same mailbox and 7-day window, row counts unchanged after run B). Schema + upserts is not proof. See [QA-801-E7](QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md) for runtime verification; E7 flips to PASS only when that receipt shows zero duplicates.
- **Duplication (linking):** `record_links` unique; manual attach returns 409 on duplicate (E6).

Evidence details: `docs/q-reil/receipts/QA-801_EVIDENCE_PACK.md`.
