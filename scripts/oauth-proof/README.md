# OPS-901 Gmail OAuth proof and one-time auth

**Purpose:** Prove OAuth connect and token refresh for Q REIL (OPS-901); optionally run one-time auth for indefinite agent use.

## Scripts

| Script | Purpose |
|--------|---------|
| `proof-gmail-oauth.mjs` | Standalone proof: open browser, exchange code, prove refresh (no token persistence). |
| `one-time-auth.mjs` | **Playwright**: one browser sign-in; saves `refresh_token` to `.tokens.json` for indefinite agent use. |
| `refresh-token.mjs` | Get fresh `access_token` from `.tokens.json` refresh_token (for agent use). |

## Agent execution (full runbook)

See **[README-OPS-901-AGENT.md](./README-OPS-901-AGENT.md)** for:

- GCP one-time setup (gcloud + Console)
- Playwright one-time auth (install, run, indefinite use)
- Standalone proof
- Refresh helper

## Quick: standalone proof

1. GCP OAuth client (Web) with redirect URI `http://localhost:8765/callback` (see [OPS-901_REDIRECT_URIS.md](../../docs/q-reil/receipts/OPS-901_REDIRECT_URIS.md)).
2. Set env and run (from repo root):

   ```bash
   export GOOGLE_OAUTH_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   export GOOGLE_OAUTH_CLIENT_SECRET="GOCSPX-..."
   node scripts/oauth-proof/proof-gmail-oauth.mjs
   ```

3. Browser opens; after redirect the script prints “OAuth success” and “Token refresh success”. Paste into [OPS-901_OAUTH_PROOF.md](../../docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md).

## Quick: one-time auth (Playwright, indefinite use)

```bash
cd scripts/oauth-proof
npm install
npx playwright install chromium
# Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local or env
npm run one-time-auth
```

Sign in once in the opened browser; `.tokens.json` is created. Use its `refresh_token` for indefinite agent use (see README-OPS-901-AGENT.md).

## Optional

- `PROOF_PORT=8765` — default port for proof and one-time-auth callback. Must match redirect URI in GCP.
