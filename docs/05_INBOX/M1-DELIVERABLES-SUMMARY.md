# M1 Deliverables Summary

**Milestone:** M1 - Gmail OAuth Loop (OPS-901)
**Sprint:** REIL-Q v0.3
**Created:** 2025-12-31
**Owner:** Backend Dev Specialist

---

## Deliverables Overview

This document summarizes all deliverables created for M1 (Gmail OAuth Loop).

---

## 1. Implementation Specification

**Location:** `d:\REIL-Q\REIL-Q\05_INBOX\gmail-oauth-implementation.md`

**Contents:**
- Google Cloud setup checklist
- OAuth scope strategy (readonly only for v0.3)
- Three API endpoint specifications:
  - `GET /api/connectors/gmail/oauth/start`
  - `GET /api/connectors/gmail/oauth/callback`
  - `POST /api/connectors/gmail/oauth/disconnect`
- Token storage pattern (AES-256-GCM encryption)
- Complete TypeScript code skeletons (9 files)
- Environment variable requirements
- Security considerations

**Key Features:**
- PKCE (Proof Key for Code Exchange) implementation
- State parameter CSRF protection
- Token encryption at rest
- HTTP-only cookie security
- Comprehensive error handling

---

## 2. OAuth Proof Template

**Location:** `d:\REIL-Q\docs\proofs\oauth\README.md`

**Purpose:** Document successful OAuth implementation for Sprint 0.3

**Sections:**
- Connected Gmail address (redacted for privacy)
- Granted scopes list
- Mailbox database record verification
- Token encryption verification
- OAuth flow proof (4 steps with screenshot placeholders)
- Ledger event verification
- Security checklist
- Timestamp and sign-off

**Screenshot Placeholders:**
1. Google OAuth consent screen
2. Successful connection notification
3. Database record showing encrypted tokens
4. Ledger event (MAILBOX_CONNECTED)

**Screenshot Directory:** `d:\REIL-Q\docs\proofs\oauth\screenshots\`

---

## 3. Quick Start Guide

**Location:** `d:\REIL-Q\REIL-Q\05_INBOX\QUICKSTART-M1-OAUTH.md`

**Purpose:** Get OAuth working in 30 minutes

**Time Budget:**
- Google Cloud setup: 10 minutes
- Environment setup: 5 minutes
- Code implementation: 10 minutes
- Database setup: 2 minutes
- Testing: 5 minutes
- Proof creation: 3 minutes

**Includes:**
- Step-by-step instructions
- Copy/paste commands
- Troubleshooting section
- File checklist

---

## 4. Code Implementation Skeletons

**Total Files:** 9 TypeScript files

### OAuth Utilities (5 files)

1. **PKCE Utilities**
   - File: `d:\REIL-Q\lib\oauth\pkce.ts`
   - Functions: `generateCodeVerifier()`, `generateCodeChallenge()`

2. **Gmail Auth Helpers**
   - File: `d:\REIL-Q\lib\oauth\gmail-auth.ts`
   - Functions: `buildAuthorizationUrl()`, `validateState()`

3. **Token Exchange**
   - File: `d:\REIL-Q\lib\oauth\token-exchange.ts`
   - Functions: `exchangeCodeForTokens()`, `decodeIdToken()`

4. **Token Encryption**
   - File: `d:\REIL-Q\lib\oauth\token-encryption.ts`
   - Functions: `encryptToken()`, `decryptToken()`

5. **Token Refresh**
   - File: `d:\REIL-Q\lib\oauth\token-refresh.ts`
   - Functions: `refreshAccessToken()`
   - Error: `RefreshTokenRevokedError`

### Mailbox Management (1 file)

6. **Mailbox CRUD**
   - File: `d:\REIL-Q\lib\connectors\gmail\mailbox.ts`
   - Function: `createMailbox()`

### API Routes (3 files)

7. **Start OAuth**
   - File: `d:\REIL-Q\app\api\connectors\gmail\oauth\start\route.ts`
   - Endpoint: `GET /api/connectors/gmail/oauth/start`

8. **OAuth Callback**
   - File: `d:\REIL-Q\app\api\connectors\gmail\oauth\callback\route.ts`
   - Endpoint: `GET /api/connectors/gmail/oauth/callback`

9. **Disconnect Gmail**
   - File: `d:\REIL-Q\app\api\connectors\gmail\oauth\disconnect\route.ts`
   - Endpoint: `POST /api/connectors/gmail/oauth/disconnect`

---

## 5. Environment Variables

**File:** `d:\REIL-Q\.env.local` (create if not exists)

**Required Variables:**

```bash
# Google OAuth (from Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=<client-id>.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-<secret>

