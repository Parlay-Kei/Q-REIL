# Gmail Ledger Events Specification

**Version:** 1.0.0
**Sprint:** v0.2 - Gmail-First Inbox Spine
**Last Updated:** 2025-12-31
**Owner:** realtime-audit-agent
**Status:** Active

---

## 1. Document Purpose

This document defines Gmail-specific event types, schemas, and enforcement patterns for the REIL/Q audit ledger. This extends the base `LEDGER_EVENT_SPEC.md` with events specific to Gmail integration, email ingestion, and attachment workflows.

**North Star Compliance:**
- Every Gmail operation (sync, attachment, link) must emit a ledger event
- Complete audit trail from mailbox connection → ingestion → auto-attach → manual override
- No email body content in ledger (PII protection)
- Correlation IDs enable workflow tracing

---

## 2. Gmail Event Types

### 2.1 Event Taxonomy

**Mailbox Lifecycle:**
```typescript
'mailbox.connected'       // OAuth success, mailbox activated
'mailbox.disconnected'    // User or system disconnects mailbox
'mailbox.error'          // Token refresh failure, API error
```

**Sync Operations:**
```typescript
'sync.started'           // Backfill or incremental sync begins
'sync.completed'         // Sync finishes successfully
'sync.failed'            // Sync failed with errors
```

**Ingestion Events:**
```typescript
'thread.ingested'        // New mail_thread created
'message.ingested'       // New mail_message created
'attachment.saved'       // Attachment stored in Supabase storage
```

**Linking Events:**
```typescript
'email.auto_attached'    // Rule engine linked thread/message to record
'email.manually_attached' // User manually attached to record
'email.unlinked'         // User removed link
```

---

## 3. Event Schemas

### 3.1 MAILBOX_CONNECTED

**Trigger:** User completes Gmail OAuth, access token obtained
**Actor:** user
**Entity:** mailbox

**Schema:**
```typescript
{
  // Standard fields
  org_id: UUID,              // Required
  actor_id: UUID,            // User who connected mailbox
  actor_type: 'user',        // Required
  event_type: 'mailbox.connected',
  entity_type: 'mailbox',
  entity_id: UUID,           // mailbox.id

  // Event-specific payload
  payload: {
    provider: 'gmail',                    // Always 'gmail' for this sprint
    provider_email: string,               // Gmail address (PII - mark for redaction)
    provider_subject_id: string,          // Google 'sub' claim
    oauth_scopes: string[],               // e.g., ['gmail.readonly', 'openid']
    initial_status: 'connected',
    backfill_days: number,                // e.g., 30 (configurable constant)
  },

  correlation_id: null,      // Not part of workflow chain
  source: 'ui',              // User-initiated via UI
  ip_address: string,        // User IP (redacted)
  user_agent: string,        // Browser user agent
  created_at: timestamp,     // Auto-generated
}
```

**Example Payload:**
```json
{
  "event_type": "mailbox.connected",
  "actor_type": "user",
  "actor_id": "550e8400-e29b-41d4-a716-446655440001",
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "provider": "gmail",
    "provider_email": "ashley@example.com",
    "provider_subject_id": "110248495921238986420",
    "oauth_scopes": [
      "https://www.googleapis.com/auth/gmail.readonly",
      "openid",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    "initial_status": "connected",
    "backfill_days": 30
  },
  "correlation_id": null,
  "source": "ui",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "created_at": "2025-12-31T10:15:30Z"
}
```

**PII Fields to Redact:**
- `payload.provider_email` → `a******@example.com`
- `ip_address` → `203.0.113.*.*`

---

### 3.2 MAILBOX_DISCONNECTED

**Trigger:** User disconnects mailbox OR system revokes due to auth failure
**Actor:** user or system
**Entity:** mailbox

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: UUID | null,     // NULL if system-initiated
  actor_type: 'user' | 'system',
  event_type: 'mailbox.disconnected',
  entity_type: 'mailbox',
  entity_id: UUID,

  payload: {
    provider_email: string,   // PII - redact
    reason: string,           // 'user_requested' | 'token_revoked' | 'auth_failed'
    final_status: 'disconnected',
    last_sync_at: timestamp | null,
    message_count: number,    // Total messages ingested before disconnect
  },

  correlation_id: null,
  source: 'ui' | 'system',
  ip_address: string | null,
  user_agent: string | null,
  created_at: timestamp,
}
```

**Example Payload (User-initiated):**
```json
{
  "event_type": "mailbox.disconnected",
  "actor_type": "user",
  "actor_id": "550e8400-e29b-41d4-a716-446655440001",
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "provider_email": "ashley@example.com",
    "reason": "user_requested",
    "final_status": "disconnected",
    "last_sync_at": "2025-12-31T09:45:00Z",
    "message_count": 1247
  },
  "correlation_id": null,
  "source": "ui",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0",
  "created_at": "2025-12-31T10:20:00Z"
}
```

**Example Payload (System-initiated):**
```json
{
  "event_type": "mailbox.disconnected",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "provider_email": "ashley@example.com",
    "reason": "token_revoked",
    "final_status": "disconnected",
    "last_sync_at": "2025-12-30T14:30:00Z",
    "message_count": 1247
  },
  "correlation_id": null,
  "source": "system",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:25:00Z"
}
```

---

### 3.3 MAILBOX_ERROR

**Trigger:** Token refresh fails, API quota exceeded, network error
**Actor:** system
**Entity:** mailbox

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,            // System-initiated
  actor_type: 'system',
  event_type: 'mailbox.error',
  entity_type: 'mailbox',
  entity_id: UUID,

  payload: {
    provider_email: string,   // PII - redact
    error_type: string,       // 'token_refresh_failed' | 'api_quota_exceeded' | 'network_error'
    error_message: string,    // Error message (sanitized, no PII)
    http_status: number | null, // e.g., 401, 429
    retry_count: number,      // Number of retry attempts
    will_retry: boolean,      // Whether system will auto-retry
    next_retry_at: timestamp | null,
  },

  correlation_id: UUID | null, // If error occurs during sync, use sync correlation_id
  source: 'system',
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "mailbox.error",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "provider_email": "ashley@example.com",
    "error_type": "token_refresh_failed",
    "error_message": "OAuth token refresh failed: invalid_grant",
    "http_status": 401,
    "retry_count": 3,
    "will_retry": false,
    "next_retry_at": null
  },
  "correlation_id": null,
  "source": "system",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:30:00Z"
}
```

---

### 3.4 SYNC_STARTED

