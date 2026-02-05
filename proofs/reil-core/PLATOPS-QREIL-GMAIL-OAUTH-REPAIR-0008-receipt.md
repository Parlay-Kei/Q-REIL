# PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008 Receipt

**Mission:** PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008  
**Owner:** PLATOPS  
**Goal:** Produce a refresh token valid for the configured OAuth client (with send capability) and install it in Vercel project q-reil Production env.

---

## 1. Execution Summary

| Step | Description | Status |
|------|-------------|--------|
| OAuth client vs. token | Confirm the OAuth client in use matches the refresh token's client | **FAIL** — refresh returned `unauthorized_client`; client in env does not match token issuer |
| Mint refresh token | Mint fresh refresh token with correct scopes (gmail.send + connector needs) | **Pending** — PLATOPS must run `node scripts/oauth-proof/proof-gmail-oauth.mjs` with same client as q-reil/Vercel |
| Update Production env (q-reil) | Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_ADDRESS | Pending (after mint) |

---

## 2. Keys Updated (names only; no secrets)

| Key | Updated in q-reil Production |
|-----|------------------------------|
| GMAIL_CLIENT_ID | *(no — pending mint)* |
| GMAIL_CLIENT_SECRET | *(no)* |
| GMAIL_REFRESH_TOKEN | *(no)* |
| GMAIL_SENDER_ADDRESS | *(no)* |

---

## 3. Acceptance / Auth Check

| Check | Result | Timestamp |
|-------|--------|-----------|
| Token validation (refresh exchange; no unauthorized_client) | **FAIL** | 2026-02-02 |
| Ingester can authenticate and list messages | **FAIL** (not run; token invalid) | 2026-02-02 |

**Validation run:** `node scripts/oauth-proof/refresh-token.mjs` → exit 1, `oauth_refresh_failure`, `error: unauthorized_client`, `error_description: Unauthorized`. Env loaded from `q-reil/.env.local`; client_id and client_secret present; refresh_token present in `.tokens.json` but issued by a different OAuth client.

**Stop condition:** No handoff until PASS. PLATOPS must (1) mint a new refresh token with the **same** OAuth client as in q-reil/.env.local (or Vercel Production): `node scripts/oauth-proof/proof-gmail-oauth.mjs`; (2) re-run `node scripts/oauth-proof/refresh-token.mjs` until PASS; (3) then run `node connectors/gmail/run-sync.mjs` to confirm ingester list messages PASS; (4) install tokens in Vercel q-reil Production and re-run validation if needed.

**Delegate + execute:** See [PLATOPS-NEXT-STEPS-0008.md](PLATOPS-NEXT-STEPS-0008.md) for ordered steps. Automated re-run (token validation): FAIL (unchanged). Ingester check not run. PLATOPS: complete Step 1 (mint), then re-run Steps 2–3 until PASS.

---

*Receipt for PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008. No secrets in this file.*
