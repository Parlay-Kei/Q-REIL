# Mission 0011 — Inbox UI

**Mission ID:** REIL-CORE-0011  
**Title:** Inbox UI  
**Owner:** Engineering Delivery (ENGDEL)

---

## Inputs

- Mission 0006 (Ingestion Smoke) and 0008 (Normalize Match QA) complete; data in REIL.
- UI spec: `docs/03_UI/inbox-ui-spec.md`, `docs/03_UI/inbox-ux-spec.md`, `docs/05_INBOX/INBOX_MVP_PLAN.md`.
- Q-Suite UI app: `q-suite-ui/` (or canonical UI repo per project).

---

## Acceptance criteria

- [ ] Inbox screen lists ingested threads or messages (source: `source_items_raw` or normalized view) with key fields (from, subject, date, snippet).
- [ ] Thread/message detail view shows headers, body (sanitized), and attachment list with links to documents.
- [ ] User can attach an item to a record (link to `reil_records`) per UX spec; action writes ledger event.
- [ ] UI respects RLS / tenant isolation; no data from other orgs.
- [ ] No secrets in frontend code or config; env vars for API URL only.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Inbox page | `q-suite-ui/src/pages/Inbox.tsx` |
| Thread detail | `q-suite-ui/src/pages/ThreadDetail.tsx` |
| Item detail (if separate) | `q-suite-ui/src/pages/ItemDetail.tsx` |
| Inbox UI spec (reference) | `docs/03_UI/inbox-ui-spec.md`, `docs/05_INBOX/INBOX_MVP_PLAN.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0012 | Inbox UI receipt | `proofs/reil-core/ENGDEL-REIL-INBOX-UI-0012-receipt.md` |

---

## Notes

- No secrets in any deliverable or proof.
