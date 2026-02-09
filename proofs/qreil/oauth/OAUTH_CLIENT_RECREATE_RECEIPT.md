# OAuth Client Recreate Receipt — OCS-QREIL-GOOGLE-OAUTH-CLIENT-RECREATE-0001

**Mission:** OCS-QREIL-GOOGLE-OAUTH-CLIENT-RECREATE-0001  
**Owner:** PLATOPS → QAG  
**Date:** 2026-02-09  
**Scope:** Replace deleted Google OAuth client with a new canonical client for Q REIL Gmail integration.

---

## 1. Discovery Summary

### Current Client ID (Deleted)

| Field | Value |
|-------|-------|
| **Client ID** | `[REDACTED-LEGACY].apps.googleusercontent.com` |
| **Client ID (redacted)** | `...herd6lv.apps.googleusercontent.com` |
| **Project Number** | `626553152103` |
| **Status** | **DELETED** (confirmed via refresh token attempt) |
| **Error Code** | `deleted_client` |
| **Error Description** | "The OAuth client was deleted." |

### Evidence of Deletion

**Test executed:** `node scripts/oauth-proof/refresh-token.mjs`  
**Date:** 2026-02-09  
**Result:** Refresh token call failed with `deleted_client` error.

**Receipt output:**
```json
{
  "receipt": "oauth_refresh_failure",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "grant_type": "refresh_token",
  "refresh_token_present": true,
  "error": "deleted_client",
  "error_description": "The OAuth client was deleted."
}
```

### Current Credential Storage

| Location | Keys Found | Status |
|----------|------------|--------|
| **q-reil/.env.local** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Present (legacy aliases) |
| **Repo root .env.local** | None | Not found |
| **scripts/oauth-proof/.env.local** | None | Not found |
| **Vercel Production** | Unknown | Requires VERCEL_TOKEN to check |

**Note:** Current credentials use legacy aliases (`GOOGLE_OAUTH_CLIENT_ID`). Canonical names are `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`.

---

## 2. GCP Project Discovery

### Target Project Requirements

| Requirement | Value |
|-------------|-------|
| **Project Display Name** | Q Suite |
| **Project ID (GCP)** | *(To be discovered or created)* |
| **Project Number** | `626553152103` (from deleted client) |
| **Purpose** | Gmail API + OAuth 2.0 Web client for Q REIL connector |

### Discovery Method

1. **Check if project exists with number `626553152103`:**
   - Use `gcloud projects describe` with project number
   - Or check GCP Console → IAM & Admin → Projects

2. **If project exists:**
   - Use that project ID for the new OAuth client

3. **If project does not exist or is inaccessible:**
   - Create new project "Q Suite" (or use existing Q Suite project)
   - Document project ID in [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md)

**Reference:** [docs/q-suite/OPS_901_QSUITE_CANON.md](../../docs/q-suite/OPS_901_QSUITE_CANON.md) — canonical project declaration

---

## 3. New OAuth Client Configuration

### Client Specifications

| Field | Value |
|-------|-------|
| **Client Name (exact)** | `q-suite-reil-gmail-connector` |
| **Client Type** | OAuth 2.0 / Web application |
| **Purpose** | Q REIL Gmail connector: token issuance, refresh, sync |
| **Authorized Redirect URIs** | `http://localhost:8765/callback`, `http://127.0.0.1:8765/callback` |

**Additional redirect URIs (if needed):**
- `http://localhost:8766/callback` (if PROOF_PORT=8766)
- `http://localhost:8767/callback` (if PROOF_PORT=8767)
- `http://localhost:8768/callback` (if PROOF_PORT=8768)
- `http://localhost:8769/callback` (if PROOF_PORT=8769)
- `http://localhost:8770/callback` (if PROOF_PORT=8770)

### APIs Required

| API | Status |
|-----|--------|
| **Gmail API** | Must be enabled in the project |

**Reference:** [docs/q-suite/OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_REGISTRY.md)

---

## 4. OAuth Consent Screen Requirements

| Requirement | Value |
|-------------|-------|
| **User Type** | External |
| **Publishing Status** | Testing or In Production |
| **Scopes Required** | `https://www.googleapis.com/auth/gmail.readonly`, `openid`, `https://www.googleapis.com/auth/userinfo.email` |
| **Test Users** | Add test Gmail addresses if in Testing mode |