**Trigger:** Backfill sync begins (initial 30 days) OR incremental sync starts
**Actor:** system
**Entity:** mailbox

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,            // System-initiated
  actor_type: 'system',
  event_type: 'sync.started',
  entity_type: 'mailbox',
  entity_id: UUID,

  payload: {
    sync_type: 'backfill' | 'incremental',
    mailbox_id: UUID,
    provider_email: string,   // PII - redact
    history_id_start: string | null, // Gmail historyId cursor (null for backfill)
    backfill_days: number | null, // e.g., 30 (only for backfill)
    estimated_message_count: number | null, // If known from API
  },

  correlation_id: UUID,      // REQUIRED: All sync events share this ID
  source: 'cron' | 'system', // 'cron' for scheduled, 'system' for triggered
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload (Backfill):**
```json
{
  "event_type": "sync.started",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "sync_type": "backfill",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_email": "ashley@example.com",
    "history_id_start": null,
    "backfill_days": 30,
    "estimated_message_count": null
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "system",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:35Z"
}
```

**Example Payload (Incremental):**
```json
{
  "event_type": "sync.started",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "sync_type": "incremental",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_email": "ashley@example.com",
    "history_id_start": "1234567890",
    "backfill_days": null,
    "estimated_message_count": null
  },
  "correlation_id": "950e8400-e29b-41d4-a716-446655440005",
  "source": "cron",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T11:00:00Z"
}
```

---

### 3.5 SYNC_COMPLETED

**Trigger:** Sync finishes successfully
**Actor:** system
**Entity:** mailbox

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,
  actor_type: 'system',
  event_type: 'sync.completed',
  entity_type: 'mailbox',
  entity_id: UUID,

  payload: {
    sync_type: 'backfill' | 'incremental',
    mailbox_id: UUID,
    provider_email: string,   // PII - redact
    threads_synced: number,   // New threads created
    messages_synced: number,  // New messages created
    attachments_saved: number, // New attachments stored
    history_id_end: string,   // Gmail historyId cursor (for next sync)
    duration_ms: number,      // Sync duration in milliseconds
  },

  correlation_id: UUID,      // SAME as sync.started
  source: 'cron' | 'system',
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "sync.completed",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "sync_type": "backfill",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_email": "ashley@example.com",
    "threads_synced": 42,
    "messages_synced": 127,
    "attachments_saved": 18,
    "history_id_end": "9876543210",
    "duration_ms": 12450
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "system",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:47Z"
}
```

---

### 3.6 SYNC_FAILED

**Trigger:** Sync fails due to API error, network timeout, etc.
**Actor:** system
**Entity:** mailbox

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,
  actor_type: 'system',
  event_type: 'sync.failed',
  entity_type: 'mailbox',
  entity_id: UUID,

  payload: {
    sync_type: 'backfill' | 'incremental',
    mailbox_id: UUID,
    provider_email: string,   // PII - redact
    error_type: string,       // 'api_error' | 'network_timeout' | 'rate_limit'
    error_message: string,    // Sanitized error message
    http_status: number | null,
    threads_synced_before_failure: number,
    messages_synced_before_failure: number,
    will_retry: boolean,
    next_retry_at: timestamp | null,
    duration_ms: number,      // Sync duration before failure
  },

  correlation_id: UUID,      // SAME as sync.started
  source: 'cron' | 'system',
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "sync.failed",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mailbox",
  "entity_id": "750e8400-e29b-41d4-a716-446655440003",
  "payload": {
    "sync_type": "incremental",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_email": "ashley@example.com",
    "error_type": "rate_limit",
    "error_message": "Gmail API quota exceeded: 429 Too Many Requests",
    "http_status": 429,
    "threads_synced_before_failure": 5,
    "messages_synced_before_failure": 12,
    "will_retry": true,
    "next_retry_at": "2025-12-31T12:00:00Z",
    "duration_ms": 3200
  },
  "correlation_id": "950e8400-e29b-41d4-a716-446655440005",
  "source": "cron",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T11:00:03Z"
}
```

---

### 3.7 THREAD_INGESTED

**Trigger:** New mail_thread row created in database
**Actor:** system
**Entity:** mail_thread

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,
  actor_type: 'system',
  event_type: 'thread.ingested',
  entity_type: 'mail_thread',
  entity_id: UUID,           // mail_threads.id

  payload: {
    thread_id: UUID,          // Same as entity_id
    mailbox_id: UUID,
    provider_thread_id: string, // Gmail thread ID
    subject: string,          // Thread subject (may be empty for drafts)
    participant_emails: string[], // All from/to/cc emails (PII - redact)
    message_count: number,    // Number of messages in thread
    has_attachments: boolean,
    first_message_at: timestamp,
    last_message_at: timestamp,
  },

  correlation_id: UUID,      // SAME as parent sync operation
  source: 'connector',       // Gmail connector ingested this
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "thread.ingested",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mail_thread",
  "entity_id": "a50e8400-e29b-41d4-a716-446655440006",
  "payload": {
    "thread_id": "a50e8400-e29b-41d4-a716-446655440006",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_thread_id": "18c5f2b8a4f3e1d7",
    "subject": "Re: Listing on 123 Main St",
    "participant_emails": [
      "ashley@example.com",
      "buyer@gmail.com",
      "listing-agent@realty.com"
    ],
    "message_count": 3,
    "has_attachments": true,
    "first_message_at": "2025-12-28T14:30:00Z",
    "last_message_at": "2025-12-30T09:15:00Z"
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "connector",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:40Z"
}
```

**PII Fields to Redact:**
- `payload.participant_emails[]` → `["a******@example.com", "b****@gmail.com", ...]`

---

### 3.8 MESSAGE_INGESTED

**Trigger:** New mail_message row created in database
**Actor:** system
**Entity:** mail_message

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,
  actor_type: 'system',
  event_type: 'message.ingested',
  entity_type: 'mail_message',
  entity_id: UUID,           // mail_messages.id

  payload: {
    message_id: UUID,         // Same as entity_id
    thread_id: UUID,          // Parent thread
    mailbox_id: UUID,
    provider_message_id: string, // Gmail message ID
    from_email: string,       // PII - redact
    from_name: string | null, // PII - redact
    to_emails: string[],      // PII - redact
    subject: string,
    snippet: string,          // First 200 chars preview
    has_attachments: boolean,
    attachment_count: number,
    sent_at: timestamp,
    size_estimate: number,    // Bytes
  },

  correlation_id: UUID,      // SAME as parent sync operation
  source: 'connector',
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "message.ingested",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mail_message",
  "entity_id": "b50e8400-e29b-41d4-a716-446655440007",
  "payload": {
    "message_id": "b50e8400-e29b-41d4-a716-446655440007",
    "thread_id": "a50e8400-e29b-41d4-a716-446655440006",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_message_id": "18c5f2b8a4f3e1d7001",
    "from_email": "listing-agent@realty.com",
    "from_name": "Jane Doe",
    "to_emails": ["ashley@example.com"],
    "subject": "Re: Listing on 123 Main St",
    "snippet": "Hi Ashley, I've attached the updated disclosure forms. Please review and let me know if you have questions.",
    "has_attachments": true,
    "attachment_count": 2,
    "sent_at": "2025-12-30T09:15:00Z",
    "size_estimate": 245678
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "connector",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:41Z"
}
```

