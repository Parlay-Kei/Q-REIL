# OAuth Refresh Token Mint Receipt

**Mission:** BEQA-OPS-901-TOKEN-MINT-AND-VERIFY-0054  
**Owner:** Backend QA  
**Date:** 2026-02-01  
**Deliverable:** Proof that canonical Q SUITE OAuth client mints a fresh refresh token with correct auth URL and vault storage.

---

## Requirement

- Use the **canonical Q SUITE OAuth client** (env: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` from repo root `.env.local` or canonical order per [OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md)).
- Auth URL must include **`access_type=offline`** (request refresh token) and **`prompt=consent`** (force consent screen).
- Complete one-time consent in a controlled operator session.
- Store refresh token in vault as **`GMAIL_REFRESH_TOKEN`** (repo root `.env.local` or platform env).

---

## Auth URL verification (one-time-auth.mjs)

**File:** `scripts/oauth-proof/one-time-auth.mjs`

Auth URL is built with:

```javascript
const authParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: SCOPES,
  access_type: 'offline',   // ✓ Request refresh token
  prompt: 'consent',        // ✓ Force consent screen
  state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
});
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
```

| Parameter      | Required | Present |
|----------------|----------|---------|
| access_type=offline | Yes | Yes |
| prompt=consent      | Yes | Yes |

---

## Procedure: mint and store refresh token

1. **Prerequisites**
   - GCP OAuth client (Web) with redirect URI `http://localhost:8765/callback` (or `PROOF_PORT` if different).
   - Env: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` in repo root `.env.local` (canonical vault).

2. **Run one-time auth (operator session)**
   ```bash
   cd scripts/oauth-proof
   npm install
   npx playwright install chromium   # if not already installed
   npm run one-time-auth
   ```
   - Browser opens; operator signs in and completes consent.
   - On success, tokens are written to `scripts/oauth-proof/.tokens.json` (including `refresh_token`).

3. **Store refresh token in vault**
   - Copy the `refresh_token` value from `scripts/oauth-proof/.tokens.json`.
   - Add or update in **repo root** `.env.local`:
     ```
     GMAIL_REFRESH_TOKEN=<paste refresh_token here>
     ```
   - Connector and proof scripts will use this when env is loaded (canonical order: root first).

4. **Verify**
   - Run: `node scripts/oauth-proof/refresh-token.mjs` → expect success (JSON with `access_token`, `expires_in`).
   - Run: `node connectors/gmail/run-sync.mjs` → expect sync success (7-day backfill).

---

## Canonical client and env order

- **Canonical env order** (first existing file wins): repo root `.env.local` → `scripts/oauth-proof/.env.local` → `connectors/gmail/.env.local` → `q-reil/.env.local` → `process.cwd()/.env.local`.
- **Vault:** Repo root `.env.local` is the canonical vault for `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN`.

---

## Checklist

- [x] Auth URL includes `access_type=offline` and `prompt=consent` (verified in `one-time-auth.mjs`).
- [ ] Operator completed one-time consent; `.tokens.json` created.
- [ ] `GMAIL_REFRESH_TOKEN` stored in vault (repo root `.env.local`).
- [ ] `refresh-token.mjs` run succeeds (see [GMAIL_SYNC_VERIFICATION_RECEIPT.md](./GMAIL_SYNC_VERIFICATION_RECEIPT.md)).
- [ ] `connectors/gmail/run-sync.mjs` 7-day backfill succeeds (see [GMAIL_BACKFILL_7D_RECEIPT.md](./GMAIL_BACKFILL_7D_RECEIPT.md)).
- [ ] Rerun run-sync; no duplicates (see [GMAIL_RERUN_NO_DUPES_RECEIPT.md](./GMAIL_RERUN_NO_DUPES_RECEIPT.md)).

---

**Run note (2026-02-01):** `refresh-token.mjs` and `run-sync.mjs` were run; both failed with `unauthorized_client` (token in `.tokens.json` / env does not match current OAuth client or was revoked). Env in this run was loaded from `q-reil/.env.local`. For a passing chain: operator runs one-time-auth (canonical client; auth URL already has `access_type=offline` and `prompt=consent`), stores the new refresh token in vault as `GMAIL_REFRESH_TOKEN` (repo root `.env.local` or same env as client id/secret), then re-runs refresh-token.mjs and run-sync.mjs.

**Status:** Auth URL verified. Procedure documented. Operator must run one-time-auth and store `GMAIL_REFRESH_TOKEN` in vault; then refresh and sync runs complete the verification chain.
