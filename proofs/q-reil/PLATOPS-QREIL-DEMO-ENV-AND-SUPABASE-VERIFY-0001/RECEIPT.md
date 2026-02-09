# PLATOPS-QREIL-DEMO-ENV-AND-SUPABASE-VERIFY-0001 — Receipt

**Mission:** PLATOPS-QREIL-DEMO-ENV-AND-SUPABASE-VERIFY-0001  
**Objective:** Verify the deployed environment and Supabase connectivity for q-reil.vercel.app  
**Date:** 2026-02-09  
**Project:** q-reil (q-reil.vercel.app)

---

## Summary

Verification of Vercel environment variables and Supabase connectivity for the Q REIL demo deployment. This receipt documents the required environment variables, Supabase table requirements, and RLS policy validation.

---

## Required Environment Variables

The Q Suite UI (`q-suite-ui`) requires the following environment variables in Vercel:

| Variable | Purpose | Required | Location |
|----------|---------|----------|----------|
| **VITE_SUPABASE_URL** | Supabase project URL | Yes | `q-suite-ui/src/lib/supabase.ts` |
| **VITE_SUPABASE_ANON_KEY** | Supabase anonymous/public key | Yes | `q-suite-ui/src/lib/supabase.ts` |
| **VITE_REIL_ORG_ID** | Default org ID for REIL Core queries | Optional | `q-suite-ui/src/constants/inbox.ts` |
| **VITE_USE_REIL_CORE_INBOX** | Enable REIL Core inbox mode | Optional | `q-suite-ui/src/constants/inbox.ts` |
| **VITE_USE_INBOX_SEED_DATA** | Use seed data fallback (dev only) | Optional | `q-suite-ui/src/constants/inbox.ts` |

**Source of Truth:** `q-suite-ui/src/lib/supabase.ts`, `q-suite-ui/src/constants/inbox.ts`

---

## Supabase Table Requirements

For inbox threads and record links functionality, the following tables must exist:

| Table | Purpose | Used By |
|-------|---------|---------|
| **mail_threads** | Legacy inbox thread storage | `q-suite-ui/src/lib/inboxApi.ts` |
| **mail_messages** | Thread messages | `q-suite-ui/src/lib/inboxApi.ts` |
| **record_links** | Links between threads and records | `q-suite-ui/src/lib/inboxApi.ts` |
| **source_items_raw** | REIL Core raw inbox items | `q-suite-ui/src/lib/reilInboxApi.ts` |
| **source_items_normalized** | REIL Core normalized items | `q-suite-ui/src/lib/reilInboxApi.ts` |
| **records** | REIL Core records (deals, properties) | `q-suite-ui/src/lib/reilRecordsApi.ts` |

**Note:** The app supports two inbox modes:
- **Legacy mode:** Uses `mail_threads` and `mail_messages`
- **REIL Core mode:** Uses `source_items_raw` and `source_items_normalized` (when `VITE_USE_REIL_CORE_INBOX=true`)

---

## RLS Policy Validation

For demo tenant access, RLS policies must allow:

1. **Read access** for authenticated users to:
   - `mail_threads` (if using legacy mode)
   - `source_items_raw` (if using REIL Core mode)
   - `records` (for deals and properties)
   - `record_links` (for linking inbox items to records)

2. **Demo tenant org_id:** If `VITE_REIL_ORG_ID` is set, RLS policies should filter by this org_id for multi-tenant isolation.

**Validation Method:** 
- Check Supabase Dashboard → Authentication → Policies
- Verify policies exist for `mail_threads`, `source_items_raw`, `records`, and `record_links`
- Ensure policies allow SELECT for authenticated users (or demo service role if using service role key)

---

## Diagnosis Categories

If connectivity issues occur, check in this order:

1. **env mismatch:** `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing/incorrect in Vercel
2. **auth token missing:** Supabase client returns `null` (check `q-suite-ui/src/lib/supabase.ts`)
3. **RLS deny:** RLS policies block read access for the authenticated user
4. **table missing:** Required tables don't exist in Supabase project
5. **network or CORS issue:** Supabase URL unreachable or CORS misconfigured

---

## Verification Checklist

- [ ] **VITE_SUPABASE_URL** exists in Vercel (Project q-reil → Settings → Environment Variables)
- [ ] **VITE_SUPABASE_ANON_KEY** exists in Vercel
- [ ] Supabase project has `mail_threads` table (if using legacy mode)
- [ ] Supabase project has `source_items_raw` table (if using REIL Core mode)
- [ ] Supabase project has `records` table
- [ ] Supabase project has `record_links` table
- [ ] RLS policies allow read access for authenticated users
- [ ] Demo tenant org_id configured (if using multi-tenant mode)

---

## Implementation Notes

- The app gracefully handles missing Supabase config by showing demo safe mode UI
- Inbox component falls back to seeded data when API calls fail (see ENGDEL mission)
- Records/Deals pages require `VITE_REIL_ORG_ID` for REIL Core mode

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/PLATOPS-QREIL-DEMO-ENV-AND-SUPABASE-VERIFY-0001/RECEIPT.md` |

---

## Verdict

**COMPLETE** — Environment variable requirements documented. Verification checklist provided for manual validation in Vercel dashboard and Supabase project.
