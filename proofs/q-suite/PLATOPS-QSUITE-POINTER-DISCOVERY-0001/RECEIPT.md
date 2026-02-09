# Q Suite Pointer Discovery Receipt

**Mission:** PLATOPS-QSUITE-POINTER-DISCOVERY-0001  
**Owner:** Platform Ops  
**Date:** 2026-02-09  
**Objective:** Run pointer discovery for Q Suite repos and route structure

---

## 1. Canonical Repo Path

| Item | Value | Evidence |
|------|-------|----------|
| **Primary Repo** | `c:\Dev\10_products\Q-REIL` | Workspace root |
| **UI App Path** | `q-suite-ui/` | React/Vite SPA |
| **Framework** | Vite + React + React Router v6 | `q-suite-ui/package.json` |
| **Build Output** | `q-suite-ui/dist/` | `vercel.json` → `outputDirectory: "dist"` |
| **Deployment** | Vercel (q-reil.vercel.app) | `vercel.json`, proofs |

---

## 2. Current Route Structure

### 2.1 Implemented Routes

**Source:** `q-suite-ui/src/App.tsx`

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `Home` | Suite landing (acts as launcher with app tiles) |
| `/dashboard` | `Dashboard` | Suite overview |
| `/apps` | `Apps` | App switcher page |
| `/reil` | `REILHome` | Q REIL package landing |
| `/reil/inbox` | `Inbox` | REIL sub-nav |
| `/reil/inbox/:threadId` | `ThreadDetail` | Thread detail |
| `/reil/inbox/item/:rawId` | `ItemDetail` | Item detail |
| `/reil/records` | `Records` | REIL sub-nav (contacts tab) |
| `/reil/records/:recordId` | `RecordDetail` | Record detail |
| `/reil/deals` | `Records` | REIL sub-nav (deals tab) |
| `/reil/deals/:dealId` | `DealWorkspace` | Deal workspace |
| `/reil/documents` | `Documents` | REIL sub-nav |
| `/reil/ledger` | `ActivityLedger` | REIL sub-nav |
| `/settings` | `Settings` | Settings placeholder |

### 2.2 Legacy Redirects (Already Implemented)

**Source:** `q-suite-ui/src/App.tsx` lines 48-54

| From | To |
|------|-----|
| `/inbox` | `/reil/inbox` |
| `/inbox/:threadId` | `/reil/inbox/:threadId` |
| `/records` | `/reil/records` |
| `/deals` | `/reil/deals` |
| `/deals/:dealId` | `/reil/deals/:dealId` |
| `/documents` | `/reil/documents` |
| `/ledger` | `/reil/ledger` |

### 2.3 Vercel Rewrites (SPA Routing)

**Source:** `q-suite-ui/vercel.json`

```json
{
  "rewrites": [
    { "source": "/reil", "destination": "/index.html" },
    { "source": "/reil/:path*", "destination": "/index.html" }
  ]
}
```

**Note:** Rewrites ensure deep links to `/reil/*` load the SPA correctly.

---

## 3. Q Suite Launcher / Shell Discovery

### 3.1 Existing Launcher Elements

| Component | Location | Status |
|-----------|----------|--------|
| **Home Page** | `q-suite-ui/src/pages/Home.tsx` | ✅ Exists - Shows app tiles (Q REIL, Q Control Center, Apps) |
| **Apps Page** | `q-suite-ui/src/pages/Apps.tsx` | ✅ Exists - Uses `AppSwitcher` component |
| **AppSwitcher** | `q-suite-ui/src/components/layout/AppSwitcher.tsx` | ✅ Exists - Shows app tiles grid |
| **AppShell** | `q-suite-ui/src/components/layout/AppShell.tsx` | ✅ Exists - Layout wrapper with Sidebar + CommandBar |
| **Sidebar** | `q-suite-ui/src/components/layout/Sidebar.tsx` | ✅ Exists - Top nav + REIL sub-nav |

### 3.2 Current Launcher Behavior

- **Home (`/`)** displays:
  - Hero panel with "One workspace. One ledger."
  - Quick Access tiles: Q REIL, Q Control Center, Apps
  - Global Status KPIs
  - Recent Activity timeline
  - Connector Health cards

- **Apps (`/apps`)** displays:
  - App switcher grid with tiles for:
    - Q REIL (path: `/reil`)
    - Knowledge Base (path: `/knowledge` - **stub/placeholder**)
    - Analytics (path: `/analytics` - **stub/placeholder**)
    - Settings (path: `/settings`)

**Finding:** Home page already acts as a launcher, but it's not specifically designed as a "Q Suite Launcher" with module tiles for Q-REIL, Q-ICMS, Q-CC per mission spec.

---

## 4. Module Registry Discovery

### 4.1 Module Registry Status

| Item | Status | Location |
|------|--------|----------|
| **Module registry file** | ❌ **NOT FOUND** | No `modules.ts` or `module*.ts` files exist |
| **Hardcoded apps** | ✅ Found | `AppSwitcher.tsx` lines 26-64 |
| **Hardcoded tiles** | ✅ Found | `Home.tsx` lines 72-95 |

