# Definition of Done & Handoff Rules

**Document Version:** 1.0
**Effective:** Sprint 0.1 onwards
**Owner:** `project-orchestrator`

---

## Definition of Done (DoD)

Every deliverable in REIL/Q must meet ALL applicable criteria before being marked DONE.

### Code Deliverables

- [ ] **Functionality**: Implements the specified requirements
- [ ] **Code Review**: Reviewed by at least one other agent or human
- [ ] **Tests**: Unit tests written and passing (>80% coverage for new code)
- [ ] **Type Safety**: No TypeScript errors (`tsc --noEmit` passes)
- [ ] **Linting**: No ESLint errors or warnings
- [ ] **Security**: No hardcoded secrets, PII handled per policy
- [ ] **Documentation**: Inline comments for complex logic
- [ ] **Committed**: Merged to main branch via PR

### Schema/Migration Deliverables

- [ ] **Design Review**: Schema reviewed by `supabase-admin`
- [ ] **Migration File**: Properly versioned migration created
- [ ] **Rollback**: Down migration tested
- [ ] **RLS Policies**: Appropriate policies applied
- [ ] **Indexes**: Performance indexes added where needed
- [ ] **Types Generated**: TypeScript types regenerated
- [ ] **Tested**: Verified in staging environment

### API Deliverables

- [ ] **Endpoint Working**: Returns expected responses
- [ ] **Error Handling**: Proper error codes and messages
- [ ] **Validation**: Input validation in place
- [ ] **Auth**: Authentication/authorization enforced
- [ ] **Rate Limiting**: Limits applied if public-facing
- [ ] **Documented**: OpenAPI spec updated
- [ ] **Tested**: API contract tests passing

### UI Deliverables

- [ ] **Renders**: Component renders without errors
- [ ] **Responsive**: Works on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] **Accessible**: Basic a11y (keyboard nav, aria labels)
- [ ] **Loading States**: Skeleton/spinner during data fetch
- [ ] **Error States**: User-friendly error messages
- [ ] **Empty States**: Graceful handling of no data
- [ ] **Tested**: Component tests passing
- [ ] **Design Review**: Matches approved design/wireframe

### Research/Spike Deliverables

- [ ] **Documented**: Findings written in specified format
- [ ] **Evidence**: Screenshots/logs attached for claims
- [ ] **Recommendation**: Clear go/no-go with rationale
- [ ] **Reproducible**: Steps documented for others to verify
- [ ] **Archived**: All artifacts stored in correct location

### Specification Deliverables

- [ ] **Complete**: All required sections filled
- [ ] **Reviewed**: Stakeholder review completed
- [ ] **Acceptance Criteria**: Each item is testable
- [ ] **No Ambiguity**: Clear enough for implementation
- [ ] **Approved**: Sign-off from product owner

---

## Handoff Protocol

### Step 1: Completion Signal

When completing a task, the owning agent:

1. Updates task status to `DONE` in Sprint Board
2. Creates handoff document (if cross-lane dependency)
3. Posts completion summary

**Completion Summary Template:**
```markdown
## Handoff: [Task ID] - [Task Name]

**Completed By:** [agent-name]
**Completed At:** [timestamp]
**Artifacts:**
- [list of files/deliverables]

**Summary:**
[2-3 sentences describing what was done]

**For Downstream:**
[any notes for the receiving agent/lane]

**Blockers Found:**
[any issues discovered that affect other work]
```

### Step 2: Handoff Document Location

All handoff documents go to: `00_PROJECT/handoffs/`

Naming convention: `[YYYY-MM-DD]_[TASK-ID]_[from-agent]_to_[to-agent].md`

Example: `2025-12-31_L1-006_spec-requirements_to_supabase-admin.md`

### Step 3: Receiving Acknowledgment

The receiving agent/lane must:

1. Acknowledge receipt within 2 hours
2. Review handoff materials
3. Raise any questions/blockers immediately
4. Update Sprint Board with IN_PROGRESS status when starting

**Acknowledgment Template:**
```markdown
## Acknowledged: [Task ID]

**Received By:** [agent-name]
**Received At:** [timestamp]
**Questions:** [none / list]
**Starting Work:** [timestamp]
```

