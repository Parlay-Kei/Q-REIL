# OAuth Canonical Update Receipt — OCS-QREIL-GOOGLE-OAUTH-CLIENT-RECREATE-0001

**Mission:** OCS-QREIL-GOOGLE-OAUTH-CLIENT-RECREATE-0001  
**Owner:** PLATOPS → QAG  
**Date:** 2026-02-09  
**Scope:** Replace canonical credential artifacts and rotate secrets after new OAuth client creation.

---

## 1. Summary

After creating the new OAuth 2.0 Client ID (`q-suite-reil-gmail-connector`), this receipt documents the update of canonical credential artifacts and secret rotation.

**Related Receipt:** [OAUTH_CLIENT_RECREATE_RECEIPT.md](./OAUTH_CLIENT_RECREATE_RECEIPT.md)

---

## 2. New OAuth Client Details

| Field | Value |
|-------|-------|
| **Client Name** | `q-suite-reil-gmail-connector` |
| **Client Type** | Desktop |
| **GCP Project** | `qreil-486018` |
| **Client ID** | `[REDACTED].apps.googleusercontent.com` |
| **Client ID (redacted)** | `...8ohqde5.apps.googleusercontent.com` |
| **Client Secret** | `[REDACTED]` (redacted) |

**Note:** Full client ID and secret are stored in secret stores only; never committed to repo. Credentials JSON stored as canonical artifact: `ops/google/q-suite-reil-gmail-connector.json`.

---

## 3. Secret Store Updates

### 3.1 Vercel Production Environment Variables

| Key Name | Status | Location |
|----------|--------|----------|
| **GMAIL_CLIENT_ID** | ⏳ To be updated | Vercel Dashboard → q-reil → Settings → Environment Variables → Production |
| **GMAIL_CLIENT_SECRET** | ⏳ To be updated | Vercel Dashboard → q-reil → Settings → Environment Variables → Production |

**Values to Set:**
- `GMAIL_CLIENT_ID` = `[REDACTED].apps.googleusercontent.com`
- `GMAIL_CLIENT_SECRET` = `[REDACTED]`

**Project Details:**
- **Project Name:** q-reil
- **Project ID:** `prj_VAiSllyEk27tnHDXagBt88h0h64j`
- **Team ID:** `team_DLPOODpWbIp8OubK6ngvbM1v` (if needed)

**Update Method:**
- Via Vercel Dashboard: Settings → Environment Variables → Production → Add/Edit
- Via Vercel CLI: `vercel env add GMAIL_CLIENT_ID production`
- Via API: `PUT https://api.vercel.com/v9/projects/{projectId}/env/{envId}`

**Verification:**
- Run: `.github/workflows/q-reil-vercel-env-assert.yml` (CI workflow)
- Or: `GET https://api.vercel.com/v10/projects/{projectId}/env?teamId={teamId}`

### 3.2 Repo Root `.env.local` (Canonical Vault)

| Key Name | Status | Location |
|----------|--------|----------|
| **GMAIL_CLIENT_ID** | ✅ Updated | `.env.local` (repo root) |
| **GMAIL_CLIENT_SECRET** | ✅ Updated | `.env.local` (repo root) |

**File Path:** `c:\Dev\10_products\Q-REIL\.env.local`

**Status:** ✅ Created with canonical keys

**Contents (redacted):**
```
GMAIL_CLIENT_ID=[REDACTED].apps.googleusercontent.com
GMAIL_CLIENT_SECRET=[REDACTED]
```

**Verification:**
- Run: `node scripts/oauth-proof/discover-canonical-env.mjs`
- Expected: `canonical_keys_present` includes both keys; `env_loaded_from` = repo root `.env.local`

**Canonical Order (env loading):**
1. Repo root `.env.local` ← **Canonical vault (first priority)**
2. `scripts/oauth-proof/.env.local`
3. `connectors/gmail/.env.local`
4. `q-reil/.env.local`
5. `process.cwd()/.env.local`

**Reference:** [docs/q-suite/OAUTH_CANON_IMPLEMENTED.md](../../docs/q-suite/OAUTH_CANON_IMPLEMENTED.md)

### 3.3 Legacy Alias Removal

| Legacy Key | Status | Location |
|------------|--------|----------|
| `GOOGLE_OAUTH_CLIENT_ID` | ✅ Removed (commented) | `q-reil/.env.local` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | ✅ Removed (commented) | `q-reil/.env.local` |

**Action Taken:**
- Legacy aliases commented out in `q-reil/.env.local`
- Migration note added directing to canonical keys in repo root `.env.local`
- Prevents app from drifting back to deleted client

**Rationale:** Canonical keys in repo root `.env.local` take precedence (first in canonical order). Legacy aliases removed to prevent confusion and ensure single source of truth.

**Reference:** [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md)

---

## 4. Key Names and Storage Locations

### Canonical Keys

