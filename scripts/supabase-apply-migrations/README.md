# Apply Q REIL migrations to Supabase

Use this after creating the Supabase project (see [OCS handoff to supabase-admin](../../docs/00_PROJECT/handoffs/2026-01-30_OCS_to_supabase-admin_CREATE_SUPABASE_PROJECT.md)).

**Q-REIL project ref:** `umzuncubiizoomoxlgts`. Pooler host: `aws-1-us-east-1.pooler.supabase.com:6543`.

## Option 1: Node + pg (no psql required)

1. Get **Database connection string** from Supabase: **Settings → Database → Connection string (URI)**. Replace `[YOUR-PASSWORD]` with your database password (or reset password in Dashboard if needed).

2. From this directory:
   ```bash
   npm install
   ```
   Then set `SUPABASE_DB_URL` and run:
   ```bash
   # Bash
   export SUPABASE_DB_URL="postgresql://postgres.umzuncubiizoomoxlgts:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
   node run-with-pg.mjs
   ```
   ```powershell
   # PowerShell
   $env:SUPABASE_DB_URL = "postgresql://postgres.umzuncubiizoomoxlgts:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
   node run-with-pg.mjs
   ```

## Option 2: psql (if PostgreSQL client installed)

1. Get your **Database connection string** from Supabase: **Settings → Database → Connection string (URI)**. Replace `[YOUR-PASSWORD]` with your database password.

2. Set it and run:
   ```bash
   export SUPABASE_DB_URL="postgresql://postgres.umzuncubiizoomoxlgts:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
   ./apply.sh
   ```

## Option 3: Supabase Dashboard SQL Editor

1. Open your project → **SQL Editor**.
2. Run each migration file **in this order** (copy contents, paste, Run):
   - `00001_create_orgs.sql`
   - `00002_create_users.sql`
   - `00003_create_user_roles.sql`
   - `00004_create_helper_functions.sql`
   - `00017_create_events.sql`
   - `00018_create_event_triggers.sql`
   - `00019_create_updated_at_triggers.sql`
   - `00021_enable_rls_org_layer.sql`
   - `00030_create_mail_tables.sql`
   - `00031_mail_rls_policies.sql`
   - `00032_mail_upsert_service_role.sql`

All files live in `docs/02_DATA/migrations/`.

## After migrations

- **Storage bucket:** Run `node create-bucket.mjs` from this directory (uses `SUPABASE_ACCESS_TOKEN` from `c:\Dev\Direct-Cuts\.env.local` to create `mail-attachments`). Or create manually in Dashboard → Storage.
- Set app env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
