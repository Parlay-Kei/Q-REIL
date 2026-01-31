# REIL vs Q: Architectural Boundaries

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2025-12-31
**Sprint:** 0.1 - Scope Lock

---

## 1. Overview

This document establishes the clear separation of responsibilities between **REIL** (the infrastructure layer) and **Q** (the application layer). Maintaining these boundaries is critical for:

- Independent scaling of infrastructure and application
- Clear ownership and accountability
- Avoiding tight coupling that impedes future development
- Enabling potential white-labeling or alternative frontends

### 1.1 The Golden Rule

> **REIL knows nothing about UI. Q knows nothing about data storage.**

---

## 2. REIL: The Infrastructure Layer

### 2.1 Definition

REIL (Real Estate Infrastructure Layer) is the **backend infrastructure** that provides:
- Data persistence and integrity
- Event sourcing and audit trail
- External system connectivity
- Data synchronization and conflict resolution

### 2.2 REIL Responsibilities

| Domain | Responsibility | Examples |
|--------|---------------|----------|
| **Event Ledger** | Immutable event storage | Append events, query history, maintain order |
| **Data Model** | Entity definitions and relationships | Deal, Property, Contact, Document schemas |
| **Connectors** | External system integration | MLS sync, email ingestion, calendar integration |
| **Sync Engine** | Data consistency across systems | Conflict resolution, eventual consistency |
| **Storage** | Document and asset persistence | File storage, versioning, retrieval |
| **Search Index** | Full-text and structured search | Indexing, query execution |
| **Authentication** | Identity and session management | OAuth, tokens, session validation |
| **Authorization** | Permission evaluation | Policy enforcement, access decisions |
| **API Gateway** | External API surface | Rate limiting, versioning, documentation |

### 2.3 REIL Does NOT Handle

- User interface rendering
- View state management
- UI-specific data transformations
- User preferences display
- Navigation or routing
- Form validation (beyond API contract validation)
- Notification delivery preferences (only stores them)

### 2.4 REIL API Contract

REIL exposes functionality through well-defined APIs:

```
REIL API Categories:
├── /events          - Event ledger operations
├── /deals           - Deal CRUD and queries
├── /properties      - Property management
├── /documents       - Document storage and retrieval
├── /contacts        - Contact management
├── /search          - Search operations
├── /sync            - Connector status and triggers
└── /auth            - Authentication endpoints
```

**EARS Requirements for REIL:**

1. WHEN Q requests data THEN REIL SHALL respond with structured JSON conforming to published schemas.
2. IF a connector receives external data THEN REIL SHALL normalize it to the canonical data model before storage.
3. WHEN any state change occurs THEN REIL SHALL emit an event to the ledger before confirming the operation.
4. WHERE external systems push data THEN REIL SHALL validate, transform, and store without Q involvement.
5. WHILE sync operations are in progress THEN REIL SHALL maintain eventual consistency guarantees.

---

## 3. Q: The Application Layer

### 3.1 Definition

Q is the **user-facing application** that provides:
- User interface and experience
- Workflow orchestration
- User-specific views and preferences
- Real-time collaboration features

### 3.2 Q Responsibilities

| Domain | Responsibility | Examples |
|--------|---------------|----------|
| **UI Components** | Visual interface elements | Buttons, forms, tables, modals |
| **Views/Pages** | Screen composition | Pipeline, Deal Record, Inbox |
| **State Management** | Client-side state | UI state, cache, optimistic updates |
| **Routing** | Navigation | URL handling, deep linking, history |
| **Workflows** | User task flows | Deal creation wizard, document upload flow |
| **Notifications UI** | Alert presentation | Toasts, badges, notification center |
| **Preferences** | User settings UI | Theme, layout, notification preferences |
| **Real-time Updates** | Live data refresh | WebSocket handling, polling strategies |
| **Offline Support** | Graceful degradation | Queue actions, sync on reconnect |

### 3.3 Q Does NOT Handle

- Data persistence (beyond local cache)
- Direct database access
- External system authentication
- Event ledger writes
- Document storage
- Search indexing
- Permission policy definitions

### 3.4 Q Data Access Pattern

Q accesses all data through REIL APIs:

```
User Action → Q UI → Q State → REIL API → REIL Core → Response → Q State → Q UI
```

**EARS Requirements for Q:**

1. WHEN displaying deal data THEN Q SHALL fetch from REIL API, never direct database access.
2. IF a user action requires persistence THEN Q SHALL send the action to REIL and await confirmation.
3. WHEN REIL returns an error THEN Q SHALL display appropriate user feedback without exposing internal details.
4. WHERE real-time updates are needed THEN Q SHALL subscribe to REIL event streams.
5. WHILE offline THEN Q SHALL queue actions locally and sync when connection is restored.

---

## 4. Boundary Interface

### 4.1 Communication Patterns

