# SPA Rewrite Fix Receipt — QREIL-MERGE-TO-MAIN-AND-REWRITE-0008

**Mission:** ENG-MISSION: QREIL-MERGE-TO-MAIN-AND-REWRITE-0008  
**Objective:** Fix SPA deep link 404s under `/reil/*` so direct visit and refresh on `/reil/inbox` (and all `/reil/*`) load the app; assets load without 404s.  
**Date:** 2026-02-01

---

## 1. Chosen base path rules

- **App served at root.** The app is built and deployed with Vite default `base: '/'`. Assets live under `/` (e.g. `/assets/index-*.js`, `/assets/index-*.css`).
- **Router uses `/reil`.** React Router paths are `/reil`, `/reil/inbox`, `/reil/records`, etc. No Vite `base` change; only the client router uses `/reil` as a path prefix.
- **Rewrites:** All requests to `/reil` and `/reil/*` are rewritten to `/index.html` so the SPA loads and the client router can handle the path. Static files (e.g. `/assets/*`) are served from `dist` by Vercel before rewrites; they are not rewritten.

---

## 2. Exact vercel.json diff

```diff
--- a/q-suite-ui/vercel.json
+++ b/q-suite-ui/vercel.json
@@ -3,5 +3,9 @@
   "outputDirectory": "dist",
   "framework": null,
-  "installCommand": "npm install"
+  "installCommand": "npm install",
+  "rewrites": [
+    { "source": "/reil", "destination": "/index.html" },
+    { "source": "/reil/:path*", "destination": "/index.html" }
+  ]
 }
```

---

## 3. Vite base config (unchanged)

- **File:** `q-suite-ui/vite.config.ts`
- **Base:** Default `base: '/'` (no `base` key in config).
- **Match:** Rewrite destination is `/index.html` at root; Vite builds `index.html` at root and assets under `/assets/`. No change to Vite config was required.

---

## 4. Acceptance

| Check | Expected |
|-------|----------|
| Direct visit to `/reil/inbox` | SPA loads (no 404). |
| Refresh on `/reil/inbox` | SPA loads (no 404). |
| JS/CSS assets | Load without 404 (e.g. `/assets/index-*.js`, `/assets/index-*.css`). |

Vercel serves files from `outputDirectory` first; only non-matching requests hit rewrites, so `/reil` and `/reil/*` → `/index.html`, while `/`, `/assets/*`, etc. are served as static files.

---

## 5. Build verification

- **Command:** `npm run build` in `q-suite-ui`
- **Result:** Build passed (Vite production build; `dist/index.html`, `dist/assets/*`).

---

## 6. Commit / PR

- Rewrite fix and this receipt are committed on `main` (or included in the merge PR if merge is done in the same PR).
- **Files changed:** `q-suite-ui/vercel.json`, `proofs/qreil-ui-drift/SPA_REWRITE_FIX_RECEIPT.md`.
