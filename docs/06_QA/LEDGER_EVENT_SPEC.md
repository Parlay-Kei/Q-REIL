# Audit Ledger Event Specification

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Owner:** Lane 6 - QA + Security
**Status:** Active

## Document Purpose

This document defines the schema, event types, and implementation requirements for the REIL/Q audit ledger. The audit ledger provides an immutable, append-only log of all significant system events for compliance, security monitoring, and troubleshooting.

**Compliance Requirements:**
- SOX: Financial transaction audit trail (7-year retention)
- GDPR: Access logging for data subject rights
- HIPAA: (if applicable) Access to medical records
- Internal: Security monitoring, incident response

---

## 1. Audit Ledger Schema

### 1.1 Table Definition

**Table Name:** `audit_ledger`

```sql
CREATE TABLE audit_ledger (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenant isolation
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

  -- Actor (who performed the action)
  actor_id UUID NULL, -- NULL for system-initiated events
  actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'system', 'connector', 'api_key')),

  -- Event classification
  event_type VARCHAR(100) NOT NULL, -- e.g., "deal.created", "user.login"
  entity_type VARCHAR(50) NOT NULL, -- e.g., "deal", "contact", "user"
  entity_id UUID NULL, -- NULL for events not tied to specific entity

  -- Event payload (event-specific data)
  payload JSONB NULL,

  -- Event correlation (for tracking related events)
  correlation_id UUID NULL, -- Links related events (e.g., all events in a bulk import)

  -- Event source
  source VARCHAR(50) NOT NULL CHECK (source IN ('ui', 'api', 'connector', 'cron', 'system')),

  -- Request metadata
  ip_address VARCHAR(45) NULL, -- IPv4/IPv6 (masked for privacy)
  user_agent TEXT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes for query performance
  CONSTRAINT audit_ledger_org_id_idx INDEX (org_id),
  CONSTRAINT audit_ledger_actor_id_idx INDEX (actor_id),
  CONSTRAINT audit_ledger_event_type_idx INDEX (event_type),
  CONSTRAINT audit_ledger_entity_type_entity_id_idx INDEX (entity_type, entity_id),
  CONSTRAINT audit_ledger_created_at_idx INDEX (created_at DESC),
  CONSTRAINT audit_ledger_correlation_id_idx INDEX (correlation_id)
);

-- Enable Row-Level Security
ALTER TABLE audit_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their organization's audit logs
CREATE POLICY "org_isolation" ON audit_ledger
  FOR SELECT
  USING (org_id = auth.jwt() ->> 'org_id');

-- RLS Policy: Service role can insert audit logs
CREATE POLICY "service_role_insert" ON audit_ledger
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policy: Prevent updates and deletes (immutability)
CREATE POLICY "immutable_logs" ON audit_ledger
  FOR UPDATE
  USING (false);

CREATE POLICY "no_delete" ON audit_ledger
  FOR DELETE
  USING (false);
```

### 1.2 Field Descriptions

| Field Name       | Type      | Required | Description                                                                 |
|------------------|-----------|----------|-----------------------------------------------------------------------------|
| `id`             | UUID      | Yes      | Unique event identifier (auto-generated)                                    |
| `org_id`         | UUID      | Yes      | Organization ID (tenant isolation)                                          |
| `actor_id`       | UUID      | No       | User ID, API key ID, or connector ID who performed the action               |
| `actor_type`     | VARCHAR   | Yes      | Type of actor: `user`, `system`, `connector`, `api_key`                     |
| `event_type`     | VARCHAR   | Yes      | Event identifier (e.g., `deal.created`, `user.login`)                       |
| `entity_type`    | VARCHAR   | Yes      | Type of entity affected (e.g., `deal`, `contact`, `user`)                   |
| `entity_id`      | UUID      | No       | ID of affected entity (NULL for global events like login)                   |
| `payload`        | JSONB     | No       | Event-specific data (changes, metadata, error details)                      |
| `correlation_id` | UUID      | No       | Links related events (e.g., bulk operations, multi-step workflows)          |
| `source`         | VARCHAR   | Yes      | Event origin: `ui`, `api`, `connector`, `cron`, `system`                    |
| `ip_address`     | VARCHAR   | No       | Client IP address (masked per PII rules)                                    |
| `user_agent`     | TEXT      | No       | Client user agent string                                                    |
| `created_at`     | TIMESTAMP | Yes      | Event timestamp (auto-generated, immutable)                                 |

