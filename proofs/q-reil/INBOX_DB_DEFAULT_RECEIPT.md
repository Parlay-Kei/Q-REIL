# REIL Inbox DB-Default Receipt

**Mission:** ENGDEL-QREIL-DB-READ-CUTOVER-0042  
**Deliverable:** Inbox reads from Supabase by default; seed data behind single flag  
**Date:** 2026-01-31

---

## Summary

REIL Inbox (`/reil/inbox`) reads thread list data from **Supabase by default**. Seed/mock data is used only when the dev fallback flag is enabled.

---

## Implementation

| Item | Detail |
|------|--------|
| **Data source (default)** | Supabase `mail_threads` + `record_links` |
| **Data source (fallback)** | Seed data in `src/data/seedInbox.ts` when `VITE_USE_INBOX_SEED_DATA=true` |
| **Flag** | `VITE_USE_INBOX_SEED_DATA` — set to `true` only for dev/seed mode |
| **Client** | `src/lib/supabase.ts` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) |
| **API** | `src/lib/inboxApi.ts` — `fetchThreads()` |

---

## Verification (BEQA)

1. **Default (DB):** With `VITE_USE_INBOX_SEED_DATA` unset or `false`, and Supabase URL/anon key configured:
   - Inbox shows loading state, then threads from `mail_threads` (or empty/error if none or auth failure).
2. **Fallback (seed):** With `VITE_USE_INBOX_SEED_DATA=true`:
   - Inbox shows seed thread list immediately; demo state switcher is visible.
3. After BEQA verification with real auth and data, UI shows real DB data for Inbox list.

---

## Files Touched

- `q-suite-ui/src/constants/inbox.ts` — `USE_INBOX_SEED_DATA` from env
- `q-suite-ui/src/lib/supabase.ts` — Supabase client
- `q-suite-ui/src/lib/inboxApi.ts` — fetch threads + record_links
- `q-suite-ui/src/types/inbox.ts` — ThreadRow and DB row types
- `q-suite-ui/src/data/seedInbox.ts` — SEED_THREADS (dev fallback)
- `q-suite-ui/src/pages/Inbox.tsx` — use flag, fetch from API or seed

---

## Environment

- `VITE_SUPABASE_URL` — Supabase project URL (required for DB mode)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (required for DB mode)
- `VITE_USE_INBOX_SEED_DATA` — `true` = use seed data only (dev fallback)
