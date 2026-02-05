# Q Suite Repo Decision

**Mission:** OCS-QSUITE-IMPLEMENT-ZIP-0001  
**Owner:** OCS  
**Date:** 2026-01-30  
**Status:** DECIDED

---

## Decision: Create New Repo `q-suite-ui`

**Verdict:** No Q Suite frontend repo exists in the workspace. Create a new repo named `q-suite-ui` under Strata Noble conventions.

---

## Rationale

### Workspace Scan Results

| Item | Finding |
|------|---------|
| **q-reil/** | Exists. Next.js 16 app with routes: `/q-reil`, `/q-reil/inbox`, `/q-reil/records`, `/q-reil/settings`. This is the **REIL module** app, not the Q Suite shell. |
| **q-suite-ui** | Does not exist. No folder, no package, no references. |
| **Artifact** | `q-suite-ui-2030-v2.zip` contains a complete Vite + React + TypeScript Q Suite shell with Dashboard, REIL, Inbox, Records, Deals, Documents, Ledger. |

### Why Not Integrate Into q-reil?

1. **Scope mismatch:** q-reil is REIL-specific (inbox, records, settings). The artifact is the full Q Suite shell (Dashboard, Apps, REIL as one module among many).
2. **Framework difference:** q-reil is Next.js; artifact is Vite. Migration would require rewriting all pages to Next.js App Router, increasing risk and timeline.
3. **Architecture clarity:** User recommendation: *"REIL as top level; Inbox, Records, Deals, Documents, Ledger as sub-nav inside REIL."* A dedicated q-suite-ui repo can implement this cleanly as the suite shell; q-reil can remain the REIL backend/API or be embedded.

### Why New Repo?

1. **Canonical repo:** Single source of truth is **Parlay-Kei/Q-REIL** ([ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)). Vercel team: `strata-nobles-projects`. New app = same repo, app root `q-suite-ui`.
2. **Least disruptive path:** Keep artifact as Vite + React. No framework migration unless a hard constraint (e.g., SSR for auth) emerges.
3. **Single source of truth:** q-suite-ui becomes the canonical Q Suite frontend; q-reil serves as REIL API/backend or is consumed by q-suite-ui.

---

## Strata Noble Conventions (Observed)

| Convention | Value |
|------------|-------|
| Vercel team | `strata-nobles-projects` |
| Suite label | "Q by Strata Noble" |
| GitHub org | Parlay-Kei (canonical repo: [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)) |
| Env secrets | Vault references, never committed |
| CI | typecheck, lint, build |

---

## Placement

- **Monorepo:** Workspace has no `apps/` structure. q-reil lives at root.
- **Decision:** Create `q-suite-ui/` at workspace root as sibling to `q-reil/`.
- **Future:** If monorepo is adopted, move to `apps/q-suite-ui`.

---

## Approval

- [x] OCS decision recorded
- [ ] Engineering Delivery to import and wire (ENGDEL-QSUITE-IMPORT-AND-WIRE-0002)
- [ ] Platform Ops to provision CI/Vercel (PLATOPS-QSUITE-BUILD-DEPLOY-0003)
