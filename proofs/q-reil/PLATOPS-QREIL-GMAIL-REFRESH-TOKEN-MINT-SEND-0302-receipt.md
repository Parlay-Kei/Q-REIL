# PLATOPS-QREIL-GMAIL-REFRESH-TOKEN-MINT-SEND-0302 — Receipt

**Mission:** OCS Q REIL Gmail Send Proof with Scope Gate (FINAL) — Phase 2  
**Spawn:** PLATOPS-QREIL-GMAIL-REFRESH-TOKEN-MINT-SEND-0302  
**Date:** 2026-02-02

---

## Objective

Mint a new Gmail refresh token for **stratanoble.co@gmail.com** using the existing OAuth client id and secret already set in Vercel q-reil. Scopes must include **gmail.send** (required for `/api/gmail-test-send`). No values printed in logs or receipts.

---

## Scope list (used by one-time-auth / proof script)

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read Gmail (sync) |
| `https://www.googleapis.com/auth/gmail.send` | Send mail (test-send endpoint) |
| `openid` | Sign-in |
| `https://www.googleapis.com/auth/userinfo.email` | Email for mailbox |

---

## Procedure (Platform Ops)

1. **Credentials:** Use GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET from Vercel q-reil Production (Settings → Environment Variables). Set locally as `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` (or in `scripts/oauth-proof/.env.local` / repo root `.env.local`).
2. **Mint:** From repo root run:
   - `cd scripts/oauth-proof && npm install && node one-time-auth.mjs`
   - Or: `node scripts/oauth-proof/one-time-auth.mjs` with env set.
   - Complete browser sign-in with **stratanoble.co@gmail.com** and grant **Send email on your behalf** (gmail.send).
3. **Output:** Refresh token is written to `scripts/oauth-proof/.tokens.json`. Copy the `refresh_token` value only for the next step; do not commit or log it.
4. **Verification (redacted):** Run `node scripts/oauth-proof/refresh-token.mjs`; confirm it returns an access token (no values in receipt). Scope list in `.tokens.json` should include `gmail.send`.

---

## Verification that refresh works (redacted)

- **Refresh script:** `scripts/oauth-proof/refresh-token.mjs`
- **Result:** Access token obtained; scope set includes gmail.send. *(No token values in this receipt.)*

---

## Deliverable

This receipt. Scope list and procedure above; verification redacted.
