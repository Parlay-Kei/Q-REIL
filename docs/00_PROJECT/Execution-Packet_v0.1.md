# REIL/Q Sprint 0.1 - Spine + Shell + Feasibility

**Packet Version:** 0.1
**Created:** 2025-12-31
**Status:** ACTIVE
**Duration:** 72 hours (Sprint 0.1)

---

## Mission Statement

Build the foundational spine (data + APIs), shell (UI navigation), and validate external connector feasibility before committing to integration architecture.

---

## Success Criteria (Definition of Done)

| Criterion | Owner Lane | Verification |
|-----------|------------|--------------|
| Q UI shell exists with 5 core screens (`/pipeline`, `/record/:id`, `/docs`, `/inbox`, `/tasks`) | Lane 3: UI | Screenshots + navigation demo |
| REIL Admin shell exists (`/admin/ledger`, `/admin/connectors`) | Lane 3: UI | Screenshots + navigation demo |
| REIL core schema deployed (orgs/users/contacts/companies/properties/units/deals/leasing/docs/messages/events) | Lane 2: REIL Core | Migrations committed + Supabase Studio verification |
| Event ledger spec implemented (append-only) | Lane 2: REIL Core | API test + immutability proof |
| RLS policies active for RBAC | Lane 2: REIL Core | Policy tests passing |
| Inbox connector decision made (Gmail vs M365) | Lane 5: Inbox | Decision doc with proof-of-auth spike |
| SkySlope feasibility proven (auth + pull minimum) | Lane 4: Connectors | Spike logs + screenshots |
| CI gates active and green | Lane 6: QA | GitHub Actions passing |

---

## Workstream Lanes

### Lane 1: Product + Spec (P0 - 24-48h)
**Owners:** `customer-journey`, `spec-requirements`, `project-orchestrator`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Translate Ashley's "complete solution" into acceptance criteria | P0 | PENDING | `01_SPEC/acceptance-criteria.md` |
| Define MVP north star (reduce touches + consolidate inbox/docs) | P0 | PENDING | `01_SPEC/mvp-north-star.md` |
| Define roles: Admin, Agent, TC, Property Manager | P0 | PENDING | `01_SPEC/roles-permissions.md` |
| Produce Q Modules map | P0 | PENDING | `01_SPEC/q-modules-map.md` |
| Produce REIL Ledger Rules | P0 | PENDING | `01_SPEC/reil-ledger-rules.md` |
| Complete spec-requirements.md | P0 | PENDING | `01_SPEC/spec-requirements.md` |
| Complete REIL vs Q Boundaries | P0 | PENDING | `01_SPEC/REIL_vs_Q_Boundaries.md` |
| Write 10-15 user stories with acceptance criteria | P1 | PENDING | `01_SPEC/user-stories/` |

### Lane 2: REIL Core (P0 - 48-96h)
**Owners:** `supabase-admin`, `backend-dev`, `realtime-audit-agent`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Design REIL core schema | P0 | PENDING | `02_DATA/schema-design.md` |
| Implement orgs/users tables | P0 | PENDING | Migration file |
| Implement contacts/companies tables | P0 | PENDING | Migration file |
| Implement properties/units tables | P0 | PENDING | Migration file |
| Implement deals/leasing tables | P0 | PENDING | Migration file |
| Implement docs/messages tables | P0 | PENDING | Migration file |
| Implement events table (append-only ledger) | P0 | PENDING | Migration file |
| Implement RLS policies for RBAC | P0 | PENDING | `02_DATA/rls-policies.sql` |
| Build API skeleton with OpenAPI routes | P1 | PENDING | `/api` routes + OpenAPI spec |

### Lane 3: Q UI (P0 - 48-96h)
**Owners:** `ui-ux-design-virtuoso`, `frontend-dev`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Design Q shell layout + navigation | P0 | PENDING | Figma/component spec |
| Build `/pipeline` screen | P0 | PENDING | React component |
| Build `/record/:id` screen (deal/property) | P0 | PENDING | React component |
| Build `/docs` screen | P0 | PENDING | React component |
| Build `/inbox` screen | P0 | PENDING | React component |
| Build `/tasks` screen | P0 | PENDING | React component |
| Build REIL Admin `/admin/ledger` | P1 | PENDING | React component |
| Build REIL Admin `/admin/connectors` | P1 | PENDING | React component |
| Create mock fixtures matching schema | P0 | PENDING | `03_UI/fixtures/` |
| Standardize components (cards, status, timeline, tables) | P1 | PENDING | Component library |

### Lane 4: Connectors (P1 - 48-120h)
**Owners:** `connector-research-agent`, `backend-dev`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Create SkySlope fact sheet | P0 | PENDING | `04_CONNECTORS/SKYSLOPE_FACT_SHEET.md` |
| Create Yardi fact sheet | P1 | PENDING | `04_CONNECTORS/YARDI_FACT_SHEET.md` |
| Create MLS fact sheet | P1 | PENDING | `04_CONNECTORS/MLS_FACT_SHEET.md` |
| Create AIR CRE fact sheet | P1 | PENDING | `04_CONNECTORS/AIRCRE_FACT_SHEET.md` |
| SkySlope auth spike | P0 | PENDING | Spike logs + screenshots |
| SkySlope pull transactions spike | P0 | PENDING | Spike logs + data samples |
| MVP go/no-go matrix | P0 | PENDING | `04_CONNECTORS/MVP_GO_NOGO_MATRIX.md` |