| Pattern | Direction | Use Case |
|---------|-----------|----------|
| REST API | Q → REIL | CRUD operations, queries |
| GraphQL | Q → REIL | Complex data fetching, subscriptions |
| WebSocket | REIL → Q | Real-time events, notifications |
| Webhooks | External → REIL | Incoming data from integrations |

### 4.2 Data Flow Examples

#### Example 1: User Creates a Deal

```
1. [Q] User fills deal creation form
2. [Q] Q validates form inputs (UI validation)
3. [Q] Q sends POST /deals to REIL
4. [REIL] REIL validates against schema
5. [REIL] REIL creates DealCreated event
6. [REIL] REIL persists deal to database
7. [REIL] REIL returns deal object to Q
8. [Q] Q updates local state
9. [Q] Q navigates to deal record view
```

#### Example 2: Email Arrives from External

```
1. [External] Email provider sends webhook to REIL
2. [REIL] Connector receives and validates payload
3. [REIL] REIL matches email to deal (by address, MLS#, participants)
4. [REIL] REIL creates MessageReceived event
5. [REIL] REIL stores email in communications table
6. [REIL] REIL emits event via WebSocket
7. [Q] Q receives WebSocket event
8. [Q] Q updates inbox badge count
9. [Q] Q shows notification if user is on inbox view
```

#### Example 3: User Searches Documents

```
1. [Q] User enters search query in search box
2. [Q] Q sends GET /search?q=... to REIL
3. [REIL] REIL queries search index
4. [REIL] REIL filters results by user permissions
5. [REIL] REIL returns paginated results
6. [Q] Q renders search results list
7. [Q] User clicks result
8. [Q] Q navigates to document detail view
```

### 4.3 Shared Responsibilities

Some areas require coordination between REIL and Q:

| Area | REIL Responsibility | Q Responsibility |
|------|--------------------|--------------------|
| **Validation** | Schema validation, business rules | Form validation, UX feedback |
| **Errors** | Error codes, structured messages | User-friendly display, retry logic |
| **Pagination** | Cursor/offset support, limits | Page size selection, infinite scroll |
| **Filtering** | Query execution, indexing | Filter UI, parameter building |
| **Sorting** | Sort implementation | Sort UI, preference storage |
| **Caching** | Cache headers, ETags | Local cache, invalidation |

---

## 5. Anti-Patterns to Avoid

### 5.1 REIL Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Returning HTML | REIL should not know about presentation | Return structured data (JSON) |
| UI-specific field names | Couples to specific UI implementation | Use canonical domain names |
| Storing view state | View state is Q's responsibility | Store only domain data |
| Formatting dates for display | Display formatting is UI concern | Return ISO timestamps |
| Including CSS classes | Presentation belongs in Q | Return semantic data |

### 5.2 Q Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Direct database queries | Bypasses REIL's data governance | Use REIL APIs |
| Writing to event ledger | Event sourcing is REIL's domain | Send actions to REIL |
| Implementing business logic | Business rules belong in REIL | Delegate to REIL |
| Storing authoritative data | Q cache is not source of truth | Persist via REIL |
| Calling external APIs directly | Connectors are REIL's responsibility | Request via REIL |

---

## 6. Team Ownership

### 6.1 Lane Assignments

| Lane | Focus | Primary Owner |
|------|-------|---------------|
| Lane 2 | REIL Core | Backend/Infrastructure Team |
| Lane 3 | Q Application | Frontend/Product Team |

### 6.2 Boundary Disputes

When unclear which side owns a responsibility:

1. **Default to REIL** if it involves data integrity or external systems
2. **Default to Q** if it involves user interaction or display
3. **Document the decision** in this file under Section 7
4. **Create API contract** before implementation

---

## 7. Boundary Decisions Log

Record decisions about boundary disputes here:

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2025-12-31 | Document thumbnail generation → REIL | Requires server-side processing, cached for all users | Architecture Review |
| 2025-12-31 | Notification preferences UI → Q, storage → REIL | UI is Q's domain, persistence is REIL's | Architecture Review |
| 2025-12-31 | Deal stage transition rules → REIL | Business logic, must be enforced regardless of client | Architecture Review |

---

## 8. Integration Checklist

Before implementing a new feature, verify:

### For REIL Changes
- [ ] API contract documented in OpenAPI spec
- [ ] Events defined for all state changes
- [ ] No UI/presentation concerns in response
- [ ] Permission checks implemented
- [ ] Error responses use standard format

### For Q Changes
- [ ] All data access via REIL API
- [ ] No business logic that should be in REIL
- [ ] Graceful handling of REIL errors
- [ ] Loading and error states implemented
- [ ] Real-time updates subscribed if needed

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Architecture Lead | | | Pending |
| Backend Lead | | | Pending |
| Frontend Lead | | | Pending |
