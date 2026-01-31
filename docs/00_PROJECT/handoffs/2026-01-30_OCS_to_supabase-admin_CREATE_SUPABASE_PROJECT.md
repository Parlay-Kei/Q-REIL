# OCS: Create and configure Supabase project — Invoke supabase-admin

**Dispatched:** 2026-01-30  
**From:** OCS (orchestrator)  
**To:** supabase-admin (agent with **Supabase CLI and/or API** capabilities)  
**Type:** Use Supabase CLI, Supabase MCP (API), or Dashboard  
**Context:** No Supabase project exists for Q REIL. This task creates and configures the project so the app (AUTH-101, BE-301) can run.

**PRD alignment:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD), §11 (dependencies: stable database and object storage).

**Agent instruction:** You have Supabase CLI and/or API (MCP) capabilities. Prefer **Option C (Supabase CLI)** to create the project and link it; use **Option B (MCP)** if the Supabase MCP server is authorized with `SUPABASE_ACCESS_TOKEN`. Use **Option A (Dashboard)** only if CLI/MCP are unavailable.

**OCS scan (2026-01-30):** `SUPABASE_ACCESS_TOKEN` was found in **`c:\Dev\Direct-Cuts\.env.local`** (same machine). Use that value to authorize the Supabase MCP or set it in the shell before running Supabase CLI. Org ID for create: `mhaugpcyrrvpbccwksvj` (PGV). CLI `projects create --region us-east-1` may fail with empty region list on some CLI versions; use MCP or Dashboard if so. See [OCS_EXECUTION_REPORT_2026-01-30.md](OCS_EXECUTION_REPORT_2026-01-30.md).

---

## Task

**Create the Q REIL Supabase project** and **configure** it with schema (migrations), RLS, and the `mail-attachments` storage bucket so that:

- Gmail OAuth (AUTH-101) can store mailboxes and tokens.
- Gmail 7-day ingestion (BE-301) can store threads, messages, attachments metadata, and attachment files.

---

## Option C: Supabase CLI (recommended for supabase-admin agent)

If you have the **Supabase CLI** and a **personal access token** ([Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens)):

1. **Login** (or set `SUPABASE_ACCESS_TOKEN`):
   ```bash
   supabase login
   # or: set SUPABASE_ACCESS_TOKEN=<your-token>
   ```

2. **List organizations** and choose one:
   ```bash
   supabase orgs list
   ```
   Note the **org ID** for the next step.

3. **Create project**:
   ```bash
   supabase projects create q-reil --org-id <ORG_ID> --region us-east-1 --db-password <SECURE_PASSWORD>
   ```
   Use a secure database password and store it (e.g. secrets manager). Note the **project ref** from the output.

4. **Link** the repo to the new project (from repo root, e.g. `q-reil/` or project root):
   ```bash
   supabase link --project-ref <PROJECT_REF> -p <DB_PASSWORD>
   ```
   Or set `SUPABASE_DB_PASSWORD` and omit `-p`.

5. **Apply migrations** — repo migrations live in `docs/02_DATA/migrations/`. Either:
   - **A.** Use the script (requires `psql`): get **Database connection URI** from Dashboard → Settings → Database, then:
     ```bash
     SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres" ./scripts/supabase-apply-migrations/apply.sh
     ```
   - **B.** Copy migration files into `supabase/migrations/` with timestamped names (e.g. `20260130000001_create_orgs.sql`) so `supabase db push --linked` applies them. Then run:
     ```bash
     supabase db push --linked
     ```

6. **Create storage bucket** — CLI does not create buckets; use **Dashboard → Storage → New bucket** named `mail-attachments` (private).

