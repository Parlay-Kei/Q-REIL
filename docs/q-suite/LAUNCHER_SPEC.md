# Q Suite Launcher Specification

**Mission:** PRODOPS-QSUITE-LAUNCHER-IA-0002  
**Owner:** Product Operations  
**Date:** 2026-02-09  
**Status:** Approved

---

## 1. Overview

The Q Suite launcher is the home page (`/`) that provides access to all Q Suite modules. It displays module tiles with status badges and appropriate call-to-action buttons based on module availability.

---

## 2. Layout

### 2.1 Page Structure

- **Route:** `/` (Home)
- **Layout:** Grid of module tiles
- **No splash styling:** Remove hero panels, KPIs, activity timelines, and connector health cards
- **Focus:** Clean, tile-based launcher interface

### 2.2 Tile Grid

- **Grid layout:** Responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop)
- **Tile spacing:** Consistent gap between tiles
- **Tile size:** Uniform tile dimensions with hover effects

---

## 3. Module Tiles

### 3.1 Tile Components

Each tile includes:
- **Title:** Module name (e.g., "Q REIL")
- **Description:** One-line purpose statement
- **Status badge:** Visual indicator (Active, Beta, Coming Soon)
- **CTA button:** Label changes based on status

### 3.2 Module Definitions

#### Q REIL
- **Title:** Q REIL
- **Description:** Commercial Real Estate package
- **Status:** Active
- **CTA Label:** Open
- **Route:** `/reil`
- **Icon:** ZapIcon (lightning bolt)

#### Q CC
- **Title:** Q CC
- **Description:** Control Center for users, roles, connectors, and system health
- **Status:** Beta (or Coming Soon if not yet available)
- **CTA Label:** Open Beta (if Beta) or View Roadmap (if Coming Soon)
- **Route:** `/cc` (or `/dashboard` if using Dashboard as entry point)
- **Icon:** LayoutDashboardIcon (dashboard)

#### Q ICMS
- **Title:** Q ICMS
- **Description:** Information & Content Management System
- **Status:** Coming Soon
- **CTA Label:** View Roadmap
- **Route:** N/A (disabled)
- **Icon:** FileTextIcon (document)

---

## 4. Status Badges

### 4.1 Badge Types

| Status | Badge Label | Visual Style | Color |
|--------|-------------|--------------|-------|
| **Active** | Active | Success indicator | Green/Cyan |
| **Beta** | Beta | Warning indicator | Yellow/Orange |
| **Coming Soon** | Coming Soon | Info indicator | Gray/Blue |

### 4.2 Badge Placement

- Position: Top-right corner of tile or below title
- Size: Small, readable badge
- Style: Rounded badge with appropriate color coding

---

## 5. Call-to-Action (CTA) Labels

### 5.1 CTA by Status

| Status | CTA Label | Action |
|--------|-----------|--------|
| **Active** | Open | Navigate to module route |
| **Beta** | Open Beta | Navigate to module route |
| **Coming Soon** | View Roadmap | Navigate to roadmap page or show Coming Soon panel |

### 5.2 CTA Behavior

- **Active/Beta:** Clicking tile or CTA navigates to module route
- **Coming Soon:** Clicking tile or CTA shows roadmap or Coming Soon message (does not navigate to dead page)

---

## 6. Navigation Labels

### 6.1 Suite Navigation

| Label | Route | Notes |
|-------|-------|-------|
| Home | `/` | Launcher page |
| Dashboard | `/dashboard` | Suite overview (if separate from Q CC) |
| Apps | `/apps` | App switcher (optional, if keeping separate from launcher) |
| Settings | `/settings` | Suite settings |

### 6.2 Module Navigation

| Module | Route | Sub-routes |
|--------|-------|------------|
| Q REIL | `/reil` | `/reil/inbox`, `/reil/records`, `/reil/deals`, `/reil/documents`, `/reil/ledger` |
| Q CC | `/cc` or `/dashboard` | TBD |
| Q ICMS | N/A | Coming Soon |

---

## 7. Interaction Rules

### 7.1 Active Modules

- **Click behavior:** Navigate to module route immediately
- **Hover state:** Visual feedback (elevation, border highlight)
- **Keyboard:** Accessible via Tab navigation, Enter to activate

### 7.2 Beta Modules

- **Click behavior:** Navigate to module route (same as Active)
- **Visual indicator:** Beta badge clearly visible
- **Warning:** May show beta disclaimer on first visit

### 7.3 Coming Soon Modules

- **Click behavior:** 
  - Option A: Navigate to `/roadmap` page
  - Option B: Show modal/panel with "Coming Soon" message and roadmap link
  - **Must not:** Navigate to a dead/blank page
- **Visual state:** Disabled appearance (reduced opacity, no hover elevation)
- **CTA:** "View Roadmap" button is clickable even if tile appears disabled

---

## 8. Exact Copy

### 8.1 Q REIL Tile

```
Title: Q REIL
Description: Commercial Real Estate package
Status Badge: Active
CTA Label: Open
```

### 8.2 Q CC Tile

```
Title: Q CC
Description: Control Center for users, roles, connectors, and system health
Status Badge: Beta (or Coming Soon)
CTA Label: Open Beta (if Beta) or View Roadmap (if Coming Soon)
```

### 8.3 Q ICMS Tile

```
Title: Q ICMS
Description: Information & Content Management System
Status Badge: Coming Soon
CTA Label: View Roadmap
```

---

## 9. Route Not Found Handling

### 9.1 404 Page Behavior

When a route is not found:
- Display "Route not found" message
- List available module routes as suggestions
- Provide links to valid routes (Home, Q REIL, Q CC if available)
- Do not show blank failure page

### 9.2 Suggested Routes Display

```
Route not found: /invalid-path

Available routes:
• Home (/)
• Q REIL (/reil)
• Q CC (/cc) [if available]
• Settings (/settings)
```

---

## 10. Acceptance Criteria

- ✅ Home (`/`) is the launcher
- ✅ Three tiles displayed: Q REIL (Active), Q CC (Beta or Coming Soon), Q ICMS (Coming Soon)
- ✅ Each tile includes: title, one-line purpose, status badge, CTA label
- ✅ CTA labels change by status: Active → "Open", Beta → "Open Beta", Coming Soon → "View Roadmap"
- ✅ Layout guidance provided for disabled modules
- ✅ Interaction rules defined for disabled modules
- ✅ Exact copy provided for each tile and nav labels

---

## 11. Implementation Notes

- Remove splash/hero styling from Home page
- Use module registry (`src/lib/modules.ts`) as single source of truth
- Status badges should be visually distinct
- Coming Soon tiles should not navigate to dead pages
- Route not found page should suggest valid module routes

---

## 12. References

- **Naming Canon:** [NAMING_CANON.md](./NAMING_CANON.md)
- **IA/NAV Spec:** [IA_NAV_SPEC.md](./IA_NAV_SPEC.md)
- **Route Map:** [ROUTE_MAP.md](./ROUTE_MAP.md)
