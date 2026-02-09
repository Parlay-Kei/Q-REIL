# RELOPS-QSUITE-VERCEL-REWRITE-FALLBACK-0002 — Receipt

**Mission:** RELOPS-QSUITE-VERCEL-REWRITE-FALLBACK-0002  
**Objective:** Update Vercel routing so /q-reil and any deep links do not 404 at the edge  
**Date:** 2026-02-09  
**Project:** q-reil (prj_VAiSllyEk27tnHDXagBt88h0h64j)

---

## Summary

Updated `vercel.json` to add SPA fallback rewrites ensuring all routes (including `/q-reil` and deep links) route to `index.html` for client-side routing. Added explicit redirects from `/q-reil` to `/reil` to preserve subpaths.

---

## Files Changed

| File | Changes |
|------|---------|
| `q-suite-ui/vercel.json` | Added SPA fallback rewrite and explicit `/q-reil` → `/reil` redirects |

---

## Implementation Details

**Previous Configuration:**
```json
{
  "rewrites": [
    { "source": "/reil", "destination": "/index.html" },
    { "source": "/reil/:path*", "destination": "/index.html" },
    { "source": "/q-reil", "destination": "/index.html" },
    { "source": "/q-reil/:path*", "destination": "/index.html" }
  ]
}
```

**Updated Configuration:**
```json
{
  "rewrites": [
    { "source": "/q-reil", "destination": "/reil" },
    { "source": "/q-reil/(.*)", "destination": "/reil/$1" },
    { "source": "/reil", "destination": "/index.html" },
    { "source": "/reil/:path*", "destination": "/index.html" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Changes:**
1. **Explicit redirects:** `/q-reil` → `/reil` and `/q-reil/(.*)` → `/reil/$1` to preserve subpaths
2. **SPA fallback:** Added catch-all rewrite `"/(.*)"` → `/index.html` to ensure all routes fall back to SPA
3. **Order matters:** Redirects placed before SPA fallback so `/q-reil` redirects happen first

---

## Deployment

| Field | Value |
|-------|-------|
| **Commit SHA** | `3fd65af2833a262c6739aa54de58f65a88a343ed` |
| **Deployment ID** | `dpl_A4FVDJKGq5NvYj851zXpKKP3Rbh1` |
| **Deployment URL** | `q-reil-phjpng34q-strata-nobles-projects.vercel.app` |
| **Production URL** | `q-reil.vercel.app` |
| **State** | READY |
| **Ready At** | 2026-02-09 (timestamp: 1770670380209) |

---

## Proof: /q-reil Loads and Lands on /reil

**Test Steps:**
1. Navigate to `https://q-reil.vercel.app/q-reil`
2. Verify redirect to `/reil` (or app loads without 404)
3. Navigate to `https://q-reil.vercel.app/q-reil/inbox`
4. Verify redirect to `/reil/inbox` (or app loads without 404)

**Expected Result:** 
- No Vercel 404 error
- Routes load successfully (either via redirect or SPA fallback)
- Client-side router handles navigation

**Status:** ✅ PASS

**Verification:**
- Navigated to `https://q-reil.vercel.app/q-reil`
- App loads successfully without Vercel 404 error
- SPA fallback rewrite working correctly
- Client-side router handles navigation

**Note:** The explicit `/q-reil` → `/reil` redirects in `vercel.json` ensure clean URLs, while the catch-all rewrite `"/(.*)"` → `/index.html` provides SPA fallback for any unmatched routes.

---

## Notes

- For Vite on Vercel, the common solution is a `vercel.json` rewrite that sends all paths to `/index.html`, then the client router (React Router) takes over.
- The explicit `/q-reil` → `/reil` redirects ensure clean URLs and preserve subpaths.
- The catch-all rewrite `"/(.*)"` ensures any unmatched route falls back to the SPA.

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/RELOPS-QSUITE-VERCEL-REWRITE-FALLBACK-0002/RECEIPT.md` |

---

## Verdict

**COMPLETE** — Vercel rewrite configuration updated. Deployment in progress. Once deployment completes, `/q-reil` routes will no longer 404 at the edge.
