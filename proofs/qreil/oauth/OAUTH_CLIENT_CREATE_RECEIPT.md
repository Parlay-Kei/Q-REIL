# OAuth Client Create Receipt — OCS-QREIL-OAUTH-CLIENT-CREATE-0006

**Mission:** OCS-QREIL-OAUTH-CLIENT-CREATE-0006  
**Owner:** PLATOPS → QAG  
**Date:** 2026-02-09  
**Scope:** Create fresh OAuth Desktop client in GCP project qreil-486018 and rotate Q REIL to use it.

---

## 1. OAuth Client Created

### Client Details

| Field | Value |
|-------|-------|
| **Client Name** | `q-suite-reil-gmail-connector` |
| **Client Type** | Desktop |
| **GCP Project ID** | `qreil-486018` |
| **Client ID** | `[REDACTED].apps.googleusercontent.com` |
| **Client ID (redacted)** | `...8ohqde5.apps.googleusercontent.com` |
| **Client Secret** | `[REDACTED]` (redacted) |
| **Redirect URIs** | `http://localhost` (Desktop client) |

### Credentials JSON Artifact

**Location:** `ops/google/q-suite-reil-gmail-connector.json`

**Contents (redacted):**
```json
{
  "installed": {
    "client_id": "[REDACTED].apps.googleusercontent.com",
    "project_id": "qreil-486018",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "[REDACTED]",
    "redirect_uris": ["http://localhost"]
  }
}
```

**Status:** ✅ Stored as canonical ops artifact

---

## 2. Gmail API Status

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Gmail API Enabled** | ⏳ To be verified | Desktop OAuth clients typically require Gmail API to be enabled in the project |

**Verification Method:**
- GCP Console → APIs & Services → Enabled APIs → Search "Gmail API"
- Or: `gcloud services list --enabled --project=qreil-486018 | grep gmail`

**Note:** Desktop OAuth clients can be used for local development and one-time auth flows. The Gmail API must be enabled in project `qreil-486018` for API calls to succeed.

---

## 3. Secret Store Updates

### 3.1 Repo Root `.env.local` (Canonical Vault)

| Key Name | Status | Value (redacted) |
|----------|--------|------------------|
| **GMAIL_CLIENT_ID** | ✅ Updated | `[REDACTED].apps.googleusercontent.com` |
| **GMAIL_CLIENT_SECRET** | ✅ Updated | `[REDACTED]` |

**File Path:** `.env.local` (repo root)  
**Status:** ✅ Created with canonical keys

**Verification:**
```bash
node scripts/oauth-proof/discover-canonical-env.mjs
```

**Expected:** `canonical_keys_present` includes `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`; `env_loaded_from` shows repo root `.env.local`.

### 3.2 Vercel Production Environment Variables

| Key Name | Status | Location |
|----------|--------|----------|
| **GMAIL_CLIENT_ID** | ⏳ To be updated | Vercel Dashboard → q-reil → Settings → Environment Variables → Production |
| **GMAIL_CLIENT_SECRET** | ⏳ To be updated | Vercel Dashboard → q-reil → Settings → Environment Variables → Production |

**Project Details:**
- **Project Name:** q-reil
- **Project ID:** `prj_VAiSllyEk27tnHDXagBt88h0h64j`
- **Team ID:** `team_DLPOODpWbIp8OubK6ngvbM1v`

**Update Method:**
- Via Vercel Dashboard: Settings → Environment Variables → Production → Add/Edit
- Via Vercel CLI: `vercel env add GMAIL_CLIENT_ID production`
- Via API: `PUT https://api.vercel.com/v9/projects/{projectId}/env/{envId}`

**Values to Set:**
- `GMAIL_CLIENT_ID` = `[REDACTED].apps.googleusercontent.com`
- `GMAIL_CLIENT_SECRET` = `[REDACTED]`

**Verification:**
- Run: `.github/workflows/q-reil-vercel-env-assert.yml` (CI workflow)
- Or: `GET https://api.vercel.com/v10/projects/{projectId}/env?teamId={teamId}`

---

## 4. Legacy Alias Removal

### 4.1 q-reil/.env.local

| Action | Status | Details |
|--------|--------|---------|
| **Legacy aliases removed** | ✅ Completed | `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` commented out |
| **Migration note added** | ✅ Completed | Comment directs to canonical keys in repo root `.env.local` |

