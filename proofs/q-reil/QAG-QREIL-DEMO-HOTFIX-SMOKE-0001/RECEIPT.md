# QAG-QREIL-DEMO-HOTFIX-SMOKE-0001 — Receipt

**Mission:** QAG-QREIL-DEMO-HOTFIX-SMOKE-0001  
**Objective:** Smoke test the demo after deploy and stamp PASS only if the demo no longer fails in front of a client  
**Date:** 2026-02-09  
**Target:** q-reil.vercel.app

---

## Summary

Smoke testing checklist for Q REIL demo hotfix. Tests verify that the demo no longer shows hard errors, routes work correctly, and pages are visually distinct.

---

## Test Cases

### Test Case 1: /q-reil Redirects to /reil

**Steps:**
1. Navigate to `https://q-reil.vercel.app/q-reil`
2. Verify redirect to `https://q-reil.vercel.app/reil`
3. Navigate to `https://q-reil.vercel.app/q-reil/inbox`
4. Verify redirect to `https://q-reil.vercel.app/reil/inbox`

**Expected Result:** All `/q-reil` paths redirect to `/reil` equivalents, preserving subpaths.

**Status:** ⏳ PENDING (awaiting deployment)

---

### Test Case 2: /reil/inbox Loads with Live Data or Seeded Demo Without Hard Error Panels

**Steps:**
1. Navigate to `https://q-reil.vercel.app/reil/inbox`
2. Check for hard error panels (red error states)
3. Verify either:
   - Live data loads from Supabase, OR
   - Seeded demo data loads with "Demo data" badge visible
4. Verify no console red errors

**Expected Result:** 
- No hard error panels visible
- Either live data or seeded demo data displays
- "Demo data" badge appears when using seeded data
- No console errors

**Status:** ⏳ PENDING (awaiting deployment)

---

### Test Case 3: /reil/records and /reil/deals Are Visually and Functionally Distinct

**Steps:**
1. Navigate to `https://q-reil.vercel.app/reil/records`
2. Note column headers and styling
3. Navigate to `https://q-reil.vercel.app/reil/deals`
4. Compare column headers and styling with Records page

**Expected Result:**
- **Records page** shows: Property Address, Status, Updated, Property Type columns
- **Deals page** shows: Deal Name, Stage, Last Activity, Deal Type, Value columns
- Different icons (HomeIcon vs BriefcaseIcon)
- Different badge colors (success vs cyan)
- Different navigation targets (`/reil/records/:id` vs `/reil/deals/:id`)

**Status:** ⏳ PENDING (awaiting deployment)

---

### Test Case 4: No Console Red Errors on Initial Load and Navigation

**Steps:**
1. Open browser DevTools Console
2. Navigate to `https://q-reil.vercel.app/`
3. Navigate through: Home → REIL → Inbox → Records → Deals
4. Check for red console errors

**Expected Result:** 
- No red console errors during initial load
- No red console errors during navigation
- Warnings are acceptable (not errors)

**Status:** ⏳ PENDING (awaiting deployment)

---

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: /q-reil redirects | ⏳ PENDING | Awaiting deployment |
| TC2: Inbox loads without errors | ⏳ PENDING | Awaiting deployment |
| TC3: Records vs Deals distinct | ⏳ PENDING | Awaiting deployment |
| TC4: No console errors | ⏳ PENDING | Awaiting deployment |

---

## Verdict

**⏳ PENDING** — Smoke tests cannot be executed until code changes are deployed to q-reil.vercel.app.

**Next Steps:**
1. Deploy code changes to Vercel
2. Execute smoke test cases
3. Update test results table
4. Stamp PASS if all tests pass, FAIL if any test fails

---

## Acceptance Criteria

**PASS Criteria:**
- ✅ `/q-reil` redirects to `/reil` (and preserves subpaths)
- ✅ `/reil/inbox` loads without hard error panels
- ✅ `/reil/records` and `/reil/deals` are visually distinct
- ✅ No console red errors on initial load and navigation

**FAIL Criteria:**
- ❌ Any hard error panel appears in inbox
- ❌ Records and Deals pages look identical
- ❌ `/q-reil` redirect fails
- ❌ Console shows red errors

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/QAG-QREIL-DEMO-HOTFIX-SMOKE-0001/RECEIPT.md` |

---

## Notes

- Smoke tests should be performed after deployment to production (q-reil.vercel.app)
- Screenshots should be captured for each test case
- Console logs should be saved if errors occur
- If all tests pass, update verdict to **PASS**
- If any test fails, update verdict to **FAIL** and document issues
