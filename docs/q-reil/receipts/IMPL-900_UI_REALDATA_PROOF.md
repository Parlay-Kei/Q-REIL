# IMPL-900 — Inbox UI Real Data Proof

**Mission ID:** QREIL IMPL-900  
**Owner:** frontend-dev  
**Brief:** Wire /q-reil/inbox to real API endpoints backed by DB. Render real threads and open a thread detail page. No mock data. Minimal UI only. Show linked vs unlinked status if available. (PRD_Q_REIL_v0.1 §6 MVP scope: Inbox UI; §10 DoD #5 Inbox UI real data.)

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Inbox shows real threads from DB | ☑ |
| 2 | Thread detail loads real messages | ☑ |
| 3 | Build passes | ☑ |
| 4 | No UI polish beyond functional display | ☑ |
| 5 | Linked vs unlinked status shown when available | ☑ |

---

## Dependencies

- **BE-301** must have real data (threads/messages in `mail_threads`, `mail_messages`). Inbox and thread detail read from the same DB; if BE-301 has not run sync, the list will be empty.

---

## Implementation Summary

### API Endpoints

| Endpoint | Method | Purpose |
|---------|--------|---------|
| `/api/q-reil/inbox/threads` | GET | List threads for the authenticated user’s org. Returns `threads[]` with `id`, `subject`, `snippet`, `last_message_at`, `message_count`, `has_attachments`, `linked`. |
| `/api/q-reil/inbox/threads/[id]` | GET | Thread detail for `id`. Returns `thread` (same shape + `linked`) and `messages[]` with `id`, `from_email`, `from_name`, `subject`, `snippet`, `sent_at`, `has_attachments`. |

- Both require auth (session). Org is resolved via `users.org_id`. Data is read with service client filtered by `org_id` so RLS/JWT custom claims are not required for reads.
- **Linked** = exists a row in `record_links` with `source_type = 'thread'` and `source_id = thread.id`.

### UI Routes

| Route | Purpose |
|-------|---------|
| `/q-reil/inbox` | Inbox page: Connect Gmail, Sync, and list of threads (real data). Each row shows subject, snippet, message count, last message time, and Linked/Unlinked. Click row → thread detail. |
| `/q-reil/inbox/thread/[id]` | Thread detail page: thread subject/snippet and list of messages (from DB). Back link to Inbox. Linked/Unlinked badge. |

- No mock or fixture data; all data from DB via the APIs above.
- Minimal UI: functional display only (no polish).

---

## Code Locations

| Item | Location |
|------|----------|
| Threads list API | `q-reil/app/api/q-reil/inbox/threads/route.ts` |
| Thread detail API | `q-reil/app/api/q-reil/inbox/threads/[id]/route.ts` |
| Inbox page | `q-reil/app/q-reil/inbox/page.tsx` |
| Thread detail page | `q-reil/app/q-reil/inbox/thread/[id]/page.tsx` |

---

## Verification

1. **Build:** `npm run build` in `q-reil` passes (TypeScript and Next.js build).
2. **Inbox:** With a connected mailbox and BE-301 sync run, open `/q-reil/inbox`. Thread list shows real threads; each row shows Linked or Unlinked.
3. **Thread detail:** Click a thread; `/q-reil/inbox/thread/[id]` shows thread subject and real messages from DB.
4. **No mock data:** No fixtures or hardcoded thread/message arrays; all data from `mail_threads`, `mail_messages`, and `record_links`.

---

**Receipt status:** Implementation complete. Build passes. Acceptance criteria satisfied.
