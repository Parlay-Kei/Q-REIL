# ENGDEL-REIL-INBOX-UI-0011 Receipt

**Mission:** ENGDEL-REIL-INBOX-UI-0011  
**Owner:** ENGDEL  
**Status:** Implemented  
**Deliverable:** Inbox reads seeded DB via DAL; shows normalized fields and link status; creates link when user selects record (record_links + ledger append).

---

## 1. Acceptance

- [x] **Inbox list renders from DB rows only, zero direct `.from()` calls**  
  When `VITE_USE_REIL_CORE_INBOX=true`, the Inbox list is loaded exclusively via `reilDal` (`listRawItemsWithNormalizedStatus`, `getRecordLinksBySource`, `getRecordById`). No direct `supabase.from()` in this path; legacy path uses `inboxApi` only when REIL Core is off.

- [x] **Thread detail loads and shows normalized fields**  
  Item detail at `/reil/inbox/item/:rawId` loads via `fetchReilInboxItemDetail` (DAL: `getRawItemById`, `getNormalizedItemByKey`, `getRecordLinksBySource`, `getRecordById`). Displays **match_status**, **item_confidence** (from normalized payload: `match_status`, `match_confidence` / `item_confidence`), parsed fields, and existing linked records.

- [x] **Linking a message to a record writes record_links and appends a ledger event**  
  "Link to record" in Item detail calls `linkSourceItemToRecord(supabase, orgId, 'message', rawId, recordId, 'manual')`, which: (1) upserts `record_links` (source_type=message, source_id=raw item id, target_type=record, target_id=record id); (2) calls `appendLedgerEvent(…, 'record_linked', 'record', recordId, { payload: { source_type, source_id } })`. Detail view refetches after link so timeline/links stay in sync.

---

## 2. Implemented Changes

### 2.1 Inbox list: join raw + normalized by idempotency_key

- **Before:** `reilInboxApi.fetchReilInboxItems` used `listRawItemsWithNormalizedStatus` only; `linkedRecord` was always `null` (TODO).
- **After:** After `listRawItemsWithNormalizedStatus`, we call `getRecordLinksBySource(supabase, orgId, 'message', rawIds)` and resolve record titles via `getRecordById`. Each list row shows `linkedRecord: { type: 'Record', name }` when a link exists.

### 2.2 Display match_status and item_confidence

- **Inbox list:** Each row shows badges/labels: **Match: &lt;match_status&gt;** (from normalized payload `match_status` or fallback `"matched"` when normalized), and **Conf: X%** (from normalized `item_confidence` or `match_confidence`, scaled 0–100).
- **Item detail:** Header shows **Match: &lt;match_status&gt;** and **Conf: X%**; audit section and parsed fields unchanged.

### 2.3 "Link to record" action

- **DAL:** `reilDal.linkSourceItemToRecord(client, orgId, sourceType, sourceId, recordId, linkMethod, opts?)` inserts/upserts `record_links` and calls `appendLedgerEvent(…, 'record_linked', 'record', recordId, { payload: { source_type, source_id } })`. Returns `{ linkId, eventId }`.
- **DAL:** `reilDal.getRecordLinksBySource(client, orgId, sourceType, sourceIds)` returns record_links for the given source type and ids (used for list and detail).
- **Item detail:** Right panel "Link to record" lists records from `searchRecordsByKeyFields`; button "Link to record" calls `linkSourceItemToRecord` then refetches item (so `linkedRecords` and ledger reflect the new link). Existing linked records shown in "Linked records" with link to record detail.

---

## 3. File Summary

| File | Change |
|------|--------|
| `q-suite-ui/src/lib/reilDal.ts` | Added `getRecordLinksBySource`, `linkSourceItemToRecord` (upsert record_links + appendLedgerEvent `record_linked`). |
| `q-suite-ui/src/lib/reilInboxApi.ts` | `fetchReilInboxItems`: join record_links by source, resolve record titles; map `matchStatus`, `itemConfidence` from normalized payload. `fetchReilInboxItemDetail`: add `matchStatus`, `itemConfidence`, `linkedRecords` (from getRecordLinksBySource + getRecordById). |
| `q-suite-ui/src/types/reil-core.ts` | `InboxItemRow`: added `matchStatus`, `itemConfidence`. `InboxItemDetail`: added `matchStatus`, `itemConfidence`, `linkedRecords`. |
| `q-suite-ui/src/pages/Inbox.tsx` | List row: display Match status badge and Conf % when present. |
| `q-suite-ui/src/pages/ItemDetail.tsx` | Header: match_status, item_confidence. Right panel: "Linked records" from item.linkedRecords; "Link to record" uses DAL records and `linkSourceItemToRecord`, refetch after link. |

---

## 4. Example Row Payload Excerpt (no secrets)

One example combined row shape used for the Inbox list (from DB + DAL join):

```json
{
  "id": "d0000000-0000-4000-8000-000000000001",
  "idempotencyKey": "gmail:seed-msg-001",
  "sourceType": "gmail",
  "normalized": true,
  "normalizedType": "message",
  "sender": "James Wilson <james@meridiancp.com>",
  "subject": "RE: Q3 Investment Proposal - Final Review",
  "preview": "Following up on our discussion...",
  "matchStatus": "matched",
  "itemConfidence": 0.9,
  "linkedRecord": { "type": "Record", "name": "Q3 Investment Proposal" }
}
```

Normalized payload in DB (seed) for that idempotency_key: `{"match_confidence": 0.9, "review_required": false}`. `match_status` is derived when not present (e.g. `"matched"` when normalized row exists).

---

## 5. Before / After (textual evidence)

- **Before:** Inbox REIL list had no link status per row; item detail had no match_status/item_confidence; "Link to record" was mock (suggestedMatches) and did not write to DB.
- **After:** Inbox list shows linked record and match/confidence; item detail shows normalized fields and existing links; "Link to record" upserts `record_links` and appends ledger event `record_linked`; record detail timeline shows the new event after linking (Step 2/3 timeline integration).

---

**Receipt:** proofs/reil-core/ENGDEL-REIL-INBOX-UI-0011-receipt.md
