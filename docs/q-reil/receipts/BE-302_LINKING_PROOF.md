# BE-302 — Linking Proof

**Mission ID:** QREIL BE-302  
**Owner:** backend-dev  
**Brief:** Implement record types Contact, Company, Property, Deal plus manual linking. Add auto-link rules only when unambiguous. Emit ledger events for auto attach and manual attach. Expose endpoints for linking actions. Provide minimal CRUD for records required to attach emails. (PRD_Q_REIL_v0.1 §6 MVP scope: record types, linking; §10 DoD #4 ledger events for linking, DoD #6 manual attach.)

---

## Acceptance (must all be true)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | User can create a Contact and attach a thread to it | ☑ |
| 2 | Ledger records the attach action | ☑ |
| 3 | Auto link only triggers when unambiguous and never links to Deal when ambiguous | ☑ |
| 4 | No duplicates and no sensitive data in ledger | ☑ |

---

## Dependencies

- **IMPL-900:** Inbox shows real threads; thread detail loads real messages.
- **BE-301:** Real data in `mail_threads`, `mail_messages`; sync populates threads.

---

## Implementation Summary

### Record Types (minimal CRUD)

- **Tables:** `contacts`, `companies`, `properties`, `deals` (migration `00033_create_record_tables.sql`).
- **Contacts:** `id`, `org_id`, `name`, `email`, `created_at`, `updated_at`. Email used for unambiguous auto-link.
- **Companies, properties, deals:** `id`, `org_id`, `name`, `created_at`, `updated_at`.

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/q-reil/records/contacts` | GET | List contacts for org. |
| `/api/q-reil/records/contacts` | POST | Create contact (body: `name`, optional `email`). |
| `/api/q-reil/records/companies` | GET / POST | List / create companies. |
| `/api/q-reil/records/properties` | GET / POST | List / create properties. |
| `/api/q-reil/records/deals` | GET / POST | List / create deals. |
| `/api/q-reil/link/attach` | POST | Manual attach: link thread/message to record. Body: `sourceType`, `sourceId`, `targetType`, `targetId`. Inserts `record_links`, emits `link.manual_attach`. |
| `/api/q-reil/link/auto` | POST | Run auto-link for a thread. Body: `threadId`. Only when unambiguous (exactly one Contact match); never links to Deal. Emits `link.auto_attach` when a link is created. |

### Manual Attach

- **Flow:** User calls `POST /api/q-reil/link/attach` with `sourceType: "thread"`, `sourceId: <thread_id>`, `targetType: "contact"`, `targetId: <contact_id>`.
- **Validation:** Thread and target record must belong to user’s org. Source types: `thread`, `message`. Target types: `contact`, `company`, `property`, `deal`.
- **Insert:** `record_links` with `link_method: "manual"`, `linked_by: user.id`.
- **Ledger:** `link.manual_attach` with payload: `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method: "manual"`. No sensitive data.

### Auto-Link Rules

- **Rule:** Contact email unambiguous. For a thread, if exactly one Contact in org has `email` in the thread’s `participant_emails`, create link with `link_method: "system"`, `rule_name: "contact_email_unambiguous"`.
- **Never:** Auto-link never creates a link to Deal. Only Contact is auto-linked when unambiguous.
- **When:** Triggered via `POST /api/q-reil/link/auto` with `threadId`. Can be called after sync or on demand.
- **Ledger:** When a link is created, emit `link.auto_attach` with payload: `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method: "system"`, `rule_name`. No sensitive data.

### Ledger Events (linking)

- **Table:** `public.events`.
- **Events:**
  - `link.manual_attach` — payload: `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method: "manual"`. Actor: user.
  - `link.auto_attach` — payload: `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method: "system"`, `rule_name`. Actor: system.

Payloads contain only references/ids; no email bodies or other sensitive content (AUD-401).

### No Duplicates

- `record_links` has unique constraint `(source_type, source_id, target_type, target_id)`. Manual attach returns 409 if link already exists. Auto-link skips if thread already has a link.

### No Sensitive Data in Ledger

- Linking payloads: `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method`, `rule_name` (for auto). No body_plain, body_html, or PII beyond ids.

---

## Code Locations

| Item | Location |
|------|----------|
| Record tables migration | `docs/02_DATA/migrations/00033_create_record_tables.sql` |
| Ledger events (linking) | `q-reil/lib/ledger/linking.ts` |
| Manual attach API | `q-reil/app/api/q-reil/link/attach/route.ts` |
| Auto-link logic | `q-reil/lib/records/auto-link.ts` |
| Auto-link API | `q-reil/app/api/q-reil/link/auto/route.ts` |
| Contacts CRUD | `q-reil/app/api/q-reil/records/contacts/route.ts` |
| Companies CRUD | `q-reil/app/api/q-reil/records/companies/route.ts` |
| Properties CRUD | `q-reil/app/api/q-reil/records/properties/route.ts` |
| Deals CRUD | `q-reil/app/api/q-reil/records/deals/route.ts` |

---

## How to Verify

1. Apply migration `00033_create_record_tables.sql` so `contacts`, `companies`, `properties`, `deals` exist.
2. Create a Contact: `POST /api/q-reil/records/contacts` with auth, body `{ "name": "Jane", "email": "jane@example.com" }`. Confirm 201 and `contact.id`.
3. Attach a thread to the contact: `POST /api/q-reil/link/attach` with auth, body `{ "sourceType": "thread", "sourceId": "<thread_id>", "targetType": "contact", "targetId": "<contact_id>" }`. Confirm 201 and `link_id`.
4. Check `events` table: one row with `event_type = 'link.manual_attach'` and payload containing `link_id`, `source_type`, `source_id`, `target_type`, `target_id`, `link_method: "manual"`.
5. Run auto-link for a thread that has exactly one Contact whose email is in the thread’s participant_emails: `POST /api/q-reil/link/auto` with body `{ "threadId": "<id>" }`. When a link is created, confirm `events` has `link.auto_attach` and that no auto-link ever targets Deal.
6. Confirm no duplicate links: same (source_type, source_id, target_type, target_id) returns 409 on manual attach; auto-link does not create a second link for the same thread.

---

**Receipt status:** Implementation complete. Build passes. Acceptance criteria satisfied.
