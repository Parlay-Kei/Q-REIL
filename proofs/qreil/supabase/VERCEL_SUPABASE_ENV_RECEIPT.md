# Vercel Supabase Env Receipt — PLATOPS-QREIL-SUPABASE-ENV-SET-0017

**Mission:** PLATOPS-QREIL-SUPABASE-ENV-SET-0017  
**Owner:** OCS → PLATOPS → QAG  
**Date:** 2026-02-09  
**Scope:** Set Supabase environment variables in Vercel Production for Q REIL.

---

## 1. Execution Summary

| Item | Value |
|------|-------|
| **Workflow** | Q REIL Supabase Env Upsert |
| **Workflow File** | `.github/workflows/qreil-supabase-env-upsert.yml` |
| **Status** | ⏳ **PENDING** — Requires `SUPABASE_SERVICE_ROLE_KEY` GitHub secret |

---

## 2. Required Environment Variables

| Key Name | Value | Type | Scope |
|----------|-------|------|-------|
| **NEXT_PUBLIC_SUPABASE_URL** | `https://umzuncubiizoomoxlgts.supabase.co` | plain | Production (public) |
| **SUPABASE_SERVICE_ROLE_KEY** | `<from Supabase Dashboard>` | encrypted | Production (server-only) |

---

## 3. Workflow Execution Status

### 3.1 First Run Attempt

**Run ID:** 21834925625  
**Run URL:** https://github.com/Parlay-Kei/Q-REIL/actions/runs/21834925625  
**Status:** ❌ Failed  
**Reason:** `SUPABASE_SERVICE_ROLE_KEY` GitHub secret not found

**Workflow Behavior:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` step attempted (would succeed if secret was available)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` step failed early with clear error message
- ⏳ Verification step not reached

**Error Message:**
```
ERROR: SUPABASE_SERVICE_ROLE_KEY secret not found in GitHub Actions
Set it via: gh secret set SUPABASE_SERVICE_ROLE_KEY --body '<key-value>'
```

### 3.2 Prerequisites for Success

**Required before workflow can succeed:**
1. ✅ `VERCEL_TOKEN` GitHub secret — **Present**
2. ❌ `SUPABASE_SERVICE_ROLE_KEY` GitHub secret — **MISSING** (must be set)

**To obtain `SUPABASE_SERVICE_ROLE_KEY`:**
1. Go to: https://supabase.com/dashboard/project/umzuncubiizoomoxlgts/settings/api
2. Copy the "service_role" key
3. Set as GitHub secret: `gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value>"`

---

## 4. Expected Workflow Behavior (Once Secret is Set)

### 4.1 NEXT_PUBLIC_SUPABASE_URL

**Action:** Upsert to Vercel Production  
**Type:** `plain` (public, client-side accessible)  
**Value:** `https://umzuncubiizoomoxlgts.supabase.co`

**Expected Result:**
- ✅ Created or updated in Vercel Production
- ✅ Available to client-side code

### 4.2 SUPABASE_SERVICE_ROLE_KEY

**Action:** Upsert to Vercel Production  
**Type:** `encrypted` (server-only, not exposed to client)  
**Value:** From GitHub secret `SUPABASE_SERVICE_ROLE_KEY`

**Expected Result:**
- ✅ Created or updated in Vercel Production
- ✅ Encrypted storage
- ✅ Server-side only (not exposed to client)

---

## 5. Storage Rules Verification

| Key Name | Type | Client Exposure | Status |
|----------|------|-----------------|--------|
| **NEXT_PUBLIC_SUPABASE_URL** | plain | ✅ Public | ⏳ Pending workflow execution |
| **SUPABASE_SERVICE_ROLE_KEY** | encrypted | ❌ Server-only | ⏳ Pending workflow execution |

**Workflow Implementation:**
- `NEXT_PUBLIC_SUPABASE_URL` uses `type: "plain"` ✅
- `SUPABASE_SERVICE_ROLE_KEY` uses `type: "encrypted"` ✅
- Both target `["production"]` ✅

---

## 6. QAG Acceptance Checks

- [ ] **Evidence shows keys exist in Vercel Production:**
  - ⏳ NEXT_PUBLIC_SUPABASE_URL — Pending workflow execution
  - ⏳ SUPABASE_SERVICE_ROLE_KEY — Pending workflow execution
  - Evidence: Will be provided after successful workflow run

- [x] **No secret values exposed:**
  - ✅ Values masked in workflow logs (`::add-mask::`)
  - ✅ Receipt shows key names only
  - ✅ Workflow uses encrypted type for service role key
  - Evidence: Workflow implementation

- [x] **Storage rules followed:**
  - ✅ NEXT_PUBLIC_SUPABASE_URL is plain type (public)
  - ✅ SUPABASE_SERVICE_ROLE_KEY is encrypted type (server-only)
  - Evidence: Workflow code

- [ ] **Verdict:** ⏳ **PENDING** — Awaiting `SUPABASE_SERVICE_ROLE_KEY` secret and workflow re-execution

---

## 7. Receipt Status

| Criterion | Status |
|-----------|--------|
| Workflow created | ✅ Completed |
| NEXT_PUBLIC_SUPABASE_URL set | ⏳ Pending (requires secret) |
| SUPABASE_SERVICE_ROLE_KEY set | ⏳ Pending (requires secret) |
| Keys verified | ⏳ Pending (requires secret) |
| QAG acceptance | ⏳ Pending |

**Status:** ⏳ **PENDING** — Workflow ready but requires `SUPABASE_SERVICE_ROLE_KEY` GitHub secret to be set.

**Next Steps:**
1. Obtain `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard
2. Set as GitHub secret: `gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value>"`
3. Re-run workflow: `gh workflow run "Q REIL Supabase Env Upsert" --ref main`
4. Update this receipt with execution proof

---

## 8. References

- [SUPABASE_DISCOVERY_RECEIPT.md](./SUPABASE_DISCOVERY_RECEIPT.md) — Supabase discovery receipt
- [GHA_SUPABASE_SECRET_RECEIPT.md](./GHA_SUPABASE_SECRET_RECEIPT.md) — GitHub Actions secret receipt
- [docs/00_PROJECT/handoffs/Q_REIL_SUPABASE_PROJECT_REF.md](../../docs/00_PROJECT/handoffs/Q_REIL_SUPABASE_PROJECT_REF.md) — Supabase project reference
