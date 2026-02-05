# Mission 0006 — Ingestion Smoke

**Mission ID:** REIL-CORE-0006  
**Title:** Ingestion Smoke  
**Owner:** QA Gatekeeper (QAG)

---

## Inputs

- Mission 0005 (Gmail Ingestion) complete.
- Test mailbox with valid Gmail OAuth (credentials via env; no secrets in mission docs).
- Supabase project with migrations applied and `mail-attachments` bucket available.

---

## Acceptance criteria

- [ ] One full sync run completes successfully (exit 0, JSON output with counts).
- [ ] `source_items_raw` contains message rows and, if applicable, attachment rows for the test mailbox and window.
- [ ] Stored attachments have corresponding rows in `documents` and objects in storage.
- [ ] Second run over the same window produces no duplicate rows (counts unchanged).
- [ ] Ledger events exist for sync and message/attachment where specified; no raw email body in event payloads.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Ingestion smoke proof | `proofs/reil-core/QAG-REIL-INGEST-SMOKE-0006.md` |
| Verify script (optional) | `scripts/be-301-verify/run-sync.sh`, `scripts/be-301-verify/README.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0006 | Ingest smoke | `proofs/reil-core/QAG-REIL-INGEST-SMOKE-0006.md` |

---

## Notes

- No secrets in any deliverable or proof. Evidence table in proof may reference counts and query shapes only.
