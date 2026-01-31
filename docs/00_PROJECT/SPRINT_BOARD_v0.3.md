# REIL-Q Sprint 0.3 Board: Gmail-First Running Loop

**Sprint Goal**: Gmail OAuth → Ingestion → Ledger → UI → Attach workflow
**Provider**: Gmail (Google APIs) - Microsoft Graph deferred to Sprint 1.2/1.3
**Working Directory**: d:\REIL-Q
**Key Document**: d:\REIL-Q\REIL-Q\00_PROJECT\Execution-Packet_v0.2-Gmail.md
**PRD (scope + DoD):** [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md) — §6 MVP Scope, §10 Definition of Done (missions must reference both or are rejected; see [OCS_RULES](../q-reil/OCS_RULES.md))

---

## Sprint Status

- **Start Date**: 2025-12-31
- **Target Completion**: TBD
- **Current Milestone**: M0
- **Critical Path**: M0 → M1 [GATE] → M2 → M3 → M4 → M5 → M6

---

## Kanban Board

### BACKLOG

#### M0-001: Create monorepo structure
- **Owner**: github-admin + codebase-admin
- **Dependencies**: None
- **Effort**: 2h
- **Description**: Initialize REIL-Q repository with apps/platform and packages/ui directories
- **Binary Check**: Directory structure exists, package.json files present
- **Status**: BACKLOG

#### M0-002: Copy UI kit from DSLV
- **Owner**: codebase-admin
- **Dependencies**: M0-001
- **Effort**: 3h
- **Description**: Transplant components, CSS, fonts, utilities from DSLV to packages/ui
- **Binary Check**: UI components compile, no broken imports
- **Status**: BACKLOG

#### M0-003: Replace brand tokens DSLV → REIL/Q
- **Owner**: frontend-dev
- **Dependencies**: M0-002
- **Effort**: 2h
- **Description**: Update colors, typography, logos, app name throughout codebase
- **Binary Check**: No DSLV references in code, REIL/Q branding visible
- **Status**: BACKLOG

#### M0-004: Add application routes
- **Owner**: frontend-dev
- **Dependencies**: M0-003
- **Effort**: 4h
- **Description**: Create routes: /pipeline, /record/:id, /docs, /inbox, /tasks, /admin/ledger, /admin/connectors
- **Binary Check**: All routes render without 404, navigation works
- **Status**: BACKLOG

#### M0-005: Setup CI gates (lean)
- **Owner**: infra-deployment-specialist
- **Dependencies**: M0-004
- **Effort**: 2h
- **Description**: Add GitHub Actions or similar for build checks
- **Binary Check**: CI runs on push, blocks merge on failure
- **Status**: BACKLOG

#### M0-006: Inbox renders fixtures
- **Owner**: frontend-dev
- **Dependencies**: M0-004
- **Effort**: 3h
- **Description**: Create fixture data provider for /inbox with mock threads and messages
- **Binary Check**: npm run build passes, /inbox renders fixture threads
- **Status**: BACKLOG

---

#### M1-001: Google Cloud project setup
- **Owner**: infra-deployment-specialist
- **Dependencies**: M0-006 (M0 complete)
- **Effort**: 2h
- **Description**: Create GCP project, enable Gmail API, configure OAuth consent screen
- **Binary Check**: OAuth consent screen approved, redirect URI registered
- **Status**: BACKLOG

#### M1-002: Add test user Ashley
- **Owner**: infra-deployment-specialist
- **Dependencies**: M1-001
- **Effort**: 0.5h
- **Description**: Add Ashley's email to test users in OAuth consent screen
- **Binary Check**: Ashley can access consent flow without "unverified app" warning
- **Status**: BACKLOG

#### M1-003: Auth endpoints (start + callback)
- **Owner**: backend-dev
- **Dependencies**: M1-002
- **Effort**: 4h
- **Description**: Implement GET /api/connectors/gmail/oauth/start and callback handler
- **Binary Check**: Start endpoint redirects to Google, callback receives code
- **Status**: BACKLOG

