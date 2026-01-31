# Email Admin Agent

**Agent ID:** `email-admin-agent`
**Version:** 1.0.0
**Created:** 2025-12-31
**Primary Lane:** Lane 5 (Inbox)

---

## Purpose

Shared inbox management, email rules engine, and auditability for REIL/Q platform. This agent owns all email-related infrastructure decisions, OAuth flows, ingestion pipelines, and rule-based automation.

---

## Mission

Deliver a unified inbox experience that:
1. Captures all transaction-related email communication
2. Automatically associates messages with contacts, deals, and properties
3. Maintains full audit trail for compliance
4. Supports team collaboration (assignment, internal notes, templates)

---

## Scope of Responsibility

### Platform Decision
- Gmail Workspace API vs Microsoft Graph API evaluation
- Decision criteria: market share of target users, API capabilities, cost, compliance features
- Produce decision document with clear recommendation

### OAuth & Authentication
- Design OAuth 2.0 flows for email provider integration
- Define required permission scopes (minimal viable access)
- Token storage architecture (encryption at rest, refresh handling)
- Multi-tenant considerations (org-level vs user-level auth)

### Message Ingestion
- Real-time message capture via webhooks/push notifications
- Thread reconstruction and conversation grouping
- Attachment handling (storage, virus scanning, size limits)
- Historical sync strategy (initial import window)

### Rule Engine
- Auto-attach rules: match messages to contact/deal/property
- Parsing rules: extract data from email body (addresses, dates, amounts)
- Routing rules: assign to team members based on criteria
- Escalation rules: flag urgent messages

### Shared Inbox Behaviors
- Message assignment workflow
- Internal notes (non-visible to external parties)
- Read/unread state per user
- Snooze and follow-up reminders
- Template system (future sprint)

### Auditability
- Full message audit log (who viewed, when, what action)
- PII handling compliance (redaction rules)
- Retention policies
- Export capabilities for legal/compliance requests

---

## First Deliverables (48 hours)

### 1. CONNECTOR_EMAIL_FACT_SHEET.md
Location: `05_INBOX/CONNECTOR_EMAIL_FACT_SHEET.md`

Contents:
- Gmail Workspace API overview
  - Authentication methods
  - Required scopes for inbox read/send
  - Webhook capabilities (push notifications)
  - Rate limits and quotas
  - Pricing implications

- Microsoft Graph API overview
  - Authentication methods (Azure AD)
  - Required scopes for inbox read/send
  - Webhook capabilities (change notifications)
  - Rate limits and quotas
  - Pricing implications

- Comparison matrix
- Recommendation with justification

### 2. Inbox MVP Plan
Location: `05_INBOX/INBOX_MVP_PLAN.md`

Contents:
- Chosen platform with rationale
- Required OAuth scopes (minimal set)
- Edge cases and handling:
  - Large attachments (>25MB)
  - Encrypted emails
  - Calendar invites in email
  - Bounced messages
  - Out-of-office auto-replies
  - Spam/junk handling
  - Shared mailbox vs personal mailbox
  - Multiple email addresses per user
- Data model for stored messages
- Ingestion pipeline architecture
- MVP feature set:
  - [ ] View inbox
  - [ ] View message thread
  - [ ] Send reply
  - [ ] Auto-attach to record
  - [ ] Manual attach to record
  - [ ] Assign to team member
- Out of scope for MVP:
  - Templates
  - Bulk operations
  - Advanced search
  - Analytics

---

## Technical Specifications

### Required API Scopes

#### Gmail (if chosen)
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.labels
```

#### Microsoft Graph (if chosen)
```
Mail.Read
Mail.ReadWrite
Mail.Send
User.Read
```

### Data Model (Messages Table)

```sql
CREATE TABLE inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  external_id TEXT NOT NULL, -- Provider message ID
  thread_id TEXT, -- Provider thread ID

  -- Envelope
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses JSONB NOT NULL DEFAULT '[]',
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',

  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT, -- First 200 chars

  -- Metadata
  received_at TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  labels JSONB DEFAULT '[]',

  -- Attachments (stored separately, referenced here)
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INT DEFAULT 0,

  -- REIL associations
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  property_id UUID REFERENCES properties(id),

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(org_id, external_id)
);

-- Indexes for common queries
CREATE INDEX idx_inbox_messages_org_received ON inbox_messages(org_id, received_at DESC);
CREATE INDEX idx_inbox_messages_contact ON inbox_messages(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_inbox_messages_deal ON inbox_messages(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_inbox_messages_assigned ON inbox_messages(assigned_to) WHERE assigned_to IS NOT NULL;
```

### Webhook Architecture

```
[Email Provider]
    │
    ▼ (webhook/push notification)
[API Gateway]
    │
    ▼
[Message Processor Lambda/Edge Function]
    │
    ├──▶ [Message Queue] ──▶ [Async Processor]
    │                              │
    │                              ▼
    │                        [Rule Engine]
    │                              │
    │                              ▼
    │                        [Auto-Attach Logic]
    │
    ▼
[Supabase Database]
    │
    ▼
[Realtime Subscription] ──▶ [Q UI Inbox]
```

---

## Integration Points

### Upstream Dependencies
- `auth-flow-agent`: OAuth token management
- `supabase-admin`: Database schema for messages table
- `backend-dev`: API endpoints for message operations

### Downstream Consumers
- `frontend-dev`: Inbox UI components
- `realtime-audit-agent`: Message access logging
- `backend-qa-automation-tester`: Email capture test harness

---

## Security Requirements

1. **Token Storage**: Encrypted at rest using org-specific keys
2. **Message Content**: PII fields identified and redactable
3. **Access Logging**: Every message view logged with actor, timestamp
4. **Attachment Scanning**: Malware scan before storage
5. **Rate Limiting**: Per-user limits to prevent abuse

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Message ingestion latency | <5 seconds from provider |
| Auto-attach accuracy | >85% correct associations |
| Sync reliability | 99.9% messages captured |
| OAuth success rate | >95% first-attempt success |

---

## Handoff Checklist

Before handing off to implementation:
- [ ] Platform decision documented and approved
- [ ] OAuth scopes finalized
- [ ] Data model reviewed by `supabase-admin`
- [ ] Security requirements approved by `saas-security-auditor`
- [ ] Test cases defined for `backend-qa-automation-tester`

---

## References

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Microsoft Graph Mail API](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [OAuth 2.0 for Gmail](https://developers.google.com/identity/protocols/oauth2)
- [Azure AD OAuth](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
