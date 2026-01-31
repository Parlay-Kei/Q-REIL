# Q Application Modules Map

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2025-12-31
**Sprint:** 0.1 - Scope Lock

---

## 1. Overview

This document maps the Q application's module structure, defining each module's purpose, components, data requirements, and integration points with REIL.

### 1.1 Module Architecture

```
Q Application
├── Core Shell
│   ├── Navigation
│   ├── Authentication UI
│   ├── Global Search
│   └── Notifications
├── Pipeline Module
├── Records Module
├── Docs Module
├── Inbox Module
└── Tasks Module
```

### 1.2 Module Principles

1. **Lazy Loading**: Modules load on demand to optimize initial bundle size
2. **Self-Contained**: Each module owns its routes, state, and components
3. **Shared Services**: Common functionality via core services (auth, API client)
4. **Consistent UX**: All modules follow shared design system

---

## 2. Core Shell

### 2.1 Purpose

The Core Shell provides the application framework that hosts all modules, including navigation, authentication state, and cross-cutting concerns.

### 2.2 Components

| Component | Description |
|-----------|-------------|
| `AppShell` | Main layout container with sidebar and content area |
| `Navigation` | Primary navigation sidebar with module links |
| `TopBar` | Header with search, notifications, user menu |
| `GlobalSearch` | Unified search across all modules |
| `NotificationCenter` | Notification dropdown and management |
| `UserMenu` | Profile, settings, logout options |

### 2.3 EARS Requirements

1. WHEN the application loads THEN the Core Shell SHALL verify authentication and redirect to login if needed.
2. IF a user clicks a navigation item THEN the Core Shell SHALL load the corresponding module and update the URL.
3. WHEN a real-time event arrives THEN the Core Shell SHALL route it to the appropriate module for handling.
4. WHERE global search is invoked THEN the Core Shell SHALL query REIL and display results across all entity types.
5. WHILE the user is authenticated THEN the Core Shell SHALL maintain the session and handle token refresh.

---

## 3. Pipeline Module

### 3.1 Purpose

The Pipeline module provides a visual overview of all deals/transactions, enabling users to quickly assess status, prioritize work, and navigate to specific deals.

### 3.2 Views

| View | Description | Route |
|------|-------------|-------|
| Kanban Board | Deals as cards in stage columns | `/pipeline/board` |
| List View | Deals in sortable/filterable table | `/pipeline/list` |
| Calendar View | Deals by key dates (closing, inspection) | `/pipeline/calendar` |
| Map View | Deals by property location | `/pipeline/map` |

### 3.3 Components

| Component | Description |
|-----------|-------------|
| `PipelineBoard` | Kanban-style board with draggable cards |
| `PipelineList` | Data table with sorting, filtering, pagination |
| `PipelineCalendar` | Calendar grid with deal events |
| `PipelineMap` | Map with property markers |
| `DealCard` | Compact deal summary for board/list |
| `PipelineFilters` | Filter controls (status, date, agent, type) |
| `PipelineStats` | Summary metrics (count, value, velocity) |

### 3.4 Data Requirements

| Data | Source | Update Frequency |
|------|--------|------------------|
| Deal List | `GET /deals` | Real-time via WebSocket |
| Deal Stages | `GET /stages` | On load, cached |
| Deal Counts | `GET /deals/stats` | Every 30 seconds |
| User Filters | Local Storage | Immediate |

### 3.5 EARS Requirements

1. WHEN the Pipeline module loads THEN it SHALL fetch deals for the current user's scope.
2. IF a user drags a deal card to a new stage THEN the module SHALL send a stage update to REIL and show optimistic UI.
3. WHEN a deal is updated elsewhere THEN the Pipeline SHALL reflect the change within 5 seconds.
4. WHERE filters are applied THEN the module SHALL persist filter state and reapply on next visit.
5. WHILE loading deals THEN the module SHALL display skeleton placeholders.
6. IF the deal list exceeds 100 items THEN the module SHALL implement virtual scrolling.

