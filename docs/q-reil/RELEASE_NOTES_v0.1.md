# Release notes — Q REIL v0.1

**Product:** Q REIL (Real Estate Interface Ledger)  
**Version:** v0.1  
**Status:** In progress — release when [PRD_Q_REIL_v0.1](PRD_Q_REIL_v0.1.md) §10 Definition of Done is fully satisfied.

---

## PRD governance

v0.1 scope and completion are defined by:

- **[PRD_Q_REIL_v0.1](PRD_Q_REIL_v0.1.md)** — **LOCKED**
  - **§6 MVP Scope:** In-scope (Gmail OAuth, ingestion, ledger, record types, linking, Inbox UI, record timeline, connector health) vs out-of-scope (sending email, docs, CRM, MLS/SkySlope/Yardi, bulk import, mobile).
  - **§10 Definition of Done:** v0.1 is complete only when all seven criteria are true:
    1. Gmail OAuth works end to end
    2. Initial 7-day ingestion completes successfully
    3. Threads, messages, and attachments persist correctly
    4. Ledger events written for ingestion and linking
    5. Inbox UI displays real data from the database
    6. Manual attach links an email to a record
    7. Re-running ingestion produces zero duplicates

Release notes for v0.1 will be updated as each §10 criterion is met. Final release when all seven are true.

---

## v0.1 release notes (draft)

*To be filled as DoD criteria are completed.*

### Delivered

- *(Add items as §10 criteria are satisfied.)*

### Known limitations

- Per PRD §6: no sending email, no document editing, no MLS/SkySlope/Yardi, no mobile app.

### Upgrade / migration

- N/A (initial release).

---

**Anchor:** Q REIL v0.1 is complete when real Gmail data flows into a ledger and appears as a trustworthy timeline in the UI. Everything else waits. — PRD final statement.
