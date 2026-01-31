# M1 Quick Start: Gmail OAuth Loop

**Sprint:** REIL-Q v0.3
**Goal:** Get Gmail OAuth working in 30 minutes
**Date:** 2025-12-31

---

## Prerequisites

- [ ] Google account (for Google Cloud Console)
- [ ] Gmail account for testing (can be same as above)
- [ ] Node.js installed
- [ ] Supabase project with `mailboxes` table created

---

## Step-by-Step Implementation

### Part 1: Google Cloud Setup (10 minutes)

#### 1.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing: "REIL-Q"
3. Enable Gmail API:
   - APIs & Services > Library
   - Search "Gmail API"
   - Click Enable

4. Create OAuth credentials:
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Name: "REIL-Q OAuth Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/connectors/gmail/oauth/callback`
   - Click Create
   - Download JSON credentials

#### 1.2 Configure Consent Screen

1. APIs & Services > OAuth consent screen
2. User type: External
3. App information:
   - App name: `REIL-Q Inbox`
   - User support email: your email
4. Scopes: Add these three:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Test users: Add your Gmail address
6. Save

---

### Part 2: Environment Setup (5 minutes)

#### 2.1 Generate Encryption Key

Run this command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64 character hex string).

#### 2.2 Update .env.local

Create or update `d:\REIL-Q\.env.local`:

```bash
# From Google Cloud Console OAuth credentials
GOOGLE_OAUTH_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123def456ghi789

# From step 2.1 above
OAUTH_TOKEN_ENCRYPTION_KEY=<64-char-hex-from-step-2.1>

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Part 3: Code Implementation (10 minutes)

All code skeletons are in `gmail-oauth-implementation.md`.

Copy/paste these files in order:

#### 3.1 Core OAuth Utilities

1. `d:\REIL-Q\lib\oauth\pkce.ts` - PKCE generation
2. `d:\REIL-Q\lib\oauth\gmail-auth.ts` - Authorization URL builder
3. `d:\REIL-Q\lib\oauth\token-exchange.ts` - Token exchange
4. `d:\REIL-Q\lib\oauth\token-encryption.ts` - Token encryption
5. `d:\REIL-Q\lib\oauth\token-refresh.ts` - Token refresh

#### 3.2 Mailbox Management

6. `d:\REIL-Q\lib\connectors\gmail\mailbox.ts` - Mailbox CRUD

#### 3.3 API Routes

7. `d:\REIL-Q\app\api\connectors\gmail\oauth\start\route.ts` - Start OAuth
8. `d:\REIL-Q\app\api\connectors\gmail\oauth\callback\route.ts` - OAuth callback
9. `d:\REIL-Q\app\api\connectors\gmail\oauth\disconnect\route.ts` - Disconnect

**Total:** 9 TypeScript files

---

### Part 4: Database Setup (2 minutes)

Run this SQL in Supabase SQL editor:

```sql
-- Create mailboxes table (if not exists)
CREATE TABLE IF NOT EXISTS mailboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Provider info
  provider TEXT NOT NULL DEFAULT 'gmail',
  provider_email TEXT NOT NULL,
  provider_subject_id TEXT NOT NULL,

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  -- OAuth metadata
  oauth_scopes TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'connected',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, provider_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mailboxes_user_id ON mailboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_mailboxes_org_id ON mailboxes(org_id);
CREATE INDEX IF NOT EXISTS idx_mailboxes_status ON mailboxes(status);

-- RLS policies (adjust based on your auth setup)
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mailboxes"
  ON mailboxes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mailboxes"
  ON mailboxes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mailboxes"
  ON mailboxes FOR UPDATE
  USING (auth.uid() = user_id);
```

---

### Part 5: Testing (5 minutes)

#### 5.1 Start Dev Server

```bash
cd d:\REIL-Q
npm run dev
```

#### 5.2 Test OAuth Flow

1. Open browser: `http://localhost:3000/api/connectors/gmail/oauth/start`
2. Should redirect to Google OAuth consent screen
3. Sign in with your test Gmail account
4. Review permissions (Gmail readonly, OpenID, email)
5. Click "Allow"
6. Should redirect to: `http://localhost:3000/inbox?connected=<uuid>`

#### 5.3 Verify Database

Open Supabase SQL editor:

```sql
SELECT
  id,
  provider_email,
  status,
  oauth_scopes,
  token_expires_at,
  created_at
FROM mailboxes
ORDER BY created_at DESC
LIMIT 1;
```

