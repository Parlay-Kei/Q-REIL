# OAuth Proof: Gmail Integration (M1)

**Milestone:** M1 - Gmail OAuth Loop (OPS-901)
**Sprint:** REIL-Q v0.3
**Date:** YYYY-MM-DD
**Tester:** Ashley
**Status:** PENDING

---

## Objective

Prove Gmail OAuth end-to-end flow is working:
1. User initiates OAuth flow
2. Google authorization completes
3. Tokens received and encrypted
4. Mailbox record created in database
5. User redirected back to app with success

---

## Test Environment

- **Environment:** Development / Staging / Production (circle one)
- **Application URL:** `http://localhost:3000` or `https://app.reilq.com`
- **Google Cloud Project:** `[project-name]`
- **Test Gmail Account:** `ashley@gmail.com` (redact if needed)

---

## Connected Mailbox Details

### Gmail Account Information

- **Connected Email:** `ashley@gmail.com` (or `a****y@gmail.com` for redacted)
- **Google User ID:** `sub:1234567890` (from `id_token.sub`)
- **Email Verified:** Yes / No

### Granted OAuth Scopes

The following scopes were granted by the user:

- [x] `https://www.googleapis.com/auth/gmail.readonly`
- [x] `openid`
- [x] `https://www.googleapis.com/auth/userinfo.email`

**Scope Verification:**
```sql
SELECT oauth_scopes FROM mailboxes WHERE id = '<mailbox-id>';
```

**Result:**
```json
[
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "https://www.googleapis.com/auth/userinfo.email"
]
```

### Mailbox Database Record

**Query:**
```sql
SELECT
  id,
  org_id,
  user_id,
  provider,
  provider_email,
  provider_subject_id,
  oauth_scopes,
  status,
  token_expires_at,
  created_at,
  updated_at
FROM mailboxes
WHERE provider_email = 'ashley@gmail.com';
```

**Result:**
```
id:                   <uuid>
org_id:               <org-uuid>
user_id:              <user-uuid>
provider:             gmail
provider_email:       ashley@gmail.com
provider_subject_id:  1234567890
oauth_scopes:         {https://www.googleapis.com/auth/gmail.readonly, openid, https://www.googleapis.com/auth/userinfo.email}
status:               connected
token_expires_at:     2025-12-31 10:30:00+00
created_at:           2025-12-31 09:30:00+00
updated_at:           2025-12-31 09:30:00+00
```

### Token Encryption Verification

**Access Token Encrypted:**
```
<redacted-encrypted-string>
Format: iv:authTag:encryptedData
Example: a1b2c3d4e5f6g7h8i9j0k1l2:m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8:9c0d1e2f3g4...
```

**Refresh Token Encrypted:**
```
<redacted-encrypted-string>
```

**Encryption Validation:**
- [ ] Tokens stored in encrypted format (not plain text)
- [ ] Encryption format matches `iv:authTag:data` pattern
- [ ] Decryption test successful (internal only, not logged)

---

## OAuth Flow Proof

### Step 1: Initiate OAuth Flow

**Action:** Navigate to OAuth start endpoint

**Request:**
```
GET http://localhost:3000/api/connectors/gmail/oauth/start
```

**Response:** 302 Redirect to Google OAuth

**Google Authorization URL (sanitized):**
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=123456789.apps.googleusercontent.com
  &redirect_uri=http://localhost:3000/api/connectors/gmail/oauth/callback
  &response_type=code
  &scope=https://www.googleapis.com/auth/gmail.readonly%20openid%20email
  &access_type=offline
  &prompt=consent
  &state=<base64url-state>
  &code_challenge=<sha256-challenge>
  &code_challenge_method=S256
