# REIL Core Seed Fixtures (Lane 2)

**Purpose:** Deterministic DB seed data so Inbox and Records pages can read seeded rows **only through the DAL** (no Gmail required). Rerun is idempotent.

---

## What is seeded

| Table | Rows | Notes |
|-------|------|--------|
| `orgs` | 1 | Default org for REIL dev (fixed UUID). |
| `deals` | 2 | Required for `records.record_type_id`. |
| `records` | 2 | Canonical records (deal container). |
| `source_items_raw` | 3 | Raw “inbox” items (payload: subject, from, etc.). |
| `source_items_normalized` | 3 | Normalized status per raw item. |
| `ledger_events` | 3 | Append-only events for records. |
| `record_links` | 1 | One raw item linked to one record. |

All IDs are deterministic UUIDs. Inserts use `ON CONFLICT DO NOTHING` (or equivalent) so the script can be run multiple times without duplicates.

---

## How to run

1. Apply migrations first (through 00040).
2. Run the seed script against your Supabase DB (e.g. SQL Editor or `psql`):

   ```bash
   # Example (replace connection string with your project)
   psql "$DATABASE_URL" -f docs/02_DATA/seeds/reil_core_seed.sql
   ```

3. Set UI env so it uses the seeded org and REIL Core Inbox:
   - `VITE_REIL_ORG_ID=a0000000-0000-4000-8000-000000000001` (seed org UUID from `reil_core_seed.sql`).
   - `VITE_USE_REIL_CORE_INBOX=true`
   - `VITE_USE_INBOX_SEED_DATA=false` (so UI reads from DB via DAL, not in-memory mock).

4. Inbox and Records then read **only through DAL** (reilInboxApi / reilRecordsApi → reil-dal).

---

## Acceptance (Lane 2)

- Inbox and Records pages can read seeded rows only through DAL.
- Rerun of seed script is idempotent (no duplicate rows).
- Normalize/Match and Ledger pipelines can use the same fixtures for deterministic results.
