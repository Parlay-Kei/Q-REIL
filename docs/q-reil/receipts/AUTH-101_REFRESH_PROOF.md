# AUTH-101 — Token Refresh Proof

**Mission ID:** QREIL AUTH-101  
**Owner:** auth-flow-agent  
**Brief:** Verify token refresh in app runtime; emit ledger event TOKEN_REFRESH_VERIFIED.  
**PRD ref:** PRD_Q_REIL_v0.1 §6, §10.

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Token refresh succeeds during a forced refresh test | ☐ |
| 2 | Ledger event TOKEN_REFRESH_VERIFIED emitted in code | ☐ |
| 3 | No secrets logged | ☐ |

---

## Implementation Summary

### Forced refresh test

- **Endpoint:** `POST /api/connectors/gmail/oauth/refresh-test`  
- **Body:** `{ "mailbox_id": "<uuid>" }`  
- **Auth:** Supabase Auth session (same user as mailbox owner).  
- **Behavior:**  
  1. Load mailbox; decrypt refresh_token.  
  2. Call Google token endpoint with `grant_type=refresh_token`.  
  3. Encrypt new access_token; update `mailboxes.access_token_encrypted` and `token_expires_at`.  
  4. Emit `token.refresh_verified` to `public.events`.  
  5. Return `{ "success": true, "mailbox_id": "...", "message": "Token refresh verified; TOKEN_REFRESH_VERIFIED emitted" }`.

### Code Locations

| Item | Location |
|------|----------|
| Refresh-test route | `q-reil/app/api/connectors/gmail/oauth/refresh-test/route.ts` |
| Force refresh + persist | `q-reil/lib/inbox/mailbox-tokens.ts` (`forceRefreshAndPersist`) |
| Token refresh API | `q-reil/lib/oauth/token-refresh.ts` |
| Emit TOKEN_REFRESH_VERIFIED | `q-reil/lib/ledger/events.ts` (`emitTokenRefreshVerified`) |

### Ledger Event

- **Event type:** `token.refresh_verified`  
- **Table:** `public.events`  
- **Payload (no secrets):** `mailbox_id`, `provider`, `provider_email`, `verified_at`.

### Security

- No access_token, refresh_token, or encryption key in logs.  
- Refresh only for authenticated user’s own mailbox.

---

## Verification Steps

1. Complete Connect Gmail flow so a mailbox exists with valid refresh_token.  
2. As the same user, call:
   ```bash
   curl -X POST https://<origin>/api/connectors/gmail/oauth/refresh-test \
     -H "Content-Type: application/json" \
     -d '{"mailbox_id":"<mailbox_uuid>"}' \
     --cookie "<session_cookies>"
   ```
   (Or use browser devtools / fetch from same origin with credentials.)  
3. Expect `200` and `{ "success": true, ... }`.  
4. In `public.events`, find one new row with `event_type = 'token.refresh_verified'` and `entity_id` = mailbox id.

---

## Sign-off

- **Posted:** _Date and location._  
- **Receipt status:** _To be completed after verification._
