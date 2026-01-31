# Q Suite REIL Navigation Structure Receipt

**Mission:** QAG-QSUITE-REIL-PACKAGE-PROOF-0009  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-30  
**Scope:** REIL package navigation structure verification

---

## 1. Suite Top-Level Navigation

**Source:** `q-suite-ui/src/components/layout/Sidebar.tsx` — `topNavItems`

| Entry | Path | Icon | Notes |
|-------|------|------|-------|
| Home | `/` | HomeIcon | Suite landing |
| Dashboard | `/dashboard` | LayoutDashboardIcon | Suite overview |
| Apps | `/apps` | Box | App switcher |
| **REIL** | `/reil` | ZapIcon | REIL package entry (badge: 12) |

**Constraint verified:** No Inbox, Records, Deals, Documents, or Ledger at top level. ✓

---

## 2. REIL Subnav (Conditional)

**Source:** `q-suite-ui/src/components/layout/Sidebar.tsx` — `reilSubNavItems`  
**Visibility:** Shown only when `pathname.startsWith('/reil')` — `isReilSection(currentPath)`

| Subnav Item | Path | Icon |
|-------------|------|------|
| Overview | `/reil` | LayoutGridIcon |
| Inbox | `/reil/inbox` | MailIcon |
| Records | `/reil/records` | UsersIcon |
| Deals | `/reil/deals` | BriefcaseIcon |
| Documents | `/reil/documents` | FileTextIcon |
| Ledger | `/reil/ledger` | ClockIcon |

**Active state logic:**
- Overview: active when `currentPath === '/reil'`
- Others: active when `currentPath === item.path` or `currentPath.startsWith(item.path + '/')`

---

## 3. Bottom Suite Nav

| Entry | Path |
|-------|------|
| Settings | `/settings` |

---

## 4. Route Configuration

**Source:** `q-suite-ui/src/App.tsx`

| Path | Component |
|------|-----------|
| `/reil` | REILHome |
| `/reil/inbox` | Inbox |
| `/reil/inbox/:threadId` | ThreadDetail |
| `/reil/records` | Records (defaultTab="contacts") |
| `/reil/deals` | Records (defaultTab="deals") |
| `/reil/deals/:dealId` | DealWorkspace |
| `/reil/documents` | Documents |
| `/reil/ledger` | ActivityLedger |

**Legacy redirects:** `/inbox`, `/records`, `/deals`, `/documents`, `/ledger` → redirect to `/reil/*`

---

## 5. Verification Summary

| Criterion | Status |
|-----------|--------|
| Suite nav shows REIL as an app | ✓ |
| REIL has subnav (Overview, Inbox, Records, Deals, Documents, Ledger) | ✓ |
| REIL subnav visible only when path starts with `/reil` | ✓ |
| No duplicate top-level Inbox or Deals in suite nav | ✓ |
| All REIL subroutes wired and render | ✓ |

---

## 6. References

- [IA_NAV_SPEC.md](../../docs/q-suite/IA_NAV_SPEC.md)
- [REIL_SUBNAV_SPEC.md](../../docs/q-reil/REIL_SUBNAV_SPEC.md)
- [REIL_ROUTE_STRUCTURE.md](../../docs/q-reil/REIL_ROUTE_STRUCTURE.md)
