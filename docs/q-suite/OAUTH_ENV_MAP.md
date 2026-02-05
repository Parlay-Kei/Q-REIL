# Q Suite — OAuth env sources (which scripts read which env)

**Mission:** OCS-OAUTH-CANONICALIZATION-0039  
**Owner:** OCS  
**Date:** 2026-01-31  
**Scope:** Mapping of scripts and libraries to environment variable names and env file search order.

See [OAUTH_CANON.md](./OAUTH_CANON.md) for canonical OAuth project, client, and variable names.

---

## 1. Summary

| Script / module | OAuth-related env vars | Other env vars | Env file search order |
|-----------------|------------------------|----------------|------------------------|
| **connectors/gmail/run-sync.mjs** | Via `lib/oauth.js` | Supabase (via `lib/ingest.js`) | Via `lib/load-env.js` (see §2) |
| **connectors/gmail/lib/oauth.js** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (fallbacks: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) | — | None (process.env only) |
| **connectors/gmail/lib/load-env.js** | Any vars in files | — | See §2 |
| **connectors/gmail/lib/ingest.js** | — | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | None |
| **scripts/oauth-proof/proof-gmail-oauth.mjs** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `PROOF_PORT` | — | See §3 |
| **scripts/oauth-proof/refresh-token.mjs** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | — | See §3 |
| **scripts/oauth-proof/one-time-auth.mjs** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `PROOF_PORT` | — | See §3 |

---

## 2. Connector: env file search order (load-env.js)

Used by **connectors/gmail/run-sync.mjs** (which calls `loadEnv()` from `connectors/gmail/lib/load-env.js` before using OAuth or Supabase).

**Order (first existing file wins; vars not already set in `process.env` are applied). Canonical vault = repo root first (see [OAUTH_CANON_IMPLEMENTED.md](./OAUTH_CANON_IMPLEMENTED.md)):**

1. **Repo root** `.env.local`
2. `scripts/oauth-proof/.env.local`
3. `connectors/gmail/.env.local`
4. `q-reil/.env.local`
5. `process.cwd()/.env.local`

**Variables typically set in these files for connector + proof:**

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (optional)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. OAuth proof scripts: env file search order

Used by **proof-gmail-oauth.mjs**, **refresh-token.mjs**, and **one-time-auth.mjs**. Each has its own inline `loadEnv()` using the **same** canonical order as the connector (repo root first).

**Order (first existing file wins; vars not already set in `process.env` are applied):**

1. **Repo root** `.env.local`
2. `scripts/oauth-proof/.env.local`
3. `connectors/gmail/.env.local`
4. `q-reil/.env.local`
5. `process.cwd()/.env.local`

**Variables read from process.env after loadEnv:**

- `GOOGLE_OAUTH_CLIENT_ID` (required)
- `GOOGLE_OAUTH_CLIENT_SECRET` (required)
- `PROOF_PORT` (optional; proof-gmail-oauth.mjs, one-time-auth.mjs only)

---

## 4. Variable precedence

For any script:

1. **process.env** (e.g. shell export, CI secret) wins if set before the script runs.
2. **loadEnv()** only assigns variables that are **not** already in `process.env`, so existing env vars are never overwritten by `.env.local`.
3. Within **loadEnv()**, the **first** file in the search order that exists is read; later files in the list are not read for that run.

---

## 5. Canonical OAuth vars (single source of truth)

For Gmail connector and OAuth proof scripts, use **only** these names in new code and in secret store / runbooks:

| Variable | Required | Default / note |
|----------|----------|----------------|
| `GOOGLE_OAUTH_CLIENT_ID` | Yes (for OAuth flows) | — |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Yes (for OAuth flows) | — |
| `GMAIL_REFRESH_TOKEN` | No | When set, connector uses it instead of .tokens.json (vault-only flow). |
| `GOOGLE_REDIRECT_URI` | No | `http://localhost:8765/callback` (connectors/gmail/lib/oauth.js) |
| `PROOF_PORT` | No | 8765 (script may try 8765–8769) |

Legacy fallbacks in code: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (see OAUTH_CANON §3). Do not introduce new uses of `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` for this connector. See [OAUTH_CANON_IMPLEMENTED.md](./OAUTH_CANON_IMPLEMENTED.md) for canonical env loading and client-id guard.

---

## 6. References

- **Canonical OAuth:** [OAUTH_CANON.md](./OAUTH_CANON.md)
- **Token steps:** [../05_INBOX/GMAIL_TOKEN_STEPS.md](../05_INBOX/GMAIL_TOKEN_STEPS.md)
- **Connector load-env:** `connectors/gmail/lib/load-env.js`
- **Connector oauth:** `connectors/gmail/lib/oauth.js`
