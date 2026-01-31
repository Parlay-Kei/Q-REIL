# Gmail OAuth Implementation Specification

**Milestone:** M1 - Gmail OAuth Loop (OPS-901)
**Sprint:** REIL-Q v0.3
**Goal:** Prove OAuth end-to-end and post proof in repo
**Status:** IMPLEMENTATION READY
**Created:** 2025-12-31

---

## Table of Contents

1. [Google Cloud Setup Checklist](#google-cloud-setup-checklist)
2. [OAuth Scope Strategy](#oauth-scope-strategy)
3. [Auth Endpoints Specification](#auth-endpoints-specification)
4. [Token Storage Pattern](#token-storage-pattern)
5. [Implementation Code Skeleton](#implementation-code-skeleton)
6. [Environment Variables](#environment-variables)
7. [Testing the OAuth Loop](#testing-the-oauth-loop)

---

## Google Cloud Setup Checklist

### Prerequisites

- [ ] Google Cloud project created or selected
- [ ] Billing enabled (required for OAuth consent screen verification)
- [ ] Gmail API enabled in project

### Step 1: Enable Gmail API

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Gmail API"
5. Click "Enable"

### Step 2: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. User Type:
   - **Development/Testing:** "External" with test users
   - **Production:** "External" (requires verification for sensitive scopes)
3. App Information:
   - App name: `REIL-Q Inbox`
   - User support email: `ashley@example.com` (your email)
   - Application home page: `https://app.reilq.com` (or localhost during dev)
   - Developer contact email: `ashley@example.com`
4. App Logo (optional): Upload logo if available
5. Click "Save and Continue"

### Step 3: Add OAuth Scopes

1. On the "Scopes" screen, click "Add or Remove Scopes"
2. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
3. Click "Update" then "Save and Continue"

### Step 4: Add Test Users

1. On the "Test users" screen, click "Add Users"
2. Add Ashley's Gmail address: `ashley@gmail.com` (replace with actual)
3. Click "Save and Continue"
4. Review summary and click "Back to Dashboard"

### Step 5: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: `REIL-Q OAuth Client`
5. Authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://app.reilq.com`
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/connectors/gmail/oauth/callback`
   - Production: `https://app.reilq.com/api/connectors/gmail/oauth/callback`
7. Click "Create"
8. Download JSON credentials (contains client_id and client_secret)
9. Store credentials securely in `.env.local`

### Step 6: Publishing Status (Production)

- **Testing Mode:** Max 100 test users, no verification required
- **Production Mode:** Requires verification by Google (can take weeks)
- For M1: Stay in testing mode with Ashley as test user

---

## OAuth Scope Strategy

### M1 Scopes (Minimum Viable, Read-Only)

```
https://www.googleapis.com/auth/gmail.readonly
openid
https://www.googleapis.com/auth/userinfo.email
```

### Scope Justification

| Scope | Purpose | Why Read-Only? |
|-------|---------|----------------|
| `gmail.readonly` | Read messages, threads, labels | Proves ingestion without scary send permissions |
| `openid` | OpenID Connect identity verification | Standard identity scope |
| `userinfo.email` | Access to user's email address | Mailbox identification and display |

### Scopes to AVOID in v0.3

- `gmail.send` - Send emails (too scary for initial proof)
- `gmail.modify` - Modify messages (not needed for read-only ingestion)
- `gmail.compose` - Create drafts (future feature)
- `gmail.labels` - Modify labels (future feature)

### Future Scope Expansion (v0.4+)

When ready to implement send/reply features:
1. Update OAuth consent screen with new scopes
2. Force user re-consent with `prompt=consent`
3. Store new scopes in `mailboxes.oauth_scopes`
4. Verify new scopes before attempting privileged operations

---

## Auth Endpoints Specification

### Endpoint 1: Start OAuth Flow

```
GET /api/connectors/gmail/oauth/start
```

#### Request

**Headers:**
```
Cookie: <Supabase auth session cookie>
```

**Query Parameters:**
None required. Endpoint extracts authenticated user from session.

#### Response

**Success (302 Redirect):**
Redirects browser to Google OAuth authorization URL with PKCE parameters.

Example redirect:
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=123456.apps.googleusercontent.com
  &redirect_uri=http://localhost:3000/api/connectors/gmail/oauth/callback
  &response_type=code
  &scope=https://www.googleapis.com/auth/gmail.readonly%20openid%20email
  &access_type=offline
  &prompt=consent
  &state=eyJ1c2VySWQiOiIxMjMiLCJ0aW1lc3RhbXAiOjE3MDk...
  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  &code_challenge_method=S256
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "User must be authenticated to connect Gmail"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Failed to initiate OAuth flow",
  "message": "Could not generate authorization URL"
}
```

#### Security Considerations

1. **User Authentication:** MUST verify Supabase session before starting flow
2. **PKCE Code Verifier:** Generated server-side, stored in HTTP-only cookie
3. **State Parameter:** Encoded with user ID and timestamp, stored in HTTP-only cookie
4. **Cookie Security:**
   - `httpOnly: true` (prevent XSS)
   - `secure: true` in production (HTTPS only)
   - `sameSite: 'lax'` (CSRF protection)
   - `maxAge: 600` (10 minutes)
   - `path: '/api/connectors/gmail'` (restricted path)

#### Implementation Notes

- Generate cryptographically secure code_verifier (32 bytes)
- Hash verifier with SHA-256 to create code_challenge
- State encodes `{ userId, timestamp, nonce }` as Base64URL JSON
- Store verifier and state in separate cookies for separation of concerns

---

### Endpoint 2: OAuth Callback

```
GET /api/connectors/gmail/oauth/callback
```

#### Request

**Query Parameters:**

Success case:
```
?code=4/0AbCD1234...&state=eyJ1c2VySWQiOiIxMjMiLCJ...
```

Error case:
```
?error=access_denied&state=eyJ1c2VySWQiOiIxMjMiLCJ...
```

**Cookies:**
```
gmail_oauth_verifier: <code_verifier>
gmail_oauth_state: <state_value>
```

#### Response

**Success (302 Redirect):**
```
Location: /inbox?connected=<mailbox_id>
```

**User Denial (302 Redirect):**
```
Location: /inbox?error=oauth_denied
```

**Invalid Request (302 Redirect):**
```
Location: /inbox?error=oauth_invalid
```

**Server Error (302 Redirect):**
```
Location: /inbox?error=oauth_failed
```

#### Processing Steps

1. **Validate State:**
   - Compare `state` query param with `gmail_oauth_state` cookie
   - Decode state and verify timestamp (max 5 minutes old)
   - Extract `userId` from state payload

2. **Verify User:**
   - Get authenticated user from Supabase session
   - Ensure session user ID matches state user ID

3. **Exchange Code for Tokens:**
   - POST to `https://oauth2.googleapis.com/token`
   - Include `code`, `client_id`, `client_secret`, `redirect_uri`, `code_verifier`
   - Receive `access_token`, `refresh_token`, `expires_in`, `id_token`

4. **Extract User Info:**
   - Decode JWT `id_token` payload
   - Extract `sub` (Google user ID), `email`, `email_verified`

5. **Encrypt Tokens:**
   - Encrypt `access_token` with AES-256-GCM
   - Encrypt `refresh_token` with AES-256-GCM
   - Use `OAUTH_TOKEN_ENCRYPTION_KEY` environment variable

6. **Store in Database:**
   - Create or update `mailboxes` record
   - Store encrypted tokens, expires_at, granted scopes
   - Set status to `connected`

7. **Log Event:**
   - Insert `MAILBOX_CONNECTED` event in `ledger_events`

8. **Clean Up:**
   - Delete `gmail_oauth_verifier` cookie
   - Delete `gmail_oauth_state` cookie

#### Security Considerations

1. **State Validation:** MUST match cookie value (prevents CSRF)
2. **User Verification:** Session user MUST match state user
3. **Code Verifier:** MUST be present in cookie and used for PKCE validation
4. **Token Encryption:** NEVER store tokens in plain text
5. **One-Time Use:** Cookies deleted after successful exchange
6. **Error Handling:** Never expose tokens in error messages or logs

#### Error Handling

| Scenario | Action | User Redirect |
|----------|--------|---------------|
| User denied access | Log attempt, redirect | `/inbox?error=oauth_denied` |
| State mismatch | Log security event | `/inbox?error=oauth_invalid` |
| Expired state | Log timeout | `/inbox?error=oauth_invalid` |
| Invalid code | Log error | `/inbox?error=oauth_failed` |
| Token exchange failure | Log API error | `/inbox?error=oauth_failed` |
| Database error | Log storage error | `/inbox?error=oauth_failed` |

---

### Endpoint 3: Disconnect Gmail (Optional but Clean)

```
POST /api/connectors/gmail/disconnect
```

#### Request

**Headers:**
```
Content-Type: application/json
Cookie: <Supabase auth session cookie>
```

**Body:**
```json
{
  "mailbox_id": "uuid-of-mailbox"
}
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "mailbox_id": "uuid-of-mailbox",
  "status": "disconnected"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "You do not own this mailbox"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Mailbox not found"
}
```

#### Processing Steps

1. **Validate Request:**
   - Verify user is authenticated
   - Validate `mailbox_id` is UUID format

2. **Authorization Check:**
   - Fetch mailbox from database
   - Ensure `mailbox.user_id` matches authenticated user ID
   - Ensure `mailbox.org_id` matches user's org

3. **Revoke Google Token (Optional):**
   - POST to `https://oauth2.googleapis.com/revoke`
   - Include `token=<refresh_token>`
   - Handle errors gracefully (token may already be revoked)

4. **Update Database:**
   - Set `mailboxes.status` to `disconnected`
   - Clear `access_token_encrypted` and `refresh_token_encrypted`
   - Set `token_expires_at` to NULL

5. **Log Event:**
   - Insert `MAILBOX_DISCONNECTED` event in `ledger_events`
   - Include `reason: 'user_action'`

#### Security Considerations

1. **Authorization:** User can only disconnect their own mailboxes
2. **Org Isolation:** Verify mailbox belongs to user's org
3. **Token Revocation:** Attempt to revoke with Google (best effort)
4. **Audit Trail:** Always log disconnect events

---

## Token Storage Pattern

### Database Schema (Mailboxes Table)

```sql
CREATE TABLE mailboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Provider info
  provider TEXT NOT NULL, -- 'gmail'
  provider_email TEXT NOT NULL,
  provider_subject_id TEXT NOT NULL, -- Google user ID from id_token.sub

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT, -- AES-256-GCM encrypted
  refresh_token_encrypted TEXT, -- AES-256-GCM encrypted
  token_expires_at TIMESTAMPTZ,

  -- OAuth metadata
  oauth_scopes TEXT[], -- Array of granted scopes

  -- Status
  status TEXT NOT NULL DEFAULT 'connected', -- 'connected' | 'disconnected' | 'error'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(org_id, provider_email)
);

-- Indexes
CREATE INDEX idx_mailboxes_user_id ON mailboxes(user_id);
CREATE INDEX idx_mailboxes_org_id ON mailboxes(org_id);
CREATE INDEX idx_mailboxes_status ON mailboxes(status);
```

### Token Encryption Strategy

#### Encryption Algorithm: AES-256-GCM

**Why AES-256-GCM?**
- Authenticated encryption (prevents tampering)
- Industry standard for sensitive data
- Built into Node.js crypto module
- Provides confidentiality and integrity

#### Encryption Format

```
<IV (24 hex chars)>:<Auth Tag (32 hex chars)>:<Encrypted Data (hex)>
```

Example encrypted token:
```
a1b2c3d4e5f6g7h8i9j0k1l2:m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8:9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3
```

#### Encryption Key Management

**Key Generation (One-Time Setup):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output: 64-character hex string (32 bytes)

**Key Storage:**
- Store in environment variable: `OAUTH_TOKEN_ENCRYPTION_KEY`
- NEVER commit to git
- Use separate keys for dev/staging/production
- Store production key in secrets manager (AWS Secrets Manager, Vault, etc.)

**Key Rotation Strategy (Future):**
1. Generate new encryption key
2. Decrypt all tokens with old key
3. Re-encrypt with new key
4. Update database records
5. Deprecate old key after rotation complete

#### Token Refresh Strategy

**When to Refresh:**
- Access tokens expire in 3600 seconds (1 hour)
- Refresh 5 minutes before expiration (`expires_at - 5min`)
- On 401 Unauthorized from Gmail API

**Refresh Process:**
1. Decrypt `refresh_token_encrypted`
2. POST to `https://oauth2.googleapis.com/token` with `grant_type=refresh_token`
3. Receive new `access_token` (and possibly new `refresh_token`)
4. Encrypt new access token
5. Update `mailboxes` record with new token and expiration
6. If new refresh token returned, encrypt and update (token rotation)

**Refresh Token Revocation Handling:**
- Google returns `invalid_grant` error when refresh token is revoked
- Update mailbox status to `disconnected`
- Log `MAILBOX_DISCONNECTED` event with `reason: 'refresh_token_revoked'`
- Notify user to reconnect mailbox

#### Token Storage Security Checklist

- [x] Tokens encrypted with AES-256-GCM before storage
- [x] Encryption key stored in environment variables
- [x] Never log tokens (access or refresh)
- [x] Database columns named `*_encrypted` to signal encrypted data
- [x] Tokens never exposed in API responses
- [x] Decryption only happens in secure server context
- [x] Failed decryption logged and handled gracefully

---

## Implementation Code Skeleton

### File Structure

```
d:\REIL-Q\app\
├── api\
│   └── connectors\
│       └── gmail\
│           └── oauth\
│               ├── start\
│               │   └── route.ts
│               ├── callback\
│               │   └── route.ts
│               └── disconnect\
│                   └── route.ts
│
d:\REIL-Q\lib\
├── oauth\
│   ├── pkce.ts
│   ├── gmail-auth.ts
│   ├── token-exchange.ts
│   ├── token-encryption.ts
│   └── token-refresh.ts
│
└── connectors\
    └── gmail\
        └── mailbox.ts
```

---

### 1. PKCE Utilities

**File:** `d:\REIL-Q\lib\oauth\pkce.ts`

```typescript
import crypto from 'crypto';

/**
 * Generate cryptographically secure PKCE code verifier
 * @returns Base64URL-encoded random string (43 characters)
 */
export function generateCodeVerifier(): string {
  const buffer = crypto.randomBytes(32);
  return base64URLEncode(buffer);
}

/**
 * Generate PKCE code challenge from verifier
 * @param verifier - The code verifier
 * @returns SHA-256 hash of verifier, Base64URL-encoded
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64URLEncode(hash);
}

/**
 * Base64URL encode (RFC 4648)
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

---

### 2. Gmail OAuth Helpers

**File:** `d:\REIL-Q\lib\oauth\gmail-auth.ts`

```typescript
import crypto from 'crypto';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';

interface GmailOAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface AuthorizationUrlResult {
  url: string;
  codeVerifier: string;
  state: string;
}

/**
 * Generate Gmail OAuth authorization URL with PKCE
 */
export function buildAuthorizationUrl(
  config: GmailOAuthConfig,
  userId: string
): AuthorizationUrlResult {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState(userId);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent', // Force consent to get refresh token
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return { url, codeVerifier, state };
}

/**
 * Generate cryptographically secure state parameter
 */
function generateState(userId: string): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = {
    userId,
    timestamp: Date.now(),
    nonce: randomBytes,
  };

  const buffer = Buffer.from(JSON.stringify(payload));
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode and validate state parameter
 */
export function validateState(state: string): { userId: string } | null {
  try {
    const json = Buffer.from(
      state.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString();

    const payload = JSON.parse(json);

    // Validate state is not expired (5 minutes)
    const maxAge = 5 * 60 * 1000;
    if (Date.now() - payload.timestamp > maxAge) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}
```

---

### 3. Token Exchange

**File:** `d:\REIL-Q\lib\oauth\token-exchange.ts`

```typescript
interface TokenExchangeRequest {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  id_token: string;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  request: TokenExchangeRequest
): Promise<TokenResponse> {
  // TODO: Add client_id and client_secret from environment
  const params = new URLSearchParams({
    code: request.code,
    client_id: request.clientId,
    client_secret: request.clientSecret,
    redirect_uri: request.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: request.codeVerifier,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Token exchange failed: ${error.error_description || error.error}`
    );
  }

  return response.json();
}

/**
 * Decode JWT ID token to get user info
 */
export function decodeIdToken(idToken: string): {
  sub: string;
  email: string;
  email_verified: boolean;
} {
  const [, payloadB64] = idToken.split('.');
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
  return payload;
}
```

---

### 4. Token Encryption

**File:** `d:\REIL-Q\lib\oauth\token-encryption.ts`

```typescript
import crypto from 'crypto';

/**
 * Encrypt OAuth tokens using AES-256-GCM
 * TODO: Get OAUTH_TOKEN_ENCRYPTION_KEY from environment
 */
export function encryptToken(token: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt OAuth tokens
 */
export function decryptToken(encryptedToken: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');

  const [ivHex, authTagHex, encryptedData] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

### 5. Token Refresh

**File:** `d:\REIL-Q\lib\oauth\token-refresh.ts`

```typescript
interface RefreshTokenRequest {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  refresh_token?: string; // Only if rotated
}

/**
 * Refresh access token using refresh token
 * TODO: Add error handling for revoked tokens
 */
export async function refreshAccessToken(
  request: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const params = new URLSearchParams({
    client_id: request.clientId,
    client_secret: request.clientSecret,
    refresh_token: request.refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();

    if (error.error === 'invalid_grant') {
      throw new RefreshTokenRevokedError('Refresh token has been revoked');
    }

    throw new Error(
      `Token refresh failed: ${error.error_description || error.error}`
    );
  }

  return response.json();
}

export class RefreshTokenRevokedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefreshTokenRevokedError';
  }
}
```

---

### 6. Mailbox Management

**File:** `d:\REIL-Q\lib\connectors\gmail\mailbox.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

interface CreateMailboxParams {
  userId: string;
  providerEmail: string;
  providerSubjectId: string;
  oauthScopes: string[];
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  tokenExpiresAt: Date;
}

/**
 * Create or update mailbox record after successful OAuth
 * TODO: Add ledger event logging
 */
export async function createMailbox(
  supabase: SupabaseClient,
  params: CreateMailboxParams
) {
  // Get user's org_id
  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', params.userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Check if mailbox exists
  const { data: existing } = await supabase
    .from('mailboxes')
    .select('id')
    .eq('org_id', user.org_id)
    .eq('provider_email', params.providerEmail)
    .single();

  if (existing) {
    // Update existing mailbox
    const { data: mailbox, error } = await supabase
      .from('mailboxes')
      .update({
        user_id: params.userId,
        provider_subject_id: params.providerSubjectId,
        oauth_scopes: params.oauthScopes,
        access_token_encrypted: params.accessTokenEncrypted,
        refresh_token_encrypted: params.refreshTokenEncrypted,
        token_expires_at: params.tokenExpiresAt.toISOString(),
        status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Log MAILBOX_CONNECTED event (reconnected: true)

    return mailbox;
  }

  // Create new mailbox
  const { data: mailbox, error } = await supabase
    .from('mailboxes')
    .insert({
      org_id: user.org_id,
      user_id: params.userId,
      provider: 'gmail',
      provider_email: params.providerEmail,
      provider_subject_id: params.providerSubjectId,
      oauth_scopes: params.oauthScopes,
      access_token_encrypted: params.accessTokenEncrypted,
      refresh_token_encrypted: params.refreshTokenEncrypted,
      token_expires_at: params.tokenExpiresAt.toISOString(),
      status: 'connected',
    })
    .select()
    .single();

  if (error) throw error;

  // TODO: Log MAILBOX_CONNECTED event

  return mailbox;
}
```

---

### 7. API Route: Start OAuth

**File:** `d:\REIL-Q\app\api\connectors\gmail\oauth\start\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildAuthorizationUrl } from '@/lib/oauth/gmail-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Get these from environment variables
    const config = {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/gmail/oauth/callback`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    };

    // Generate authorization URL with PKCE
    const { url, codeVerifier, state } = buildAuthorizationUrl(config, user.id);

    // Store PKCE parameters in secure cookies
    const cookieStore = cookies();

    cookieStore.set('gmail_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/api/connectors/gmail',
    });

    cookieStore.set('gmail_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/api/connectors/gmail',
    });

    // Redirect to Google OAuth
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('[Gmail OAuth] Start error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
```

---

### 8. API Route: OAuth Callback

**File:** `d:\REIL-Q\app\api\connectors\gmail\oauth\callback\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateState } from '@/lib/oauth/gmail-auth';
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/oauth/token-exchange';
import { encryptToken } from '@/lib/oauth/token-encryption';
import { createMailbox } from '@/lib/connectors/gmail/mailbox';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('[Gmail OAuth] User denied access:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_invalid`
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient();

    // Retrieve stored PKCE parameters
    const storedVerifier = cookieStore.get('gmail_oauth_verifier')?.value;
    const storedState = cookieStore.get('gmail_oauth_state')?.value;

    // Validate state (CSRF protection)
    if (!storedState || storedState !== state) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    const stateData = validateState(state);
    if (!stateData) {
      throw new Error('Invalid or expired state');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== stateData.userId) {
      throw new Error('User mismatch');
    }

    if (!storedVerifier) {
      throw new Error('Code verifier not found');
    }

    // TODO: Get client_id and client_secret from environment
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: storedVerifier,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/gmail/oauth/callback`,
    });

    // Decode ID token
    const userInfo = decodeIdToken(tokens.id_token);

    // TODO: Get encryption key from environment
    // Encrypt tokens
    const encryptionKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY!;
    const encryptedAccessToken = encryptToken(tokens.access_token, encryptionKey);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token, encryptionKey);

    // Calculate expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Create or update mailbox
    const mailbox = await createMailbox(supabase, {
      userId: user.id,
      providerEmail: userInfo.email,
      providerSubjectId: userInfo.sub,
      oauthScopes: tokens.scope.split(' '),
      accessTokenEncrypted: encryptedAccessToken,
      refreshTokenEncrypted: encryptedRefreshToken,
      tokenExpiresAt: expiresAt,
    });

    // Clear OAuth cookies
    cookieStore.delete('gmail_oauth_verifier');
    cookieStore.delete('gmail_oauth_state');

    // Redirect to inbox with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?connected=${mailbox.id}`
    );

  } catch (error) {
    console.error('[Gmail OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_failed`
    );
  }
}
```

---

### 9. API Route: Disconnect Gmail

**File:** `d:\REIL-Q\app\api\connectors\gmail\oauth\disconnect\route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mailbox_id } = await request.json();

    // Fetch mailbox
    const { data: mailbox, error: fetchError } = await supabase
      .from('mailboxes')
      .select('*')
      .eq('id', mailbox_id)
      .single();

    if (fetchError || !mailbox) {
      return NextResponse.json({ error: 'Mailbox not found' }, { status: 404 });
    }

    // Authorization check
    if (mailbox.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not own this mailbox' },
        { status: 403 }
      );
    }

    // TODO: Optionally revoke token with Google
    // POST https://oauth2.googleapis.com/revoke?token=<refresh_token>

    // Update mailbox status
    const { error: updateError } = await supabase
      .from('mailboxes')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mailbox_id);

    if (updateError) throw updateError;

    // TODO: Log MAILBOX_DISCONNECTED event

    return NextResponse.json({
      success: true,
      mailbox_id,
      status: 'disconnected',
    });

  } catch (error) {
    console.error('[Gmail OAuth] Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect mailbox' },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables

Create or update `d:\REIL-Q\.env.local`:

```bash
# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123def456ghi789

# OAuth Token Encryption Key (generate once, never change)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
OAUTH_TOKEN_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Generate Encryption Key

Run this command once to generate the encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `.env.local` as `OAUTH_TOKEN_ENCRYPTION_KEY`.

---

## Testing the OAuth Loop

### Manual Testing Steps

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to OAuth Start Endpoint:**
   - Open browser: `http://localhost:3000/api/connectors/gmail/oauth/start`
   - Should redirect to Google OAuth consent screen

3. **Authorize with Test User:**
   - Sign in with Ashley's Gmail (must be added as test user)
   - Review requested permissions
   - Click "Allow"

4. **Verify Callback:**
   - Should redirect to `http://localhost:3000/inbox?connected=<uuid>`
   - Check browser developer console for any errors

5. **Verify Database:**
   ```sql
   SELECT
     id,
     provider_email,
     status,
     oauth_scopes,
     token_expires_at,
     created_at
   FROM mailboxes
   WHERE user_id = '<ashley-user-id>';
   ```

   Expected result:
   - `status`: `connected`
   - `provider_email`: Ashley's Gmail
   - `oauth_scopes`: `['https://www.googleapis.com/auth/gmail.readonly', 'openid', 'email']`
   - `access_token_encrypted`: Encrypted string (format: `iv:authTag:data`)
   - `refresh_token_encrypted`: Encrypted string

6. **Verify Ledger Event:**
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

### Automated Testing (Future)

Create test file: `d:\REIL-Q\__tests__\oauth\gmail-oauth.test.ts`

```typescript
// TODO: Add integration tests for OAuth flow
// - Test authorization URL generation
// - Test state validation
// - Test token exchange
// - Test token encryption/decryption
// - Test mailbox creation
```

---

## Proof Deliverable Location

After successful testing, create proof document at:

**Location:** `d:\REIL-Q\docs\proofs\oauth\README.md`

See next section for proof template.

---

## Definition of Done for M1

- [ ] Google Cloud project configured with OAuth credentials
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured with test user (Ashley)
- [ ] Environment variables set in `.env.local`
- [ ] Encryption key generated
- [ ] All TypeScript files created (9 files total)
- [ ] OAuth start endpoint works (redirects to Google)
- [ ] OAuth callback endpoint works (creates mailbox record)
- [ ] Database record created with encrypted tokens
- [ ] Ledger event logged
- [ ] Manual test completed end-to-end
- [ ] Proof document created in `d:\REIL-Q\docs\proofs\oauth\README.md`
- [ ] Screenshot captured showing connected Gmail
- [ ] Proof committed to repo

---

**Document Status:** IMPLEMENTATION READY
**Created:** 2025-12-31
**Sprint:** REIL-Q v0.3
**Owner:** Backend Dev Specialist
