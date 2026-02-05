# Canonical Deploy Recovery Receipt — QREIL-CANONICAL-DEPLOY-RECOVERY-0007

**Mission:** OCS-MISSION: QREIL-CANONICAL-DEPLOY-RECOVERY-0007  
**Objective:** Move production from feature branch to canonical main without losing the working UI.  
**Date:** 2026-02-01  
**Project:** q-reil (q-reil.vercel.app)

---

## 1. Pull request (merge to main)

| Field | Value |
|-------|--------|
| **PR link** | https://github.com/Parlay-Kei/Q-REIL/pull/2 |
| **Base** | main |
| **Head** | engdel-qsuite-brand-scope-fix-0023 |
| **Title** | ENGDEL-QSUITE-BRAND-SCOPE-FIX-0023: Remove Command Center UI naming, route-aware tab titles |
| **State** | Merged |

---

## 2. Merge commit

| Field | Value |
|-------|--------|
| **Merge commit SHA** | adce227f1066bc02c9700010d530608a37ea33de |
| **Merge commit message** | Merge pull request #2 from Parlay-Kei/engdel-qsuite-brand-scope-fix-0023 |
| **Merged at** | 2026-02-01T15:10:06Z |

---

## 3. Minimal gates (CI)

PR and merge were gated by:

- **Build:** q-suite-ui typecheck, lint, build (`.github/workflows/q-suite-ui-ci.yml`)
- **Lint:** ESLint on q-suite-ui
- **Basic UI smoke in preview:** Vite preview + curl root (in CI)

---

## 4. Production deployment

The first production deploy triggered by the merge (Git push to main) failed because the Vercel project was still building from repo root as Next.js (Root Directory not set to `q-suite-ui`). A production redeploy was triggered from main via **Vercel CLI** from local `q-suite-ui` (main checked out).

| Field | Value |
|-------|--------|
| **Production deployment ID** | dpl_7GSqPbYL1G8AvJRwTUufJnNQfLx9 |
| **State** | READY |
| **URL** | q-reil-g42mmavfm-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app (production) |
| **Git SHA** | adce227f1066bc02c9700010d530608a37ea33de |
| **Branch** | main |
| **Source** | cli (redeploy from main) |

**Inspector:** https://vercel.com/strata-nobles-projects/q-reil/7GSqPbYL1G8AvJRwTUufJnNQfLx9

Production **q-reil.vercel.app** now serves the Q-REIL q-suite-ui (Vite) app from **main**.

---

## 5. Git-triggered deploy (reference)

The deploy triggered automatically by the merge had ID **dpl_HaxW6zLPGaUSxfYio4DPnxKAKEVR** and **state: ERROR**. Build failed with: *Couldn't find any `pages` or `app` directory* — Vercel built from repo root as Next.js. To make future Git pushes to main deploy successfully, set **Root Directory** to **q-suite-ui** and **Framework** to **Vite** in the Vercel Dashboard per [VERCEL_PROJECT_CONFIG_RECEIPT.md](./VERCEL_PROJECT_CONFIG_RECEIPT.md).

---

## Deliverables

| Deliverable | Location |
|-------------|----------|
| **Receipt** | `proofs/qreil-ui-drift/CANONICAL_DEPLOY_RECOVERY_RECEIPT.md` (this file) |
| **PR link** | https://github.com/Parlay-Kei/Q-REIL/pull/2 |
| **Merge commit** | adce227f1066bc02c9700010d530608a37ea33de |
| **Production deployment ID** | dpl_7GSqPbYL1G8AvJRwTUufJnNQfLx9 |
