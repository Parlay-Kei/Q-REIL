# Gmail Sync Verification Receipt

**Mission:** BEQA-OPS-901-TOKEN-MINT-AND-VERIFY-0054  
**Owner:** Backend QA  
**Date:** 2026-02-01

## Requirement

- Run **refresh-token.mjs** → expect success (JSON with `access_token`, `expires_in`).
- Run **connectors/gmail/run-sync.mjs** → expect sync success (7-day backfill).

For a **passing** run: operator must first mint a fresh refresh token via `scripts/oauth-proof/one-time-auth.mjs` (auth URL includes `access_type=offline` and `prompt=consent`), store the refresh token in vault as `GMAIL_REFRESH_TOKEN` (repo root `.env.local` or canonical env), then run the commands below.

---

## Actual run output (2026-02-01)

### 1. refresh-token.mjs

```bash
node scripts/oauth-proof/refresh-token.mjs
```

**Result:** Exit code 1 (refresh failed).

**stderr (env sanity):**

```json
{
  "receipt": "oauth_env_sanity",
  "client_id_present": true,
  "client_secret_present": true,
  "client_id_redacted": "...tent.com",
  "client_secret_redacted": "[REDACTED]",
  "load_env_selected_file": "C:\\Dev\\Q-REIL\\q-reil\\.env.local"
}
```

**stderr (debug receipt):**

```json
{
  "receipt": "oauth_refresh_failure",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "grant_type": "refresh_token",
  "refresh_token_present": true,
  "error": "unauthorized_client",
  "error_description": "Unauthorized"
}
```

**stdout:** `{"error":"Unauthorized"}`

**Conclusion:** Token in `.tokens.json` was issued by a different OAuth client or has been revoked. To get a **passing** run: mint a fresh token with `npm run one-time-auth` in `scripts/oauth-proof` (canonical client; auth URL already has `access_type=offline` and `prompt=consent`), then store the new `refresh_token` in vault as `GMAIL_REFRESH_TOKEN` and re-run `refresh-token.mjs`.

---

### 2. connectors/gmail/run-sync.mjs

```bash
node connectors/gmail/run-sync.mjs
```

**Result:** Exit code 1 (OAuth refresh failed before sync).

**stderr:** Same env sanity receipt; then `oauth_refresh_failure` with `unauthorized_client`, `Unauthorized`. Stack trace: `GaxiosError: unauthorized_client` at token endpoint.

**Conclusion:** Sync did not run; token refresh failed. After operator mints a fresh token and sets `GMAIL_REFRESH_TOKEN` in vault, re-run this command for 7-day backfill and expect `ok: true` with `threadsIngested`, `messagesIngested`, `attachmentsSaved`, and `errors: []`.

---

## Expected passing output (after mint + vault)

**refresh-token.mjs (success):**
```json
{"access_token":"ya29....","expires_in":3599}
```
Exit code 0.

**run-sync.mjs (success):**
```json
{
  "ok": true,
  "threadsIngested": N,
  "messagesIngested": M,
  "attachmentsSaved": A,
  "errors": []
}
```
Exit code 0.

---

## Passing run checklist

- [ ] Fresh refresh token minted via `one-time-auth.mjs` (access_type=offline, prompt=consent).
- [ ] `GMAIL_REFRESH_TOKEN` stored in vault (repo root `.env.local` or same env as client id/secret).
- [ ] `node scripts/oauth-proof/refresh-token.mjs` → exit 0, JSON with `access_token`, `expires_in`.
- [ ] `node connectors/gmail/run-sync.mjs` → exit 0, JSON with `ok: true`, counts, `errors: []`.

---

**Status:** Run attempted; refresh failed (unauthorized_client). Procedure and expected passing behavior documented. Operator action required to mint fresh token and re-run for full verification.
