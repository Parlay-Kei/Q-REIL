# REIL/Q Execution Packet v0.2 — Gmail-First Inbox Spine

**Theme:** Gmail-first Inbox Spine
**Goal:** "Built-in CRM + email admin" becomes real inside Q, recorded inside REIL.
**Sprint Window:** 72 hours (follow-the-sun)
**Status:** ACTIVE

---

## North Star Outcome

> Ashley connects Gmail → Q ingests threads → emails + attachments auto-link to Contacts/Deals/Properties → everything shows inside the Q record timeline with a ledger audit trail.

---

## Scope Lock

### IN SCOPE (this sprint)
- Gmail OAuth connection (read-only MVP)
- Ingest threads/messages incrementally
- Store messages/threads/attachments in REIL
- Auto-attach rules (email → contact/company → record)
- Q Inbox UI (list + detail + attach action)
- Ledger events for every ingestion + attachment + manual attach
- Tests: dedupe/idempotency + rule behavior

### OUT OF SCOPE (later)
- Sending email from Q
- Shared inbox assignment / internal notes
- Templates/signatures
- Advanced parsing (address extraction, NLP classification)
- SkySlope write-back
- MLS/AIR CRE/Yardi connectors
- Microsoft Graph (deferred)

---

## Architecture Decision: Gmail-First

### Permissions / Scopes (MVP)
```
https://www.googleapis.com/auth/gmail.readonly
openid
https://www.googleapis.com/auth/userinfo.email
```

**Optional later:**
- `gmail.modify` (only if we apply labels/mark processed)

### Sync Strategy
| Aspect | Approach |
|--------|----------|
| Initial backfill | Last 30 days (configurable constant) |
| Incremental | Store and use Gmail `historyId` cursor |
| Idempotency | Key on Gmail `messageId`, `threadId`, attachment hash (SHA-256) |

---

## REIL Data Model Additions

### New Tables

#### `mailboxes`
```sql
CREATE TABLE mailboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL DEFAULT 'gmail' CHECK (provider IN ('gmail', 'microsoft')),
  provider_email TEXT NOT NULL,
  provider_subject_id TEXT, -- Google sub claim
  oauth_scopes TEXT[],
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'syncing')),
  last_history_id TEXT, -- Gmail historyId cursor
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(org_id, provider_email)
);
```

#### `mail_threads`
```sql
CREATE TABLE mail_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  provider_thread_id TEXT NOT NULL,
  subject TEXT,
  snippet TEXT,
  participant_emails TEXT[],
  message_count INT DEFAULT 0,
  has_attachments BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ,
  first_message_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT true,
  label_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mailbox_id, provider_thread_id)
);
```

#### `mail_messages`
```sql
CREATE TABLE mail_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES mail_threads(id) ON DELETE CASCADE,
  provider_message_id TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[],
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT,
  snippet TEXT,
  body_plain TEXT, -- stored but not indexed
  body_html TEXT, -- stored but not indexed
  sent_at TIMESTAMPTZ,
  internal_date BIGINT, -- Gmail internal timestamp
  raw_headers JSONB,
  label_ids TEXT[],
  has_attachments BOOLEAN DEFAULT false,
  size_estimate INT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mailbox_id, provider_message_id)
);
```

#### `mail_attachments`
```sql
CREATE TABLE mail_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
  provider_attachment_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT, -- Supabase storage path
  sha256 TEXT, -- content hash for dedupe
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(message_id, provider_attachment_id)
);
```

#### `record_links`
```sql
CREATE TABLE record_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),

  -- Source (what is being linked)
  source_type TEXT NOT NULL CHECK (source_type IN ('message', 'thread', 'attachment', 'document')),
  source_id UUID NOT NULL,

  -- Target (what it's linked to)
  target_type TEXT NOT NULL CHECK (target_type IN ('contact', 'company', 'deal', 'property', 'unit', 'leasing')),
  target_id UUID NOT NULL,

  -- Linking metadata
  confidence INT DEFAULT 100 CHECK (confidence BETWEEN 0 AND 100),
  link_method TEXT NOT NULL CHECK (link_method IN ('rule', 'manual', 'system')),
  rule_name TEXT, -- which rule matched (for debugging)

  linked_by UUID REFERENCES users(id), -- NULL for system/rule
  linked_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(source_type, source_id, target_type, target_id)
);
```

### Ledger Events (append-only)

| Event Type | Trigger | Required Payload |
|------------|---------|------------------|
| `MAILBOX_CONNECTED` | OAuth success | mailbox_id, provider_email |
| `MAILBOX_DISCONNECTED` | User disconnects | mailbox_id, reason |
| `SYNC_STARTED` | Backfill/incremental begins | mailbox_id, sync_type |
| `SYNC_COMPLETED` | Sync finishes | mailbox_id, threads_synced, messages_synced |
| `THREAD_INGESTED` | New thread created | thread_id, provider_thread_id |
| `MESSAGE_INGESTED` | New message created | message_id, thread_id, provider_message_id |
| `ATTACHMENT_SAVED` | Attachment stored | attachment_id, message_id, sha256 |
| `EMAIL_AUTO_ATTACHED` | Rule engine links | link_id, source_type, source_id, target_type, target_id, rule_name |
| `EMAIL_MANUALLY_ATTACHED` | User attaches | link_id, source_type, source_id, target_type, target_id |
| `EMAIL_UNLINKED` | User removes link | link_id |

