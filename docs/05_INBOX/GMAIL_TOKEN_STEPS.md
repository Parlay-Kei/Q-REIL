# Steps for Creating a New Gmail Token (with gmail.readonly scope)

Use this when the Gmail connector reports **403 Insufficient Permission** or when you need a fresh token that includes **Gmail read** access.

---

## 1. Prerequisites

- **Enable the Gmail API** for your project (required separately from OAuth scopes):
  1. Open [API Library](https://console.cloud.google.com/apis/library).
  2. Select your project.
  3. Search for **Gmail API** and open it.
  4. Click **Enable**.
  Without this, Gmail API calls return 403 "Access Not Configured" even if OAuth scopes are set.
- **OAuth 2.0 Client (Web application)** with:
  - **Authorized redirect URI:** `http://localhost:8765/callback`  
    (If 8765 is in use, the script may use 8766–8769; add those to GCP if needed.)
- **Client ID** and **Client secret** from that OAuth client.

---

## 2. Set credentials

**Option A – Environment variables (PowerShell)**

```powershell
$env:GOOGLE_OAUTH_CLIENT_ID = YOUR_CLIENT_ID.apps.googleusercontent.com
$env:GOOGLE_OAUTH_CLIENT_SECRET = GOCSPX-YOUR_CLIENT_SECRET_HERE
```

**Option B – `.env.local`**

Create or edit one of:

- `scripts/oauth-proof/.env.local`
- `q-reil/.env.local`
- Repo root `.env.local`

Contents:

```
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-YOUR_CLIENT_SECRET_HERE
```

(No quotes needed; the script trims them.)

---

## 3. Run the OAuth proof script

From the repo root:

```bash
cd c:\Dev\Q-REIL
node scripts/oauth-proof/proof-gmail-oauth.mjs
```

Or from the script folder:

```bash
cd c:\Dev\Q-REIL\scripts\oauth-proof
node proof-gmail-oauth.mjs
```

---

## 4. Complete the flow in the browser

1. A browser window opens to Google’s sign-in/consent screen.
2. Sign in with the **Google account** whose Gmail you want to sync.
3. If prompted, review and **Allow** the requested permissions:
   - **View your email messages and settings** (Gmail read-only)
   - **See your primary Google Account email address**
   - OpenID (sign-in)
4. You are redirected to `http://localhost:8765/callback` (or another port if 8765 was in use). The page may say “Proof: exchange and refresh in progress…”

---

## 5. Confirm success

In the terminal you should see:

- `--- OAuth success ---`
- `Tokens written to: ...\.tokens.json`
- `--- Token refresh success ---`
- `Proof complete. Indefinite agent use: refresh_token in .tokens.json`

The file **`scripts/oauth-proof/.tokens.json`** is created/overwritten with:

- `access_token`
- `refresh_token`
- `expires_at`
- `scope` (includes `https://www.googleapis.com/auth/gmail.readonly`)

---

## 6. Run the Gmail sync

From the repo root:

```bash
cd c:\Dev\Q-REIL
node connectors/gmail/run-sync.mjs
```

The connector loads `.tokens.json` (and refreshes the access token when needed) and uses the **gmail.readonly** scope to ingest the last 7 days of threads, messages, and attachments.

---

## Scopes used by the proof script

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read Gmail threads, messages, attachments (required for sync) |
| `openid` | Sign-in |
| `https://www.googleapis.com/auth/userinfo.email` | Get email for mailbox/bootstrap |

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| **"Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET"** | Set env vars or add them to `.env.local` in one of the paths above. |
| **"redirect_uri_mismatch"** | In GCP → APIs & Services → Credentials → your OAuth client → add `http://localhost:8765/callback` (and 8766–8769 if the script uses another port). |
| **"All ports 8765-8769 in use"** | Close other apps using those ports, or set `PROOF_PORT=8770` and add `http://localhost:8770/callback` in GCP. |
| **"Gmail API is not enabled"** / **"Access Not Configured"** | Enable the Gmail API for the project: [API Library → Gmail API → Enable](https://console.cloud.google.com/apis/library/gmail.googleapis.com). |
| **"Token does not include gmail.readonly"** | The stored token was created without Gmail scope. Delete `scripts/oauth-proof/.tokens.json` and run `proof-gmail-oauth.mjs` again; when the consent screen appears, grant **"View your email messages and settings"**. |
| **403 Insufficient Permission** on sync | Per Google OAuth2, a refreshed access token has the **same scopes** as the refresh token. If your refresh token was created without `gmail.readonly`, re-run the proof script (with consent) to get a new refresh token that includes it. |
