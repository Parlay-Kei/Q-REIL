# Inbox MVP Plan

**Document ID:** INBOX_MVP_PLAN
**Version:** 1.0.0
**Created:** 2025-12-31
**Lane:** 5 (Inbox)
**Status:** DRAFT
**Owner:** email-admin-agent

---

## Executive Summary

This document defines the Minimum Viable Product (MVP) scope for the REIL/Q inbox feature. The MVP focuses on Microsoft Graph API integration, enabling users to view, reply to, and organize transaction-related emails within the REIL/Q platform.

---

## Platform Selection

**Chosen Platform:** Microsoft Graph API

See [EMAIL_PLATFORM_DECISION.md](./EMAIL_PLATFORM_DECISION.md) for full rationale.

---

## Required OAuth Scopes (Minimal Set)

### Delegated Permissions (User Context)

| Scope | Purpose | Justification |
|-------|---------|---------------|
| `User.Read` | Read user profile | Required for email address verification and display name |
| `Mail.Read` | Read user mail | Core inbox functionality - view messages and threads |
| `Mail.ReadWrite` | Modify mail state | Mark as read, move to folders, archive messages |
| `Mail.Send` | Send mail | Reply to messages from within REIL/Q |
| `offline_access` | Refresh tokens | Background sync without user presence |

### Scopes NOT Requested (Principle of Least Privilege)

| Scope | Reason for Exclusion |
|-------|---------------------|
| `Mail.ReadBasic` | We need full message bodies |
| `Mail.Read.Shared` | Shared mailbox deferred to post-MVP |
| `Mail.Send.Shared` | Send on behalf deferred |
| `Calendars.*` | Calendar integration out of scope |
| `Contacts.*` | Contact sync handled separately |

### Consent Screen Impact

Users will see:

```
REIL/Q wants to:
- View your profile
- Read your mail
- Read and write your mail
- Send mail as you
- Maintain access to data you have given it access to
```

---

## Edge Cases and Handling

### 1. Large Attachments (>25MB)

| Scenario | Handling |
|----------|----------|
| Message with >25MB total attachments | Display message, show attachment metadata only |
| Single attachment >25MB | Store reference, stream on demand |
| Attachment >150MB (Outlook limit) | Not possible via email; handle gracefully |

**Implementation:**
```javascript
// Attachment size threshold (bytes)
const INLINE_ATTACHMENT_LIMIT = 25 * 1024 * 1024; // 25MB

// For attachments over threshold, store reference only
if (attachment.size > INLINE_ATTACHMENT_LIMIT) {
  await storeAttachmentReference(messageId, attachment);
} else {
  await downloadAndStoreAttachment(messageId, attachment);
}
```

**Storage Strategy:**
- Attachments <5MB: Store in database (base64)
- Attachments 5-25MB: Store in blob storage (S3/Azure Blob)
- Attachments >25MB: Store reference, fetch on demand via Graph API

### 2. Encrypted Emails (S/MIME, Office 365 Message Encryption)

| Scenario | Handling |
|----------|----------|
| S/MIME signed | Display message, show signature status |
| S/MIME encrypted | Display "Encrypted message" placeholder, link to Outlook |
| OME encrypted | Display placeholder, link to Outlook web |
| Rights-managed (IRM) | Display placeholder, warn about restrictions |

**Implementation:**
```javascript
// Check for encryption indicators
if (message.body.contentType === 'application/pkcs7-mime') {
  return {
    isEncrypted: true,
    displayMessage: 'This message is encrypted. View in Outlook.',
    outlookWebLink: generateOutlookWebLink(message.webLink)
  };
}
```

**MVP Scope:** Display placeholder, do not attempt decryption.

### 3. Calendar Invites Embedded in Email

| Scenario | Handling |
|----------|----------|
| Meeting invitation (iCalendar) | Display as message with meeting summary card |
| Meeting update | Display update details |
| Meeting cancellation | Display cancellation notice |
| Calendar event in body | Parse and display as card |

**Implementation:**
- Detect `content-type: text/calendar` attachments
- Extract event details (time, location, attendees)
- Render as a styled card within message view
- Do NOT sync to user's calendar (out of scope)

