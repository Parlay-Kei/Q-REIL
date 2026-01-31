# Tokens and config reference — Zero-user-intervention

**Use:** When an agent (OCS, supabase-admin, backend-qa, etc.) needs to run tasks without prompting the user, these are the tokens and config locations for Q REIL.

---

## Required for Supabase MCP / CLI (supabase-admin)

| Variable | Where to obtain | Where to set |
|----------|------------------|--------------|
| **SUPABASE_ACCESS_TOKEN** | [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens) **or** (C:\Dev scan) **`c:\Dev\Direct-Cuts\.env.local`** (line `SUPABASE_ACCESS_TOKEN=...`) | MCP server env (`SUPABASE_ACCESS_TOKEN`) or CLI env; or `--access-token` when starting Supabase MCP |

Without this, Supabase MCP returns `Unauthorized` and project create/migrations cannot be automated. **OCS scan (2026-01-30):** Token found in `c:\Dev\Direct-Cuts\.env.local`; use that value for MCP or CLI.

---

## Required for app runtime (BE-301, AUTH-101)

All of these go in **`q-reil/.env`** or **`q-reil/.env.local`** (do not commit). Template: **`q-reil/.env.example`**.

| Variable | Purpose |
|----------|---------|
| **NEXT_PUBLIC_SUPABASE_URL** | Supabase project URL (after project created) |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Supabase anon key |
| **SUPABASE_SERVICE_ROLE_KEY** | Server-side RLS bypass (ingestion, admin) |
| **GOOGLE_OAUTH_CLIENT_ID** | Gmail OAuth (OPS-901) |
| **GOOGLE_OAUTH_CLIENT_SECRET** | Gmail OAuth |
| **OAUTH_TOKEN_ENCRYPTION_KEY** | 64-char hex; encrypt mailbox tokens at rest |
| **NEXT_PUBLIC_APP_URL** | App URL (e.g. `http://localhost:3000`) |

---

## Required for migrations (without MCP)

| Variable | Purpose |
|----------|---------|
| **SUPABASE_DB_URL** | Full Postgres URI from Supabase Dashboard → Settings → Database. Used by `scripts/supabase-apply-migrations/apply.sh`. |

Alternatively: use Supabase CLI `supabase link` and `supabase db push` (still needs SUPABASE_ACCESS_TOKEN for `link` if not already linked).

---

## Optional (CI / Vercel / other)

| Variable | Purpose |
|----------|---------|
| **VERCEL_TOKEN** | Vercel API; used in release-gates / deploy automation |
| **SUPABASE_PROJECT_REF** | For MCP/CLI when multiple projects exist |

---

## Scan note (C:\Dev, 2026-01-30)

- **Q-REIL:** No `.env` or `.env.local` in repo; only `q-reil/.env.example`.
- **C:\Dev other projects:** Full scan found **SUPABASE_ACCESS_TOKEN** in **`c:\Dev\Direct-Cuts\.env.local`**. Use that value for Supabase MCP or CLI to create Q-REIL project and run migrations without user intervention. See [OCS_EXECUTION_REPORT_2026-01-30.md](OCS_EXECUTION_REPORT_2026-01-30.md) for full scan and actions taken.