---

## 2. Event Types

### 2.1 Event Naming Convention

**Format:** `{entity}.{action}`

**Examples:**
- `deal.created`
- `contact.updated`
- `document.uploaded`
- `user.login`
- `user.password_changed`

**Action Verbs:**
- `created` - Entity created
- `updated` - Entity modified
- `deleted` - Entity soft deleted
- `restored` - Entity restored from soft delete
- `purged` - Entity hard deleted (permanent)
- `viewed` - Entity accessed (for sensitive data)
- `exported` - Data exported
- `uploaded` - File uploaded
- `downloaded` - File downloaded
- `linked` - Entity linked to another entity
- `unlinked` - Entity unlinked from another entity

### 2.2 Entity CRUD Events

**Standard events for all entities:**

```typescript
// Deal events
'deal.created'
'deal.updated'
'deal.deleted'
'deal.restored'
'deal.purged'
'deal.stage_changed'      // Special event for stage transitions
'deal.party_added'        // Add buyer/seller/agent
'deal.party_removed'      // Remove buyer/seller/agent
'deal.viewed'             // User viewed deal details

// Contact events
'contact.created'
'contact.updated'
'contact.deleted'
'contact.restored'
'contact.purged'
'contact.merged'          // Two contacts merged
'contact.viewed'

// Document events
'document.created'
'document.uploaded'       // File upload completed
'document.downloaded'     // User downloaded file
'document.viewed'         // User viewed document
'document.signed'         // Document e-signed
'document.deleted'
'document.purged'

// Message events
'message.received'        // Email received via inbox
'message.sent'            // Email sent from platform
'message.linked'          // Message linked to deal/contact
'message.unlinked'        // Message unlinked
'message.viewed'
'message.deleted'

// User events
'user.created'            // User account created
'user.login'              // Successful login
'user.login_failed'       // Failed login attempt
'user.logout'             // User logged out
'user.password_changed'
'user.email_changed'
'user.mfa_enabled'
'user.mfa_disabled'
'user.deleted'
'user.suspended'
'user.reactivated'

// Organization events
'org.created'
'org.updated'
'org.deleted'
'org.member_invited'      // User invited to org
'org.member_joined'       // User accepted invitation
'org.member_removed'      // User removed from org
'org.role_changed'        // User role changed

// Connector events
'connector.sync_started'
'connector.sync_completed'
'connector.sync_failed'
'connector.auth_success'
'connector.auth_failed'

// API Key events
'apikey.created'
'apikey.revoked'
'apikey.used'             // API key used for request

// Security events
'security.suspicious_activity' // Anomalous behavior detected
'security.access_denied'       // Permission denied
'security.secret_rotated'      // Secret/key rotated
```

### 2.3 Payload Schema by Event Type

**Deal Created:**

```typescript
{
  event_type: 'deal.created',
  entity_type: 'deal',
  entity_id: '123e4567-e89b-12d3-a456-426614174000',
  payload: {
    address: '*** Main St', // Redacted per PII rules
    city: 'San Francisco',
    state: 'CA',
    stage: 'lead',
    created_by_name: 'J*** D***', // Redacted
  }
}
```

**Deal Updated:**

```typescript
{
  event_type: 'deal.updated',
  entity_type: 'deal',
  entity_id: '123e4567-e89b-12d3-a456-426614174000',
  payload: {
    changes: [
      {
        field: 'purchase_price',
        old_value: '$***,***', // Redacted
        new_value: '$***,***', // Redacted
      },
      {
        field: 'stage',
        old_value: 'lead',
        new_value: 'under_contract',
      }
    ],
    updated_by_name: 'J*** D***', // Redacted
  }
}
```

