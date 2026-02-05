# Mission 0001 — System Green Gate

**Mission ID:** REIL-CORE-0001  
**Title:** System Green Gate  
**Owner:** Platform Ops (PLATOPS)

---

## Inputs

- Repo and CI available for Q-REIL (branch `main`, GitHub Actions enabled).
- Supabase project provisioned for REIL (no secrets in mission docs).
- Definition of “system green”: lint passes, typecheck passes, migrations apply cleanly, no P0 security findings.

---

## Acceptance criteria

- [ ] Lint (ESLint / project config) passes on `main` and on PRs targeting `main`.
- [ ] Typecheck (TypeScript/JS project config) passes.
- [ ] All REIL-related migrations in `docs/02_DATA/migrations/` apply in order against the target Supabase project without errors.
- [ ] No P0 security findings in the scope of REIL Core (no secrets in repo, no unsafe eval, dependency audit clean for REIL code paths).
- [ ] CI gate workflow exists and is required for merge (branch protection or equivalent).

---

## Deliverables (exact paths)

| Deliverable | Path |
|-------------|------|
| Migration files (reference) | `docs/02_DATA/migrations/` (REIL migrations 00034–00040 and dependencies) |
| CI workflow (lint/typecheck/migrations gate) | `.github/workflows/` (workflow that runs lint, typecheck, optional migration dry-run) |
| Release gates doc (reference) | `docs/06_QA/release-gates.md` |

---

## Proof pack references

| ID | Proof | Location |
|----|-------|----------|
| 0001 | System green gate receipt | `proofs/reil-core/PLATOPS-REIL-SYSTEM-GREEN-0001-receipt.md` (to be created when gate is verified) |

---

## Notes

- No secrets in this file or in any linked proof.
- “System green” is a prerequisite for all downstream REIL Core missions.