Expected result:
- `status`: `connected`
- `provider_email`: your Gmail
- `oauth_scopes`: Array with 3 scopes
- `access_token_encrypted`: Encrypted string
- `refresh_token_encrypted`: Encrypted string

#### 5.4 Verify Ledger Event

```sql
SELECT
  event_type,
  payload,
  created_at
FROM ledger_events
WHERE event_type = 'MAILBOX_CONNECTED'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Part 6: Create Proof (3 minutes)

1. Take screenshots:
   - Google consent screen
   - Success redirect
   - Database query results
   - Ledger event

2. Fill out proof template: `d:\REIL-Q\docs\proofs\oauth\README.md`
   - Add connected email (can redact)
   - Add timestamp
   - Insert screenshots
   - Mark all checkboxes

3. Commit to repo:
   ```bash
   git add .
   git commit -m "M1 Complete: Gmail OAuth proof"
   git push
   ```

---

## Troubleshooting

### Error: "Redirect URI mismatch"

**Fix:** Ensure `http://localhost:3000/api/connectors/gmail/oauth/callback` is added to Google Cloud Console > Credentials > Authorized redirect URIs

### Error: "Access blocked: This app's request is invalid"

**Fix:**
1. Check OAuth consent screen has all 3 scopes added
2. Ensure your Gmail is added as a test user
3. Try incognito window

### Error: "GOOGLE_OAUTH_CLIENT_ID is undefined"

**Fix:**
1. Ensure `.env.local` is in project root (`d:\REIL-Q\.env.local`)
2. Restart dev server after adding env vars
3. Check env var names match exactly (no typos)

### Error: "State mismatch - possible CSRF attack"

**Fix:**
1. Clear browser cookies for localhost
2. Ensure cookies are enabled
3. Check `sameSite` cookie setting (should be `lax`)

### Error: "Mailbox not found" or "User not found"

**Fix:**
1. Ensure you're logged in to Supabase (valid session)
2. Check `users` table has your user record
3. Verify RLS policies allow read/write

### Database: Tokens not encrypted

**Fix:**
1. Check `OAUTH_TOKEN_ENCRYPTION_KEY` is set in `.env.local`
2. Ensure key is 64 hex characters (32 bytes)
3. Restart server after adding key

---

## File Checklist

All files should exist:

**Utilities:**
- [ ] `d:\REIL-Q\lib\oauth\pkce.ts`
- [ ] `d:\REIL-Q\lib\oauth\gmail-auth.ts`
- [ ] `d:\REIL-Q\lib\oauth\token-exchange.ts`
- [ ] `d:\REIL-Q\lib\oauth\token-encryption.ts`
- [ ] `d:\REIL-Q\lib\oauth\token-refresh.ts`

**Mailbox:**
- [ ] `d:\REIL-Q\lib\connectors\gmail\mailbox.ts`

**API Routes:**
- [ ] `d:\REIL-Q\app\api\connectors\gmail\oauth\start\route.ts`
- [ ] `d:\REIL-Q\app\api\connectors\gmail\oauth\callback\route.ts`
- [ ] `d:\REIL-Q\app\api\connectors\gmail\oauth\disconnect\route.ts`

**Config:**
- [ ] `d:\REIL-Q\.env.local`

**Docs:**
- [ ] `d:\REIL-Q\REIL-Q\05_INBOX\gmail-oauth-implementation.md`
- [ ] `d:\REIL-Q\docs\proofs\oauth\README.md`

---

## Next Steps After M1

Once OAuth is working:

1. **M2:** Implement Gmail message ingestion (read messages via API)
2. **M3:** Store messages in database with deduplication
3. **M4:** Build inbox UI to display messages
4. **M5:** Add search and filters

But for M1, you're DONE when:
- [x] OAuth flow completes successfully
- [x] Mailbox record exists with encrypted tokens
- [x] Ledger event logged
- [x] Proof document filled out with screenshots

---

## Time Budget

Total: ~30 minutes

| Task | Time |
|------|------|
| Google Cloud setup | 10 min |
| Environment vars | 5 min |
| Copy/paste code | 10 min |
| Database schema | 2 min |
| Testing | 5 min |
| Proof creation | 3 min |

---

**Good luck, Ashley! You've got this.**

If you get stuck, refer to the full implementation spec:
`d:\REIL-Q\REIL-Q\05_INBOX\gmail-oauth-implementation.md`
