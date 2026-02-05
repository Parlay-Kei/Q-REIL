# SHA Diff Summary — Deployed vs Repo

**Mission:** QREIL-UI-DRIFT-INTAKE-0001  
**Owner:** OCS  
**Date:** 2026-02-01

---

## Deployed (Vercel q-reil.vercel.app)

| Item | Value |
|------|--------|
| **Git SHA** | `21954142c54324c409482969222daaa9cc9ef46a` |
| **Branch** | main |
| **Commit message** | Initial commit from Create Next App |
| **App type** | Next.js (Vercel project framework: nextjs) |

---

## This Repository (canonical: Parlay-Kei/Q-REIL — [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json))

| Item | Value |
|------|--------|
| **Current HEAD** | `fcef9cdbeebf70899555731f88b6417404f3c0c3` |
| **Current branch** | engdel-qsuite-brand-scope-fix-0023 |
| **origin/main tip** | `c3db8a70afa1455aec7a7d6abf80b7fa840607e4` — “Initial commit: Q-REIL project setup” |
| **App type** | Vite/React (q-suite-ui); “beautiful UI” runs from this codebase on dev server |

---

## Comparison

| Check | Result |
|-------|--------|
| Is deployed SHA in this repo? | **No.** `21954142c54324c409482969222daaa9cc9ef46a` is not a commit in Q-REIL (`git cat-file` fails). |
| Same branch? | Deployed: **main**. Repo default: **main** (origin/HEAD). |
| Same codebase? | **No.** Vercel serves a **Next.js** app (“Create Next App”). This repo’s UI is **Vite/React** in `q-suite-ui/`. |

---

## Intended Deploy Branch / SHA

- **Intended branch** for the “beautiful UI” app: typically **main** (or the branch used for production, e.g. after merging engdel-qsuite-brand-scope-fix-0023).
- **Latest SHA on main (this repo):** `c3db8a70afa1455aec7a7d6abf80b7fa840607e4`.
- **Drift:** Vercel’s deployed SHA is from a **different repository or template** (Next.js). The Q-REIL repo’s **main** has never been deployed to q-reil.vercel.app in its current form; the Vercel project “q-reil” is tied to a different Git source or an older Next.js bootstrap.

---

## Summary

- **Deployed SHA:** `21954142...` (main) — Next.js, not in this repo.  
- **Latest SHA on intended branch (main):** `c3db8a7...` — Q-REIL initial commit.  
- **Current working SHA:** `fcef9cd...` (engdel-qsuite-brand-scope-fix-0023) — contains the “beautiful UI” seen on dev server.

To have Vercel serve the same UI as the dev server, deploy the **q-suite-ui** app (root `q-suite-ui/`, build `npm run build`, output `dist`) from the canonical repo **Parlay-Kei/Q-REIL** ([ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)), e.g. by linking that repo to a Vercel project with root directory `q-suite-ui` and framework overridden to Vite/static, or by using a separate project (e.g. “q-suite-ui” as in `proofs/q-suite-ui/DEPLOY_RECEIPT.md`).
