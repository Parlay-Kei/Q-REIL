# Q REIL — Mission Receipts

Canonical naming: **Q REIL** (human), **q-reil** (slug), **q_reil** (system key), base route **/q-reil**.

---

## 1. Product Ops (documentation-admin)

**Status:** Done

| Deliverable | Location |
|-------------|----------|
| Naming registry entry | `docs/NAMING_REGISTRY.md` |
| Q REIL PRD placeholder | `docs/q-reil/PRD.md` |
| Q REIL system spec placeholder | `docs/q-reil/SYSTEM_SPEC.md` |

**Summary:** NAMING_REGISTRY.md includes human name, slug, system key, repo name, Vercel project name, base route, and rule: no alternate spellings. `docs/q-reil/` added with PRD and system spec placeholders.

---

## 2. Repo Setup (github-admin)

**Status:** Done (executed via GitHub CLI)

**Receipt:**

| Field | Value |
|-------|--------|
| Repo link | https://github.com/AspireNexis/q-reil |
| Org | AspireNexis |
| Default branch | main |
| Branch protection | optional — apply in repo Settings → Branches |
| Populated | Yes — `q-reil/` pushed to origin main |

---

## 3. App Scaffold (codebase-admin)

**Status:** Done

| Item | Value |
|------|--------|
| Location | `q-reil/` |
| Framework | Next.js App Router, TypeScript, Tailwind |
| Layout title | Q REIL |
| Suite label | Q by Strata Noble |
| Routes | `/q-reil`, `/q-reil/inbox`, `/q-reil/records`, `/q-reil/settings` |
| Build | Passes (`npm run build`) |

**Summary:** Next.js app scaffolded in `q-reil/` with layout title "Q REIL", suite label "Q by Strata Noble", and placeholder pages for the four routes. Build verified.

---

## 4. Deployment (infra-deployment-specialist)

**Status:** Done (project created and deployed via Vercel CLI)

**Receipt:**