**PII Fields to Redact:**
- `payload.from_email` → `l*************@realty.com`
- `payload.from_name` → `J*** D**`
- `payload.to_emails[]` → `["a******@example.com"]`

**CRITICAL:** Email body (plain/html) is stored in `mail_messages.body_plain/body_html` but NEVER included in ledger payloads.

---

### 3.9 ATTACHMENT_SAVED

**Trigger:** Attachment file downloaded from Gmail and stored in Supabase Storage
**Actor:** system
**Entity:** mail_attachment

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,
  actor_type: 'system',
  event_type: 'attachment.saved',
  entity_type: 'mail_attachment',
  entity_id: UUID,           // mail_attachments.id

  payload: {
    attachment_id: UUID,      // Same as entity_id
    message_id: UUID,         // Parent message
    thread_id: UUID,          // Parent thread
    mailbox_id: UUID,
    provider_attachment_id: string, // Gmail attachment ID
    filename: string,
    mime_type: string,
    size_bytes: number,
    storage_path: string,     // Supabase storage bucket path
    sha256: string,           // Content hash for deduplication
    is_duplicate: boolean,    // If SHA-256 already exists
    existing_attachment_id: UUID | null, // If duplicate, ID of original
  },

  correlation_id: UUID,      // SAME as parent sync operation
  source: 'connector',
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "attachment.saved",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "mail_attachment",
  "entity_id": "c50e8400-e29b-41d4-a716-446655440008",
  "payload": {
    "attachment_id": "c50e8400-e29b-41d4-a716-446655440008",
    "message_id": "b50e8400-e29b-41d4-a716-446655440007",
    "thread_id": "a50e8400-e29b-41d4-a716-446655440006",
    "mailbox_id": "750e8400-e29b-41d4-a716-446655440003",
    "provider_attachment_id": "ANGjdJ8wR3K1fF2xQ0ZmYhQdZYz9",
    "filename": "disclosure_form.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 145678,
    "storage_path": "org-650e8400/attachments/c50e8400-disclosure_form.pdf",
    "sha256": "a3d5e1f7c8b9d2e4f6a8c0b1d3e5f7a9b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0",
    "is_duplicate": false,
    "existing_attachment_id": null
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "connector",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:42Z"
}
```

**Deduplication Logic:**
- If `sha256` already exists in `mail_attachments` for this org, set `is_duplicate: true`
- Reference original attachment in `existing_attachment_id`
- Still create new row (don't skip) for audit trail completeness

---

### 3.10 EMAIL_AUTO_ATTACHED

**Trigger:** Rule engine automatically links thread/message to Contact/Company/Deal/Property
**Actor:** system
**Entity:** record_link

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: null,            // System/rule engine
  actor_type: 'system',
  event_type: 'email.auto_attached',
  entity_type: 'record_link',
  entity_id: UUID,           // record_links.id

  payload: {
    link_id: UUID,            // Same as entity_id
    source_type: 'thread' | 'message' | 'attachment',
    source_id: UUID,          // mail_threads.id, mail_messages.id, or mail_attachments.id
    target_type: 'contact' | 'company' | 'deal' | 'property' | 'unit' | 'leasing',
    target_id: UUID,          // ID of linked record
    rule_name: string,        // e.g., 'EXACT_EMAIL_MATCH', 'DOMAIN_MATCH'
    confidence: number,       // 0-100 (per rule engine rules)
    match_details: {
      matched_email: string | null, // PII - redact
      matched_domain: string | null,
      contact_id: UUID | null, // If promoted from contact
      promotion_path: string | null, // e.g., 'contact->deal'
    },
  },

  correlation_id: UUID,      // SAME as parent sync operation (if during sync)
  source: 'connector',       // Rule engine runs during ingestion
  ip_address: null,
  user_agent: null,
  created_at: timestamp,
}
```

**Example Payload (Exact Email Match):**
```json
{
  "event_type": "email.auto_attached",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "record_link",
  "entity_id": "d50e8400-e29b-41d4-a716-446655440009",
  "payload": {
    "link_id": "d50e8400-e29b-41d4-a716-446655440009",
    "source_type": "thread",
    "source_id": "a50e8400-e29b-41d4-a716-446655440006",
    "target_type": "contact",
    "target_id": "e50e8400-e29b-41d4-a716-446655440010",
    "rule_name": "EXACT_EMAIL_MATCH",
    "confidence": 100,
    "match_details": {
      "matched_email": "buyer@gmail.com",
      "matched_domain": null,
      "contact_id": null,
      "promotion_path": null
    }
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "connector",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:43Z"
}
```

**Example Payload (Contact-to-Deal Promotion):**
```json
{
  "event_type": "email.auto_attached",
  "actor_type": "system",
  "actor_id": null,
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "record_link",
  "entity_id": "d50e8400-e29b-41d4-a716-446655440011",
  "payload": {
    "link_id": "d50e8400-e29b-41d4-a716-446655440011",
    "source_type": "thread",
    "source_id": "a50e8400-e29b-41d4-a716-446655440006",
    "target_type": "deal",
    "target_id": "f50e8400-e29b-41d4-a716-446655440012",
    "rule_name": "CONTACT_TO_RECORD_PROMOTION",
    "confidence": 70,
    "match_details": {
      "matched_email": null,
      "matched_domain": null,
      "contact_id": "e50e8400-e29b-41d4-a716-446655440010",
      "promotion_path": "contact->deal"
    }
  },
  "correlation_id": "850e8400-e29b-41d4-a716-446655440004",
  "source": "connector",
  "ip_address": null,
  "user_agent": null,
  "created_at": "2025-12-31T10:15:44Z"
}
```

**PII Fields to Redact:**
- `payload.match_details.matched_email` → `b****@gmail.com`

---

### 3.11 EMAIL_MANUALLY_ATTACHED