### 4.2 Current App Definitions

**Source:** `q-suite-ui/src/components/layout/AppSwitcher.tsx`

```typescript
const apps: AppTile[] = [
  {
    id: 'reil',
    name: REIL_APP_NAME,  // "Q REIL"
    description: REIL_APP_DESCRIPTION,  // "Commercial Real Estate package"
    icon: ZapIcon,
    status: 'healthy',
    lastUpdated: '2 min ago',
    connectorDeps: ['Gmail', 'Outlook'],
    path: '/reil'
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    description: 'Team documentation & guides',
    icon: BookOpenIcon,
    status: 'healthy',
    lastUpdated: '1 hour ago',
    path: '/knowledge'  // ⚠️ No route exists
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Insights & reporting',
    icon: BarChart3Icon,
    status: 'healthy',
    lastUpdated: '30 min ago',
    connectorDeps: ['BigQuery'],
    path: '/analytics'  // ⚠️ No route exists
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuration & integrations',
    icon: SettingsIcon,
    status: 'healthy',
    lastUpdated: 'Just now',
    path: '/settings'  // ✅ Route exists
  }
];
```

**Finding:** Apps are hardcoded in `AppSwitcher.tsx`. No centralized module registry exists. Q-ICMS and Q-CC are **not present** in the codebase.

---

## 5. Q-ICMS and Q-CC Discovery

### 5.1 Q-ICMS Search Results

| Search Term | Matches | Status |
|------------|---------|--------|
| `ICMS` | 0 matches | ❌ Not found |
| `icms` | 0 matches | ❌ Not found |
| `Q-ICMS` | 0 matches | ❌ Not found |

**Verdict:** Q-ICMS does not exist in the codebase.

### 5.2 Q-CC / QCC Search Results

| Search Term | Matches | Status |
|------------|---------|--------|
| `Q-CC` | 0 matches | ❌ Not found |
| `QCC` | 2 matches | ⚠️ Found in docs only |
| `q-cc` | 0 matches | ❌ Not found |

**QCC References Found:**
- `docs/q-suite/IA_NAV_SPEC.md` - Mentions "QCC v2" as suite control plane (users, roles, connectors, audit, health)
- `docs/q-suite/ROUTE_MAP.md` - Mentions "QCC v2 suite control plane"

**Verdict:** Q-CC is mentioned in documentation as "QCC v2" (control plane), but no actual Q-CC module/app exists. The Dashboard (`/dashboard`) appears to be the control plane entry point.

---

## 6. `/q-reil` Route Discovery

### 6.1 Search Results

| Search Term | Matches | Status |
|------------|---------|--------|
| `/q-reil` | 0 matches | ❌ Not found |
| `q-reil` | Many matches | ⚠️ Found in proofs/docs only (Vercel project name, env files) |

**Verdict:** No `/q-reil` route exists. The canonical route is `/reil`.

### 6.2 Route Mismatch Analysis

**Mission mentions:** `localhost:3000/q-reil` (route mismatch vs runtime error)

**Findings:**
- **No `/q-reil` route defined** in `App.tsx`
- **No redirect** from `/q-reil` to `/reil`
- **Vercel project name** is `q-reil` (from proofs), but routes use `/reil`
- **Dev server** runs on port 5173/5174 (Vite default), not 3000

**Likely Failure Mode:**
- If someone tries to access `/q-reil`, it would:
  1. Hit Vercel rewrites (if deployed) → no rewrite rule for `/q-reil`
  2. Hit React Router → no route match → likely 404 or blank page
  3. **Root cause:** Route mismatch - `/q-reil` doesn't exist, canonical route is `/reil`

**Recommendation:** Add redirect from `/q-reil` → `/reil` and `/q-reil/*` → `/reil/*` if legacy paths are expected.

---

## 7. Navigation Structure

### 7.1 Top-Level Navigation

**Source:** `q-suite-ui/src/components/layout/Sidebar.tsx` lines 35-40

| Entry | Path | Icon | Badge |
|-------|------|------|-------|
| Home | `/` | HomeIcon | - |
| Q Control Center | `/dashboard` | LayoutDashboardIcon | - |
| Apps | `/apps` | Box | - |
| Q REIL | `/reil` | ZapIcon | 12 |

### 7.2 REIL Sub-Navigation

**Source:** `q-suite-ui/src/components/layout/Sidebar.tsx` lines 42-49

| Entry | Path | Icon | Badge |
|-------|------|------|-------|
| Overview | `/reil` | LayoutGridIcon | - |
| Inbox | `/reil/inbox` | MailIcon | 5 |
| Records | `/reil/records` | UsersIcon | - |
| Deals | `/reil/deals` | BriefcaseIcon | - |
| Documents | `/reil/documents` | FileTextIcon | - |
| Ledger | `/reil/ledger` | ClockIcon | - |

