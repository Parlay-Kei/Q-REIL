# OCS Gmail Send Proof — Phase 1 Complete, Phase 2 Manual Handoff

**Mission:** OCS Q REIL Gmail Send Proof with Scope Gate (FINAL)  
**Date:** 2026-02-02

---

## Phase 1 (Done)

- **Spawn:** QAG-QREIL-LIVE-GMAIL-SEND-SCOPE-CHECK-0301
- **Action:** `POST https://q-reil.vercel.app/api/gmail-test-send` with body per mission.
- **Result:** **Failure.** HTTP 503, `{ "status": "error", "reason": "Gmail OAuth not configured" }`
- **Receipt updated:** `proofs/q-reil/QAG-QREIL-LIVE-GMAIL-SEND-SCOPE-CHECK-0301-receipt.md` (response + run date)

**Verdict:** Failure branch. Proceed to Phase 2.

---

## Phase 2 — Platform Ops (Manual)

### 1. Mint refresh token (PLATOPS-QREIL-GMAIL-REFRESH-TOKEN-MINT-SEND-0302)

- Use **GMAIL_CLIENT_ID** and **GMAIL_CLIENT_SECRET** from Vercel q-reil Production (Settings → Environment Variables). Set locally as `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` (e.g. repo root `.env.local` or `scripts/oauth-proof/.env.local`).
- From repo root:
  ```bash
  cd scripts/oauth-proof && npm install && node one-time-auth.mjs
  ```
- Sign in with **stratanoble.co@gmail.com** and grant **Send email on your behalf** (gmail.send).
- Refresh token is written to `scripts/oauth-proof/.tokens.json`. Copy the `refresh_token` value only.
- Verify (redacted): `node scripts/oauth-proof/refresh-token.mjs` → access token obtained; scope set includes gmail.send.
- **Receipt:** `proofs/q-reil/PLATOPS-QREIL-GMAIL-REFRESH-TOKEN-MINT-SEND-0302-receipt.md` (already exists; update if you add run notes; no values in receipt).

### 2. Update Vercel (PLATOPS-QREIL-VERCEL-ENV-UPDATE-REFRESH-0303)

- Vercel Dashboard → Project **q-reil** → Settings → Environment Variables → **Production**.
- Set **GMAIL_REFRESH_TOKEN** to the newly minted token. Do not change GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, or GMAIL_SENDER_ADDRESS.
- Redeploy Production if needed for env to take effect.
- **Env keys assert (names only):** Confirm these four keys exist for Production: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_ADDRESS.
- **Receipts:** `proofs/q-reil/PLATOPS-QREIL-VERCEL-ENV-UPDATE-REFRESH-0303-receipt.md`, `proofs/q-reil/ENV_KEYS_ASSERT_RECEIPT_FINAL.md` (names only; no values).

---

## Phase 3 (After Phase 2)

- **Spawn:** QAG-QREIL-LIVE-GMAIL-SEND-AFTER-SCOPE-FIX-0304
- **Action:** Repeat same POST as Phase 1 with a **new** `approval_token`; capture `status: Sent` and `gmail_message_id`.
- **Updates:**  
  - `proofs/q-reil/QAG-REIL-GMAIL-TEST-SEND-PROOF-0005-receipt.md` — set Status: Sent, gmail_message_id  
  - `clients/strata-noble-internal/proofs/ENGDEL-OPS-CORE-GMAIL-SENDER-0061-ops-email-send-gmail-receipt.md` — set Status: Sent, gmail_message_id  
  - `proofs/q-reil/QAG-QREIL-LIVE-GMAIL-SEND-AFTER-SCOPE-FIX-0304-receipt.md` — response JSON (no secrets)

**OCS PASS** only after `gmail_message_id` is recorded in both 0005 and 0061.

---

When Phase 2 is complete, ask the agent to run Phase 3 (rerun live send and update all receipts).