**Trigger:** User manually attaches thread/message/attachment to record via UI
**Actor:** user
**Entity:** record_link

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: UUID,            // User who performed action
  actor_type: 'user',
  event_type: 'email.manually_attached',
  entity_type: 'record_link',
  entity_id: UUID,           // record_links.id

  payload: {
    link_id: UUID,            // Same as entity_id
    source_type: 'thread' | 'message' | 'attachment',
    source_id: UUID,
    target_type: 'contact' | 'company' | 'deal' | 'property' | 'unit' | 'leasing',
    target_id: UUID,
    confidence: 100,          // Manual links always 100
    link_method: 'manual',
    previous_link_id: UUID | null, // If re-attaching (unlinked then relinked)
    user_note: string | null, // Optional note from user
  },

  correlation_id: UUID,      // NEW correlation ID for this user action + side effects
  source: 'ui',
  ip_address: string,
  user_agent: string,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "email.manually_attached",
  "actor_type": "user",
  "actor_id": "550e8400-e29b-41d4-a716-446655440001",
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "record_link",
  "entity_id": "d50e8400-e29b-41d4-a716-446655440013",
  "payload": {
    "link_id": "d50e8400-e29b-41d4-a716-446655440013",
    "source_type": "thread",
    "source_id": "a50e8400-e29b-41d4-a716-446655440006",
    "target_type": "property",
    "target_id": "f50e8400-e29b-41d4-a716-446655440014",
    "confidence": 100,
    "link_method": "manual",
    "previous_link_id": null,
    "user_note": "Discussion about 123 Main St property inspection"
  },
  "correlation_id": "d50e8400-e29b-41d4-a716-446655440015",
  "source": "ui",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0",
  "created_at": "2025-12-31T14:30:00Z"
}
```

---

### 3.12 EMAIL_UNLINKED

**Trigger:** User removes link between email and record
**Actor:** user
**Entity:** record_link

**Schema:**
```typescript
{
  org_id: UUID,
  actor_id: UUID,            // User who performed action
  actor_type: 'user',
  event_type: 'email.unlinked',
  entity_type: 'record_link',
  entity_id: UUID,           // record_links.id (of the deleted link)

  payload: {
    link_id: UUID,            // Same as entity_id
    source_type: 'thread' | 'message' | 'attachment',
    source_id: UUID,
    target_type: 'contact' | 'company' | 'deal' | 'property' | 'unit' | 'leasing',
    target_id: UUID,
    original_link_method: 'rule' | 'manual' | 'system',
    original_rule_name: string | null, // If was auto-attached
    reason: string | null,    // Optional user-provided reason
  },

  correlation_id: UUID,      // NEW correlation ID for this user action
  source: 'ui',
  ip_address: string,
  user_agent: string,
  created_at: timestamp,
}
```

**Example Payload:**
```json
{
  "event_type": "email.unlinked",
  "actor_type": "user",
  "actor_id": "550e8400-e29b-41d4-a716-446655440001",
  "org_id": "650e8400-e29b-41d4-a716-446655440002",
  "entity_type": "record_link",
  "entity_id": "d50e8400-e29b-41d4-a716-446655440009",
  "payload": {
    "link_id": "d50e8400-e29b-41d4-a716-446655440009",
    "source_type": "thread",
    "source_id": "a50e8400-e29b-41d4-a716-446655440006",
    "target_type": "contact",
    "target_id": "e50e8400-e29b-41d4-a716-446655440010",
    "original_link_method": "rule",
    "original_rule_name": "EXACT_EMAIL_MATCH",
    "reason": "Wrong contact - email is similar but different person"
  },
  "correlation_id": "d50e8400-e29b-41d4-a716-446655440016",
  "source": "ui",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0",
  "created_at": "2025-12-31T14:35:00Z"
}
```

---

## 4. Correlation ID Patterns

### 4.1 Sync Operation Chain

**All events from a single sync share one correlation ID:**

```typescript
const syncCorrelationId = randomUUID();

// Event 1: Sync started
await auditLog.log({
  event_type: 'sync.started',
  correlation_id: syncCorrelationId,
  // ...
});

// Event 2-N: Threads ingested
for (const thread of threads) {
  await auditLog.log({
    event_type: 'thread.ingested',
    correlation_id: syncCorrelationId, // SAME
    // ...
  });
}

// Event N+1: Messages ingested
for (const message of messages) {
  await auditLog.log({
    event_type: 'message.ingested',
    correlation_id: syncCorrelationId, // SAME
    // ...
  });
}

// Event N+2: Attachments saved
for (const attachment of attachments) {
  await auditLog.log({
    event_type: 'attachment.saved',
    correlation_id: syncCorrelationId, // SAME
    // ...
  });
}

// Event N+3: Auto-attach (rule engine runs after ingestion)
for (const link of autoLinks) {
  await auditLog.log({
    event_type: 'email.auto_attached',
    correlation_id: syncCorrelationId, // SAME
    // ...
  });
}

// Event Final: Sync completed
await auditLog.log({
  event_type: 'sync.completed',
  correlation_id: syncCorrelationId, // SAME
  // ...
});
```

**Query Pattern:**
```sql
-- Get all events from sync operation
SELECT * FROM audit_ledger
WHERE correlation_id = '850e8400-e29b-41d4-a716-446655440004'
ORDER BY created_at ASC;

-- Result: sync.started → thread.ingested (x42) → message.ingested (x127)
--         → attachment.saved (x18) → email.auto_attached (x35) → sync.completed
```

---

### 4.2 Manual User Action Chain

**User action + resulting side effects share correlation ID:**

```typescript
const userActionCorrelationId = randomUUID();

// User manually attaches thread to deal
await auditLog.log({
  event_type: 'email.manually_attached',
  correlation_id: userActionCorrelationId,
  payload: {
    source_type: 'thread',
    source_id: threadId,
    target_type: 'deal',
    target_id: dealId,
  },
  // ...
});

// Side effect: Also create link for all messages in thread
for (const message of threadMessages) {
  await auditLog.log({
    event_type: 'email.manually_attached',
    correlation_id: userActionCorrelationId, // SAME
    payload: {
      source_type: 'message',
      source_id: message.id,
      target_type: 'deal',
      target_id: dealId,
    },
    // ...
  });
}