```

**Verification:**
- [x] Redirect to Google OAuth occurred
- [x] `code_challenge_method` is `S256` (PKCE enabled)
- [x] `access_type=offline` (request refresh token)
- [x] `prompt=consent` (force consent screen)
- [x] Scopes match expected list

---

### Step 2: Google Authorization

**Action:** User authorizes app on Google consent screen

**Screenshot Placeholder:**

```
[SCREENSHOT: Google OAuth consent screen showing REIL-Q Inbox requesting permissions]

Expected elements:
- App name: "REIL-Q Inbox"
- Permissions list:
  * View your email messages and settings (gmail.readonly)
  * Associate you with your personal info on Google (openid, email)
- "Allow" and "Cancel" buttons
```

**Verification:**
- [x] Consent screen shows correct app name
- [x] Scopes displayed match requested scopes
- [x] User clicked "Allow"

---

### Step 3: OAuth Callback

**Action:** Google redirects back to callback endpoint with authorization code

**Request:**
```
GET http://localhost:3000/api/connectors/gmail/oauth/callback?
  code=4/0AbCD1234...
  &state=<base64url-state>
```

**Processing:**
1. State validation: PASSED
2. Code verifier retrieved from cookie: PASSED
3. Token exchange with Google: PASSED
4. ID token decoded: PASSED
5. Tokens encrypted: PASSED
6. Mailbox record created: PASSED
7. Cookies cleared: PASSED

**Response:** 302 Redirect to `/inbox?connected=<mailbox-id>`

**Verification:**
- [x] Callback processed without errors
- [x] User redirected to inbox with success parameter

---

### Step 4: Success Confirmation

**Action:** User lands on inbox page with success message

**Screenshot Placeholder:**

```
[SCREENSHOT: Inbox page showing success toast notification]

Expected elements:
- Toast notification: "Gmail Connected - Your Gmail account has been connected successfully. Syncing messages..."
- URL: http://localhost:3000/inbox
- Mailbox visible in sidebar or mailbox list
```

**Verification:**
- [x] Success message displayed to user
- [x] Connected mailbox appears in UI
- [x] No error messages in console

---

## Ledger Event Verification

**Query:**
```sql
SELECT
  event_type,
  org_id,
  user_id,
  payload,
  created_at
FROM ledger_events
WHERE event_type = 'MAILBOX_CONNECTED'
  AND created_at >= '2025-12-31 09:00:00'
ORDER BY created_at DESC
LIMIT 1;
```

**Result:**
```json
{
  "event_type": "MAILBOX_CONNECTED",
  "org_id": "<org-uuid>",
  "user_id": "<user-uuid>",
  "payload": {
    "mailbox_id": "<mailbox-uuid>",
    "provider_email": "ashley@gmail.com",
    "reconnected": false
  },
  "created_at": "2025-12-31T09:30:00.123Z"
}
```

**Verification:**
- [x] Ledger event created
- [x] Event type is `MAILBOX_CONNECTED`
- [x] Payload contains mailbox_id and provider_email
- [x] Timestamp matches OAuth completion time

---

## Security Verification

### PKCE Implementation

- [x] Code verifier generated with crypto.randomBytes (32 bytes)
- [x] Code challenge is SHA-256 hash of verifier
- [x] Challenge method is `S256` (not `plain`)
- [x] Verifier stored in HTTP-only cookie
- [x] Verifier cookie expires in 10 minutes

### State Parameter Security

- [x] State is cryptographically random
- [x] State encodes user ID
- [x] State validated on callback (matches cookie)
- [x] State expires in 5 minutes
- [x] State mismatch rejected

### Cookie Security

- [x] Cookies are HTTP-only (not accessible via JavaScript)
- [x] Cookies have `secure` flag in production
- [x] Cookies have `sameSite: lax`
- [x] Cookies scoped to `/api/connectors/gmail`
- [x] Cookies deleted after successful callback

### Token Security

- [x] Access token encrypted before storage
- [x] Refresh token encrypted before storage
- [x] Encryption uses AES-256-GCM
- [x] Tokens never logged to console
- [x] Tokens never exposed in API responses

---

## Token Refresh Test (Optional)

**Objective:** Verify token refresh works before expiration

**Action:** Wait until 5 minutes before `token_expires_at`, then trigger Gmail API request

**Expected Behavior:**
1. System detects token near expiration
2. Refresh token used to get new access token
3. New access token encrypted and stored
4. Database record updated with new expiration
5. Gmail API request succeeds with new token

**Verification:**
```sql
SELECT
  token_expires_at,
  updated_at