#### M1-004: Token storage + encryption
- **Owner**: backend-dev
- **Dependencies**: M1-003
- **Effort**: 3h
- **Description**: Store refresh token (encrypted), handle access token ephemeral storage
- **Binary Check**: Tokens stored in DB encrypted, decrypt test passes
- **Status**: BACKLOG

#### M1-005: Disconnect endpoint
- **Owner**: backend-dev
- **Dependencies**: M1-004
- **Effort**: 1h
- **Description**: Implement DELETE /api/connectors/gmail/oauth/disconnect
- **Binary Check**: Disconnect removes tokens, revokes access with Google
- **Status**: BACKLOG

#### M1-006: OAuth proof documentation
- **Owner**: backend-dev
- **Dependencies**: M1-005
- **Effort**: 1h
- **Description**: Create proof document at /docs/proofs/oauth/2025-12-31_gmail-oauth-proof.md
- **Binary Check**: Proof includes screenshots, token flow diagram, test results
- **Status**: BACKLOG

#### M1-007: E2E OAuth flow test [GATE]
- **Owner**: backend-qa-automation-tester
- **Dependencies**: M1-006
- **Effort**: 2h
- **Description**: Full test: Click "Connect Gmail" → Google consent → Callback → Shows "Connected" with mailbox identity
- **Binary Check**: Test passes, mailbox identity displayed, tokens persisted
- **Status**: BACKLOG
- **GATE**: Sprint cannot proceed to M2 until this passes

---

#### M2-001: Pull-based sync architecture
- **Owner**: backend-dev
- **Dependencies**: M1-007 [GATE]
- **Effort**: 4h
- **Description**: Implement sync service with cursor logic (q=newer_than:30d)
- **Binary Check**: Sync service can be invoked, cursor persists between runs
- **Status**: BACKLOG

#### M2-002: Fetch threads → thread details → messages
- **Owner**: backend-dev
- **Dependencies**: M2-001
- **Effort**: 5h
- **Description**: Call Gmail API: list threads, get thread details, parse message payload
- **Binary Check**: Raw API responses logged, message count matches Gmail UI
- **Status**: BACKLOG

#### M2-003: Database schema for threads + messages
- **Owner**: supabase-admin
- **Dependencies**: M2-001
- **Effort**: 2h
- **Description**: Create tables: gmail_threads, gmail_messages with unique constraints
- **Binary Check**: Schema deployed, unique constraints on threadId/messageId
- **Status**: BACKLOG

#### M2-004: Persist headers, snippet, metadata
- **Owner**: backend-dev
- **Dependencies**: M2-002, M2-003
- **Effort**: 3h
- **Description**: Save headers, snippet, internalDate, labels, threadId, messageId to DB
- **Binary Check**: Data persists, headers JSON valid, dates correctly formatted
- **Status**: BACKLOG

#### M2-005: Dedupe logic (upsert on messageId)
- **Owner**: backend-dev
- **Dependencies**: M2-004
- **Effort**: 2h
- **Description**: Implement upsert logic to prevent duplicate messages
- **Binary Check**: Re-ingesting same message updates row, doesn't create duplicate
- **Status**: BACKLOG

#### M2-006: POST /api/connectors/gmail/sync endpoint
- **Owner**: backend-dev
- **Dependencies**: M2-005
- **Effort**: 2h
- **Description**: Create sync trigger endpoint with optional ?range=30d parameter
- **Binary Check**: Endpoint returns 202, sync job initiated
- **Status**: BACKLOG

#### M2-007: 30-day ingestion test
- **Owner**: backend-qa-automation-tester
- **Dependencies**: M2-006
- **Effort**: 3h
- **Description**: Run full 30-day sync on Ashley's mailbox, verify data
- **Binary Check**: Sync completes, tables populated, re-run doesn't inflate count
- **Status**: BACKLOG

---

#### M3-001: Define ledger event schema
- **Owner**: backend-dev
- **Dependencies**: M2-007
- **Effort**: 1h
- **Description**: Define event types: MAILBOX_CONNECTED, INGESTION_STARTED, THREAD_INGESTED, MESSAGE_INGESTED, INGESTION_COMPLETED
- **Binary Check**: Schema documented, event payload examples provided
- **Status**: BACKLOG