### 3.6 Integration Points

| Integration | REIL API | Event Subscription |
|-------------|----------|-------------------|
| Deal CRUD | `/deals/*` | `deal.created`, `deal.updated`, `deal.deleted` |
| Stage Changes | `PATCH /deals/{id}/stage` | `deal.stage_changed` |
| Filters | Query parameters on `/deals` | N/A |

---

## 4. Records Module

### 4.1 Purpose

The Records module displays detailed views of individual entities (deals, properties, contacts) with full context, related items, and action capabilities.

### 4.2 Views

| View | Description | Route |
|------|-------------|-------|
| Deal Record | Complete deal detail page | `/records/deals/{id}` |
| Property Record | Property and unit details | `/records/properties/{id}` |
| Contact Record | Contact profile and history | `/records/contacts/{id}` |

### 4.3 Components

| Component | Description |
|-----------|-------------|
| `DealRecord` | Main deal detail container |
| `DealHeader` | Deal summary, status, key dates |
| `DealTimeline` | Activity feed from event ledger |
| `DealParties` | Buyer, seller, agents, vendors |
| `DealFinancials` | Price, commission, fees breakdown |
| `DealMilestones` | Key dates and progress tracker |
| `PropertyRecord` | Property detail container |
| `PropertyUnits` | Unit list for multi-family |
| `PropertyHistory` | Transaction and lease history |
| `ContactRecord` | Contact profile container |
| `ContactDeals` | Deals associated with contact |
| `ContactCommunications` | Message history with contact |

### 4.4 Data Requirements

| Data | Source | Update Frequency |
|------|--------|------------------|
| Deal Detail | `GET /deals/{id}` | Real-time via WebSocket |
| Deal Timeline | `GET /events?deal_id={id}` | Real-time via WebSocket |
| Deal Documents | `GET /documents?deal_id={id}` | Real-time |
| Property Detail | `GET /properties/{id}` | On load |
| Contact Detail | `GET /contacts/{id}` | On load |

### 4.5 EARS Requirements

1. WHEN a user navigates to a record THEN the module SHALL fetch and display the entity with all related data.
2. IF the user has edit permissions THEN the module SHALL display inline edit controls.
3. WHEN an event is added to the deal THEN the Timeline SHALL update without page refresh.
4. WHERE deal data conflicts with external source THEN the module SHALL show conflict indicator with resolution options.
5. WHILE loading record data THEN the module SHALL show skeleton UI matching the final layout.
6. IF a record is not found THEN the module SHALL display a 404 view with navigation options.

### 4.6 Integration Points

| Integration | REIL API | Event Subscription |
|-------------|----------|-------------------|
| Deal CRUD | `/deals/{id}` | `deal.updated` |
| Timeline | `/events` | `event.created` |
| Documents | `/documents` | `document.uploaded`, `document.status_changed` |
| Parties | `/deals/{id}/parties` | `party.added`, `party.removed` |

---

## 5. Docs Module

### 5.1 Purpose

The Docs module provides document management, including upload, organization, preview, e-signature integration, and compliance tracking.

### 5.2 Views

| View | Description | Route |
|------|-------------|-------|
| Document Library | All documents with filters | `/docs` |
| Deal Documents | Documents for a specific deal | `/docs/deal/{id}` |
| Document Viewer | Full-screen document preview | `/docs/view/{id}` |
| Checklist | Required documents status | `/docs/checklist/{deal_id}` |

### 5.3 Components

| Component | Description |
|-----------|-------------|
| `DocLibrary` | Grid/list view of documents |
| `DocUploader` | Drag-drop upload with progress |
| `DocViewer` | PDF/image viewer with annotations |
| `DocPreview` | Thumbnail preview component |
| `DocChecklist` | Required docs with status |
| `DocFilters` | Filter by type, status, deal |
| `DocActions` | Share, download, sign, delete |
| `SignatureStatus` | E-signature progress tracker |