# Token encryption (generate once with crypto.randomBytes)
OAUTH_TOKEN_ENCRYPTION_KEY=<64-char-hex>

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6. Database Schema

**Table:** `mailboxes`

**SQL:** See `gmail-oauth-implementation.md` or `QUICKSTART-M1-OAUTH.md`

**Key Columns:**
- `id` - UUID primary key
- `org_id` - Organization reference
- `user_id` - User reference
- `provider` - Always 'gmail'
- `provider_email` - Gmail address
- `provider_subject_id` - Google user ID
- `access_token_encrypted` - AES-256-GCM encrypted
- `refresh_token_encrypted` - AES-256-GCM encrypted
- `token_expires_at` - Token expiration timestamp
- `oauth_scopes` - Array of granted scopes
- `status` - 'connected' | 'disconnected' | 'error'

**Indexes:**
- `user_id`
- `org_id`
- `status`

**Constraint:**
- Unique on `(org_id, provider_email)`

---

## OAuth Scopes (Read-Only Strategy)

For M1 (Sprint 0.3), we use **minimum viable, least scary** scopes:

1. `https://www.googleapis.com/auth/gmail.readonly`
   - Read-only access to Gmail
   - Proves ingestion without send permissions

2. `openid`
   - OpenID Connect identity verification

3. `https://www.googleapis.com/auth/userinfo.email`
   - Access to user's email address for mailbox identification

**Scopes to AVOID in v0.3:**
- `gmail.send` (too scary for initial proof)
- `gmail.modify` (not needed for read-only)
- `gmail.compose` (future feature)

---

## Security Features

### PKCE (Proof Key for Code Exchange)

- Cryptographically secure code verifier (32 bytes)
- SHA-256 code challenge
- Challenge method: S256
- Protects against authorization code interception

### State Parameter

- CSRF protection
- Encodes user ID and timestamp
- 5-minute expiration
- Validated on callback

### Cookie Security

- HTTP-only (prevent XSS)
- Secure flag in production
- SameSite: lax (CSRF protection)
- 10-minute expiration
- Path restricted to `/api/connectors/gmail`

### Token Encryption

- Algorithm: AES-256-GCM
- Authenticated encryption (prevents tampering)
- Random IV per encryption
- Format: `iv:authTag:encryptedData`
- Encryption key stored in environment variable

---

## Testing Checklist