**Deal Stage Changed:**

```typescript
{
  event_type: 'deal.stage_changed',
  entity_type: 'deal',
  entity_id: '123e4567-e89b-12d3-a456-426614174000',
  payload: {
    from_stage: 'lead',
    to_stage: 'under_contract',
    changed_by_name: 'J*** D***', // Redacted
    notes: 'Offer accepted',
  }
}
```

**Document Uploaded:**

```typescript
{
  event_type: 'document.uploaded',
  entity_type: 'document',
  entity_id: '789e4567-e89b-12d3-a456-426614174000',
  payload: {
    file_name: 'purchase_agreement.pdf',
    file_size_bytes: 245678,
    mime_type: 'application/pdf',
    linked_to_deal_id: '123e4567-e89b-12d3-a456-426614174000',
    uploaded_by_name: 'J*** D***', // Redacted
  }
}
```

**User Login:**

```typescript
{
  event_type: 'user.login',
  entity_type: 'user',
  entity_id: '456e4567-e89b-12d3-a456-426614174000',
  payload: {
    email_redacted: 'j***e@example.com', // Redacted per PII rules
    login_method: 'email_password', // or 'oauth_google', 'mfa'
    mfa_used: false,
    success: true,
  },
  ip_address: '192.168.*.**', // Redacted per PII rules
  user_agent: 'Mozilla/5.0 ...',
}
```

**User Login Failed:**

```typescript
{
  event_type: 'user.login_failed',
  entity_type: 'user',
  entity_id: null, // No user ID for failed login
  payload: {
    email_redacted: 'j***e@example.com', // Redacted
    reason: 'invalid_password', // or 'user_not_found', 'account_suspended'
    attempt_count: 3, // Number of failed attempts in time window
  },
  ip_address: '192.168.*.**', // Redacted
}
```

**Connector Sync Completed:**

```typescript
{
  event_type: 'connector.sync_completed',
  entity_type: 'connector',
  entity_id: 'connector-uuid',
  payload: {
    connector_type: 'mls', // or 'email', 'calendar'
    records_synced: 42,
    records_created: 10,
    records_updated: 30,
    records_failed: 2,
    duration_ms: 5432,
    error_summary: ['Record ID 123: Missing required field'],
  },
  correlation_id: 'sync-batch-uuid', // All synced records share this ID
}
```

**API Key Used:**

```typescript
{
  event_type: 'apikey.used',
  entity_type: 'apikey',
  entity_id: 'apikey-uuid',
  payload: {
    key_prefix: 'sk_live_XXXXXXX', // First 15 chars
    endpoint: '/api/deals',
    method: 'POST',
    status_code: 201,
    scopes_used: ['deal.create'],
  },
  ip_address: '203.0.113.*.**', // Redacted
}
```

**Security: Suspicious Activity:**

```typescript
{
  event_type: 'security.suspicious_activity',
  entity_type: 'user',
  entity_id: 'user-uuid',
  payload: {
    anomaly_type: 'excessive_data_access', // or 'unusual_location', 'rapid_requests'
    details: 'User accessed 150 contacts in 5 minutes (threshold: 50)',
    risk_level: 'medium', // low, medium, high, critical
    action_taken: 'session_terminated', // or 'account_flagged', 'admin_notified'
  },
}
```

---

## 3. Immutability Enforcement

### 3.1 Database Triggers

**Prevent UPDATE and DELETE on audit_ledger:**

```sql
-- Trigger function to block updates
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit ledger is immutable. Updates and deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent UPDATE
CREATE TRIGGER audit_ledger_no_update
BEFORE UPDATE ON audit_ledger
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();

-- Trigger to prevent DELETE
CREATE TRIGGER audit_ledger_no_delete
BEFORE DELETE ON audit_ledger
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();
```

### 3.2 API Validation

**Application-level enforcement:**