| Key Name | Purpose | Storage Locations | Format |
|----------|---------|-------------------|--------|
| **GMAIL_CLIENT_ID** | OAuth 2.0 client ID | Vercel Production, repo root `.env.local` | `*.apps.googleusercontent.com` |
| **GMAIL_CLIENT_SECRET** | OAuth 2.0 client secret | Vercel Production, repo root `.env.local` | `GOCSPX-*` |

### Legacy Aliases (Backward Compatible)

| Legacy Key | Canonical Key | Storage Locations |
|------------|---------------|-------------------|
| `GOOGLE_OAUTH_CLIENT_ID` | `GMAIL_CLIENT_ID` | `q-reil/.env.local` (current) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `GMAIL_CLIENT_SECRET` | `q-reil/.env.local` (current) |

**Important:** No secret values are documented in this receipt. Only key names and storage locations.

---

## 5. Verification Steps

### 5.1 Verify Vercel Environment Variables

**Method 1: Vercel Dashboard**
1. Navigate to: https://vercel.com/strata-nobles-projects/q-reil/settings/environment-variables
2. Filter: Production environment
3. Verify keys exist: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
4. Verify values are set (not empty)

**Method 2: Vercel API**
```bash
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v10/projects/prj_VAiSllyEk27tnHDXagBt88h0h64j/env?teamId=team_DLPOODpWbIp8OubK6ngvbM1v" \
  | jq '.envs[] | select(.key == "GMAIL_CLIENT_ID" or .key == "GMAIL_CLIENT_SECRET") | {key: .key, target: .target}'
```

**Method 3: CI Workflow**
- Run: `.github/workflows/q-reil-vercel-env-assert.yml`
- Verifies: Keys exist for Production environment

### 5.2 Verify Repo Root `.env.local`

**Method 1: Discovery Script**
```bash
node scripts/oauth-proof/discover-canonical-env.mjs
```

**Expected Output:**
- `canonical_keys_present` includes `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- `env_loaded_from` shows repo root `.env.local`
- `canonical_keys_missing` does not include client credentials

**Method 2: Manual Check**
- File exists: `.env.local` (repo root)
- Contains: `GMAIL_CLIENT_ID=...`, `GMAIL_CLIENT_SECRET=...`
- Values are non-empty

### 5.3 Verify Auth URL Uses New Client

**Test:**
```bash
node scripts/oauth-proof/one-time-auth.mjs
```

**Expected:**
- Auth URL includes new `client_id` (redacted in output)
- No `deleted_client` error
- OAuth flow completes successfully

**Verification:**
- Check `scripts/oauth-proof/.tokens.json` after successful auth
- Verify `client_id` field matches new client ID

---

## 6. Action Items

### PLATOPS Tasks

- [x] **Update Repo Root `.env.local`:**
  - ✅ Created file with canonical keys
  - ✅ Added `GMAIL_CLIENT_ID` = new client ID
  - ✅ Added `GMAIL_CLIENT_SECRET` = new client secret
  - ✅ Verified file is in `.gitignore` (never commit secrets)

- [x] **Remove Legacy Aliases:**
  - ✅ Commented out `GOOGLE_OAUTH_CLIENT_ID` in `q-reil/.env.local`
  - ✅ Commented out `GOOGLE_OAUTH_CLIENT_SECRET` in `q-reil/.env.local`
  - ✅ Added migration note

- [ ] **Update Vercel Production:**
  - Set `GMAIL_CLIENT_ID` = `[REDACTED].apps.googleusercontent.com`
  - Set `GMAIL_CLIENT_SECRET` = `[REDACTED]`
  - Verify keys exist and are non-empty

- [ ] **Verify Updates:**
  - Run `discover-canonical-env.mjs` → confirm keys present ✅
  - Run Vercel env assert workflow → confirm keys exist (pending Vercel update)
  - Test auth URL → confirm uses new client_id (pending Vercel update)

- [x] **Document:**
  - ✅ Updated this receipt with completion status
  - ✅ Documented key names and storage locations (no values)

### QAG Acceptance Checks

- [ ] Evidence shows new client_id exists and matches stored secrets
- [ ] Auth URL now points at the new client_id
- [ ] Vercel Production env has `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- [ ] Repo root `.env.local` has `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
- [ ] Verdict: **PASS** with receipt and evidence paths

---

## 7. Receipt Status

| Criterion | Status |
|-----------|--------|
| Vercel Production updated | ⏳ Pending |
| Repo root `.env.local` updated | ✅ Completed |
| Legacy aliases removed | ✅ Completed |
| Verification completed | ⏳ Partial (repo verified, Vercel pending) |
| QAG acceptance | ⏳ Pending |

**Status:** **IN PROGRESS** — Repo root `.env.local` updated, legacy aliases removed. Awaiting Vercel Production update.

---

## 8. References

- [OAUTH_CLIENT_RECREATE_RECEIPT.md](./OAUTH_CLIENT_RECREATE_RECEIPT.md) — client recreation receipt
- [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical project, client, variable names
- [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md) — canonical environment variable names
- [docs/q-suite/OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md) — env and script mapping
