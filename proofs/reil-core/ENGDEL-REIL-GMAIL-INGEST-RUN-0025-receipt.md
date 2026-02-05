# ENGDEL-REIL-GMAIL-INGEST-RUN-0025 — Receipt

**Mission:** ENGDEL-REIL-GMAIL-INGEST-RUN-0025  
**Owner:** ENGDEL  
**Outcome:** Gmail ingestion writes to source_items_raw and documents for at least one message.  
**Acceptance:** Ingest exits 0; raw table has ≥1 gmail row; documents table has ≥1 gmail document row if attachments exist in the test mailbox.

---

## Execution

- Runner: `node connectors/gmail/run-sync.mjs` (or equivalent ingest entrypoint).
- Env: `NEXT_PUBLIC_SUPABASE_URL` (or `VITE_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, and OAuth canonical keys (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).

---

## Acceptance checklist

| Check | Result |
|-------|--------|
| Ingest exit code | 0 |
| source_items_raw: at least 1 gmail row | *(yes/no)* |
| documents: at least 1 gmail document row (if test mailbox has attachments) | *(yes/no \| N/A)* |

---

## References

- OAuth: [PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md](PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md)
- Ingest: `connectors/gmail/run-sync.mjs`, `connectors/gmail/lib/ingest.js`