```typescript
// NEVER allow UPDATE or DELETE operations on audit_ledger
// Only INSERT is permitted

// Audit log service (singleton)
class AuditLogService {
  // Insert new audit event (ONLY permitted operation)
  async log(event: AuditEvent): Promise<void> {
    // Validate event structure
    const validatedEvent = auditEventSchema.parse(event);

    // Redact PII in payload
    const piiSafePayload = piiRedactor.redactObject(
      validatedEvent.payload,
      PII_FIELDS
    );

    // Insert into database
    await db.insert('audit_ledger', {
      org_id: validatedEvent.org_id,
      actor_id: validatedEvent.actor_id,
      actor_type: validatedEvent.actor_type,
      event_type: validatedEvent.event_type,
      entity_type: validatedEvent.entity_type,
      entity_id: validatedEvent.entity_id,
      payload: piiSafePayload,
      correlation_id: validatedEvent.correlation_id,
      source: validatedEvent.source,
      ip_address: validatedEvent.ip_address
        ? piiRedactor.redactIP(validatedEvent.ip_address)
        : null,
      user_agent: validatedEvent.user_agent,
    });
  }

  // Query audit logs (READ-ONLY)
  async query(filters: AuditQueryFilters): Promise<AuditEvent[]> {
    // Implement filtering, pagination
    return db.query('SELECT * FROM audit_ledger WHERE ...', []);
  }

  // NEVER implement update() or delete() methods
  // update() {} // FORBIDDEN
  // delete() {} // FORBIDDEN
}

export const auditLog = new AuditLogService();
```

### 3.3 Soft Delete via Tombstone Events

**For regulatory compliance, use tombstone events instead of DELETE:**

```typescript
// Instead of deleting audit logs, create a tombstone event
async function markEventObsolete(eventId: string, reason: string): Promise<void> {
  await auditLog.log({
    event_type: 'audit.event_obsolete',
    entity_type: 'audit_ledger',
    entity_id: eventId,
    payload: {
      reason: reason, // e.g., "duplicate", "error", "compliance_request"
      marked_by: getCurrentUserId(),
    },
  });

  // Original event remains in database, but marked as obsolete
  // Queries can filter out obsolete events if needed
}
```

---

## 4. Correlation and Event Chains

### 4.1 Correlation ID Usage

**Link related events with a shared correlation ID:**

```typescript
// Example: Bulk import of contacts
async function importContacts(contacts: Contact[]): Promise<void> {
  const correlationId = randomUUID(); // Generate shared correlation ID

  for (const contact of contacts) {
    // Create contact
    const newContact = await db.insert('contacts', contact);

    // Log creation event with correlation ID
    await auditLog.log({
      event_type: 'contact.created',
      entity_type: 'contact',
      entity_id: newContact.id,
      correlation_id: correlationId, // Same for all contacts in this import
      payload: {
        imported_from: 'csv_upload',
      },
    });
  }

  // Log overall import completion
  await auditLog.log({
    event_type: 'import.completed',
    entity_type: 'contact',
    entity_id: null,
    correlation_id: correlationId,
    payload: {
      total_records: contacts.length,
      successful: contacts.length,
      failed: 0,
    },
  });
}

// Query all events in this import
const importEvents = await db.query(
  'SELECT * FROM audit_ledger WHERE correlation_id = $1 ORDER BY created_at',
  [correlationId]
);
```

### 4.2 Event Chains for Workflows

**Track multi-step workflows:**

```typescript
// Example: Deal closing workflow
async function closeDeal(dealId: string): Promise<void> {
  const correlationId = randomUUID();

  // Step 1: Change stage to closed
  await updateDealStage(dealId, 'closed');
  await auditLog.log({
    event_type: 'deal.stage_changed',
    entity_type: 'deal',
    entity_id: dealId,
    correlation_id: correlationId,
    payload: { from_stage: 'under_contract', to_stage: 'closed' },
  });

  // Step 2: Generate commission report
  const commission = await generateCommissionReport(dealId);
  await auditLog.log({
    event_type: 'deal.commission_calculated',
    entity_type: 'deal',
    entity_id: dealId,
    correlation_id: correlationId,
    payload: { commission_amount_redacted: '$***,***' },
  });

  // Step 3: Send notifications
  await sendClosingNotifications(dealId);
  await auditLog.log({
    event_type: 'deal.notifications_sent',
    entity_type: 'deal',
    entity_id: dealId,
    correlation_id: correlationId,
    payload: { recipients: 3 },
  });

  // Workflow complete
  await auditLog.log({
    event_type: 'workflow.completed',
    entity_type: 'deal',
    entity_id: dealId,
    correlation_id: correlationId,
    payload: { workflow_type: 'deal_closing' },
  });
}
```

