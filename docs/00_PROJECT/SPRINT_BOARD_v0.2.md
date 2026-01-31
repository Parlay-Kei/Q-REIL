# REIL/Q Sprint 0.2 - Gmail-First Inbox Spine

**Sprint:** 0.2 - Gmail-First Inbox Spine
**Duration:** 72 hours (follow-the-sun)
**Start:** 2025-12-31
**Status:** SPEC COMPLETE - Implementation Required
**PRD (scope + DoD):** [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md) — §6 MVP Scope, §10 Definition of Done (missions must reference both or are rejected; see [OCS_RULES](../q-reil/OCS_RULES.md))

---

## North Star

> Ashley connects Gmail -> Q ingests threads -> emails + attachments auto-link to Contacts/Deals/Properties -> everything shows inside the Q record timeline with a ledger audit trail.

---

## Sprint 0.2 Reality Check

**What's DONE:** Design + Specification phase complete.
**What's NOT DONE:** No working system. Zero running code.

---

## Epic Status Overview

| Epic | Status | Progress | Owner |
|------|--------|----------|-------|
| SPEC | DONE | 6/6 | various |
| AUTH | TODO | 0/1 | auth-flow-agent |
| BACKEND | TODO | 1/3 | supabase-admin, backend-dev |
| LEDGER | SPEC DONE | 0/1 impl | realtime-audit-agent |
| UI | SPEC DONE | 0/2 impl | frontend-dev |
| SECURITY | SPEC DONE | 0/1 impl | saas-security-auditor |
| QA | TODO | 0/2 | backend-qa-automation-tester |
| OPS | TODO | 0/1 | infra-deployment-specialist |

---

## Epic: SPEC (COMPLETE)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| PO-001 | Create Sprint 0.2 board + lanes | P0 | `project-orchestrator` | DONE | Execution-Packet_v0.2-Gmail.md |
| DB-201 | Create mailbox schema + RLS | P0 | `supabase-admin` | DONE | migrations/00030_*.sql, 00031_*.sql |
| FE-501-SPEC | Q Inbox UI Spec | P0 | `frontend-dev` | DONE | 03_UI/inbox-ui-spec.md (2330 lines) |
| FE-502-SPEC | Record view email tab Spec | P1 | `frontend-dev` | DONE | 03_UI/inbox-ui-spec.md |
| UX-601 | Inbox UX spec | P0 | `ui-ux-design-virtuoso` | DONE | 03_UI/inbox-ux-spec.md (2615 lines) |
| AUD-401-SPEC | Ledger event spec | P0 | `realtime-audit-agent` | DONE | 06_QA/GMAIL_LEDGER_EVENTS.md (1926 lines) |
| SEC-701 | Gmail data handling baseline | P0 | `saas-security-auditor` | DONE | 06_QA/GMAIL_SECURITY_BASELINE.md (2917 lines) |

---

## Epic: AUTH (TODO - Implementation Required)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| AUTH-101 | Gmail OAuth connection (readonly) | P0 | `auth-flow-agent` | TODO | Working OAuth flow |

**Acceptance Criteria:**
- [ ] OAuth flow implemented with PKCE
- [ ] Tokens encrypted at rest (AES-256-GCM per SEC-701)
- [ ] Mailbox record created on success
- [ ] MAILBOX_CONNECTED ledger event emitted

**Blocked by:** OPS-901 (Google Cloud credentials, redirect URIs)

---

## Epic: BACKEND (TODO - Implementation Required)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| DB-201 | Create mailbox schema + RLS | P0 | `supabase-admin` | DONE | migrations/00030_*.sql, 00031_*.sql |
| BE-301 | Gmail ingestion service | P0 | `backend-dev` | TODO | Working ingestion pipeline |
| BE-302 | Rule engine + linking endpoints | P0 | `backend-dev` | TODO | Working rule engine + API |

**BE-301 Acceptance Criteria:**
- [ ] Backfill last 7 days first (then expand to 30)
- [ ] Incremental sync with historyId
- [ ] Attachments stored with SHA-256
- [ ] Idempotent (no duplicates on re-run)
- [ ] Ledger events emitted (per AUD-401-SPEC)

