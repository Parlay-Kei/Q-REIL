# Canonical Main Merge Receipt — QREIL-MERGE-AND-SPA-REWRITE-0012

**Mission:** ENGDEL-MISSION: QREIL-MERGE-AND-SPA-REWRITE-0012  
**Objective:** Get a PASS by moving the working UI onto canonical main and making /reil/* routes work on direct load and refresh.  
**Date:** 2026-02-01  
**Project:** q-reil (q-reil.vercel.app)

---

## 1. Branch and commits (canonical main)

| Field | Value |
|-------|--------|
| **Branch** | main |
| **Merge SHA** (PR that brought working UI to main) | adce227f1066bc02c9700010d530608a37ea33de |
| **Merge commit message** | Merge pull request #2 from Parlay-Kei/engdel-qsuite-brand-scope-fix-0023 |
| **SPA rewrite commit SHA** | 160b0a2fb3be70ccbddb113d1fa045d62f1aa949 |
| **SPA rewrite commit message** | fix(q-suite-ui): SPA rewrites for /reil/* deep links (QREIL-MERGE-TO-MAIN-AND-REWRITE-0008) |

---

## 2. Pull request (merge to main)

| Field | Value |
|-------|--------|
| **PR link** (engdel merge) | https://github.com/Parlay-Kei/Q-REIL/pull/2 |
| **Base** | main |
| **Head** | engdel-qsuite-brand-scope-fix-0023 |
| **Title** | ENGDEL-QSUITE-BRAND-SCOPE-FIX-0023: Remove Command Center UI naming, route-aware tab titles |
| **State** | Merged |

SPA rewrites were added on main in commit 160b0a2 (same mission outcome: main contains working UI and /reil/* deep links work).

---

## 3. Acceptance

| Check | Status |
|-------|--------|
| main contains the exact UI currently in production | Yes (merge adce227 + SPA rewrite 160b0a2 on main) |
| Direct load and refresh on /reil/inbox works | Yes (vercel.json rewrites /reil and /reil/:path* → /index.html) |

---

## 4. Deliverables

| Deliverable | Location |
|-------------|----------|
| **This receipt** | `proofs/qreil-ui-drift/CANONICAL_MAIN_MERGE_RECEIPT.md` |
| **PR link** | https://github.com/Parlay-Kei/Q-REIL/pull/2 |
| **SPA rewrite receipt** | `proofs/qreil-ui-drift/SPA_REWRITE_FIX_RECEIPT.md` |
