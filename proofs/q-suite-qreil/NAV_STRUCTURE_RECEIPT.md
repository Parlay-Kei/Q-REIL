# Q Suite Q REIL Navigation Structure Receipt

**Mission:** QAG-QREIL-PACKAGE-PROOF-0014  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-30  
**Scope:** Q REIL package navigation structure verification

---

## 1. Suite Top-Level Navigation

**Source:** `q-suite-ui/src/components/layout/Sidebar.tsx` — `topNavItems`

| Entry | Path | Icon | Notes |
|-------|------|------|-------|
| Home | `/` | HomeIcon | Suite landing |
| Dashboard | `/dashboard` | LayoutDashboardIcon | Suite overview |
| Apps | `/apps` | Box | App switcher |
| **Q REIL** | `/reil` | ZapIcon | Q REIL package entry (badge: 12) |

**Constraint verified:** No Inbox, Records, Deals, Documents, or Ledger at top level. ✓

---

## 2. REIL Subnav (Conditional — Only Under Q REIL)

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

**Proof:** On `/dashboard`, REIL subnav block is not rendered (screenshot `qreil-04-dashboard-no-reil-subnav.png`). On any `/reil` or `/reil/*` route, subnav block with header "Q REIL" and the six items above is visible.

---

## 3. Bottom Suite Nav

| Entry | Path |
|-------|------|
| Settings | `/settings` |

---

## 4. App Tiles (Q REIL)

**Apps page** (`q-suite-ui/src/components/layout/AppSwitcher.tsx` — `apps`):
- **Q REIL** tile: `name: 'Q REIL'`, `description: 'Commercial Real Estate package'`, `path: '/reil'`, ZapIcon.

**Home Quick Access** (`q-suite-ui/src/pages/Home.tsx` — `appTiles`):
- First tile: **Q REIL**, path `/reil`, ZapIcon.

---

## 5. Route Configuration

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

**Legacy redirects:** `/inbox`, `/records`, `/deals`, `/documents`, `/ledger` (and param variants) → redirect to `/reil/*`

---

## 6. Verification Summary

| Criterion | Status |
|-----------|--------|
| Q REIL in top-level nav | ✓ |
| Q REIL as app tile (Apps + Home) | ✓ |
| REIL subnav has six items (Overview, Inbox, Records, Deals, Documents, Ledger) | ✓ |
| REIL subnav visible only when path starts with `/reil` | ✓ |
| No duplicate top-level Inbox/Deals/Documents/Ledger | ✓ |

---

## 7. References

- [IA_NAV_SPEC.md](../../docs/q-suite/IA_NAV_SPEC.md)
- [NAMING_CANON.md](../../docs/q-suite/NAMING_CANON.md)
- [REIL_SUBNAV_SPEC.md](../../docs/q-reil/REIL_SUBNAV_SPEC.md)
