# Expected UI Routes — Dev Server vs Vercel

**Mission:** QREIL-UI-DRIFT-INTAKE-0001  
**Owner:** OCS  
**Date:** 2026-02-01

---

## Expected UI Route(s)

Per mission: **Home, Inbox, Records, Settings**. Which one matches the dev server experience?

---

## Route Map (Q-REIL / q-suite-ui)

Defined in `q-suite-ui/src/App.tsx` and documented in `docs/q-suite/ROUTE_MAP.md`:

| Route | Page | Notes |
|-------|------|--------|
| **/** | Home | Suite landing — **matches “Home”** |
| /dashboard | Dashboard | Suite overview |
| /apps | Apps | App switcher |
| **/reil** | REILHome | Q REIL overview (package landing) |
| **/reil/inbox** | Inbox | **Matches “Inbox”** (REIL sub-nav) |
| /reil/inbox/:threadId | ThreadDetail | Thread detail |
| **/reil/records** | Records | **Matches “Records”** (REIL sub-nav) |
| /reil/deals | Records (deals tab) | Deals |
| /reil/deals/:dealId | DealWorkspace | Deal workspace |
| /reil/documents | Documents | Documents |
| /reil/ledger | ActivityLedger | Ledger |
| **/settings** | Settings | **Matches “Settings”** (bottom nav) |

Legacy redirects: `/inbox` → `/reil/inbox`, `/records` → `/reil/records`, etc.

---

## Which Route Matches the “Beautiful UI” on Dev Server?

- **Home** → `/` (Home.tsx) — suite landing.
- **Inbox** → `/reil/inbox` (Inbox.tsx) — REIL Inbox.
- **Records** → `/reil/records` (Records.tsx) — REIL Records.
- **Settings** → `/settings` (Settings.tsx) — Settings.

All four are part of the same **Vite/React** app in **q-suite-ui**. The “beautiful UI” Steve saw on the dev server is this app running locally (e.g. `npm run dev` in `q-suite-ui/`). So the experience is the **whole app**; the routes that best represent it are:

- **Primary:** `/` (Home) and `/reil` (REIL overview) as entry points.
- **Mission-called-out:** Home (`/`), Inbox (`/reil/inbox`), Records (`/reil/records`), Settings (`/settings`).

**Conclusion:** The expected UI is the **q-suite-ui** SPA. The route set that matches the dev server experience is **Home (`/`), Inbox (`/reil/inbox`), Records (`/reil/records`), Settings (`/settings`)** — all served by the same Vite/React build. Vercel at q-reil.vercel.app is currently serving a **different** app (Next.js, different repo/commit), so none of these routes on Vercel reflect the “beautiful UI” from the dev server until the correct app is deployed.
