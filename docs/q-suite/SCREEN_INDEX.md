# Q Suite Screen Index

**Mission:** ENGDEL-QSUITE-IMPORT-AND-WIRE-0002  
**Owner:** Engineering Delivery  
**Date:** 2026-01-30

---

## Route → Screen Mapping

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Suite landing — hero, quick access tiles, global status, recent activity |
| `/dashboard` | `Dashboard` | Suite overview — KPIs, signals, activity feed |
| `/apps` | `Apps` | App switcher — grid of module tiles |
| `/reil` | `REILHome` | REIL workspace landing — unlinked threads, documents, deals needing evidence |
| `/reil/inbox` | `Inbox` | Email inbox — thread list, filters, search |
| `/reil/inbox/:threadId` | `ThreadDetail` | Thread detail — messages, attachments, link actions |
| `/reil/records` | `Records` | Records — contacts, companies, properties, deals (tabs) |
| `/reil/deals` | `Records` | Deals view — Records with `defaultTab="deals"` |
| `/reil/deals/:dealId` | `DealWorkspace` | Deal workspace — stages, evidence checklist, timeline |
| `/reil/documents` | `Documents` | Document library — list/grid, filters, linking |
| `/reil/ledger` | `ActivityLedger` | Activity ledger — table/timeline view of events |
| `/settings` | `Settings` | Settings placeholder |

---

## Legacy Redirects

| From | To |
|------|-----|
| `/inbox` | `/reil/inbox` |
| `/inbox/:threadId` | `/reil/inbox/:threadId` |
| `/records` | `/reil/records` |
| `/deals` | `/reil/deals` |
| `/deals/:dealId` | `/reil/deals/:dealId` |
| `/documents` | `/reil/documents` |
| `/ledger` | `/reil/ledger` |

---

## App Shell

All routes render inside `AppShell`, which provides:

- **Sidebar:** Logo, top nav (Home, Dashboard, Apps, REIL), REIL sub-nav (when in `/reil/*`), Settings, collapse toggle
- **CommandBar:** Search, theme toggle, notifications, connector status
- **Main:** Scrollable content area with `<Outlet />` for nested routes

---

## File Locations

| Component | Path |
|-----------|------|
| Home | `q-suite-ui/src/pages/Home.tsx` |
| Dashboard | `q-suite-ui/src/pages/Dashboard.tsx` |
| Apps | `q-suite-ui/src/pages/Apps.tsx` |
| REILHome | `q-suite-ui/src/pages/REILHome.tsx` |
| Inbox | `q-suite-ui/src/pages/Inbox.tsx` |
| ThreadDetail | `q-suite-ui/src/pages/ThreadDetail.tsx` |
| Records | `q-suite-ui/src/pages/Records.tsx` |
| DealWorkspace | `q-suite-ui/src/pages/DealWorkspace.tsx` |
| Documents | `q-suite-ui/src/pages/Documents.tsx` |
| ActivityLedger | `q-suite-ui/src/pages/ActivityLedger.tsx` |
| Settings | `q-suite-ui/src/pages/Settings.tsx` |
| AppShell | `q-suite-ui/src/components/layout/AppShell.tsx` |
| Sidebar | `q-suite-ui/src/components/layout/Sidebar.tsx` |
