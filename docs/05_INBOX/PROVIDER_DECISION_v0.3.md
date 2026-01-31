# Provider Decision v0.3 — Gmail First

**Document ID:** PROVIDER_DECISION_v0.3
**Version:** 1.0.0
**Created:** 2025-12-31
**Status:** APPROVED
**Decision Maker:** Project Orchestrator
**Effective Sprint:** 0.3

---

## Executive Summary

**Sprint 0.3 Provider: Gmail (Google APIs)**

Microsoft Graph (Outlook) deferred to Phase 1.2 or 1.3.

This keeps the narrative clean and the code honest.

---

## Decision Matrix

| Sprint | Provider | Scope | Rationale |
|--------|----------|-------|-----------|
| **0.3 (Current)** | Gmail API | Read-only OAuth, 30-day sync | Faster to verify, simpler OAuth, Ashley's primary mailbox |
| 1.2 or 1.3 | Microsoft Graph | Full Outlook integration | Enterprise expansion after Gmail spine is proven |

---

## Why Gmail First (Reversing Previous Decision)

The EMAIL_PLATFORM_DECISION.md recommended Microsoft Graph based on market share analysis. However, for Sprint 0.3 MVP spine, we are explicitly choosing Gmail because:

### 1. Proof-of-Concept Speed

| Factor | Gmail | Microsoft |
|--------|-------|-----------|
| OAuth setup complexity | Lower | Higher (Azure AD) |
| Ashley's active mailbox | Gmail | Not primary |
| API learning curve | Simpler | More enterprise |
| Time to first proof | Hours | Days |

### 2. The Underwater Glass Elevator Principle

> "The MVP spine is a glass elevator underwater, and every bolt you tighten changes the pressure in rooms you forgot existed."

Gmail-first means:
- Fewer moving parts during core loop validation
- Faster iteration on ingestion + attach patterns
- Provider abstraction gets built with real data

### 3. Defer Complexity, Not Value

Microsoft Graph adds:
- Azure AD app registration
- Tenant configuration
- Shared mailbox complexity

These are valuable for enterprise. They are not needed to prove the loop works.

---

## Sprint 0.3 OAuth Scope Strategy

### Minimum Viable (Read-Only)

```
https://www.googleapis.com/auth/gmail.readonly
openid
email
profile
```

### Explicitly Avoided

| Scope | Reason |
|-------|--------|
| `gmail.send` | No sending in 0.3 |
| `gmail.modify` | No label modifications |
| `gmail.compose` | No draft creation |

---

## Microsoft Graph Roadmap

### Phase 1.2 or 1.3 Scope

When Microsoft Graph is added:

1. **Provider Abstraction** - Already built for Gmail
2. **OAuth Flow** - Add Microsoft identity platform
3. **Unified Data Model** - Same tables, different provider column
4. **Feature Parity** - Match Gmail capabilities

### Enterprise Features (Microsoft-specific)

- Shared mailboxes for team inbox
- Delegated access (send on behalf)
- Calendar integration (same API)
- Teams presence (future)

---

## Implementation Guard Rails

### Provider Column in Schema

```sql
-- mailboxes table already supports multiple providers
provider TEXT NOT NULL DEFAULT 'gmail' CHECK (provider IN ('gmail', 'microsoft'))
```

### Provider Interface Pattern

```typescript
interface EmailProvider {
  name: 'gmail' | 'microsoft';

  // OAuth
  getAuthUrl(): string;
  handleCallback(code: string): Promise<TokenSet>;
  refreshToken(refreshToken: string): Promise<TokenSet>;

  // Sync
  listThreads(params: ListParams): Promise<Thread[]>;
  getThread(threadId: string): Promise<ThreadDetail>;
  getAttachment(messageId: string, attachmentId: string): Promise<Attachment>;

  // Cursor
  getHistoryId(): Promise<string>;
  getSyncDelta(since: string): Promise<SyncDelta>;
}
```

---

## Definition of Done for Provider Decision

- [x] Decision documented and explicit
- [x] Previous recommendation acknowledged and superseded
- [x] Sprint 0.3 scoped to Gmail only
- [x] Microsoft Graph deferred with roadmap
- [x] Provider abstraction pattern defined
- [ ] Sprint 0.3 OAuth proof posted

---

## Supersedes

This document supersedes the Microsoft Graph recommendation in:
- `EMAIL_PLATFORM_DECISION.md` (for Sprint 0.3 only)

The market share analysis in that document remains valid for Phase 1.2+ planning.

---

*Document Version: 1.0.0*
*Created: 2025-12-31*
*Approved By: Project Orchestrator*
