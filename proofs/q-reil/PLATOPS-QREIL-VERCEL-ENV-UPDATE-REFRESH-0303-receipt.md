# PLATOPS-QREIL-VERCEL-ENV-UPDATE-REFRESH-0303 — Receipt

**Mission:** OCS Q REIL Gmail Send Proof with Scope Gate (FINAL) — Phase 2  
**Spawn:** PLATOPS-QREIL-VERCEL-ENV-UPDATE-REFRESH-0303  
**Date:** 2026-02-02

---

## Objective

Update Vercel project **q-reil** Production:

- Set **GMAIL_REFRESH_TOKEN** to the newly minted token value (from PLATOPS-QREIL-GMAIL-REFRESH-TOKEN-MINT-SEND-0302).
- Do not change other keys.
- Do not print values.

---

## Procedure (names only)

1. Vercel Dashboard → Project **q-reil** → Settings → Environment Variables.
2. For **Production**, edit or add **GMAIL_REFRESH_TOKEN** with the new refresh token value. Do not alter **GMAIL_CLIENT_ID**, **GMAIL_CLIENT_SECRET**, or **GMAIL_SENDER_ADDRESS**.
3. Redeploy Production if required for env to take effect (or rely on next deployment).

---

## Env keys assert (names only)

Confirm the following four Gmail-related keys exist for **Production**:

| Key | Purpose |
|-----|--------|
| GMAIL_CLIENT_ID | OAuth client id |
| GMAIL_CLIENT_SECRET | OAuth client secret |
| GMAIL_REFRESH_TOKEN | Refresh token (updated in this step) |
| GMAIL_SENDER_ADDRESS | Optional; sender email (e.g. stratanoble.co@gmail.com) |

No values in this receipt.