// Side effect: Link attachments
for (const attachment of threadAttachments) {
  await auditLog.log({
    event_type: 'email.manually_attached',
    correlation_id: userActionCorrelationId, // SAME
    payload: {
      source_type: 'attachment',
      source_id: attachment.id,
      target_type: 'deal',
      target_id: dealId,
    },
    // ...
  });
}
```

---

### 4.3 Thread Lifecycle Tracing

**Trace a thread from ingestion → auto-attach → manual re-attach:**

```sql
-- Step 1: Find thread ingestion event
SELECT correlation_id, created_at
FROM audit_ledger
WHERE event_type = 'thread.ingested'
  AND entity_id = 'a50e8400-e29b-41d4-a716-446655440006';
-- Result: correlation_id = 'sync-850e8400', created_at = '2025-12-31T10:15:40Z'

-- Step 2: Find auto-attach events (same correlation_id)
SELECT event_type, payload->>'target_type', payload->>'target_id', created_at
FROM audit_ledger
WHERE correlation_id = 'sync-850e8400'
  AND event_type = 'email.auto_attached'
  AND payload->>'source_id' = 'a50e8400-e29b-41d4-a716-446655440006';
-- Result: Auto-attached to Contact (e50e8400) at 10:15:43Z
--         Auto-attached to Deal (f50e8400) at 10:15:44Z (promoted from contact)

-- Step 3: Find manual attach/unlink events (different correlation_ids)
SELECT event_type, correlation_id, payload->>'target_type', payload->>'target_id', created_at
FROM audit_ledger
WHERE event_type IN ('email.manually_attached', 'email.unlinked')
  AND payload->>'source_id' = 'a50e8400-e29b-41d4-a716-446655440006'
ORDER BY created_at DESC;
-- Result:
--   email.unlinked from Contact (e50e8400) at 14:35:00Z [correlation_id = user-action-d50e8400]
--   email.manually_attached to Property (f50e8400) at 14:30:00Z [correlation_id = user-action-d50e8400-2]
```

**Full Audit Trail:**
1. **2025-12-31T10:15:40Z** - Thread ingested (sync correlation)
2. **2025-12-31T10:15:43Z** - Auto-attached to Contact (sync correlation)
3. **2025-12-31T10:15:44Z** - Auto-attached to Deal via promotion (sync correlation)
4. **2025-12-31T14:30:00Z** - User manually attached to Property (user action correlation)
5. **2025-12-31T14:35:00Z** - User unlinked from Contact (user action correlation)

---

## 5. Enforcement Rules

### 5.1 Every Backend Operation Must Emit Event

**Service Function Wrapper Pattern:**

```typescript
// ❌ BAD: Direct database operation without logging
async function createMailbox(data: MailboxCreateInput): Promise<Mailbox> {
  const mailbox = await db.insert('mailboxes', data);
  return mailbox;
}

// ✅ GOOD: Wrapped with ledger event
async function createMailbox(
  data: MailboxCreateInput,
  context: { orgId: string; userId: string; ip: string; userAgent: string }
): Promise<Mailbox> {
  // 1. Perform database operation
  const mailbox = await db.insert('mailboxes', data);

  // 2. Emit ledger event
  await auditLog.log({
    org_id: context.orgId,
    actor_id: context.userId,
    actor_type: 'user',
    event_type: 'mailbox.connected',
    entity_type: 'mailbox',
    entity_id: mailbox.id,
    payload: {
      provider: mailbox.provider,
      provider_email: mailbox.provider_email,
      provider_subject_id: mailbox.provider_subject_id,
      oauth_scopes: mailbox.oauth_scopes,
      initial_status: mailbox.status,
      backfill_days: 30,
    },
    correlation_id: null,
    source: 'ui',
    ip_address: context.ip,
    user_agent: context.userAgent,
  });

  // 3. Return result
  return mailbox;
}
```

---

### 5.2 Transaction-Safe Logging

**Critical:** Ledger events must be written in the SAME transaction as business logic:

```typescript
// ✅ GOOD: Atomic transaction
async function deleteRecordLink(linkId: string, context: UserContext): Promise<void> {
  await db.transaction(async (trx) => {
    // 1. Get link details before deletion
    const link = await trx.query('SELECT * FROM record_links WHERE id = $1', [linkId]);
    if (!link) throw new Error('Link not found');

    // 2. Delete link
    await trx.query('DELETE FROM record_links WHERE id = $1', [linkId]);

    // 3. Emit ledger event IN SAME TRANSACTION
    await trx.insert('audit_ledger', {
      org_id: context.orgId,
      actor_id: context.userId,
      actor_type: 'user',
      event_type: 'email.unlinked',
      entity_type: 'record_link',
      entity_id: linkId,
      payload: {
        link_id: linkId,
        source_type: link.source_type,
        source_id: link.source_id,
        target_type: link.target_type,
        target_id: link.target_id,
        original_link_method: link.link_method,
        original_rule_name: link.rule_name,
        reason: context.unlinkReason,
      },
      correlation_id: randomUUID(),
      source: 'ui',
      ip_address: context.ip,
      user_agent: context.userAgent,
    });
  });
}
```

---

### 5.3 Validation Middleware

**API middleware to enforce ledger event presence:**

```typescript
// Middleware to validate ledger event was written
async function validateAuditTrail(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const correlationId = randomUUID();

  // Attach correlation ID to request context
  req.context.correlationId = correlationId;

  // Capture original res.json to intercept response
  const originalJson = res.json.bind(res);
  res.json = async (body: any) => {
    // After response is sent, verify ledger event was written
    const events = await auditLog.query({
      org_id: req.context.orgId,
      correlation_id: correlationId,
    });

    if (events.length === 0) {
      console.error('[AUDIT VIOLATION] No ledger event written for request:', {
        method: req.method,
        path: req.path,
        user: req.context.userId,
        correlation_id: correlationId,
      });
      // Alert monitoring system
      await alerting.send({
        severity: 'high',
        message: 'Audit ledger violation detected',
        metadata: { path: req.path, correlation_id: correlationId },
      });
    }

    return originalJson(body);
  };

  next();
}

// Apply to Gmail routes
app.use('/api/inbox/*', validateAuditTrail);
app.use('/api/mailboxes/*', validateAuditTrail);
```

---

## 6. Query Patterns

### 6.1 Get All Events for Mailbox

```sql
-- Get complete mailbox history
SELECT
  event_type,
  actor_type,
  payload,
  created_at
FROM audit_ledger
WHERE org_id = :orgId
  AND (
    entity_id = :mailboxId  -- Direct mailbox events
    OR payload->>'mailbox_id' = :mailboxId  -- Related events (threads, messages, etc.)
  )
