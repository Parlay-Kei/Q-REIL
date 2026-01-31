# Q Suite Implementation Plan

**Mission:** OCS-QSUITE-IMPLEMENT-ZIP-0001  
**Owner:** OCS  
**Date:** 2026-01-30  
**Artifact:** q-suite-ui-2030-v2.zip (Vite + React + TypeScript)

---

## Executive Summary

Import `q-suite-ui-2030-v2.zip` as the Q Suite frontend. Create new repo `q-suite-ui` at workspace root. Keep Vite + React + TypeScript (no Next.js migration). Restructure routes so REIL is top-level with Inbox, Records, Deals, Documents, Ledger as sub-nav.

---

## Framework Compatibility

| Item | Artifact | Suite Standard | Decision |
|------|----------|----------------|----------|
| Framework | Vite + React | q-reil uses Next.js | **Keep Vite.** No hard constraint requires Next.js for q-suite-ui. |
| Path | — | — | `q-suite-ui/` at root (or `apps/q-suite-ui` if monorepo adopted) |
| Migration | — | — | Migrate to Next.js only if SSR, RSC, or auth flow demands it. |

**Rationale:** Least disruptive. The artifact is self-contained and builds cleanly. q-reil remains the REIL backend/API; q-suite-ui is the suite shell. Both can coexist.

---

## Mission Sequence & Owners

| # | Mission ID | Owner | Description |
|---|------------|-------|-------------|
| 1 | OCS-QSUITE-IMPLEMENT-ZIP-0001 | OCS | Plan, repo decision, route map ✓ |
| 2 | ENGDEL-QSUITE-IMPORT-AND-WIRE-0002 | Engineering Delivery | Import artifact, normalize structure, wire routes, preserve 2030 primitives |
| 3 | PLATOPS-QSUITE-BUILD-DEPLOY-0003 | Platform Ops | CI (typecheck, lint, build), Vercel config, receipts |
| 4 | QAG-QSUITE-UI-PROOF-0004 | QA Gatekeeper | Validate DoD, screenshot set, proof pack |

---

## Engineering Delivery Scope (Mission 2)

### 2.1 Import

- Source: `q-suite-ui-2030-v2.zip` (extracted to `q-suite-ui-extracted/q-suite-ui/`)
- Target: `q-suite-ui/` at workspace root
- Actions: Copy files, rename package to `q-suite-ui`, update branding to "Q by Strata Noble"

### 2.2 Normalize Repo Structure

| Area | Target |
|------|--------|
| `src/` | Clean, no cruft |
| `components/` | Layout + `components/ui/` stable |
| Routes | `pages/` or `routes/` consistent; use `react-router-dom` for nested routes |

### 2.3 Route Wiring

Ensure these render without runtime errors:

| Route | Page |
|-------|------|
| `/` | Home |
| `/dashboard` | Dashboard |
| `/reil` | REIL workspace landing |
| `/reil/inbox` | Inbox |
| `/reil/records` | Records |
| `/reil/deals` | Deals |
| `/reil/documents` | Documents |
| `/reil/ledger` | Ledger |
| `/reil/inbox/:id` | Thread detail |
| `/reil/deals/:id` | Deal workspace |
| `/settings` | Settings |

### 2.4 Preserve 2030 Primitives

- **Background:** Layered radial lighting, fractal noise texture
- **Panel:** Reusable surface with masked border gradient, shadowing
- **Card:** panel + texture + luminous-arc
- **Table:** Base styling (bg-surface-primary, backdrop-blur, stroke-hairline)

### 2.5 Naming Cleanup

- Remove placeholder copy referencing "DSLV" or old product names unless explicitly required.
- Ensure "Q by Strata Noble" and "Q Suite" are consistent.

---

## Platform Ops Scope (Mission 3)

- Add CI: `typecheck`, `lint`, `build`
- Vercel: Provision or link project, set build for Vite (output: `dist/`, build command: `npm run build`)
- Secrets: Vault references only; no committed env vars

---

## QA Scope (Mission 4)

- App shell renders
- All module routes render without runtime errors
- Core primitives used consistently
- Build and lint pass
- Screenshot set: Dashboard, REIL, Inbox, Records, Deals, Documents, Ledger

---

## Key Decision: REIL as Top Level

**Recommendation (accepted):** REIL is the top-level workspace. Inbox, Records, Deals, Documents, Ledger are sub-nav inside REIL.

**Benefits:**
- Clear hierarchy for future scale
- Single REIL entry point with contextual sub-views
- Aligns with q-reil backend structure

---

## Deliverables Checklist

| Deliverable | Owner | Path |
|-------------|-------|------|
| IMPLEMENTATION_PLAN.md | OCS | docs/q-suite/IMPLEMENTATION_PLAN.md |
| REPO_DECISION.md | OCS | docs/q-suite/REPO_DECISION.md |
| ROUTE_MAP.md | OCS | docs/q-suite/ROUTE_MAP.md |
| PR / branch | Engineering | q-suite-ui/ |
| COMPONENT_PRIMITIVES.md | Engineering | docs/q-suite/COMPONENT_PRIMITIVES.md |
| SCREEN_INDEX.md | Engineering | docs/q-suite/SCREEN_INDEX.md |
| CI workflow | Platform Ops | .github/workflows/ |
| Vercel config | Platform Ops | vercel.json (if applicable) |
| BUILD_RECEIPT.md | Platform Ops | proofs/q-suite-ui/BUILD_RECEIPT.md |
| DEPLOY_RECEIPT.md | Platform Ops | proofs/q-suite-ui/DEPLOY_RECEIPT.md |
| QA_VERDICT.md | QA | proofs/q-suite-ui/QA_VERDICT.md |
| SCREENSHOT_INDEX.md | QA | proofs/q-suite-ui/SCREENSHOT_INDEX.md |
| ROUTE_RENDER_RECEIPT.md | QA | proofs/q-suite-ui/ROUTE_RENDER_RECEIPT.md |
