# CRE-Aligned Labels and Copy — Q REIL

**Mission:** PRODOPS-REIL-CRE-COPY-0012  
**Owner:** Product Ops  
**Date:** 2026-01-30  
**Scope:** Q REIL (Commercial Real Estate package) — UI labels and copy aligned to the ledger-driven workflow: ingest, link, timeline, audit.

---

## 1. Overview

This document defines CRE-aligned UI copy for all Q REIL screens using the package name **Q REIL**. Labels, headings, and descriptions support the **ledger-driven workflow** (ingest → link → timeline → audit) and use CRE industry terminology (LOI, lease, tenant, landlord, asset, transaction, correspondence, etc.).

Empty-state and error-state copy are maintained in [EMPTY_STATES.md](./EMPTY_STATES.md).

---

## 2. Ledger-Driven Workflow (Ingest → Link → Timeline → Audit)

Language across Q REIL is chosen to reinforce the four phases:

| Phase | Purpose | Where it appears in Q REIL |
|-------|--------|----------------------------|
| **Ingest** | Bring correspondence and documents into the ledger | Inbox sync, "Ingested" badge, Documents source, sync events in Ledger |
| **Link** | Connect evidence to records (contacts, assets, transactions) | "Link to record," "Link evidence," "Suggested Links," "Linked" / "Unlinked" badges |
| **Timeline** | Chronological view of events per record or globally | Activity Timeline (deal workspace), Ledger timeline view, "View full ledger" |
| **Audit** | Immutable record of what happened and when | Audit Trail (thread detail), Activity Ledger, event type filters (Documents, Emails, Links, System) |

Labels below use terms that map clearly to these phases (e.g. *Ingested*, *Link to record*, *Activity Timeline*, *Audit Trail*).

---

## 3. Screen-by-Screen Copy