---

## 5. Query Patterns

### 5.1 Common Queries

**User Activity Log:**

```sql
-- Get all events by a specific user
SELECT
  event_type,
  entity_type,
  entity_id,
  payload,
  created_at
FROM audit_ledger
WHERE actor_id = '456e4567-e89b-12d3-a456-426614174000'
  AND org_id = 'current-org-id'
ORDER BY created_at DESC
LIMIT 100;
```

**Deal History:**

```sql
-- Get all events for a specific deal
SELECT
  event_type,
  actor_id,
  payload,
  created_at
FROM audit_ledger
WHERE entity_type = 'deal'
  AND entity_id = '123e4567-e89b-12d3-a456-426614174000'
  AND org_id = 'current-org-id'
ORDER BY created_at ASC;
```

**Failed Login Attempts:**

```sql
-- Get recent failed logins
SELECT
  payload->>'email_redacted' as email,
  payload->>'reason' as failure_reason,
  ip_address,
  created_at
FROM audit_ledger
WHERE event_type = 'user.login_failed'
  AND org_id = 'current-org-id'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Data Export Audit:**

```sql
-- Get all data exports (for compliance)
SELECT
  actor_id,
  payload->>'entity_type' as exported_entity,
  payload->>'count' as record_count,
  created_at
FROM audit_ledger
WHERE event_type = 'data.exported'
  AND org_id = 'current-org-id'
ORDER BY created_at DESC;
```

**Connector Sync History:**

```sql
-- Get connector sync results
SELECT
  payload->>'connector_type' as connector,
  payload->>'records_synced' as synced,
  payload->>'duration_ms' as duration,
  created_at
FROM audit_ledger
WHERE event_type = 'connector.sync_completed'
  AND org_id = 'current-org-id'
ORDER BY created_at DESC
LIMIT 20;
```

### 5.2 Performance Optimization

**Indexes:**

- `org_id` - Tenant isolation
- `actor_id` - User activity queries
- `event_type` - Event filtering
- `(entity_type, entity_id)` - Entity history
- `created_at DESC` - Chronological queries
- `correlation_id` - Event chain queries

**Partitioning (for large datasets):**

```sql
-- Partition by created_at (monthly partitions)
CREATE TABLE audit_ledger_2025_01 PARTITION OF audit_ledger
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_ledger_2025_02 PARTITION OF audit_ledger
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Auto-create partitions via cron job or pg_partman extension
```

---

## 6. Retention and Archival

### 6.1 Retention Periods

**Per compliance requirements:**

```typescript
const AUDIT_RETENTION = {
  // Financial events (SOX)
  financial: 2555, // 7 years (days)

  // Security events
  security: 2555, // 7 years

  // User activity
  user_activity: 1095, // 3 years

  // System events
  system: 365, // 1 year

  // Connector events
  connector: 365, // 1 year
};
```

### 6.2 Archival Process

**Move old records to cold storage:**

```sql
-- Archive audit logs older than 1 year
INSERT INTO audit_ledger_archive
SELECT * FROM audit_ledger
WHERE created_at < NOW() - INTERVAL '1 year'
  AND event_type NOT IN ('deal.created', 'deal.closed', 'user.login'); -- Exclude critical events

-- Delete archived records from hot table
DELETE FROM audit_ledger
WHERE created_at < NOW() - INTERVAL '1 year'
  AND event_type NOT IN ('deal.created', 'deal.closed', 'user.login');
