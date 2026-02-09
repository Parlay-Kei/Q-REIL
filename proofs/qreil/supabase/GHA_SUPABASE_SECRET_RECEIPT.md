# GitHub Actions Supabase Secret Receipt — PLATOPS-QREIL-SUPABASE-ENV-SET-0017

**Mission:** PLATOPS-QREIL-SUPABASE-ENV-SET-0017  
**Owner:** OCS → PLATOPS → QAG  
**Date:** 2026-02-09  
**Scope:** Verify SUPABASE_SERVICE_ROLE_KEY exists as GitHub Actions secret for Q REIL.

---

## 1. Execution Summary

| Item | Value |
|------|-------|
| **Check Method** | `gh secret list` |
| **Check Time** | 2026-02-09T17:42:00Z |
| **Status** | ❌ **MISSING** |

---

## 2. GitHub Actions Secret Check

### 2.1 Current Secrets

**Command:** `gh secret list`

**Output:**
```
GMAIL_CLIENT_SECRET	2026-02-09T17:28:55Z
GMAIL_REFRESH_TOKEN	2026-02-09T17:37:16Z
VERCEL_TOKEN	2026-02-02T16:37:56Z
```

**Supabase-related secrets found:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` — **NOT FOUND**

### 2.2 Required Secret

| Secret Name | Purpose | Status |
|-------------|---------|--------|
| **SUPABASE_SERVICE_ROLE_KEY** | Server-side RLS bypass for ingestion and admin operations | ❌ **MISSING** |

---

## 3. Purpose

**SUPABASE_SERVICE_ROLE_KEY** is used by:
- GitHub Actions workflows that need server-side database access
- Ingestion jobs (e.g., Gmail connector sync via `connectors/gmail/run-sync.mjs`)
- Admin operations requiring RLS bypass
- Vercel Production environment (set via workflow)

---

## 4. How to Set the Secret

### 4.1 Obtain Service Role Key

**Source:** Supabase Dashboard

**Steps:**
1. Navigate to: https://supabase.com/dashboard/project/umzuncubiizoomoxlgts/settings/api
2. Find the "service_role" key section
3. Click "Reveal" to show the key value
4. Copy the key value

**Alternative:** Use helper script (requires `SUPABASE_ACCESS_TOKEN`):
```bash
node scripts/supabase-get-service-role-key.mjs
```

### 4.2 Set as GitHub Secret

**Command:**
```bash
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value-from-dashboard>"
```

**Verification:**
```bash
gh secret list | grep SUPABASE_SERVICE_ROLE_KEY
```

**Expected Output:**
```
SUPABASE_SERVICE_ROLE_KEY	2026-02-09T...
```

---

## 5. Workflow Integration

**Workflow:** `.github/workflows/qreil-supabase-env-upsert.yml`

**Usage:**
- Workflow reads `SUPABASE_SERVICE_ROLE_KEY` from GitHub secrets
- Uses it to set Vercel Production environment variable
- Verifies secret exists before proceeding

**Current Status:**
- ⏳ Workflow created and ready
- ❌ Workflow cannot execute until secret is set
- ✅ Workflow provides clear error message if secret is missing

---

## 6. QAG Acceptance Checks

- [ ] **SUPABASE_SERVICE_ROLE_KEY exists in GitHub Actions:**
  - ❌ Secret missing
  - Action required: Set via `gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value>"`
  - Evidence: `gh secret list` output

- [x] **No secret values exposed:**
  - ✅ Receipt shows key name only
  - ✅ No key values in receipt
  - Evidence: This receipt

- [ ] **Verdict:** ⏳ **PENDING** — Awaiting secret to be set

---

## 7. Receipt Status

| Criterion | Status |
|-----------|--------|
| Secret check performed | ✅ Completed |
| SUPABASE_SERVICE_ROLE_KEY verified | ❌ Missing |
| QAG acceptance | ⏳ Pending |

**Status:** ⏳ **PENDING** — Secret must be set before workflow can succeed.

**Next Steps:**
1. Obtain `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard
2. Set as GitHub secret: `gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value>"`
3. Re-run workflow: `gh workflow run "Q REIL Supabase Env Upsert" --ref main`
4. Update this receipt with verification proof

---

## 8. References

- [SUPABASE_DISCOVERY_RECEIPT.md](./SUPABASE_DISCOVERY_RECEIPT.md) — Supabase discovery receipt
- [VERCEL_SUPABASE_ENV_RECEIPT.md](./VERCEL_SUPABASE_ENV_RECEIPT.md) — Vercel environment variables receipt
- [docs/00_PROJECT/handoffs/Q_REIL_SUPABASE_PROJECT_REF.md](../../docs/00_PROJECT/handoffs/Q_REIL_SUPABASE_PROJECT_REF.md) — Supabase project reference
