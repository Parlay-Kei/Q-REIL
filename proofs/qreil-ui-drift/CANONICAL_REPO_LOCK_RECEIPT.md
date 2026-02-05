# Canonical Repo Lock Receipt — QREIL-CANONICAL-REPO-LOCK-0001

**Mission:** OCS-MISSION: QREIL-CANONICAL-REPO-LOCK-0001  
**Objective:** Make Parlay-Kei/Q-REIL.git the single source of truth across ops, deploy, and proofs.  
**Date:** 2026-02-01  
**Status:** Done

---

## 1. Canonical repo record (machine readable)

| Location | Description |
|----------|-------------|
| **ops/canonical/QREIL_REPO.json** | Single source of truth for repo URL, production branch, app root, framework, build, and output. |

### Contents (ops/canonical/QREIL_REPO.json)

| Field | Value |
|-------|--------|
| **repo_url** | https://github.com/Parlay-Kei/Q-REIL.git |
| **production_branch** | main |
| **app_root** | q-suite-ui |
| **framework** | vite |
| **build** | npm run build |
| **output** | dist |

---

## 2. Internal references updated

Internal references that previously pointed at a different repo (e.g. AspireNexis/q-reil) or generic “Q-REIL” have been updated to the canonical repo and/or to reference **ops/canonical/QREIL_REPO.json**.

| File | Change |
|------|--------|
| **docs/00_PROJECT/handoffs/2026-01-30_MANUAL_OCS_to_github-admin.md** | Connect Git repository: **AspireNexis/q-reil** → **Parlay-Kei/Q-REIL** with link to ops/canonical/QREIL_REPO.json. |
| **docs/00_PROJECT/RECEIPT_Q_REIL_STANDUP.md** | GitHub repo URL and “Remaining” step: AspireNexis/q-reil → Parlay-Kei/Q-REIL; receipt link to ops/canonical. |
| **docs/q-suite/REPO_DECISION.md** | GitHub org AspireNexis → Parlay-Kei; Strata Noble convention bullet updated to canonical repo (ops/canonical/QREIL_REPO.json). |
| **proofs/qreil-ui-drift/VERCEL_PROJECT_CONFIG_RECEIPT.md** | Repo row and Action: required repo set to **Parlay-Kei/Q-REIL** with canonical URL; checklist row 1 references ops/canonical. |
| **proofs/qreil-ui-drift/REDEPLOY_RECEIPT.md** | Post-alignment step: “repo → Q-REIL” → “repo → **Parlay-Kei/Q-REIL** per ops/canonical/QREIL_REPO.json”. |
| **proofs/qreil-ui-drift/SHA_DIFF_SUMMARY.md** | “This Repository” section and deploy instruction: explicit **Parlay-Kei/Q-REIL** and link to ops/canonical/QREIL_REPO.json. |

---

## 3. Deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| Canonical repo record | **ops/canonical/QREIL_REPO.json** | ✅ Created |
| Lock receipt | **proofs/qreil-ui-drift/CANONICAL_REPO_LOCK_RECEIPT.md** | ✅ Created |

---

## 4. Vercel / runbook usage

- **Vercel project (q-reil):** Git should be connected to **https://github.com/Parlay-Kei/Q-REIL.git**, production branch **main**, root directory **q-suite-ui**, framework **Vite**, build **npm run build**, output **dist** — as specified in **ops/canonical/QREIL_REPO.json**.
- **Runbooks and receipts:** When a doc refers to “the Q-REIL repo” or “this repository” for deploy/ops, use **Parlay-Kei/Q-REIL** and/or **ops/canonical/QREIL_REPO.json** as the single source of truth.