#### M3-002: Emit MAILBOX_CONNECTED
- **Owner**: backend-dev
- **Dependencies**: M3-001
- **Effort**: 1h
- **Description**: Emit event on successful OAuth callback with mailbox identity
- **Binary Check**: Event appears in ledger table with correct payload
- **Status**: BACKLOG

#### M3-003: Emit INGESTION_STARTED/COMPLETED
- **Owner**: backend-dev
- **Dependencies**: M3-001
- **Effort**: 1h
- **Description**: Emit events at sync start and completion with batch_id
- **Binary Check**: Events bookend sync runs, batch_id matches
- **Status**: BACKLOG

#### M3-004: Emit THREAD_INGESTED/MESSAGE_INGESTED
- **Owner**: backend-dev
- **Dependencies**: M3-001
- **Effort**: 2h
- **Description**: Emit events for each thread and message processed
- **Binary Check**: Event count matches ingested record count
- **Status**: BACKLOG

#### M3-005: Optional dedupe events
- **Owner**: backend-dev
- **Dependencies**: M3-004
- **Effort**: 1h
- **Description**: Emit SYNC_DEDUP_SKIPPED, ATTACHMENT_LINKED (prep for M5)
- **Binary Check**: Dedupe events appear when messages skipped
- **Status**: BACKLOG

#### M3-006: Ledger admin UI
- **Owner**: frontend-dev
- **Dependencies**: M3-005
- **Effort**: 4h
- **Description**: Create /admin/ledger view showing events filtered by mailbox and batch_id
- **Binary Check**: /admin/ledger renders events, filters work, events tied to correct mailbox
- **Status**: BACKLOG

---

#### M4-001: Replace fixture provider with DB query
- **Owner**: frontend-dev
- **Dependencies**: M3-006
- **Effort**: 3h
- **Description**: Update Inbox component to fetch threads from gmail_threads table
- **Binary Check**: Inbox renders real data instead of fixtures
- **Status**: BACKLOG

#### M4-002: Thread list UI (subject, date, snippet, participants)
- **Owner**: frontend-dev
- **Dependencies**: M4-001
- **Effort**: 3h
- **Description**: Display thread metadata in list view matching Gmail conventions
- **Binary Check**: All fields render correctly, sorted by date descending
- **Status**: BACKLOG

#### M4-003: Thread detail view (message list)
- **Owner**: frontend-dev
- **Dependencies**: M4-002
- **Effort**: 4h
- **Description**: Show expanded message list when thread clicked
- **Binary Check**: Messages display in chronological order, headers visible
- **Status**: BACKLOG

#### M4-004: "Sync now" button
- **Owner**: frontend-dev
- **Dependencies**: M4-003
- **Effort**: 2h
- **Description**: Add manual sync trigger button calling POST /api/connectors/gmail/sync
- **Binary Check**: Button triggers sync, loading state shown, inbox updates on completion
- **Status**: BACKLOG

---

#### M5-001: "Attach" action in thread view
- **Owner**: frontend-dev
- **Dependencies**: M4-004
- **Effort**: 2h
- **Description**: Add "Attach to Record" button in thread detail view
- **Binary Check**: Button opens attach modal
- **Status**: BACKLOG

#### M5-002: Search Contact/Deal modal
- **Owner**: frontend-dev
- **Dependencies**: M5-001
- **Effort**: 4h
- **Description**: Create modal with search for Contacts and Deals, select record type
- **Binary Check**: Search returns results, selection works
- **Status**: BACKLOG

#### M5-003: Link table schema
- **Owner**: supabase-admin
- **Dependencies**: M5-001
- **Effort**: 1h
- **Description**: Create message_record_links table with message_id/thread_id, record_id, type
- **Binary Check**: Schema deployed, foreign keys enforced
- **Status**: BACKLOG

#### M5-004: Save link endpoint
- **Owner**: backend-dev
- **Dependencies**: M5-002, M5-003
- **Effort**: 2h
- **Description**: POST /api/messages/:id/attach with record_id and type
- **Binary Check**: Link saved to DB, returns success
- **Status**: BACKLOG

