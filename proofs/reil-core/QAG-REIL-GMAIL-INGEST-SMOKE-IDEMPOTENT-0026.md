# QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026 — Verdict

**Mission:** QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026  
**Owner:** QAG  
**Outcome:** Ingest works and re-run does not duplicate.  
**Acceptance:** Before and after counts recorded; second run adds zero duplicates; verdict PASS.

---

## Counts (before / after first ingest / after second ingest)

| Table / metric | Before first run | After first run | After second run |
|----------------|------------------|-----------------|------------------|
| source_items_raw (gmail) | *(count)* | *(count)* | *(count)* |
| documents (gmail) | *(count)* | *(count)* | *(count)* |

---

## Idempotency

| Check | Result |
|-------|--------|
| Second run adds zero new rows (no duplicates) | *(yes/no)* |
| Verdict | **PASS** / FAIL |

---

## References

- Ingest run: [ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md](ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md)
