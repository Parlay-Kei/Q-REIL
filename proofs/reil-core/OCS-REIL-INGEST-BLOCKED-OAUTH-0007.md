# OCS-REIL-INGEST-BLOCKED-OAUTH-0007

**Mission:** OCS-REIL-INGEST-BLOCKED-OAUTH-0007  
**Owner:** OCS  
**Action:** Freeze ingest lane as “Blocked by OAuth”; mark missions 0005 and 0006 as blocked; route Platform Ops to fix OAuth.

---

The ingest lane is frozen as **Blocked by OAuth**. Mission **ENGDEL-REIL-GMAIL-INGEST-0005** (Gmail ingestion implementation) and mission **QAG-REIL-INGEST-SMOKE-0006** (ingest smoke verification) are marked **blocked** until a valid Gmail refresh token is installed for the configured OAuth client. Engineering delivery has completed the ingestion implementation and QA has documented the current state; both are blocked on OAuth. Platform Ops (PLATOPS) is routed to execute **PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008**: confirm OAuth client vs. token match, mint a fresh refresh token with the correct scopes (including `gmail.send` and connector requirements), and install `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, and `GMAIL_SENDER_ADDRESS` in the q-reil Vercel project Production env. Evidence: [ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md](ENGDEL-REIL-GMAIL-INGEST-0005-receipt.md) (implementation complete; run failed with `unauthorized_client`), [QAG-REIL-INGEST-SMOKE-0006.md](QAG-REIL-INGEST-SMOKE-0006.md) (verdict Blocked; OAuth invalid).