### Lane 5: Inbox (P1 - 48-120h)
**Owners:** `email-admin-agent`, `auth-flow-agent`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Gmail vs M365 decision doc | P0 | PENDING | `05_INBOX/EMAIL_PLATFORM_DECISION.md` |
| Create connector email fact sheet | P0 | PENDING | `05_INBOX/CONNECTOR_EMAIL_FACT_SHEET.md` |
| Inbox MVP plan with scopes + edge cases | P0 | PENDING | `05_INBOX/INBOX_MVP_PLAN.md` |
| OAuth flow design | P1 | PENDING | `05_INBOX/oauth-flow.md` |
| Proof-of-auth spike | P0 | PENDING | Spike logs + token verification |

### Lane 6: QA + Release (Always-On)
**Owners:** `backend-qa-automation-tester`, `pre-deployment-quality-auditor`, `github-admin`, `infra-deployment-specialist`, `ci-deployment-monitor`

| Task | Priority | Status | Output |
|------|----------|--------|--------|
| Define PII logging rules | P0 | PENDING | `06_QA/PII_RULES.md` |
| Define audit event required fields | P0 | PENDING | `06_QA/LEDGER_EVENT_SPEC.md` |
| Create SECURITY_BASELINE.md | P0 | PENDING | `06_QA/SECURITY_BASELINE.md` |
| Build test harness for doc ingestion | P1 | PENDING | Test suite |
| Build test harness for email capture | P1 | PENDING | Test suite |
| Build test harness for ledger events | P1 | PENDING | Test suite |
| Configure CI gates | P0 | PENDING | GitHub Actions workflow |

---

## Handoff Rules

### Definition of Done (DoD) Checklist
Every deliverable must pass:

- [ ] Code reviewed (if applicable)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No P0 bugs introduced
- [ ] Security review passed (for PII/auth changes)
- [ ] Committed to main branch
- [ ] Verified in staging environment

### Handoff Protocol

1. **Completing agent** updates task status to `DONE` in this packet
2. **Completing agent** posts handoff summary in `00_PROJECT/handoffs/`
3. **Receiving agent** acknowledges within 2 hours
4. **Orchestrator** validates and updates sprint board

### Blocking Issues
- Any P0 blocker must be escalated to `project-orchestrator` immediately
- Cross-lane dependencies must be documented in `00_PROJECT/dependencies.md`
- If a lane is blocked >4 hours, escalate with `BLOCKED:` prefix

---

## Agent Assignments

| Agent | Primary Lane | Secondary Support |
|-------|--------------|-------------------|
| `project-orchestrator` | Lane 1 | All lanes (coordination) |
| `customer-journey` | Lane 1 | Lane 3 (UX validation) |
| `spec-requirements` | Lane 1 | Lane 2 (schema validation) |
| `supabase-admin` | Lane 2 | Lane 4 (connector data models) |
| `backend-dev` | Lane 2 | Lane 4, Lane 5 |
| `realtime-audit-agent` | Lane 2 | Lane 6 |
| `ui-ux-design-virtuoso` | Lane 3 | - |
| `frontend-dev` | Lane 3 | - |
| `connector-research-agent` | Lane 4 | - |
| `email-admin-agent` | Lane 5 | - |
| `auth-flow-agent` | Lane 5 | Lane 4 (OAuth patterns) |
| `backend-qa-automation-tester` | Lane 6 | All lanes |
| `pre-deployment-quality-auditor` | Lane 6 | All lanes |
| `github-admin` | Lane 6 | - |
| `infra-deployment-specialist` | Lane 6 | - |
| `ci-deployment-monitor` | Lane 6 | - |
| `saas-security-auditor` | Lane 6 | Lane 2, Lane 5 |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SkySlope API access denied | Medium | High | Early spike in Lane 4; have manual import fallback |
| Gmail API rate limits | Low | Medium | Batch processing; queue architecture |
| Schema changes mid-sprint | Medium | Medium | Versioned migrations; backward compatibility |
| UI scope creep | High | Medium | Mock data only; no live integrations in Sprint 0.1 |

---

## Communication Cadence

- **Async standup:** Every 8 hours, each lane posts status in `00_PROJECT/standups/`
- **Sync checkpoint:** At 24h, 48h, 72h marks
- **Blocker escalation:** Immediate via orchestrator

---

## Next Packet Preview (Sprint 0.2)

Pending Sprint 0.1 completion:
- Live connector integration (SkySlope)
- Real email ingestion pipeline
- Authentication flows (user login)
- Initial data migration from existing systems

---

*This packet is the source of truth for Sprint 0.1. All agents reference this document for scope and priorities.*
