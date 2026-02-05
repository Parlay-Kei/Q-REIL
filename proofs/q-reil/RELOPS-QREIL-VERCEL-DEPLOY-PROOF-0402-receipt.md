# RELOPS-QREIL-VERCEL-DEPLOY-PROOF-0402 Receipt

**Spawn:** RELOPS-QREIL-VERCEL-DEPLOY-PROOF-0402  
**Date:** 2026-02-02  

## Vercel project confirmation

| Field | Value |
|-------|--------|
| **Project** | q-reil (prj_VAiSllyEk27tnHDXagBt88h0h64j) |
| **Team** | team_DLPOODpWbIp8OubK6ngvbM1v (Strata Noble's projects) |
| **Production URL** | q-reil.vercel.app (via aliases) |

**Git link:** Confirmed. Vercel project **q-reil** is linked to:
- **Repository:** Parlay-Kei/Q-REIL  
- **Branch:** main  
- **Latest deployment source:** githubCommitSha `898770d809cd509070dafe56d6929339a54fbafa` (Phase 1 commit)

## Deployment triggered (Phase 1 commit)

| Field | Value |
|-------|--------|
| **Deployment ID** | dpl_GMdEsDCsa8qzFAAK7RhntRTCJ2Rt |
| **Deployed commit SHA** | 898770d809cd509070dafe56d6929339a54fbafa |
| **Target** | production |
| **State** | **ERROR** (build failed) |
| **Inspector** | https://vercel.com/strata-nobles-projects/q-reil/GMdEsDCsa8qzFAAK7RhntRTCJ2Rt |

## Build failure reason

Vercel ran the build from the **repository root** (entrypoint `.`) and used **Next.js** (project framework: nextjs). The repo root has no `pages` or `app` directory (the app lives in `q-suite-ui/` and is Vite, not Next.js).

- Log: `Couldn't find any \`pages\` or \`app\` directory. Please create one under the project root`
- **Required fix:** In Vercel Dashboard → q-reil → Settings → General, set **Root Directory** to `q-suite-ui`, and ensure Framework Preset is **Vite** (or override Build Command `npm run build`, Output Directory `dist`). The repo contains `q-suite-ui/vercel.json` with `buildCommand`, `outputDirectory`, and rewrites.

## Production currently serving

The **current production** alias (q-reil.vercel.app) is still serving a **READY** deployment from an earlier build, not commit 898770d. From list_deployments, the latest READY production deployment is:

- **Deployment:** dpl_46437w3wsp3hfPjAuPZSbk1KBrcr  
- **Commit:** 2c0ebdedbc7faf6ffb4ddfda9823850cf9d9c9a6 (CLI deploy, git commit)  
- **State:** READY  

So production has **not** been updated to the Phase 1 commit (898770d).

## Verdict

**NOT DEPLOYED.**  

- Vercel is connected to Parlay-Kei/Q-REIL and main; a production deployment was **triggered** for Phase 1 commit 898770d.  
- That deployment **failed** (state ERROR) because the project builds from repo root as Next.js.  
- Production is still serving an older successful deployment (commit 2c0ebde).  

**Recommendation:** Platform Ops / RelOps: Set Vercel project **q-reil** Root Directory to **q-suite-ui**, set framework to Vite (or equivalent build/output), then redeploy from main so that 898770d (or a later commit) builds and goes live.
