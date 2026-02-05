# REIL Thread Detail DB-Default Receipt

**Mission:** ENGDEL-QREIL-DB-READ-CUTOVER-0042  
**Deliverable:** Thread Detail reads from Supabase by default; seed data behind single flag  
**Date:** 2026-01-31

---

## Summary

REIL Thread Detail (`/reil/inbox/:threadId`) reads thread and messages from **Supabase by default**. Seed/mock data is used only when the dev fallback flag is enabled.

---

## Implementation

| Item | Detail |
|------|--------|
| **Data source (default)** | Supabase `mail_threads` (one) + `mail_messages` (by thread_id) |
| **Data source (fallback)** | Seed data in `src/data/seedInbox.ts` when `VITE_USE_INBOX_SEED_DATA=true` |
| **Flag** | `VITE_USE_INBOX_SEED_DATA` — same single flag as Inbox |
| **API** | `src/lib/inboxApi.ts` — `fetchThreadWithMessages(threadId)` |

---

## Verification (BEQA)

1. **Default (DB):** With `VITE_USE_INBOX_SEED_DATA` unset or `false`, and Supabase configured:
   - Navigating to `/reil/inbox/{uuid}` loads that thread from `mail_threads` and its messages from `mail_messages` (or shows loading / not found / error).
2. **Fallback (seed):** With `VITE_USE_INBOX_SEED_DATA=true`:
   - Any thread route shows seed subject and seed messages (e.g. thr-001 content).
3. After BEQA verification with real auth and data, UI shows real DB data for Thread Detail (subject + messages).

---

## States

- **Loading** — Fetching thread + messages from Supabase
- **Ready** — Displaying subject and message list (DB or seed)
- **Not found** — Invalid or missing threadId
- **Error** — API/Supabase error with retry

---

## Files Touched

- `q-suite-ui/src/lib/inboxApi.ts` — `fetchThreadWithMessages(threadId)`
- `q-suite-ui/src/types/inbox.ts` — MessageRow and DB row types
- `q-suite-ui/src/data/seedInbox.ts` — SEED_MESSAGES, SEED_THREAD_SUBJECT
- `q-suite-ui/src/pages/ThreadDetail.tsx` — use flag, fetch by threadId or seed

---

## Environment

Same as Inbox: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_USE_INBOX_SEED_DATA`.
