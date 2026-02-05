# PLATOPS Next Steps (Delegate + Execute)

**Mission:** PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008  
**Owner:** PLATOPS  
**Receipt:** [PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008-receipt.md](PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008-receipt.md)

---

## Delegated steps (execute in order)

### Step 1 — Mint refresh token (manual; one-time)

- **Action:** From repo root, run:
  ```bash
  node scripts/oauth-proof/proof-gmail-oauth.mjs
  ```
- **Requirement:** Use the **same** OAuth client as in `q-reil/.env.local` (or Vercel q-reil Production). The script loads env from repo root `.env.local`, then `scripts/oauth-proof/.env.local`, then `connectors/gmail/.env.local`, then `q-reil/.env.local` — first existing file wins. Ensure the client you use for the browser flow matches the client_id/secret in the env file that will be used for ingest.
- **Result:** Browser opens; sign in to Google and grant scopes (gmail.readonly, gmail.send, etc.). Tokens written to `scripts/oauth-proof/.tokens.json`.

### Step 2 — Validate token (automated)

- **Action:** From repo root:
  ```bash
  node scripts/oauth-proof/refresh-token.mjs
  ```
- **Pass:** Exit 0 and JSON with `access_token`, `expires_in`.
- **Fail:** Exit 1 and `oauth_refresh_failure` / `unauthorized_client` → go back to Step 1 (wrong client or wrong token file).

### Step 3 — Validate ingester list messages (automated)

- **Action:** From repo root (requires Supabase env in same .env):
  ```bash
  node connectors/gmail/run-sync.mjs
  ```
- **Pass:** Exit 0 and JSON result (e.g. `sourceItemsRawMessages`, `documentsCreated`). Proves ingester can authenticate and list/fetch messages.
- **Fail:** Exit 1 (auth or API error) → fix token/client then re-run Step 2 and Step 3.

### Step 4 — Update receipt and Production env

- Update `proofs/reil-core/PLATOPS-QREIL-GMAIL-OAUTH-REPAIR-0008-receipt.md`: set both acceptance checks to **PASS** and add timestamp.
- Install in Vercel q-reil **Production** env: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_SENDER_ADDRESS` (from the same client/token that passed Step 2 and 3).
- Optional: re-run Step 2 (or run-sync against Production env) after Vercel update to confirm prod token works.

---

## Execution log (this run)

**Step 2 (token validation):** FAIL.  
`node scripts/oauth-proof/refresh-token.mjs` → exit 1.  
`oauth_refresh_failure`, `error: unauthorized_client`, `error_description: Unauthorized`.  
Env loaded from `q-reil/.env.local`; client_id and client_secret present; refresh_token present but issued by a different client.

**Step 3 (ingester list messages):** Not run (token invalid).

**Action for PLATOPS:** Complete Step 1 (mint with same client as in q-reil/.env.local), then re-run Step 2 and Step 3 until both PASS.