**BE-302 Acceptance Criteria:**
- [ ] EXACT_EMAIL_MATCH rule works
- [ ] DOMAIN_MATCH rule works
- [ ] CONTACT_TO_RECORD_PROMOTION rule works
- [ ] Ambiguous cases flagged as needs_routing
- [ ] Manual attach endpoint works
- [ ] Unlink endpoint works

**Blocked by:** AUTH-101 (needs OAuth tokens to call Gmail API)

---

## Epic: LEDGER (Spec Done, Enforcement TODO)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| AUD-401-SPEC | Ledger event spec | P0 | `realtime-audit-agent` | DONE | GMAIL_LEDGER_EVENTS.md |
| AUD-401-IMPL | Ledger event enforcement | P0 | `realtime-audit-agent` + `backend-dev` | TODO | Middleware + wrappers |

**AUD-401-SPEC Completed:**
- [x] All 12 event types defined
- [x] Payload schemas documented
- [x] Correlation ID patterns defined
- [x] Query patterns documented

**AUD-401-IMPL Acceptance Criteria:**
- [ ] Every backend operation emits ledger event
- [ ] Transaction-safe logging (same tx as business logic)
- [ ] Validation middleware detects missing events
- [ ] PII redaction applied

---

## Epic: UI (Spec Done, Implementation TODO)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| FE-501-SPEC | Q Inbox UI Spec | P0 | `frontend-dev` | DONE | inbox-ui-spec.md |
| FE-502-SPEC | Record view email tab Spec | P1 | `frontend-dev` | DONE | inbox-ui-spec.md |
| IMPL-900 | Inbox UI implementation | P0 | `frontend-dev` | TODO | Working /inbox route |
| IMPL-901 | Record emails tab implementation | P1 | `frontend-dev` | TODO | Working emails tab |

**IMPL-900 Acceptance Criteria:**
- [ ] /inbox thread list with filters (from spec)
- [ ] /inbox/thread/:id detail view
- [ ] Attach to... modal works
- [ ] Linked record badges display
- [ ] Wired to real API, not fixtures

**IMPL-901 Acceptance Criteria:**
- [ ] Emails tab on Deal page
- [ ] Emails tab on Contact page
- [ ] Timeline integration

**Blocked by:** BE-301, BE-302 (needs APIs to wire to)

---

## Epic: SECURITY (Spec Done)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| SEC-701 | Gmail data handling baseline | P0 | `saas-security-auditor` | DONE | GMAIL_SECURITY_BASELINE.md |

**Completed:**
- [x] Token encryption requirements defined (AES-256-GCM)
- [x] PII handling rules for email (33-item checklist)
- [x] Logging rules (no email bodies)
- [x] Disconnect flow defined

**Enforcement:** Applied during AUTH-101, BE-301, BE-302 implementation.

---

## Epic: QA (TODO)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| QA-801 | Ingestion regression tests | P0 | `backend-qa-automation-tester` | TODO | Working test suite |
| QA-802 | Release gate setup | P0 | `pre-deployment-quality-auditor` | TODO | CI pipeline with gates |

**QA-801 Acceptance Criteria:**
- [ ] Mock Gmail fixtures created
- [ ] Idempotency tests passing
- [ ] Rule engine tests passing
- [ ] Edge case tests defined

**QA-802 Acceptance Criteria:**
- [ ] CI pipeline running
- [ ] Branch protection rules active
- [ ] Test gates blocking bad merges

**Blocked by:** BE-301, BE-302 (needs code to test)

---

## Epic: OPS (TODO - BLOCKING)

| Ticket | Title | Priority | Owner | Status | Deliverable |
|--------|-------|----------|-------|--------|-------------|
| OPS-901 | Repo + env setup | P0 | `infra-deployment-specialist` | TODO | Working infrastructure |

**OPS-901 is DONE only when ALL of this is true:**