**Data Extracted:**
```typescript
interface CalendarInviteCard {
  eventType: 'meeting' | 'update' | 'cancellation';
  title: string;
  startTime: DateTime;
  endTime: DateTime;
  location?: string;
  organizer: string;
  attendees: string[];
  body?: string;
}
```

### 4. Bounced Messages (NDR - Non-Delivery Reports)

| Scenario | Handling |
|----------|----------|
| Hard bounce (invalid address) | Flag message, surface in UI, suggest correction |
| Soft bounce (mailbox full) | Flag message, allow retry |
| Delayed delivery | Show status, monitor for eventual delivery |
| Blocked by recipient | Flag message, note security block |

**Detection:**
```javascript
// Common NDR indicators
const isNDR = (message) => {
  return (
    message.from.emailAddress.address.includes('mailer-daemon') ||
    message.from.emailAddress.address.includes('postmaster') ||
    message.subject.toLowerCase().includes('undeliverable') ||
    message.subject.toLowerCase().includes('delivery failed') ||
    message.internetMessageHeaders?.some(h =>
      h.name === 'X-Failed-Recipients'
    )
  );
};
```

**MVP Scope:** Detect and flag bounces; do not auto-retry.

### 5. Out-of-Office Auto-Replies

| Scenario | Handling |
|----------|----------|
| OOO reply | Detect and flag as auto-reply |
| OOO with return date | Extract and display return date |
| OOO from contact | Show indicator on contact card |

**Detection:**
```javascript
const isAutoReply = (message) => {
  const autoReplyHeaders = [
    'X-Auto-Response-Suppress',
    'X-Autoreply',
    'Auto-Submitted'
  ];

  return message.internetMessageHeaders?.some(h =>
    autoReplyHeaders.includes(h.name) ||
    (h.name === 'Auto-Submitted' && h.value !== 'no')
  );
};
```

**UI Treatment:**
- Gray background
- "Auto-reply" badge
- Collapsed by default in thread view
- Excluded from unread count by default (configurable)

### 6. Spam/Junk Folder Handling

| Scenario | Handling |
|----------|----------|
| Message in Junk folder | Do not sync by default |
| User explicitly views Junk | Allow opt-in viewing |
| False positive | Allow user to move to Inbox |
| Outbound marked as spam | Alert user, provide guidance |

**Folder Configuration:**
```javascript
const SYNCED_FOLDERS = [
  'Inbox',
  'SentItems',
  'Drafts'
];

const EXCLUDED_FOLDERS = [
  'JunkEmail',
  'DeletedItems',
  'Clutter',
  'Archive' // User must opt-in
];
```

**MVP Scope:** Sync Inbox, Sent, Drafts only. Junk folder opt-in is post-MVP.

### 7. Shared Mailbox vs Personal Mailbox

| Scenario | MVP Handling | Post-MVP |
|----------|--------------|----------|
| Personal mailbox | Full support | Full support |
| Shared mailbox | Not supported | Add `Mail.Read.Shared` scope |
| Delegated access | Not supported | Add delegate handling |
| Distribution list | Not applicable | Not applicable |

**MVP Scope:** Personal mailboxes only. Shared mailbox support requires:
1. Additional OAuth scope: `Mail.Read.Shared`, `Mail.Send.Shared`
2. UI for selecting which shared mailboxes to connect
3. Permission verification logic

**Post-MVP Implementation Path:**
```javascript
// List shared mailboxes user has access to
GET /me/mailboxSettings/delegateMeetingMessageDeliveryOptions
GET /users/{shared-mailbox-id}/messages
```

### 8. Multiple Email Addresses per User

| Scenario | Handling |
|----------|----------|
| User has 2+ Microsoft accounts | Support multiple connections |
| Aliases on same mailbox | Treat as single mailbox |
| External addresses forwarding | Capture at inbox level |
| Different domains (personal + work) | Separate connections |

**Database Schema:**
```sql
-- Users can have multiple email connections
CREATE TABLE user_email_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL, -- 'microsoft' | 'gmail'
  email_address TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  -- ... token fields
  UNIQUE(user_id, email_address)
);
```

**UI Implications:**
- Account selector in inbox header
- Combined inbox view (all accounts) as default
- Filter by account option
- Compose: Select "From" address

