# Mission 0013 — E2E UI Smoke

**Mission ID:** REIL-CORE-0013  
**Title:** E2E UI Smoke  
**Owner:** QA Gatekeeper (QAG)

---

## Inputs

- Mission 0011 (Inbox UI) and 0012 (Records UI) complete.
- Deployed or locally run UI; test org with ingested data and at least one record.

---

## Acceptance criteria

- [ ] Inbox route loads; list renders without crash; at least one thread/message visible if data exists.
- [ ] Thread/message detail opens; headers and snippet/body visible; attachments listed.
- [ ] Records route loads; list renders; at least one record visible if data exists.
- [ ] Record detail opens; timeline or linked items visible where implemented.
- [ ] No P0 console errors or security warnings on critical paths.
- [ ] Evidence: screenshot or automated run report; no secrets in proof.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| E2E UI smoke proof | `proofs/reil-core/QAG-REIL-UI-SMOKE-0014.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0014 | UI smoke | `proofs/reil-core/QAG-REIL-UI-SMOKE-0014.md` |

---

## Notes

- No secrets in any deliverable or proof.