#### M5-005: Emit ATTACHMENT_LINKED event
- **Owner**: backend-dev
- **Dependencies**: M5-004
- **Effort**: 1h
- **Description**: Emit ledger event when attachment created
- **Binary Check**: Event appears in /admin/ledger with correct message and record IDs
- **Status**: BACKLOG

#### M5-006: Show linked records in thread view
- **Owner**: frontend-dev
- **Dependencies**: M5-005
- **Effort**: 3h
- **Description**: Display "Linked to Deal X" badge in thread view, show in record detail
- **Binary Check**: Thread shows linked record, record page shows linked threads
- **Status**: BACKLOG

---

#### M6-001: Verify upsert keys
- **Owner**: backend-qa-automation-tester
- **Dependencies**: M5-006
- **Effort**: 2h
- **Description**: Test that messageId and threadId unique constraints prevent duplicates
- **Binary Check**: Manual duplicate insert fails with constraint violation
- **Status**: BACKLOG

#### M6-002: Sync lock prevents parallel runs
- **Owner**: backend-dev
- **Dependencies**: M6-001
- **Effort**: 2h
- **Description**: Add distributed lock or status check to prevent concurrent syncs
- **Binary Check**: Second sync request returns 409 or waits until first completes
- **Status**: BACKLOG

#### M6-003: Ledger insert-only verification
- **Owner**: backend-qa-automation-tester
- **Dependencies**: M6-002
- **Effort**: 1h
- **Description**: Verify ledger never updates/deletes, only inserts
- **Binary Check**: Ledger table has no UPDATE/DELETE triggers or queries
- **Status**: BACKLOG

#### M6-004: E2E duplicate prevention test
- **Owner**: backend-qa-automation-tester
- **Dependencies**: M6-003
- **Effort**: 3h
- **Description**: Run sync twice on same 30-day window, verify counts unchanged
- **Binary Check**: Second sync completes, message count identical, no duplicate events (except SYNC_DEDUP_SKIPPED)
- **Status**: BACKLOG

---

### IN_PROGRESS

*No tasks in progress*

---

### BLOCKED

*No tasks blocked*

---

### REVIEW

*No tasks in review*

---

### DONE

*No tasks completed yet*

---

## Milestone Dependencies

```
M0 (Repo + UI Kit)
 ├─ M0-001 → M0-002 → M0-003 → M0-004 → M0-005
 │                                      └─ M0-006
 └─ [M0 COMPLETE] ──────────────────────────────┐
                                                 │
M1 (OAuth GATE)                                  │
 ├─ M1-001 → M1-002 → M1-003 → M1-004 → M1-005 ←┘
 │                                      └─ M1-006
 └─ M1-007 [GATE] ──────────────────────────────┐
                                                 │
M2 (Ingestion)                                   │
 ├─ M2-001 → M2-002 → M2-004 → M2-005 → M2-006 ←┘
 │           └─ (M2-003 parallel with M2-002)
 └─ M2-007 ─────────────────────────────────────┐
                                                 │
M3 (Ledger)                                      │
 ├─ M3-001 → M3-002                              │
 │         → M3-003 ←──────────────────────────┘
 │         → M3-004 → M3-005
 └─ M3-006 ─────────────────────────────────────┐
                                                 │
M4 (Inbox UI)                                    │
 ├─ M4-001 → M4-002 → M4-003 → M4-004 ←─────────┘
 └─ [M4 COMPLETE] ──────────────────────────────┐
                                                 │
M5 (Attach Workflow)                             │
 ├─ M5-001 → M5-002 → M5-004 → M5-005 → M5-006 ←┘
 │           └─ (M5-003 parallel with M5-002)
 └─ [M5 COMPLETE] ──────────────────────────────┐
                                                 │
M6 (QA + Dedupe)                                 │
 └─ M6-001 → M6-002 → M6-003 → M6-004 ←─────────┘
```

---

## Parallelization Opportunities

**Within M0**:
- M0-005 (CI) can run parallel with M0-006 (fixtures) after M0-004

**Within M2**:
- M2-003 (schema) can run parallel with M2-002 (API integration)

**Within M3**:
- M3-002, M3-003, M3-004 can run parallel after M3-001 (schema defined)

