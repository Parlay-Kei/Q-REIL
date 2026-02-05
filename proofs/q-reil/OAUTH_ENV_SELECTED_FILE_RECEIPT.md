# OAuth Env Selected File Receipt — PLATOPS-OAUTH-PAIR-FINGERPRINT-0043

**Mission:** PLATOPS-OAUTH-PAIR-FINGERPRINT-0043 (updated PLATOPS-OAUTH-Vault-Canonical-0053)  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Scope:** Log env presence sanity and which env file was selected by load-env.

---

## Verdict: **COMPLETE**

- Connector and proof scripts load the selected env file from repo root first (canonical vault) and print the env sanity receipt once per run.
- Receipt includes `load_env_selected_file` (absolute path of file used, or `(not set)`), `client_id_present`, `client_secret_present`, and redacted identifiers. No tokens or secrets are logged.

---

## 1. Env file selection (load-env.js)

| Behavior | Implementation |
|----------|-----------------|
| First existing file wins | `connectors/gmail/lib/load-env.js` CANDIDATES order: repo root, scripts/oauth-proof, connectors/gmail, q-reil, process.cwd(). |
| Selected file exposed | After loading, `process.env.LOAD_ENV_SELECTED_FILE` is set to the absolute path of the file that was loaded, or `''` if none found. |

**Code:**  
`loadEnv()` sets `process.env.LOAD_ENV_SELECTED_FILE = envPath` before returning when a file is loaded; sets `process.env.LOAD_ENV_SELECTED_FILE = ''` when no file is found.

---

## 2. Env presence sanity log (oauth.js)

Emitted once per run when using `.tokens.json` (before client_id/secret guards), to stderr as a single JSON object:

| Field | Meaning |
|-------|--------|
| `receipt` | `oauth_env_sanity` |
| `client_id_present` | boolean |
| `client_secret_present` | boolean |
| `client_id_redacted` | `...<last 8 chars>` or `(missing)` |
| `client_secret_redacted` | `[REDACTED]` or `(missing)` |
| `load_env_selected_file` | Absolute path of env file used, or `(not set)` |

**Example:**  
`{"receipt":"oauth_env_sanity","client_id_present":true,"client_secret_present":true,"client_id_redacted":"...xyz1234","client_secret_redacted":"[REDACTED]","load_env_selected_file":"C:\\Dev\\Q-REIL\\.env.local"}`

---

## 3. Passing selection (repo root vault)

When repo root `.env.local` exists and contains `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`, the selected file is the repo root vault and the receipt shows a passing run:

| Check | Expected |
|-------|----------|
| `load_env_selected_file` | Absolute path to repo root `.env.local` (e.g. `C:\Dev\Q-REIL\.env.local`) |
| `client_id_present` | `true` |
| `client_secret_present` | `true` |
| `client_id_redacted` | `...` + last 8 chars of client ID |
| `client_secret_redacted` | `[REDACTED]` |

**Connector:** `node connectors/gmail/run-sync.mjs` — prints one `oauth_env_sanity` line to stderr after `loadEnv()`, then proceeds.  
**Proof scripts:** `node scripts/oauth-proof/proof-gmail-oauth.mjs`, `refresh-token.mjs`, `one-time-auth.mjs` — each prints one `oauth_env_sanity` line to stderr after `loadEnv()` and before OAuth logic.

---

## 4. Files touched

| File | Change |
|------|--------|
| `connectors/gmail/lib/load-env.js` | Set `process.env.LOAD_ENV_SELECTED_FILE` on load (path or `''`). |
| `connectors/gmail/run-sync.mjs` | After `loadEnv()`, print single `oauth_env_sanity` receipt (selected file + presence, redacted). |
| `connectors/gmail/lib/oauth.js` | No longer emits receipt (avoids duplicate); client_id/secret guards unchanged. |
| `scripts/oauth-proof/proof-gmail-oauth.mjs` | Inline `loadEnv()` sets `LOAD_ENV_SELECTED_FILE`; after `loadEnv()` call `printEnvSanityReceipt()`. |
| `scripts/oauth-proof/refresh-token.mjs` | Same: set `LOAD_ENV_SELECTED_FILE`, then `printEnvSanityReceipt()`. |
| `scripts/oauth-proof/one-time-auth.mjs` | Same: set `LOAD_ENV_SELECTED_FILE`, then `printEnvSanityReceipt()`. |

Run order: connector and proof scripts call `loadEnv()` first (repo root `.env.local` wins when present), then print the env sanity receipt, then proceed.