ORDER BY created_at DESC;
```

**Use Case:** Mailbox detail page showing connection history, sync history, errors

---

### 6.2 Get Sync History for Mailbox

```sql
-- Get all sync operations with summary
SELECT
  correlation_id,
  MIN(created_at) as sync_started_at,
  MAX(created_at) as sync_completed_at,
  MAX(CASE WHEN event_type = 'sync.completed' THEN
    payload->>'threads_synced'::int ELSE 0 END) as threads_synced,
  MAX(CASE WHEN event_type = 'sync.completed' THEN
    payload->>'messages_synced'::int ELSE 0 END) as messages_synced,
  MAX(CASE WHEN event_type = 'sync.failed' THEN
    payload->>'error_message' ELSE NULL END) as error_message
FROM audit_ledger
WHERE org_id = :orgId
  AND entity_id = :mailboxId
  AND event_type IN ('sync.started', 'sync.completed', 'sync.failed')
GROUP BY correlation_id
ORDER BY sync_started_at DESC
LIMIT 50;
```

**Use Case:** Sync history dashboard, troubleshooting sync failures

---

### 6.3 Get Attachment History for Thread

```sql
-- Get all attachment events for a thread
SELECT
  al.event_type,
  al.payload->>'filename' as filename,
  al.payload->>'size_bytes' as size_bytes,
  al.payload->>'sha256' as sha256,
  al.payload->>'is_duplicate' as is_duplicate,
  al.created_at
FROM audit_ledger al
WHERE al.org_id = :orgId
  AND al.event_type = 'attachment.saved'
  AND al.payload->>'thread_id' = :threadId
ORDER BY al.created_at DESC;
```

**Use Case:** Thread detail page showing attachment upload history

---

### 6.4 Audit Trail for Specific Email Attachment

```sql
-- Complete lifecycle of an attachment
WITH attachment_events AS (
  SELECT * FROM audit_ledger
  WHERE org_id = :orgId
    AND (
      entity_id = :attachmentId  -- Direct attachment events
      OR payload->>'attachment_id' = :attachmentId  -- Related events
      OR payload->>'source_id' = :attachmentId  -- Linking events
    )
)
SELECT
  event_type,
  actor_type,
  actor_id,
  payload,
  created_at
FROM attachment_events
ORDER BY created_at ASC;
```

**Use Case:** Compliance audit - "Show me complete history of this attachment"

**Example Output:**
1. `attachment.saved` - Ingested from Gmail (2025-12-31T10:15:42Z)
2. `email.auto_attached` - Auto-linked to Contact (2025-12-31T10:15:43Z)
3. `email.manually_attached` - User attached to Deal (2025-12-31T14:30:00Z)
4. `document.downloaded` - User downloaded file (2025-12-31T15:00:00Z)

---

### 6.5 Get Auto-Attach Performance Metrics

```sql
-- Auto-attach rule performance
SELECT
  payload->>'rule_name' as rule_name,
  payload->>'confidence' as confidence,
  payload->>'target_type' as target_type,
  COUNT(*) as link_count,
  COUNT(DISTINCT payload->>'source_id') as unique_sources
FROM audit_ledger
WHERE org_id = :orgId
  AND event_type = 'email.auto_attached'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY rule_name, confidence, target_type
ORDER BY link_count DESC;
```

**Use Case:** Rule engine optimization, identify which rules are most effective

---

### 6.6 Detect Manual Overrides of Auto-Attach

```sql
-- Find cases where user unlinked auto-attached email
SELECT
  unlink.payload->>'source_id' as thread_id,
  unlink.payload->>'original_rule_name' as auto_attach_rule,
  unlink.payload->>'reason' as user_reason,
  unlink.created_at as unlinked_at,
  auto.created_at as auto_attached_at,
  EXTRACT(EPOCH FROM (unlink.created_at - auto.created_at)) / 3600 as hours_before_override
FROM audit_ledger unlink
JOIN audit_ledger auto ON
  unlink.payload->>'link_id' = auto.entity_id::text
WHERE unlink.org_id = :orgId
  AND unlink.event_type = 'email.unlinked'
  AND unlink.payload->>'original_link_method' = 'rule'
  AND auto.event_type = 'email.auto_attached'
ORDER BY unlink.created_at DESC
LIMIT 100;
```

**Use Case:** Identify false positives in rule engine, improve auto-attach logic

---

## 7. PII Considerations

### 7.1 Fields to Redact

**Email Addresses:**
- Store full email in payload for search/filtering
- Mark as PII for export/audit reports
- Redact in UI displays: `a******@example.com`

**Name Fields:**
- `from_name` → `J*** D**`
- `user_name` → `A***** S****`

**IP Addresses:**
- `ip_address` → `203.0.113.*.*` (last 2 octets masked)

**Subjects/Snippets:**
- Store unredacted (needed for search)
- Consider redacting in long-term archive exports

---

### 7.2 NEVER Store in Ledger

**Email Bodies:**
- `mail_messages.body_plain` → NOT in ledger payload
- `mail_messages.body_html` → NOT in ledger payload
- Ledger only contains: subject, snippet (first 200 chars)

**Attachment Contents:**
- Ledger only contains: filename, size, SHA-256, storage path
- Never store attachment binary data in ledger

**OAuth Tokens:**
- `access_token` → NEVER in ledger
- `refresh_token` → NEVER in ledger
- Only store: token expiry timestamp, scopes

---

### 7.3 Redaction Function

```typescript
import { piiRedactor } from '@/lib/pii-redactor';

const PII_FIELDS = [
  'provider_email',
  'from_email',
  'from_name',
  'to_emails',
  'participant_emails',
  'matched_email',
];

