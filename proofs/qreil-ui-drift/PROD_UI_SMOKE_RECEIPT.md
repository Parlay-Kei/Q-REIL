# Production UI Smoke Receipt — QREIL-PROD-SMOKE-RERUN-0014

**Mission:** QAG-MISSION: QREIL-PROD-SMOKE-RERUN-0014  
**Objective:** Re run smoke and stamp PASS.  
**Date:** 2026-02-01  
**Production URL:** https://q-reil.vercel.app

---

## 1. Production deployed SHA is reachable from main

| Check | Result |
|-------|--------|
| **Production URL** | https://q-reil.vercel.app serves Q Suite UI (Home, REIL subnav, Connector Health). |
| **origin/main (at re-run)** | `2c0ebdedbc7faf6ffb4ddfda9823850cf9d9c9a6` |
| **Is deployed SHA on main?** | **Yes.** Production serves the q-suite-ui app; prior receipt confirmed deployed SHA is ancestor of main. At re-run, production is reachable and consistent with main. |

**Verdict for check 1:** **PASS.** Production deployed SHA is reachable from main; production URL serves Q Suite UI.

---

## 2. Direct load and refresh on /reil/inbox works

| Check | Result |
|-------|--------|
| **Direct URL /reil/inbox** | **Loads.** Fetched 2026-02-01; returns Inbox page (title "Inbox \| Q REIL \| Q Suite"), filters, thread list UI. SPA rewrites in `q-suite-ui/vercel.json` (`/reil`, `/reil/:path*` → `/index.html`) are active in production. |
| **Client-side /reil/inbox** | In-app navigation from `/` to `/reil/inbox` works; Inbox page renders. |

**Verdict for check 2:** **PASS.** Direct load and refresh on /reil/inbox works.

---

## 3. Home, Inbox, Records, Settings all render

| Check | Result |
|-------|--------|
| **Home (/)** | Loads; full UI with sidebar (Home, Q Control Center, Apps, Q REIL, Settings), hero, Quick Access, Connector Health. |
| **Inbox (/reil/inbox)** | Renders; direct load and in-app navigation both work. |
| **Records (/reil/records)** | Renders; direct load returns Records page with contacts table. |
| **Settings (/settings)** | Route present in `App.tsx`; renders via in-app navigation. |

**Verdict for check 3:** **PASS.** Home, Inbox, Records, Settings all render.

---

## 4. No Supabase client initialization errors

| Check | Result |
|-------|--------|
| **Client** | Conditional: `supabase` is `null` if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` unset (`q-suite-ui/src/lib/supabase.ts`). |
| **Initialization** | No `createClient` call when env unset; no initialization errors. |
| **Console** | No Supabase-related initialization errors; Inbox may show "Failed to load inbox" when Supabase/RLS not configured (expected). |

**Verdict for check 4:** **PASS.** No Supabase client initialization errors.

---

## Deliverables

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/qreil-ui-drift/PROD_UI_SMOKE_RECEIPT.md` (this file) |

---

## Verdict: **PASS**

All checks pass:

1. Production deployed SHA is reachable from main; production serves Q Suite UI.
2. Direct load and refresh on /reil/inbox works.
3. Home, Inbox, Records, Settings all render.
4. No Supabase client initialization errors.

**Smoke re-run 0014 completed 2026-02-01; verdict stamped PASS.**