---

## MVP Feature Set

### Core Features (Sprint 0.1-0.2)

#### 1. View Inbox (List Messages)

**Endpoint:** `GET /me/mailFolders/Inbox/messages`

**Features:**
- Paginated message list (25 per page)
- Sort by date (newest first)
- Show: sender, subject, snippet, date, read status
- Attachment indicator
- Filter: All, Unread, Starred

**UI Components:**
- Message list (sidebar or main panel)
- Pagination controls
- Filter chips
- Bulk select (for MVP: read/unread only)

**API Query:**
```
GET /me/mailFolders/Inbox/messages
  ?$select=id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments,flag
  &$orderby=receivedDateTime desc
  &$top=25
  &$skip=0
```

#### 2. View Message Thread

**Endpoint:** `GET /me/messages?$filter=conversationId eq '{id}'`

**Features:**
- Full message body (HTML rendered safely)
- Thread view (all messages in conversation)
- Attachments list with download
- Headers (From, To, CC, Date)
- Reply/Forward actions

**Data Fetching:**
```javascript
// Get all messages in thread
const threadMessages = await graphClient
  .api('/me/messages')
  .filter(`conversationId eq '${conversationId}'`)
  .orderby('receivedDateTime asc')
  .get();
```

**Security:**
- Sanitize HTML (DOMPurify or similar)
- Block external images by default (privacy)
- CSP headers for iframe rendering

#### 3. Send Reply

**Endpoint:** `POST /me/messages/{id}/reply`

**Features:**
- Reply to single message
- Reply all
- Quote original message
- Rich text editor (basic formatting)
- Attach files (up to 25MB)

**Request Body:**
```json
POST /me/messages/{id}/reply
{
  "message": {
    "toRecipients": [
      {"emailAddress": {"address": "recipient@example.com"}}
    ]
  },
  "comment": "This is my reply content."
}
```

**UI Components:**
- Reply composer (inline or modal)
- Rich text editor (bold, italic, lists, links)
- File attachment picker
- Send / Save Draft / Discard

#### 4. Auto-Attach to Record (Basic Rules)

**Logic:** Match incoming emails to REIL/Q records automatically.

**Matching Rules (Priority Order):**

| Rule | Match Criteria | Confidence |
|------|----------------|------------|
| 1. Email address | From/To matches contact email | High |
| 2. Deal reference | Subject contains deal ID or address | High |
| 3. Property address | Body contains property address | Medium |
| 4. Domain match | Sender domain matches company | Low |

**Implementation:**
```javascript
async function autoAttachMessage(message) {
  // Rule 1: Contact email match
  const contact = await findContactByEmail(message.from.emailAddress.address);
  if (contact) {
    return attachToContact(message.id, contact.id);
  }

  // Rule 2: Deal reference in subject
  const dealRef = extractDealReference(message.subject);
  if (dealRef) {
    const deal = await findDealByReference(dealRef);
    if (deal) return attachToDeal(message.id, deal.id);
  }

  // Rule 3: Property address in body
  const addresses = extractAddresses(message.bodyPreview);
  for (const addr of addresses) {
    const property = await findPropertyByAddress(addr);
    if (property) return attachToProperty(message.id, property.id);
  }

  // No match - leave unattached
  return null;
}
```

**User Override:** Users can always manually attach/detach.

#### 5. Manual Attach to Record

**Features:**
- Attach message to: Contact, Deal, Property
- Search for record to attach
- Attach entire thread or single message
- Detach from record

**UI Flow:**
1. Click "Attach to Record" button
2. Select record type (Contact/Deal/Property)
3. Search for record
4. Confirm attachment
5. Show attachment badge on message

#### 6. Assign to Team Member

**Features:**
- Assign message to user in organization
- Assignment notification (in-app)
- Assigned-to-me filter
- Reassign capability
- Assignment history log

**Schema:**
```sql
-- Already in inbox_messages table
assigned_to UUID REFERENCES users(id),
assigned_at TIMESTAMPTZ,
assigned_by UUID REFERENCES users(id),
```

**Assignment Log:**
```sql
CREATE TABLE message_assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES inbox_messages(id),
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  note TEXT
);
```

---

## Out of Scope for MVP