- [ ] Google Cloud project configured
- [ ] Gmail API enabled
- [ ] OAuth credentials created
- [ ] OAuth consent screen configured
- [ ] Test user added (Ashley's Gmail)
- [ ] Environment variables set
- [ ] Encryption key generated
- [ ] All 9 TypeScript files created
- [ ] Database schema deployed
- [ ] Dev server running
- [ ] OAuth start endpoint redirects to Google
- [ ] OAuth callback creates mailbox record
- [ ] Tokens stored encrypted
- [ ] Ledger event logged
- [ ] Screenshots captured
- [ ] Proof document filled out
- [ ] Proof committed to repo

---

## Definition of Done for M1

M1 is complete when:

1. **OAuth Flow Works:**
   - User clicks "Connect Gmail"
   - Redirects to Google OAuth
   - User authorizes
   - Callback creates mailbox record
   - User redirected back with success

2. **Data Persisted:**
   - Mailbox record exists in database
   - Tokens encrypted and stored
   - Status is 'connected'
   - Scopes stored in array

3. **Ledger Event:**
   - `MAILBOX_CONNECTED` event logged
   - Payload contains mailbox_id and provider_email

4. **Proof Documented:**
   - Proof template filled out
   - Screenshots captured
   - Timestamp recorded
   - Committed to repo

---

## File Structure

```
d:\REIL-Q\
├── .env.local (environment variables)
│
├── lib\
│   ├── oauth\
│   │   ├── pkce.ts
│   │   ├── gmail-auth.ts
│   │   ├── token-exchange.ts
│   │   ├── token-encryption.ts
│   │   └── token-refresh.ts
│   │
│   └── connectors\
│       └── gmail\
│           └── mailbox.ts
│
├── app\
│   └── api\
│       └── connectors\
│           └── gmail\
│               └── oauth\
│                   ├── start\route.ts
│                   ├── callback\route.ts
│                   └── disconnect\route.ts
│
├── docs\
│   └── proofs\
│       └── oauth\
│           ├── README.md (proof template)
│           └── screenshots\
│               ├── 01-google-consent.png
│               ├── 02-success-notification.png
│               ├── 03-database-record.png
│               └── 04-ledger-event.png
│
└── REIL-Q\
    └── 05_INBOX\
        ├── gmail-oauth-implementation.md (full spec)
        ├── QUICKSTART-M1-OAUTH.md (30-min guide)
        └── M1-DELIVERABLES-SUMMARY.md (this file)
```

---

## Next Steps (Post-M1)

After M1 is complete and proof is committed:

1. **M2: Gmail Message Ingestion**
   - Implement Gmail API client
   - Fetch messages using access token
   - Handle pagination (historyId)

2. **M3: Message Storage**
   - Store messages in database
   - Implement deduplication
   - Handle threading

3. **M4: Inbox UI**
   - Display connected mailboxes
   - Show message list
   - Message detail view

4. **M5: Search & Filters**
   - Full-text search
   - Label filters
   - Date range filters

---

## Support & References

**Main Specification:**
- `d:\REIL-Q\REIL-Q\05_INBOX\gmail-oauth-implementation.md`

**Quick Start:**
- `d:\REIL-Q\REIL-Q\05_INBOX\QUICKSTART-M1-OAUTH.md`

**Proof Template:**
- `d:\REIL-Q\docs\proofs\oauth\README.md`

**Google Documentation:**
- OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Gmail API: https://developers.google.com/gmail/api
- PKCE: https://tools.ietf.org/html/rfc7636

**OAuth Scopes:**
- https://developers.google.com/identity/protocols/oauth2/scopes#gmail

---

## Handoff to Frontend Dev (Future)

When frontend-dev implements UI for OAuth:

**Button Component:**
```typescript
// components/inbox/ConnectGmailButton.tsx
<Button onClick={() => window.location.href = '/api/connectors/gmail/oauth/start'}>
  Connect Gmail
</Button>
```

**Success Handling:**
```typescript
// app/inbox/page.tsx
const searchParams = useSearchParams();
const connected = searchParams.get('connected');

if (connected) {
  toast.success('Gmail connected successfully!');
}
```

**Disconnect:**
```typescript
const handleDisconnect = async (mailboxId: string) => {
  await fetch('/api/connectors/gmail/oauth/disconnect', {
    method: 'POST',
    body: JSON.stringify({ mailbox_id: mailboxId }),
  });
};
```

---

## Conclusion

All M1 deliverables are complete and ready for Ashley to implement.

**Total Time Estimate:** 30-60 minutes (depending on familiarity with Google Cloud Console)

**Blockers:** None

**Dependencies:**
- Supabase project with `users` and `orgs` tables
- Next.js app running
- Node.js environment

**Ready to Start:** YES

---

**Document Status:** COMPLETE
**Created:** 2025-12-31
**Sprint:** REIL-Q v0.3
**Owner:** Backend Dev Specialist (APIForge)
