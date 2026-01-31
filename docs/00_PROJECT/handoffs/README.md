# Handoffs — Q REIL

**Location:** `docs/00_PROJECT/handoffs/`  
**Rule:** All handoff documents go here. Naming: `[YYYY-MM-DD]_[TASK-ID]_[from]_to_[to-agent].md` (see [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)).

---

## OCS execution and tokens

- **Execution report (2026-01-30):** [OCS_EXECUTION_REPORT_2026-01-30.md](OCS_EXECUTION_REPORT_2026-01-30.md) — scan results, Supabase MCP invocation status, next steps and blockers.
- **Tokens/config for automation:** [TOKENS_AND_CONFIG_REFERENCE.md](TOKENS_AND_CONFIG_REFERENCE.md) — where to set SUPABASE_ACCESS_TOKEN, app env, and DB URL for zero-user-intervention.
- **Q REIL Supabase project:** [Q_REIL_SUPABASE_PROJECT_REF.md](Q_REIL_SUPABASE_PROJECT_REF.md) — project ref `umzuncubiizoomoxlgts`, migrations 00001–00003 applied; remaining steps (00004–00032, bucket, env).

---

## OCS: Manual task invocations (2026-01-30)

Agents capable of handling remaining **Manual** tasks were invoked via handoffs:

| Handoff | To | Task | Status |
|---------|----|------|--------|
| [2026-01-30_OCS_to_supabase-admin_CREATE_SUPABASE_PROJECT.md](2026-01-30_OCS_to_supabase-admin_CREATE_SUPABASE_PROJECT.md) | **supabase-admin** | **Create and configure Supabase project** (project + migrations + bucket `mail-attachments`) | **Pending** |
| [2026-01-30_MANUAL_OCS_to_github-admin.md](2026-01-30_MANUAL_OCS_to_github-admin.md) | github-admin | Connect Vercel to Git (single Manual step from repo setup) | Pending |
| [2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md](2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md) | infra-deployment-specialist | Execute OPS-901 runbook (GCP + Vercel + 5-point proof) | Pending |
| [2026-01-30_BE-301_OCS_to_supabase-admin.md](2026-01-30_BE-301_OCS_to_supabase-admin.md) | supabase-admin | BE-301: Create Storage bucket `mail-attachments`, apply migration 00032 (skip if project created via handoff above) | Pending |
| [2026-01-30_BE-301_OCS_to_backend-qa-automation-tester.md](2026-01-30_BE-301_OCS_to_backend-qa-automation-tester.md) | backend-qa-automation-tester | BE-301: Verify 7-day backfill and idempotency per receipts | Pending |

---

## Receipts and runbooks

- **OPS-901 proof pack + runbook:** [docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md](../../q-reil/receipts/OPS-901_OAUTH_PROOF.md)
- **OPS-901 redirect URIs:** [docs/q-reil/receipts/OPS-901_REDIRECT_URIS.md](../../q-reil/receipts/OPS-901_REDIRECT_URIS.md)
- **OPS-901 secret store:** [docs/q-reil/receipts/OPS-901_SECRET_STORE_REFERENCE.md](../../q-reil/receipts/OPS-901_SECRET_STORE_REFERENCE.md)
- **Mission receipts index:** [docs/q-reil/RECEIPTS.md](../../q-reil/RECEIPTS.md)
