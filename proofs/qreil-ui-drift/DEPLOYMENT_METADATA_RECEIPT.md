# Q-REIL Vercel Deployment Metadata Receipt

**Mission:** QREIL-UI-DRIFT-INTAKE-0001  
**Owner:** OCS  
**Date:** 2026-02-01  
**Source:** Vercel API (get_deployment, get_project) for q-reil.vercel.app

---

## Deployment (Production)

| Field | Value |
|-------|--------|
| **Deployment ID** | `dpl_4QYuindMVA86X8eZkawJ5cyPCx1w` |
| **URL** | q-reil-7uj6v1s6s-strata-nobles-projects.vercel.app |
| **Aliases** | q-reil.vercel.app, q-reil-strata-nobles-projects.vercel.app, q-reil-stratanoble-strata-nobles-projects.vercel.app |
| **State** | READY |
| **Target** | production |
| **Type** | LAMBDAS |
| **Created (epoch ms)** | 1769850630432 |
| **Ready (epoch ms)** | 1769850659050 |

---

## Git Metadata (Deployed Commit)

| Field | Value |
|-------|--------|
| **Git SHA** | `21954142c54324c409482969222daaa9cc9ef46a` |
| **Branch** | `main` |
| **Commit message** | Initial commit from Create Next App |
| **Author** | Steve Hubbard \<Steve.Hubbard@stratanoble.com\> |
| **Git dirty** | 1 (uncommitted changes at deploy time) |

---

## Project (Vercel)

| Field | Value |
|-------|--------|
| **Project ID** | prj_VAiSllyEk27tnHDXagBt88h0h64j |
| **Project name** | q-reil |
| **Framework** | nextjs |
| **Node version** | 24.x |
| **Account/Team ID** | team_DLPOODpWbIp8OubK6ngvbM1v (Strata Noble's projects) |

---

## Build Configuration (Inferred)

- **Root directory:** Not returned by API; Vercel project "q-reil" is configured as a **Next.js** app (framework: nextjs). No `rootDirectory` override was returned; typical default is repository root.
- **Build command:** Next.js default (e.g. `next build`), not the Q-REIL repo’s `q-suite-ui` build (`npm run build` / `npx vite build`).
- **Output:** Next.js default (e.g. `.next`), not `q-suite-ui/dist`.

---

## Conclusion

**q-reil.vercel.app** is serving a **Next.js** application from commit `21954142...` on branch `main`, with commit message "Initial commit from Create Next App." This does **not** match the Q-REIL repository’s **Vite/React** app in `q-suite-ui/`, which is the codebase for the “beautiful UI” seen on the dev server.