async function logGmailEvent(event: GmailAuditEvent): Promise<void> {
  // Auto-redact PII fields
  const redactedPayload = event.payload
    ? piiRedactor.redactObject(event.payload, PII_FIELDS)
    : null;

  await auditLog.log({
    ...event,
    payload: redactedPayload,
    ip_address: event.ip_address
      ? piiRedactor.redactIP(event.ip_address)
      : null,
  });
}
```

---

## 8. Query Patterns for Audit UI

### 8.1 Mailbox Overview Panel

**UI Component:** Mailbox detail page sidebar

**Query:**
```typescript
async function getMailboxAuditSummary(mailboxId: string): Promise<MailboxAuditSummary> {
  const events = await db.query(`
    SELECT
      event_type,
      COUNT(*) as count,
      MAX(created_at) as last_occurred
    FROM audit_ledger
    WHERE entity_id = $1 OR payload->>'mailbox_id' = $1
    GROUP BY event_type
  `, [mailboxId]);

  return {
    total_syncs: events.find(e => e.event_type === 'sync.completed')?.count || 0,
    failed_syncs: events.find(e => e.event_type === 'sync.failed')?.count || 0,
    threads_ingested: events.find(e => e.event_type === 'thread.ingested')?.count || 0,
    messages_ingested: events.find(e => e.event_type === 'message.ingested')?.count || 0,
    attachments_saved: events.find(e => e.event_type === 'attachment.saved')?.count || 0,
    auto_links: events.find(e => e.event_type === 'email.auto_attached')?.count || 0,
    manual_links: events.find(e => e.event_type === 'email.manually_attached')?.count || 0,
    last_sync: events.find(e => e.event_type === 'sync.completed')?.last_occurred,
  };
}
```

---

### 8.2 Thread Audit Timeline

**UI Component:** Thread detail page - "Audit Timeline" tab

**Query:**
```typescript
async function getThreadAuditTimeline(threadId: string): Promise<AuditEvent[]> {
  return db.query(`
    SELECT
      event_type,
      actor_type,
      actor_id,
      payload,
      created_at
    FROM audit_ledger
    WHERE org_id = $1
      AND (
        entity_id = $2
        OR payload->>'thread_id' = $2
        OR payload->>'source_id' = $2
      )
    ORDER BY created_at ASC
  `, [orgId, threadId]);
}
```

**UI Display:**
```
2025-12-31 10:15:40 - Thread Ingested (System)
  Subject: "Re: Listing on 123 Main St"
  3 messages, 2 attachments

2025-12-31 10:15:43 - Auto-Attached to Contact (System)
  Rule: EXACT_EMAIL_MATCH
  Contact: buyer@gmail.com

2025-12-31 10:15:44 - Auto-Attached to Deal (System)
  Rule: CONTACT_TO_RECORD_PROMOTION
  Deal: 123 Main St Purchase

2025-12-31 14:30:00 - Manually Attached to Property (User: Ashley)
  Property: 123 Main St
  Note: "Discussion about property inspection"
