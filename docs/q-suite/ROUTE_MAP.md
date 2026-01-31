# Q Suite Route Map

**Mission:** OCS-QSUITE-NAMING-AND-IA-0010 / ENGDEL-QSUITE-REIL-PACKAGE-IMPLEMENT-0011  
**Owner:** OCS / Engineering Delivery  
**Date:** 2026-01-30  
**Architecture:** Q REIL as app package with subviews (Overview, Inbox, Records, Deals, Documents, Ledger); QCC v2 suite control plane. Naming: [NAMING_CANON.md](./NAMING_CANON.md).

---

## Route Hierarchy (Package Model)

```
/                           → Home (suite landing)
/dashboard                  → Dashboard (suite overview)
/apps                       → Apps (app switcher)

/reil                       → Q REIL Overview (package landing; top-level entry only)
/reil/inbox                 → Inbox (Q REIL sub-nav)
/reil/records               → Records (Q REIL sub-nav)
/reil/deals                 → Deals (Q REIL sub-nav)
/reil/documents             → Documents (Q REIL sub-nav)
/reil/ledger                → Ledger (Q REIL sub-nav)

/reil/inbox/:threadId       → Thread detail
/reil/deals/:dealId         → Deal workspace
/reil/records/:id           → Record detail (if applicable)

/settings                   → Settings (bottom nav)
```

**Constraint:** No duplicate top-level entries for Inbox, Deals, Documents, Ledger outside Q REIL.

---

## Artifact Current Routes (Pre-Integration)

The extracted `q-suite-ui-2030-v2` uses flat routes:

| Path | Page | Notes |
|------|------|-------|
| `/` | Home | Suite landing |
| `/dashboard` | Dashboard | Suite overview |
| `/apps` | Apps | App switcher |
| `/reil` | REILHome | REIL workspace landing |
| `/inbox` | Inbox | Flat—needs nesting under /reil |
| `/records` | Records | Flat—needs nesting under /reil |
| `/deals` | Records (deals tab) | Flat—needs nesting under /reil |
| `/documents` | Documents | Flat—needs nesting under /reil |
| `/ledger` | ActivityLedger | Flat—needs nesting under /reil |
| `/inbox/:id` | ThreadDetail | Pattern match |
| `/deals/:id` | DealWorkspace | Pattern match |
| `/records/:id` | Records | Pattern match |

---

## Migration to Recommended Structure

| From | To |
|------|----|
| `/reil` | `/reil` (unchanged) |
| `/inbox` | `/reil/inbox` |
| `/records` | `/reil/records` |
| `/deals` | `/reil/deals` |
| `/documents` | `/reil/documents` |
| `/ledger` | `/reil/ledger` |
| `/inbox/:id` | `/reil/inbox/:id` |
| `/deals/:id` | `/reil/deals/:id` |
| `/records/:id` | `/reil/records/:id` |

---

## Sidebar Nav Structure (Post-Migration)

**Top-level (Suite):**
- Home → `/`
- Dashboard → `/dashboard`
- Apps → `/apps`
- **Q REIL** → `/reil` (workspace landing, badge for unread)

**REIL sub-nav (when inside Q REIL only):**
- Overview → `/reil`
- Inbox → `/reil/inbox`
- Records → `/reil/records`
- Deals → `/reil/deals`
- Documents → `/reil/documents`
- Ledger → `/reil/ledger`

**Bottom:**
- Settings → `/settings`

---

## Router Choice

- **Vite app:** Use `react-router-dom` for proper nested routes.
- **Alternative:** Keep simple `useState` + `window.history` but update path strings to new structure.

---

## Redirects (Legacy Support)

If old flat paths are ever linked externally:
- `/inbox` → `/reil/inbox`
- `/records` → `/reil/records`
- `/deals` → `/reil/deals`
- `/documents` → `/reil/documents`
- `/ledger` → `/reil/ledger`

---

## References

- **Suite IA & nav:** [IA_NAV_SPEC.md](./IA_NAV_SPEC.md)
- **REIL subnav:** [../q-reil/REIL_SUBNAV_SPEC.md](../q-reil/REIL_SUBNAV_SPEC.md)
- **REIL route structure:** [../q-reil/REIL_ROUTE_STRUCTURE.md](../q-reil/REIL_ROUTE_STRUCTURE.md)
