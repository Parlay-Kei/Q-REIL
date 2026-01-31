# Q Suite Brand Sources

**Mission:** ENGDEL-QSUITE-BOOT-AND-BRANDING-FIX-0016  
**Date:** 2026-01-30  
**Purpose:** Single list of files where brand (suite name, byline, app names, document titles) appears. All runtime strings should derive from `q-suite-ui/src/constants/brand.ts` where possible.

---

## Single source of truth

| File | Role |
|------|------|
| **q-suite-ui/src/constants/brand.ts** | Canonical constants: SUITE_NAME, SUITE_BYLINE, DEFAULT_DOCUMENT_TITLE, CONTROL_CENTER_NAME, REIL_APP_NAME, REIL_APP_DESCRIPTION, TITLE_* helpers |

---

## Files where brand appears

### HTML / manifest

| File | What |
|------|------|
| **q-suite-ui/index.html** | `<title>Q Suite by Strata Noble</title>`, `<link rel="manifest" href="/manifest.json" />` |
| **q-suite-ui/public/manifest.json** | `name`: "Q Suite by Strata Noble", `short_name`: "Q Suite" |

### Layout (use brand constants)

| File | What |
|------|------|
| **q-suite-ui/src/components/layout/Sidebar.tsx** | SUITE_NAME, SUITE_BYLINE, REIL_APP_NAME, CONTROL_CENTER_NAME (logo, nav labels — no hardcoded "Dashboard") |
| **q-suite-ui/src/components/layout/CommandBar.tsx** | SUITE_NAME, REIL_APP_NAME (search placeholder) |
| **q-suite-ui/src/components/layout/AppSwitcher.tsx** | REIL_APP_NAME, REIL_APP_DESCRIPTION (Apps tile) |
| **q-suite-ui/src/components/layout/ReilBreadcrumb.tsx** | REIL_APP_NAME (first segment) |

### Pages (use brand constants for document.title and headings)

| File | What |
|------|------|
| **q-suite-ui/src/pages/Home.tsx** | TITLE_HOME, DEFAULT_DOCUMENT_TITLE, REIL_APP_NAME, CONTROL_CENTER_NAME (Quick Access tiles: Q REIL, Q Control Center, Apps only), "Q Suite" hero copy |
| **q-suite-ui/src/pages/Dashboard.tsx** | TITLE_CONTROL_CENTER, CONTROL_CENTER_NAME, DEFAULT_DOCUMENT_TITLE (page heading) |
| **q-suite-ui/src/pages/Apps.tsx** | SUITE_NAME (header copy) |
| **q-suite-ui/src/pages/REILHome.tsx** | TITLE_REIL_OVERVIEW, DEFAULT_DOCUMENT_TITLE, REIL_APP_NAME, REIL_APP_DESCRIPTION |
| **q-suite-ui/src/pages/Inbox.tsx** | TITLE_REIL_SUBVIEW('Inbox'), DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/ThreadDetail.tsx** | TITLE_REIL_THREAD, DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/Records.tsx** | TITLE_REIL_SUBVIEW(pageLabel), DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/DealWorkspace.tsx** | TITLE_REIL_DEAL(deal.name), DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/Documents.tsx** | TITLE_REIL_SUBVIEW('Documents'), DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/ActivityLedger.tsx** | TITLE_REIL_SUBVIEW('Ledger'), DEFAULT_DOCUMENT_TITLE |
| **q-suite-ui/src/pages/Settings.tsx** | SUITE_NAME ("Q Suite Settings") |

### Error / fallback

| File | What |
|------|------|
| **q-suite-ui/src/components/ErrorBoundary.tsx** | DEFAULT_DOCUMENT_TITLE (on error), console message "Q Suite UI error" |

---

## Removed

- **"Command Center UI"** — removed from index.html title and all UI; no remaining references.

---

## References

- [NAMING_CANON.md](./NAMING_CANON.md) — Canonical product naming and route-aware titles
- [NAV_LABELS_FINAL.md](./NAV_LABELS_FINAL.md) — Locked nav and Apps tile copy (left nav, Quick Access)
- [TRIAGE_PLAN.md](./TRIAGE_PLAN.md) — Two-track plan (render + naming canon)
