# PLATOPS-REIL-OAUTH-REFRESH-MINT-0023 RECEIPT

Mission ID: PLATOPS-REIL-OAUTH-REFRESH-MINT-0023  
Lane: Lane 1 Gmail Ingestion to Live UI  
Owner: Platform Ops  
Status: DRAFT | PASS | FAIL  
Timestamp (UTC): [REQUIRED]

## Purpose
Mint a Gmail OAuth refresh token for the test mailbox and store it in the canonical runtime store so the Gmail ingestion connector can authenticate without manual reconsent.

## Canonical Store
Target: Vercel Production environment for project q-reil  
Key name: GMAIL_REFRESH_TOKEN  
Values must not appear in this receipt.

## Inputs
1. OAuth client JSON path: [REQUIRED]  
   Example: /mnt/data/qreil-oauth-client.json  
   Note: Script uses canonical env (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET) from repo `.env.local` or env; no JSON path if using env.
2. Gmail test mailbox: [REQUIRED]  
   Expected default: stratanoble.co@gmail.com

## Preconditions Checklist (all required)
- [ ] Google Cloud project is accessible (expected: QREIL / qreil-486018)
- [ ] Gmail API is enabled in the project
- [ ] OAuth consent screen exists and is configured for External user type
- [ ] Test user list includes the Gmail test mailbox (if consent screen is in Testing)
- [ ] Requested scope set is minimal (gmail.readonly only)
- [ ] OAuth client JSON is not committed to git and not copied into receipts

If any item above is false, set Status to FAIL and complete the Failure Notes section.

**Scope for 0023:** For gmail.readonly only, set before running:  
`GMAIL_OAUTH_SCOPES=https://www.googleapis.com/auth/gmail.readonly`  
(Default in `scripts/oauth-proof/one-time-auth.mjs` includes gmail.send; override for ingestion-only.)

## OAuth Request Configuration (must match)
Record the exact settings used to ensure a refresh token is returned.

Authorization request:
- access_type: offline
- prompt: consent
- include_granted_scopes: false *(not sent by one-time-auth.mjs)*
- response_type: code
- scope(s): [REQUIRED]  
  Must include: https://www.googleapis.com/auth/gmail.readonly  
  Must not include send or modify scopes.  
  Script: set `GMAIL_OAUTH_SCOPES=https://www.googleapis.com/auth/gmail.readonly` or script default applies.

Redirect URI:
- [REQUIRED]  
  Must match the OAuth client configuration exactly.  
  Script default: `http://localhost:8765/callback` (or `OAUTH_REDIRECT_URI` if set). Ports 8765–8769 tried if 8765 in use.

Client type used:
- [REQUIRED] Desktop app or Web app  
  Script: Web app (redirect URI to localhost). GCP client must be "Web application" with above redirect URI.

## Execution Evidence (all required, no secrets)
Run metadata:
- Start time (UTC): [REQUIRED]
- End time (UTC): [REQUIRED]
- Operator identity: [REQUIRED] (name or handle, no email required)
- Host environment: [REQUIRED] (local, CI runner, or other)

Consent proof:
- Consent completed: YES | NO [REQUIRED]
- Google account used for consent: [REQUIRED]  
  Expected: stratanoble.co@gmail.com
- Evidence note: [REQUIRED]  
  Example: "Consent screen approved and returned authorization code."

Token mint result:
- Refresh token returned by Google: YES | NO [REQUIRED]
- Access token returned: YES | NO [REQUIRED]
- Token file written locally: YES | NO [REQUIRED]  
  If YES, path (do not include file contents): [REQUIRED]  
  Script default: `scripts/oauth-proof/.tokens.json`

Validation output (redacted):
- OAuth library or script exit code: [REQUIRED]  
  Run: `node scripts/oauth-proof/refresh-token.mjs` (after mint).
- Error string if any (no secrets): [REQUIRED if exit not 0]
- Scope verification result: PASS | FAIL [REQUIRED]  
  Confirm scope list from mint or `.tokens.json` is gmail.readonly only.

## Canonical Store Write Evidence (all required, no secrets)
- Vercel Production key set for GMAIL_REFRESH_TOKEN: YES | NO [REQUIRED]
- Method used to set it: [REQUIRED] (Vercel CLI, dashboard, API, or other)  
  Example CLI: `vercel env add GMAIL_REFRESH_TOKEN production` (paste value when prompted; do not log value).
- Verification performed: YES | NO [REQUIRED]
- Verification evidence: [REQUIRED]  
  Example: "Verified key exists by name in Production env for project q-reil."

## Postconditions (all required)
- [ ] 0023 receipt fields are fully populated with real values (no placeholders)
- [ ] No token values were printed to console logs, receipts, or commits
- [ ] GMAIL_REFRESH_TOKEN exists in Vercel Production for project q-reil
- [ ] Scope set confirmed as gmail.readonly only

## Verdict
Status: PASS | FAIL [REQUIRED]

PASS criteria:
- Refresh token returned is YES
- Canonical store write evidence is complete and verified
- Scope verification result is PASS
- No secrets leaked

FAIL criteria:
- Any required field is missing
- Refresh token returned is NO
- Canonical store was not written or not verified
- Scope set includes send or modify without explicit approval

## Failure Notes (required if FAIL)
Root cause category (pick one):
- Consent not completed
- OAuth client misconfigured
- Scope configuration error
- Gmail API not enabled
- Token returned but not stored
- Store write failed
- Unknown

Details:
[REQUIRED if FAIL]

## Execution reference (no secrets)
- Mint script: `node scripts/oauth-proof/one-time-auth.mjs` (from repo root; env from `.env.local` or GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_OAUTH_SCOPES).
- Validation: `node scripts/oauth-proof/refresh-token.mjs`.
- OAuth canon: docs/reil-core/OAUTH_ENV_CANON.md.

## Links to Related Lane 1 Artifacts
- Pointer discovery receipt (0032): proofs/reil-core/PLATOPS-REIL-OAUTH-POINTER-DISCOVERY-0032-receipt.md
- Vercel prod env receipt (0024): proofs/reil-core/PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024-receipt.md
- Ingest run receipt (0025): proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md
- Smoke and idempotency proof (0026): proofs/reil-core/QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md
- Redeploy receipt (0028): proofs/reil-core/RELOPS-REIL-PROD-REDEPLOY-AFTER-GMAIL-0028-receipt.md