**Reference:** [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md)

---

## 5. Secret Store Updates Required

### Canonical Secret Keys

| Key Name | Storage Location | Current Status |
|----------|-----------------|----------------|
| **GMAIL_CLIENT_ID** | Vercel Production, repo root `.env.local` | To be updated |
| **GMAIL_CLIENT_SECRET** | Vercel Production, repo root `.env.local` | To be updated |

### Update Locations

1. **Vercel Production Environment Variables:**
   - Project: `q-reil` (ID: `prj_VAiSllyEk27tnHDXagBt88h0h64j`)
   - Path: Settings → Environment Variables → Production
   - Keys: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`

2. **Repo Root `.env.local` (Canonical Vault):**
   - Path: `.env.local` (repo root)
   - Keys: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
   - **Note:** Currently using `q-reil/.env.local` with legacy aliases; migrate to canonical names

3. **Legacy Aliases (Backward Compatibility):**
   - `GOOGLE_OAUTH_CLIENT_ID` → `GMAIL_CLIENT_ID` (runtime normalizes)
   - `GOOGLE_OAUTH_CLIENT_SECRET` → `GMAIL_CLIENT_SECRET` (runtime normalizes)

**Reference:** [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md)

---

## 6. Action Items

### PLATOPS Tasks

- [ ] **Discover GCP Project ID:**
  - Check if project with number `626553152103` exists
  - If exists, use that project
  - If not, use/create Q Suite project
  - Document project ID in [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md)

- [ ] **Create OAuth 2.0 Client ID:**
  - Project: Q Suite (discovered/created above)
  - Type: Web application
  - Name: `q-suite-reil-gmail-connector`
  - Redirect URIs: `http://localhost:8765/callback`, `http://127.0.0.1:8765/callback`
  - Enable Gmail API if not already enabled

- [ ] **Configure OAuth Consent Screen:**
  - User type: External
  - Scopes: `gmail.readonly`, `openid`, `userinfo.email`
  - Add test users if in Testing mode

- [ ] **Update Secret Store:**
  - Vercel Production: Set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
  - Repo root `.env.local`: Set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` (canonical vault)
  - Optionally update `q-reil/.env.local` to use canonical names (or remove if root exists)

- [ ] **Document:**
  - Update [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md) with project ID
  - Document key names and storage locations (no secret values)

### QAG Acceptance Checks

- [ ] Evidence shows old client_id (`...herd6lv.apps.googleusercontent.com`) was deleted
- [ ] Evidence shows new client_id exists and matches stored secrets
- [ ] Auth URL now points at the new client_id
- [ ] Verdict: **PASS** with receipt and evidence paths

---

## 7. Evidence Files

| File | Purpose |
|------|---------|
| `proofs/qreil/oauth/OAUTH_CLIENT_RECREATE_RECEIPT.md` | This receipt (deletion evidence, discovery, action items) |
| `proofs/qreil/oauth/OAUTH_CANON_UPDATE_RECEIPT.md` | Secret store update receipt (to be created) |
| `scripts/oauth-proof/.tokens.json` | Contains refresh token from deleted client (needs re-mint) |

---

## 8. Receipt Status

| Criterion | Status |
|-----------|--------|
| Old client_id discovered | ✅ `[REDACTED-LEGACY].apps.googleusercontent.com` |
| Deletion confirmed | ✅ Error: `deleted_client` |
| GCP project identified | ⏳ To be discovered/created |
| New OAuth client created | ⏳ Pending |
| Secrets updated | ⏳ Pending |
| QAG acceptance | ⏳ Pending |

**Status:** **IN PROGRESS** — Discovery complete, awaiting GCP project discovery and client creation.

---

## 9. References

- [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical project, client, variable names
- [docs/q-suite/OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md) — single canonical client entry
- [docs/q-suite/OPS_901_QSUITE_CANON.md](../../docs/q-suite/OPS_901_QSUITE_CANON.md) — canonical project declaration
- [docs/reil-core/OAUTH_ENV_CANON.md](../../docs/reil-core/OAUTH_ENV_CANON.md) — canonical environment variable names
