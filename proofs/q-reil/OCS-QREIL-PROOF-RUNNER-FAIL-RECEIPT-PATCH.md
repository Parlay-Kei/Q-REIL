# OCS: Q REIL Proof Runner — Persist Failure Receipts Patch

**Mission:** Ensure step 0814 always writes and commits receipts, even when status is not Sent. Job still fails and blocks PASS when verdict is FAIL.

---

## Summary

- **Workflow:** `.github/workflows/q-reil-proof-runner.yml`
- **Step:** Gmail proof POST (0814)
- **Commit SHA of workflow change:** `c46ede1`

---

## Changes

### Step 0814 (Gmail proof POST)

1. **Always write receipts** — No longer exit before writing; receipts are written for every run.
2. **Receipts written:**
   - `proofs/q-reil/QAG-REIL-GMAIL-TEST-SEND-PROOF-0005-receipt.md`
   - `proofs/q-reil/QAG-QREIL-GMAIL-MESSAGE-ID-PROOF-0814-receipt.md`
   - `clients/strata-noble-internal/proofs/ENGDEL-OPS-CORE-GMAIL-SENDER-0061-ops-email-send-gmail-receipt.md`
3. **Receipt fields:** Run URL, timestamp UTC, request body (approval_token, to, subject only), response status and reason, gmail_message_id (blank if missing), verdict (PASS only when status=Sent and gmail_message_id present, else FAIL).
4. **Verdict output:** `steps.gmail_proof.outputs.verdict` set to `PASS` or `FAIL`.
5. **Resilient parsing:** Invalid or non-JSON response body does not abort the step; status/msg_id/reason fallback to safe values.

### Job control

- **After writing receipts:** Step 0814 no longer exits 1. A dedicated step *Fail job if Gmail proof verdict is FAIL* runs after the commit step and exits 1 when `verdict == 'FAIL'`, so the run still fails and blocks PASS.

### Commit step

- **Unchanged.** Commit message: `chore(proofs): persist proof-runner receipts [skip ci]`. Receipts are committed whether PASS or FAIL because 0814 always writes them.

---

## Commit SHA

Commit SHA of the workflow change: **`c46ede1`**
