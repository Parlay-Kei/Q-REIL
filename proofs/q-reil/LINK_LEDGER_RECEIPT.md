# Receipt: Linking Thread to Record Writes Ledger Event

**Mission:** QAG-QREIL-V0-1-CORE-LOOP-0029  
**Date:** 2026-01-31

---

## Claim

Linking a thread to a record writes a ledger event.

## Code Path

1. **UI:** `q-suite-ui/src/pages/ThreadDetail.tsx`
   - `handleLinkRecord(recordId, recordType, recordName)` calls `attachThreadToRecord(threadId, recordType, recordId, recordName, thread.subject)` and `setLinkedRecordIds(prev => new Set(prev).add(recordId))`.
   - Trigger: "Link to record" / "Link to other record" in Suggested Links panel.

2. **Context:** `q-suite-ui/src/data/SeedLoopContext.tsx`
   - `attachThreadToRecord(threadId, recordType, recordId, recordName, threadSubject)`:
     - Updates link state: `setThreadLinkedState(prev => ({ ...prev, [threadId]: { type: recordType, name: recordName, id: recordId } }))`.
     - Creates event: `const evt = createThreadAttachEvent(threadId, threadSubject, recordType, recordId, recordName)`.
     - Appends to ledger: `setLedgerEvents(prev => [evt, ...prev])`.

3. **Event shape:** `q-suite-ui/src/data/seedLoop.ts`
   - `createThreadAttachEvent(threadId, threadSubject, recordType, recordId, recordName)` returns:
     - `id`: `EVT-{Date.now()}-attach`
     - `type`: `'email'`
     - `title`: `'Thread attached to record'`
     - `description`: `Email thread "{subject}…" linked to {recordType} {recordName}`
     - `actor`: `'Current User'`
     - `timestamp`: `new Date().toISOString()`
     - `references`: `[threadId, recordId]`
     - `metadata`: `{ threadSubject, recordType, recordName, action: 'manual-link' }`

## Verification

- **Browser:** Thread detail `/reil/inbox/thr-001` shows Suggested Links with "Link to record" for Meridian Capital Partners (Deal). Clicking it would call `handleLinkRecord('deal-001', 'Deal', 'Meridian Capital Partners')` and add one ledger event.
- **Ledger:** `ActivityLedger` reads `ledgerEvents` from `useSeedLoop()`; new event appears at top of list.
- **Deal timeline:** `DealWorkspace` uses `getLedgerEventsForDealId(dealId)`; event with `references` containing dealId appears in Related activity.

**Receipt:** Code path and event shape verified. Link → ledger event and timeline update satisfied.
