# REIL/Q Sprint 0.1 - Sprint Board

**PRD (scope + DoD):** [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md) — §6 MVP Scope, §10 Definition of Done (missions must reference both or are rejected; see [OCS_RULES](../q-reil/OCS_RULES.md))

**Sprint:** 0.1 - Spine + Shell + Feasibility
**Duration:** 72 hours
**Start:** 2025-12-31
**Status:** ACTIVE

---

## Lane Status Overview

| Lane | Status | Progress | Blockers |
|------|--------|----------|----------|
| Lane 1: Product + Spec | IN PROGRESS | 0/8 | None |
| Lane 2: REIL Core | IN PROGRESS | 0/9 | None |
| Lane 3: Q UI | IN PROGRESS | 0/10 | None |
| Lane 4: Connectors | IN PROGRESS | 0/7 | None |
| Lane 5: Inbox | IN PROGRESS | 0/5 | None |
| Lane 6: QA + Release | IN PROGRESS | 0/7 | None |

---

## Lane 1: Product + Spec

**Owners:** `customer-journey`, `spec-requirements`, `project-orchestrator`
**Target:** 24-48h

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L1-001 | Translate Ashley's "complete solution" into acceptance criteria | P0 | `spec-requirements` | PENDING | +24h |
| L1-002 | Define MVP north star (reduce touches + consolidate inbox/docs) | P0 | `customer-journey` | PENDING | +24h |
| L1-003 | Define roles: Admin, Agent, TC, Property Manager | P0 | `spec-requirements` | PENDING | +24h |
| L1-004 | Produce Q Modules map | P0 | `customer-journey` | PENDING | +36h |
| L1-005 | Produce REIL Ledger Rules | P0 | `spec-requirements` | PENDING | +36h |
| L1-006 | Complete spec-requirements.md | P0 | `spec-requirements` | PENDING | +48h |
| L1-007 | Complete REIL vs Q Boundaries document | P0 | `spec-requirements` | PENDING | +48h |
| L1-008 | Write 10-15 user stories with acceptance criteria | P1 | `customer-journey` | PENDING | +48h |

---

## Lane 2: REIL Core

**Owners:** `supabase-admin`, `backend-dev`, `realtime-audit-agent`
**Target:** 48-96h

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L2-001 | Design REIL core schema | P0 | `supabase-admin` | PENDING | +24h |
| L2-002 | Implement orgs/users tables | P0 | `supabase-admin` | PENDING | +36h |
| L2-003 | Implement contacts/companies tables | P0 | `supabase-admin` | PENDING | +48h |
| L2-004 | Implement properties/units tables | P0 | `supabase-admin` | PENDING | +48h |
| L2-005 | Implement deals/leasing tables | P0 | `supabase-admin` | PENDING | +60h |
| L2-006 | Implement docs/messages tables | P0 | `supabase-admin` | PENDING | +60h |
| L2-007 | Implement events table (append-only ledger) | P0 | `supabase-admin` | PENDING | +72h |
| L2-008 | Implement RLS policies for RBAC | P0 | `supabase-admin` | PENDING | +72h |
| L2-009 | Build API skeleton with OpenAPI routes | P1 | `backend-dev` | PENDING | +96h |

---

## Lane 3: Q UI

**Owners:** `ui-ux-design-virtuoso`, `frontend-dev`
**Target:** 48-96h

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L3-001 | Design Q shell layout + navigation | P0 | `ui-ux-design-virtuoso` | PENDING | +24h |
| L3-002 | Create mock fixtures matching schema | P0 | `frontend-dev` | PENDING | +36h |
| L3-003 | Build `/pipeline` screen | P0 | `frontend-dev` | PENDING | +48h |
| L3-004 | Build `/record/:id` screen (deal/property) | P0 | `frontend-dev` | PENDING | +60h |
| L3-005 | Build `/docs` screen | P0 | `frontend-dev` | PENDING | +72h |
| L3-006 | Build `/inbox` screen | P0 | `frontend-dev` | PENDING | +72h |
| L3-007 | Build `/tasks` screen | P0 | `frontend-dev` | PENDING | +84h |
| L3-008 | Build REIL Admin `/admin/ledger` | P1 | `frontend-dev` | PENDING | +96h |
| L3-009 | Build REIL Admin `/admin/connectors` | P1 | `frontend-dev` | PENDING | +96h |
| L3-010 | Standardize components (cards, status, timeline, tables) | P1 | `ui-ux-design-virtuoso` | PENDING | +96h |

---

## Lane 4: Connectors

