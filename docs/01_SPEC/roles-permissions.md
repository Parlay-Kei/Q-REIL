# REIL/Q Roles and Permissions

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2025-12-31
**Sprint:** 0.1 - Scope Lock

---

## 1. Overview

This document defines the role-based access control (RBAC) model for the REIL/Q platform. The permission system follows the principle of least privilege, granting users only the access necessary to perform their job functions.

### 1.1 Permission Model

Permissions are structured in three layers:

1. **Role Permissions** - Default permissions assigned to each role
2. **Organization Overrides** - Organization-level customizations to role defaults
3. **Deal-Level Grants** - Explicit permissions granted on specific deals

When conflicts exist, the **most restrictive** permission applies.

---

## 2. Role Definitions

### 2.1 Admin

**Description:** Full system access for organization management, user administration, and compliance oversight.

**Typical Users:** Brokers, Office Managers, Compliance Officers

| Permission Category | Access Level | Notes |
|---------------------|--------------|-------|
| **Organization Settings** | Full | Configure org name, branding, integrations |
| **User Management** | Full | Create, modify, deactivate users; assign roles |
| **Role Configuration** | Full | Customize role permissions within org |
| **All Deals** | View + Manage | Access any deal in the organization |
| **Audit Logs** | Full | View complete audit trail, export reports |
| **Billing** | Full | Manage subscription, payment, invoices |
| **Integrations** | Full | Configure connectors, API keys, webhooks |
| **Templates** | Full | Create/modify document and workflow templates |
| **Reports** | Full | Access all reports, create custom views |

**EARS Requirements:**

1. WHEN an Admin logs in THEN the system SHALL grant access to the Admin Dashboard.
2. IF an Admin deactivates a user THEN the system SHALL revoke all active sessions for that user immediately.
3. WHEN an Admin modifies organization settings THEN the system SHALL log the change with before/after values.
4. WHERE audit logs are accessed THEN the system SHALL record the Admin's access as an auditable event.

---

### 2.2 Agent

**Description:** Deal management, document handling, and client communication for real estate agents.

**Typical Users:** Listing Agents, Buyer's Agents, Team Leads

| Permission Category | Access Level | Notes |
|---------------------|--------------|-------|
| **Organization Settings** | None | Cannot access org configuration |
| **User Management** | None | Cannot manage other users |
| **Own Deals** | Full | Create, manage, close assigned deals |
| **Team Deals** | View | View deals for team members (if team enabled) |
| **Documents (Own Deals)** | Full | Upload, download, share, request signatures |
| **Inbox (Own Deals)** | Full | View, reply, compose messages |
| **Tasks (Own Deals)** | Full | Create, assign, complete tasks |
| **Clients** | Full | Manage client contacts for own deals |
| **Templates** | Use Only | Use templates, cannot modify |
| **Reports** | Own Data | View reports for own deals only |

**EARS Requirements:**

1. WHEN an Agent creates a deal THEN the system SHALL automatically assign them as deal owner.
2. IF an Agent attempts to access a deal they are not assigned to THEN the system SHALL deny access and log the attempt.
3. WHEN an Agent shares a document THEN the system SHALL create a share event with recipient and expiration.
4. WHERE team visibility is enabled THEN the system SHALL allow view-only access to team members' deals.
5. WHILE an Agent is assigned to a deal THEN the system SHALL include that deal's communications in their inbox.

---

### 2.3 TC (Transaction Coordinator)

**Description:** Document processing, compliance verification, and transaction coordination support.

**Typical Users:** Transaction Coordinators, Compliance Assistants, File Reviewers

| Permission Category | Access Level | Notes |
|---------------------|--------------|-------|
| **Organization Settings** | None | Cannot access org configuration |
| **User Management** | None | Cannot manage other users |
| **Assigned Deals** | Full | Full access to deals assigned for coordination |
| **Unassigned Deals** | None | No access until assigned |
| **Documents** | Full | Upload, review, approve, reject documents |
| **Document Checklists** | Full | Manage compliance checklists, mark items complete |
| **Inbox (Assigned Deals)** | Full | View and respond to deal communications |
| **Tasks** | Full | Create, assign, manage tasks on assigned deals |
| **Clients** | View + Limited Edit | View client info, update contact details |
| **Templates** | Use Only | Use templates, cannot modify |
| **Reports** | Assigned Deals | View reports for assigned deals |
| **Audit Trail** | View (Assigned) | View activity log for assigned deals |

**EARS Requirements:**

1. WHEN a TC is assigned to a deal THEN the system SHALL grant them full access to that deal's documents and communications.
2. IF a TC marks a document as "Approved" THEN the system SHALL log the approval with timestamp and create a compliance event.
3. WHEN a TC identifies a compliance issue THEN the system SHALL allow them to create a blocking task for the deal owner.
4. WHERE document review is required THEN the system SHALL track TC review status separately from agent acknowledgment.
5. WHILE a TC has deals pending review THEN the system SHALL display a priority queue sorted by closing date.

---

### 2.4 Property Manager

**Description:** Property and unit management, leasing workflows, and tenant coordination.

**Typical Users:** Property Managers, Leasing Agents, Asset Managers

