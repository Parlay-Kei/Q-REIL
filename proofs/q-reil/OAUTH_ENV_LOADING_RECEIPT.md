# OAuth env loading receipt (PLATOPS-GMAIL-OAUTH-UNBLOCK-0040)

**Mission:** PLATOPS-GMAIL-OAUTH-UNBLOCK-0040  
**Date:** 2026-01-31  
**Scope:** Canonical env loading so connector and proof scripts resolve from the same source.

---

## 1. Inspection summary

### 1.1 Connector codepath: `connectors/gmail/run-sync.mjs`

- **Entry:** `run-sync.mjs` calls `loadEnv()` from `connectors/gmail/lib/load-env.js` before any OAuth or Supabase usage.
- **Working directory:** No assumption; env file paths are resolved from `import.meta.url` (connector lib lives at `connectors/gmail/lib/`, so repo root = `../../..`).
- **Required variable names (OAuth):** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (fallbacks in oauth.js: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Optional: `GOOGLE_REDIRECT_URI`, `GMAIL_REFRESH_TOKEN`.
- **Other required:** `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### 1.2 Proof scripts: `scripts/oauth-proof/`

- **proof-gmail-oauth.mjs,** **refresh-token.mjs,** **one-time-auth.mjs:** Each had its own inline `loadEnv()` with a **different** search order (no repo root).
- **Working directory:** Paths resolved from `import.meta.url` (`__dirname` = `scripts/oauth-proof/`; repo root = `../..`).
- **Required variable names:** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`. Optional: `PROOF_PORT`, `PW_CHROME_CHANNEL` (one-time-auth).

### 1.3 OAuth sources identified (before canonicalization)

| Source | Connector (load-env.js) | Proof scripts |
|--------|-------------------------|---------------|
| Repo root `.env.local` | Yes (2nd in list) | **No** |
| `scripts/oauth-proof/.env.local` | Yes (4th) | Yes (1st) |
| `connectors/gmail/.env.local` | Yes (1st) | **No** |
| `q-reil/.env.local` | Yes (3rd) | Yes (2nd) |
| `process.cwd()/.env.local` | Yes (5th) | **No** |
| `scripts/oauth-proof/.tokens.json` | Used by oauth.js for refresh_token | Written by proof; read by refresh-token |

**Mismatch:** Proof scripts did **not** read repo root `.env.local`. If credentials lived only in root, run-sync could succeed but proof scripts would fail (and vice versa if credentials were only in `scripts/oauth-proof/.env.local`).

---

## 2. Canonical env loading (implemented)

**Vault = repo root first.** Both connector and proof now use the **same** ordered candidate list; first existing file wins; variables not already in `process.env` are applied.

**Canonical order (first existing file wins):**

1. **Repo root** `.env.local` ← canonical vault
2. `scripts/oauth-proof/.env.local`
3. `connectors/gmail/.env.local`
4. `q-reil/.env.local`
5. `process.cwd()/.env.local`

**Files changed:**

- `connectors/gmail/lib/load-env.js` — CANDIDATES reordered to the list above (root first).
- `scripts/oauth-proof/proof-gmail-oauth.mjs` — `loadEnv()` updated to same order and early return on first found file.
- `scripts/oauth-proof/refresh-token.mjs` — same.
- `scripts/oauth-proof/one-time-auth.mjs` — same.

**Variable precedence (unchanged):** (1) Existing `process.env` wins; (2) loadEnv() only sets vars not already set; (3) first existing file in the list is read and then loading stops for that run.

---

## 3. Canonical variable names (vault store)

| Variable | Purpose |
|----------|---------|
| **GOOGLE_OAUTH_CLIENT_ID** | OAuth 2.0 client ID |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth 2.0 client secret |
| **GMAIL_REFRESH_TOKEN** | Optional; refresh token (vault-only flow; avoids .tokens.json) |

Optional: `GOOGLE_REDIRECT_URI`, `PROOF_PORT`. See [OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) and [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md).

---

## 4. Verification

- Connector and proof scripts now resolve env from the same canonical source (repo root first, then same fallbacks).
- Single place for secrets: repo root `.env.local` (or env vars set by platform) satisfies both `connectors/gmail/run-sync.mjs` and `scripts/oauth-proof/*.mjs`.

---

## 5. References

- [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md)
- [OAUTH_CANON_GUARD_RECEIPT.md](./OAUTH_CANON_GUARD_RECEIPT.md)
- [OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md)
