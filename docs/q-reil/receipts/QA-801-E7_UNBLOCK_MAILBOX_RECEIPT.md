# QA-801-E7 UNBLOCK — Mailbox Connected & Session for QA

**Mission ID:** QREIL QA-801-E7 UNBLOCK  
**Owner:** auth-flow-agent  
**Scope:** PRD_Q_REIL_v0.1 §6 §10  
**Goal:** Connect a single Gmail mailbox for the QA org and confirm session auth is valid for API calls. No ingestion expansion, no UI polish.

**Deliverable:** Receipt proving mailbox is connected and a session exists for QA to use. Then QA runs the existing runbook and fills [QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md](QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md).

---

## What happens next (the build path)

1. **Fill this receipt** — Connected mailbox and successful **200** on inbox threads (and optionally 200 on sync). Complete the **Receipt** table below with mailbox ID, org ID, user ID, provider email, app URL, session for QA, and both API checks (threads + sync).
2. **Execute the existing E7 runbook** — [QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md](QA-801_E7_IDEMPOTENCY_RUNTIME_PROOF.md):
   - **Sync A** — Same mailbox, same 7-day window; record response, timestamp, correlation ID(s), row counts (threads, messages, attachments).
   - **Sync B** — Same request immediately after; record response, timestamp, correlation ID(s), row counts.
   - **Assert** — Counts unchanged after run B; correlation IDs recorded for both runs.
3. **Flip E7 to PASS** — In [QA-801_DOD_MATRIX.md](QA-801_DOD_MATRIX.md) set criterion #7 to PASS; in [QA-801_EVIDENCE_PACK.md](QA-801_EVIDENCE_PACK.md) set E7 verdict to PASS and reference the runtime proof receipt.
4. **Then and only then** — PRD §10 becomes eligible for **full PASS** (all seven criteria satisfied).

---

## Prerequisites

- **App:** Next.js app in `q-reil/` with env from `q-reil/.env.local` (Supabase URL/keys, Google OAuth client, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`).
- **QA org:** One org in `public.orgs` and at least one user in `public.users` with that `org_id`, and the same user in `auth.users` (Supabase Auth). If none exists, create as below.
- **Redirect URI:** For local dev, `http://localhost:3000/api/connectors/gmail/oauth/callback` must be added to the Google OAuth client (OPS-901).

---

## Step 1 — Ensure QA org and user exist

If you already have an org and a user who can log in, skip to Step 2.

**Option A — Supabase Dashboard**

1. **Create org:** Table Editor → `orgs` → Insert row: `name` = "QA Org", `slug` = "qa-org" (or any unique slug). Note the `id` (UUID).
2. **Create Auth user:** Authentication → Users → Add user (email + password, or magic link). Note the user `id` (UUID).
3. **Link user to org:** Table Editor → `users` → Insert row: `id` = auth user id, `org_id` = org id from step 1, `email` = same as auth user email. Optionally set `full_name`.

**Option B — SQL (with service role or Dashboard SQL editor)**

```sql
-- Create QA org
INSERT INTO public.orgs (name, slug)
VALUES ('QA Org', 'qa-org')
RETURNING id;  -- use this as :org_id

-- After creating a user in Auth (Dashboard → Authentication → Users), get their id and:
INSERT INTO public.users (id, org_id, email)
VALUES (:auth_user_id, :org_id, :email)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 2 — Sign in as the QA user

- **If the app has a login page:** Sign in with that user’s email and password (or magic link).
- **If the app has no login UI:** Use Supabase Dashboard → Authentication → Users → select the user → “Send magic link” (or use Supabase Auth API to sign in and obtain a session). Then open the app in a browser and, if needed, set the session cookie (e.g. via a one-off route that calls `supabase.auth.setSession()` with the token, or by using the magic link in the same browser).

Ensure the browser has a valid session for that user (you can confirm by opening `/q-reil/inbox` and seeing no 401).

---

## Step 3 — Connect Gmail (one mailbox for QA org)

1. Start the app: `cd q-reil && npm run dev`. App URL: `http://localhost:3000` (or your `NEXT_PUBLIC_APP_URL`).
2. In the same browser (with the QA user session), go to **http://localhost:3000/q-reil/inbox**.
3. Click **“Connect Gmail”**. You are redirected to Google.
4. Sign in with the Google account you want to use for QA and grant the requested scopes.
5. You are redirected back to `/q-reil/inbox?connected=<mailbox_id>`. The callback creates or updates a row in `mailboxes` with `status = 'connected'`.

**Verify in DB (Supabase SQL editor or `psql`):**

```sql
SELECT id, org_id, user_id, provider_email, status
FROM mailboxes
WHERE status = 'connected'
ORDER BY updated_at DESC
LIMIT 1;
```

Note: `id` (mailbox_id), `org_id`, `user_id`, `provider_email`.

---

## Step 4 — Confirm session is valid for API calls

The sync and inbox APIs require the same session (cookie or Bearer).

**Option A — Session cookie (recommended for QA runbook)**

1. In the same browser where you are logged in, open DevTools → Application (Chrome) or Storage (Firefox) → Cookies → `http://localhost:3000`.
2. Find the Supabase auth cookie. Its name is typically **`sb-<hostname>-auth-token`** (e.g. for localhost: **`sb-localhost-auth-token`**). For this project the hostname segment is often derived from the Supabase URL (e.g. `sb-umzuncubiizoomoxlgts-auth-token`). Copy the **full cookie name and value**.
3. Test the session:

```bash
# Replace COOKIE with the full cookie, e.g. "sb-localhost-auth-token=<value>"
curl -s -o /dev/null -w "%{http_code}" -H "Cookie: COOKIE" "http://localhost:3000/api/q-reil/inbox/threads"
# Expect: 200
```

4. Optional — test sync (no need to run full backfill; 200 is enough to prove auth):

```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/connectors/gmail/sync" \
  -H "Content-Type: application/json" \
  -H "Cookie: COOKIE" \
  -d '{"forceFullSync": true}'
# Expect: JSON with "ok": true and HTTP 200 (or 400 only if mailbox not found; 401 = bad session)
```

**Option B — Bearer token**

If you have an access token (e.g. from `supabase.auth.getSession()` in a small script or from Dashboard), use:

```bash
curl -s -w "\n%{http_code}" -H "Authorization: Bearer YOUR_ACCESS_TOKEN" "http://localhost:3000/api/q-reil/inbox/threads"
# Expect: 200
```

---

## Receipt — Fill after completion

| Field | Value |
|-------|--------|
| **Mailbox ID** | *(UUID from `mailboxes.id`)* |
| **Org ID** | *(UUID from `mailboxes.org_id`)* |
| **User ID** | *(UUID from `mailboxes.user_id`)* |
| **Provider email** | *(Gmail address from `mailboxes.provider_email`)* |
| **App URL used** | e.g. `http://localhost:3000` |
| **Session for QA** | Cookie: use cookie name + value as in Step 4. Or: “Bearer token from getSession(); see Step 4 Option B.” |
| **Threads API check** | 200 (date/time checked) |
| **Sync API check** | 200 with `ok: true` (date/time checked) |

**Signed / completed by:** _________________ **Date:** _________________

---

## Next step for QA

Once this receipt is filled and the “Session for QA” and API checks are documented:

- Follow **What happens next (the build path)** above: execute the E7 runbook (Sync A → Sync B → counts unchanged, correlation IDs recorded), then flip E7 to PASS in the DOD matrix and evidence pack. Only then is PRD §10 eligible for full PASS.
