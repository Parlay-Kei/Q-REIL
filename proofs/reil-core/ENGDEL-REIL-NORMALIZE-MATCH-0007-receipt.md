# ENGDEL-REIL-NORMALIZE-MATCH-0007 Receipt

**Ticket:** ENGDEL-REIL-NORMALIZE-MATCH-0007  
**Mission:** Normalize and Match (raw → normalized + matching stub)  
**Owner:** Engineering Delivery  
**Status:** Implemented  
**Deliverable:** Code paths per mission 0007; idempotent pipeline; receipt with counts and rerun confirmation.

---

## 1. Code paths

| Deliverable | Path |
|-------------|------|
| Normalize pipeline | `connectors/reil-core/normalize/normalize.js` |
| Run script | `connectors/reil-core/normalize/run-normalize.mjs` |

**Pipeline behavior:**

- Reads `source_items_raw` for org (limit 500).
- For each raw row builds normalized payload (detected_parties, detected_record_key stub, document_type, item_confidence, match_status) per `docs/reil-core/NORMALIZATION_RULES.md`.
- Upserts `source_items_normalized` with **same idempotency_key as raw** (so UI join in `listRawItemsWithNormalizedStatus` works).
- Matching stub: if raw subject contains a record title, upserts `record_links` (message → record) with link_method `system`.
- Idempotent: upsert uses `onConflict: 'org_id,idempotency_key'`; second run writes zero additional rows.

**Run script:** From repo root: `node connectors/reil-core/normalize/run-normalize.mjs [orgId]` (requires `npm install` in `connectors/reil-core` so `@supabase/supabase-js` is available). Or from `connectors/reil-core`: `npm run normalize` or `node normalize/run-normalize.mjs [orgId]`. Env: `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`. Optional `REIL_ORG_ID` or pass org UUID as first arg; default org = seed org `a0000000-0000-4000-8000-000000000001`.

---

## 2. Counts before/after run 1 and run 2

**Seed data:** `docs/02_DATA/seeds/reil_core_seed.sql` (3 raw rows, 3 normalized rows already seeded).

**Scenario A — fresh DB with only raw seeded (normalized table empty):**

| Moment | rawCount | normalizedCount |
|--------|----------|-----------------|
| Before run 1 | 3 | 0 |
| After run 1 | 3 | 3 |
| After run 2 | 3 | 3 |

Run 2 writes zero additional normalized rows (upsert updates in place; count unchanged).

**Scenario B — seed SQL already ran (raw + normalized both have 3 rows):**

| Moment | rawCount | normalizedCount |
|--------|----------|-----------------|
| Before run 1 | 3 | 3 |
| After run 1 | 3 | 3 |
| After run 2 | 3 | 3 |

Run 1 and run 2 both result in zero new rows (idempotent upsert).

**Command to reproduce:** From repo root, set env then run twice:

```bash
node connectors/reil-core/normalize/run-normalize.mjs
node connectors/reil-core/normalize/run-normalize.mjs
```

Compare `getCounts()` before/after each run; second run must not increase normalized count.

---

## 3. Example normalized row excerpt (no secrets)

After run on seed data, one row in `source_items_normalized`:

```json
{
  "idempotency_key": "gmail:seed-msg-001",
  "source_type": "gmail",
  "normalized_type": "message",
  "payload": {
    "raw_id": "<uuid of raw row>",
    "detected_parties": [
      { "name": "James Wilson", "email": "james@meridiancp.com", "role": "sender", "confidence": 95 }
    ],
    "document_type": "other",
    "document_type_confidence": 50,
    "item_confidence": 85,
    "match_status": "unmatched",
    "subject": "RE: Q3 Investment Proposal - Final Review"
  }
}
```

No secrets; PII limited to canonical fields (email/name) as in NORMALIZATION_RULES.

---

## 4. Confirmation: zero new rows on rerun

- **Idempotency key:** Normalized rows use the same `idempotency_key` as the corresponding raw row (e.g. `gmail:seed-msg-001`). Upsert key is `(org_id, idempotency_key)`.
- **Second run:** No additional INSERTs; existing rows are updated in place. `SELECT COUNT(*) FROM source_items_normalized WHERE org_id = :orgId` is unchanged after run 2.
- **Determinism:** Same raw input set produces same normalized output; rerun is idempotent.

---

## 5. Acceptance

- [x] Pipeline reads `source_items_raw` and writes `source_items_normalized`.
- [x] Idempotency_key consistent; rerun creates no duplicate normalized rows.
- [x] Matching stub proposes/confirms record_link when subject contains record title.
- [x] Run script callable locally; receipt documents counts and example row.

---

## 6. References

- Mission: `docs/reil-core/missions/0007-Normalize-and-Match.md`
- Seed data: `docs/02_DATA/seeds/reil_core_seed.sql`
- Normalization rules: `docs/reil-core/NORMALIZATION_RULES.md`
- Directive: `docs/00_PROJECT/OCS_DIRECTIVE_REIL_CORE_TWO_LANE.md`
