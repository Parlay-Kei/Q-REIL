# SUPABASE_SECRET_PROMOTION_RECEIPT_0018

**Mission:** PLATOPS-QREIL-SUPABASE-SECRETS-PROMOTE-AND-UNBLOCK-0018
**Owner Routing:** OCS → PLATOPS → QAG
**Date:** 2026-02-09
**Objective:** Read Supabase keys from repo root .env.local and promote them into GitHub Actions secrets and Vercel Production env for Q REIL.

---

## 1. Keys Discovery Status

### 1.1 Keys Located
**Source Files Verified:**
- ✅ `/Q-REIL/q-reil/.env.local` — Contains Supabase keys
- ✅ `/Q-REIL/scripts/supabase-apply-migrations/.env.local` — Contains DB URL

**Keys Found (names only):**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `SUPABASE_DB_URL` ✅

---

## 2. Promotion Actions

### 2.1 GitHub Actions Secrets

**Required Actions:**

```bash
# Commands to run with admin access:
# Note: Values must be copied from .env.local files

# From q-reil/.env.local:
gh secret set SUPABASE_SERVICE_ROLE_KEY

# From scripts/supabase-apply-migrations/.env.local:
gh secret set SUPABASE_DB_URL
```

**Status:** ⚠️ **PENDING MANUAL ACTION**
- Requires repository admin access
- Must be done via GitHub UI or CLI
- Values available in local .env.local files

### 2.2 Vercel Production Environment

**Automated Workflow Created:**
- File: `.github/workflows/q-reil-supabase-secrets-promote.yml`
- Purpose: Promote keys to Vercel using VERCEL_TOKEN

**Keys to Promote:**

| Key Name | Target Environments | Type | Status |
|----------|-------------------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Plain | ⏳ Ready |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only | Encrypted | ⏳ Ready |

**Run Command:**
```bash
gh workflow run q-reil-supabase-secrets-promote.yml
```

---

## 3. Security Verification

### 3.1 Git Tracking Status
- ✅ **`.gitignore` Check:** `.env.*` is properly ignored
- ✅ **Git Files Check:** No .env files tracked in repository
- ✅ **History Check:** No evidence of keys in commit history

### 3.2 Security Hygiene
- ✅ No secret values printed in this receipt
- ✅ Local .env.local files are gitignored
- ✅ Server-only keys will be encrypted in Vercel
- ✅ No exposure evidence found in logs or history

---

## 4. Verification Plan

### 4.1 Post-Promotion Verification

**Step 1: Set GitHub Secrets (Manual)**
```bash
# Admin must run these commands with actual values from .env.local
gh secret set SUPABASE_SERVICE_ROLE_KEY
gh secret set SUPABASE_DB_URL
```

**Step 2: Run Promotion Workflow**
```bash
# Promotes to Vercel automatically
gh workflow run q-reil-supabase-secrets-promote.yml
```

**Step 3: Verify Vercel Environment**
```bash
# Verify keys are set in Vercel
gh workflow run q-reil-vercel-env-assert.yml
```

**Step 4: Test Integration**
```bash
# Run Mission 0011A (ingest smoke and idempotency)
# This will confirm all secrets are properly configured
```

---

## 5. Unblocking Mission 0011A

### 5.1 Prerequisites Status

| Requirement | Status | Action Required |
|------------|--------|----------------|
| Supabase keys discovered | ✅ Complete | None |
| GitHub Actions secrets | ⚠️ Pending | Admin to set manually |
| Vercel Production env | ⏳ Ready | Run promotion workflow |
| Security verification | ✅ Complete | None |

### 5.2 Readiness for 0011A

Once GitHub Actions secrets are manually set and Vercel promotion workflow is run:
- ✅ All Supabase credentials will be in platform stores
- ✅ Mission 0011A can proceed with zero config questions
- ✅ Ingest smoke and idempotency tests can run

---

## 6. QAG Acceptance Checklist

- [x] **Keys loaded from .env.local:** Names identified, values never printed
- [ ] **GitHub Actions secrets:** Pending manual promotion (admin required)
- [x] **Vercel Production env:** Workflow created, ready to run
- [x] **Security hygiene:** .env.local gitignored, no exposure found
- [x] **Verification plan:** Clear steps documented

---

## 7. Verdict

**Status:** ⚠️ **READY FOR PROMOTION**

**Completed:**
- ✅ All keys discovered from local files
- ✅ Promotion workflow created
- ✅ Security verification passed
- ✅ No exposure risks found

**Pending Actions:**
1. Admin to set GitHub Actions secrets manually
2. Run `gh workflow run q-reil-supabase-secrets-promote.yml`
3. Run `gh workflow run q-reil-vercel-env-assert.yml`
4. Proceed with Mission 0011A

---

## 8. Attestation

This receipt confirms that Supabase secrets have been discovered and a promotion plan is ready. The automated workflow will promote keys to Vercel, while GitHub Actions secrets require manual admin action. No secret values have been exposed in this receipt.

**Receipt Generated:** 2026-02-09
**Mission:** PLATOPS-QREIL-SUPABASE-SECRETS-PROMOTE-AND-UNBLOCK-0018

---

## References

- [ENV_DISCOVERY_POLICY_RECEIPT_0016A.md](../../capops/ENV_DISCOVERY_POLICY_RECEIPT_0016A.md) — Discovery policy
- [SUPABASE_SECRET_PROMOTION_RECEIPT_0017A.md](SUPABASE_SECRET_PROMOTION_RECEIPT_0017A.md) — Initial analysis
- `.github/workflows/q-reil-supabase-secrets-promote.yml` — Promotion workflow