### 3.1 Q REIL Overview (Home)

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Page title** | REIL | Q REIL |
| **Tagline** | Evidence linking & intelligence. Connect threads, documents, and deals. | Evidence linking & intelligence. Connect threads, documents, and transactions. |
| **KPI: Unlinked Threads** | Unlinked Threads | Unlinked Correspondence |
| **KPI: Documents** | Documents Ingested | Documents Ingested |
| **KPI: Deals** | Deals Needing Evidence | Transactions Needing Evidence |
| **Section: Unlinked** | Unlinked Threads | Unlinked Correspondence |
| **Section: Documents** | Latest Documents | Latest Documents |
| **Section: Deals** | Deals Needing Evidence | Transactions Needing Evidence |
| **Badge: pending** | X pending | X pending |
| **Button: Create record** | Create record | Create record |
| **Button: Link evidence** | Link evidence | Link evidence |
| **Button: View all** | View all | View all |
| **Badge: Linked** | Linked | Linked |
| **Button: Link** | Link | Link |
| **Empty state (if no unlinked)** | — | See [EMPTY_STATES.md](./EMPTY_STATES.md#overview). |

---

### 3.2 Inbox

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Page title** | Inbox | Inbox |
| **Description** | Manage email threads and link evidence to records. | Manage correspondence and link evidence to transactions, contacts, and assets. |
| **Button: Sync** | Sync | Sync |
| **Button: Link selected** | Link selected | Link to record |
| **Filter: Status** | Status | Status |
| **Filter: All threads** | All threads | All threads |
| **Filter: Unlinked only** | Unlinked only | Unlinked only |
| **Filter: Linked only** | Linked only | Linked only |
| **Filter: Has Attachments** | Has Attachments | Has Attachments |
| **Filter: Linked Type** | Linked Type | Linked To |
| **Filter: Deals** | Deals | Transactions |
| **Filter: Contacts** | Contacts | Contacts |
| **Filter: Companies** | Companies | Companies |
| **Filter: Properties** | Properties | Assets |
| **Search placeholder** | Search threads... | Search correspondence... |
| **Tab: All** | All | All |
| **Tab: Unlinked** | Unlinked | Unlinked |
| **Tab: Has Attachments** | Has Attachments | Has Attachments |
| **Tab: Unread** | Unread | Unread |
| **Button: Link to record** | Link to record | Link to record |
| **Button: Mark reviewed** | Mark reviewed | Mark reviewed |
| **Button: Add note** | Add note | Add note |
| **Button: Clear all filters** | Clear all filters | Clear all filters |
| **Badge: Unlinked** | Unlinked | Unlinked |
| **Badge: Deal** | Deal | Transaction |
| **Badge: Contact** | Contact | Contact |
| **Badge: Company** | Company | Company |
| **Badge: Property** | Property | Asset |

**Empty / error states:** See [EMPTY_STATES.md](./EMPTY_STATES.md#inbox).

---

### 3.3 Thread Detail

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Back button** | Back to Inbox | Back to Inbox |
| **Button: Reply** | Reply | Reply |
| **Button: Forward** | Forward | Forward |
| **Button: Archive** | Archive | Archive |
| **Badge: Unlinked** | Unlinked | Unlinked |
| **Label: attachments** | X attachments | X attachments |
| **Label: messages** | X messages | X messages |
| **Panel: Suggested Links** | Suggested Links | Suggested Links |
| **Panel description** | AI-detected records that may be related to this thread. | AI-detected records that may be related to this correspondence. |
| **Button: Link to record** | Link to record | Link to record |
| **Button: Link to other record** | Link to other record | Link to other record |
| **Badge: Linked** | Linked | Linked |
| **Section: Audit Trail** | Audit Trail | Audit Trail |
| **Audit: Thread ID** | Thread ID | Thread ID |
| **Audit: Ingested** | Ingested | Ingested |
| **Audit: Source** | Source | Source |
| **Audit: Status** | Status | Status |

---

### 3.4 Records

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Page title** | Records | Records |
| **Description** | Manage contacts, companies, properties, and deals. | Manage contacts, companies, assets, and transactions. |
| **Tab: Contacts** | Contacts | Contacts |
| **Tab: Companies** | Companies | Companies |
| **Tab: Properties** | Properties | Assets |
| **Tab: Deals** | Deals | Transactions |
| **Button: Quick link** | Quick link | Quick link |
| **Button: Create record** | Create record | Create record |
| **Button: Filters** | Filters | Filters |
| **Search placeholder** | Search {tab}... | Search {tab}... |
| **Column: Company** | Company | Company |
| **Column: Last Activity** | Last Activity | Last Activity |
| **Column: Open Items** | Open Items | Open Items |
| **Column: Owner** | Owner | Owner |
| **Column: Status** | Status | Status |
| **Column: Deals** | Deals | Transactions |
| **Coming soon (Properties)** | Properties view coming soon | Assets view coming soon |
| **Coming soon (Deals)** | Deals view coming soon | Transactions view coming soon |

**Empty states (Records — per tab):** See [EMPTY_STATES.md](./EMPTY_STATES.md#records).

---

### 3.5 Deals (Transactions View)

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Subnav label** | Deals | Transactions |
| **Page context** | Records with defaultTab deals | Records with defaultTab transactions |

---

### 3.6 Deal Workspace (Transaction Workspace)

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Back button** | Back to Deals | Back to Transactions |
| **Button: Edit** | Edit | Edit |
| **Label: probability** | X% probability | X% probability |
| **Label: Deal Owner** | Deal Owner | Transaction Lead |
| **Field: Company** | Company | Company / Tenant |
| **Field: Primary Contact** | Primary Contact | Primary Contact |
| **Field: Created** | Created | Created |
| **Field: Expected Close** | Expected Close | Expected Close / Lease Commencement |
| **Field: Description** | Description | Description |
| **Section: Evidence Checklist** | Evidence Checklist | Evidence Checklist |
| **Checklist subtitle** | X of Y items completed | X of Y items completed |
| **Button: Link** | Link | Link |
| **Section: Activity Timeline** | Activity Timeline | Activity Timeline |
| **Button: View full ledger** | View full ledger | View full ledger |
| **Section: Documents** | Documents | Documents |
| **Button: Add** | Add | Add |
| **Section: Contacts** | Contacts | Contacts |
| **Section: Email Threads** | Email Threads | Correspondence |
| **Button: View linked threads** | View linked threads | View linked correspondence |
| **Badge: Primary** | Primary | Primary |

**Evidence checklist items (CRE defaults):** See [CRE_DEAL_STAGE_DEFAULTS.md](./CRE_DEAL_STAGE_DEFAULTS.md) for stage-specific evidence templates.

---

### 3.7 Documents

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Page title** | Documents | Documents |
| **Description** | Attachment library with full provenance tracking. | Document library with full provenance tracking. |
| **Button: Upload** | Upload | Upload |
| **Search placeholder** | Search documents... | Search documents... |
| **Filter: Type** | Type | Type |
| **Filter: Source** | Source | Source |
| **Column: Name** | Name | Name |
| **Column: Source** | Source | Source |
| **Column: Linked To** | Linked To | Linked To |
| **Column: Uploaded By** | Uploaded By | Uploaded By |
| **Column: Date** | Date | Date |
| **Badge: Linked** | Linked | Linked |
| **Badge: Unlinked** | Unlinked | Unlinked |
| **Panel: Document Details** | Document Details | Document Details |
| **Field: File Name** | File Name | File Name |
| **Field: Type** | Type | Type |
| **Field: Size** | Size | Size |
| **Field: Linked Record** | Linked Record | Linked Record |
| **Field: Uploaded** | Uploaded | Uploaded |
| **Button: Link to record** | Link to record | Link to record |
| **Button: Download** | Download | Download |
| **Button: Open preview** | Open preview | Open preview |

**Empty / error states:** See [EMPTY_STATES.md](./EMPTY_STATES.md#documents).

---

### 3.8 Activity Ledger

| Element | Generic Copy | CRE Copy |
|--------|--------------|----------|
| **Page title** | Activity Ledger | Activity Ledger |
| **Description** | Immutable record of all system events, transactions, and changes. | Immutable record of all system events, transactions, and changes. |
| **Button: Export** | Export | Export |
| **Search placeholder** | Search events, IDs, or references... | Search events, IDs, or references... |
| **Filter: Event Type** | Event Type | Event Type |
| **Filter: Documents** | Documents | Documents |
| **Filter: Emails** | Emails | Emails |
| **Filter: Deals** | Deals | Transactions |
| **Filter: Links** | Links | Links |
| **Filter: System** | System | System |
| **Column: Event ID** | Event ID | Event ID |
| **Column: Type** | Type | Type |
| **Column: Event** | Event | Event |
| **Column: Actor** | Actor | Actor |
| **Column: Timestamp** | Timestamp | Timestamp |
| **Column: References** | References | References |
| **Drawer: Event Details** | Event Details | Event Details |
| **Badge: Committed** | Committed | Committed |
| **Section: Structured Data** | Structured Data | Structured Data |
| **Section: References** | References | References |
| **Section: Technical Details** | Technical Details | Technical Details |

**Empty / error states:** See [EMPTY_STATES.md](./EMPTY_STATES.md#activity-ledger).

---

## 4. CRE Terminology Reference

| Generic | CRE Alternative | Usage |
|---------|-----------------|-------|
| Deal | Transaction | Primary label for lease/sale deals |
| Property | Asset | When referring to CRE properties |
| Thread | Correspondence | Email threads in CRE context |
| Evidence | Evidence | Same (industry term) |
| Documents | Documents | Same |
| Deal Owner | Transaction Lead | Person responsible for the deal |
| Expected Close | Expected Close / Lease Commencement | Depends on deal type |
| Companies | Companies | Tenant, landlord, or broker entities |

---

## 5. Implementation Notes

- **Configurable:** Labels may be overridden per org/package via configuration.
- **Consistency:** Use "Transaction" consistently when "Deal" appears in user-facing copy for CRE package.
- **Assets vs Properties:** "Assets" is preferred for CRE to distinguish from residential "Properties."
- **Correspondence:** Use for email threads in CRE context to sound more professional.

---

## 6. References

- [REIL_SUBNAV_SPEC.md](./REIL_SUBNAV_SPEC.md)
- [REIL_ROUTE_STRUCTURE.md](./REIL_ROUTE_STRUCTURE.md)
- [CRE_DEAL_STAGE_DEFAULTS.md](./CRE_DEAL_STAGE_DEFAULTS.md)
