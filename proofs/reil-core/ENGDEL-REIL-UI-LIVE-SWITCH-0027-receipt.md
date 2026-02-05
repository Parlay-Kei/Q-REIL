# ENGDEL-REIL-UI-LIVE-SWITCH-0027 — Receipt

**Mission:** ENGDEL-REIL-UI-LIVE-SWITCH-0027  
**Owner:** ENGDEL  
**Outcome:** Inbox and Records prefer real Gmail sourced rows when present; otherwise fall back to seeded rows.  
**Acceptance:** If gmail rows exist, Inbox shows them; if gmail rows do not exist, seeded rows still render; no direct Supabase calls in UI, DAL only.

---

## Implementation

| Area | Behavior |
|------|----------|
| **Inbox** | When REIL Core Inbox is enabled (`VITE_USE_REIL_CORE_INBOX=true`), data is fetched via `reilInboxApi` → DAL. If DAL returns 0 items, UI falls back to seed list (`seedThreadsAsReilItems`) so seeded rows still render. |
| **Records** | Data is always fetched via `reilRecordsApi` → DAL. No direct Supabase in UI. Seed data (from seed SQL) and Gmail-sourced records both come from DB through DAL. |
| **No direct Supabase in UI** | All reads go through `reilInboxApi` / `reilRecordsApi` → `reilDal`; no `supabase.from(...)` in page components. |

---

## Acceptance checklist

| Check | Result |
|-------|--------|
| If gmail rows exist, Inbox shows them (via DAL) | *(yes)* |
| If gmail rows do not exist, seeded rows still render (Inbox fallback or DB seed) | *(yes)* |
| No direct Supabase calls in UI; DAL only | *(yes)* |

---

## Paths updated

| Path | Change |
|------|--------|
| `q-suite-ui/src/data/seedInbox.ts` | Added `seedThreadsAsReilItems()` for Inbox fallback |
| `q-suite-ui/src/pages/Inbox.tsx` | When REIL Core and DAL returns 0 items, set display to seed fallback |

---

## References

- Kickoff: [docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md](../../docs/00_PROJECT/OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md)
- Ingest smoke: [QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md](QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md)
