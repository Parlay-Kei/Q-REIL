# OAuth canonical guard receipt (PLATOPS-GMAIL-OAUTH-UNBLOCK-0040)

**Mission:** PLATOPS-GMAIL-OAUTH-UNBLOCK-0040  
**Date:** 2026-01-31  
**Scope:** Hard-fail guard when env client ID differs from token origin metadata.

---

## 1. Problem

Tokens in `scripts/oauth-proof/.tokens.json` are bound to the OAuth client that issued them. If `GOOGLE_OAUTH_CLIENT_ID` (or .env.local) is later changed to a different client (e.g. another GCP project), using the same .tokens.json leads to refresh failures or confusing Google errors. A clear, early guard prevents silent misuse.

---

## 2. Token origin metadata

When proof scripts write `.tokens.json`, they now persist **origin metadata** so the connector can verify consistency:

- **client_id** — OAuth client ID that issued the token (required for guard).
- **redirect_uri** — Redirect URI used for the flow (informational).

**Files that write .tokens.json:**

- `scripts/oauth-proof/proof-gmail-oauth.mjs` — writes `client_id` and `redirect_uri` into the JSON payload.
- `scripts/oauth-proof/one-time-auth.mjs` — same.

Existing `.tokens.json` files without `client_id` continue to work; the guard runs only when `client_id` is present in the file.

---

## 3. Hard-fail guard (implemented)

**Location:** `connectors/gmail/lib/oauth.js`, in `getOAuth2ClientFromTokensFile()`.

**Logic:**

1. If `GMAIL_REFRESH_TOKEN` is set in env, use it and **do not** read .tokens.json; **no guard** (no token origin metadata in that flow).
2. If using .tokens.json:
   - After parsing the file, if the file contains `client_id` and env has `GOOGLE_OAUTH_CLIENT_ID` (or fallback `GOOGLE_CLIENT_ID`), compare them.
   - If both are present and **not equal** → throw immediately with a clear error and remediation hint.
   - Error message includes last 20 chars of each client_id (to aid debugging without leaking full IDs) and the remediation hint below.

**Remediation hint (exact text in code):**

```text
Remediation: Use the same OAuth client as when the token was issued. Either (1) set GOOGLE_OAUTH_CLIENT_ID/GOOGLE_OAUTH_CLIENT_SECRET in repo root .env.local to match the client that issued the token in .tokens.json, or (2) re-run node scripts/oauth-proof/proof-gmail-oauth.mjs with the current client to obtain a new token.
```

**When guard does not run:**

- When using `GMAIL_REFRESH_TOKEN` (vault-only; no .tokens.json).
- When .tokens.json has no `client_id` (e.g. legacy file from before this change).
- When env has no `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_CLIENT_ID` (then createOAuth2Client() would already fail earlier).

---

## 4. Verification

- Proof scripts that write .tokens.json now include `client_id` (and `redirect_uri`).
- Connector `getOAuth2ClientFromTokensFile()` throws with the remediation hint when env client ID differs from token origin `client_id`.
- Guard is not applied when using `GMAIL_REFRESH_TOKEN` or when token file has no `client_id`.

---

## 5. References

- [OAUTH_ENV_LOADING_RECEIPT.md](./OAUTH_ENV_LOADING_RECEIPT.md)
- [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md)
- [OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md)