---

## Q UI Deliverables

### Pages

#### `/inbox` - Thread List
- Thread list (subject, last activity, participants, linked record badge)
- Filter: "Unlinked only" toggle
- Filter: Date range
- Search: Subject/participant
- Pagination (50 per page)

#### `/inbox/thread/:id` - Thread Detail
- Message list (from, to, time, snippet, expandable body)
- Attachments list (download/preview)
- Linked records panel (shows where it attached)
- Action: "Attach to…" (manual attach flow)
- Action: "Unlink" (remove link)

#### Record View Integration
- On Deal/Property/Contact page: "Emails" tab showing linked threads/messages
- Chronological timeline integration

### Components Needed
- `ThreadListItem` - thread row with badges
- `MessageBubble` - individual message display
- `AttachmentChip` - attachment with download
- `RecordLinkBadge` - shows linked contact/deal
- `AttachToModal` - search and select record to attach

---

## Auto-Attach Rule Engine (MVP)

### Rule Priority Order

```
1. EXACT_EMAIL_MATCH
   - sender or any recipient matches contacts.email
   - → link thread to Contact (confidence: 100)

2. DOMAIN_MATCH
   - if @domain.com matches companies.domain
   - → link thread to Company (confidence: 80)

3. CONTACT_TO_RECORD_PROMOTION
   - if Contact linked AND Contact has exactly 1 active Deal or Property
   - → also link thread to that Deal/Property (confidence: 70)

4. AMBIGUOUS_MULTI_RECORD
   - if Contact has >1 active records
   - → DO NOT auto-attach to deal/property
   - → link only to Contact
   - → flag thread as "needs_routing"
```

### Hard Rules
- Never auto-attach if multiple candidate records tie
- Always link to Contact/Company first, then promote
- Log every rule execution in ledger

---

## Ticket Assignments

### Epic: SPEC
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| PO-001 | `project-orchestrator` | Create Sprint 0.2 board + lanes | P0 |

### Epic: AUTH
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| AUTH-101 | `auth-flow-agent` | Gmail OAuth connection (readonly) | P0 |

### Epic: BACKEND
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| DB-201 | `supabase-admin` | Create mailbox schema + RLS | P0 |
| BE-301 | `backend-dev` | Gmail ingestion service | P0 |
| BE-302 | `backend-dev` | Rule engine + linking endpoints | P0 |

### Epic: LEDGER
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| AUD-401 | `realtime-audit-agent` | Ledger event spec + enforcement | P0 |

### Epic: UI
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| FE-501 | `frontend-dev` | Q Inbox UI | P0 |
| FE-502 | `frontend-dev` | Record view email tab | P1 |
| UX-601 | `ui-ux-design-virtuoso` | Inbox UX spec | P0 |

### Epic: SECURITY
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| SEC-701 | `saas-security-auditor` | Gmail data handling baseline | P0 |

### Epic: QA
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| QA-801 | `backend-qa-automation-tester` | Ingestion regression tests | P0 |
| QA-802 | `pre-deployment-quality-auditor` | Release gate setup | P0 |

### Epic: OPS
| Ticket | Owner | Title | Priority |
|--------|-------|-------|----------|
| OPS-901 | `github-admin` + `infra-deployment-specialist` | Repo + env setup | P0 |

---

## Definition of Done

A ticket is "done" only if:

- [ ] It has tests (or explicit test plan for UI)
- [ ] It is idempotent (re-running does not duplicate data)
- [ ] It writes ledger events (if backend)
- [ ] It respects org isolation permissions
- [ ] It has a short note in docs for how to run/verify

---

## Success Criteria (72h)

| Criteria | Measurement |
|----------|-------------|
| Gmail OAuth works | User can connect Gmail, see status in UI |
| Ingestion works | 50+ messages ingested without duplicates |
| Attachments stored | Attachments in Supabase storage with SHA-256 |
| Auto-attach works | Emails link to contacts by email match |
| Manual attach works | User can attach thread to deal |
| Ledger complete | All events visible in audit view |
| Tests pass | CI green on ingestion + rule tests |
| No PII leaks | Email bodies not in logs |

---

## Handoff Cadence

Daily handoff note format (posted by project-orchestrator):

```
## Handoff [DATE] [TIMEZONE]

### Shipped
- [ticket]: [what shipped]

### Failed
- [ticket]: [what failed + why]

### Blocked
- [ticket]: [blocker + owner]

### Next (with owners)
- [ticket]: [next action] @owner
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gmail API rate limits | Medium | Medium | Batch requests, backoff |
| OAuth token refresh fails | Low | High | Background token refresh job |
| Large attachment storage | Medium | Medium | Size limits, async download |
| Rule engine false positives | Medium | Low | Low confidence scores, manual review |

---

## Sprint Command

> "Sprint 0.2 is Gmail-first. No other connectors. Ship inbox ingestion + attach + ledger visibility in 72 hours."

---

*Document Version: 0.2*
*Created: 2025-12-31*
*Status: ACTIVE*
