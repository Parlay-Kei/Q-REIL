# RELOPS-QREIL-VERCEL-CONFIG-FIX-0501 — Receipt

**Mission:** OCS Phase 1 — Q REIL Vercel Build Config Fix (Vite subdir)  
**Spawn:** RELOPS-QREIL-VERCEL-CONFIG-FIX-0501  
**Date:** 2026-02-02  
**Project:** q-reil (q-reil.vercel.app)  
**Project ID:** prj_VAiSllyEk27tnHDXagBt88h0h64j  
**Team:** team_DLPOODpWbIp8OubK6ngvbM1v (Strata Noble's projects)

---

## 1. Objective

Make Vercel deploy commit 898770d (or latest main) successfully by configuring the project to build from **q-suite-ui** with **Vite**. No env var changes in this phase.

---

## 2. Root cause of current failure

Latest production deployment **dpl_GMdEsDCsa8qzFAAK7RhntRTCJ2Rt** (commit 898770d) is **ERROR**.

- **Vercel project** is still set to **Framework: Next.js** and **Root Directory: (none)**.
- Build runs at **repo root** and runs `next build` → fails with: *"Couldn't find any `pages` or `app` directory. Please create one under the project root"*.
- Source of truth for the app is **q-suite-ui** (Vite + React), not Next.js at repo root.

---

## 3. Target configuration (screenshot-free text record)

Apply in **Vercel Dashboard** → **Strata Noble's projects** → **q-reil** → **Settings**.

| Setting | Value | Source |
|--------|--------|--------|
| **Root Directory** | `q-suite-ui` | [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json) `app_root` |
| **Framework Preset** | **Vite** | QREIL_REPO.json `framework`; [q-suite-ui/vercel.json](../../q-suite-ui/vercel.json) |
| **Build Command** | `npm run build` | q-suite-ui/package.json `scripts.build` = `npx vite build`; vercel.json `buildCommand` |
| **Output Directory** | `dist` | Vite default; vercel.json `outputDirectory`; QREIL_REPO.json `output` |
| **Install Command** | `npm install` | vercel.json `installCommand`; repo has package-lock.json (npm); `npm ci` also valid |

### 3.1 Confirmation vs q-suite-ui/package.json

| Script / output | package.json | Use in Vercel |
|-----------------|--------------|----------------|
| build | `"build": "npx vite build"` | Build Command: **npm run build** ✓ |
| (output) | (Vite default) | Output Directory: **dist** ✓ |
| (install) | (lockfile: package-lock.json) | Install Command: **npm install** or **npm ci** ✓ |

No other script or directory changes in this phase. Do not change env vars here.

---

## 4. Linkable deployment config summary (no secrets)

- **Canonical repo:** [Parlay-Kei/Q-REIL](https://github.com/Parlay-Kei/Q-REIL)  
- **Production branch:** main  
- **App root (monorepo subdir):** q-suite-ui  
- **Framework:** Vite  
- **Build:** npm run build → `npx vite build`  
- **Output:** dist  
- **Install:** npm install (or npm ci)  
- **Config file (under root dir):** [q-suite-ui/vercel.json](../../q-suite-ui/vercel.json) (rewrites for /reil, /reil/:path* → index.html)

---

## 5. How to apply (Dashboard)

Settings cannot be changed via the current Vercel MCP; apply in the **Vercel Dashboard** (or script via [Vercel REST API: PATCH Update an existing project](https://vercel.com/docs/rest-api/reference/endpoints/projects/update-an-existing-project) with `rootDirectory`, `framework`, `buildCommand`, `outputDirectory`, `installCommand`).

1. **Settings** → **General**  
   - **Root Directory:** set to **q-suite-ui** (leave "Include source files outside of the Root Directory" unchecked unless needed).  
2. **Framework Preset:** select **Vite**.  
3. **Build Command:** `npm run build`.  
4. **Output Directory:** `dist`.  
5. **Install Command:** `npm install` (or `npm ci`).  
6. Save. Do not change **Environment Variables** in this phase.

After saving, proceed to **Phase 2: RELOPS-QREIL-VERCEL-REDEPLOY-0502** to trigger a production deployment from main and verify READY.

---

## 6. Status

- [ ] Settings applied in Vercel Dashboard (manual step).  
- [ ] Phase 2 redeploy triggered and READY (see RELOPS-QREIL-VERCEL-REDEPLOY-0502-receipt.md).
