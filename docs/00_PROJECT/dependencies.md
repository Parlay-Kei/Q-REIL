# Cross-Lane Dependencies

**Last Updated:** 2025-12-31
**Sprint:** 0.1

---

## Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPRINT 0.1 DEPENDENCIES                           │
└─────────────────────────────────────────────────────────────────────────────┘

Lane 1 (Spec)
    │
    ├──[spec-requirements.md]──────────────────┐
    │                                          │
    ├──[roles-permissions.md]──────────────────┼──▶ Lane 2 (schema design)
    │                                          │
    ├──[reil-ledger-rules.md]──────────────────┘
    │
    ├──[q-modules-map.md]──────────────────────────▶ Lane 3 (UI screens)
    │
    └──[REIL_vs_Q_Boundaries.md]───────────────────▶ All Lanes (clarity)


Lane 2 (Data)
    │
    ├──[schema-design.md]──────────────────────────▶ Lane 3 (mock fixtures)
    │
    ├──[schema-design.md]──────────────────────────▶ Lane 4 (connector mapping)
    │
    ├──[schema-design.md]──────────────────────────▶ Lane 5 (message schema)
    │
    └──[rls-policies.md]───────────────────────────▶ Lane 6 (security review)


Lane 4 (Connectors)
    │
    ├──[SKYSLOPE_FACT_SHEET.md]────────────────────▶ Lane 2 (external data mapping)
    │
    └──[MVP_GO_NOGO_MATRIX.md]─────────────────────▶ All Lanes (scope decisions)


Lane 5 (Inbox)
    │
    ├──[EMAIL_PLATFORM_DECISION.md]────────────────▶ Lane 2 (message schema)
    │
    └──[INBOX_MVP_PLAN.md]─────────────────────────▶ Lane 3 (inbox UI)


Lane 6 (QA)
    │
    ├──[SECURITY_BASELINE.md]──────────────────────▶ All Lanes (compliance)
    │
    ├──[PII_RULES.md]──────────────────────────────▶ Lane 2, 5 (data handling)
    │
    └──[LEDGER_EVENT_SPEC.md]──────────────────────▶ Lane 2 (events schema)
```

---

## Critical Path

The following dependencies are on the critical path and must be resolved in order:

### Phase 1: Foundation (0-24h)
| From | Artifact | To | Blocking |
|------|----------|-----|----------|
| Lane 6 | SECURITY_BASELINE.md | All | Security requirements inform all design |
| Lane 6 | LEDGER_EVENT_SPEC.md | Lane 2 | Events table design |
| Lane 1 | spec-requirements.md | Lane 2 | Schema informed by requirements |

### Phase 2: Design (24-48h)
| From | Artifact | To | Blocking |
|------|----------|-----|----------|
| Lane 1 | roles-permissions.md | Lane 2 | RBAC policies |
| Lane 1 | q-modules-map.md | Lane 3 | UI screen scope |
| Lane 2 | schema-design.md | Lane 3 | Mock data structure |
| Lane 5 | EMAIL_PLATFORM_DECISION.md | Lane 2 | Message table design |

### Phase 3: Implementation (48-72h)
| From | Artifact | To | Blocking |
|------|----------|-----|----------|
| Lane 4 | MVP_GO_NOGO_MATRIX.md | All | Scope finalization |
| Lane 2 | rls-policies.md | Lane 6 | Security validation |

---

## Dependency Status Tracker

| ID | Upstream | Artifact | Downstream | Status | Notes |
|----|----------|----------|------------|--------|-------|
| D-001 | Lane 6 | SECURITY_BASELINE.md | All | IN_PROGRESS | |
| D-002 | Lane 6 | LEDGER_EVENT_SPEC.md | Lane 2 | IN_PROGRESS | |
| D-003 | Lane 1 | spec-requirements.md | Lane 2 | IN_PROGRESS | |
| D-004 | Lane 1 | roles-permissions.md | Lane 2 | PENDING | |
| D-005 | Lane 1 | q-modules-map.md | Lane 3 | PENDING | |
| D-006 | Lane 2 | schema-design.md | Lane 3 | PENDING | Waiting on D-003 |
| D-007 | Lane 5 | EMAIL_PLATFORM_DECISION.md | Lane 2 | IN_PROGRESS | |
| D-008 | Lane 4 | MVP_GO_NOGO_MATRIX.md | All | IN_PROGRESS | |

---

## Handling Dependency Delays

### If Upstream is Delayed

1. **Continue with assumptions**: Document assumptions explicitly
2. **Create placeholder**: Use "TBD pending [artifact]" markers
3. **Notify orchestrator**: Log in blockers if >4h delay
4. **Prepare for rework**: Plan time for updates when dependency arrives

### If Downstream is Blocked

1. **Prioritize completion**: Finish blocking work first
2. **Partial delivery**: Can you deliver a subset to unblock?
3. **Direct communication**: Reach out to blocked agent
4. **Escalate**: If multi-lane impact, notify orchestrator

---

## Parallel Work Opportunities

These tasks can proceed independently:

| Lane | Task | No Dependencies |
|------|------|-----------------|
| Lane 3 | Shell layout design | Can design with assumptions |
| Lane 3 | Component library | Generic components |
| Lane 4 | Fact sheet research | Independent research |
| Lane 5 | Platform research | Independent research |
| Lane 6 | CI gates setup | Infrastructure task |

---

## Resolved Dependencies Log

| Date | ID | Resolution | Notes |
|------|-----|-----------|-------|
| (none yet) | | | |

---

*Update this document as dependencies are created, resolved, or change status.*
