# Q Suite — OAuth canonicalization implemented (PLATOPS-GMAIL-OAUTH-UNBLOCK-0040)

**Mission:** PLATOPS-GMAIL-OAUTH-UNBLOCK-0040  
**Date:** 2026-01-31  
**Scope:** Canonical env loading, vault store, and client-id guard for Gmail connector and OAuth proof scripts.

See [OAUTH_CANON.md](./OAUTH_CANON.md) for canonical project, client, and variable names. This doc describes what was implemented.

---

## 1. Canonical env loading

Both **connectors/gmail/run-sync.mjs** (via `lib/load-env.js`) and **scripts/oauth-proof/** (proof-gmail-oauth.mjs, refresh-token.mjs, one-time-auth.mjs) now resolve env from the **same** ordered candidate list. First existing file wins.

**Canonical order:**

1. **Repo root** `.env.local` ← canonical vault
2. `scripts/oauth-proof/.env.local`
3. `connectors/gmail/.env.local`
4. `q-reil/.env.local`
5. `process.cwd()/.env.local`

**Files changed:**

- `connectors/gmail/lib/load-env.js` — CANDIDATES reordered (root first).
- `scripts/oauth-proof/proof-gmail-oauth.mjs` — loadEnv() uses same order and returns after first found file.
- `scripts/oauth-proof/refresh-token.mjs` — same.
- `scripts/oauth-proof/one-time-auth.mjs` — same.

**Receipt:** [proofs/q-reil/OAUTH_ENV_LOADING_RECEIPT.md](../../proofs/q-reil/OAUTH_ENV_LOADING_RECEIPT.md).

---

## 2. Vault store (canonical variable names)

Use a single source (e.g. repo root `.env.local` or platform env) with these names:

| Variable | Purpose |
|----------|---------|
| **GOOGLE_OAUTH_CLIENT_ID** | OAuth 2.0 client ID |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth 2.0 client secret |
| **GMAIL_REFRESH_TOKEN** | Optional; refresh token for vault-only flow (no .tokens.json) |

Optional: `GOOGLE_REDIRECT_URI`, `PROOF_PORT`.  
**GMAIL_REFRESH_TOKEN:** When set, the connector uses it instead of reading `scripts/oauth-proof/.tokens.json`. No client-id guard is applied in that path (no token origin metadata). Bootstrap (create mailbox from tokens) can also use `GMAIL_REFRESH_TOKEN` when .tokens.json is absent.

---

## 3. Token origin metadata and hard-fail guard

**Token origin in .tokens.json:** When proof scripts write `.tokens.json`, they now include:

- **client_id** — OAuth client ID that issued the token (used for guard).
- **redirect_uri** — Redirect URI used (informational).

**Hard-fail guard:** In `connectors/gmail/lib/oauth.js`, `getOAuth2ClientFromTokensFile()`:

- If `GMAIL_REFRESH_TOKEN` is set → use it; no guard.
- If using .tokens.json and the file contains `client_id` and env has `GOOGLE_OAUTH_CLIENT_ID` (or fallback): if they **differ**, throw with a clear error and remediation hint.
- Remediation: (1) Set env to match the client that issued the token, or (2) re-run `node scripts/oauth-proof/proof-gmail-oauth.mjs` to obtain a new token with the current client.

**Receipt:** [proofs/q-reil/OAUTH_CANON_GUARD_RECEIPT.md](../../proofs/q-reil/OAUTH_CANON_GUARD_RECEIPT.md).

---

## 4. Mismatch points addressed

| Mismatch | Before | After |
|----------|--------|--------|
| Env file order | Connector: connectors/gmail first, then root. Proof: script dir, then q-reil only (no root). | Same order for both: root first, then scripts/oauth-proof, connectors/gmail, q-reil, cwd. |
| Client ID / secret | Connector had fallbacks GOOGLE_CLIENT_ID/SECRET; proof only canonical names. | Canonical names documented; vault = GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET. Fallbacks kept in oauth.js for compatibility. |
| Token origin | .tokens.json had no client_id; no way to detect client switch. | Proof scripts write client_id; connector guards and fails with remediation hint. |
| Refresh token source | Only .tokens.json. | Optional GMAIL_REFRESH_TOKEN env (vault-only); .tokens.json still supported. |

---

## 5. References

- [OAUTH_CANON.md](./OAUTH_CANON.md) — canonical project, client, variable names.
- [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md) — script/env mapping (update to reflect new order and GMAIL_REFRESH_TOKEN).
- [proofs/q-reil/OAUTH_ENV_LOADING_RECEIPT.md](../../proofs/q-reil/OAUTH_ENV_LOADING_RECEIPT.md)
- [proofs/q-reil/OAUTH_CANON_GUARD_RECEIPT.md](../../proofs/q-reil/OAUTH_CANON_GUARD_RECEIPT.md)
- [GMAIL_TOKEN_STEPS.md](../05_INBOX/GMAIL_TOKEN_STEPS.md)
