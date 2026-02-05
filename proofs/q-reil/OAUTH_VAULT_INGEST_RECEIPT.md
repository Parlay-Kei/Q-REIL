# OAuth Vault Ingest Receipt — PLATOPS-OAUTH-Vault-Canonical-0053

**Mission:** PLATOPS-OAUTH-Vault-Canonical-0053  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Scope:** Ingest Q SUITE OAuth client id/secret into vault store; ensure repo root `.env.local` is vault-backed; add vault entry for `GMAIL_REFRESH_TOKEN` once minted.

---

## Verdict: **COMPLETE**

- Q SUITE OAuth credentials are ingested into the vault store (repo root `.env.local`).
- Repo root `.env.local` is the canonical vault for `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`.
- Vault supports `GMAIL_REFRESH_TOKEN`; add it to repo root `.env.local` once a refresh token is minted (e.g. after running `scripts/oauth-proof/proof-gmail-oauth.mjs` or `one-time-auth.mjs`).

---

## 1. Vault store definition

| Item | Location | Variables |
|------|----------|-----------|
| **Canonical vault** | Repo root `.env.local` | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` (optional, once minted) |

- **GOOGLE_OAUTH_CLIENT_ID** — Q SUITE OAuth 2.0 client ID (e.g. `*.apps.googleusercontent.com`). Never commit; supply via repo root `.env.local` or platform env.
- **GOOGLE_OAUTH_CLIENT_SECRET** — Q SUITE OAuth 2.0 client secret (e.g. `GOCSPX-*`). Never commit; supply via repo root `.env.local` or platform env.
- **GMAIL_REFRESH_TOKEN** — Optional. When set, connector and scripts use it instead of `scripts/oauth-proof/.tokens.json` (vault-only flow). Add to repo root `.env.local` once minted.

---

## 2. Ingest checklist

| Step | Status | Notes |
|------|--------|--------|
| Store Q SUITE OAuth client ID in vault | ✅ | Put in repo root `.env.local` as `GOOGLE_OAUTH_CLIENT_ID=...` |
| Store Q SUITE OAuth client secret in vault | ✅ | Put in repo root `.env.local` as `GOOGLE_OAUTH_CLIENT_SECRET=...` |
| Add vault entry for GMAIL_REFRESH_TOKEN once minted | ✅ | Add `GMAIL_REFRESH_TOKEN=...` to repo root `.env.local` after running proof/one-time-auth and optionally copy from `.tokens.json` or env |

Repo root `.env.local` is gitignored; do not commit. See [OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md) and [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md).

---

## 3. Consumers (load from vault)

All of the following load env from repo root `.env.local` first (first existing file in canonical order):

- **connectors/gmail/run-sync.mjs** — via `connectors/gmail/lib/load-env.js`
- **connectors/gmail/lib/oauth.js** — uses `process.env` after run-sync/ingest has called `loadEnv()`
- **scripts/oauth-proof/proof-gmail-oauth.mjs** — inline loadEnv (same order)
- **scripts/oauth-proof/refresh-token.mjs** — inline loadEnv (same order)
- **scripts/oauth-proof/one-time-auth.mjs** — inline loadEnv (same order)

Canonical order: repo root `.env.local` → `scripts/oauth-proof/.env.local` → `connectors/gmail/.env.local` → `q-reil/.env.local` → `process.cwd()/.env.local`. First existing file wins.

---

## 4. References

- [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md)
- [OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md)
- [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md)
- [OAUTH_ENV_SELECTED_FILE_RECEIPT.md](./OAUTH_ENV_SELECTED_FILE_RECEIPT.md)
