# Q Suite Triage Plan — Brand & Render

**Mission:** OCS-QSUITE-BRAND-AND-RENDER-TRIAGE-0015  
**Date:** 2026-01-30  
**Issue:** Tab title shows "Q Suite Command Center UI" while the UI canvas is blank.

---

## Summary

Two-track plan: (1) restore shell visibility so the app renders instead of a blank white page; (2) implement a single naming canon used by title, sidebar, apps page, and routes.

---

## Track 1: Fix render failure (get shell visible)

### Likely causes (in order of check)

1. **Mount / entry**
   - Confirm `index.html` has `<div id="root"></div>` and script points to `/src/index.tsx`.
   - Confirm `index.tsx` uses `createRoot(document.getElementById('root'))` and renders `<App />`.

2. **Router config**
   - Confirm `App.tsx` wraps with `BrowserRouter`, `Routes`, and a layout route that renders `AppShell` with `<Outlet />`.
   - Confirm no route typo or `element={null}` that would render nothing.

3. **Missing or failing CSS**
   - Confirm `index.tsx` imports `./index.css`.
   - Confirm Tailwind + CSS variables load (e.g. no 404 on `index.css`, correct `content` in `tailwind.config.js`).
   - If CSS fails to load, the page can appear blank or unstyled (e.g. white background, invisible text).

4. **Component crash in AppShell or children**
   - A thrown error in `AppShell`, `Sidebar`, `CommandBar`, or any page component can leave the canvas blank if uncaught.
   - **Mitigation:** Add an Error Boundary at app root (e.g. in `App.tsx`) so errors show a fallback UI and optional error details instead of a blank screen.

5. **Port / process**
   - If the dev server runs on a different port (e.g. 5174 because 5173 is in use), opening `localhost:5173` may show another app or a blank page.
   - **Action:** Run Q Suite UI on 5173 (free the port if needed) or consistently use the port printed by `npm run dev`.

### Actions (Track 1)

- [x] Verify mount element and entry in `index.html` / `index.tsx`.
- [x] Verify router and `AppShell`/`Outlet` structure.
- [x] Verify CSS import and Tailwind config.
- [x] Add a root Error Boundary so a component crash shows a fallback UI instead of a blank canvas.
- [ ] Reproduce blank page (e.g. on 5173 vs 5174) and capture console/network errors; document root cause in `proofs/q-suite-ui/BOOT_RENDER_RECEIPT.md`.

---

## Track 2: Implement single naming canon

### Canon (single source of truth)

- **Shell / product name:** **Q Suite**  
- **Vendor / byline:** **by Strata Noble**  
- **Document title (default):** **Q Suite by Strata Noble**  
- **Remove:** Any "Command Center UI" label from the UI and titles.

### Where the canon is applied

| Location | Canon |
|----------|--------|
| `index.html` `<title>` | Q Suite by Strata Noble |
| Web app manifest `name` / `short_name` | Q Suite by Strata Noble (or "Q Suite") |
| AppShell / Sidebar | Suite name and byline from a single constants file |
| Apps page | Module and package names from same constants |
| Routes | Route-aware `document.title`: e.g. "Q Suite", "Q Control Center", "Q REIL" (and subviews per NAMING_CANON.md) |

### Actions (Track 2)

- [ ] Add a single constants file (e.g. `src/constants/brand.ts`) for suite name, byline, and app/module names.
- [ ] Set `index.html` title to "Q Suite by Strata Noble".
- [ ] Add or update manifest `name` and `short_name`.
- [ ] Use the constants in AppShell (Sidebar, CommandBar) and Apps page.
- [ ] Set route-aware `document.title` (Q Suite, Q Control Center, Q REIL) and remove "Command Center UI" everywhere.
- [ ] Document all brand touchpoints in `docs/q-suite/BRAND_SOURCES.md`.

---

## Deliverables

| Deliverable | Path |
|-------------|------|
| Triage plan (this doc) | `docs/q-suite/TRIAGE_PLAN.md` |
| Naming canon | `docs/q-suite/NAMING_CANON.md` |

---

## References

- [NAMING_CANON.md](./NAMING_CANON.md) — Canonical product naming
- [IA_NAV_SPEC.md](./IA_NAV_SPEC.md) — Suite IA and nav
- [ROUTE_MAP.md](./ROUTE_MAP.md) — Route map