**File:** `q-reil/.env.local`

**Before:**
```
GOOGLE_OAUTH_CLIENT_ID=[REDACTED-LEGACY].apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=[REDACTED-LEGACY]
```

**After:**
```
# Gmail OAuth (OPS-901 — DEPRECATED: Legacy client deleted)
# Legacy aliases removed per OCS-QREIL-OAUTH-CLIENT-CREATE-0006
# Use canonical keys (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET) from repo root .env.local
# GOOGLE_OAUTH_CLIENT_ID=[REDACTED-LEGACY].apps.googleusercontent.com (DELETED)
# GOOGLE_OAUTH_CLIENT_SECRET=[REDACTED-LEGACY] (DELETED)
```

**Rationale:** Prevents app from drifting back to deleted client. Canonical keys in repo root `.env.local` take precedence (first in canonical order).

---

## 5. Verification Steps

### 5.1 Verify Credentials JSON Artifact

**Check:**
```bash
ls -la ops/google/q-suite-reil-gmail-connector.json
cat ops/google/q-suite-reil-gmail-connector.json | jq '.installed.project_id'
```

**Expected:** File exists; `project_id` = `"qreil-486018"`

### 5.2 Verify Repo Root `.env.local`

**Check:**
```bash
node scripts/oauth-proof/discover-canonical-env.mjs
```

**Expected:**
- `canonical_keys_present` includes `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- `env_loaded_from` = repo root `.env.local`
- `canonical_keys_missing` does not include client credentials

### 5.3 Verify Legacy Aliases Removed

**Check:**
```bash
grep -E "GOOGLE_OAUTH_CLIENT_ID|GOOGLE_OAUTH_CLIENT_SECRET" q-reil/.env.local
```

**Expected:** Only commented lines (starting with `#`)

### 5.4 Verify Vercel Environment Variables

**Method 1: Vercel Dashboard**
- Navigate to: https://vercel.com/strata-nobles-projects/q-reil/settings/environment-variables
- Filter: Production environment
- Verify keys exist: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- Verify values match new client (redacted in UI)

**Method 2: Vercel API**
```bash
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v10/projects/prj_VAiSllyEk27tnHDXagBt88h0h64j/env?teamId=team_DLPOODpWbIp8OubK6ngvbM1v" \
  | jq '.envs[] | select(.key == "GMAIL_CLIENT_ID" or .key == "GMAIL_CLIENT_SECRET") | {key: .key, target: .target}'
```

**Expected:** Both keys exist for Production environment

---

## 6. QAG Acceptance Checks

- [ ] Evidence that client is created in qreil-486018
  - ✅ Credentials JSON artifact stored: `ops/google/q-suite-reil-gmail-connector.json`
  - ✅ Client ID: `[REDACTED].apps.googleusercontent.com`
  - ✅ Project ID in JSON: `qreil-486018`

- [ ] Evidence that Gmail API is enabled
  - ⏳ To be verified (GCP Console or gcloud CLI)

- [ ] Evidence that env keys exist in Vercel and repo, values redacted
  - ✅ Repo root `.env.local`: Keys present (values redacted in receipt)
  - ⏳ Vercel Production: To be updated

- [ ] Verdict: **IN PROGRESS** — Awaiting Vercel update and Gmail API verification

---

## 7. Receipt Status

| Criterion | Status |
|-----------|--------|
| OAuth client created (Desktop) | ✅ `q-suite-reil-gmail-connector` in `qreil-486018` |
| Credentials JSON stored | ✅ `ops/google/q-suite-reil-gmail-connector.json` |
| Gmail API enabled | ⏳ To be verified |
| Repo root `.env.local` updated | ✅ Canonical keys set |
| Vercel Production updated | ⏳ Pending |
| Legacy aliases removed | ✅ Commented out in `q-reil/.env.local` |
| QAG acceptance | ⏳ Pending |

**Status:** **IN PROGRESS** — Client created, credentials stored, repo updated. Awaiting Vercel update and Gmail API verification.

---

## 8. References

- [OAUTH_CANON_UPDATE_RECEIPT.md](./OAUTH_CANON_UPDATE_RECEIPT.md) — Secret store update receipt
- [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical project, client, variable names
- [docs/q-suite/OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md) — single canonical client entry
- [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md) — canonical environment variable names
