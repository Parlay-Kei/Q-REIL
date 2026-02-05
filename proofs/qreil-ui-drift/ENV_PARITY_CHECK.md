# Env parity check — Q REIL UI vs Vercel

**Mission:** PLATOPS-MISSION: QREIL-VERCEL-ALIGN-0002  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Scope:** Only env vars actually used by the UI (q-suite-ui).

---

## Source of truth (code)

Env usage in **q-suite-ui**:

| File | Variable | Purpose |
|------|----------|---------|
| `src/lib/supabase.ts` | `VITE_SUPABASE_URL` | Supabase project URL |
| `src/lib/supabase.ts` | `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `src/constants/inbox.ts` | `VITE_USE_INBOX_SEED_DATA` | Optional: `"true"` = use seed data instead of Supabase (dev fallback) |

Reference: **q-suite-ui/.env.example**.

---

## Required in Vercel (production)

| Variable | Used by | Notes |
|----------|---------|--------|
| **VITE_SUPABASE_URL** | Supabase client | Required for Inbox/Thread DB mode. Set to project URL (e.g. `https://xxx.supabase.co`). |
| **VITE_SUPABASE_ANON_KEY** | Supabase client | Required. Use project anon/public key (safe for client). |

If either is missing or empty, `supabase` in `src/lib/supabase.ts` is `null` and Inbox/thread features that depend on Supabase will not work.

---

## Optional in Vercel

| Variable | Used by | Notes |
|----------|---------|--------|
| **VITE_USE_INBOX_SEED_DATA** | `constants/inbox.ts` | Set to `"true"` to use seed data instead of Supabase. For dev/local fallback only; typically **omit** or `"false"` in production so UI uses Supabase. |

---

## Parity checklist

- [ ] **VITE_SUPABASE_URL** exists in Vercel (Project **q-reil** → Settings → Environment Variables), value = Supabase project URL.
- [ ] **VITE_SUPABASE_ANON_KEY** exists in Vercel, value = Supabase anon key.
- [ ] **VITE_USE_INBOX_SEED_DATA** — omit in production, or set to `false`, unless intentionally using seed data.

No other env vars are read by the q-suite-ui app (only `import.meta.env.VITE_*` as above).
