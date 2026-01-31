# AUTH-101 — Connect Gmail Proof

**Mission ID:** QREIL AUTH-101  
**Owner:** auth-flow-agent  
**Brief:** Implement Gmail connect flow; user completes OAuth; mailbox record created; tokens encrypted at rest; ledger event MAILBOX_CONNECTED emitted. No ingestion yet.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #1 Gmail OAuth).

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | User clicks Connect Gmail and completes OAuth | ☐ |
| 2 | Mailbox record created in DB | ☐ |
| 3 | Tokens stored encrypted at rest | ☐ |
| 4 | Ledger event MAILBOX_CONNECTED emitted in code | ☐ |
| 5 | No secrets logged | ☐ |

---

## Implementation Summary

### Flow

1. **Connect Gmail** (Inbox UI)  
   - User clicks “Connect Gmail” on `/q-reil/inbox`.  
   - Browser redirects to `GET /api/connectors/gmail/oauth/authorize`.

2. **Authorize**  
   - Server builds Google OAuth URL with PKCE and state (user-bound).  
   - Stores `gmail_oauth_verifier` and `gmail_oauth_state` in HTTP-only cookies (path `/api/connectors/gmail/oauth`, 10 min).  
   - Redirects user to Google consent.

3. **Callback**  
   - Google redirects to `GET /api/connectors/gmail/oauth/callback?code=...&state=...`.  
   - Server validates state, exchanges code for tokens (no tokens in logs).  
   - Encrypts access and refresh tokens (AES-256-GCM) and stores in `mailboxes.access_token_encrypted` / `refresh_token_encrypted`.  
   - Creates or updates mailbox row; emits `mailbox.connected` to `public.events`.  
   - Clears OAuth cookies; redirects to `/q-reil/inbox?connected=<mailbox_id>`.

### Code Locations

| Item | Location |
|------|----------|
| Connect button | `q-reil/app/q-reil/inbox/page.tsx` |
| Authorize route | `q-reil/app/api/connectors/gmail/oauth/authorize/route.ts` |
| Callback route | `q-reil/app/api/connectors/gmail/oauth/callback/route.ts` |
| PKCE / state | `q-reil/lib/oauth/pkce.ts`, `q-reil/lib/oauth/gmail-auth.ts` |
| Token exchange | `q-reil/lib/oauth/token-exchange.ts` |
| Token encryption | `q-reil/lib/oauth/token-encryption.ts` |
| Mailbox create + ledger | `q-reil/lib/inbox/mailbox.ts`, `q-reil/lib/ledger/events.ts` |

### Ledger Event

- **Event type:** `mailbox.connected`  
- **Table:** `public.events`  
- **Payload (no secrets):** `provider`, `provider_email`, `provider_subject_id`, `oauth_scopes`, `initial_status`, `backfill_days`.

### Security

- No access_token, refresh_token, or encryption key in logs.  
- Tokens encrypted at rest (AES-256-GCM, key from `OAUTH_TOKEN_ENCRYPTION_KEY`).  
- PKCE (S256); state bound to user and time-limited (5 min).

---

## Verification Steps

1. Set env: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.  
2. Ensure OPS-901 proof pack complete (redirect URIs include app callback).  
3. Ensure Supabase has `orgs`, `users`, `mailboxes`, `events` (migrations 00001, 00002, 00017, 00030).  
4. Sign in (Supabase Auth); ensure a row in `public.users` with `org_id`.  
5. Open `/q-reil/inbox`, click “Connect Gmail”, complete Google consent.  
6. Confirm redirect to `/q-reil/inbox?connected=<id>` and one new row in `mailboxes` and one row in `events` with `event_type = 'mailbox.connected'`.

---

## Sign-off

- **Posted:** _Date and location._  
- **Receipt status:** _To be completed after verification._
