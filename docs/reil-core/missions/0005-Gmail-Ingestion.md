# Mission 0005 — Gmail Ingestion

**Mission ID:** REIL-CORE-0005  
**Title:** Gmail Ingestion  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0004 (Data Access Layer) complete.
- Gmail connector OAuth and API access (tokens via env or secure store; no secrets in mission docs).
- Spec: `docs/05_INBOX/gmail-ingestion-service.md`, `docs/00_PROJECT/Execution-Packet_v0.2-Gmail.md`.

---

## Acceptance criteria

- [ ] Connector runs a configurable backfill window (e.g. last 7 days) and supports incremental sync via Gmail `historyId` or equivalent.
- [ ] Messages and threads are written to `source_items_raw` with idempotency keys (e.g. `gmail:msg:<messageId>`, `gmail:att:<messageId>:<attachmentId>`).
- [ ] Headers, snippet, body text, and attachment metadata are stored in payload; attachment blobs in storage with pointer rows in `documents`.
- [ ] Ledger events are emitted for sync start/complete and per-message/attachment where specified.
- [ ] Re-run over the same window produces no duplicate rows (idempotent upsert).

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Gmail ingest | `connectors/gmail/lib/ingest.js` |
| Gmail attachments (download and store) | `connectors/gmail/lib/attachments.js` |
| Gmail ledger writes | `connectors/gmail/lib/ledger.js` |
| Gmail sync entrypoint | `connectors/gmail/run-sync.mjs` |
| Load env (no secrets in repo) | `connectors/gmail/lib/load-env.js` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0005 | Gmail ingest receipt | `proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof. Tokens and keys are loaded from environment or secure vault.
