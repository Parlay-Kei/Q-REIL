# Q REIL — Empty States and Error Copy

**Mission:** PRODOPS-REIL-CRE-COPY-0012  
**Owner:** Product Ops  
**Date:** 2026-01-30  
**Scope:** Empty-state and error-state copy for Q REIL, aligned to the ledger-driven workflow (ingest, link, timeline, audit).

---

## 1. Overview

This document defines the empty-state and error-state copy used across Q REIL. Language reinforces the package name **Q REIL** and the four workflow phases: **ingest** (bring data in), **link** (connect evidence to records), **timeline** (chronological view), **audit** (immutable record).

All copy uses CRE terminology (correspondence, transactions, assets, evidence) per [CRE_LABELS_AND_COPY.md](./CRE_LABELS_AND_COPY.md).

---

## 2. Empty States by Screen

### Overview

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No unlinked correspondence | No unlinked correspondence | All correspondence is linked to transactions or contacts. Ingest more or link from Inbox to add to your timeline. | Link evidence |
| No recent activity | No recent activity | Ingest correspondence and link evidence to see activity here. | View Ledger |

---

### Inbox

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No threads match filters | No correspondence found | No email threads match your current filters. Try adjusting your search or filters, or run a sync to ingest new mail. | Clear filters |
| Inbox not yet synced (optional) | No mail ingested yet | Connect your mailbox and sync to ingest correspondence into Q REIL. Once ingested, you can link threads to transactions and contacts. | Connect mailbox |

**Error state (Inbox):**

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| Failed to load inbox | Failed to load inbox | We couldn't connect to your email provider. Please check your connection and try again. | Retry |

---

### Thread Detail

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No suggested links | No suggested links | We don't have suggested records for this thread. You can link to a transaction, contact, or asset manually. | Link to record |

---

### Records

Empty states are per tab. Language supports **link** (connect evidence) and **audit** (records are part of the ledger).

| Tab | Title | Description | Action (if any) |
|-----|--------|-------------|------------------|
| **Contacts** | No contacts yet | Create your first contact to start building your CRE network. Link correspondence and documents to contacts from Inbox or Documents. | Create contact |
| **Companies** | No companies yet | Add tenant or landlord entities to track relationships. Link evidence to companies from Inbox or transaction workspaces. | Create company |
| **Assets** | No assets yet | Add properties to track leases and transactions. Documents and correspondence can be linked to assets for a full audit trail. | Add asset |
| **Transactions** | No transactions yet | Create a transaction to start tracking LOIs, leases, or sales. Ingest and link evidence to build your timeline and audit trail. | Create transaction |
| No results (filtered) | No records match | No records match your current filters. Try adjusting your search or filters. | Clear filters |

---

### Deal Workspace (Transaction Workspace)

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No evidence linked | No evidence linked yet | Link correspondence or documents to this transaction to build your evidence checklist and timeline. | Link evidence |
| No activity in timeline | No activity yet | Link evidence or add documents to see activity here. Every link is recorded in the ledger. | View full ledger |
| No documents | No documents | Upload or link documents to this transaction. | Add document |
| No linked threads | No linked correspondence | Link email threads from Inbox to attach them to this transaction. | View Inbox |

---

### Documents

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No documents (empty library) | No documents yet | Upload or ingest documents (e.g. from email) to add them to Q REIL. Link documents to transactions and contacts for a full audit trail. | Upload document |
| No results (filtered) | No documents found | No documents match your current filters. Try adjusting your search or upload a new document. | Clear filters / Upload document |

**Error state (Documents):**

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| Failed to load documents | Failed to load documents | We couldn't retrieve your documents. Please check your connection and try again. | Retry |

---

### Activity Ledger

Language here directly supports **timeline** and **audit**: the ledger is the immutable record of ingest, link, and other events.

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| No events (filtered) | No events found | No ledger events match your current filters. Try adjusting your search or event type. Events appear here after you ingest, link, and take actions in Q REIL. | Clear filters |
| No events (new org) | No activity yet | Once you ingest correspondence and link evidence to records, events will appear here. This timeline is your audit trail. | Go to Inbox / Go to Overview |

**Error state (Ledger):**

| Context | Title | Description | Action (if any) |
|--------|--------|-------------|------------------|
| Failed to load ledger | Failed to load ledger | We couldn't retrieve the activity ledger. Please check your connection and try again. | Retry |

---

## 3. Workflow Phase Mapping

Empty-state copy is written so each phase is recognizable:

| Phase | How it appears in empty/error copy |
|-------|------------------------------------|
| **Ingest** | "Ingest," "sync," "connect your mailbox," "upload," "no mail ingested yet" |
| **Link** | "Link evidence," "link to record," "link correspondence," "no evidence linked" |
| **Timeline** | "Activity here," "timeline," "recent activity," "events will appear" |
| **Audit** | "Audit trail," "ledger," "every link is recorded," "immutable record" |

---

## 4. Implementation Notes

- Use the **Title** as the main heading in the empty-state component; **Description** as supporting text; **Action** as the primary button or link label when applicable.
- For error states, pair with an error icon and a **Retry** (or equivalent) action where appropriate.
- Configurable: copy may be overridden per org/package via configuration.
- See [CRE_LABELS_AND_COPY.md](./CRE_LABELS_AND_COPY.md) for full screen labels and CRE terminology.

---

## 5. References

- [CRE_LABELS_AND_COPY.md](./CRE_LABELS_AND_COPY.md) — Labels and CRE copy
- [REIL_SUBNAV_SPEC.md](./REIL_SUBNAV_SPEC.md) — Q REIL subviews
- [LEDGER_EVENT_TYPES.md](./LEDGER_EVENT_TYPES.md) — Ledger event types (ingest, link, sync, etc.)