| Feature | Reason | Target Sprint |
|---------|--------|---------------|
| Email templates | Nice-to-have, not core | Sprint 0.3 |
| Bulk operations | Complexity, edge cases | Sprint 0.3 |
| Advanced search | Basic filters sufficient | Sprint 0.4 |
| Analytics (response time, volume) | Reporting feature | Sprint 0.5 |
| Send as organization | Requires shared mailbox | Sprint 0.3 |
| Gmail integration | Platform decision | Sprint 0.3 |
| Scheduled send | Nice-to-have | Sprint 0.4 |
| Email sequences | Complex automation | Sprint 0.5+ |
| AI categorization | ML infrastructure needed | Sprint 0.5+ |
| Snooze/follow-up reminders | Nice-to-have | Sprint 0.3 |
| Internal notes on messages | Collaboration feature | Sprint 0.3 |

---

## Data Model

### Primary Tables

#### inbox_messages (Reference: email-admin-agent.md)

```sql
CREATE TABLE inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  external_id TEXT NOT NULL, -- Microsoft message ID
  conversation_id TEXT, -- Microsoft conversation ID

  -- Provider reference
  provider TEXT NOT NULL DEFAULT 'microsoft',
  user_connection_id UUID REFERENCES user_email_connections(id),

  -- Envelope
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses JSONB NOT NULL DEFAULT '[]',
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',
  reply_to_addresses JSONB DEFAULT '[]',

  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  body_preview TEXT, -- First 255 chars

  -- Metadata
  received_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  importance TEXT DEFAULT 'normal', -- low, normal, high
  categories JSONB DEFAULT '[]',

  -- Message classification
  is_draft BOOLEAN DEFAULT false,
  is_auto_reply BOOLEAN DEFAULT false,
  is_bounce BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  has_calendar_invite BOOLEAN DEFAULT false,

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INT DEFAULT 0,

  -- REIL associations
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  property_id UUID REFERENCES properties(id),
  auto_attached BOOLEAN DEFAULT false,

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES users(id),

  -- Folder location
  folder_id TEXT, -- Microsoft folder ID
  folder_name TEXT, -- Inbox, Sent, etc.

  -- Sync metadata
  web_link TEXT, -- Link to open in Outlook
  change_key TEXT, -- For delta sync

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(org_id, provider, external_id)
);

-- Performance indexes
CREATE INDEX idx_inbox_messages_org_received
  ON inbox_messages(org_id, received_at DESC);
CREATE INDEX idx_inbox_messages_conversation
  ON inbox_messages(org_id, conversation_id);
CREATE INDEX idx_inbox_messages_contact
  ON inbox_messages(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_inbox_messages_deal
  ON inbox_messages(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_inbox_messages_assigned
  ON inbox_messages(org_id, assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_inbox_messages_unread
  ON inbox_messages(org_id, user_connection_id, is_read) WHERE is_read = false;
CREATE INDEX idx_inbox_messages_external
  ON inbox_messages(provider, external_id);
```

#### inbox_attachments

```sql
CREATE TABLE inbox_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES inbox_messages(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- Microsoft attachment ID

  -- Metadata
  name TEXT NOT NULL,
  content_type TEXT,
  size_bytes BIGINT,
  is_inline BOOLEAN DEFAULT false,
  content_id TEXT, -- For inline images

  -- Storage
  storage_type TEXT NOT NULL, -- 'inline' | 'blob' | 'reference'
  storage_path TEXT, -- Blob URL or base64 content

  -- Virus scan
  scan_status TEXT DEFAULT 'pending', -- pending, clean, infected, error
  scanned_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(message_id, external_id)
);

CREATE INDEX idx_inbox_attachments_message
  ON inbox_attachments(message_id);
```

#### user_email_connections

