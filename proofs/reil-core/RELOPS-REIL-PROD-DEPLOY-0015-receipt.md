# RELOPS-REIL-PROD-DEPLOY-0015 Receipt

**Mission:** RELOPS-REIL-PROD-DEPLOY-0015  
**Owner:** RELOPS  
**Target:** Production READY on the correct commit with correct root directory settings. Supabase env variables wired.  
**Deliverable:** proofs/reil-core/RELOPS-REIL-PROD-DEPLOY-0015-receipt.md

---

## Acceptance

- [ ] **Production is READY on intended commit**  
  Verify in Vercel: target=production, state=READY. Capture deployment id and commit SHA. See also [RELOPS-REIL-CORE-PROD-DEPLOY-0017](RELOPS-REIL-CORE-PROD-DEPLOY-0017.md) for current production deployment snapshot.

- [ ] **Inbox and Records work on seeded data in prod**  
  With `VITE_USE_REIL_CORE_INBOX=true` and `VITE_REIL_ORG_ID` set in Vercel env, open prod URL → Inbox loads from DB; open item → Link to record; Records → open record → timeline shows ledger (including record_linked). Seeded data: run `docs/02_DATA/seeds/reil_core_seed.sql` against prod Supabase if not already applied.

- [ ] **No build errors**  
  `npm run build` in q-suite-ui succeeds. Vercel build log shows no errors.

- [ ] **Supabase env variables wired**  
  In Vercel project settings, env for production: `VITE_REIL_ORG_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and any server-side Supabase keys if used). Root directory for the project must be set to the directory containing the app (e.g. `q-suite-ui` if repo root is repo root).

---

## Truth check (RELOPS)

This is the moment we stop trusting feelings and trust production reality in Supabase and Vercel.

| Check | Action |
|-------|--------|
| Intended commit | Confirm Vercel production deployment points at the intended branch/commit. |
| Root directory | Vercel project: Root Directory = `q-suite-ui` (or correct path). |
| Build | Trigger deploy or inspect latest build log; no errors. |
| Env | Vercel → Settings → Environment Variables: production has `VITE_REIL_ORG_ID`, Supabase URL/anon key. |
| Inbox/Records | Manual smoke on prod URL with seeded org; Inbox list, item detail, Link to record, Record detail timeline. |

---

## Deliverable

**Receipt:** proofs/reil-core/RELOPS-REIL-PROD-DEPLOY-0015-receipt.md  

**Note:** Fill in verification results (dates, deployment id, commit SHA) when RELOPS runs the truth check. For latest production snapshot see [RELOPS-REIL-CORE-PROD-DEPLOY-0017](RELOPS-REIL-CORE-PROD-DEPLOY-0017.md).
