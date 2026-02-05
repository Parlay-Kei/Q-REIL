# PLATOPS-REIL-OAUTH-ENV-CANON-0022 — Receipt

**Mission:** PLATOPS-REIL-OAUTH-ENV-CANON-0022  
**Owner:** PLATOPS  
**Outcome:** Every runtime and script resolves OAuth config from one canonical naming scheme.  
**Contract:** [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md)

---

## Acceptance

- [x] All OAuth consumers read **GMAIL_CLIENT_ID**, **GMAIL_CLIENT_SECRET**, **GMAIL_REFRESH_TOKEN**, **GMAIL_SENDER_ADDRESS**.
- [x] Any legacy alias is **mapped** by the resolver only; no code references legacy names directly.
- [x] Receipt states where the resolver pulled values from (canonical or alias) **without exposing values**.

---

## Canonical keys

| Key |
|-----|
| GMAIL_CLIENT_ID |
| GMAIL_CLIENT_SECRET |
| GMAIL_REFRESH_TOKEN |
| GMAIL_SENDER_ADDRESS |

---

## Legacy aliases (mapped only; never referenced directly)

| Legacy alias | Canonical key |
|--------------|---------------|
| GOOGLE_OAUTH_CLIENT_ID | GMAIL_CLIENT_ID |
| GOOGLE_OAUTH_CLIENT_SECRET | GMAIL_CLIENT_SECRET |

---

## Resolver source (names only; no values)

*At run time, call `getGmailOAuthEnv(process.env, { includeSource: true })` and fill the table. Receipt must not contain secret or token values.*

| Key | Resolved from |
|-----|----------------|
| GMAIL_CLIENT_ID | *(canonical \| alias)* |
| GMAIL_CLIENT_SECRET | *(canonical \| alias)* |
| GMAIL_REFRESH_TOKEN | *(canonical \| alias)* |
| GMAIL_SENDER_ADDRESS | *(canonical \| alias)* |

---

## OAuth consumers (all use resolver)

| Consumer | Resolver usage |
|----------|----------------|
| `connectors/gmail/lib/oauth.js` | `getGmailOAuthEnv(process.env)` |
| `connectors/gmail/lib/ingest.js` | `getGmailOAuthEnv(process.env).env` |
| `connectors/gmail/run-sync.mjs` | `getGmailOAuthEnv(process.env)` |
| `scripts/oauth-proof/proof-gmail-oauth.mjs` | `getGmailOAuthEnv(process.env)` |
| `scripts/oauth-proof/refresh-token.mjs` | `getGmailOAuthEnv(process.env)` |
| `scripts/oauth-proof/one-time-auth.mjs` | `getGmailOAuthEnv(process.env)` |
| `q-suite-ui/api/gmail-test-send.js` | `getGmailOAuthEnv(process.env)` |

---

## Implementation note

- Resolver modules: `connectors/gmail/lib/oauthEnvCanon.js`, `q-suite-ui/lib/oauthEnvCanon.js`.
- Optional `getGmailOAuthEnv(envSource, { includeSource: true })` returns a `source` object (key → `'canonical'` or `'alias'`) for receipt generation only; no values in receipt.
