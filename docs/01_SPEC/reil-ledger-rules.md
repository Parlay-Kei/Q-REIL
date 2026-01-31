# REIL Event Ledger Rules

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2025-12-31
**Sprint:** 0.1 - Scope Lock

---

## 1. Overview

The REIL Event Ledger is the **immutable, append-only** record of all actions and state changes in the system. It serves as the single source of truth for:

- Complete audit trail
- System state reconstruction
- Cross-system synchronization
- Compliance and dispute resolution

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Events are never modified or deleted once written |
| **Completeness** | Every state change generates an event |
| **Ordering** | Events maintain strict causal ordering within aggregates |
| **Durability** | Events survive system failures with zero data loss |
| **Queryability** | Events are efficiently searchable and retrievable |

---

## 2. Event Structure

### 2.1 Event Schema

Every event in the ledger MUST conform to this structure:

```json
{
  "event_id": "evt_01HQXYZ123ABC456DEF789",
  "event_type": "deal.created",
  "event_version": 1,
  "timestamp": "2025-12-31T14:30:00.000Z",
  "actor": {
    "actor_id": "usr_01HQABC789XYZ",
    "actor_type": "user",
    "actor_name": "Jane Agent"
  },
  "aggregate": {
    "aggregate_type": "deal",
    "aggregate_id": "deal_01HQDEAL456"
  },
  "correlation_id": "corr_01HQREQUEST789",
  "causation_id": "evt_01HQPREVIOUS456",
  "payload": {
    "address": "123 Main St",
    "list_price": 450000,
    "stage": "active"
  },
  "metadata": {
    "source": "q_app",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "request_id": "req_01HQ123"
  }
}
```

### 2.2 Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | string | Yes | Globally unique identifier (ULID format) |
| `event_type` | string | Yes | Dot-notation event type (e.g., `deal.created`) |
| `event_version` | integer | Yes | Schema version for this event type |
| `timestamp` | ISO 8601 | Yes | UTC timestamp when event occurred |
| `actor` | object | Yes | Who/what caused the event |
| `aggregate` | object | Yes | Entity this event belongs to |
| `correlation_id` | string | Yes | Groups related events from same user action |
| `causation_id` | string | No | Event that directly caused this event |
| `payload` | object | Yes | Event-specific data |
| `metadata` | object | Yes | Contextual information |

### 2.3 Actor Types

| Type | Description | Example |
|------|-------------|---------|
| `user` | Human user action | Agent updating deal |
| `system` | Automated system action | Scheduled task completion |
| `connector` | External system sync | MLS data update |
| `admin` | Administrative action | Bulk data migration |

---

## 3. Ledger Rules

### 3.1 Immutability Rules

**EARS Requirements:**

1. WHEN an event is written to the ledger THEN the system SHALL never modify that event.
2. IF a correction is needed THEN the system SHALL create a new compensating event, not modify the original.
3. WHEN viewing historical data THEN the system SHALL replay events to reconstruct state, not query mutable storage.
4. WHERE data deletion is legally required (GDPR) THEN the system SHALL use cryptographic erasure, not event deletion.

### 3.2 Event Ordering Rules

**EARS Requirements:**

1. WHEN events are written for the same aggregate THEN the system SHALL maintain strict sequential ordering.
2. IF two events arrive simultaneously for the same aggregate THEN the system SHALL serialize them deterministically.
3. WHEN replaying events THEN the system SHALL process them in the exact order they were written.
4. WHERE events span multiple aggregates THEN the system SHALL use correlation_id to track relationships.

### 3.3 Event Creation Rules

**EARS Requirements:**

1. WHEN any state change occurs in the system THEN an event SHALL be created before the change is confirmed.
2. IF an event write fails THEN the state change SHALL be rolled back.
3. WHEN an external system sends data THEN the connector SHALL create events for all changes.
4. WHERE batch operations occur THEN the system SHALL create individual events for each item with shared correlation_id.
5. WHILE processing a user request THEN all resulting events SHALL share the same correlation_id.

---

## 4. Event Types Catalog