```

**Automated archival (cron job):**

```typescript
// Run monthly
async function archiveOldAuditLogs(): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 year ago

  // Archive to separate table or S3
  const archivedCount = await db.query(`
    INSERT INTO audit_ledger_archive
    SELECT * FROM audit_ledger
    WHERE created_at < $1
      AND event_type NOT IN (
        'deal.created', 'deal.closed',
        'user.login', 'security.suspicious_activity'
      )
  `, [cutoffDate]);

  // Delete from hot table
  await db.query(`
    DELETE FROM audit_ledger
    WHERE created_at < $1
      AND event_type NOT IN (
        'deal.created', 'deal.closed',
        'user.login', 'security.suspicious_activity'
      )
  `, [cutoffDate]);

  console.log(`Archived ${archivedCount} audit log entries`);
}
```

---

## 7. API Interface

### 7.1 Audit Log Client

**TypeScript client for logging events:**

```typescript
import { z } from 'zod';
import { piiRedactor, PII_FIELDS } from '@/lib/pii-redactor';

// Event schema
const auditEventSchema = z.object({
  org_id: z.string().uuid(),
  actor_id: z.string().uuid().nullable(),
  actor_type: z.enum(['user', 'system', 'connector', 'api_key']),
  event_type: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().uuid().nullable(),
  payload: z.record(z.any()).nullable(),
  correlation_id: z.string().uuid().nullable(),
  source: z.enum(['ui', 'api', 'connector', 'cron', 'system']),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
});

type AuditEvent = z.infer<typeof auditEventSchema>;

// Audit log service
class AuditLogService {
  async log(event: Omit<AuditEvent, 'created_at'>): Promise<void> {
    // Validate event
    const validatedEvent = auditEventSchema.parse(event);

    // Redact PII in payload
    const piiSafePayload = validatedEvent.payload
      ? piiRedactor.redactObject(validatedEvent.payload, PII_FIELDS)
      : null;

    // Insert into database
    await db.insert('audit_ledger', {
      ...validatedEvent,
      payload: piiSafePayload,
      ip_address: validatedEvent.ip_address
        ? piiRedactor.redactIP(validatedEvent.ip_address)
        : null,
    });
  }