### 5.4 Data Requirements

| Data | Source | Update Frequency |
|------|--------|------------------|
| Document List | `GET /documents` | Real-time |
| Document Content | `GET /documents/{id}/content` | On demand |
| Document Metadata | `GET /documents/{id}` | Real-time |
| Checklist | `GET /checklists/{deal_id}` | Real-time |
| Signature Status | `GET /signatures/{doc_id}` | Polling 30s |

### 5.5 EARS Requirements

1. WHEN a user uploads a document THEN the module SHALL show upload progress and confirm completion.
2. IF a document is classified automatically THEN the module SHALL allow user correction of the classification.
3. WHEN viewing a document THEN the module SHALL render preview without requiring download.
4. WHERE e-signature is requested THEN the module SHALL launch the signature flow and track completion.
5. WHILE a document is processing (OCR, classification) THEN the module SHALL show processing status.
6. IF a required document is missing THEN the Checklist SHALL highlight the gap with action to upload.
7. WHEN a document status changes THEN the module SHALL update the UI and notify relevant parties.

### 5.6 Integration Points

| Integration | REIL API | Event Subscription |
|-------------|----------|-------------------|
| Upload | `POST /documents` | `document.uploaded` |
| Classification | `POST /documents/{id}/classify` | `document.classified` |
| Content | `GET /documents/{id}/content` | N/A |
| Signatures | `/signatures/*` | `signature.requested`, `signature.completed` |
| Checklist | `/checklists/*` | `checklist.item_completed` |

---

## 6. Inbox Module

### 6.1 Purpose

The Inbox module consolidates all deal-related communications (email, SMS, internal notes) into a single unified interface.

### 6.2 Views

| View | Description | Route |
|------|-------------|-------|
| All Messages | Complete inbox across all deals | `/inbox` |
| Deal Inbox | Messages for specific deal | `/inbox/deal/{id}` |
| Thread View | Conversation thread | `/inbox/thread/{id}` |
| Compose | New message composition | `/inbox/compose` |
| Triage | Unmatched messages queue | `/inbox/triage` |

### 6.3 Components

| Component | Description |
|-----------|-------------|
| `InboxList` | Message list with unread indicators |
| `MessageThread` | Conversation view with replies |
| `MessageComposer` | Rich text editor with attachments |
| `MessagePreview` | Inline message preview |
| `InboxFilters` | Filter by deal, sender, status |
| `TriageQueue` | Unmatched message assignment |
| `QuickReply` | Inline reply without full composer |
| `AttachmentPicker` | Select deal documents to attach |

### 6.4 Data Requirements

| Data | Source | Update Frequency |
|------|--------|------------------|
| Messages | `GET /messages` | Real-time via WebSocket |
| Thread | `GET /messages/thread/{id}` | Real-time |
| Unread Counts | `GET /messages/unread` | Real-time |
| Triage Queue | `GET /messages/unmatched` | Real-time |

### 6.5 EARS Requirements

1. WHEN a new message arrives THEN the Inbox SHALL display it within 10 seconds and update unread count.
2. IF a message is from an external source (email) THEN the module SHALL display sender, subject, and preview.
3. WHEN a user replies THEN the module SHALL send via the appropriate channel and log the activity.
4. WHERE a message cannot be auto-matched THEN the module SHALL place it in Triage for manual assignment.
5. WHILE composing THEN the module SHALL auto-save drafts every 30 seconds.
6. IF the user is mentioned in a message THEN the module SHALL highlight the mention and notify.
7. WHEN archiving a message THEN the module SHALL move it from inbox without deletion.

### 6.6 Integration Points

| Integration | REIL API | Event Subscription |
|-------------|----------|-------------------|
| Messages | `/messages/*` | `message.received`, `message.sent` |
| Threading | `/messages/thread/*` | `message.replied` |
| Send | `POST /messages/send` | N/A |
| Match | `POST /messages/{id}/match` | `message.matched` |