### 4.1 Deal Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `deal.created` | New deal created | address, list_price, stage, parties |
| `deal.updated` | Deal fields modified | changed_fields, old_values, new_values |
| `deal.stage_changed` | Stage transition | old_stage, new_stage, reason |
| `deal.closed` | Deal reached closing | closing_date, final_price, commission |
| `deal.cancelled` | Deal cancelled | cancellation_reason, cancelled_by |
| `deal.party_added` | Party added to deal | party_role, party_id, party_name |
| `deal.party_removed` | Party removed | party_id, removal_reason |
| `deal.assigned` | Deal assigned to user | assignee_id, assigner_id |

### 4.2 Document Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `document.uploaded` | Document uploaded | filename, size, content_type, deal_id |
| `document.classified` | Auto/manual classification | doc_type, confidence, classifier |
| `document.status_changed` | Status update | old_status, new_status |
| `document.shared` | Document shared | recipient, share_type, expiration |
| `document.viewed` | Document accessed | viewer_id, view_duration |
| `document.signed` | Signature completed | signer_id, signature_timestamp |
| `document.version_created` | New version uploaded | version_number, changes_summary |

### 4.3 Communication Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `message.received` | Incoming message | channel, sender, subject, deal_id |
| `message.sent` | Outgoing message | channel, recipients, subject, deal_id |
| `message.matched` | Message linked to deal | message_id, deal_id, match_method |
| `message.read` | Message marked read | reader_id, read_timestamp |

### 4.4 Task Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `task.created` | Task created | title, due_date, assignee, deal_id |
| `task.assigned` | Task reassigned | old_assignee, new_assignee |
| `task.completed` | Task marked done | completed_by, completion_notes |
| `task.overdue` | Task passed due date | task_id, days_overdue |
| `task.reminder_sent` | Reminder triggered | recipient, reminder_type |

### 4.5 User Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `user.login` | User authenticated | auth_method, ip_address |
| `user.logout` | Session ended | session_duration |
| `user.permission_changed` | Role/permission update | old_permissions, new_permissions |
| `user.created` | New user added | email, role, created_by |
| `user.deactivated` | User disabled | deactivated_by, reason |

### 4.6 System Events

| Event Type | Trigger | Key Payload Fields |
|------------|---------|-------------------|
| `sync.started` | Connector sync begins | connector_type, sync_scope |
| `sync.completed` | Connector sync ends | records_processed, errors |
| `sync.conflict` | Data conflict detected | local_value, remote_value, resolution |
| `integration.connected` | Integration enabled | integration_type, config |
| `integration.error` | Integration failure | error_type, error_message |

---

## 5. Querying the Ledger

### 5.1 Query Patterns

| Query Type | Use Case | Example |
|------------|----------|---------|
| By Aggregate | Get all events for a deal | `GET /events?aggregate_type=deal&aggregate_id=deal_01HQ` |
| By Type | Get all events of a type | `GET /events?event_type=deal.created` |
| By Actor | Get all events by a user | `GET /events?actor_id=usr_01HQ` |
| By Correlation | Get related events | `GET /events?correlation_id=corr_01HQ` |
| By Time Range | Get events in period | `GET /events?from=2025-01-01&to=2025-01-31` |
| Combined | Complex queries | `GET /events?aggregate_type=deal&event_type=document.*&from=2025-01-01` |

### 5.2 Query Requirements

**EARS Requirements:**

1. WHEN querying by aggregate THEN the system SHALL return events in chronological order.
2. IF the query returns more than 1000 events THEN the system SHALL paginate using cursor-based pagination.
3. WHEN filtering by event type THEN the system SHALL support wildcard patterns (e.g., `deal.*`).
4. WHERE time range queries span partitions THEN the system SHALL merge results seamlessly.
5. WHILE executing queries THEN the system SHALL enforce permission filters based on actor's access.

---

## 6. State Reconstruction

### 6.1 Projection Rules

**EARS Requirements:**

1. WHEN building current state THEN the system SHALL replay all events for the aggregate in order.
2. IF a snapshot exists THEN the system SHALL replay only events after the snapshot timestamp.
3. WHEN a projection fails THEN the system SHALL log the error and fall back to full replay.
4. WHERE performance requires THEN the system SHALL maintain materialized views updated by event handlers.

### 6.2 Snapshot Strategy

