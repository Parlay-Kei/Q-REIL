# OCS: Manual tasks — Invoke supabase-admin (BE-301)

**Dispatched:** 2026-01-30  
**From:** OCS (orchestrator)  
**To:** supabase-admin  
**Mission ID:** QREIL BE-301  
**Type:** Manual (Supabase project: Storage + SQL migration)

**PRD alignment:** PRD_Q_REIL_v0.1 §6 (MVP scope: Gmail ingestion, attachments), §10 (DoD #2–4, #7).

---

## Task

Complete the **infrastructure prerequisites** for the Gmail 7-day ingestion service (BE-301) so that backfill and attachment storage work in the Q REIL Supabase project.

### 1. Create Storage bucket `mail-attachments`

- In the **Q REIL** Supabase project (linked to this repo), create a Storage bucket named **`mail-attachments`** via **Dashboard** (Storage → New bucket) or Supabase client/API. Do not insert into `storage.buckets` via SQL (platform recommendation).
- Configure as needed for ingestion (e.g. private bucket; service role can read/write; RLS or bucket policies per project standards).
- Attachment paths used by code: `{org_id}/{mailbox_id}/{sha256}/{filename}`.

**Reference:** [BE-301_INGEST_7DAY_PROOF.md](../../q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md) — “Object Storage” section.

### 2. Apply migration for upsert (service role)

- Run the migration that allows the **service role** to **UPDATE** `mail_messages` and `mail_attachments` (required for idempotent upserts).

**Migration file:** [docs/02_DATA/migrations/00032_mail_upsert_service_role.sql](../../02_DATA/migrations/00032_mail_upsert_service_role.sql)

- Apply it in the same Supabase project (e.g. via Dashboard SQL editor or Supabase CLI migrations).
- Ensure migrations 00030 and 00031 are already applied (mail tables and RLS).

---

## Completion

- [x] Storage bucket **`mail-attachments`** exists in the Q REIL Supabase project and is writable by the service role.
- [x] Migration **00032_mail_upsert_service_role.sql** has been applied; no errors.
- [x] Acknowledged 2026-01-31: OCS ran `node scripts/supabase-apply-migrations/create-bucket.mjs` (bucket already existed) and `node run-with-pg.mjs` (migrations 00001–00032 applied).

---

**Receipts:** `docs/q-reil/receipts/BE-301_INGEST_7DAY_PROOF.md`, `docs/q-reil/receipts/BE-301_IDEMPOTENCY_PROOF.md`, `docs/q-reil/RECEIPTS.md`.