```sql
CREATE TABLE user_email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  org_id UUID NOT NULL REFERENCES orgs(id),

  -- Provider
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'gmail')),
  email_address TEXT NOT NULL,
  display_name TEXT,

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]',

  -- Webhook subscription
  webhook_subscription_id TEXT,
  webhook_expires_at TIMESTAMPTZ,
  webhook_resource TEXT,

  -- Sync state
  last_sync_at TIMESTAMPTZ,
  last_history_id TEXT, -- Gmail history ID or MS delta token
  sync_status TEXT DEFAULT 'active', -- active, paused, error
  sync_error TEXT,

  -- Settings
  is_primary BOOLEAN DEFAULT false,
  sync_folders JSONB DEFAULT '["Inbox", "SentItems"]',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  disconnected_at TIMESTAMPTZ,

  UNIQUE(user_id, email_address)
);

CREATE INDEX idx_email_connections_user
  ON user_email_connections(user_id);
CREATE INDEX idx_email_connections_webhook
  ON user_email_connections(webhook_subscription_id)
  WHERE webhook_subscription_id IS NOT NULL;
```

#### message_read_state (Per-user read status for shared inboxes)

```sql
CREATE TABLE message_read_state (
  message_id UUID NOT NULL REFERENCES inbox_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  PRIMARY KEY (message_id, user_id)
);
```

---

## Attachment Handling Strategy

### Storage Tiers

| Size Range | Storage Location | Retrieval |
|------------|------------------|-----------|
| 0 - 1MB | PostgreSQL (base64) | Instant |
| 1MB - 25MB | Blob Storage (S3/Azure) | Fast (<1s) |
| >25MB | Reference only | On-demand from Graph API |

### Processing Pipeline

```
┌──────────────────┐
│ Incoming Message │
│  (via webhook)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check for        │
│ Attachments      │
└────────┬─────────┘
         │
         ├─── No attachments ───► Store message
         │
         ▼
┌──────────────────┐
│ For each         │
│ attachment:      │
└────────┬─────────┘
         │
         ├─── Size ≤ 1MB ────► Store inline (base64)
         │
         ├─── 1MB < Size ≤ 25MB ──► Upload to blob storage
         │
         └─── Size > 25MB ───► Store reference only
                               (fetch on demand)
         │
         ▼
┌──────────────────┐
│ Queue for        │
│ virus scan       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update message   │
│ record           │
└──────────────────┘
```

### Virus Scanning

- Integration with ClamAV or cloud scanning service
- Quarantine infected files
- Notify user of blocked attachments
- Log all scan results

---

## Thread Reconstruction Approach

### Microsoft Graph Threading

Microsoft uses `conversationId` to group related messages.

**Fetching a Thread:**
```javascript
async function getThread(conversationId) {
  const messages = await graphClient
    .api('/me/messages')
    .filter(`conversationId eq '${conversationId}'`)
    .orderby('receivedDateTime asc')
    .select('id,subject,from,toRecipients,receivedDateTime,bodyPreview,body,isRead')
    .get();

  return messages.value;
}
```

**Thread Display Order:**
- Oldest first (chronological)
- Newest message expanded by default
- Older messages collapsed with preview

### Thread Metadata

```typescript
interface ThreadSummary {
  conversationId: string;
  subject: string;
  participants: EmailAddress[];
  messageCount: number;
  latestMessageDate: DateTime;
  hasUnread: boolean;
  attachmentCount: number;
  // REIL associations
  contactId?: string;
  dealId?: string;
  propertyId?: string;
}
```

---

## Ingestion Pipeline

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Microsoft Graph                              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Webhook POST (change notification)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Gateway / Edge Function                       │
│                    (Validate subscription, verify signature)         │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Message Queue (Redis/SQS)                         │
│                    (Decouple ingestion from processing)              │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Message Processor (Background Worker)             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch message details from Graph API                      │   │
│  │ 2. Parse and sanitize content                                │   │
│  │ 3. Download attachments (if applicable)                      │   │
│  │ 4. Run auto-attach rules                                     │   │
│  │ 5. Store in database                                         │   │
│  │ 6. Trigger realtime notification                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                               │
│                    (inbox_messages, inbox_attachments)               │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Realtime subscription
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REIL/Q Frontend                                   │
│                    (Inbox UI updated instantly)                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Webhook Setup