| Permission Category | Access Level | Notes |
|---------------------|--------------|-------|
| **Organization Settings** | None | Cannot access org configuration |
| **User Management** | None | Cannot manage other users |
| **Properties (Assigned)** | Full | Manage assigned properties and units |
| **Properties (Unassigned)** | None | No access to other properties |
| **Lease Deals** | Full | Create and manage leasing transactions |
| **Sale Deals** | None | No access to sales transactions |
| **Documents (Leasing)** | Full | Manage lease documents, applications, renewals |
| **Tenants** | Full | Manage tenant records for assigned properties |
| **Inbox (Property-Related)** | Full | Communications related to assigned properties |
| **Tasks (Property)** | Full | Maintenance requests, lease renewals, inspections |
| **Templates** | Use Only | Use leasing templates |
| **Reports** | Property Data | View reports for assigned properties |

**EARS Requirements:**

1. WHEN a Property Manager is assigned to a property THEN the system SHALL grant access to all units and lease history for that property.
2. IF a Property Manager creates a lease deal THEN the system SHALL automatically link it to the property record.
3. WHEN a lease is expiring within 90 days THEN the system SHALL generate renewal tasks for the Property Manager.
4. WHERE unit status changes (vacant, occupied, maintenance) THEN the system SHALL update the property dashboard in real-time.
5. WHILE managing multiple properties THEN the system SHALL provide a portfolio view with occupancy and lease metrics.

---

## 3. Permission Matrix

### 3.1 Feature Access by Role

| Feature | Admin | Agent | TC | Property Manager |
|---------|-------|-------|----|--------------------|
| Dashboard | Full | Own | Assigned | Property |
| Pipeline | All Deals | Own + Team | Assigned | Lease Deals |
| Records - Sales | All | Own | Assigned | None |
| Records - Leasing | All | Own | Assigned | Assigned Properties |
| Documents | All | Own Deals | Assigned Deals | Assigned Properties |
| Inbox | All | Own Deals | Assigned Deals | Assigned Properties |
| Tasks | All | Own Deals | Assigned Deals | Assigned Properties |
| Contacts | All | Own | View | Tenants |
| Reports | All | Own | Assigned | Property |
| Audit Log | Full | Own Activity | Assigned Deals | Assigned Properties |
| Settings - Org | Full | None | None | None |
| Settings - Personal | Full | Full | Full | Full |
| Integrations | Full | None | None | None |
| Templates | Full | Use | Use | Use |

### 3.2 Action Permissions

| Action | Admin | Agent | TC | Property Manager |
|--------|-------|-------|----|--------------------|
| Create Deal | Yes | Yes | No | Lease Only |
| Delete Deal | Yes | Own Only | No | No |
| Assign User to Deal | Yes | Own Deals | No | No |
| Upload Document | Yes | Own Deals | Assigned | Assigned Properties |
| Delete Document | Yes | Own Deals | No | No |
| Approve Document | Yes | Own Deals | Assigned | Assigned Properties |
| Send Communication | Yes | Own Deals | Assigned | Assigned Properties |
| Create Task | Yes | Own Deals | Assigned | Assigned Properties |
| Assign Task | Yes | Own Deals | Assigned | Assigned Properties |
| View Audit Log | Full | Own Activity | Assigned | Assigned |
| Export Data | Yes | Own Deals | No | No |
| Manage Users | Yes | No | No | No |
| Configure Integrations | Yes | No | No | No |

---

## 4. Special Permission Scenarios

### 4.1 Team Structures

WHEN an organization enables team structures:
- Team Leads SHALL have view access to all team member deals
- Team Leads MAY be granted edit access at organization discretion
- Team members SHALL NOT have automatic access to other team member deals

### 4.2 Deal-Level Overrides

Admins and Deal Owners can grant explicit permissions to users who would not otherwise have access:

| Grant Type | Grantor | Duration | Scope |
|------------|---------|----------|-------|
| View Access | Admin, Deal Owner | Permanent or Time-Limited | Single Deal |
| Edit Access | Admin, Deal Owner | Permanent or Time-Limited | Single Deal |
| Document Access | Admin, Deal Owner, TC | Permanent or Time-Limited | Specific Documents |

### 4.3 External Collaborators

For users outside the organization (clients, cooperating agents, vendors):

1. WHEN an external user is invited THEN the system SHALL create a limited-access account.
2. IF an external user is granted deal access THEN the system SHALL restrict them to explicitly shared items only.
3. WHERE external access is time-limited THEN the system SHALL automatically revoke access upon expiration.

---

## 5. Audit and Compliance

### 5.1 Permission Changes

1. WHEN any permission is modified THEN the system SHALL log: actor, target user, old permission, new permission, timestamp.
2. IF bulk permission changes are made THEN the system SHALL create an audit event for each affected user.
3. WHERE compliance requires permission reviews THEN the system SHALL support scheduled access reports.

### 5.2 Access Logging

All access attempts are logged with:

| Field | Description |
|-------|-------------|
| `actor_id` | User attempting access |
| `resource_type` | Deal, Document, Contact, etc. |
| `resource_id` | Specific resource identifier |
| `action` | View, Edit, Delete, Share, etc. |
| `result` | Allowed, Denied |
| `timestamp` | ISO 8601 timestamp |
| `ip_address` | Originating IP |
| `user_agent` | Browser/client information |

---

## 6. Implementation Notes

### 6.1 Permission Evaluation Order

1. Check if user is deactivated (deny all)
2. Check organization-level suspension (deny all)
3. Evaluate role default permissions
4. Apply organization role overrides
5. Apply deal-level grants
6. Apply most restrictive result

### 6.2 Caching Strategy

- Role permissions: Cached for session duration
- Deal-level permissions: Cached for 5 minutes with invalidation on change
- Permission changes: Propagate within 30 seconds

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | | | Pending |
| Security Lead | | | Pending |
| Engineering Lead | | | Pending |