**Visibility:** REIL sub-nav shows only when `pathname.startsWith('/reil')`.

---

## 8. Redirect Plan Recommendation

### 8.1 Current Redirects (Already Implemented)

✅ Legacy flat routes → nested `/reil/*` routes:
- `/inbox` → `/reil/inbox`
- `/records` → `/reil/records`
- `/deals` → `/reil/deals`
- `/documents` → `/reil/documents`
- `/ledger` → `/reil/ledger`

### 8.2 Missing Redirects (Recommended)

❌ **Add redirects for `/q-reil` → `/reil`:**

```typescript
// In App.tsx, add before legacy redirects:
<Route path="q-reil" element={<Navigate to="/reil" replace />} />
<Route path="q-reil/:path*" element={<LegacyRedirect to="/reil" param="path" />} />
```

**Rationale:** Mission mentions `localhost:3000/q-reil` as a potential failure point. Adding redirects ensures any legacy `/q-reil` paths resolve correctly.

---

## 9. Evidence File Paths

| Evidence Type | Path |
|--------------|------|
| **Route definitions** | `q-suite-ui/src/App.tsx` |
| **Home launcher** | `q-suite-ui/src/pages/Home.tsx` |
| **Apps switcher** | `q-suite-ui/src/pages/Apps.tsx` |
| **AppSwitcher component** | `q-suite-ui/src/components/layout/AppSwitcher.tsx` |
| **Sidebar navigation** | `q-suite-ui/src/components/layout/Sidebar.tsx` |
| **AppShell layout** | `q-suite-ui/src/components/layout/AppShell.tsx` |
| **Vercel config** | `q-suite-ui/vercel.json` |
| **Brand constants** | `q-suite-ui/src/constants/brand.ts` |
| **Route documentation** | `docs/q-suite/ROUTE_MAP.md` |
| **IA/NAV spec** | `docs/q-suite/IA_NAV_SPEC.md` |
| **Screen index** | `docs/q-suite/SCREEN_INDEX.md` |

---

## 10. Summary & Recommendations

### 10.1 Key Findings

1. ✅ **Canonical repo:** `q-suite-ui/` (Vite/React SPA)
2. ✅ **Canonical routes:** `/reil`, `/reil/inbox`, `/reil/records`, etc.
3. ❌ **No module registry:** Apps hardcoded in components
4. ❌ **Q-ICMS:** Does not exist
5. ⚠️ **Q-CC:** Mentioned in docs as "QCC v2" (control plane), Dashboard is entry point
6. ❌ **`/q-reil` route:** Does not exist (canonical is `/reil`)
7. ✅ **Launcher exists:** Home page (`/`) acts as launcher but needs redesign per mission spec
8. ✅ **Legacy redirects:** Already implemented for flat → nested routes

### 10.2 Redirect Plan

**Add to `App.tsx`:**

```typescript
{/* Q-REIL legacy path redirects */}
<Route path="q-reil" element={<Navigate to="/reil" replace />} />
<Route path="q-reil/:path*" element={<LegacyRedirect to="/reil" param="path" />} />
```

### 10.3 Module Registry Recommendation

**Create:** `q-suite-ui/src/lib/modules.ts`

```typescript
export interface Module {
  id: string;
  name: string;
  description: string;
  route: string;
  status: 'active' | 'beta' | 'coming-soon';
  icon: LucideIcon;
}

export const modules: Module[] = [
  {
    id: 'reil',
    name: 'Q REIL',
    description: 'Commercial Real Estate package',
    route: '/reil',
    status: 'active',
    icon: ZapIcon,
  },
  {
    id: 'icms',
    name: 'Q ICMS',
    description: 'Information & Content Management System',
    route: '/icms',  // or '/q/icms'
    status: 'coming-soon',
    icon: FileTextIcon,
  },
  {
    id: 'cc',
    name: 'Q CC',
    description: 'Control Center',
    route: '/cc',  // or '/q/cc'
    status: 'beta',
    icon: SettingsIcon,
  },
];
```

### 10.4 Route Option Recommendation

**Option A:** `/reil`, `/icms`, `/cc` (recommended)
- ✅ Consistent with current `/reil` pattern
- ✅ Shorter URLs
- ✅ Already using `/reil` successfully

**Option B:** `/q/reil`, `/q/icms`, `/q/cc`
- ⚠️ Requires adding `/q` prefix to all routes
- ⚠️ More verbose
- ⚠️ No current precedent in codebase

**Recommendation:** **Option A** (`/reil`, `/icms`, `/cc`) for consistency and simplicity.

---

## 11. Next Steps

1. ✅ **Discovery complete** - This receipt
2. ⏭️ **Product Ops:** Design launcher spec and route model
3. ⏭️ **Engineering:** Implement module registry and launcher redesign
4. ⏭️ **Engineering:** Add `/q-reil` → `/reil` redirects
5. ⏭️ **Engineering:** Create Q-ICMS and Q-CC stub routes
6. ⏭️ **QA:** Validate routes load and navigation works

---

**End of Receipt**