**Within M5**:
- M5-003 (schema) can run parallel with M5-002 (modal UI)

**CRITICAL**: No parallelization across milestones until GATE passed:
- M1-007 must complete before any M2 work begins
- M0-006 must complete before M1-001 begins

---

## Agent Assignments

| Agent Type | Tickets |
|------------|---------|
| github-admin | M0-001 |
| codebase-admin | M0-001, M0-002 |
| frontend-dev | M0-003, M0-004, M0-006, M3-006, M4-001, M4-002, M4-003, M4-004, M5-001, M5-002, M5-006 |
| infra-deployment-specialist | M0-005, M1-001, M1-002 |
| backend-dev | M1-003, M1-004, M1-005, M1-006, M2-001, M2-002, M2-004, M2-005, M2-006, M3-001, M3-002, M3-003, M3-004, M3-005, M5-004, M5-005, M6-002 |
| supabase-admin | M2-003, M5-003 |
| backend-qa-automation-tester | M1-007, M2-007, M6-001, M6-003, M6-004 |

---

## Binary Checks Summary

### M0 Gate Criteria
- [ ] npm run build passes
- [ ] /inbox renders fixture threads
- [ ] All 7 routes accessible
- [ ] CI pipeline blocks failing builds

### M1 Gate Criteria [CRITICAL GATE]
- [ ] OAuth proof document published
- [ ] Click "Connect Gmail" → Google consent → Callback succeeds
- [ ] Mailbox identity displayed in UI
- [ ] Tokens encrypted in database
- [ ] Disconnect revokes access

### M2 Gate Criteria
- [ ] 30-day sync completes successfully
- [ ] Tables populated with Ashley's email data
- [ ] Re-run doesn't inflate message count
- [ ] Unique constraints enforced

### M3 Gate Criteria
- [ ] /admin/ledger shows events
- [ ] Events tied to correct mailbox and batch_id
- [ ] All 5 event types present

### M4 Gate Criteria
- [ ] /inbox renders real DB data (not fixtures)
- [ ] Thread list shows subject, date, snippet, participants
- [ ] Thread detail expands messages
- [ ] "Sync now" triggers ingestion

### M5 Gate Criteria
- [ ] "Attach" button opens modal
- [ ] Search finds Contacts/Deals
- [ ] Link saves to database
- [ ] Thread shows "Linked to Deal X"
- [ ] Record page shows linked threads
- [ ] ATTACHMENT_LINKED event in ledger

### M6 Gate Criteria
- [ ] Sync twice, count unchanged
- [ ] No duplicate messages in DB
- [ ] No duplicate events (except SYNC_DEDUP_SKIPPED)
- [ ] Parallel sync blocked with 409 or queued

---

## Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| OAuth consent screen approval delay | HIGH | Use test mode with explicit test users | infra-deployment-specialist |
| Gmail API rate limits | MEDIUM | Implement exponential backoff, respect quotas | backend-dev |
| 30-day sync timeout on large mailboxes | MEDIUM | Add pagination, cursor-based batching | backend-dev |
| Token refresh failures | HIGH | Implement retry logic, alert on repeated failures | backend-dev |
| Duplicate events in ledger | LOW | Verify insert-only pattern in M6 | backend-qa-automation-tester |
| Slow UI with large thread lists | MEDIUM | Add virtual scrolling, pagination | frontend-dev |

---

## Sprint Completion Criteria

Sprint 0.3 is COMPLETE when:
1. All M6 tickets in DONE
2. All binary checks pass
3. Ashley can: Connect Gmail → See inbox → Attach thread to Deal → View in ledger
4. Re-ingestion produces zero duplicates
5. Proof documentation published

---

## Notes

- **NO PARALLELIZATION** until M1-007 [GATE] passes
- Microsoft Graph deferred to Sprint 1.2/1.3
- OPS-901 (Gmail OAuth) is the only provider in scope
- All file paths must be absolute
- Test user: Ashley (email TBD by infra-deployment-specialist)

---

**Last Updated**: 2025-12-31
**Orchestrator**: Project Orchestrator
**Sprint Status**: READY TO START
