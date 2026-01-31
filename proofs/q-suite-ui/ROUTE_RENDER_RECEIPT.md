# Q Suite UI Route Render Receipt

**Mission:** QAG-QSUITE-UI-PROOF-0004  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-30

---

## Route Map Confirmation

Routes implemented per `docs/q-suite/ROUTE_MAP.md`:

| Path | Renders | Notes |
|------|---------|-------|
| `/` | Home | Suite landing |
| `/dashboard` | Dashboard | Control center |
| `/apps` | Apps | App switcher |
| `/reil` | REILHome | REIL workspace |
| `/reil/inbox` | Inbox | Thread list |
| `/reil/inbox/:threadId` | ThreadDetail | Thread detail |
| `/reil/records` | Records | Contacts tab default |
| `/reil/deals` | Records | Deals tab default |
| `/reil/deals/:dealId` | DealWorkspace | Deal workspace |
| `/reil/documents` | Documents | Document library |
| `/reil/ledger` | ActivityLedger | Activity ledger |
| `/settings` | Settings | Settings placeholder |

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

## Architecture

- **Top level:** REIL
- **REIL sub-nav:** Inbox, Records, Deals, Documents, Ledger
- **Router:** React Router v6 (BrowserRouter, Routes, Route, Outlet)
- **Layout:** AppShell wraps all routes via parent Route