FROM mailboxes
WHERE id = '<mailbox-id>';
```

**Result:**
- [ ] Token expiration extended
- [ ] `updated_at` timestamp updated
- [ ] Gmail API request successful

---

## Error Handling Test (Optional)

### Test: User Cancels OAuth

**Action:** Click "Cancel" on Google consent screen

**Expected Behavior:**
- Redirect to `/inbox?error=oauth_denied`
- Error message: "Gmail connection was cancelled."

**Result:** PASS / FAIL

### Test: Expired State

**Action:** Wait 6 minutes after starting OAuth, then complete flow

**Expected Behavior:**
- Redirect to `/inbox?error=oauth_invalid`
- Error message: "Security error. Please try again."

**Result:** PASS / FAIL

---

## Screenshots

### Screenshot 1: Google OAuth Consent Screen

**File:** `d:\REIL-Q\docs\proofs\oauth\screenshots\01-google-consent.png`

**Description:** Shows REIL-Q Inbox requesting Gmail permissions

**Placeholder:**
```
[INSERT SCREENSHOT HERE]

Must show:
- App name: "REIL-Q Inbox"
- Gmail readonly permission
- OpenID/email permissions
- "Allow" button
```

---

### Screenshot 2: Successful Connection

**File:** `d:\REIL-Q\docs\proofs\oauth\screenshots\02-success-notification.png`

**Description:** Inbox page showing success notification

**Placeholder:**
```
[INSERT SCREENSHOT HERE]

Must show:
- Success toast: "Gmail Connected"
- URL contains ?connected=<uuid>
- No console errors
```

---

### Screenshot 3: Database Record

**File:** `d:\REIL-Q\docs\proofs\oauth\screenshots\03-database-record.png`

**Description:** Supabase or database query showing mailbox record

**Placeholder:**
```
[INSERT SCREENSHOT HERE]

Must show:
- mailboxes table query result
- status: connected
- encrypted tokens
- oauth_scopes array
```

---

### Screenshot 4: Ledger Event

**File:** `d:\REIL-Q\docs\proofs\oauth\screenshots\04-ledger-event.png`

**Description:** Ledger event showing MAILBOX_CONNECTED

**Placeholder:**
```
[INSERT SCREENSHOT HERE]

Must show:
- event_type: MAILBOX_CONNECTED
- payload with mailbox_id
- timestamp
```

---

## Timestamp

**OAuth Test Completed:** YYYY-MM-DD HH:MM:SS UTC

**Example:**
```
2025-12-31 09:30:00 UTC
```

---

## Sign-Off

**Tester:** Ashley

**Signature:** ___________________________

**Date:** YYYY-MM-DD

---

## Notes

Add any additional notes, observations, or issues encountered during testing:

```
- Note 1: OAuth flow completed in ~15 seconds
- Note 2: Token refresh not tested (requires waiting 55 minutes)
- Note 3: Revocation test skipped (requires manual token revocation)
```

---

## Proof Status

- [ ] Google Cloud setup complete
- [ ] OAuth flow tested end-to-end
- [ ] Mailbox record created
- [ ] Tokens encrypted and stored
- [ ] Ledger event logged
- [ ] Screenshots captured
- [ ] Security checklist verified
- [ ] Proof document committed to repo

**Overall Status:** PENDING / PASSED / FAILED

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
**Milestone:** M1 - Gmail OAuth Loop (OPS-901)
