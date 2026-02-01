# Brand Scope Fix Receipt — ENGDEL-QSUITE-BRAND-SCOPE-FIX-0023

**Mission:** ENGDEL-QSUITE-BRAND-SCOPE-FIX-0023  
**Date:** 2026-01-30  
**Scope:** Remove any remaining "Command Center UI" naming; implement route-aware tab title rules using `brand.ts` constants.

---

## Verdict: **COMPLETE**

- No "Command Center UI" remains in `index.html`, manifest, header lockups, or visible UI strings (verified via grep in `q-suite-ui` and static assets).
- Route-aware tab titles are implemented using `brand.ts` constants; all routes set `document.title` and restore on unmount.
- `index.html` and manifest are aligned with `DEFAULT_DOCUMENT_TITLE`; `index.html` includes a comment tying it to `brand.ts`.

---

## 1. Removal of "Command Center UI"

| Surface | Status | Notes |
|--------|--------|--------|
| **index.html title** | ✅ Clean | `<title>Q Suite by Strata Noble</title>`; comment added that it must match `brand.ts` DEFAULT_DOCUMENT_TITLE |
| **Manifest** | ✅ Clean | `q-suite-ui/public/manifest.json`: `name` / `short_name` use "Q Suite by Strata Noble" / "Q Suite" |
| **Header lockups** | ✅ Clean | CommandBar and Sidebar use `SUITE_NAME`, `SUITE_BYLINE`, `REIL_APP_NAME`, `CONTROL_CENTER_NAME` from `brand.ts` — no "Command Center UI" |
| **Visible UI strings** | ✅ Clean | Grep of `q-suite-ui` source (ts/tsx/html/json) shows no "Command Center" or "CommandCenter" |

---

## 2. Route-aware tab title rules (brand.ts)

All tab titles are driven by `q-suite-ui/src/constants/brand.ts`:

| Route | Constant / Rule | Example tab title |
|-------|-----------------|--------------------|
| `/` | `TITLE_HOME` | Q Suite |
| `/dashboard` | `TITLE_CONTROL_CENTER` | Q Control Center \| Q Suite |
| `/apps` | `TITLE_APPS` | Apps \| Q Suite |
| `/settings` | `TITLE_SETTINGS` | Settings \| Q Suite |
| `/reil` | `TITLE_REIL_OVERVIEW` | Q REIL · Overview \| Q Suite |
| `/reil/inbox` | `TITLE_REIL_SUBVIEW('Inbox')` | Inbox \| Q REIL \| Q Suite |
| `/reil/inbox/:threadId` | `TITLE_REIL_THREAD` | Thread \| Q REIL \| Q Suite |
| `/reil/records`, `/reil/deals` | `TITLE_REIL_SUBVIEW(pageLabel)` | Contacts \| Q REIL \| Q Suite (or Deals) |
| `/reil/deals/:dealId` | `TITLE_REIL_DEAL(dealName)` | {Deal Name} \| Q REIL \| Q Suite |
| `/reil/documents` | `TITLE_REIL_SUBVIEW('Documents')` | Documents \| Q REIL \| Q Suite |
| `/reil/ledger` | `TITLE_REIL_SUBVIEW('Ledger')` | Ledger \| Q REIL \| Q Suite |

- **Default / fallback:** `DEFAULT_DOCUMENT_TITLE` ("Q Suite by Strata Noble") — used in `index.html`, ErrorBoundary, and as restore value when leaving a route.
- **Implementation:** Each page sets `document.title` in a `useEffect` and restores `DEFAULT_DOCUMENT_TITLE` in the cleanup.

---

## 3. Changes made in this fix

1. **brand.ts**
   - Added `TITLE_APPS` and `TITLE_SETTINGS`.
   - Added JSDoc block documenting the route → document.title mapping.

2. **Apps.tsx**
   - Import `DEFAULT_DOCUMENT_TITLE`, `TITLE_APPS`; `useEffect` to set `document.title = TITLE_APPS` and restore on unmount.

3. **Settings.tsx**
   - Import `DEFAULT_DOCUMENT_TITLE`, `TITLE_SETTINGS`; `useEffect` to set `document.title = TITLE_SETTINGS` and restore on unmount.

4. **index.html**
   - Comment above `<title>`: must match `brand.ts` DEFAULT_DOCUMENT_TITLE (Q Suite by Strata Noble).

5. **manifest.json**
   - No change; already correct.

---

## 4. Evidence / references

- **Canon:** [docs/q-suite/NAMING_CANON.md](../../docs/q-suite/NAMING_CANON.md), [docs/q-suite/BRAND_SOURCES.md](../../docs/q-suite/BRAND_SOURCES.md)
- **Constants:** `q-suite-ui/src/constants/brand.ts`
- **Verdict:** [BRAND_SCOPE_VERDICT.md](./BRAND_SCOPE_VERDICT.md)
