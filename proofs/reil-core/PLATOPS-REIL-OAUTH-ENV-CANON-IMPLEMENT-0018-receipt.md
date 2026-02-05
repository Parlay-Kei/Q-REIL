# PLATOPS-REIL-OAUTH-ENV-CANON-IMPLEMENT-0018 — Receipt

**Mission:** PLATOPS-REIL-OAUTH-ENV-CANON-IMPLEMENT-0018  
**Owner:** PLATOPS  
**Outcome:** Single source of truth mapping module and runtime normalization; no script reads legacy names directly.  
**Contract:** [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md)

---

## Acceptance

- [x] Mapping module exists in one place: `connectors/gmail/lib/oauthEnvCanon.js` (q-suite-ui has `q-suite-ui/lib/oauthEnvCanon.js` for serverless, same contract).
- [x] `getGmailOAuthEnv(envSource?)` reads canonical keys first, falls back to aliases, returns normalized object (canonical key names only) and `missing` list for receipts.
- [x] All listed scripts use the canon resolver; no script reads legacy names directly.

---

## Canonical keys

| Key |
|-----|
| GMAIL_CLIENT_ID |
| GMAIL_CLIENT_SECRET |
| GMAIL_REFRESH_TOKEN |
| GMAIL_SENDER_ADDRESS |

---

## Alias list (legacy → canonical)

| Legacy alias | Canonical |
|--------------|-----------|
| GOOGLE_OAUTH_CLIENT_ID | GMAIL_CLIENT_ID |
| GOOGLE_OAUTH_CLIENT_SECRET | GMAIL_CLIENT_SECRET |

---

## Present or missing (names only; fill at run time)

| Key | Present | Missing |
|-----|--------|--------|
| GMAIL_CLIENT_ID | *(yes/no)* | *(yes/no)* |
| GMAIL_CLIENT_SECRET | *(yes/no)* | *(yes/no)* |
| GMAIL_REFRESH_TOKEN | *(yes/no)* | *(yes/no)* |
| GMAIL_SENDER_ADDRESS | *(yes/no)* | *(yes/no)* |

*(Table filled by runner when validating env; no values in receipt.)*

---

## Paths updated

| Path | Change |
|------|--------|
| `connectors/gmail/lib/oauthEnvCanon.js` | **Added** — mapping module |
| `connectors/gmail/lib/oauth.js` | Uses `getGmailOAuthEnv(process.env)` via `getCanonicalCreds()` |
| `connectors/gmail/lib/load-env.js` | Unchanged; scripts call `getGmailOAuthEnv(process.env)` after loadEnv |
| `connectors/gmail/lib/ingest.js` | Uses `getGmailOAuthEnv(process.env).env` for GMAIL_REFRESH_TOKEN |
| `connectors/gmail/run-sync.mjs` | Uses `getGmailOAuthEnv(process.env)` for receipt and refresh-token presence |
| `scripts/oauth-proof/refresh-token.mjs` | Uses `getGmailOAuthEnv(process.env)` for credentials and receipt |
| `scripts/oauth-proof/proof-gmail-oauth.mjs` | Uses `getGmailOAuthEnv(process.env)` for credentials and receipt |
| `scripts/oauth-proof/one-time-auth.mjs` | Uses `getGmailOAuthEnv(process.env)` for credentials and receipt |
| `q-suite-ui/lib/oauthEnvCanon.js` | **Added** — same contract for Vercel serverless |
| `q-suite-ui/api/gmail-test-send.js` | Uses `getGmailOAuthEnv(process.env)` for all Gmail env |

---

## Notes

- Docs that previously referenced `GOOGLE_OAUTH_*` should be updated to cite [OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md) and list legacy aliases as backward-compatibility only.
- Next: PLATOPS-REIL-VERCEL-ENV-ASSERT-CANON-UPDATE-0019 (CI reports canonical vs alias presence).
