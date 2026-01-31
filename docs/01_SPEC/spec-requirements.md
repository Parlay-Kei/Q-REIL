# REIL/Q MVP Specification Requirements

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2025-12-31
**Sprint:** 0.1 - Scope Lock

---

## 1. Introduction

REIL/Q is a real estate transaction management platform designed to dramatically reduce the operational burden on real estate professionals. The platform combines **REIL** (the infrastructure layer) with **Q** (the user-facing command center) to create a unified system that consolidates fragmented workflows into a single source of truth.

### 1.1 The Problem

Real estate professionals currently suffer from:

| Pain Point | Impact |
|------------|--------|
| **Fragmented Communication** | Emails, texts, and calls scattered across 5+ platforms |
| **Manual Document Handling** | 15-30 touches per document from creation to close |
| **Duplicate Data Entry** | Same information entered into MLS, CRM, transaction management, and compliance systems |
| **Audit Trail Gaps** | Compliance risk from incomplete activity records |
| **Context Switching** | 20+ app switches per transaction |

### 1.2 MVP North Star

> **Reduce touches by 60% and consolidate inbox/docs into one command center.**

The MVP delivers on this north star by:
1. Providing a unified inbox for all deal-related communication
2. Automating document routing and status tracking
3. Creating a single pipeline view across all active transactions
4. Maintaining an immutable audit trail without manual logging

---

## 2. Requirements

### Requirement 1: Unified Deal Pipeline

**User Story:** As a real estate agent, I want to see all my active deals in a single pipeline view, so that I can prioritize my work without switching between systems.

#### Acceptance Criteria

1. WHEN a user logs into Q THEN the system SHALL display a pipeline view showing all deals assigned to that user.
2. WHEN a deal status changes in any connected system THEN the system SHALL update the pipeline view within 30 seconds.
3. IF a user has more than 50 active deals THEN the system SHALL provide filtering by status, date, and property type.
4. WHEN a user clicks on a deal card THEN the system SHALL navigate to the deal record view with full context.
5. WHERE the pipeline module is active, the system SHALL display deal health indicators (on track, at risk, blocked).

---

### Requirement 2: Consolidated Communication Inbox

**User Story:** As a transaction coordinator, I want all deal-related emails and messages in one inbox, so that I never miss critical communications.

#### Acceptance Criteria

