# OAuth Refresh Failure Debug Receipt — PLATOPS-OAUTH-PAIR-FINGERPRINT-0043

**Mission:** PLATOPS-OAUTH-PAIR-FINGERPRINT-0043  
**Owner:** Platform Ops  
**Date:** 2026-01-31  
**Scope:** Minimal debug receipt when refresh fails; never log tokens or secrets.

---

## Verdict: **COMPLETE**

- When a refresh fails, a single JSON receipt is emitted to stderr with: token endpoint, grant_type, whether a refresh_token was present, error string, and error_description (when available).
- Tokens and secrets are never included in the receipt.

---

## 1. Receipt shape

Emitted as one line to stderr (`console.error(JSON.stringify(receipt))`):

| Field | Type | Description |
|-------|------|-------------|
| `receipt` | string | `oauth_refresh_failure` |
| `token_endpoint` | string | URL used for the token request (e.g. `https://oauth2.googleapis.com/token`) |
| `grant_type` | string | `refresh_token` |
| `refresh_token_present` | boolean | Whether a refresh_token was available for the request |
| `error` | string \| null | Error code or message (e.g. `invalid_grant`, `unauthorized_client`) |
| `error_description` | string \| null | Provider `error_description` when available |

---

## 2. Where the receipt is emitted

| Call site | When | Data source |
|-----------|------|-------------|
| `scripts/oauth-proof/refresh-token.mjs` | `fetch(TOKEN_ENDPOINT)` returns `!res.ok` | Response body `data.error`, `data.error_description`; `refresh_token_present` from local token read. |
| `connectors/gmail/run-sync.mjs` | Catch block after `runSync()` when error looks like auth/refresh (401, invalid_grant, unauthorized_client, invalid_client) | `readTokensFile()` and `GMAIL_REFRESH_TOKEN` for `refresh_token_present`; `err.code` / `err.message` for error/description. |

---

## 3. Implementation details

**oauth.js**

- `logRefreshFailureReceipt(opts)` exported.
- Defaults: `token_endpoint: 'https://oauth2.googleapis.com/token'`, `grant_type: 'refresh_token'`.
- Only serializes the receipt object; no token or secret fields accepted or logged.

**refresh-token.mjs**

- Imports `logRefreshFailureReceipt` from `../../connectors/gmail/lib/oauth.js`.
- On `!res.ok`: calls `logRefreshFailureReceipt({ tokenEndpoint, grantType: 'refresh_token', refreshTokenPresent: !!refreshToken, error: data.error ?? 'unknown', errorDescription: data.error_description ?? null })`, then existing error output and exit.

**run-sync.mjs**

- Imports `logRefreshFailureReceipt` and `readTokensFile`.
- In catch: if message indicates auth/refresh failure, calls `logRefreshFailureReceipt` with endpoint, grant_type, refresh_token_present from file/env, and error/errorDescription from the caught error.

---

## 4. Files touched

| File | Change |
|------|--------|
| `connectors/gmail/lib/oauth.js` | Add and export `logRefreshFailureReceipt(opts)`. |
| `scripts/oauth-proof/refresh-token.mjs` | On refresh HTTP failure, call `logRefreshFailureReceipt` with response and token presence. |
| `connectors/gmail/run-sync.mjs` | On auth-like errors, call `logRefreshFailureReceipt` with token presence and error info. |

No tokens or secrets are ever logged in the receipt.
