# Mission 0015 — Prod Deploy

**Mission ID:** REIL-CORE-0015  
**Title:** Prod Deploy  
**Owner:** Release Ops (RELOPS)

---

## Inputs

- Missions 0001–0014 complete; all QA proofs and engineering receipts signed.
- Production environment: Supabase project, Vercel (or designated host), env configured (no secrets in mission docs).
- Release gates: `docs/06_QA/release-gates.md`.

---

## Acceptance criteria

- [ ] REIL Core is deployed to production: DB migrations applied, connector/config available, UI deployed.
- [ ] Production deployment is documented: deployment id, commit SHA, timestamp, and status (e.g. READY).
- [ ] Post-deploy smoke: critical paths (e.g. health, inbox load, records load) pass in prod.
- [ ] No secrets in deployment receipt or docs; only deployment metadata and public URLs.

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Prod deploy receipt | `proofs/reil-core/RELOPS-REIL-CORE-PROD-DEPLOY-0017.md` |
| Release gates (reference) | `docs/06_QA/release-gates.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0017 | REIL Core prod deploy | `proofs/reil-core/RELOPS-REIL-CORE-PROD-DEPLOY-0017.md` |

---

## Notes

- Proof pack ID 0017 matches existing closeout numbering. No secrets in any deliverable or proof.