**Create Subscription:**
```javascript
async function createMailSubscription(userId, connectionId) {
  const subscription = await graphClient
    .api('/subscriptions')
    .post({
      changeType: 'created,updated,deleted',
      notificationUrl: `${API_BASE_URL}/webhooks/outlook`,
      resource: `users/${userId}/mailFolders/Inbox/messages`,
      expirationDateTime: getExpirationDate(6 * 24 * 60), // 6 days
      clientState: generateSecureState(connectionId),
      latestSupportedTlsVersion: 'v1_2'
    });

  // Store subscription ID for renewal
  await updateConnectionWebhook(connectionId, {
    webhookSubscriptionId: subscription.id,
    webhookExpiresAt: subscription.expirationDateTime,
    webhookResource: subscription.resource
  });

  return subscription;
}
```

**Webhook Handler:**
```javascript
// POST /webhooks/outlook
async function handleOutlookWebhook(req, res) {
  // 1. Handle validation request (on subscription creation)
  if (req.query.validationToken) {
    return res.status(200).send(req.query.validationToken);
  }

  // 2. Verify client state
  const notifications = req.body.value;
  for (const notification of notifications) {
    if (!verifyClientState(notification.clientState)) {
      console.error('Invalid client state');
      continue;
    }

    // 3. Queue for processing
    await messageQueue.add('process-email', {
      subscriptionId: notification.subscriptionId,
      changeType: notification.changeType,
      resource: notification.resource,
      resourceData: notification.resourceData
    });
  }

  // 4. Acknowledge receipt (must respond within 3 seconds)
  return res.status(202).send();
}
```

### Sync Strategy

**Real-time (Primary):**
- Webhook notifications for new/updated messages
- Process within 5 seconds of notification
- Immediate UI update via Supabase Realtime

**Batch (Fallback/Initial):**
- Initial sync: Last 90 days on connection
- Catch-up sync: Run hourly to catch missed notifications
- Full sync: Nightly reconciliation

**Delta Sync:**
```javascript
async function deltaSync(connectionId) {
  const connection = await getConnection(connectionId);

  // Use delta token from last sync
  const deltaLink = connection.lastDeltaLink ||
    `/me/mailFolders/Inbox/messages/delta`;

  let response = await graphClient.api(deltaLink).get();

  while (response.value.length > 0) {
    for (const message of response.value) {
      await processMessage(message, connectionId);
    }

    if (response['@odata.nextLink']) {
      response = await graphClient.api(response['@odata.nextLink']).get();
    } else {
      break;
    }
  }

  // Store delta link for next sync
  if (response['@odata.deltaLink']) {
    await updateConnection(connectionId, {
      lastDeltaLink: response['@odata.deltaLink'],
      lastSyncAt: new Date()
    });
  }
}
```

### Error Handling and Retry Logic

**Retry Strategy:**
| Error Type | Retry | Delay | Max Attempts |
|------------|-------|-------|--------------|
| 429 (Rate Limit) | Yes | Retry-After header | 5 |
| 500 (Server Error) | Yes | Exponential backoff | 3 |
| 401 (Unauthorized) | Yes* | Refresh token first | 2 |
| 403 (Forbidden) | No | N/A | N/A |
| 404 (Not Found) | No | N/A | N/A |
| Network Error | Yes | 30s, 60s, 120s | 3 |

*401 triggers token refresh, then retry.

**Dead Letter Queue:**
- Messages failing all retries go to DLQ
- Alert ops team for DLQ growth
- Manual review and replay capability

**Circuit Breaker:**
```javascript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
  resetTimeout: 60000
});

async function fetchMessage(messageId) {
  return circuitBreaker.fire(async () => {
    return graphClient.api(`/me/messages/${messageId}`).get();
  });
}
```

### Subscription Renewal

**Cron Job (Daily):**
```javascript
// Run every 24 hours
async function renewExpiringSubscriptions() {
  const threshold = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

  const expiring = await db.query(`
    SELECT * FROM user_email_connections
    WHERE webhook_expires_at < $1
    AND sync_status = 'active'
  `, [threshold]);

  for (const connection of expiring.rows) {
    try {
      const newExpiry = getExpirationDate(6 * 24 * 60);

      await graphClient
        .api(`/subscriptions/${connection.webhook_subscription_id}`)
        .patch({
          expirationDateTime: newExpiry
        });

      await updateConnection(connection.id, {
        webhookExpiresAt: newExpiry
      });
    } catch (error) {
      if (error.code === 'ResourceNotFound') {
        // Subscription was deleted, recreate
        await createMailSubscription(connection.user_id, connection.id);
      } else {
        await logError(connection.id, error);
      }
    }
  }
}
```