---

## 7. Tasks Module

### 7.1 Purpose

The Tasks module manages to-dos, workflows, and automated task generation based on deal milestones and templates.

### 7.2 Views

| View | Description | Route |
|------|-------------|-------|
| My Tasks | User's assigned tasks | `/tasks` |
| Deal Tasks | Tasks for specific deal | `/tasks/deal/{id}` |
| Task Detail | Full task view with history | `/tasks/{id}` |
| Templates | Workflow template management | `/tasks/templates` |

### 7.3 Components

| Component | Description |
|-----------|-------------|
| `TaskList` | Sortable task list with filters |
| `TaskCard` | Task summary with status, due date |
| `TaskDetail` | Full task view with notes, history |
| `TaskForm` | Create/edit task form |
| `TaskFilters` | Filter by status, due date, assignee |
| `TaskCalendar` | Calendar view of due dates |
| `WorkflowTemplate` | Template editor for auto-tasks |
| `TaskProgress` | Deal task completion progress bar |

### 7.4 Data Requirements

| Data | Source | Update Frequency |
|------|--------|------------------|
| Tasks | `GET /tasks` | Real-time |
| Task Detail | `GET /tasks/{id}` | Real-time |
| Templates | `GET /templates/tasks` | On load |
| Due Soon | `GET /tasks?due_before={date}` | Every 5 minutes |

### 7.5 EARS Requirements

1. WHEN a deal enters a new stage THEN the module SHALL create tasks from the stage's template.
2. IF a task is overdue THEN the module SHALL display visual warning and send reminder notification.
3. WHEN a user completes a task THEN the module SHALL log completion and check for dependent tasks.
4. WHERE tasks have dependencies THEN the module SHALL enforce completion order.
5. WHILE a task is in progress THEN the module SHALL allow notes, attachments, and partial completion.
6. IF a task is reassigned THEN the module SHALL notify both previous and new assignee.
7. WHEN bulk operations are performed THEN the module SHALL provide progress feedback.

### 7.6 Integration Points

| Integration | REIL API | Event Subscription |
|-------------|----------|-------------------|
| Tasks | `/tasks/*` | `task.created`, `task.completed`, `task.overdue` |
| Assignment | `PATCH /tasks/{id}/assign` | `task.assigned` |
| Templates | `/templates/tasks/*` | N/A |
| Automation | N/A | `deal.stage_changed` (triggers task creation) |

---

## 8. Module Dependencies

### 8.1 Cross-Module Navigation

| From | To | Trigger |
|------|-----|---------|
| Pipeline | Records | Click deal card |
| Records | Docs | Click document link |
| Records | Inbox | Click communication |
| Records | Tasks | Click task |
| Inbox | Records | Click deal reference |
| Docs | Records | Click associated deal |
| Tasks | Records | Click deal link |
| Any | Any | Global search result |

### 8.2 Shared State

| State | Owner | Consumers |
|-------|-------|-----------|
| Current User | Core Shell | All modules |
| Selected Deal | Records | Docs, Inbox, Tasks |
| Notification Count | Core Shell | All modules (badge display) |
| Filter Preferences | Each Module | Persisted locally |

---

## 9. Module Load Performance Targets

| Module | Initial Load | Data Fetch | Time to Interactive |
|--------|--------------|------------|---------------------|
| Core Shell | < 500ms | N/A | < 1s |
| Pipeline | < 300ms | < 1s | < 1.5s |
| Records | < 300ms | < 800ms | < 1.2s |
| Docs | < 300ms | < 1s | < 1.5s |
| Inbox | < 300ms | < 800ms | < 1.2s |
| Tasks | < 300ms | < 600ms | < 1s |

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Frontend Lead | | | Pending |
| UX Lead | | | Pending |
