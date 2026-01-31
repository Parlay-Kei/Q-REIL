# REIL Route Structure

**Mission:** ENGDEL-QSUITE-REIL-PACKAGE-IMPLEMENT-0011 / ENGDEL-QSUITE-REIL-ROUTING-0006  
**Owner:** Engineering Delivery  
**Date:** 2026-01-30  
**Baseline:** q-suite-ui (Vite + React Router). Naming: [../q-suite/NAMING_CANON.md](../q-suite/NAMING_CANON.md).

---

## 1. Q REIL as Package Route Group

Q REIL is implemented as a **route group** under `/reil`. All REIL subviews and detail routes live under this prefix. The top-level suite nav has a single **Q REIL** entry; REIL subnav appears only when the user is inside the REIL area (`/reil/*`).

---

## 2. Canonical Routes

| Path | Page / Component | Primitives |
|------|------------------|------------|
| `/reil` | REILHome (Overview) | AppShell, Card, KPICard, Button, Badge |
| `/reil/inbox` | Inbox | AppShell, Table, EmptyState, Button |
| `/reil/inbox/:threadId` | ThreadDetail | AppShell, Card, Timeline, Button |
| `/reil/records` | Records (defaultTab contacts) | AppShell, Table, Tabs, Card |
| `/reil/deals` | Records (defaultTab deals) | AppShell, Table, Tabs, Card |
| `/reil/deals/:dealId` | DealWorkspace | AppShell, Card, Tabs, Timeline |
| `/reil/documents` | Documents | AppShell, Table, Card, EmptyState |
| `/reil/ledger` | ActivityLedger | AppShell, Timeline, Card, Table |

All REIL routes render inside the same shell (AppShell with Sidebar + CommandBar + Outlet) and use the shared primitives from `q-suite-ui/src/components/ui/` and `index.css` (panel, texture, luminous-arc, etc.).

---

## 3. Route Configuration (q-suite-ui)

**File:** `q-suite-ui/src/App.tsx`

- Parent route: `/` → `AppShell` (Outlet for children).
- REIL routes are siblings under the same parent:
  - `reil` → REILHome
  - `reil/inbox` → Inbox
  - `reil/inbox/:threadId` → ThreadDetail
  - `reil/records` → Records
  - `reil/deals` → Records (deals tab)
  - `reil/deals/:dealId` → DealWorkspace
  - `reil/documents` → Documents
  - `reil/ledger` → ActivityLedger
- Legacy redirects: `inbox`, `records`, `deals`, `documents`, `ledger` (and detail variants) → redirect to `/reil/*`.

---

## 4. REIL Subnav (Sidebar)

**File:** `q-suite-ui/src/components/layout/Sidebar.tsx`

- **Visibility:** REIL subnav block is shown when `pathname.startsWith('/reil')`.
- **Items (order):** Overview (`/reil`), Inbox, Records, Deals, Documents, Ledger.
- **Active state:** Item with matching path is highlighted; for detail routes, parent subnav item (e.g. Inbox, Deals) stays active.

---

## 5. Top-Level Nav Constraint

The suite top nav contains only: Home, Dashboard, Apps, **Q REIL**. Inbox, Records, Deals, Documents, and Ledger do **not** appear at top level; they exist only in the REIL subnav when inside `/reil/*`.

---

## 6. Next.js App (q-reil)

The `q-reil` Next.js app uses path prefix `/q-reil` (e.g. `/q-reil`, `/q-reil/inbox`, `/q-reil/records`). The canonical user-facing REIL routes for the suite are implemented in **q-suite-ui** under `/reil` as above. q-reil can mirror this structure under `/q-reil` for standalone or embedded use; see app directory layout in the repo.

---

## 7. References

- **Suite IA:** [../q-suite/IA_NAV_SPEC.md](../q-suite/IA_NAV_SPEC.md)
- **REIL subnav spec:** [REIL_SUBNAV_SPEC.md](./REIL_SUBNAV_SPEC.md)
- **Route map:** [../q-suite/ROUTE_MAP.md](../q-suite/ROUTE_MAP.md)
- **Component primitives:** [../q-suite/COMPONENT_PRIMITIVES.md](../q-suite/COMPONENT_PRIMITIVES.md)
