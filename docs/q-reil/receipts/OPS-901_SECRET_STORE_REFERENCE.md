# OPS-901 — Secret Store Reference (Gmail OAuth)

**Mission ID:** QREIL OPS-901  
**Owner:** infra-deployment-specialist  
**Purpose:** Where Gmail OAuth secrets are stored (approved store only; no committed .env).  
**PRD ref:** PRD_Q_REIL_v0.1 §6, §10; §11 (dependencies: secure secret storage).

---

## Approved secret store

| Store | Use | Variables |
|-------|-----|-----------|
| **Vercel — Environment Variables** | Runtime for Preview and Production | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (and any token encryption key when app uses it) |
| **GitHub Actions Secrets** (optional for CI) | Tests / gates that need OAuth | `GMAIL_CLIENT_ID_TEST`, `GMAIL_CLIENT_SECRET_TEST` (or same names as Vercel if shared) |

**Rule:** No client ID or client secret in repo, `.env`, or `.env.local` committed to version control. Local development may use `.env.local` (gitignored) only; production and preview must use Vercel.

---

## Vercel configuration

- **Project:** q-reil  
- **Settings:** [Vercel → q-reil → Settings → Environment Variables](https://vercel.com/strata-nobles-projects/q-reil/settings/environment-variables)

Add for **Production** and **Preview** (and optionally Development if used):

| Name | Value | Environments |
|------|--------|--------------|
| `GOOGLE_OAUTH_CLIENT_ID` | _(from GCP OAuth client)_ | Production, Preview |
| `GOOGLE_OAUTH_CLIENT_SECRET` | _(from GCP OAuth client)_ | Production, Preview |

---

## Verification

- [ ] Client ID and Client Secret added in Vercel only (no commit).
- [x] `.env.example` documents variable names without values (`q-reil/.env.example`; committable via `!.env.example` in `q-reil/.gitignore`).
- [x] No secrets in `docs/` or code (references only).

**Receipt status:** _To be completed by infra-deployment-specialist after storing secrets in Vercel._
