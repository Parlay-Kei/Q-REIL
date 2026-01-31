# PRD — Q REIL v0.1

**Product:** Q REIL (Real Estate Interface Ledger)  
**Suite:** Q by Strata Noble  
**Repo:** q-reil  
**Status:** Active  
**Version:** v0.1  
**Owner:** Strata Noble  
**Primary Stakeholder:** Ashley (Commercial, Residential, Property Management)

---

## 1. Purpose

Q REIL exists to make real estate operations legible, auditable, and shared by unifying email, documents, and records into a single operational timeline.

The product solves fragmentation between inboxes, transaction systems, and document flows without replacing them.

---

## 2. Problem Statement

Real estate work is scattered across:

- Gmail threads
- E-sign envelopes
- Transaction platforms (e.g., SkySlope)
- File systems and CRMs that do not reflect actual work

This fragmentation causes:

- Lost context
- Duplicated effort
- Manual reconciliation
- No reliable operational memory

Existing tools track state, not history.

---

## 3. Product Definition

Q REIL is an **interface ledger**.

It sits above existing systems and:

- Ingests operational signals (starting with Gmail)
- Links those signals to real records
- Records every meaningful action as an immutable event
- Presents a single, chronological timeline per record

Q REIL is not a replacement system. It is a coordination layer.

---

## 4. Target Users

**Primary**

- Real estate operators managing inbox, documents, and transactions daily

**Secondary**

- Team leads and admins needing visibility and accountability
- Owners needing auditability and continuity

**Supported workflows**

- Commercial
- Residential
- Property management

The same primitives support all three.

---

## 5. What Q REIL Is Not

Explicit non-goals for v0.1:

- Not a SkySlope replacement
- Not a general-purpose CRM
- Not an email client
- Not a document editor
- Not a marketing or lead-gen tool

If a feature does not support visibility, traceability, or continuity, it is out of scope.

---

## 6. MVP Scope (v0.1)

**In scope**

- Gmail OAuth connection (read-only)
- Ingestion of Gmail threads, messages, and attachments
- Storage of metadata and attachment references
- Append-only ledger of system and user actions
- Core record types:
  - Contact
  - Company
  - Property
  - Deal (generic transaction container)
- Linking:
  - Auto-link when unambiguous
  - Manual attach from UI
- Inbox UI showing real ingested data
- Record view showing full operational timeline
- Connector health and sync status

**Out of scope**

- Sending email
- Editing documents
- Advanced CRM features
- MLS, SkySlope, Yardi integrations (future)
- Bulk import beyond Gmail
- Mobile app

---

## 7. Canonical User Flows (v0.1)

**Flow 1: Connect Gmail**

- User connects Gmail account
- System stores tokens securely
- Initial sync runs
- Ledger records connection and sync events

**Flow 2: Review Inbox**

- User views threads in Q REIL Inbox
- System indicates linked vs unlinked threads
- User opens thread to see messages and attachments

**Flow 3: Link to Record**

- System auto-links when confident
- User manually attaches thread or message to a record
- Ledger records attach action

**Flow 4: View Record Timeline**

- User opens a Contact, Property, or Deal
- Timeline shows:
  - Linked emails
  - Documents
  - System and user actions
- Timeline is reconstructed from ledger events

---

## 8. Ledger Principle (Non-Negotiable)

Q REIL is governed by an **append-only ledger**.

**Rules:**

- Every meaningful action emits a ledger event
- Ledger events are immutable
- Ledger payloads contain references, not sensitive content
- Ledger is the source of truth for timelines

**If an action is not in the ledger, it did not happen.**

---

## 9. Data Handling and Security Constraints

- No raw email bodies in logs
- No raw email bodies in ledger payloads
- Tokens encrypted at rest
- Least-privilege OAuth scopes
- Org-level isolation enforced
- Record-level access enforced
- All connector actions auditable

These are requirements, not preferences.

---

## 10. Success Criteria (Definition of Done)

Q REIL v0.1 is considered complete only when **all seven** are true:

1. Gmail OAuth works end to end
2. Initial 7-day ingestion completes successfully
3. Threads, messages, and attachments persist correctly
4. Ledger events are written in code for ingestion and linking
5. Inbox UI displays real data from the database
6. Manual attach links an email to a record
7. Re-running ingestion produces zero duplicates

Failure of any one means the spine is incomplete.

---

## 11. Explicit Dependencies

- Google Cloud project and OAuth credentials (OPS-901)
- Secure secret storage
- Stable database and object storage
- Job runner for ingestion

No parallel feature work until these are satisfied.

---

## 12. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| OAuth misconfiguration | Proof-based acceptance for OPS-901 |
| Duplicate ingestion | Strict idempotency rules |
| Scope creep | This PRD is binding |
| UI polish before data | Blocked by process |
| Data sensitivity | Ledger and logging constraints |

---

## 13. Post-MVP Expansion (Not v0.1)

Explicitly deferred:

- SkySlope connector
- MLS / AIR CRE
- Property management systems
- Task management
- Analytics and reporting
- Mobile experience

These require a proven spine first.

---

## 14. Governance Rule

This PRD governs start and finish for Q REIL v0.1.

Changes require:

- Explicit version bump
- Documented rationale
- Stakeholder acknowledgment
- No silent scope changes.

---

## Final Anchor Statement

**Q REIL v0.1 is complete when real Gmail data flows into a ledger and appears as a trustworthy timeline in the UI.**

Everything else waits.