- [ ] Google Cloud project exists for REIL/Q (not a personal sandbox)
- [ ] OAuth consent screen configured (internal/external decided)
- [ ] OAuth client created (Web application type)
- [ ] Redirect URIs set for:
  - [ ] Local dev (http://localhost:3000/api/auth/callback/google)
  - [ ] Preview (if used)
  - [ ] Production
- [ ] Client ID + Client Secret stored in approved secret store (NOT in committed .env)
- [ ] Test user can complete OAuth and return to app without Google errors
- [ ] Tokens are stored and refreshable (prove refresh works by forcing token refresh)

**Completion Proof Required:**
```
OPS-901 posts when complete:
1. "OAuth client created" (screenshot of GCP console)
2. "Redirect URIs verified" (list all configured URIs)
3. "Secrets stored" (confirm secret store, not .env)
4. "Test auth run successful" (screenshot or log proof of full OAuth round-trip)
5. "Token refresh verified" (proof that expired token refreshes correctly)
```

**Only after this proof is posted does AUTH-101 start.**

---

## Sprint 0.3 Rules (Enforced)

**No new specs unless they directly unblock a running loop.**

If a spec does not shorten time-to-execution, it waits.

| Agent | Rule |
|-------|------|
| `auth-flow-agent` | Idle-ready. No spec writing. Wait for OPS-901. |
| `frontend-dev` | Stop polishing. No UI work until real endpoints exist. |
| `backend-dev` | Code only. No new design docs. |
| `realtime-audit-agent` | Enforce events in code, not in markdown. |
| `backend-qa-automation-tester` | Focus: idempotency + duplication. Not coverage breadth. |
| All agents | Daily check: **"Did a new thing run today?"** |
| **All agents** | **No raw email bodies in logs or ledger payloads. Metadata + hashes + references only.** |

**OPS-901 runs solo. No parallelization until it completes.**

---

## Definition of Done

A ticket is "done" only if:

- [ ] It has tests (or explicit test plan for UI)
- [ ] It is idempotent (re-running does not duplicate data)
- [ ] It writes ledger events (if backend)
- [ ] It respects org isolation permissions
- [ ] It has a short note in docs for how to run/verify
- [ ] **It runs. Not just specified.**

---

## Success Criteria (Sprint 0.2/0.3 Combined)

| Criteria | Status |
|----------|--------|
| Gmail OAuth works end-to-end | NOT STARTED |
| 50+ messages ingested without duplicates | NOT STARTED |
| Attachments stored with SHA-256 | NOT STARTED |
| Auto-attach works (email -> contact) | NOT STARTED |
| Manual attach works | NOT STARTED |
| Ledger complete for all actions | NOT STARTED |
| Tests pass in CI | NOT STARTED |
| No PII in logs | NOT STARTED |

---

## Sprint 0.3: First Running Loop

**Goal:** End-to-end Gmail loop working.

**Seven Binary Success Checks:**
1. [ ] User connects Gmail (OAuth works)
2. [ ] System ingests threads/messages for last 30 days
3. [ ] Stores messages + threads in REIL tables
4. [ ] Creates ledger events for ingestion
5. [ ] Q Inbox displays real threads from DB (not fixtures)
6. [ ] Manual attach works to Contact or Deal
7. [ ] Rerun ingestion: zero duplicates

If all seven are true, you have a product spine.

---

## Post-OPS-901 Execution Chain (Pre-Loaded)

**Immediately after OPS-901 flips to DONE:**

```
DAY 1 (same day as OPS-901 completion):
├── AUTH-101 starts immediately
├── AUTH-101 completes (working OAuth with token storage)
└── BE-301 starts with 7-day backfill window

DAY 2:
├── BE-301 ingests first real messages
├── AUD-401-IMPL lands (ledger enforcement in same PR as BE-301)
├── BE-301 expands to 30-day backfill
└── IMPL-900 starts wiring to real endpoints

DAY 3:
├── IMPL-900 shows real threads in /inbox
├── BE-302 lands (manual attach endpoint)
├── QA-801 runs idempotency loop (ingest → re-ingest → assert no duplicates)
└── All seven checks verified
```

**No hesitation. No new specs. Execute.**

---

## Execution Order (No Parallel Chaos)

```
OPS-901 (infra/env)
    |
    v
AUTH-101 (OAuth)
    |
    v
BE-301 (ingestion - 7 days first, then 30)
    |
    v
AUD-401-IMPL (ledger enforcement - same day as BE-301)
    |
    v
IMPL-900 (FE wiring to real data)
    |
    v
BE-302 (rule engine + linking)
    |
    v
QA-801/802 (idempotency tests + gates)
```

---

## Agent Assignments for Sprint 0.3

| Agent | Ticket | Priority |
|-------|--------|----------|
| `infra-deployment-specialist` + `github-admin` | OPS-901 | 1st (blocking) |
| `auth-flow-agent` | AUTH-101 | 2nd |
| `backend-dev` + `supabase-admin` | BE-301 | 3rd |
| `realtime-audit-agent` + `backend-dev` | AUD-401-IMPL | 4th (same day as BE-301) |
| `frontend-dev` | IMPL-900 | 5th |
| `backend-dev` | BE-302 | 6th |
| `backend-qa-automation-tester` + `pre-deployment-quality-auditor` | QA-801/802 | 7th |
| `ops-monitor` | Health checks + sync monitoring | Ongoing |

---

## Blockers & Escalations

| ID | Blocker | Ticket | Raised | Status |
|----|---------|--------|--------|--------|
| B-001 | No Google Cloud credentials | AUTH-101 | 2025-12-31 | OPEN |
| B-002 | No working OAuth = no ingestion | BE-301 | 2025-12-31 | BLOCKED |
| B-003 | No ingestion = no UI wiring | IMPL-900 | 2025-12-31 | BLOCKED |

---

## Handoff Log

| Timestamp | From | To | Artifact | Notes |
|-----------|------|----|----------|-------|
| 2025-12-31 | orchestrator | all-agents | Execution-Packet_v0.2-Gmail.md | Sprint kickoff |
| 2025-12-31 | supabase-admin | backend-dev | migrations/00030-00031 | Schema ready |
| 2025-12-31 | frontend-dev | - | inbox-ui-spec.md | UI spec complete |
| 2025-12-31 | ui-ux-design-virtuoso | - | inbox-ux-spec.md | UX spec complete |
| 2025-12-31 | realtime-audit-agent | - | GMAIL_LEDGER_EVENTS.md | Ledger spec complete |
| 2025-12-31 | saas-security-auditor | - | GMAIL_SECURITY_BASELINE.md | Security spec complete |
| 2025-12-31 | orchestrator | all-agents | SPRINT_BOARD_v0.2.md | Reality check + Sprint 0.3 rules + execution chain |

---

## Orchestrator Message (Copy/Paste Ready)

```
Subject: Sprint 0.3 - First Running Loop (Gmail)

We are in "Specification Complete."

Updated board: FE-501/502 specs, UX-601, AUD-401 spec, SEC-701 set to DONE.

Start Sprint 0.3 as an implementation sprint with one goal:
a running end-to-end Gmail loop.

Execution order:
OPS-901 -> AUTH-101 -> BE-301 -> ledger enforcement -> FE wiring -> BE-302 -> QA-801/802

No other connectors. No additional features.

Definition of done is seven binary checks:
1. OAuth works
2. Ingest works
3. Store works
4. Events written
5. UI shows real data
6. Manual attach works
7. Idempotent re-run

SPRINT 0.3 RULES:
- No new specs unless they unblock a running loop
- OPS-901 runs solo - no parallelization until complete
- auth-flow-agent: idle-ready, wait for OPS-901
- frontend-dev: stop polishing until endpoints exist
- backend-dev: code only, no design docs
- ALL AGENTS: No raw email bodies in logs or ledger. Metadata only.
- Daily check: "Did a new thing run today?"

OPS-901 COMPLETION REQUIRES PROOF:
1. OAuth client created (screenshot)
2. Redirect URIs verified (list)
3. Secrets stored (confirm location)
4. Test auth successful (screenshot/log)
5. Token refresh verified (proof)

POST-OPS-901 CHAIN (no hesitation):
- AUTH-101 starts immediately
- BE-301 starts with 7-day backfill, expands to 30
- AUD-401-IMPL lands same day as BE-301
- FE wires to real data
- QA runs idempotency loop

One loop first. Then expand.
```

---

*Board Version: 0.2.3*
*Last Updated: 2025-12-31*
*Status: SPEC COMPLETE - IMPLEMENTATION SPRINT REQUIRED*
