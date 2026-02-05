# OCS-QREIL-SYSTEM-GREEN — Phase 0 System Green Gate

**Gate:** OCS-QREIL-SYSTEM-GREEN-GATE-0001  
**Owner:** OCS  
**Date:** 2026-02-02

---

## Criterion

- Run the **Proof Runner** (`.github/workflows/q-reil-proof-runner.yml`).
- Confirm **PASS** is stamped with a **real `gmail_message_id`** in receipts **0005** and **0061**.

---

## Proof Runner

- **Workflow:** Q REIL Proof Runner  
- **Triggered:** 2026-02-02 (workflow_dispatch)  
- **Run ID:** 21606520232  
- **Run URL:** https://github.com/Parlay-Kei/Q-REIL/actions/runs/21606520232  
- **Inputs:** `run_env_set_prod=true`, `force_redeploy=true`  
- **Status at stamp:** Run was **queued**; completion and receipt commit pending.

---

## Message ID evidence

Message ID evidence is the **`gmail_message_id`** value returned by `POST https://q-reil.vercel.app/api/gmail-test-send` when the Proof Runner step **0814** runs and receives `{ "status": "Sent", "gmail_message_id": "<id>" }`. That value is written into:

| Receipt | Path |
|--------|------|
| **0005** | `proofs/q-reil/QAG-REIL-GMAIL-TEST-SEND-PROOF-0005-receipt.md` |
| **0061** | `clients/strata-noble-internal/proofs/ENGDEL-OPS-CORE-GMAIL-SENDER-0061-ops-email-send-gmail-receipt.md` |

- **Current:** At time of stamp, run 21606520232 was queued; a local POST to the same endpoint returned `{"status":"error","reason":"invalid_client"}`. Therefore **no real `gmail_message_id`** is yet recorded in 0005 or 0061.
- **When run completes with PASS:** Pull `main`, read the **gmail_message_id** and **OCS verdict** from either receipt above, and add it below.

### Cited message ID (fill after Proof Runner PASS)

- **gmail_message_id:** *(to be filled from receipts 0005 / 0061 when run 21606520232 completes with PASS)*
- **Receipt 0005 verdict:** *(PASS when gmail_message_id present)*
- **Receipt 0061 verdict:** *(PASS when gmail_message_id present)*

---

## Done when

- [x] `proofs/q-reil/OCS-QREIL-SYSTEM-GREEN.md` exists.  
- [ ] It cites a **real `gmail_message_id`** from receipts 0005 and 0061 (pending Proof Runner run completion and PASS).

---

## Next steps

1. Wait for Proof Runner run **21606520232** to complete (or re-trigger if cancelled).  
2. If the run **passes:** `git pull origin main`, read `gmail_message_id` from receipt 0005 or 0061, update the "Cited message ID" section above, and mark the second done-when item complete.  
3. If the run **fails:** Address cause (e.g. production `invalid_client` / OAuth config), then re-run the Proof Runner and repeat.
