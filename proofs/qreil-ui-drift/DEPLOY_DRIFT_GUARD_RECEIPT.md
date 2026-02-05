# Deploy Drift Guard Receipt — QREIL-DRIFT-GUARD-0010

**Mission:** RELOPS-MISSION: QREIL-DRIFT-GUARD-0010  
**Owner:** Platform Ops / RelOps  
**Date:** 2026-02-01  
**Project:** q-reil (q-suite-ui → q-reil.vercel.app)  
**Objective:** Block any future production deployment where the deployed SHA is not reachable from `main`.

---

## 1. Summary

A lightweight CI check verifies that the commit being deployed (on push to `main`) is reachable from `origin/main`. If the SHA is not on `main`, the release job fails and a Platform Ops incident ticket is opened automatically.

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | CI check: commit on main | `.github/workflows/q-suite-ui-ci.yml` job `deploy-drift-guard` | ✅ Implemented |
| 2 | Fail release on mismatch | Same job fails workflow; `typecheck-lint-build` skipped when guard fails | ✅ Implemented |
| 3 | Open Platform Ops incident on drift | Same workflow: step "Open Platform Ops incident on drift" creates GitHub Issue | ✅ Implemented |
| 4 | Receipt | **proofs/qreil-ui-drift/DEPLOY_DRIFT_GUARD_RECEIPT.md** | ✅ This file |

---

## 2. CI Check Behavior

| Aspect | Detail |
|--------|--------|
| **Trigger** | Push to `main` that touches `q-suite-ui/**` or the workflow file (same as existing Q Suite UI CI). |
| **Job name** | `deploy-drift-guard` — "Deploy drift guard (prod SHA on main)". |
| **Condition** | Runs only when `github.event_name == 'push'` and `github.ref == 'refs/heads/main'`. On pull_request the job is skipped. |
| **Check** | After full-depth checkout, runs: `git branch -r --contains $GITHUB_SHA \| grep -q 'origin/main'`. Commit must be reachable from `origin/main`. |
| **On pass** | Job succeeds; `typecheck-lint-build` runs as usual. |
| **On fail** | Job fails → workflow fails (release job failed). Next step runs: create GitHub Issue (Platform Ops incident). |

---

## 3. Platform Ops Incident

When the drift check fails:

1. **Workflow** fails (red).
2. **Step "Open Platform Ops incident on drift"** runs (`if: failure() && github.event_name == 'push'`).
3. A **GitHub Issue** is created via REST API with:
   - **Title:** `[Platform Ops] Deploy drift: SHA <sha> not reachable from main`
   - **Body:** Markdown with mission ref (QREIL-DRIFT-GUARD-0010), commit SHA, ref, workflow run URL, canonical reference, and link to this receipt.
   - **Labels:** None required (optional: add `platform-ops-incident` or `relops` in repo and then include in workflow if desired).

If the API call fails (e.g. token or permissions), a warning is emitted and the job remains failed.

---

## 4. Canonical Reference

| Field | Value |
|-------|--------|
| **Production branch** | `main` |
| **Source of truth** | [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json) `production_branch` |
| **Workflow file** | [.github/workflows/q-suite-ui-ci.yml](../../.github/workflows/q-suite-ui-ci.yml) |

---

## 5. Integration with Vercel

- **Vercel** production deploys are triggered by pushes to `main` (per [VERCEL_PROD_BRANCH_LOCK_RECEIPT.md](./VERCEL_PROD_BRANCH_LOCK_RECEIPT.md)).
- This CI check runs on the same push. If the commit is not reachable from `main` (e.g. re-run of an old workflow, or a misconfigured deploy), the **GitHub workflow fails** and a **Platform Ops incident** is opened.
- Optionally, in Vercel project settings you can add a **Required status check** for the "Deploy drift guard (prod SHA on main)" job so that a failed guard blocks production from advancing; configure in **GitHub** → branch protection or **Vercel** → Git integration as needed.

---

## 6. Checklist

| # | Check | Status |
|---|--------|--------|
| 1 | Lightweight CI check verifies commit on main for production path | ✅ Job `deploy-drift-guard` in q-suite-ui-ci.yml |
| 2 | On mismatch, release job fails | ✅ Workflow fails; typecheck-lint-build skipped when guard fails |
| 3 | On mismatch, Platform Ops incident ticket opened | ✅ GitHub Issue created with title/body and link to this receipt |
| 4 | Receipt delivered | ✅ proofs/qreil-ui-drift/DEPLOY_DRIFT_GUARD_RECEIPT.md |

---

**Canonical reference:** [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)  
**Related:** [VERCEL_PROD_BRANCH_LOCK_RECEIPT.md](./VERCEL_PROD_BRANCH_LOCK_RECEIPT.md), [CANONICAL_REPO_LOCK_RECEIPT.md](./CANONICAL_REPO_LOCK_RECEIPT.md)
