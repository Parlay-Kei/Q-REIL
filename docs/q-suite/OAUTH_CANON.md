# Q Suite — Canonical Google OAuth (Gmail Connector)

**Mission:** OCS-OAUTH-CANONICALIZATION-0039  
**Owner:** OCS  
**Date:** 2026-01-31  
**Scope:** One Google Cloud project and one OAuth client for Q Suite Q REIL Gmail connector usage.

---

## 1. Canonical Google Cloud project

| Term | Canonical value |
|------|-----------------|
| **Project (display)** | Q Suite |
| **Project ID (GCP)** | Single project designated for Q Suite; used for Gmail connector only. |
| **Usage** | Gmail API + OAuth 2.0 Web client for connector scripts and sync. |

**Constraint:** All Gmail connector OAuth flows (proof script, one-time-auth, refresh, `connectors/gmail/run-sync.mjs`) MUST use credentials from this one project. No second project or second OAuth client for Gmail connector.

---

## 2. Canonical OAuth client

| Property | Value |
|----------|--------|
| **Type** | OAuth 2.0 / Web application |
| **Purpose** | Gmail connector: token issuance (proof/one-time-auth), token refresh, sync. |
| **Authorized redirect URIs** | `http://localhost:8765/callback` (default). If using another port (e.g. `PROOF_PORT=8770`), add `http://localhost:<port>/callback` in GCP. |
| **APIs to enable** | Gmail API (required; enable in API Library for this project). |

**Credentials:** Client ID and Client secret are **never** committed to the repo. They are supplied via environment variables or `.env.local` (see [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md)).

---

## 3. Canonical environment variable names

**Contract:** [docs/reil-core/OAUTH_ENV_CANON.md](../reil-core/OAUTH_ENV_CANON.md) (OCS-REIL-OAUTH-ENV-CANON-KICKOFF-0017). All Gmail connector and OAuth proof scripts read via the canonical mapping module; no script reads legacy names directly.

**Canonical keys (use these in Vercel and .env.local):**

| Variable | Purpose | Format / notes |
|----------|---------|----------------|
| **GMAIL_CLIENT_ID** | OAuth 2.0 client ID | `*.apps.googleusercontent.com` |
| **GMAIL_CLIENT_SECRET** | OAuth 2.0 client secret | `GOCSPX-*` |
| **GMAIL_REFRESH_TOKEN** | OAuth refresh token | Minted by same client as above |
| **GMAIL_SENDER_ADDRESS** | Sender email (e.g. test-send) | Optional; default from allowlist |

**Legacy aliases (backward compatibility only; runtime normalizes to canonical):** `GOOGLE_OAUTH_CLIENT_ID` → GMAIL_CLIENT_ID, `GOOGLE_OAUTH_CLIENT_SECRET` → GMAIL_CLIENT_SECRET. Do not introduce new code that reads legacy names directly.

**Optional:** `GOOGLE_REDIRECT_URI` (default `http://localhost:8765/callback`), `PROOF_PORT` (default 8765).

**Lane 1:** Use **one** naming scheme end-to-end. Set **canonical** keys (GMAIL_*) in Vercel Production. A token minted under one client id will fail with `unauthorized_client` when validated by another. Ensure the refresh token is minted by the same client id/secret that the runtime reads from env. Add `https://www.googleapis.com/auth/gmail.send` to scopes if testing send via the endpoint.

---

## 4. Scopes (Gmail connector)

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read Gmail threads, messages, attachments (required for sync) |
| `openid` | Sign-in |
| `https://www.googleapis.com/auth/userinfo.email` | Mailbox/bootstrap email |

---

## 5. Token storage (script / local use)

| Location | Content | Used by |
|----------|---------|--------|
| `scripts/oauth-proof/.tokens.json` | `access_token`, `refresh_token`, `expires_at`, `scope` | Proof script, refresh-token.mjs, `connectors/gmail/run-sync.mjs` (via `getOAuth2ClientFromTokensFile`) |

Tokens in `.tokens.json` are bound to the OAuth client that issued them. If the canonical project/client changes, re-run the proof (or one-time-auth) to obtain new tokens.

---

## 6. Mission assignments

### 6.1 Platform Ops (OPS)

**Mission ID:** OCS-OAUTH-OPS-0039  
**Task:** Implement canonical OAuth in deployment and secret store.

- [ ] Create or designate **one** Google Cloud project for Q Suite Gmail connector.
- [ ] Create **one** OAuth 2.0 Web application client in that project.
- [ ] Configure authorized redirect URI: `http://localhost:8765/callback` (and any alternate ports used by proof/one-time-auth).
- [ ] Enable **Gmail API** for the project (API Library → Gmail API → Enable).
- [ ] Store `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in the designated secret store (e.g. Vercel env, CI secrets, or local `.env.local` per [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md)); never commit to repo.
- [ ] Document the project ID and client name in internal ops runbook; keep this doc ([OAUTH_CANON.md](./OAUTH_CANON.md)) as the single canonical reference for naming and scope.

**Receipt:** Update OPS-901 / OCS runbook with project and client reference; confirm env vars available where scripts and backend expect them (see OAUTH_ENV_MAP).

---

### 6.2 Backend QA (BE-301)

**Mission ID:** OCS-OAUTH-BEQA-0039  
**Task:** Verify Gmail connector and OAuth against canonical setup.

- [ ] Use **only** the canonical env vars (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`) and the single OAuth client designated in OAUTH_CANON.
- [ ] Run `node scripts/oauth-proof/proof-gmail-oauth.mjs` (or one-time-auth) to obtain `.tokens.json` with `gmail.readonly` scope.
- [ ] Run `node connectors/gmail/run-sync.mjs` and confirm 7-day backfill and idempotency per [BE-301 handoff](../../00_PROJECT/handoffs/2026-01-30_BE-301_OCS_to_backend-qa-automation-tester.md).
- [ ] Confirm no use of alternate project or client (e.g. no `GMAIL_CLIENT_ID_TEST` / `GMAIL_CLIENT_SECRET_TEST` for connector; canonical names only per OAUTH_ENV_MAP).

**Receipt:** BE-301 verification completed with canonical OAuth; update BE-301 receipt and OCS execution report.

---

## 7. References

- **OPS-901 canon and registry:** [OPS_901_QSUITE_CANON.md](./OPS_901_QSUITE_CANON.md), [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md)
- **Env and scripts:** [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md)
- **Token steps (user-facing):** [../05_INBOX/GMAIL_TOKEN_STEPS.md](../05_INBOX/GMAIL_TOKEN_STEPS.md)
- **BE-301 verification:** [../00_PROJECT/handoffs/2026-01-30_BE-301_OCS_to_backend-qa-automation-tester.md](../00_PROJECT/handoffs/2026-01-30_BE-301_OCS_to_backend-qa-automation-tester.md)
- **OPS-901 proof runbook:** [../00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md](../00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md)
