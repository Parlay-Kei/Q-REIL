# ENGDEL-REIL-INBOX-UI-0012 Receipt

**Ticket:** ENGDEL-REIL-INBOX-UI-0012  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** Inbox shows raw items and normalized status; filters by sender, date, type, review required; open item detail with parsed fields and attachments.

---

## 1. Implemented Features

### 1.1 Raw items and normalized status

- **Inbox list (REIL Core):** When `VITE_USE_REIL_CORE_INBOX=true`, the Inbox page lists items from `source_items_raw` with a left-join to `source_items_normalized` to show **Normalized** vs **Raw** status per row.
- **Data:** `q-suite-ui/src/lib/reilDal.ts` — `listRawItemsWithNormalizedStatus()`, `getRawItemById()`, `getNormalizedItemByKey()`.
- **API:** `q-suite-ui/src/lib/reilInboxApi.ts` — `fetchReilInboxItems()`, `fetchReilInboxItemDetail()`.
- **Types:** `q-suite-ui/src/types/reil-core.ts` — `InboxItemRow`, `InboxItemDetail`.
- **UI:** `q-suite-ui/src/pages/Inbox.tsx` — when `USE_REIL_CORE_INBOX`, list shows raw items with badges: **Normalized** (success) or **Raw** (warning), plus type and **Review required** when `payload.review_required === true`.

### 1.2 Filters (sender, date, type, review required)

- **Sender:** Filter sidebar includes an optional “Sender” input; value is passed as `senderContains` to `listRawItemsWithNormalizedStatus()` (filters on payload `from` / `from_email`).
- **Date:** “Time Range” select (All time / Today / This week / This month) sets `dateFrom` / `dateTo` on `source_items_raw.created_at`.
- **Type:** “Type” select (Any type / Gmail / Message) sets `sourceType` filter.
- **Review required:** “Review required” select (Any / Review required only) sets `reviewRequired: true` filter (payload `review_required`).
- **Clear all filters:** Button resets `reilFilters` to `{}`.

### 1.3 Open item detail (parsed fields and attachments)

- **Route:** `/reil/inbox/item/:rawId` — `q-suite-ui/src/pages/ItemDetail.tsx`.
- **Data:** Fetches one raw item by id and optional normalized row by idempotency key via `fetchReilInboxItemDetail(rawId)`.
- **Parsed fields:** From payload, displayed in a “Parsed fields” card: From, To, Date, Subject, Body / Snippet (subject, from, from_email, to, date, body_plain, snippet).
- **Attachments:** Derived from `payload.attachment_metadata` or `payload.attachments`; listed with name, type, size, and optional document_id.
- **Raw payload:** Collapsible “Raw payload” JSON block for debugging.
- **Suggested links / Audit:** Right panel with suggested record links and audit (id, idempotency key, created, source).

---

## 2. Configuration

| Env | Purpose |
|-----|---------|
| `VITE_USE_REIL_CORE_INBOX` | When `true`, Inbox uses REIL Core (source_items_raw + normalized). When false, uses mail_threads (legacy). |
| `VITE_REIL_ORG_ID` | Default org_id for REIL Core queries. Required for REIL inbox and item detail. |

---

## 3. File Summary

| File | Role |
|------|------|
| `q-suite-ui/src/types/reil-core.ts` | `InboxItemRow`, `InboxItemDetail` |
| `q-suite-ui/src/lib/reilDal.ts` | `listRawItemsWithNormalizedStatus`, `getRawItemById`, `getNormalizedItemByKey` |
| `q-suite-ui/src/lib/reilInboxApi.ts` | `fetchReilInboxItems`, `fetchReilInboxItemDetail`, payload → display mapping |
| `q-suite-ui/src/constants/inbox.ts` | `USE_REIL_CORE_INBOX`, `REIL_DEFAULT_ORG_ID` |
| `q-suite-ui/src/pages/Inbox.tsx` | REIL Core list + filters; row click → `/reil/inbox/item/:rawId` |
| `q-suite-ui/src/pages/ItemDetail.tsx` | Item detail: parsed fields, attachments, raw payload |
| `q-suite-ui/src/App.tsx` | Route `/reil/inbox/item/:rawId` → `ItemDetail` |

---

## 4. Acceptance

- [x] Inbox shows raw items and normalized status (when REIL Core inbox enabled).
- [x] Filters by sender, date, type, review required.
- [x] Open item detail with parsed fields and attachments.
- [x] Receipt document (this file).