7. **Get API keys** for app env:
   ```bash
   supabase projects api-keys --project-ref <PROJECT_REF>
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in app and Vercel.

---

## Option A: Supabase Dashboard (no CLI/MCP)

### 1. Create project

1. Go to [Supabase Dashboard](https://app.supabase.com).
2. **New project** → choose **organization** (or create one).
3. **Project name:** `q-reil` (or `q-reil-dev` for dev).
4. **Database password:** set and store securely (e.g. in a secrets manager).
5. **Region:** choose closest (e.g. `us-east-1`, `eu-west-1`).
6. Create and wait for provisioning (2–5 minutes).

### 2. Get project credentials

- **Settings → API:** copy **Project URL** and **anon public** key.
- **Settings → API:** copy **service_role** key (server-only; never expose to client).
- **Settings → Database:** copy **Connection string** (URI) for migrations if using `psql` or CLI.

Set in app env (and Vercel when ready):

- `NEXT_PUBLIC_SUPABASE_URL` = Project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key  
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key  

### 3. Run migrations in order

**Option A — Script (if you have `psql` and `SUPABASE_DB_URL`):** From repo root run:
`SUPABASE_DB_URL="postgresql://..." ./scripts/supabase-apply-migrations/apply.sh`  
See [scripts/supabase-apply-migrations/README.md](../../scripts/supabase-apply-migrations/README.md).

**Option B — SQL Editor:** In **SQL Editor** (or `psql` / Supabase CLI), run the following migrations **in this order** (from repo `docs/02_DATA/migrations/`):

| Order | File |
|-------|------|
| 1 | `00001_create_orgs.sql` |
| 2 | `00002_create_users.sql` |
| 3 | `00003_create_user_roles.sql` |
| 4 | `00004_create_helper_functions.sql` |
| 5 | `00017_create_events.sql` |
| 6 | `00018_create_event_triggers.sql` |
| 7 | `00019_create_updated_at_triggers.sql` |
| 8 | `00021_enable_rls_org_layer.sql` |
| 9 | `00030_create_mail_tables.sql` |
| 10 | `00031_mail_rls_policies.sql` |
| 11 | `00032_mail_upsert_service_role.sql` |

**Note:** If any migration references objects that don’t exist (e.g. triggers on tables from missing migrations), adjust or add minimal stub migrations only as needed. The repo may not include every migration listed in the docs README; run only the files that **exist** in `docs/02_DATA/migrations/`.

### 4. Create storage bucket

- **Storage → New bucket**
- **Name:** `mail-attachments`
- **Public:** No (private; access via service role or RLS).
- Configure policies so the **service role** can read/write (ingestion writes as service role).

### 5. Document and hand off

- Record **Project URL**, **Project ref** (from URL or Settings), and that **anon** and **service_role** keys are set in env.
- Update [RECEIPTS.md](../../q-reil/RECEIPTS.md) or a “Supabase project” section with: project created, migrations applied, bucket `mail-attachments` created, env vars documented.

---

## Option B: Supabase MCP / API (with valid token)

If the **Supabase MCP** server has **SUPABASE_ACCESS_TOKEN** configured (same token as CLI):

1. **list_organizations** → choose `organization_id`.
2. **get_cost** with `type: "project"`, `organization_id` → note cost.
3. **confirm_cost** with `type: "project"`, `recurrence: "monthly"`, `amount` from get_cost → obtain `confirm_cost_id`.
4. **create_project** with `name: "q-reil"` (or `q-reil-dev`), `region` (e.g. `us-east-1`), `organization_id`, `confirm_cost_id`.
5. **get_project** with the new `project_id` until status is ready.
6. Then run migrations (Option A step 3) via **apply_migration** for each file, or run SQL in Dashboard.
7. Create bucket `mail-attachments` via Dashboard (Storage → New bucket); MCP has no storage bucket creation tool.

---

## Completion checklist

- [ ] Supabase project created (name e.g. `q-reil` or `q-reil-dev`).
- [ ] All existing migrations from `docs/02_DATA/migrations/` applied in order (00001 → 00032).
- [ ] Storage bucket **`mail-attachments`** created and writable by service role.
- [ ] Project URL, anon key, and service_role key documented and set in app env (and Vercel when applicable).
- [ ] RECEIPTS.md or project doc updated with “Supabase project created and configured.”

---

## References

- **Migrations:** [docs/02_DATA/migrations/](../../02_DATA/migrations/)
- **Infrastructure env template:** [docs/00_PROJECT/infrastructure-setup.md](../infrastructure-setup.md)
- **BE-301 bucket + migration:** [2026-01-30_BE-301_OCS_to_supabase-admin.md](2026-01-30_BE-301_OCS_to_supabase-admin.md) (bucket + 00032; if project is created here, 00032 is already in the list above)
- **Naming:** [docs/NAMING_REGISTRY.md](../../NAMING_REGISTRY.md) — Q REIL (human), q-reil (slug)