### Step 4: Orchestrator Validation

The `project-orchestrator`:

1. Reviews handoff for completeness
2. Validates DoD criteria met
3. Updates cross-lane dependencies
4. Clears any escalations

---

## Blocking Issue Protocol

### Definition of Blocking

A task is BLOCKED when:
- Missing input from another lane (dependency not met)
- Technical impossibility discovered
- External dependency unavailable (API down, credentials missing)
- Clarification needed from stakeholder
- Security concern requires resolution

### Escalation Process

1. **Immediate**: Post in blockers section of Sprint Board
2. **Format**: `BLOCKED: [Task ID] - [Brief description]`
3. **Details**: Document in `00_PROJECT/blockers/`
4. **Timeout**: If not resolved in 4 hours, escalate to orchestrator

**Blocker Document Template:**
```markdown
## Blocker: [Task ID]

**Raised By:** [agent-name]
**Raised At:** [timestamp]
**Severity:** [Critical/High/Medium]

### Description
[What is blocked and why]

### Impact
[What else is affected]

### Proposed Resolution
[Suggested path forward]

### Help Needed From
[Who needs to act]
```

### Resolution

When blocker is resolved:
1. Update blocker document with resolution
2. Update Sprint Board (remove from blockers)
3. Notify affected agents
4. Resume blocked work

---

## Communication Cadence

### Async Standups

Every 8 hours, each lane posts status update:

**Location:** `00_PROJECT/standups/[YYYY-MM-DD]_[HH]h.md`

**Format:**
```markdown
## Lane [X] Standup - [timestamp]

### Done (last 8h)
- [task completed]

### In Progress
- [current task] - [% complete]

### Up Next
- [planned task]

### Blockers
- [none / list]

### Notes
- [any important observations]
```

### Sync Checkpoints

Major sync points at:
- **24h mark**: Spec review + schema kickoff
- **48h mark**: Mid-sprint review
- **72h mark**: Sprint close + retrospective

### Urgent Communication

For critical issues:
- Prefix message with `URGENT:` in standups
- Create blocker document immediately
- Tag `project-orchestrator` directly

---

## Quality Gates

### Gate 1: Pre-Commit
- Local tests passing
- No linting errors
- No type errors

### Gate 2: Pre-Merge
- CI pipeline green
- Code review approved
- No security warnings

### Gate 3: Pre-Deploy
- All DoD criteria verified
- Integration tests passing
- Staging environment validated

### Gate 4: Post-Deploy
- Smoke tests passing
- No error spikes in monitoring
- Rollback plan ready

---

## Version Control Standards

### Branch Naming
```
feature/[lane]-[task-id]-[brief-description]
fix/[lane]-[task-id]-[brief-description]
spike/[lane]-[task-id]-[brief-description]
```

### Commit Messages
```
[LANE-TASK] Brief description

- Detail 1
- Detail 2

Refs: #issue-number (if applicable)
```

### PR Template
```markdown
## Summary
[What this PR does]

## Task Reference
[Sprint Board task ID]

## Changes
- [List of changes]

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Integration tests passing

## Screenshots
[If UI changes]

## Checklist
- [ ] DoD criteria met
- [ ] Documentation updated
- [ ] No secrets committed
```

---

## Artifact Locations

| Artifact Type | Location |
|--------------|----------|
| Execution Packets | `00_PROJECT/` |
| Sprint Board | `00_PROJECT/SPRINT_BOARD.md` |
| Handoffs | `00_PROJECT/handoffs/` |
| Standups | `00_PROJECT/standups/` |
| Blockers | `00_PROJECT/blockers/` |
| Specifications | `01_SPEC/` |
| Schema/Migrations | `02_DATA/` |
| UI Components | `03_UI/` |
| Connector Research | `04_CONNECTORS/` |
| Inbox Materials | `05_INBOX/` |
| QA/Security | `06_QA/` |
| Agent Specs | `agents/` |

---

*This document is the source of truth for completion standards and handoff procedures. All agents must follow these protocols.*