```

---

### 8.3 Sync Job Detail View

**UI Component:** Background Jobs dashboard - Sync job detail

**Query:**
```typescript
async function getSyncJobDetails(correlationId: string): Promise<SyncJobDetail> {
  const events = await db.query(`
    SELECT * FROM audit_ledger
    WHERE correlation_id = $1
    ORDER BY created_at ASC
  `, [correlationId]);

  const started = events.find(e => e.event_type === 'sync.started');
  const completed = events.find(e => e.event_type === 'sync.completed');
  const failed = events.find(e => e.event_type === 'sync.failed');

  return {
    correlation_id: correlationId,
    status: completed ? 'completed' : (failed ? 'failed' : 'in_progress'),
    started_at: started?.created_at,
    completed_at: completed?.created_at || failed?.created_at,
    duration_ms: completed?.payload?.duration_ms || failed?.payload?.duration_ms,
    sync_type: started?.payload?.sync_type,
    threads_ingested: events.filter(e => e.event_type === 'thread.ingested').length,
    messages_ingested: events.filter(e => e.event_type === 'message.ingested').length,
    attachments_saved: events.filter(e => e.event_type === 'attachment.saved').length,
    auto_links_created: events.filter(e => e.event_type === 'email.auto_attached').length,
    error: failed?.payload?.error_message,
  };
}
```

---

## 9. Implementation Checklist

### 9.1 Backend Service Functions

**Required wrapper functions:**

- [ ] `connectMailbox()` → emit `MAILBOX_CONNECTED`
- [ ] `disconnectMailbox()` → emit `MAILBOX_DISCONNECTED`
- [ ] `handleMailboxError()` → emit `MAILBOX_ERROR`
- [ ] `startSync()` → emit `SYNC_STARTED`
- [ ] `completeSync()` → emit `SYNC_COMPLETED`
- [ ] `failSync()` → emit `SYNC_FAILED`
- [ ] `ingestThread()` → emit `THREAD_INGESTED`
- [ ] `ingestMessage()` → emit `MESSAGE_INGESTED`
- [ ] `saveAttachment()` → emit `ATTACHMENT_SAVED`
- [ ] `autoAttachEmail()` → emit `EMAIL_AUTO_ATTACHED`
- [ ] `manuallyAttachEmail()` → emit `EMAIL_MANUALLY_ATTACHED`
- [ ] `unlinkEmail()` → emit `EMAIL_UNLINKED`

---

### 9.2 Validation Tests

**Required test coverage:**

- [ ] All 12 event types have unit tests
- [ ] PII redaction works for all email fields
- [ ] Correlation IDs properly link sync events
- [ ] Transaction rollback does not orphan ledger events
- [ ] Audit trail query returns complete thread history
- [ ] Middleware detects missing ledger events

---

### 9.3 Monitoring

**Required alerts:**

- [ ] Alert if ledger event fails to write
- [ ] Alert if correlation_id missing for sync events
- [ ] Alert if PII detected in unredacted payload
- [ ] Daily report: Total events by type
- [ ] Weekly report: Auto-attach rule performance

---

## 10. Example: Complete Sync Flow

**Scenario:** Initial backfill for newly connected mailbox

```typescript
async function performInitialBackfill(mailboxId: string): Promise<void> {
  const correlationId = randomUUID();
  const mailbox = await db.query('SELECT * FROM mailboxes WHERE id = $1', [mailboxId]);

  try {
    // 1. Log sync started
    await auditLog.log({
      org_id: mailbox.org_id,
      actor_id: null,
      actor_type: 'system',
      event_type: 'sync.started',
      entity_type: 'mailbox',
      entity_id: mailboxId,
      payload: {
        sync_type: 'backfill',
        mailbox_id: mailboxId,
        provider_email: mailbox.provider_email,
        history_id_start: null,
        backfill_days: 30,
        estimated_message_count: null,
      },
      correlation_id: correlationId,
      source: 'system',
      ip_address: null,
      user_agent: null,
    });

    // 2. Fetch threads from Gmail API
    const threads = await gmailClient.listThreads({
      after: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    let threadCount = 0;
    let messageCount = 0;
    let attachmentCount = 0;

    for (const gmailThread of threads) {
      // 3. Ingest thread
      const thread = await db.insert('mail_threads', {
        org_id: mailbox.org_id,
        mailbox_id: mailboxId,
        provider_thread_id: gmailThread.id,
        subject: gmailThread.subject,
        participant_emails: gmailThread.participants,
        message_count: gmailThread.messages.length,
        has_attachments: gmailThread.hasAttachments,
        first_message_at: gmailThread.firstMessageAt,
        last_message_at: gmailThread.lastMessageAt,
      });

      await auditLog.log({
        event_type: 'thread.ingested',
        entity_type: 'mail_thread',
        entity_id: thread.id,
        payload: {
          thread_id: thread.id,
          mailbox_id: mailboxId,
          provider_thread_id: gmailThread.id,
          subject: gmailThread.subject,
          participant_emails: gmailThread.participants,
          message_count: gmailThread.messages.length,
          has_attachments: gmailThread.hasAttachments,
          first_message_at: gmailThread.firstMessageAt,
          last_message_at: gmailThread.lastMessageAt,
        },
        correlation_id: correlationId,
        // ...
      });
      threadCount++;

      // 4. Ingest messages
      for (const gmailMessage of gmailThread.messages) {
        const message = await db.insert('mail_messages', {
          org_id: mailbox.org_id,
          mailbox_id: mailboxId,
          thread_id: thread.id,
          provider_message_id: gmailMessage.id,
          from_email: gmailMessage.from,
          to_emails: gmailMessage.to,
          subject: gmailMessage.subject,
          body_plain: gmailMessage.bodyPlain,
          body_html: gmailMessage.bodyHtml,
          sent_at: gmailMessage.sentAt,
          has_attachments: gmailMessage.attachments.length > 0,
        });

        await auditLog.log({
          event_type: 'message.ingested',
          entity_type: 'mail_message',
          entity_id: message.id,
          payload: {
            message_id: message.id,
            thread_id: thread.id,
            provider_message_id: gmailMessage.id,
            from_email: gmailMessage.from,
            subject: gmailMessage.subject,
            has_attachments: gmailMessage.attachments.length > 0,
            attachment_count: gmailMessage.attachments.length,
            sent_at: gmailMessage.sentAt,
          },
          correlation_id: correlationId,
          // ...
        });
        messageCount++;

        // 5. Save attachments
        for (const gmailAttachment of gmailMessage.attachments) {
          const fileData = await gmailClient.getAttachment(gmailAttachment.id);
          const sha256 = computeSHA256(fileData);
          const storagePath = `org-${mailbox.org_id}/attachments/${randomUUID()}-${gmailAttachment.filename}`;

          await storage.upload(storagePath, fileData);

          const attachment = await db.insert('mail_attachments', {
            org_id: mailbox.org_id,
            mailbox_id: mailboxId,
            message_id: message.id,
            provider_attachment_id: gmailAttachment.id,
            filename: gmailAttachment.filename,
            mime_type: gmailAttachment.mimeType,
            size_bytes: fileData.length,
            storage_path: storagePath,
            sha256: sha256,
          });

          const isDuplicate = await db.query(
            'SELECT id FROM mail_attachments WHERE sha256 = $1 AND id != $2 LIMIT 1',
            [sha256, attachment.id]
          );

          await auditLog.log({
            event_type: 'attachment.saved',
            entity_type: 'mail_attachment',
            entity_id: attachment.id,
            payload: {
              attachment_id: attachment.id,
              message_id: message.id,
              thread_id: thread.id,
              mailbox_id: mailboxId,
              provider_attachment_id: gmailAttachment.id,
              filename: gmailAttachment.filename,
              mime_type: gmailAttachment.mimeType,
              size_bytes: fileData.length,
              storage_path: storagePath,
              sha256: sha256,
              is_duplicate: isDuplicate.length > 0,
              existing_attachment_id: isDuplicate[0]?.id || null,
            },
            correlation_id: correlationId,
            // ...
          });
          attachmentCount++;
        }
      }

      // 6. Run auto-attach rules
      const autoLinks = await ruleEngine.evaluateThread(thread);
      for (const link of autoLinks) {
        const recordLink = await db.insert('record_links', link);

        await auditLog.log({
          event_type: 'email.auto_attached',
          entity_type: 'record_link',
          entity_id: recordLink.id,
          payload: {
            link_id: recordLink.id,
            source_type: 'thread',
            source_id: thread.id,
            target_type: link.target_type,
            target_id: link.target_id,
            rule_name: link.rule_name,
            confidence: link.confidence,
            match_details: link.match_details,
          },
          correlation_id: correlationId,
          // ...
        });
      }
    }

    // 7. Log sync completed
    await auditLog.log({
      org_id: mailbox.org_id,
      actor_id: null,
      actor_type: 'system',
      event_type: 'sync.completed',
      entity_type: 'mailbox',
      entity_id: mailboxId,
      payload: {
        sync_type: 'backfill',
        mailbox_id: mailboxId,
        provider_email: mailbox.provider_email,
        threads_synced: threadCount,
        messages_synced: messageCount,
        attachments_saved: attachmentCount,
        history_id_end: threads[threads.length - 1]?.historyId,
        duration_ms: Date.now() - startTime,
      },
      correlation_id: correlationId,
      source: 'system',
      ip_address: null,
      user_agent: null,
    });

    // 8. Update mailbox status
    await db.query(
      'UPDATE mailboxes SET status = $1, last_synced_at = NOW(), last_history_id = $2 WHERE id = $3',
      ['connected', threads[threads.length - 1]?.historyId, mailboxId]
    );

  } catch (error) {
    // 9. Log sync failed
    await auditLog.log({
      org_id: mailbox.org_id,
      actor_id: null,
      actor_type: 'system',
      event_type: 'sync.failed',
      entity_type: 'mailbox',
      entity_id: mailboxId,
      payload: {
        sync_type: 'backfill',
        mailbox_id: mailboxId,
        provider_email: mailbox.provider_email,
        error_type: 'api_error',
        error_message: error.message,
        http_status: error.status,
        threads_synced_before_failure: threadCount,
        messages_synced_before_failure: messageCount,
        will_retry: true,
        next_retry_at: Date.now() + 60000, // Retry in 1 minute
        duration_ms: Date.now() - startTime,
      },
      correlation_id: correlationId,
      source: 'system',
      ip_address: null,
      user_agent: null,
    });

    throw error;
  }
}
```

---

## Document Revision History

| Version | Date       | Author                  | Changes                          |
|---------|------------|-------------------------|----------------------------------|
| 1.0.0   | 2025-12-31 | realtime-audit-agent    | Initial Gmail ledger events spec |

---

**Next Review Date:** 2026-01-31 (Monthly review during Gmail integration sprint)

**Related Documents:**
- `LEDGER_EVENT_SPEC.md` - Base audit ledger specification
- `Execution-Packet_v0.2-Gmail.md` - Sprint requirements
- `GMAIL_OAUTH_SPEC.md` - OAuth connection implementation
- `GMAIL_RULE_ENGINE_SPEC.md` - Auto-attach rule logic