  async query(filters: {
    org_id: string;
    event_type?: string;
    entity_id?: string;
    actor_id?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditEvent[]> {
    let query = 'SELECT * FROM audit_ledger WHERE org_id = $1';
    const params: any[] = [filters.org_id];
    let paramIndex = 2;

    if (filters.event_type) {
      query += ` AND event_type = $${paramIndex++}`;
      params.push(filters.event_type);
    }

    if (filters.entity_id) {
      query += ` AND entity_id = $${paramIndex++}`;
      params.push(filters.entity_id);
    }

    if (filters.actor_id) {
      query += ` AND actor_id = $${paramIndex++}`;
      params.push(filters.actor_id);
    }

    if (filters.start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.end_date);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    return db.query(query, params);
  }

  // Get entity history (all events for a specific entity)
  async getEntityHistory(
    org_id: string,
    entity_type: string,
    entity_id: string
  ): Promise<AuditEvent[]> {
    return db.query(
      `SELECT * FROM audit_ledger
       WHERE org_id = $1 AND entity_type = $2 AND entity_id = $3
       ORDER BY created_at ASC`,
      [org_id, entity_type, entity_id]
    );
  }

  // Get user activity
  async getUserActivity(
    org_id: string,
    actor_id: string,
    limit: number = 100
  ): Promise<AuditEvent[]> {
    return db.query(
      `SELECT * FROM audit_ledger
       WHERE org_id = $1 AND actor_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [org_id, actor_id, limit]
    );
  }

  // Get events by correlation ID
  async getCorrelatedEvents(correlation_id: string): Promise<AuditEvent[]> {
    return db.query(
      `SELECT * FROM audit_ledger
       WHERE correlation_id = $1
       ORDER BY created_at ASC`,
      [correlation_id]
    );
  }
}

export const auditLog = new AuditLogService();
```

### 7.2 Usage Examples

**Logging a Deal Creation:**

```typescript
await auditLog.log({
  org_id: getCurrentOrgId(),
  actor_id: req.user.id,
  actor_type: 'user',
  event_type: 'deal.created',
  entity_type: 'deal',
  entity_id: newDeal.id,
  payload: {
    address: newDeal.address, // Will be redacted automatically
    city: newDeal.city,
    state: newDeal.state,
    stage: newDeal.stage,
  },
  correlation_id: null,
  source: 'ui',
  ip_address: req.ip,
  user_agent: req.get('user-agent'),
});
```

**Logging a User Login:**

```typescript
await auditLog.log({
  org_id: user.org_id,
  actor_id: user.id,
  actor_type: 'user',
  event_type: 'user.login',
  entity_type: 'user',
  entity_id: user.id,
  payload: {
    email: user.email, // Will be redacted
    login_method: 'email_password',
    mfa_used: false,
  },
  correlation_id: null,
  source: 'ui',
  ip_address: req.ip,
  user_agent: req.get('user-agent'),
});
```

**Logging a Connector Sync:**

```typescript
const correlationId = randomUUID();

await auditLog.log({
  org_id: connector.org_id,
  actor_id: connector.id,
  actor_type: 'connector',
  event_type: 'connector.sync_started',
  entity_type: 'connector',
  entity_id: connector.id,
  payload: {
    connector_type: 'mls',
  },
  correlation_id: correlationId,
  source: 'connector',
  ip_address: null,
  user_agent: null,
});

// ... perform sync ...

await auditLog.log({
  org_id: connector.org_id,
  actor_id: connector.id,
  actor_type: 'connector',
  event_type: 'connector.sync_completed',
  entity_type: 'connector',
  entity_id: connector.id,
  payload: {
    records_synced: 42,
    duration_ms: 5432,
  },
  correlation_id: correlationId,
  source: 'connector',
  ip_address: null,
  user_agent: null,
});
```

---

## 8. Compliance and Reporting

### 8.1 Compliance Queries

**GDPR: Data Subject Access Request (DSAR):**

```sql
-- Get all events involving a specific user
SELECT
  event_type,
  entity_type,
  entity_id,
  payload,
  created_at
FROM audit_ledger
WHERE org_id = 'current-org-id'
  AND (
    actor_id = 'user-uuid'
    OR payload::text LIKE '%user-uuid%'
  )
ORDER BY created_at DESC;
```

**SOX: Financial Transaction Audit:**

```sql
-- Get all deal financial events
SELECT
  event_type,
  entity_id,
  payload,
  actor_id,
  created_at
FROM audit_ledger
WHERE org_id = 'current-org-id'
  AND event_type IN ('deal.created', 'deal.updated', 'deal.closed')
  AND created_at >= '2025-01-01'
ORDER BY created_at DESC;
```

### 8.2 Security Monitoring

**Detect anomalous activity:**

```sql
-- Find users with excessive data access
SELECT
  actor_id,
  COUNT(*) as event_count,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM audit_ledger
WHERE org_id = 'current-org-id'
  AND event_type IN ('contact.viewed', 'deal.viewed', 'document.viewed')
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY actor_id
HAVING COUNT(*) > 100
ORDER BY event_count DESC;
```

**Failed login monitoring:**

```sql
-- Find IP addresses with multiple failed logins
SELECT
  ip_address,
  payload->>'email_redacted' as attempted_email,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM audit_ledger
WHERE event_type = 'user.login_failed'
  AND created_at > NOW() - INTERVAL '15 minutes'
GROUP BY ip_address, payload->>'email_redacted'
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC;
```

---

## 9. Testing Requirements

### 9.1 Unit Tests

**Test audit log immutability:**

```typescript
import { describe, it, expect } from 'vitest';
import { auditLog } from '@/lib/audit-log';

describe('AuditLog Immutability', () => {
  it('should allow INSERT operations', async () => {
    await expect(
      auditLog.log({
        org_id: 'test-org',
        actor_id: 'test-user',
        actor_type: 'user',
        event_type: 'test.event',
        entity_type: 'test',
        entity_id: 'test-entity',
        payload: { test: true },
        correlation_id: null,
        source: 'api',
        ip_address: '127.0.0.1',
        user_agent: 'test',
      })
    ).resolves.not.toThrow();
  });

  it('should reject UPDATE operations', async () => {
    // Attempt to update audit log (should fail)
    await expect(
      db.query('UPDATE audit_ledger SET payload = $1 WHERE id = $2', [
        { modified: true },
        'some-id',
      ])
    ).rejects.toThrow('Audit ledger is immutable');
  });

  it('should reject DELETE operations', async () => {
    // Attempt to delete audit log (should fail)
    await expect(
      db.query('DELETE FROM audit_ledger WHERE id = $1', ['some-id'])
    ).rejects.toThrow('Audit ledger is immutable');
  });
});
```

### 9.2 Integration Tests

**Test event logging in API endpoints:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('Audit Logging Integration', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginRes.body.token;
  });

  it('should log deal creation', async () => {
    // Create deal
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        stage: 'lead',
      });

    expect(res.status).toBe(201);

    // Verify audit log entry
    const auditLogs = await auditLog.query({
      org_id: 'test-org',
      event_type: 'deal.created',
      entity_id: res.body.id,
    });

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].event_type).toBe('deal.created');
    expect(auditLogs[0].actor_type).toBe('user');
  });
});
```

---

## 10. Dashboard and UI

### 10.1 Audit Log Viewer

**Requirements for UI:**

- Display audit logs in chronological order
- Filter by event type, entity type, date range
- Search by entity ID or actor ID
- Export to CSV for compliance
- Pagination for large datasets
- Real-time updates (optional)

**React Component Example:**

```typescript
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