**Owners:** `connector-research-agent`, `backend-dev`
**Target:** 48-120h

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L4-001 | Create SkySlope fact sheet | P0 | `connector-research-agent` | PENDING | +48h |
| L4-002 | SkySlope auth spike | P0 | `connector-research-agent` | PENDING | +60h |
| L4-003 | SkySlope pull transactions spike | P0 | `connector-research-agent` | PENDING | +72h |
| L4-004 | Create Yardi fact sheet | P1 | `connector-research-agent` | PENDING | +72h |
| L4-005 | Create MLS fact sheet | P1 | `connector-research-agent` | PENDING | +72h |
| L4-006 | Create AIR CRE fact sheet | P2 | `connector-research-agent` | PENDING | +96h |
| L4-007 | MVP go/no-go matrix | P0 | `connector-research-agent` | PENDING | +72h |

---

## Lane 5: Inbox

**Owners:** `email-admin-agent`, `auth-flow-agent`
**Target:** 48-120h

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L5-001 | Create connector email fact sheet | P0 | `email-admin-agent` | PENDING | +36h |
| L5-002 | Gmail vs M365 decision doc | P0 | `email-admin-agent` | PENDING | +48h |
| L5-003 | Inbox MVP plan with scopes + edge cases | P0 | `email-admin-agent` | PENDING | +48h |
| L5-004 | OAuth flow design | P1 | `auth-flow-agent` | PENDING | +72h |
| L5-005 | Proof-of-auth spike | P0 | `email-admin-agent` | PENDING | +72h |

---

## Lane 6: QA + Release

**Owners:** `backend-qa-automation-tester`, `pre-deployment-quality-auditor`, `github-admin`, `infra-deployment-specialist`, `ci-deployment-monitor`
**Target:** Always-on

| ID | Task | Priority | Owner | Status | Due |
|----|------|----------|-------|--------|-----|
| L6-001 | Define PII logging rules | P0 | `saas-security-auditor` | PENDING | +24h |
| L6-002 | Define audit event required fields | P0 | `realtime-audit-agent` | PENDING | +24h |
| L6-003 | Create SECURITY_BASELINE.md | P0 | `saas-security-auditor` | PENDING | +36h |
| L6-004 | Build test harness for doc ingestion | P1 | `backend-qa-automation-tester` | PENDING | +72h |
| L6-005 | Build test harness for email capture | P1 | `backend-qa-automation-tester` | PENDING | +96h |
| L6-006 | Build test harness for ledger events | P1 | `backend-qa-automation-tester` | PENDING | +72h |
| L6-007 | Configure CI gates | P0 | `github-admin` | PENDING | +48h |

---

## Dependency Graph

```
Lane 1 (Spec) ────┬──▶ Lane 2 (Data) ────┬──▶ Lane 3 (UI)
                  │                       │
                  │                       └──▶ Lane 4 (Connectors)
                  │
                  └──▶ Lane 5 (Inbox)

Lane 6 (QA) ──────────────────────────────────▶ All Lanes
```

### Critical Path Dependencies

| Blocker | Blocked Task | Resolution Required |
|---------|--------------|---------------------|
| L1-006 (spec-requirements.md) | L2-001 (schema design) | Schema informed by spec |
| L2-001 (schema design) | L3-002 (mock fixtures) | Fixtures match schema |
| L2-002 (orgs/users) | L2-008 (RLS policies) | Tables exist first |
| L4-001 (SkySlope fact sheet) | L4-002 (auth spike) | Know what to auth against |
| L5-001 (email fact sheet) | L5-002 (platform decision) | Facts inform decision |

---

## Blockers & Escalations

| ID | Blocker | Lane | Raised | Owner | Status |
|----|---------|------|--------|-------|--------|
| (none yet) | | | | | |

---

## Standup Log

### 2025-12-31 (Sprint Start)

**Lane 1:** Sprint initiated. Agents assigned.
**Lane 2:** Awaiting spec input. Schema design prep started.
**Lane 3:** Design exploration started. Shell layout in progress.
**Lane 4:** Agent spec created. Research starting.
**Lane 5:** Agent spec created. Platform research starting.
**Lane 6:** Security baseline work initiated.

---

## Handoff Log

| Timestamp | From | To | Artifact | Notes |
|-----------|------|----|----------|-------|
| 2025-12-31 | orchestrator | all-agents | Execution-Packet_v0.1.md | Sprint kickoff |

---

## Completion Tracking

**Sprint 0.1 Success Criteria:**

- [ ] Q UI shell exists with 5 core screens
- [ ] REIL Admin shell exists with 2 screens
- [ ] REIL core schema deployed
- [ ] Event ledger spec implemented
- [ ] RLS policies active
- [ ] Inbox connector decision made with proof-of-auth
- [ ] SkySlope feasibility proven
- [ ] CI gates active and green

**Progress:** 0/8 criteria met
