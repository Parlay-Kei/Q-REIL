# OAuth Secret Pair Guard Receipt — PLATOPS-OAUTH-PAIR-FINGERPRINT-0043

**Mission:** PLATOPS-OAUTH-PAIR-FINGERPRINT-0043  
**Owner:** Platform Ops  
**Date:** 2026-01-31  
**Scope:** Secret pair fingerprinting to eliminate the "client_id matches but secret is wrong" scenario.

---

## Verdict: **COMPLETE**

- Proof scripts write `client_id`, `redirect_uri`, and `client_secret_sha256` (SHA-256 of env secret at mint time) into `.tokens.json`.
- Connector (`connectors/gmail/lib/oauth.js`) enforces: when `.tokens.json` contains `client_secret_sha256`, the current env secret’s hash must match; otherwise hard fail with a clear remediation message.

---

## 1. Token file fingerprint at mint

| Field | Written by | When |
|-------|------------|------|
| `client_id` | proof-gmail-oauth.mjs, one-time-auth.mjs | On successful token exchange |
| `redirect_uri` | proof-gmail-oauth.mjs, one-time-auth.mjs | On successful token exchange |
| `client_secret_sha256` | proof-gmail-oauth.mjs, one-time-auth.mjs | SHA-256(secret) at mint time; never the raw secret |

**Implementation:**

- `scripts/oauth-proof/proof-gmail-oauth.mjs`: `sha256Hex(clientSecret)` added when writing `.tokens.json` after exchange.
- `scripts/oauth-proof/one-time-auth.mjs`: `client_secret_sha256: sha256Hex(ctx.clientSecret)` added to payload before `fs.writeFileSync(TOKENS_FILE, ...)`.

---

## 2. Connector guard (oauth.js)

| Condition | Behavior |
|-----------|----------|
| `.tokens.json` has no `client_secret_sha256` | No secret check (backward compatible). |
| `.tokens.json` has `client_secret_sha256` and env has secret | Compute SHA-256(env secret); if different from stored hash → **hard fail** with remediation. |
| Env has no secret | Guard not applicable (client creation would fail earlier). |

**Error message (excerpt):**  
`OAuth secret mismatch: GOOGLE_OAUTH_CLIENT_SECRET in env does not match the secret that issued the token in .tokens.json (client_secret_sha256 in file differs from current env).`

**Remediation text:**  
Set `GOOGLE_OAUTH_CLIENT_SECRET` in repo root `.env.local` to the same OAuth client secret used when the token was minted, or re-run `node scripts/oauth-proof/proof-gmail-oauth.mjs` with the current client to obtain a new token.

---

## 3. Files touched

| File | Change |
|------|--------|
| `connectors/gmail/lib/oauth.js` | `sha256Hex()`, `OAUTH_SECRET_MISMATCH_HINT`, guard after client_id check when `tokens.client_secret_sha256` present. |
| `scripts/oauth-proof/proof-gmail-oauth.mjs` | `sha256Hex()`, add `client_secret_sha256` to written JSON. |
| `scripts/oauth-proof/one-time-auth.mjs` | `sha256Hex()`, add `client_secret_sha256` to payload. |

Tokens and secrets are never logged; only the hash is stored in `.tokens.json`.
