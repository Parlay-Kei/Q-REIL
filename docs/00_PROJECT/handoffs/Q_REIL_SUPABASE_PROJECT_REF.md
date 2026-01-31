# Q REIL Supabase project — ref and env

**Project ref:** `umzuncubiizoomoxlgts`  
**Project name:** q-reil  
**Region:** us-east-1  
**Status:** ACTIVE_HEALTHY (as of 2026-01-31)

---

## Applied via API (2026-01-31)

- **00001_create_orgs.sql** — OK  
- **00002_create_users.sql** — OK  
- **00003_create_user_roles.sql** — OK  

(Migration 00004 and later create objects in `auth` schema; Management API database/query does not have permission. Apply those via **Dashboard SQL Editor** or **psql** with the project’s database connection string.)

---

## App env (`q-reil/.env` or `q-reil/.env.local`)

After copying keys from [Supabase Dashboard](https://supabase.com/dashboard) → project **q-reil** → Settings → API & Database:

```
NEXT_PUBLIC_SUPABASE_URL=https://umzuncubiizoomoxlgts.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Dashboard>
```

Plus for AUTH-101 and BE-301: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `OAUTH_TOKEN_ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`.

---

## Remaining setup

1. **Migrations 00004 → 00032** — Either:
   - **Node (no psql):** Get DB connection string from Dashboard → Settings → Database. Set `SUPABASE_DB_URL`, then run `cd scripts/supabase-apply-migrations && npm install && node run-with-pg.mjs`. See [scripts/supabase-apply-migrations/README.md](../../scripts/supabase-apply-migrations/README.md).
   - **Dashboard:** SQL Editor → run each file in `docs/02_DATA/migrations/` in order (00004 through 00032).
   - **psql:** Set `SUPABASE_DB_URL` and run `./scripts/supabase-apply-migrations/apply.sh`.
2. **Connection string format:** `postgresql://postgres.umzuncubiizoomoxlgts:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres` (get or reset password in Dashboard).
3. **Storage bucket** — Created via script: `cd scripts/supabase-apply-migrations && node create-bucket.mjs` (uses token from `c:\Dev\Direct-Cuts\.env.local`). Or manually: Dashboard → Storage → New bucket → name: `mail-attachments`, private.