function AuditLogViewer({ orgId }: { orgId: string }) {
  const [filters, setFilters] = useState({
    event_type: '',
    start_date: null,
    end_date: null,
    limit: 50,
    offset: 0,
  });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit_logs', orgId, filters],
    queryFn: () => fetch(`/api/audit-logs?${new URLSearchParams(filters)}`).then(r => r.json()),
  });

  return (
    <div className="audit-log-viewer">
      <div className="filters">
        <select
          value={filters.event_type}
          onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
        >
          <option value="">All Events</option>
          <option value="deal.created">Deal Created</option>
          <option value="user.login">User Login</option>
          <option value="document.uploaded">Document Uploaded</option>
        </select>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>Actor</th>
            <th>Entity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5}>Loading...</td></tr>
          ) : (
            auditLogs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.event_type}</td>
                <td>{log.actor_id}</td>
                <td>{log.entity_type} ({log.entity_id})</td>
                <td>{JSON.stringify(log.payload)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Appendix A: Event Type Reference

**Complete list of event types:**

| Event Type                   | Description                          | Entity Type   |
|------------------------------|--------------------------------------|---------------|
| `deal.created`               | Deal created                         | deal          |
| `deal.updated`               | Deal modified                        | deal          |
| `deal.deleted`               | Deal soft deleted                    | deal          |
| `deal.stage_changed`         | Deal stage transitioned              | deal          |
| `contact.created`            | Contact created                      | contact       |
| `contact.updated`            | Contact modified                     | contact       |
| `document.uploaded`          | Document file uploaded               | document      |
| `document.downloaded`        | Document file downloaded             | document      |
| `message.received`           | Email received                       | message       |
| `message.linked`             | Message linked to entity             | message       |
| `user.login`                 | User logged in                       | user          |
| `user.login_failed`          | Login attempt failed                 | user          |
| `user.password_changed`      | Password changed                     | user          |
| `org.member_invited`         | User invited to organization         | org           |
| `connector.sync_completed`   | Connector sync finished              | connector     |
| `apikey.created`             | API key generated                    | apikey        |
| `security.suspicious_activity`| Anomalous behavior detected         | user          |

---

## Document Revision History

| Version | Date       | Author      | Changes                      |
|---------|------------|-------------|------------------------------|
| 1.0.0   | 2025-12-31 | Lane 6 - QA | Initial audit ledger spec    |

---

**Next Review Date:** 2026-03-31 (Quarterly review required)
