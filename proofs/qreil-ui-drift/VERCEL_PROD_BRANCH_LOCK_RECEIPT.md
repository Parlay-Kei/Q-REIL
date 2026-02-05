# Vercel Production Branch Lock Receipt — QREIL-PROD-BRANCH-LOCK-0015

**Mission:** PLATOPS-MISSION: QREIL-PROD-BRANCH-LOCK-0015  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Project:** q-reil (q-reil.vercel.app)  
**Objective:** Confirm the Vercel project is locked to deploy production from **main** in GitHub repo **Parlay-Kei/Q-REIL** only.

---

## 1. Repo and production branch (confirmed)

| Field | Value | Source |
|-------|--------|--------|
| **Repo** | **Parlay-Kei/Q-REIL** | https://github.com/Parlay-Kei/Q-REIL |
| **Production branch** | **main** | [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json) `production_branch`; Vercel project deploys |
| **Project** | q-reil (prj_VAiSllyEk27tnHDXagBt88h0h64j) | Vercel API |
| **Team** | team_DLPOODpWbIp8OubK6ngvbM1v (Strata Noble's projects) | Vercel API |

Deployment metadata (githubOrg, githubRepo, githubCommitRef) on all production deployments confirms: repo **Parlay-Kei/Q-REIL**, branch **main** only for production.

---

## 2. Current production deployment (SHA)

Production is served from the **latest production deployment** below.

| Field | Value |
|-------|--------|
| **Deployment ID** | dpl_6NQuBC9onxapoyNQ9p9JAofCYbmu |
| **URL** | q-reil-iolfp42qu-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app, q-reil-strata-nobles-projects.vercel.app, q-reil-stratanoble-strata-nobles-projects.vercel.app |
| **Source branch** | **main** |
| **Git SHA** | **2c0ebdedbc7faf6ffb4ddfda9823850cf9d9c9a6** |
| **Commit message** | docs(proofs): add PR #3 and merge SHA to CANONICAL_MAIN_MERGE_RECEIPT |
| **Target** | production |
| **State** | READY |

**Inspector:** https://vercel.com/strata-nobles-projects/q-reil/6NQuBC9onxapoyNQ9p9JAofCYbmu

---

## 3. Deliverable summary

| # | Item | Value |
|---|------|--------|
| 1 | **Repo** | Parlay-Kei/Q-REIL |
| 2 | **Production branch** | main |
| 3 | **Current production deployment SHA** | 2c0ebdedbc7faf6ffb4ddfda9823850cf9d9c9a6 |

**Conclusion:** The Vercel project **q-reil** is locked to deploy production from **main** in GitHub repo **Parlay-Kei/Q-REIL** only. Current production is at SHA above.

---

**Canonical reference:** [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)  
**Related:** [VERCEL_PROJECT_CONFIG_RECEIPT.md](./VERCEL_PROJECT_CONFIG_RECEIPT.md), [REDEPLOY_RECEIPT.md](./REDEPLOY_RECEIPT.md)