1. WHEN an email arrives that matches a deal (by address, MLS#, or participant) THEN the system SHALL automatically link it to the appropriate deal record.
2. WHEN a user views the inbox THEN the system SHALL display messages grouped by deal with unread counts.
3. IF a message cannot be auto-matched THEN the system SHALL place it in a triage queue for manual assignment.
4. WHEN a user replies from the inbox THEN the system SHALL send via the original channel (email, SMS) while logging the activity.
5. WHILE a user is composing a message THEN the system SHALL provide access to deal context and document attachments.
6. WHEN a new message arrives for a deal THEN the system SHALL notify assigned team members based on their notification preferences.

---

### Requirement 3: Document Management Hub

**User Story:** As an agent, I want documents automatically organized by deal and type, so that I can find what I need instantly and track completion status.

#### Acceptance Criteria

1. WHEN a document is uploaded or received via email THEN the system SHALL automatically classify it by type (contract, disclosure, addendum, etc.).
2. WHEN a document is linked to a deal THEN the system SHALL track its status (needed, pending, received, reviewed, approved).
3. IF a required document is missing as a deadline approaches THEN the system SHALL generate a task and notification.
4. WHEN a user searches for a document THEN the system SHALL return results within 2 seconds including full-text search of document content.
5. WHERE document versioning is enabled THEN the system SHALL maintain all versions with change tracking.
6. WHEN a document requires signatures THEN the system SHALL integrate with e-signature providers and track completion status.

---

### Requirement 4: Task and Workflow Automation

**User Story:** As a TC, I want the system to automatically create tasks based on deal milestones, so that nothing falls through the cracks.

#### Acceptance Criteria

1. WHEN a deal enters a new stage THEN the system SHALL automatically generate the standard tasks for that stage.
2. WHEN a task is approaching its due date THEN the system SHALL send reminders at configurable intervals (default: 3 days, 1 day, same day).
3. IF a task is overdue THEN the system SHALL escalate to the deal owner and display a visual warning.
4. WHEN a user completes a task THEN the system SHALL log the completion event with timestamp and actor.
5. WHERE custom workflows are defined THEN the system SHALL support conditional task creation based on deal attributes.
6. WHILE a task is in progress THEN the system SHALL allow notes, attachments, and status updates.

---

### Requirement 5: Immutable Audit Trail

**User Story:** As a broker/admin, I want a complete, tamper-proof record of all actions on every deal, so that I can demonstrate compliance and resolve disputes.

#### Acceptance Criteria

1. WHEN any action occurs on a deal (create, update, view, share) THEN the system SHALL create an immutable event in the REIL ledger.
2. WHEN an audit report is requested THEN the system SHALL generate a chronological activity log filterable by actor, action type, and date range.
3. IF a user attempts to modify historical data THEN the system SHALL create a new event reflecting the change while preserving the original.
4. WHEN viewing a deal record THEN the system SHALL provide access to the complete activity timeline.
5. WHERE compliance rules require specific documentation THEN the system SHALL flag gaps in the audit trail.

---

### Requirement 6: Role-Based Access Control

**User Story:** As an admin, I want to control what each team member can see and do, so that sensitive information is protected and responsibilities are clear.

#### Acceptance Criteria

1. WHEN a user logs in THEN the system SHALL apply permissions based on their assigned role(s).
2. IF a user attempts an action outside their permissions THEN the system SHALL deny the action and log the attempt.
3. WHEN an admin modifies user permissions THEN the system SHALL apply changes immediately and log the modification.
4. WHERE deal-level permissions override role defaults THEN the system SHALL apply the more restrictive permission.
5. WHEN a user's role changes THEN the system SHALL update their accessible deals and features accordingly.

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds (P95) |
| Search Response | < 2 seconds |
| Event Processing | < 30 seconds from source to display |
| API Response | < 500ms (P95) |

### 3.2 Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.9% (excluding planned maintenance) |
| Data Durability | 99.999999999% (11 nines) |
| Recovery Point Objective (RPO) | < 1 hour |
| Recovery Time Objective (RTO) | < 4 hours |

### 3.3 Security

1. WHEN transmitting data THEN the system SHALL use TLS 1.3 encryption.
2. WHEN storing sensitive data THEN the system SHALL encrypt at rest using AES-256.
3. WHEN a user session is inactive for 30 minutes THEN the system SHALL require re-authentication.
4. WHERE PII is displayed THEN the system SHALL mask sensitive fields based on user permissions.

### 3.4 Scalability

1. The system SHALL support 10,000 concurrent users at MVP launch.
2. The system SHALL handle 1,000,000 events per day.
3. The system SHALL store 10TB of documents without performance degradation.

---

## 4. Success Metrics

| Metric | Baseline | MVP Target |
|--------|----------|------------|
| Touches per document | 15-30 | < 10 |
| Apps used per transaction | 5+ | 1-2 |
| Time to find document | 2-5 minutes | < 30 seconds |
| Missed communications | 5-10% | < 1% |
| Compliance audit prep time | 4-8 hours | < 1 hour |

---

## 5. Out of Scope for MVP

The following are explicitly NOT included in MVP:

- Mobile native applications (web responsive only)
- Custom report builder
- Third-party marketplace/integrations beyond core connectors
- Multi-language support
- Offline mode
- Advanced analytics/BI dashboards
- White-labeling

---

## 6. Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| REIL Event Ledger | Lane 2 | In Progress |
| Authentication Service | Platform Team | Available |
| Document Storage | Infrastructure | Available |
| Email Connector | Lane 2 | In Progress |

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Engineering Lead | | | Pending |
| Design Lead | | | Pending |
