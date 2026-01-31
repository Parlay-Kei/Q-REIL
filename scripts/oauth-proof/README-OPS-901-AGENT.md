# OPS-901 — Agent execution: Google OAuth + one-time auth for indefinite use

**Mission ID:** QREIL OPS-901  
**Purpose:** Let an agent (or human) run the full Google OAuth setup and one-time authentication so the app/agent can use Gmail indefinitely without further user interaction.

---

## Methods

| Method | Use |
|--------|-----|
| **Playwright one-time auth** | One browser sign-in; saves `refresh_token` to `.tokens.json` for indefinite agent use. |
| **Standalone proof script** | Manual: open URL in browser; proves OAuth + refresh (no token persistence). |
| **Google CLI (gcloud)** | Optional: enable Gmail API; OAuth client creation still in Console. |

---

## 1. GCP one-time setup (manual or gcloud)

OAuth client (Web) must exist in Google Cloud. One-time steps:

1. **Google Cloud project**  
   - [Console](https://console.cloud.google.com/) → Create/select non-personal project.  
   - Or: `gcloud projects create PROJECT_ID --name "Q REIL"` then `gcloud config set project PROJECT_ID`.

2. **Enable Gmail API**  
   - Console → APIs & Services → Library → Gmail API → Enable.  
   - Or: `gcloud services enable gmail.googleapis.com`.

3. **OAuth consent screen**  
   - Console → APIs & Services → OAuth consent screen.  
   - User type: External (or Internal).  
   - Scopes: `gmail.readonly`, `openid`, `userinfo.email`.  
   - If Testing: add test user(s).

4. **OAuth client (Web)**  
   - Console → APIs & Services → Credentials → Create Credentials → OAuth client ID.  
   - Type: **Web application**.  
   - Authorized redirect URIs (add all):
     ```
     http://localhost:3000/api/connectors/gmail/oauth/callback
     https://q-reil-strata-nobles-projects.vercel.app/api/connectors/gmail/oauth/callback
     https://q-reil.vercel.app/api/connectors/gmail/oauth/callback
     http://localhost:8765/callback
     ```
   - Create → copy **Client ID** and **Client secret**.

5. **Secrets**  
   - Vercel: q-reil → Settings → Environment Variables → add `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (Production + Preview).  
   - Local/agent: put in `scripts/oauth-proof/.env.local` or `q-reil/.env.local`:
     ```
     GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com
     GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
     ```

---

## 2. Playwright one-time auth (indefinite agent use)

Run once; complete Google sign-in in the opened browser. Tokens are saved for later use.

### Install (from repo root)

```bash
cd scripts/oauth-proof
npm install
npx playwright install chromium
```

### Run

```bash
cd scripts/oauth-proof
# Env from .env.local in this dir or q-reil/.env.local
npm run one-time-auth
```

- Script launches **installed Chrome** (or Edge if Chrome is missing) so Google does not show "This browser or app may not be secure". To force Edge: `PW_CHROME_CHANNEL=msedge npm run one-time-auth`.
- Browser opens to Google sign-in.  
- Sign in once (and grant consent if prompted).  
- Redirect goes to `http://localhost:8765/callback`; script exchanges code and writes **`.tokens.json`** (gitignored) with `refresh_token` and `access_token`.

### Indefinite agent use

- **`.tokens.json`** contains `refresh_token`.  
- Any script or the app can call Google’s token endpoint with `grant_type=refresh_token` and this `refresh_token` to get a new `access_token` without user interaction.  
- For the **Q REIL app**: use “Connect Gmail” once per user (AUTH-101 flow); tokens are stored in `mailboxes` and refreshed by the app.  
- For **headless/agent**: use the saved `refresh_token` from `.tokens.json` with `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` to obtain access tokens on demand.

### Optional: refresh helper

From repo root, with env set and `.tokens.json` present:

```bash
cd scripts/oauth-proof && node -e "
const fs=require('fs');
const path=require('path');
const t=JSON.parse(fs.readFileSync(path.join(__dirname,'.tokens.json'),'utf8'));
const id=process.env.GOOGLE_OAUTH_CLIENT_ID;
const sec=process.env.GOOGLE_OAUTH_CLIENT_SECRET;
fetch('https://oauth2.googleapis.com/token',{
  method:'POST',
  headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body: new URLSearchParams({refresh_token:t.refresh_token,client_id:id,client_secret:sec,grant_type:'refresh_token'}).toString()
}).then(r=>r.json()).then(j=>{ console.log('access_token:', j.access_token ? '[OK]' : j); });
"
```

---

## 3. Standalone proof (no Playwright)

Proves OAuth + token refresh only; does not save tokens.

```bash
# Add http://localhost:8765/callback in GCP redirect URIs
export GOOGLE_OAUTH_CLIENT_ID="..."
export GOOGLE_OAUTH_CLIENT_SECRET="..."
node scripts/oauth-proof/proof-gmail-oauth.mjs
```

Browser opens; after redirect the script prints “OAuth success” and “Token refresh success”.

---

## 4. Receipts

After completion, update:

- [OPS-901_OAUTH_PROOF.md](../../docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md) — 5-point proof.  
- [RECEIPTS.md](../../docs/q-reil/RECEIPTS.md) §5 OPS-901 — sign-off when all criteria met.

---

## Summary

| Step | Agent action |
|------|----------------|
| GCP project + Gmail API | `gcloud services enable gmail.googleapis.com` (if gcloud configured). |
| OAuth client + redirect URIs | Manual in Console (one-time). |
| Client ID/secret | In Vercel + `scripts/oauth-proof/.env.local` or `q-reil/.env.local`. |
| One-time auth | `cd scripts/oauth-proof && npm install && npx playwright install chromium && npm run one-time-auth`; sign in once in browser. |
| Indefinite use | Use `refresh_token` from `.tokens.json` (or app’s mailbox tokens) for access tokens. |
