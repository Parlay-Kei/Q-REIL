# RELOPS-REIL-CORE-PROD-DEPLOY-0017 — Receipt

**Mission:** Phase 7 Production release — Deploy the REIL Core build and capture deployment id, commit sha, READY status.  
**Spawn:** RELOPS-REIL-CORE-PROD-DEPLOY-0017  
**Owner:** Release Ops  
**Date:** 2026-02-02  
**Source:** Vercel API (list_deployments) via MCP user-vercel  
**Project:** q-reil (REIL Core UI — q-suite-ui)  
**Project ID:** prj_VAiSllyEk27tnHDXagBt88h0h64j  
**Prod domain:** q-reil.vercel.app

---

## Acceptance

- Deploy the REIL Core build (q-reil / q-suite-ui) to production.
- Capture: **deployment id**, **commit sha**, **READY** status.

---

## Production deployment (REIL Core)

The most recent deployment with **target: production** and **state: READY** is the one currently serving the production domain.

| Field | Value |
|-------|--------|
| **Deployment ID** | `dpl_91VQkV7DR9M4koeth8a7BejByiki` |
| **Commit SHA** | `ba9a4ceae960b4cbae4b64a711cc4e3b4ed58086` |
| **Ready state** | READY |
| **Target** | production |
| **URL** | q-reil-g6atubmx6-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app (production) |
| **Inspector** | https://vercel.com/strata-nobles-projects/q-reil/91VQkV7DR9M4koeth8a7BejByiki |

---

## Git source (deployed commit)

| Field | Value |
|-------|--------|
| **Git SHA** | `ba9a4ceae960b4cbae4b64a711cc4e3b4ed58086` |
| **Branch** | main |
| **Commit message** | chore(proofs): add ENGDEL-QREIL-PROOFS-GITIGNORE-FIX-1002 receipt |
| **Author** | Steve Hubbard \<Steve.Hubbard@stratanoble.com\> |
| **Repo** | Q-REIL (git) |

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/reil-core/RELOPS-REIL-CORE-PROD-DEPLOY-0017.md` |

---

## Verdict: **PASS**

REIL Core production deployment confirmed. Deployment id, commit sha, and READY status captured.
