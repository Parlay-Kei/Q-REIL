# Redeploy receipt — Q REIL (post-alignment)

**Mission:** PLATOPS-MISSION: QREIL-PROD-REDEPLOY-FROM-MAIN-0013  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Project:** q-reil (q-reil.vercel.app)

---

## Pre-alignment (previous production)

| Field | Value |
|-------|--------|
| **Deployment ID** | dpl_4QYuindMVA86X8eZkawJ5cyPCx1w |
| **URL** | q-reil-7uj6v1s6s-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app |
| **Git SHA** | 21954142c54324c409482969222daaa9cc9ef46a |
| **Branch** | main |
| **Framework** | nextjs |
| **State** | READY |

This deployment was **not** the Q-REIL q-suite-ui app (different repo / Next.js).

---

## Post-alignment redeploy (2026-02-01)

Redeploy was performed via **Vercel CLI** from the canonical repo **Q-REIL** (local `q-suite-ui` linked to project **q-reil**). Build used **Vite** (`npm run build`, output `dist` per q-suite-ui/vercel.json).

### New production deployment (QREIL-PROD-REDEPLOY-FROM-MAIN-0013 — main)

| Field | Value |
|-------|--------|
| **Deployment ID** | dpl_6NQuBC9onxapoyNQ9p9JAofCYbmu |
| **URL** | q-reil-iolfp42qu-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app, q-reil-strata-nobles-projects.vercel.app, q-reil-stratanoble-strata-nobles-projects.vercel.app |
| **Git SHA** | 2c0ebdedbc7faf6ffb4ddfda9823850cf9d9c9a6 |
| **Branch (deployed)** | **main** |
| **Commit message** | docs(proofs): add PR #3 and merge SHA to CANONICAL_MAIN_MERGE_RECEIPT |
| **Source** | cli |
| **State** | READY |

**Inspector:** https://vercel.com/strata-nobles-projects/q-reil/6NQuBC9onxapoyNQ9p9JAofCYbmu

Production **q-reil.vercel.app** now serves the **Q-REIL q-suite-ui** app from this deployment (source branch **main**). Branch lock: [VERCEL_PROD_BRANCH_LOCK_RECEIPT.md](./VERCEL_PROD_BRANCH_LOCK_RECEIPT.md).

### Previous production deployment (superseded by QREIL-PROD-REDEPLOY-FROM-MAIN-0013)

| Field | Value |
|-------|--------|
| **Deployment ID** | dpl_7GSqPbYL1G8AvJRwTUufJnNQfLx9 |
| **URL** | q-reil-g42mmavfm-strata-nobles-projects.vercel.app |
| **Aliases** | (was q-reil.vercel.app) |
| **Git SHA** | adce227f1066bc02c9700010d530608a37ea33de |
| **Branch (deployed)** | main |
| **Commit message** | Merge pull request #2 from Parlay-Kei/engdel-qsuite-brand-scope-fix-0023 |
| **Source** | cli |
| **State** | READY |

Superseded by deployment **dpl_6NQuBC9onxapoyNQ9p9JAofCYbmu** (main SHA `2c0ebded...`) per QREIL-PROD-REDEPLOY-FROM-MAIN-0013.

---

## Next steps (Dashboard alignment)

Project **q-reil** in Vercel may still show **Framework: nextjs** in the API; production is served from the deployment above (main, SHA `2c0ebded...`). For **Git-based** deploys from **Parlay-Kei/Q-REIL** (branch **main**) to build correctly:

1. Ensure **Production Branch** is **main** per [VERCEL_PROD_BRANCH_LOCK_RECEIPT.md](./VERCEL_PROD_BRANCH_LOCK_RECEIPT.md).
2. Apply the target configuration in the Vercel Dashboard per [VERCEL_PROJECT_CONFIG_RECEIPT.md](./VERCEL_PROJECT_CONFIG_RECEIPT.md): connect Git to **Parlay-Kei/Q-REIL**, set **Root Directory** to **q-suite-ui**, set **Framework** to **Vite**, add **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY**.
3. Pushes to **main** will then build from **q-suite-ui** (Vite) and future production deployment SHAs will be from **main**.