---

## API Endpoints (Backend Implementation)

### Inbox Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inbox/messages` | List messages (paginated) |
| GET | `/api/inbox/messages/:id` | Get single message |
| GET | `/api/inbox/threads/:conversationId` | Get thread |
| POST | `/api/inbox/messages/:id/reply` | Reply to message |
| POST | `/api/inbox/messages/:id/reply-all` | Reply all |
| POST | `/api/inbox/messages/:id/forward` | Forward message |
| PATCH | `/api/inbox/messages/:id` | Update (read, flag, assign) |
| POST | `/api/inbox/messages/:id/attach` | Attach to record |
| DELETE | `/api/inbox/messages/:id/attach` | Detach from record |

### Connection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inbox/connections` | List user's connections |
| POST | `/api/inbox/connections/microsoft/auth` | Initiate OAuth |
| GET | `/api/inbox/connections/microsoft/callback` | OAuth callback |
| DELETE | `/api/inbox/connections/:id` | Disconnect account |
| POST | `/api/inbox/connections/:id/sync` | Force sync |

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/outlook` | Receive notifications |
| POST | `/webhooks/outlook/lifecycle` | Handle lifecycle events |

---

## Security Requirements

### Token Security

1. **Encryption at Rest:**
   - AES-256 encryption for tokens
   - Per-org encryption keys
   - Key rotation support

2. **Token Refresh:**
   - Proactive refresh before expiry
   - Secure refresh token storage
   - Revocation handling

### Data Security

1. **Content Sanitization:**
   - HTML sanitization (DOMPurify)
   - XSS prevention
   - No script execution

2. **Attachment Security:**
   - Virus scanning before storage
   - Content-type validation
   - Size limits enforced

3. **Access Control:**
   - RLS policies on all tables
   - Org-level data isolation
   - User-level message access

### Audit Logging

```sql
CREATE TABLE inbox_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message_id UUID REFERENCES inbox_messages(id),
  action TEXT NOT NULL, -- view, reply, forward, attach, assign
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| OAuth completion rate | >90% | Funnel analytics |
| Message sync latency | <5 seconds | Timestamp comparison |
| Webhook delivery rate | >99.5% | Notification vs. processed |
| Auto-attach accuracy | >85% | Sampled manual review |
| Reply send success | >99% | API success rate |
| UI load time (inbox) | <2 seconds | Performance monitoring |

---

## Testing Strategy

### Unit Tests

- OAuth token refresh logic
- Auto-attach rule matching
- Message parsing and sanitization
- Edge case detection (bounce, OOO, encrypted)

### Integration Tests

- Microsoft Graph API calls (sandbox)
- Webhook receipt and processing
- Database operations
- Realtime subscriptions

### E2E Tests

- OAuth flow completion
- Send and receive message
- Thread view rendering
- Attachment download

### Load Tests

- 1,000 concurrent users
- 10,000 messages/hour ingestion
- Webhook burst handling

---

## Dependencies

### Upstream

| Dependency | Owner | Status |
|------------|-------|--------|
| User authentication | auth-flow-agent | Required for OAuth |
| Database schema (orgs, users) | supabase-admin | Required |
| Contacts table | supabase-admin | Required for auto-attach |
| Deals table | supabase-admin | Required for auto-attach |
| Properties table | supabase-admin | Required for auto-attach |

### Downstream

| Consumer | What They Need |
|----------|----------------|
| frontend-dev | API endpoints, data models |
| backend-qa-automation-tester | Test harness specs |
| realtime-audit-agent | Audit event definitions |

---

## Handoff Checklist

- [ ] Platform decision approved
- [ ] OAuth scopes finalized
- [ ] Database schema reviewed by supabase-admin
- [ ] Security requirements approved by saas-security-auditor
- [ ] API contract defined for frontend-dev
- [ ] Test cases defined for backend-qa-automation-tester
- [ ] Webhook endpoint infrastructure confirmed by infra-deployment-specialist

---

*Document Owner: email-admin-agent*
*Next Action: Submit for approval and begin implementation*