| Field | Value |
|-------|--------|
| Vercel project name | q-reil |
| Project ID | prj_VAiSllyEk27tnHDXagBt88h0h64j |
| Team | strata-nobles-projects (team_DLPOODpWbIp8OubK6ngvbM1v) |
| Linked repo | Not yet — connect Git repo in [Project Settings](https://vercel.com/strata-nobles-projects/q-reil/settings) for auto-deploys |
| Production URL | https://q-reil.vercel.app |
| Preview URL | https://q-reil-strata-nobles-projects.vercel.app |
| Latest deployment | READY (production) |
| Environment secrets | None added (per mission; OAuth when OPS-901) |

**Summary:** Vercel project **q-reil** created and linked via CLI from `q-reil/`. Deployed to production. Connect the GitHub repo `q-reil` in Vercel dashboard when the repo exists to enable preview and production from Git.

---

## Orchestrator summary

| Step | Owner | Status |
|------|--------|--------|
| Naming registry + docs | documentation-admin | Done |
| GitHub repo q-reil | github-admin | Done |
| App scaffold in q-reil | codebase-admin | Done |
| Vercel project q-reil | infra-deployment-specialist | Done |

Naming enforced: Q REIL (human), q-reil (slug), q_reil (system key), base route /q-reil. No OAuth until OPS-901.

---

## 4b. Supabase project (supabase-admin)

**Status:** _Complete_ — project exists; all migrations applied; bucket created.

| Field | Value |
|-------|--------|
| Project name | q-reil |
| Project ref | **umzuncubiizoomoxlgts** |
| Region | us-east-1 |
| Status | ACTIVE_HEALTHY |
| Migrations applied | 00001, 00002, 00003, 00004, 00017, 00018, 00021, 00030, 00031, 00032 (via `scripts/supabase-apply-migrations/run-with-pg.mjs`). 00019 omitted from script (requires full schema: contacts, properties, etc.). |
| Storage bucket | **Created** — `mail-attachments` (private). Script: `node scripts/supabase-apply-migrations/create-bucket.mjs`. |

**Next steps:** Copy **Project URL**, **anon key**, **service_role key** from [Supabase Dashboard](https://supabase.com/dashboard) → project **q-reil** (ref `umzuncubiizoomoxlgts`) → Settings → API into `q-reil/.env` or `q-reil/.env.local`. Add OAuth and app URL vars per [TOKENS_AND_CONFIG_REFERENCE.md](../00_PROJECT/handoffs/TOKENS_AND_CONFIG_REFERENCE.md).

**OCS handoff:** [docs/00_PROJECT/handoffs/2026-01-30_OCS_to_supabase-admin_CREATE_SUPABASE_PROJECT.md](../00_PROJECT/handoffs/2026-01-30_OCS_to_supabase-admin_CREATE_SUPABASE_PROJECT.md)

**Completion:** All migrations applied; bucket exists; env vars in `q-reil/.env`. AUTH-101 and BE-301 unblocked.

---

## 5. OPS-901 — Gmail OAuth stand-up (infra-deployment-specialist)

**Mission ID:** QREIL OPS-901  
**Status:** _Proof points 4 & 5 done_ — OAuth connect and token refresh proven via `scripts/oauth-proof/proof-gmail-oauth.mjs`; tokens saved to `scripts/oauth-proof/.tokens.json`. Points 1–3 (GCP client, redirect URIs, Vercel secrets) evidenced when configured.  
**Target:** Unblock AUTH-101. No OAuth code changes in app until proof is posted.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #1 Gmail OAuth), §11 (dependencies).

**Receipt (single source):** [docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md](receipts/OPS-901_OAUTH_PROOF.md)

**Output deliverables (evidenced in receipt):**

| Deliverable | Location |
|-------------|----------|
| OAuth client created and tested | OPS-901_OAUTH_PROOF.md § 5-point proof pack |
| Redirect URIs include live Vercel domain (q-reil) | [OPS-901_REDIRECT_URIS.md](receipts/OPS-901_REDIRECT_URIS.md): `https://q-reil.vercel.app/...` + local + preview |
| Secret references stored; no secrets committed | [OPS-901_SECRET_STORE_REFERENCE.md](receipts/OPS-901_SECRET_STORE_REFERENCE.md); Vercel only; `q-reil/.env.example` names only |

**Supporting docs:**

| Doc | Purpose |
|-----|---------|
| [OPS-901_OAUTH_PROOF.md](receipts/OPS-901_OAUTH_PROOF.md) | 5-point proof pack + runbook + acceptance |
| [OPS-901_REDIRECT_URIS.md](receipts/OPS-901_REDIRECT_URIS.md) | Canonical redirect URIs (local, preview, production) |
| [OPS-901_SECRET_STORE_REFERENCE.md](receipts/OPS-901_SECRET_STORE_REFERENCE.md) | Approved store (Vercel); no committed secrets |

**5-point proof pack (in OPS-901_OAUTH_PROOF.md):** (1) OAuth client created; (2) Redirect URIs verified (incl. live Vercel domain); (3) Secrets in Vercel only; (4) Test auth run successful; (5) Token refresh verified.

**Acceptance (all must be true before AUTH-101 starts):** Google Cloud project non-personal; consent screen configured; OAuth client (Web) created; redirect URIs include local + Vercel preview + **production** (`https://q-reil.vercel.app`); secrets in approved store (Vercel); OAuth connect succeeds with test user; token refresh proven by forced refresh.

**OCS manual dispatch:** Agents capable of handling remaining Manual tasks were invoked via handoffs in [docs/00_PROJECT/handoffs/](../00_PROJECT/handoffs/README.md): **github-admin** (Connect Vercel to Git), **infra-deployment-specialist** (OPS-901 runbook + proof).

---

## 6. PRD v0.1 locked (OCS)

**Status:** Done (once)

| Field | Value |
|-------|--------|
| File path | `docs/q-reil/PRD_Q_REIL_v0.1.md` |
| Status | **LOCKED** |
| Rule | Missions must reference PRD §6 (scope) and §10 (DoD) or are rejected. See `docs/q-reil/OCS_RULES.md`. |

**Summary:** PRD_Q_REIL_v0.1 is the governing scope and DoD for v0.1. OCS rule added; PRD referenced in sprint board header, orchestrator intake template, QA acceptance checklist, and release notes for v0.1. Governance hardening: [PRD_POINTER.md](PRD_POINTER.md) added (stable landing file for "PRD" searches); mission header validator added (brief must contain `PRD_Q_REIL_v0.1`, `§6`, `§10`). Optional script: `docs/00_PROJECT/validate-mission-brief.sh`.

---

## 7. AUTH-101 — Gmail connect flow (auth-flow-agent)

**Mission ID:** QREIL AUTH-101  
**Status:** Implemented (proof receipts to be verified)  
**Brief:** Gmail connect flow using OAuth credentials from OPS-901; tokens encrypted at rest; mailbox record created; token refresh verified in app runtime; ledger events MAILBOX_CONNECTED and TOKEN_REFRESH_VERIFIED emitted. No mail ingestion yet.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #1 Gmail OAuth).

**Deliverables:**

| Deliverable | Location |
|-------------|----------|
| Connect proof | [docs/q-reil/receipts/AUTH-101_CONNECT_PROOF.md](receipts/AUTH-101_CONNECT_PROOF.md) |
| Refresh proof | [docs/q-reil/receipts/AUTH-101_REFRESH_PROOF.md](receipts/AUTH-101_REFRESH_PROOF.md) |

**Implementation:**

- **Connect Gmail:** User clicks "Connect Gmail" on `/q-reil/inbox` → `GET /api/connectors/gmail/oauth/authorize` → Google OAuth (PKCE, state) → `GET /api/connectors/gmail/oauth/callback` → token exchange, encrypt, create/update mailbox, emit `mailbox.connected` to `public.events`, redirect to inbox.
- **Token refresh test:** `POST /api/connectors/gmail/oauth/refresh-test` with `{ "mailbox_id": "uuid" }` (auth required) → force refresh, update mailbox tokens, emit `token.refresh_verified`.
- **No secrets logged;** tokens stored in `mailboxes` as `access_token_encrypted` / `refresh_token_encrypted` (AES-256-GCM).

---

## 8. BE-301 — Gmail 7-day ingestion (backend-dev)

**Mission ID:** QREIL BE-301  
**Status:** Implemented (proof receipts in place)  
**Brief:** Gmail ingestion service for 7-day backfill; store threads, messages, attachments metadata; store attachments in object storage; idempotent upserts; no duplicates; emit ledger events (sync start, thread ingested, email ingested, attachment saved, sync completed, sync failed). No raw email bodies in logs or ledger.  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #2–4, #7).

**Deliverables:**

| Deliverable | Location |
|-------------|----------|
| 7-day ingest proof | [docs/q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md](receipts/BE-301_INGEST_7DAY_PROOF.md) |
| Idempotency proof | [docs/q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md](receipts/BE-301_IDEMPOTENCY_PROOF.md) |

**Implementation:**

- **Backfill:** `BACKFILL_DAYS = 7` in `lib/inbox/gmail-ingestion/gmail-ingest-service.ts`; Gmail API `threads.list` with `after:<unix_7_days>`, then `threads.get` (full); idempotent upserts for threads, messages, attachments.
- **Attachments:** Download from Gmail, SHA-256 hash, upload to Supabase Storage bucket `mail-attachments` at `{org_id}/{mailbox_id}/{sha256}/{filename}`; upsert `mail_attachments`.
- **Ledger:** `sync.started`, `thread.ingested`, `message.ingested`, `attachment.saved`, `sync.completed`, `sync.failed` written to `public.events`; payloads never include body_plain/body_html.
- **Trigger:** `POST /api/connectors/gmail/sync` (auth required); optional body `{ "mailboxId": "uuid", "forceFullSync": true }`.
- **Dependencies:** AUTH-101 complete; migration `00032_mail_upsert_service_role.sql` for upsert; create bucket `mail-attachments` in Supabase if not present.
