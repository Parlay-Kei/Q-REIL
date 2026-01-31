# OPS-901 — OAuth Proof Pack (Gmail for Q REIL)

**Mission ID:** QREIL OPS-901  
**Owner:** infra-deployment-specialist  
**Brief:** PRD_Q_REIL_v0.1 §6 §10 — Create Google Cloud OAuth for Gmail read access. Configure consent screen, OAuth client (web), redirect URIs for local, preview, production. Store secrets in approved store. Prove token refresh.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #1 Gmail OAuth), §11 (dependencies).

---

## Output deliverables

| Deliverable | Status | Evidence |
|-------------|--------|----------|
| OAuth client created and tested | ☐ | GCP OAuth 2.0 Client (Web); proof script or app flow |
| Redirect URIs include live Vercel domain for q-reil | ☐ | [OPS-901_REDIRECT_URIS.md](./OPS-901_REDIRECT_URIS.md): local, preview, **production** `https://q-reil.vercel.app/...` |
| Secret references stored; no secrets committed | ☐ | [OPS-901_SECRET_STORE_REFERENCE.md](./OPS-901_SECRET_STORE_REFERENCE.md); Vercel env vars only; `q-reil/.env.example` names only |
| Receipt (this file) | ✓ | `docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md` |

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Google Cloud project exists and is non-personal | ☐ |
| 2 | Consent screen configured | ☐ |
| 3 | OAuth client created (Web) | ☐ |
| 4 | Redirect URIs include local + Vercel preview + prod | ☐ |
| 5 | Secrets stored in approved store | ☐ |
| 6 | OAuth connect succeeds with a test user | ☑ |
| 7 | Token refresh proven by forced refresh | ☑ |

---

## 5-point proof pack

### 1. OAuth client created

**Evidence:** Screenshot of GCP Console showing OAuth 2.0 Client ID (Web application) for Q REIL.

- [ ] Screenshot attached or linked below.  
- [ ] Client type: **Web application**.  
- [ ] Client name identifies Q REIL (e.g. "Q REIL Gmail OAuth" or "q-reil OAuth").

_Paste or link:_  
<!-- e.g. ![OAuth client](screenshots/OPS-901-oauth-client.png) or link to internal asset -->

---

### 2. Redirect URIs verified (include live Vercel domain for q-reil)

**Evidence:** List of all configured redirect URIs matching [OPS-901_REDIRECT_URIS.md](./OPS-901_REDIRECT_URIS.md). **Live Vercel domain:** `https://q-reil.vercel.app` (production).

- [ ] Local: `http://localhost:3000/api/connectors/gmail/oauth/callback`  
- [ ] Preview: `https://q-reil-strata-nobles-projects.vercel.app/api/connectors/gmail/oauth/callback`  
- [ ] Production: `https://q-reil.vercel.app/api/connectors/gmail/oauth/callback`

_Screenshot or copy from GCP Console:_  
<!-- paste or link -->

---

### 3. Secrets stored (approved store only)

**Evidence:** Confirmation that Client ID and Client Secret are in Vercel Environment Variables only (no committed .env). See [OPS-901_SECRET_STORE_REFERENCE.md](./OPS-901_SECRET_STORE_REFERENCE.md).

- [ ] Variables present in Vercel for q-reil (Production + Preview).  
- [ ] No client secret in repo or committed files.

_Note:_  
<!-- e.g. "Added GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in Vercel → q-reil → Settings → Environment Variables on YYYY-MM-DD." -->

---

### 4. Test auth run successful

**Evidence:** Screenshot or log showing a test user completing OAuth and returning to the app without Google errors.

- [x] Test user added to OAuth consent screen (if app in Testing mode).  
- [x] Full round-trip: start → Google consent → redirect back to app (or to callback URL).  
- [x] No `redirect_uri_mismatch` or consent errors.

_Evidence:_ Proof script (`scripts/oauth-proof/proof-gmail-oauth.mjs`) completed: callback received, code exchanged, tokens saved to `scripts/oauth-proof/.tokens.json`. Browser redirect showed "Proof: exchange and refresh in progress. Tokens saved to .tokens.json."

---

### 5. Token refresh verified

**Evidence:** Proof that an expired access token is refreshed correctly (e.g. forced refresh or short-lived token refresh).

- [x] Method: Proof script calls Google token endpoint with `grant_type=refresh_token` after code exchange.  
- [x] Evidence: Script printed "Token refresh success"; refresh_token persisted in `.tokens.json` for indefinite agent use.

_Evidence:_ Same proof run as point 4; script performs forced refresh after code exchange and writes tokens to `.tokens.json`.

---

## Runbook (for infra-deployment-specialist)

Execute in order; then fill the 5 points above.

1. **Google Cloud project**  
   - Create or select a **non-personal** GCP project (e.g. org-owned).  
   - Enable **Gmail API** (APIs & Services → Library → Gmail API → Enable).

2. **Consent screen**  
   - APIs & Services → OAuth consent screen.  
   - User type: External (or Internal if org-only).  
   - App name, support email; add scopes: `gmail.readonly`, `openid`, `userinfo.email`.  
   - If External in Testing: add test user(s).

3. **OAuth client**  
   - APIs & Services → Credentials → Create Credentials → OAuth client ID.  
   - Application type: **Web application**.  
   - Authorized redirect URIs: add all three from [OPS-901_REDIRECT_URIS.md](./OPS-901_REDIRECT_URIS.md).  
   - Create; download or copy Client ID and Client Secret.

4. **Secrets**  
   - Add Client ID and Client Secret to Vercel → q-reil → Environment Variables (Production + Preview).  
   - Do not commit secrets to repo.

5. **Prove OAuth**  
   - Use the standalone proof script or a minimal OAuth test (e.g. Postman) that uses the same redirect URI and client credentials.  
   - **Proof script:** Add redirect URI `http://localhost:8765/callback` in GCP, then from repo root: `GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node scripts/oauth-proof/proof-gmail-oauth.mjs`. See [scripts/oauth-proof/README.md](../../scripts/oauth-proof/README.md).  
   - Complete authorization with test user; confirm redirect to callback URI and code exchange (or token) success.

6. **Prove token refresh**  
   - The proof script does both: after code exchange it calls the Google token endpoint with `grant_type=refresh_token` and prints "Token refresh success".  
   - Or use the same client manually: request refresh token on first auth (`access_type=offline`, `prompt=consent`), then call token endpoint with `grant_type=refresh_token`; confirm new access token.

---

## Sign-off

When all 5 points are evidenced and all acceptance criteria checked:

- **Posted:** _Date and location (e.g. "RECEIPTS.md updated YYYY-MM-DD; receipt files in docs/q-reil/receipts/")._
- **AUTH-101:** Unblocked; OAuth app code may proceed.

**Receipt status:** Points 4 and 5 evidenced 2026-01-31 (proof script: OAuth success, token refresh success, `.tokens.json` written). Points 1–3 remain for GCP/Vercel confirmation when applicable.
