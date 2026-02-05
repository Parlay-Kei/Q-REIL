# RELOPS-QREIL-VERCEL-REDEPLOY-0502 — Receipt

**Mission:** OCS Phase 2 — Release Ops redeploy from main and verify READY  
**Spawn:** RELOPS-QREIL-VERCEL-REDEPLOY-0502  
**Date:** 2026-02-02  
**Project:** q-reil (q-reil.vercel.app)  
**Project ID:** prj_VAiSllyEk27tnHDXagBt88h0h64j  
**Team:** team_DLPOODpWbIp8OubK6ngvbM1v

---

## 1. Prerequisite

Phase 1 (**RELOPS-QREIL-VERCEL-CONFIG-FIX-0501**) must be complete: Vercel project **q-reil** must have Root Directory = **q-suite-ui**, Framework = **Vite**, Build = **npm run build**, Output = **dist**, Install = **npm install** (or npm ci).

---

## 2. Objective

Trigger a **production** deployment from **Parlay-Kei/Q-REIL** **main**.  
Target commit: latest on main (must include **898770d** or later).

**Acceptance:**

- Deployment state **READY**.
- Deployed commit SHA recorded.

---

## 3. How to trigger redeploy

- **Option A (recommended):** In Vercel Dashboard → **q-reil** → **Deployments**, open the latest production deployment (e.g. dpl_GMdEsDCsa8qzFAAK7RhntRTCJ2Rt), click **Redeploy** (same commit 898770d will be built with the new Vite/root settings).
- **Option B:** Push a new commit to **main**; Vercel will auto-deploy from main.

After Phase 1 config is applied, the next build will use **q-suite-ui** as root and **Vite**, so the build should succeed.

---

## 4. Recorded deployment (fill after READY deploy)

| Field | Value |
|-------|--------|
| **Deployment ID** | *(e.g. dpl_xxxxxxxxxxxxxxxxxxxxxxxx)* |
| **Commit SHA** | *(must be 898770d or later; e.g. 898770d809cd509070dafe56d6929339a54fbafa)* |
| **State** | READY |
| **Target** | production |
| **Inspector URL** | https://vercel.com/strata-nobles-projects/q-reil/[DEPLOYMENT_ID] |

### Build logs summary (no secrets)

- Build runs from **Root Directory:** q-suite-ui.  
- **Framework:** Vite; **Build command:** npm run build; **Output:** dist.  
- No Next.js `pages`/`app` error.  
- Build completes successfully; deployment READY.

*(Replace with 1–2 sentence summary of actual build output once READY deployment exists.)*

---

## 5. Pre–Phase 1 state (reference)

Latest production deployment before config fix:

- **Deployment ID:** dpl_GMdEsDCsa8qzFAAK7RhntRTCJ2Rt  
- **Commit SHA:** 898770d809cd509070dafe56d6929339a54fbafa  
- **State:** ERROR  
- **Cause:** Project built at repo root with Next.js; no `pages` or `app` directory.

---

## 6. Status

- [ ] Phase 1 config applied.  
- [ ] Production redeploy triggered.  
- [ ] New deployment READY; deployment id and commit sha recorded above.  
- [ ] Phase 3 smoke (QAG-QREIL-PROD-SMOKE-0503) can run against this deployment.