| Aggregate Type | Snapshot Frequency | Retention |
|----------------|-------------------|-----------|
| Deal | Every 50 events | 30 days |
| Property | Every 100 events | 30 days |
| Contact | Every 25 events | 30 days |

---

## 7. Event Versioning

### 7.1 Schema Evolution Rules

**EARS Requirements:**

1. WHEN an event schema changes THEN the event_version SHALL be incremented.
2. IF adding a new field THEN it SHALL have a default value for backward compatibility.
3. WHEN removing a field THEN it SHALL be marked deprecated for 2 versions before removal.
4. WHERE breaking changes are required THEN a new event type SHALL be created.
5. WHILE processing events THEN the system SHALL support all active versions of each event type.

### 7.2 Version Registry

```
Event Type: deal.created
├── v1 (2025-01-01): Initial schema
├── v2 (2025-03-15): Added commission_structure field
└── v3 (current): Added team_split field

Event Type: document.uploaded
├── v1 (2025-01-01): Initial schema
└── v2 (current): Added classification_confidence field
```

---

## 8. Audit and Compliance

### 8.1 Audit Trail Generation

**EARS Requirements:**

1. WHEN an audit report is requested THEN the system SHALL generate a human-readable timeline from events.
2. IF filtering by compliance criteria THEN the system SHALL identify gaps or violations.
3. WHEN exporting audit data THEN the system SHALL include event signatures for integrity verification.
4. WHERE regulatory holds apply THEN the system SHALL prevent any data modification including cryptographic erasure.

### 8.2 Compliance Event Types

| Requirement | Events to Track | Report Format |
|-------------|-----------------|---------------|
| Document Chain of Custody | document.*, signature.* | Chronological with actors |
| User Activity | user.*, *.viewed | By user with timestamps |
| Deal Lifecycle | deal.* | Stage timeline with durations |
| Access Audit | *.accessed, *.denied | Attempts with outcomes |

### 8.3 Retention Policy

| Event Category | Retention Period | Archive Strategy |
|----------------|------------------|------------------|
| Deal Events | 7 years after close | Cold storage after 2 years |
| Document Events | 7 years after close | Cold storage after 2 years |
| User Activity | 3 years | Cold storage after 1 year |
| System Events | 1 year | Archive after 90 days |

---

## 9. Implementation Requirements

### 9.1 Storage Requirements

| Requirement | Specification |
|-------------|---------------|
| Write Latency | < 50ms (P99) |
| Read Latency | < 100ms (P99) for recent events |
| Throughput | 10,000 events/second |
| Durability | 99.999999999% (11 nines) |
| Availability | 99.99% for writes |

### 9.2 Technology Recommendations

| Component | Recommended Technology | Rationale |
|-----------|----------------------|-----------|
| Event Store | EventStoreDB or custom on PostgreSQL | Native event sourcing support |
| Search Index | Elasticsearch | Fast queries across event types |
| Snapshots | PostgreSQL with JSONB | Relational queries on current state |
| Archive | S3 with Glacier | Cost-effective long-term storage |

### 9.3 Security Requirements

**EARS Requirements:**

1. WHEN events are stored THEN the system SHALL encrypt at rest using AES-256.
2. IF events contain PII THEN the system SHALL support field-level encryption.
3. WHEN events are transmitted THEN the system SHALL use TLS 1.3.
4. WHERE integrity verification is needed THEN the system SHALL maintain cryptographic checksums.
5. WHILE accessing events THEN the system SHALL enforce role-based access control.

---

## 10. Error Handling

### 10.1 Write Failures

**EARS Requirements:**

1. IF an event write fails due to transient error THEN the system SHALL retry with exponential backoff (max 3 attempts).
2. WHEN a write permanently fails THEN the system SHALL reject the originating request with clear error.
3. WHERE distributed writes are involved THEN the system SHALL use saga pattern for consistency.

### 10.2 Read Failures

**EARS Requirements:**

1. IF event store is unavailable THEN the system SHALL serve from read replicas if available.
2. WHEN reconstruction fails THEN the system SHALL return last known good state with staleness indicator.
3. WHERE queries timeout THEN the system SHALL return partial results with continuation token.

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Architecture Lead | | | Pending |
| Backend Lead | | | Pending |
| Security Lead | | | Pending |
